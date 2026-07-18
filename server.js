import express from "express";
import http from "node:http";
import { randomUUID } from "node:crypto";
import { Server } from "socket.io";
import OpenAI from "openai";
import QRCode from "qrcode";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use("/assets", express.static("assets"));
app.get("/display", (_req, res) =>
  res.sendFile(new URL("./public/display.html", import.meta.url).pathname),
);
app.get("/health", (_req, res) => res.json({ ok: true }));

const defaultMissions = [
  {
    id: "shield",
    icon: "🛡️",
    title: "Raise the Shields",
    brief: "Charge your hometown defense grid",
    duration: 20,
  },
  {
    id: "strike",
    icon: "🛸",
    title: "Intercept the UFOs",
    brief: "Fire together before they reach Japan",
    duration: 20,
  },
  {
    id: "relay",
    icon: "⚡",
    title: "National Energy Relay",
    brief: "Send power beyond your own region",
    duration: 20,
  },
  {
    id: "final",
    icon: "🇯🇵",
    title: "Save Japan!",
    brief: "Everyone attack for the final defense",
    duration: 30,
  },
];

const state = {
  phase: "lobby",
  missionIndex: 0,
  missions: defaultMissions,
  players: new Map(),
  score: 0,
  missionScore: 0,
  genki: 0,
  launchVotes: new Set(),
  enemies: [],
  nextEnemyId: 1,
  bossVulnerableAnnounced: false,
  startedAt: null,
  endsAt: null,
  lastAction: new Map(),
};

const prefectureNames = [
  "Hokkaido",
  "Aomori",
  "Iwate",
  "Miyagi",
  "Akita",
  "Yamagata",
  "Fukushima",
  "Ibaraki",
  "Tochigi",
  "Gunma",
  "Saitama",
  "Chiba",
  "Tokyo",
  "Kanagawa",
  "Niigata",
  "Toyama",
  "Ishikawa",
  "Fukui",
  "Yamanashi",
  "Nagano",
  "Gifu",
  "Shizuoka",
  "Aichi",
  "Mie",
  "Shiga",
  "Kyoto",
  "Osaka",
  "Hyogo",
  "Nara",
  "Wakayama",
  "Tottori",
  "Shimane",
  "Okayama",
  "Hiroshima",
  "Yamaguchi",
  "Tokushima",
  "Kagawa",
  "Ehime",
  "Kochi",
  "Fukuoka",
  "Saga",
  "Nagasaki",
  "Kumamoto",
  "Oita",
  "Miyazaki",
  "Kagoshima",
  "Okinawa",
];
const debugTimers = new Set();
const debugUnlockSequence = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];
function clearDebugTimers() {
  for (const timer of debugTimers) clearTimeout(timer);
  debugTimers.clear();
}

function targetFor(index = state.missionIndex) {
  return Math.max(
    12,
    Math.ceil(Math.max(1, state.players.size) * [6, 7, 8, 6][index]),
  );
}

function publicState() {
  const players = [...state.players.values()];
  const resultScore = (player) =>
    (player.ufoKills || 0) * 100 + (player.bossDamage || 0) * 10;
  const prefectures = Object.entries(
    players.reduce((all, p) => {
      all[p.prefecture] = (all[p.prefecture] || 0) + 1;
      return all;
    }, {}),
  ).map(([name, count]) => ({ name, count }));
  return {
    phase: state.phase,
    missionIndex: state.missionIndex,
    missions: state.missions,
    score: state.score,
    missionScore: state.missionScore,
    missionTarget: targetFor(),
    genki: state.genki,
    genkiTarget: Math.max(8, state.players.size * 6),
    launchVotes: state.launchVotes.size,
    enemies: state.enemies,
    players: players.length,
    prefectures,
    recentPlayers: players.slice(-60).reverse(),
    activePlayers: players.slice(-30),
    leaderboard: players
      .slice()
      .sort((a, b) => resultScore(b) - resultScore(a))
      .map(({ id, nickname, prefecture, ufoKills = 0, bossDamage = 0 }) => ({
        id,
        nickname,
        prefecture,
        ufoKills,
        bossDamage,
        score: ufoKills * 100 + bossDamage * 10,
      })),
    startedAt: state.startedAt,
    endsAt: state.endsAt,
    serverNow: Date.now(),
  };
}

function broadcast() {
  io.emit("state", publicState());
}

function beginBossDefeat() {
  if (state.phase !== "boss") return;
  state.phase = "bossDefeat";
  state.startedAt = Date.now();
  state.endsAt = state.startedAt + 5_000;
  io.emit("bossDefeatSequence");
  broadcast();
}

async function generateMissions() {
  if (!process.env.OPENAI_API_KEY) return defaultMissions;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const regions = [
    ...new Set([...state.players.values()].map((p) => p.prefecture)),
  ];
  try {
    const response = await openai.responses.create({
      model: "gpt-5.6",
      input: `Create four short, exciting stages for Save Japan, a cooperative game about restoring Japan's GENKI energy. Players represent: ${regions.join(", ") || "all Japan"}. The first three stages last 20 seconds each: connect regions, intercept UFOs, and relay GENKI. The final 30-second boss stage charges one national GENKI gauge and launches a synchronized attack against a giant UFO. Return concise English UI copy.`,
      text: {
        format: {
          type: "json_schema",
          name: "missions",
          strict: true,
          schema: {
            type: "object",
            properties: {
              missions: {
                type: "array",
                minItems: 4,
                maxItems: 4,
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    icon: { type: "string" },
                    title: { type: "string" },
                    brief: { type: "string" },
                    duration: { type: "number" },
                  },
                  required: ["id", "icon", "title", "brief", "duration"],
                  additionalProperties: false,
                },
              },
            },
            required: ["missions"],
            additionalProperties: false,
          },
        },
      },
    });
    const missions = JSON.parse(response.output_text).missions;
    return missions.map((mission, index) => ({
      ...mission,
      duration: [20, 20, 20, 30][index],
    }));
  } catch (error) {
    console.error(
      "GPT-5.6 mission generation failed; using fallback:",
      error.message,
    );
    return defaultMissions;
  }
}

io.on("connection", (socket) => {
  socket.emit("state", publicState());

  socket.on("host:debugKey", ({ code } = {}) => {
    if (socket.data.debugUnlocked) return;
    const index = socket.data.debugSequenceIndex || 0;
    socket.data.debugSequenceIndex =
      code === debugUnlockSequence[index]
        ? index + 1
        : code === debugUnlockSequence[0]
          ? 1
          : 0;
    if (socket.data.debugSequenceIndex === debugUnlockSequence.length) {
      socket.data.debugSequenceIndex = 0;
      socket.data.debugUnlocked = true;
      socket.emit("host:debugMode", { enabled: true });
    }
  });

  const debugAllowed = () => socket.data.debugUnlocked === true;

  socket.on("join", ({ nickname, prefecture }, reply = () => {}) => {
    const player = {
      id: randomUUID(),
      socketId: socket.id,
      nickname: String(nickname || "Pilot")
        .trim()
        .slice(0, 16),
      prefecture: String(prefecture || "Tokyo")
        .trim()
        .slice(0, 12),
      interceptor: Math.floor(Math.random() * 6),
      score: 0,
      ufoKills: 0,
      bossDamage: 0,
      hp: 100,
    };
    state.players.set(socket.id, player);
    reply({ ok: true, player });
    broadcast();
  });

  socket.on("action", () => {
    if (!["playing", "boss"].includes(state.phase)) return;
    const player = state.players.get(socket.id);
    if (!player) return;
    const now = Date.now();
    if (now - (state.lastAction.get(socket.id) || 0) < 160) return;
    state.lastAction.set(socket.id, now);
    player.score += 1;
    state.score += 1;
    if (state.phase === "boss") {
      const target = Math.max(8, state.players.size * 6);
      if (state.genki < target) {
        const vulnerable = Date.now() - state.startedAt >= 15_000;
        const nextGenki = Math.min(
          target,
          state.genki + 1,
          vulnerable ? target : target - 1,
        );
        player.bossDamage += nextGenki - state.genki;
        state.genki = nextGenki;
      } else state.launchVotes.add(socket.id);
      if (
        state.genki >= target &&
        state.launchVotes.size >=
          Math.max(1, Math.ceil(state.players.size * 0.5))
      ) {
        beginBossDefeat();
      }
    } else {
      state.missionScore += 1;
      const playerRegion = regionFor(player.prefecture);
      const enemy =
        state.enemies.find((item) => item.region === playerRegion) ||
        state.enemies[0];
      if (enemy) {
        enemy.hp = Math.max(0, enemy.hp - 20);
        io.emit("enemyHit", {
          id: enemy.id,
          prefecture: player.prefecture,
          nickname: player.nickname,
        });
        if (enemy.hp === 0) {
          player.ufoKills += 1;
          state.enemies = state.enemies.filter((item) => item.id !== enemy.id);
          io.emit("enemyDestroyed", {
            id: enemy.id,
            region: enemy.region,
            nickname: player.nickname,
            prefecture: player.prefecture,
          });
        }
      }
    }
    io.emit("pulse", {
      prefecture: player.prefecture,
      missionIndex: state.missionIndex,
    });
    broadcast();
  });

  socket.on("host:start", async () => {
    if (state.phase !== "lobby") return;
    state.phase = "playing";
    state.startedAt = Date.now();
    state.endsAt = state.startedAt + 60_000;
    state.score = 0;
    state.missionScore = 0;
    state.missionIndex = 0;
    state.genki = 0;
    state.bossVulnerableAnnounced = false;
    state.enemies = [];
    state.launchVotes.clear();
    for (const p of state.players.values()) {
      p.score = 0;
      p.ufoKills = 0;
      p.bossDamage = 0;
    }
    io.emit("phaseChange", { phase: "playing" });
    broadcast();
    state.missions = await generateMissions();
    broadcast();
  });

  socket.on("host:boss", () => {
    if (!debugAllowed()) return;
    clearDebugTimers();
    const now = Date.now();
    state.phase = "bossWarning";
    state.startedAt = now;
    state.endsAt = now + 4_000;
    state.missionIndex = 3;
    state.genki = 0;
    state.bossVulnerableAnnounced = false;
    state.enemies = [];
    state.launchVotes.clear();
    io.emit("phaseChange", { phase: "bossWarning" });
    broadcast();
  });

  socket.on("host:fire", () => {
    if (!debugAllowed()) return;
    if (state.phase !== "boss") return;
    state.genki = Math.max(8, state.players.size * 6);
    const prefectures = [...state.players.values()].map(
      (player) => player.prefecture,
    );
    const salvo = prefectures.length
      ? prefectures
      : ["Tokyo", "Osaka", "Hokkaido", "Fukuoka"];
    salvo.slice(0, 24).forEach((prefecture, index) => {
      setTimeout(
        () => io.emit("pulse", { prefecture, missionIndex: 3 }),
        index * 45,
      );
    });
    broadcast();
    setTimeout(() => {
      if (state.phase !== "boss") return;
      beginBossDefeat();
    }, 1800);
  });

  socket.on("host:debugAttack", ({ prefecture = "Tokyo" } = {}) => {
    if (!debugAllowed()) return;
    if (state.phase !== "playing" || state.enemies.length === 0) return;
    const matchingPlayers = [...state.players.values()].filter(
      (player) => player.prefecture === prefecture,
    );
    const allPlayers = [...state.players.values()];
    const attacker = matchingPlayers[
      Math.floor(Math.random() * matchingPlayers.length)
    ] ||
      allPlayers[Math.floor(Math.random() * allPlayers.length)] || {
        nickname: "パイロット",
        prefecture,
        ufoKills: 0,
      };
    const playerRegion = regionFor(attacker.prefecture);
    const regionalEnemies = state.enemies.filter(
      (enemy) => enemy.region === playerRegion,
    );
    const candidates = regionalEnemies.length ? regionalEnemies : state.enemies;
    const enemy = candidates[Math.floor(Math.random() * candidates.length)];
    enemy.hp = Math.max(0, enemy.hp - 20);
    io.emit("enemyHit", {
      id: enemy.id,
      prefecture: attacker.prefecture,
      nickname: attacker.nickname,
    });
    if (enemy.hp === 0) {
      attacker.ufoKills = (attacker.ufoKills || 0) + 1;
      state.enemies = state.enemies.filter((item) => item.id !== enemy.id);
      io.emit("enemyDestroyed", {
        id: enemy.id,
        region: enemy.region,
        nickname: attacker.nickname,
        prefecture: attacker.prefecture,
      });
    }
    broadcast();
  });

  socket.on("host:bossAttack", ({ prefecture = "Tokyo" } = {}) => {
    if (!debugAllowed()) return;
    if (state.phase !== "boss") return;
    const target = Math.max(8, state.players.size * 6);
    const damage = Math.max(1, Math.ceil(target / 20));
    const vulnerable = Date.now() - state.startedAt >= 15_000;
    state.genki = Math.min(
      target,
      state.genki + damage,
      vulnerable ? target : target - 1,
    );
    io.emit("pulse", { prefecture, missionIndex: 3 });
    broadcast();
    if (state.genki >= target) {
      setTimeout(() => {
        if (state.phase !== "boss") return;
        beginBossDefeat();
      }, 650);
    }
  });

  socket.on("host:reset", () => {
    clearDebugTimers();
    for (const [key, player] of state.players) {
      if (player.debug) state.players.delete(key);
    }
    Object.assign(state, {
      phase: "lobby",
      score: 0,
      missionScore: 0,
      missionIndex: 0,
      genki: 0,
      enemies: [],
      missions: defaultMissions,
      startedAt: null,
      endsAt: null,
    });
    state.launchVotes.clear();
    for (const p of state.players.values()) {
      p.score = 0;
      p.ufoKills = 0;
      p.bossDamage = 0;
    }
    broadcast();
  });
  socket.on("host:debug60", () => {
    if (!debugAllowed()) return;
    clearDebugTimers();
    for (const [key, player] of state.players) {
      if (player.debug) state.players.delete(key);
    }
    const needed = Math.max(0, 60 - state.players.size);
    const shuffled = [...prefectureNames].sort(() => Math.random() - 0.5);
    const arrivals = Array.from({ length: needed }, (_, index) => ({
      index,
      prefecture:
        index < shuffled.length
          ? shuffled[index]
          : prefectureNames[Math.floor(Math.random() * prefectureNames.length)],
      delay: Math.floor(250 + Math.random() * 27_500),
    })).sort((a, b) => a.delay - b.delay);
    io.emit("debugStarted", { total: needed, duration: 30 });
    arrivals.forEach((arrival) => {
      const timer = setTimeout(() => {
        debugTimers.delete(timer);
        const key = `debug-${arrival.index + 1}`;
        state.players.set(key, {
          id: randomUUID(),
          socketId: key,
          nickname: `PILOT-${String(arrival.index + 1).padStart(2, "0")}`,
          prefecture: arrival.prefecture,
          interceptor: arrival.index % 6,
          score: Math.floor(Math.random() * 12),
          ufoKills: Math.floor(Math.random() * 4),
          bossDamage: Math.floor(Math.random() * 16),
          hp: 100,
          debug: true,
        });
        io.emit("debugLoaded", { players: state.players.size, total: 60 });
        broadcast();
      }, arrival.delay);
      debugTimers.add(timer);
    });
  });
  socket.on("disconnect", () => {
    state.players.delete(socket.id);
    broadcast();
  });
});

setInterval(() => {
  const now = Date.now();
  if (state.phase === "login" && now >= state.endsAt) {
    state.phase = "playing";
    state.startedAt = now;
    state.endsAt = now + 60_000;
    state.missionIndex = 0;
    state.missionScore = 0;
    io.emit("phaseChange", { phase: "playing" });
  } else if (state.phase === "playing") {
    const next = Math.min(2, Math.floor((now - state.startedAt) / 20_000));
    if (next !== state.missionIndex) {
      const completed = state.missions[state.missionIndex];
      state.missionIndex = next;
      state.missionScore = 0;
      io.emit("missionComplete", { title: completed.title, victory: false });
    }
    if (now >= state.endsAt) {
      state.phase = "bossWarning";
      state.startedAt = now;
      state.endsAt = now + 4_000;
      state.missionIndex = 3;
      state.genki = 0;
      state.launchVotes.clear();
      io.emit("phaseChange", { phase: "bossWarning" });
    }
  } else if (state.phase === "bossWarning" && now >= state.endsAt) {
    state.phase = "boss";
    state.startedAt = now;
    state.endsAt = now + 30_000;
    state.bossVulnerableAnnounced = false;
    io.emit("phaseChange", { phase: "boss" });
  } else if (state.phase === "boss" && now >= state.endsAt) {
    beginBossDefeat();
  } else if (state.phase === "bossDefeat" && now >= state.endsAt) {
    state.phase = "victory";
    io.emit("bossDefeated");
    broadcast();
  }
  if (
    state.phase === "boss" &&
    !state.bossVulnerableAnnounced &&
    now - state.startedAt >= 15_000
  ) {
    state.bossVulnerableAnnounced = true;
    io.emit("bossCritical");
  }
  if (
    ["login", "playing", "bossWarning", "boss", "bossDefeat"].includes(
      state.phase,
    )
  )
    broadcast();
}, 250);

setInterval(() => {
  if (state.phase !== "playing" || state.enemies.length >= 10) return;
  const regions = [
    "hokkaido",
    "tohoku",
    "kanto",
    "chubu",
    "kinki",
    "chugoku",
    "shikoku",
    "kyushu",
  ];
  const region = regions[Math.floor(Math.random() * regions.length)];
  state.enemies.push({
    id: state.nextEnemyId++,
    region,
    hp: 100,
    maxHp: 100,
    lane: Math.random(),
  });
  io.emit("enemySpawn", { region });
  broadcast();
}, 1700);

setInterval(() => {
  if (state.phase !== "playing" || state.enemies.length === 0) return;
  const enemy = state.enemies[Math.floor(Math.random() * state.enemies.length)];
  const targets = [...state.players.values()].filter(
    (player) => regionFor(player.prefecture) === enemy.region,
  );
  const target = targets[Math.floor(Math.random() * targets.length)];
  if (target) target.hp = Math.max(10, (target.hp ?? 100) - 10);
  io.emit("enemyAttack", {
    enemyId: enemy.id,
    region: enemy.region,
    playerId: target?.id,
  });
  broadcast();
}, 1200);

function regionFor(prefecture) {
  const groups = {
    hokkaido: ["Hokkaido"],
    tohoku: ["Aomori", "Iwate", "Miyagi", "Akita", "Yamagata", "Fukushima"],
    kanto: [
      "Ibaraki",
      "Tochigi",
      "Gunma",
      "Saitama",
      "Chiba",
      "Tokyo",
      "Kanagawa",
    ],
    chubu: [
      "Niigata",
      "Toyama",
      "Ishikawa",
      "Fukui",
      "Yamanashi",
      "Nagano",
      "Gifu",
      "Shizuoka",
      "Aichi",
    ],
    kinki: ["Mie", "Shiga", "Kyoto", "Osaka", "Hyogo", "Nara", "Wakayama"],
    chugoku: ["Tottori", "Shimane", "Okayama", "Hiroshima", "Yamaguchi"],
    shikoku: ["Tokushima", "Kagawa", "Ehime", "Kochi"],
    kyushu: [
      "Fukuoka",
      "Saga",
      "Nagasaki",
      "Kumamoto",
      "Oita",
      "Miyazaki",
      "Kagoshima",
      "Okinawa",
    ],
  };
  return (
    Object.entries(groups).find(([, names]) =>
      names.includes(prefecture),
    )?.[0] || "kanto"
  );
}

app.get("/api/qr", async (req, res) => {
  const url = `${req.protocol}://${req.get("host")}/`;
  res.type("png").send(
    await QRCode.toBuffer(url, {
      width: 640,
      margin: 1,
      color: { dark: "#071120", light: "#ffffff" },
    }),
  );
});

server.listen(port, "0.0.0.0", () =>
  console.log(
    `Save Japan ready at http://localhost:${port} — display: /display`,
  ),
);
