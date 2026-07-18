const prefectures = [
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
const socket = io();
let player = null,
  state = null,
  myScore = 0,
  audioReady = false,
  lastMission = -1;
const $ = (id) => document.getElementById(id);
$("prefecture").innerHTML = prefectures
  .map((p) => `<option ${p === "Tokyo" ? "selected" : ""}>${p}</option>`)
  .join("");
const timer = document.createElement("div");
timer.id = "timer";
timer.style.cssText =
  "font-size:34px;font-weight:1000;margin:14px 0 -10px;font-variant-numeric:tabular-nums";
timer.textContent = "60s";
$("game").insertBefore(timer, $("game").querySelector(".mission-card"));
async function enableAudio() {
  if (!audioReady) {
    await import("/audio.js");
    audioReady = true;
  }
  SaveJapanAudio.init();
}
$("joinForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  await enableAudio();
  socket.emit(
    "join",
    { nickname: $("nickname").value, prefecture: $("prefecture").value },
    (result) => {
      player = result.player;
      $("join").classList.add("hidden");
      $("game").classList.remove("hidden");
      $("pilotName").textContent = player.nickname;
      $("pilotRegion").textContent = `${player.prefecture} Defense Team`;
      render();
    },
  );
});
$("fire").addEventListener("pointerdown", () => {
  myScore++;
  $("myScore").textContent = myScore;
  socket.emit("action");
  if (audioReady) SaveJapanAudio.laser();
  if (navigator.vibrate) navigator.vibrate(20);
});
socket.on("state", (s) => {
  state = s;
  if (s.phase === "playing" && audioReady) SaveJapanAudio.startMusic();
  render();
});
socket.on("generating", () => {
  if (player) {
    $("missionTitle").textContent = "GPT-5.6 is planning…";
    $("missionBrief").textContent = "Analyzing participating regions";
  }
});
socket.on("missionComplete", ({ title, victory }) => {
  if (victory) {
    if (audioReady) SaveJapanAudio.victory();
    return;
  }
  if (audioReady) SaveJapanAudio.alert();
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = `✓ ${title} COMPLETE — NEXT MISSION`;
  document.body.append(t);
  setTimeout(() => t.remove(), 2100);
});
function render() {
  if (!player || !state) return;
  if (state.phase === "victory") {
    $("game").classList.add("hidden");
    $("victory").classList.remove("hidden");
    return;
  }
  const active = ["playing", "boss"].includes(state.phase),
    m = state.missions[state.missionIndex];
  if (active) {
    const remaining = Math.max(
      0,
      Math.ceil(
        (state.endsAt - (Date.now() + (state.serverNow - Date.now()))) / 1000,
      ),
    );
    timer.textContent = `${remaining}s`;
    if (remaining <= 10) timer.style.color = "#ff4059";
  }
  $("missionNumber").textContent = active
    ? state.phase === "boss"
      ? "FINAL BOSS"
      : `MISSION ${state.missionIndex + 1} / 3`
    : "STAND BY";
  $("missionTitle").textContent = active
    ? `${m.icon} ${m.title}`
    : "Waiting for launch";
  $("missionBrief").textContent = active
    ? m.brief
    : "The defense commander will start soon.";
  $("progressBar").style.width = active
    ? `${Math.min(100, state.phase === "boss" ? (state.genki / state.genkiTarget) * 100 : (state.missionScore / state.missionTarget) * 100)}%`
    : "0";
  $("fire").classList.toggle("hidden", !active);
  $("fire").textContent =
    state.phase === "boss"
      ? state.genki >= state.genkiTarget
        ? "発射！"
        : "元気を送る！"
      : "DEFEND!";
  lastMission = state.missionIndex;
}
