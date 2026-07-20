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

app.set("trust proxy", true);
app.use(express.static("public"));
app.use("/assets", express.static("assets"));
app.get("/display", (_req, res) =>
  res.sendFile(new URL("./public/display.html", import.meta.url).pathname),
);
const GAME_TIME_ZONE = "Asia/Tokyo";
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAILY_START_HOUR_JST = 21;
const DAILY_PREPARE_MINUTE_JST = 59;
const RESULT_DURATION_MS = 3 * 60 * 1000;
const INTERNAL_SCHEDULER_HEADER = "cloudflare-cron";

const defaultMissions = [
  {
    id: "shield",
    icon: "🛡️",
    title: "Raise the Shields",
    brief: "Charge your hometown defense grid",
    titleJa: "シールドを展開せよ",
    briefJa: "故郷の防衛グリッドをチャージしよう",
    titleZh: "启动防护盾",
    briefZh: "为故乡的防卫系统充能",
    duration: 20,
  },
  {
    id: "strike",
    icon: "🛸",
    title: "Intercept the UFOs",
    brief: "Fire together before they reach Japan",
    titleJa: "UFOを迎撃せよ",
    briefJa: "日本へ到達する前に力を合わせて攻撃しよう",
    titleZh: "拦截UFO",
    briefZh: "在敌人抵达日本前协力攻击",
    duration: 20,
  },
  {
    id: "relay",
    icon: "⚡",
    title: "National Energy Relay",
    brief: "Send power beyond your own region",
    titleJa: "全国元気リレー",
    briefJa: "地域を越えて元気を送り合おう",
    titleZh: "全国元气接力",
    briefZh: "跨越地区传递元气",
    duration: 20,
  },
  {
    id: "final",
    icon: "🇯🇵",
    title: "Save Japan!",
    brief: "Everyone attack for the final defense",
    titleJa: "日本を救え！",
    briefJa: "全国の元気を集めて一斉攻撃しよう",
    titleZh: "拯救日本！",
    briefZh: "汇聚全国元气，发动同步攻击",
    duration: 30,
  },
];

const defaultScenario = {
  id: "ufo-invasion",
  title: "UFO Invasion Alert",
  summary: "An unidentified fleet is closing in on Japan.",
  bossName: "FATTY GLUTTON-G",
  titleJa: "UFO侵略警報",
  summaryJa: "未確認艦隊が日本列島へ接近している。",
  bossNameJa: "暴食母艦 ファッティ・グラトンG",
  titleZh: "UFO入侵警报",
  summaryZh: "不明舰队正在逼近日本列岛。",
  bossNameZh: "暴食母舰 FATTY GLUTTON-G",
  source: "fallback",
};

const dailyCrisisTemplates = [
  {
    id: "aurora-blackout",
    title: "Aurora Blackout Crisis",
    summary: "A UFO fleet has shut down Japan's power grid with a false aurora.",
    bossName: "BLACKOUT MOTHERSHIP NOX",
    titleJa: "オーロラ大停電危機",
    summaryJa: "偽りのオーロラが日本の電力網を停止させた。",
    bossNameJa: "暗黒母艦ノクス",
    titleZh: "极光大停电危机",
    summaryZh: "UFO舰队利用虚假极光瘫痪了日本电网。",
    bossNameZh: "暗黑母舰 NOX",
    missionTheme: ["電力網を再起動せよ", "送電UFOを迎撃せよ", "全国へ元気を送電せよ"],
    missionThemeEn: ["Restart the power grid", "Intercept the power-drain UFOs", "Relay GENKI across Japan"],
    missionThemeZh: ["重启全国电网", "拦截吸能UFO", "向全国传递元气"],
    icons: ["💡", "🛸", "⚡"],
  },
  {
    id: "pacific-fortress",
    title: "Pacific Fortress Emergence",
    summary: "A gigantic alien sea fortress has surfaced south of Japan.",
    bossName: "ABYSS FORTRESS LEVIATHAN-G",
    titleJa: "太平洋浮上要塞",
    summaryJa: "日本南方の海上に巨大異星要塞が浮上した。",
    bossNameJa: "深海要塞リヴァイアサンG",
    titleZh: "太平洋浮上海上要塞",
    summaryZh: "巨型外星海上要塞在日本南方浮出水面。",
    bossNameZh: "深海要塞 LEVIATHAN-G",
    missionTheme: ["沿岸シールドを展開せよ", "偵察UFOを撃破せよ", "全国の防衛波を同期せよ"],
    missionThemeEn: ["Raise the coastal shields", "Destroy the scout UFOs", "Synchronize Japan's defense wave"],
    missionThemeZh: ["展开沿岸护盾", "击毁侦察UFO", "同步全国防卫波"],
    icons: ["🌊", "🎯", "📡"],
  },
  {
    id: "quantum-typhoon",
    title: "Quantum Typhoon Zero",
    summary: "Alien weather engines are generating a superstorm over Japan.",
    bossName: "WEATHER CONTROL SHIP TEMPEST",
    titleJa: "量子台風ゼロ号",
    summaryJa: "異星気象兵器が日本上空に超巨大台風を生成している。",
    bossNameJa: "気象制御艦テンペスト",
    titleZh: "量子台风零号",
    summaryZh: "外星气象武器正在日本上空制造超级台风。",
    bossNameZh: "气象控制舰 TEMPEST",
    missionTheme: ["気象レーダーを奪還せよ", "雲中UFOを迎撃せよ", "全国の晴天エネルギーを集めよ"],
    missionThemeEn: ["Retake the weather radar", "Intercept UFOs in the storm", "Gather clear-sky energy nationwide"],
    missionThemeZh: ["夺回气象雷达", "拦截风暴中的UFO", "汇聚全国晴空能量"],
    icons: ["🌪️", "🛸", "☀️"],
  },
  {
    id: "satellite-hijack",
    title: "Satellite Network Hijack",
    summary: "Japan's satellites have been captured by an orbital UFO network.",
    bossName: "ORBITAL COMMANDER HIJACKER-X",
    titleJa: "衛星ネットワーク強奪",
    summaryJa: "日本の衛星網が軌道UFO部隊に乗っ取られた。",
    bossNameJa: "軌道司令艦ハイジャッカーX",
    titleZh: "卫星网络劫持危机",
    summaryZh: "日本卫星网络被轨道UFO部队劫持。",
    bossNameZh: "轨道指挥舰 HIJACKER-X",
    missionTheme: ["衛星リンクを復旧せよ", "軌道UFOを撃墜せよ", "47地点を再接続せよ"],
    missionThemeEn: ["Restore the satellite links", "Shoot down the orbital UFOs", "Reconnect all 47 regions"],
    missionThemeZh: ["恢复卫星连接", "击落轨道UFO", "重新连接47个地区"],
    icons: ["🛰️", "🚀", "🔗"],
  },
  {
    id: "chrono-freeze",
    title: "Japan Time-Freeze Alert",
    summary: "A chronal battleship is freezing time across the archipelago.",
    bossName: "CHRONO BATTLESHIP ETERNITY",
    titleJa: "日本時間凍結警報",
    summaryJa: "時空戦艦が日本列島の時間を停止させようとしている。",
    bossNameJa: "時空戦艦エタニティ",
    titleZh: "日本时间冻结警报",
    summaryZh: "时空战舰正在冻结日本列岛的时间。",
    bossNameZh: "时空战舰 ETERNITY",
    missionTheme: ["時空ビーコンを起動せよ", "時間泥棒UFOを追撃せよ", "全国の時計を同期せよ"],
    missionThemeEn: ["Activate the time beacons", "Chase the time-stealing UFOs", "Synchronize every clock in Japan"],
    missionThemeZh: ["启动时空信标", "追击时间盗贼UFO", "同步全国时钟"],
    icons: ["⏱️", "🛸", "🕘"],
  },
];

function jstDateKey(timestamp = Date.now()) {
  return new Date(timestamp + JST_OFFSET_MS).toISOString().slice(0, 10);
}

function addJstDays(dateKey, days) {
  const value = new Date(`${dateKey}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function dailyStartAt(dateKey) {
  return Date.parse(`${dateKey}T${String(DAILY_START_HOUR_JST).padStart(2, "0")}:00:00Z`) - JST_OFFSET_MS;
}

function nextDailyStartAt(now = Date.now(), lastGameDate = null) {
  const today = jstDateKey(now);
  const todayStart = dailyStartAt(today);
  return lastGameDate === today || now >= todayStart
    ? dailyStartAt(addJstDays(today, 1))
    : todayStart;
}

function upcomingDailyDateKey(now = Date.now(), lastGameDate = null) {
  return jstDateKey(nextDailyStartAt(now, lastGameDate));
}

function fallbackDailyContent(dateKey) {
  const dayNumber = Math.floor(Date.parse(`${dateKey}T00:00:00Z`) / 86_400_000);
  const template = dailyCrisisTemplates[Math.abs(dayNumber) % dailyCrisisTemplates.length];
  const missions = [0, 1, 2].map((index) => ({
    id: `${template.id}-${index + 1}`,
    icon: template.icons[index],
    title: template.missionThemeEn[index],
    brief: "Every action strengthens Japan's nationwide defense.",
    titleJa: template.missionTheme[index],
    briefJa: "一人ひとりの行動が、日本全国の防衛力になる。",
    titleZh: template.missionThemeZh[index],
    briefZh: "每个人的行动都会增强日本全国的防卫力量。",
    duration: 20,
  }));
  missions.push({
    id: `${template.id}-boss`,
    icon: "🇯🇵",
    title: `Defeat ${template.bossName}`,
    brief: "Unite everyone's GENKI and launch the final attack.",
    titleJa: `${template.bossNameJa}を倒せ！`,
    briefJa: "全国の元気をひとつにして、最後の一斉攻撃を放て。",
    titleZh: `击败${template.bossNameZh}！`,
    briefZh: "汇聚全国元气，发动最后的同步攻击。",
    duration: 30,
  });
  return {
    scenario: {
      id: template.id,
      title: template.title,
      summary: template.summary,
      bossName: template.bossName,
      titleJa: template.titleJa,
      summaryJa: template.summaryJa,
      bossNameJa: template.bossNameJa,
      titleZh: template.titleZh,
      summaryZh: template.summaryZh,
      bossNameZh: template.bossNameZh,
      source: "fallback",
      dateKey,
    },
    missions,
  };
}

const initialDailyDate = upcomingDailyDateKey();
const initialDailyContent = fallbackDailyContent(initialDailyDate);

const state = {
  phase: "lobby",
  missionIndex: 0,
  missions: initialDailyContent.missions,
  scenario: initialDailyContent.scenario,
  scenarioDate: initialDailyDate,
  preparedScenarioDate: null,
  lastGameDate: null,
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

app.get("/health", (_req, res) =>
  res.json({
    ok: true,
    phase: state.phase,
    timeZone: GAME_TIME_ZONE,
    nextStartAt: nextDailyStartAt(Date.now(), state.lastGameDate),
  }),
);

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
  const now = Date.now();
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
    scenario: state.scenario,
    scenarioDate: state.scenarioDate,
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
    schedule: {
      timeZone: GAME_TIME_ZONE,
      startHour: DAILY_START_HOUR_JST,
      nextStartAt: nextDailyStartAt(now, state.lastGameDate),
      lastGameDate: state.lastGameDate,
      oncePerDay: true,
    },
    serverNow: now,
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

async function generateDailyScenario(dateKey) {
  const fallback = fallbackDailyContent(dateKey);
  if (!process.env.OPENAI_API_KEY) return fallback;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const regions = [
    ...new Set([...state.players.values()].map((p) => p.prefecture)),
  ];
  try {
    const response = await openai.responses.create({
      model: "gpt-5.6",
      input: `Create the unique daily scenario for ${dateKey} in Save Japan, a nationwide cooperative browser game. Invent a spectacular fictional crisis threatening Japan, caused by UFOs or alien technology. Do not reuse generic "UFO invasion" wording. Keep it exciting and suitable for all ages; do not reference an actual current disaster, casualty, war, political conflict, or real-world emergency. Players represent ${regions.join(", ") || "all 47 prefectures"}. Create a scenario title, one-sentence briefing, memorable boss name, and four concise missions in Japanese, English, and Simplified Chinese. The first three missions last 20 seconds and must feel specific to this crisis. The final 30-second mission unites nationwide GENKI against the boss.`,
      text: {
        format: {
          type: "json_schema",
          name: "daily_save_japan_scenario",
          strict: true,
          schema: {
            type: "object",
            properties: {
              scenario: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  summary: { type: "string" },
                  bossName: { type: "string" },
                  titleJa: { type: "string" },
                  summaryJa: { type: "string" },
                  bossNameJa: { type: "string" },
                  titleZh: { type: "string" },
                  summaryZh: { type: "string" },
                  bossNameZh: { type: "string" },
                },
                required: [
                  "id",
                  "title",
                  "summary",
                  "bossName",
                  "titleJa",
                  "summaryJa",
                  "bossNameJa",
                  "titleZh",
                  "summaryZh",
                  "bossNameZh",
                ],
                additionalProperties: false,
              },
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
                    titleJa: { type: "string" },
                    briefJa: { type: "string" },
                    titleZh: { type: "string" },
                    briefZh: { type: "string" },
                    duration: { type: "number" },
                  },
                  required: [
                    "id",
                    "icon",
                    "title",
                    "brief",
                    "titleJa",
                    "briefJa",
                    "titleZh",
                    "briefZh",
                    "duration",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["scenario", "missions"],
            additionalProperties: false,
          },
        },
      },
    });
    const generated = JSON.parse(response.output_text);
    return {
      scenario: {
        ...generated.scenario,
        source: "gpt-5.6",
        dateKey,
      },
      missions: generated.missions.map((mission, index) => ({
        ...mission,
        duration: [20, 20, 20, 30][index],
      })),
    };
  } catch (error) {
    console.error(
      "GPT-5.6 daily scenario generation failed; using fallback:",
      error.message,
    );
    return fallback;
  }
}

async function prepareDailyScenario(dateKey) {
  if (!dateKey || state.preparedScenarioDate === dateKey) return false;
  const fallback = fallbackDailyContent(dateKey);
  state.scenarioDate = dateKey;
  state.scenario = fallback.scenario;
  state.missions = fallback.missions;
  io.emit("generating", { dateKey });
  broadcast();
  const generated = await generateDailyScenario(dateKey);
  if (state.scenarioDate !== dateKey || state.lastGameDate === dateKey)
    return false;
  state.scenario = generated.scenario;
  state.missions = generated.missions;
  state.preparedScenarioDate = dateKey;
  broadcast();
  return true;
}

function resetRound({ keepDailyScenario = true } = {}) {
  clearDebugTimers();
  for (const [key, player] of state.players) {
    if (player.debug) state.players.delete(key);
  }
  const nextDate = upcomingDailyDateKey(Date.now(), state.lastGameDate);
  const nextContent = fallbackDailyContent(nextDate);
  Object.assign(state, {
    phase: "lobby",
    score: 0,
    missionScore: 0,
    missionIndex: 0,
    genki: 0,
    enemies: [],
    startedAt: null,
    endsAt: null,
    bossVulnerableAnnounced: false,
    ...(keepDailyScenario
      ? {}
      : {
          scenario: nextContent.scenario,
          missions: nextContent.missions,
          scenarioDate: nextDate,
          preparedScenarioDate: null,
        }),
  });
  state.launchVotes.clear();
  state.lastAction.clear();
  for (const player of state.players.values()) {
    player.score = 0;
    player.ufoKills = 0;
    player.bossDamage = 0;
    player.hp = 100;
  }
}

function startRound({ dateKey, scheduledAt = Date.now(), daily = true } = {}) {
  if (state.phase !== "lobby") return false;
  if (daily && state.lastGameDate === dateKey) return false;
  if (daily) {
    if (state.scenarioDate !== dateKey) {
      const content = fallbackDailyContent(dateKey);
      state.scenario = content.scenario;
      state.missions = content.missions;
      state.scenarioDate = dateKey;
    }
    state.lastGameDate = dateKey;
  }
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
  state.lastAction.clear();
  for (const player of state.players.values()) {
    player.score = 0;
    player.ufoKills = 0;
    player.bossDamage = 0;
    player.hp = 100;
  }
  io.emit("phaseChange", {
    phase: "playing",
    scenario: state.scenario,
    daily,
  });
  broadcast();
  return true;
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

  socket.on("host:start", () => {
    if (!debugAllowed()) return;
    startRound({
      dateKey: `debug-${Date.now()}`,
      scheduledAt: Date.now(),
      daily: false,
    });
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
    if (!debugAllowed()) return;
    resetRound();
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
    const next = Math.max(
      0,
      Math.min(2, Math.floor((now - state.startedAt) / 20_000)),
    );
    if (next !== state.missionIndex) {
      const completed = state.missions[state.missionIndex];
      state.missionIndex = next;
      state.missionScore = 0;
      io.emit("missionComplete", {
        title: completed.title,
        mission: completed,
        victory: false,
      });
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
    state.startedAt = now;
    state.endsAt = now + RESULT_DURATION_MS;
    io.emit("bossDefeated");
    broadcast();
  } else if (state.phase === "victory" && now >= state.endsAt) {
    resetRound({ keepDailyScenario: false });
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

function schedulerRequestAllowed(req) {
  return req.get("x-save-japan-scheduler") === INTERNAL_SCHEDULER_HEADER;
}

function scheduledDateFromRequest(req) {
  const dateKey = String(req.get("x-save-japan-date") || "");
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey) ? dateKey : null;
}

app.post("/internal/daily-prepare", async (req, res) => {
  if (!schedulerRequestAllowed(req)) return res.sendStatus(404);
  const dateKey = scheduledDateFromRequest(req);
  if (!dateKey) return res.status(400).json({ ok: false, error: "date_required" });
  const prepared = await prepareDailyScenario(dateKey);
  return res.json({
    ok: true,
    prepared,
    dateKey,
    source: state.scenario.source,
  });
});

app.post("/internal/daily-start", (req, res) => {
  if (!schedulerRequestAllowed(req)) return res.sendStatus(404);
  const dateKey = scheduledDateFromRequest(req);
  const scheduledAt = Number(req.get("x-save-japan-scheduled-at"));
  if (!dateKey || !Number.isFinite(scheduledAt))
    return res.status(400).json({ ok: false, error: "schedule_required" });
  if (
    jstDateKey(scheduledAt) !== dateKey ||
    Math.abs(dailyStartAt(dateKey) - scheduledAt) > 60_000
  )
    return res.status(400).json({ ok: false, error: "invalid_schedule" });
  const started = startRound({ dateKey, scheduledAt, daily: true });
  return res.json({
    ok: true,
    started,
    dateKey,
    phase: state.phase,
    reason: started ? null : "already_started_or_active",
  });
});

app.get("/api/qr", async (req, res) => {
  const forwardedProtocol = req.get("x-forwarded-proto")?.split(",")[0];
  const forwardedHost = req.get("x-forwarded-host")?.split(",")[0];
  const protocol = forwardedProtocol || req.protocol;
  const host = forwardedHost || req.get("host");
  const url = `${protocol}://${host}/`;
  res.type("png").send(
    await QRCode.toBuffer(url, {
      width: 640,
      margin: 1,
      color: { dark: "#071120", light: "#ffffff" },
    }),
  );
});

if (process.env.NODE_ENV !== "production") {
  let localPrepareBusy = false;
  setInterval(async () => {
    const now = Date.now();
    const dateKey = jstDateKey(now);
    const startAt = dailyStartAt(dateKey);
    const jst = new Date(now + JST_OFFSET_MS);
    if (
      jst.getUTCHours() === DAILY_START_HOUR_JST - 1 &&
      jst.getUTCMinutes() >= DAILY_PREPARE_MINUTE_JST &&
      state.preparedScenarioDate !== dateKey &&
      !localPrepareBusy
    ) {
      localPrepareBusy = true;
      await prepareDailyScenario(dateKey);
      localPrepareBusy = false;
    }
    if (
      now >= startAt &&
      now < startAt + 5 * 60_000 &&
      state.lastGameDate !== dateKey &&
      state.phase === "lobby"
    ) {
      startRound({ dateKey, scheduledAt: startAt, daily: true });
    }
  }, 1_000);
}

server.listen(port, "0.0.0.0", () =>
  console.log(
    `Save Japan ready at http://localhost:${port} — display: /display`,
  ),
);
