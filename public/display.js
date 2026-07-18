const socket = io();
let state = null,
  audioReady = false,
  clockOffset = 0;
const $ = (id) => document.getElementById(id);
$("joinUrl").textContent = location.origin;
const lobbyMap = $("japanMap").cloneNode(true);
lobbyMap.id = "lobbyJapanMap";
lobbyMap.classList.add("lobby-japan-map");
$("mapSlideTarget").append(lobbyMap);
const slides = [...document.querySelectorAll(".pitch-slide")];
let slideIndex = 0;
function showSlide(next) {
  slideIndex = (next + slides.length) % slides.length;
  slides.forEach((slide, index) =>
    slide.classList.toggle("active", index === slideIndex),
  );
  $("slideCount").textContent =
    `${String(slideIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
}
window.addEventListener("keydown", (event) => {
  if (!["lobby", "login"].includes(state?.phase || "lobby")) return;
  if (event.key === "ArrowRight") showSlide(slideIndex + 1);
  if (event.key === "ArrowLeft") showSlide(slideIndex - 1);
});
const cutin = document.createElement("div");
cutin.className = "join-cutin hidden";
cutin.innerHTML =
  '<img src="/assets/player-ship-blue.png" alt=""><div><small>NEW INTERCEPTOR ONLINE</small><strong></strong></div>';
document.body.append(cutin);
let knownPlayers = null;
let showingJoin = false;
let previousMission = -1;
let visualPhase = "";
const clock = document.createElement("strong");
clock.id = "clock";
clock.textContent = "60s";
document.querySelector(".live").append(clock);
async function enableAudio() {
  if (!audioReady) {
    await import("/audio.js");
    audioReady = true;
  }
  SaveJapanAudio.init();
}
$("start").onclick = async () => {
  await enableAudio();
  socket.emit("host:start");
};
$("reset").onclick = () => {
  if (audioReady) SaveJapanAudio.stopMusic();
  socket.emit("host:reset");
};
$("debug60").onclick = () => socket.emit("host:debug60");
socket.on("debugLoaded", ({ players }) => {
  const button = $("debug60");
  button.textContent = `✓ ${players} PILOTS LOADED`;
  setTimeout(() => (button.textContent = "DEBUG: 60 PILOTS"), 1800);
});
socket.on("state", (s) => {
  announceNewPlayers(s);
  state = s;
  clockOffset = s.serverNow - Date.now();
  if (s.phase === "playing" && audioReady) SaveJapanAudio.startMusic();
  render();
});
socket.on("generating", () => {
  $("start").textContent = "GPT-5.6 IS CREATING MISSIONS…";
  $("start").disabled = true;
});
socket.on("pulse", ({ prefecture }) => {
  const u = document.querySelector(".ufo");
  if (u)
    u.animate(
      [
        { transform: "translateX(-50%) scale(1)" },
        { transform: "translateX(-50%) scale(1.3)", filter: "brightness(3)" },
        { transform: "translateX(-50%) scale(1)" },
      ],
      { duration: 220 },
    );
  pulseRegion(prefecture);
  firePrefectureBeam(prefecture);
});
socket.on("missionComplete", ({ victory }) => {
  if (victory) {
    if (audioReady) SaveJapanAudio.victory();
  } else {
    if (audioReady) SaveJapanAudio.alert();
    document.body.animate(
      [{ filter: "brightness(2)" }, { filter: "brightness(1)" }],
      { duration: 650 },
    );
  }
});
setInterval(() => {
  if (["login", "playing", "boss"].includes(state?.phase)) {
    const left = Math.max(
      0,
      Math.ceil((state.endsAt - (Date.now() + clockOffset)) / 1000),
    );
    clock.textContent = `${left}s`;
    clock.classList.toggle("urgent", left <= 10);
  }
}, 100);
function render() {
  if (!state) return;
  $("playerCount").textContent = state.players;
  $("regionCount").textContent = state.prefectures.length;
  clock.classList.toggle(
    "hidden",
    !["login", "playing", "boss"].includes(state.phase),
  );
  $("lobby").classList.toggle(
    "hidden",
    !["lobby", "login"].includes(state.phase),
  );
  $("battle").classList.toggle(
    "hidden",
    !["playing", "boss"].includes(state.phase),
  );
  $("victory").classList.toggle("hidden", state.phase !== "victory");
  $("start").classList.toggle("hidden", state.phase !== "lobby");
  $("debug60").classList.toggle(
    "hidden",
    !["lobby", "login"].includes(state.phase),
  );
  $("start").disabled = false;
  $("start").textContent = "START 120-SECOND EXPERIENCE";
  if (["lobby", "login"].includes(state.phase)) {
    $("recent").innerHTML = state.recentPlayers
      .slice(0, 8)
      .map(
        (p) =>
          `<span class="chip">🚀 <b>${safe(p.nickname)}</b> · ${prefectureJapanese(p.prefecture)}</span>`,
      )
      .join("");
  }
  if (["playing", "boss"].includes(state.phase)) {
    updateEnemyVisuals();
    const m = state.missions[state.missionIndex];
    $("missionNumber").textContent =
      state.phase === "boss"
        ? "FINAL PHASE · BOSS BATTLE"
        : `MISSION ${state.missionIndex + 1} OF 3`;
    $("missionIcon").textContent = m.icon;
    $("missionTitle").textContent = m.title;
    $("missionBrief").textContent = m.brief;
    $("score").textContent =
      state.phase === "boss" ? state.genki : state.missionScore;
    $("target").textContent =
      state.phase === "boss"
        ? `/ ${state.genkiTarget} GENKI`
        : `/ ${state.missionTarget} ENERGY`;
    $("progressBar").style.width =
      `${Math.min(100, state.phase === "boss" ? (state.genki / state.genkiTarget) * 100 : (state.missionScore / state.missionTarget) * 100)}%`;
    $("regions").innerHTML = state.prefectures
      .map(
        (r) =>
          `<span class="region">${prefectureJapanese(r.name)} ×${r.count}</span>`,
      )
      .join("");
    if (previousMission !== state.missionIndex) {
      $("japanMap").className = `japan-map camera-${state.missionIndex}`;
      previousMission = state.missionIndex;
    }
    $("ships").innerHTML = state.activePlayers
      .slice(0, 24)
      .map(
        (p, i) =>
          `<span class="ship" title="${safe(p.nickname)} · ${prefectureJapanese(p.prefecture)}" style="animation-delay:${(i % 7) * 0.12}s"><img src="/assets/player-ship-blue.png" alt=""><small><b>${safe(p.nickname)}</b><br>${prefectureJapanese(p.prefecture)}</small></span>`,
      )
      .join("");
  }
  if (state.phase === "victory") {
    $("finalPlayers").textContent = state.players;
    $("finalRegions").textContent = state.prefectures.length;
  }
  updateActiveRegions();
}
function updateEnemyVisuals() {
  const space = document.querySelector(".space");
  space.classList.toggle("game-mode", state.phase === "playing");
  space.classList.toggle("boss-mode", state.phase === "boss");
  $("bossHud").classList.toggle("hidden", state.phase !== "boss");
  if (state.phase === "boss") {
    const hp = Math.max(0, 100 - (state.genki / state.genkiTarget) * 100);
    $("bossHp").style.width = `${hp}%`;
  }
  if (visualPhase === state.phase) return;
  visualPhase = state.phase;
  $("enemyFleet").innerHTML =
    state.phase === "playing"
      ? Array.from(
          { length: 7 },
          (_, index) =>
            `<img src="/assets/ufo-closeup-red.png" alt="Enemy UFO" style="--i:${index}">`,
        ).join("")
      : "";
}
function updateActiveRegions() {
  document
    .querySelectorAll(".map-region")
    .forEach((region) => region.classList.remove("active"));
  state.prefectures.forEach(({ name }) => {
    const key = regionFor(name);
    document
      .querySelectorAll(`#region-${key}, #lobby-region-${key}`)
      .forEach((region) => region.classList.add("active"));
  });
}
function pulseRegion(prefecture) {
  const key = regionFor(prefecture);
  document
    .querySelectorAll(`#region-${key}, #lobby-region-${key}`)
    .forEach((region) => {
      region.classList.remove("pulse");
      void region.getBoundingClientRect();
      region.classList.add("active", "pulse");
      setTimeout(() => region.classList.remove("pulse"), 420);
    });
}
function firePrefectureBeam(prefecture) {
  const position = prefecturePosition(prefecture);
  const space = document.querySelector(".space");
  const map = $("japanMap");
  const layer = $("beamLayer");
  if (!space || !map || !layer) return;
  const spaceRect = space.getBoundingClientRect();
  const mapRect = map.getBoundingClientRect();
  const startX = mapRect.left - spaceRect.left + mapRect.width * position[0];
  const startY = mapRect.top - spaceRect.top + mapRect.height * position[1];
  const targetX = spaceRect.width * 0.5;
  const targetY = spaceRect.height * 0.16;
  const distance = Math.hypot(targetX - startX, targetY - startY);
  const angle =
    (Math.atan2(targetY - startY, targetX - startX) * 180) / Math.PI;
  const pulse = document.createElement("span");
  pulse.className = "prefecture-blast";
  pulse.style.left = `${startX}px`;
  pulse.style.top = `${startY}px`;
  pulse.innerHTML = `<b>${prefectureJapanese(prefecture)}</b>`;
  const beam = document.createElement("i");
  beam.className = "attack-beam";
  beam.style.cssText = `left:${startX}px;top:${startY}px;width:${distance}px;transform:rotate(${angle}deg)`;
  layer.append(pulse, beam);
  setTimeout(() => {
    pulse.remove();
    beam.remove();
  }, 700);
}
function prefecturePosition(prefecture) {
  const coordinates = {
    Hokkaido: [0.77, 0.1],
    Aomori: [0.67, 0.24],
    Iwate: [0.68, 0.29],
    Miyagi: [0.66, 0.35],
    Akita: [0.61, 0.29],
    Yamagata: [0.6, 0.35],
    Fukushima: [0.61, 0.4],
    Ibaraki: [0.64, 0.47],
    Tochigi: [0.59, 0.45],
    Gunma: [0.55, 0.45],
    Saitama: [0.58, 0.49],
    Chiba: [0.64, 0.52],
    Tokyo: [0.58, 0.52],
    Kanagawa: [0.56, 0.54],
    Niigata: [0.52, 0.39],
    Toyama: [0.47, 0.47],
    Ishikawa: [0.43, 0.47],
    Fukui: [0.42, 0.51],
    Yamanashi: [0.53, 0.51],
    Nagano: [0.51, 0.47],
    Gifu: [0.46, 0.52],
    Shizuoka: [0.52, 0.56],
    Aichi: [0.47, 0.56],
    Mie: [0.43, 0.59],
    Shiga: [0.42, 0.55],
    Kyoto: [0.39, 0.54],
    Osaka: [0.38, 0.58],
    Hyogo: [0.35, 0.56],
    Nara: [0.41, 0.59],
    Wakayama: [0.38, 0.62],
    Tottori: [0.31, 0.54],
    Shimane: [0.25, 0.56],
    Okayama: [0.32, 0.58],
    Hiroshima: [0.27, 0.6],
    Yamaguchi: [0.21, 0.62],
    Tokushima: [0.33, 0.63],
    Kagawa: [0.33, 0.6],
    Ehime: [0.27, 0.65],
    Kochi: [0.3, 0.68],
    Fukuoka: [0.17, 0.66],
    Saga: [0.14, 0.69],
    Nagasaki: [0.11, 0.71],
    Kumamoto: [0.16, 0.74],
    Oita: [0.21, 0.7],
    Miyazaki: [0.2, 0.77],
    Kagoshima: [0.15, 0.81],
    Okinawa: [0.08, 0.91],
  };
  return coordinates[prefecture] || [0.58, 0.52];
}
function announceNewPlayers(nextState) {
  const current = new Set(nextState.recentPlayers.map((player) => player.id));
  if (knownPlayers) {
    const arrivals = nextState.recentPlayers
      .filter((player) => !knownPlayers.has(player.id))
      .reverse();
    if (arrivals.length) playJoinWave(arrivals);
  }
  knownPlayers = current;
}
function playJoinWave(players) {
  showingJoin = true;
  cutin.querySelector("strong").textContent =
    players.length === 1
      ? `${players[0].nickname} が ${prefectureJapanese(players[0].prefecture)}から参戦！`
      : players.length <= 5
        ? `${players.map((player) => player.nickname).join("・")} が参戦！`
        : `${players.length}人が全国から一斉参戦！`;
  let ticker = cutin.querySelector("em");
  if (!ticker) {
    ticker = document.createElement("em");
    cutin.querySelector("div").append(ticker);
  }
  ticker.textContent = players
    .slice(0, 12)
    .map(
      (player) =>
        `${player.nickname} / ${prefectureJapanese(player.prefecture)}`,
    )
    .join("  ◆  ");
  cutin.classList.remove("hidden", "animate");
  void cutin.getBoundingClientRect();
  cutin.classList.add("animate");
  [...new Set(players.map((player) => player.prefecture))].forEach(pulseRegion);
  lobbyMap.classList.add("camera-punch");
  setTimeout(() => lobbyMap.classList.remove("camera-punch"), 900);
  setTimeout(
    () => {
      cutin.classList.add("hidden");
      showingJoin = false;
    },
    players.length >= 6 ? 2600 : 1800,
  );
}
function regionFor(prefecture) {
  const regions = {
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
    Object.entries(regions).find(([, names]) =>
      names.includes(prefecture),
    )?.[0] || "kanto"
  );
}
function prefectureJapanese(prefecture) {
  const names = {
    Hokkaido: "北海道",
    Aomori: "青森県",
    Iwate: "岩手県",
    Miyagi: "宮城県",
    Akita: "秋田県",
    Yamagata: "山形県",
    Fukushima: "福島県",
    Ibaraki: "茨城県",
    Tochigi: "栃木県",
    Gunma: "群馬県",
    Saitama: "埼玉県",
    Chiba: "千葉県",
    Tokyo: "東京都",
    Kanagawa: "神奈川県",
    Niigata: "新潟県",
    Toyama: "富山県",
    Ishikawa: "石川県",
    Fukui: "福井県",
    Yamanashi: "山梨県",
    Nagano: "長野県",
    Gifu: "岐阜県",
    Shizuoka: "静岡県",
    Aichi: "愛知県",
    Mie: "三重県",
    Shiga: "滋賀県",
    Kyoto: "京都府",
    Osaka: "大阪府",
    Hyogo: "兵庫県",
    Nara: "奈良県",
    Wakayama: "和歌山県",
    Tottori: "鳥取県",
    Shimane: "島根県",
    Okayama: "岡山県",
    Hiroshima: "広島県",
    Yamaguchi: "山口県",
    Tokushima: "徳島県",
    Kagawa: "香川県",
    Ehime: "愛媛県",
    Kochi: "高知県",
    Fukuoka: "福岡県",
    Saga: "佐賀県",
    Nagasaki: "長崎県",
    Kumamoto: "熊本県",
    Oita: "大分県",
    Miyazaki: "宮崎県",
    Kagoshima: "鹿児島県",
    Okinawa: "沖縄県",
  };
  return names[prefecture] || prefecture;
}
function safe(s) {
  const e = document.createElement("span");
  e.textContent = s;
  return e.innerHTML;
}
