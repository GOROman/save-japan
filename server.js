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
  { id: "shield", icon: "🛡️", title: "Regional Shield", brief: "Charge your prefecture shield together", target: 60 },
  { id: "supply", icon: "⚡", title: "Energy Relay", brief: "Send energy to a region that needs support", target: 90 },
  { id: "strike", icon: "🚀", title: "United Strike", brief: "Coordinate interceptors across Japan", target: 130 },
  { id: "final", icon: "🇯🇵", title: "Save Japan!", brief: "Everyone press and hold for the final defense", target: 180 }
];

const state = {
  phase: "lobby",
  missionIndex: 0,
  missions: defaultMissions,
  players: new Map(),
  score: 0,
  startedAt: null,
  lastAction: new Map()
};

function publicState() {
  const players = [...state.players.values()];
  const prefectures = Object.entries(players.reduce((all, p) => {
    all[p.prefecture] = (all[p.prefecture] || 0) + 1;
    return all;
  }, {})).map(([name, count]) => ({ name, count }));
  return {
    phase: state.phase,
    missionIndex: state.missionIndex,
    missions: state.missions,
    score: state.score,
    players: players.length,
    prefectures,
    recentPlayers: players.slice(-8).reverse()
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
      input: `Create four short, exciting cooperative missions for a 3-minute UFO defense game called Save Japan. Players represent these Japanese prefectures: ${regions.join(", ") || "all Japan"}. Mission 1 builds regional pride, mission 2 requires helping another region, mission 3 is a coordinated attack, mission 4 is a synchronized final defense. Return JSON only as {"missions":[{"id":"...","icon":"one emoji","title":"max 4 English words","brief":"max 9 English words","target":number}]}. Targets should be 60, 90, 130, 180.`,
      text: { format: { type: "json_schema", name: "missions", strict: true, schema: { type: "object", properties: { missions: { type: "array", minItems: 4, maxItems: 4, items: { type: "object", properties: { id: {type:"string"}, icon:{type:"string"}, title:{type:"string"}, brief:{type:"string"}, target:{type:"number"} }, required:["id","icon","title","brief","target"], additionalProperties:false } } }, required:["missions"], additionalProperties:false } } }
    });
    return JSON.parse(response.output_text).missions;
  } catch (error) {
    console.error("GPT-5.6 mission generation failed; using safe fallback:", error.message);
    return defaultMissions;
  }
}

io.on("connection", socket => {
  socket.emit("state", publicState());

  socket.on("join", ({ nickname, prefecture }, reply = () => {}) => {
    const cleanName = String(nickname || "Pilot").trim().slice(0, 16);
    const cleanPrefecture = String(prefecture || "Tokyo").trim().slice(0, 12);
    const player = { id: randomUUID(), socketId: socket.id, nickname: cleanName, prefecture: cleanPrefecture, interceptor: Math.floor(Math.random() * 6), score: 0 };
    state.players.set(socket.id, player);
    reply({ ok: true, player });
    broadcast();
  });

  socket.on("action", () => {
    if (state.phase !== "playing") return;
    const player = state.players.get(socket.id);
    if (!player) return;
    const now = Date.now();
    if (now - (state.lastAction.get(socket.id) || 0) < 180) return;
    state.lastAction.set(socket.id, now);
    player.score += 1;
    state.score += 1;
    const mission = state.missions[state.missionIndex];
    if (state.score >= mission.target) {
      if (state.missionIndex === state.missions.length - 1) state.phase = "victory";
      else { state.missionIndex += 1; state.score = 0; }
      io.emit("missionComplete", { title: mission.title, victory: state.phase === "victory" });
    }
    broadcast();
  });

  socket.on("host:start", async () => {
    if (state.phase !== "lobby") return;
    io.emit("generating");
    state.missions = await generateMissions();
    state.phase = "playing";
    state.startedAt = Date.now();
    state.score = 0;
    state.missionIndex = 0;
    broadcast();
  });

  socket.on("host:reset", () => {
    state.phase = "lobby"; state.score = 0; state.missionIndex = 0; state.missions = defaultMissions;
    for (const p of state.players.values()) p.score = 0;
    broadcast();
  });
  socket.on("disconnect", () => { state.players.delete(socket.id); broadcast(); });
});

app.get("/api/qr", async (req, res) => {
  const url = `${req.protocol}://${req.get("host")}/`;
  res.type("png").send(await QRCode.toBuffer(url, { width: 640, margin: 1, color: { dark: "#071120", light: "#ffffff" } }));
});

server.listen(port, () => console.log(`Save Japan ready at http://localhost:${port} — display: /display`));
