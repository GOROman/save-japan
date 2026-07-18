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
app.get("/display", (_req, res) => res.sendFile(new URL("./public/display.html", import.meta.url).pathname));

const defaultMissions = [
  { id: "shield", icon: "🛡️", title: "Raise the Shields", brief: "Charge your hometown defense grid", duration: 15 },
  { id: "strike", icon: "🛸", title: "Intercept the UFOs", brief: "Fire together before they reach Japan", duration: 15 },
  { id: "relay", icon: "⚡", title: "National Energy Relay", brief: "Send power beyond your own region", duration: 20 },
  { id: "final", icon: "🇯🇵", title: "Save Japan!", brief: "Everyone attack for the final defense", duration: 10 }
];

const state = {
  phase: "lobby", missionIndex: 0, missions: defaultMissions,
  players: new Map(), score: 0, missionScore: 0,
  startedAt: null, endsAt: null, lastAction: new Map()
};

function targetFor(index = state.missionIndex) {
  return Math.max(12, Math.ceil(Math.max(1, state.players.size) * [5, 7, 9, 6][index]));
}

function publicState() {
  const players = [...state.players.values()];
  const prefectures = Object.entries(players.reduce((all, p) => {
    all[p.prefecture] = (all[p.prefecture] || 0) + 1;
    return all;
  }, {})).map(([name, count]) => ({ name, count }));
  return {
    phase: state.phase, missionIndex: state.missionIndex, missions: state.missions,
    score: state.score, missionScore: state.missionScore, missionTarget: targetFor(),
    players: players.length, prefectures, recentPlayers: players.slice(-8).reverse(), activePlayers: players.slice(-30),
    startedAt: state.startedAt, endsAt: state.endsAt, serverNow: Date.now()
  };
}

function broadcast() { io.emit("state", publicState()); }

async function generateMissions() {
  if (!process.env.OPENAI_API_KEY) return defaultMissions;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const regions = [...new Set([...state.players.values()].map(p => p.prefecture))];
  try {
    const response = await openai.responses.create({
      model: "gpt-5.6",
      input: `Create four short, exciting stages for a 60-second cooperative UFO defense game called Save Japan. Players represent: ${regions.join(", ") || "all Japan"}. Stage 1 raises regional shields, stage 2 intercepts UFOs, stage 3 relays energy between regions, stage 4 is a synchronized final attack. Use exactly 15, 15, 20, and 10 seconds. Return concise English UI copy.`,
      text: { format: { type: "json_schema", name: "missions", strict: true, schema: { type: "object", properties: { missions: { type: "array", minItems: 4, maxItems: 4, items: { type: "object", properties: { id:{type:"string"}, icon:{type:"string"}, title:{type:"string"}, brief:{type:"string"}, duration:{type:"number"} }, required:["id","icon","title","brief","duration"], additionalProperties:false } } }, required:["missions"], additionalProperties:false } } }
    });
    const missions = JSON.parse(response.output_text).missions;
    return missions.map((mission, index) => ({ ...mission, duration: [15, 15, 20, 10][index] }));
  } catch (error) {
    console.error("GPT-5.6 mission generation failed; using fallback:", error.message);
    return defaultMissions;
  }
}

io.on("connection", socket => {
  socket.emit("state", publicState());

  socket.on("join", ({ nickname, prefecture }, reply = () => {}) => {
    const player = {
      id: randomUUID(), socketId: socket.id,
      nickname: String(nickname || "Pilot").trim().slice(0, 16),
      prefecture: String(prefecture || "Tokyo").trim().slice(0, 12),
      interceptor: Math.floor(Math.random() * 6), score: 0
    };
    state.players.set(socket.id, player);
    reply({ ok: true, player });
    broadcast();
  });

  socket.on("action", () => {
    if (state.phase !== "playing") return;
    const player = state.players.get(socket.id);
    if (!player) return;
    const now = Date.now();
    if (now - (state.lastAction.get(socket.id) || 0) < 160) return;
    state.lastAction.set(socket.id, now);
    player.score += 1; state.score += 1; state.missionScore += 1;
    io.emit("pulse", { prefecture: player.prefecture, missionIndex: state.missionIndex });
  });

  socket.on("host:start", async () => {
    if (state.phase !== "lobby") return;
    io.emit("generating");
    state.missions = await generateMissions();
    state.phase = "playing"; state.startedAt = Date.now(); state.endsAt = state.startedAt + 60_000;
    state.score = 0; state.missionScore = 0; state.missionIndex = 0;
    for (const p of state.players.values()) p.score = 0;
    broadcast();
  });

  socket.on("host:reset", () => {
    Object.assign(state, { phase:"lobby", score:0, missionScore:0, missionIndex:0, missions:defaultMissions, startedAt:null, endsAt:null });
    for (const p of state.players.values()) p.score = 0;
    broadcast();
  });
  socket.on("disconnect", () => { state.players.delete(socket.id); broadcast(); });
});

setInterval(() => {
  if (state.phase !== "playing") return;
  const elapsed = Date.now() - state.startedAt;
  const next = elapsed < 15_000 ? 0 : elapsed < 30_000 ? 1 : elapsed < 50_000 ? 2 : elapsed < 60_000 ? 3 : 4;
  if (next === 4) {
    state.phase = "victory";
    io.emit("missionComplete", { title: state.missions[3].title, victory: true });
    broadcast(); return;
  }
  if (next !== state.missionIndex) {
    const completed = state.missions[state.missionIndex];
    state.missionIndex = next; state.missionScore = 0;
    io.emit("missionComplete", { title: completed.title, victory: false });
  }
  broadcast();
}, 250);

app.get("/api/qr", async (req, res) => {
  const url = `${req.protocol}://${req.get("host")}/`;
  res.type("png").send(await QRCode.toBuffer(url, { width:640, margin:1, color:{ dark:"#071120", light:"#ffffff" } }));
});

server.listen(port, () => console.log(`Save Japan ready at http://localhost:${port} — display: /display`));
