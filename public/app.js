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
const prefecturesJa = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];
const locale = (
  navigator.languages?.[0] ||
  navigator.language ||
  "ja"
).toLowerCase();
const isJa = locale.startsWith("ja");
const copy = isJa
  ? {
      network: "全国防衛ネットワーク",
      alert: "UFO警報 · レベル5",
      hero: "あなたの故郷が、あなたを待っている。47都道府県の仲間と力を合わせ、日本を守ろう。",
      name: "名前",
      nickname: "ニックネーム",
      hometown: "あなたの故郷は？",
      join: "迎撃機で参戦 →",
      fine: "登録不要。ダウンロード不要。必要なのはチームワークだけ。",
      standby: "待機中",
      waiting: "作戦開始を待っています",
      soon: "まもなく防衛司令部が作戦を開始します。",
      contribution: "あなたの貢献",
      defenseTeam: "防衛隊",
      finalBoss: "最終決戦",
      mission: "ミッション",
      defend: "迎撃！",
      genki: "元気を送る！",
      launch: "発射！",
      planning: "GPT-5.6が作戦立案中…",
      analyzing: "参加地域を分析しています",
      complete: "完了 — 次のミッションへ",
      ranking: "トップランキング",
      ufo: "UFO撃破",
      bossDamage: "ボスダメージ",
    }
  : {
      network: "National Defense Network",
      alert: "UFO Alert · Level 5",
      hero: "Your hometown needs you. Join pilots from all 47 prefectures and defend Japan—together.",
      name: "Call sign",
      nickname: "Your nickname",
      hometown: "Where is your hometown?",
      join: "Launch interceptor →",
      fine: "No account. No download. Just teamwork.",
      standby: "STAND BY",
      waiting: "Waiting for launch",
      soon: "The defense commander will start soon.",
      contribution: "Your contribution",
      defenseTeam: "Defense Team",
      finalBoss: "FINAL BOSS",
      mission: "MISSION",
      defend: "DEFEND!",
      genki: "SEND ENERGY!",
      launch: "LAUNCH!",
      planning: "GPT-5.6 is planning…",
      analyzing: "Analyzing participating regions",
      complete: "COMPLETE — NEXT MISSION",
      ranking: "TOP RANKING",
      ufo: "UFO KILLS",
      bossDamage: "BOSS DAMAGE",
    };
const socket = io();
let player = null,
  state = null,
  myScore = 0,
  audioReady = false,
  lastMission = -1;
const $ = (id) => document.getElementById(id);
const safe = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
document.documentElement.lang = isJa ? "ja" : "en";
$("networkName").textContent = copy.network;
$("alertLabel").textContent = copy.alert;
$("heroCopy").textContent = copy.hero;
$("nameLabel").textContent = copy.name;
$("nickname").placeholder = copy.nickname;
$("hometownLabel").textContent = copy.hometown;
$("joinButton").textContent = copy.join;
$("joinFine").textContent = copy.fine;
$("contributionLabel").textContent = copy.contribution;
$("mobileRankingTitle").textContent = copy.ranking;
const savedNickname = localStorage.getItem("saveJapan.nickname") || "";
const savedPrefecture = localStorage.getItem("saveJapan.prefecture") || "Tokyo";
$("nickname").value = savedNickname;
$("prefecture").innerHTML = prefectures
  .map(
    (p, index) =>
      `<option value="${p}" ${p === savedPrefecture ? "selected" : ""}>${isJa ? prefecturesJa[index] : p}</option>`,
  )
  .join("");
const timer = document.createElement("div");
timer.id = "timer";
timer.style.cssText =
  "font-size:34px;font-weight:1000;margin:14px 0 -10px;font-variant-numeric:tabular-nums";
timer.textContent = "60s";
$("game").insertBefore(timer, $("game").querySelector(".mission-card"));
async function enableAudio() {
  if (!audioReady) {
    SaveJapanAudio.init();
    audioReady = true;
  }
}
$("joinForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  localStorage.setItem("saveJapan.nickname", $("nickname").value.trim());
  localStorage.setItem("saveJapan.prefecture", $("prefecture").value);
  await enableAudio();
  SaveJapanAudio.launch();
  socket.emit(
    "join",
    { nickname: $("nickname").value, prefecture: $("prefecture").value },
    (result) => {
      player = result.player;
      $("join").classList.add("hidden");
      $("game").classList.remove("hidden");
      $("pilotName").textContent = player.nickname;
      const prefectureIndex = prefectures.indexOf(player.prefecture);
      const localizedPrefecture = isJa
        ? prefecturesJa[prefectureIndex]
        : player.prefecture;
      $("pilotRegion").textContent =
        `${localizedPrefecture} ${copy.defenseTeam}`;
      render();
    },
  );
});
$("fire").addEventListener("pointerdown", () => {
  myScore++;
  $("myScore").textContent = myScore;
  socket.emit("action");
  if (audioReady)
    state?.phase === "boss"
      ? SaveJapanAudio.hissatsu()
      : SaveJapanAudio.shoot();
  if (navigator.vibrate)
    navigator.vibrate(state?.phase === "boss" ? [24, 18, 42] : 28);
});
socket.on("state", (s) => {
  state = s;
  if (s.phase === "playing" && audioReady) SaveJapanAudio.startMusic();
  render();
});
socket.on("generating", () => {
  if (player) {
    $("missionTitle").textContent = copy.planning;
    $("missionBrief").textContent = copy.analyzing;
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
  t.textContent = `✓ ${title} ${copy.complete}`;
  document.body.append(t);
  setTimeout(() => t.remove(), 2100);
});
function render() {
  if (!player || !state) return;
  if (state.phase === "victory") {
    $("game").classList.add("hidden");
    $("victory").classList.remove("hidden");
    $("mobileLeaderboard").innerHTML = state.leaderboard
      .map((entry, index) => {
        const prefectureIndex = prefectures.indexOf(entry.prefecture);
        const hometown = isJa
          ? prefecturesJa[prefectureIndex]
          : entry.prefecture;
        return `<li class="rank-${index + 1} ${entry.id === player.id ? "me" : ""}" data-player-id="${safe(entry.id)}"><i>${["🏆", "🥈", "🥉"][index] || index + 1}</i><b>${safe(entry.nickname)}<small>${safe(hometown)} · ${copy.ufo} ${entry.ufoKills ?? 0} · ${copy.bossDamage} ${entry.bossDamage ?? 0}</small></b><strong>${entry.score ?? 0}</strong></li>`;
      })
      .join("");
    requestAnimationFrame(() =>
      $("mobileLeaderboard")
        .querySelector(".me")
        ?.scrollIntoView({ block: "center" }),
    );
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
    timer.classList.toggle("urgent", remaining <= 10);
  }
  $("missionNumber").textContent = active
    ? state.phase === "boss"
      ? copy.finalBoss
      : `${copy.mission} ${state.missionIndex + 1} / 3`
    : copy.standby;
  $("missionTitle").textContent = active
    ? `${m.icon} ${m.title}`
    : copy.waiting;
  $("missionBrief").textContent = active ? m.brief : copy.soon;
  $("progressBar").style.width = active
    ? `${Math.min(100, state.phase === "boss" ? (state.genki / state.genkiTarget) * 100 : (state.missionScore / state.missionTarget) * 100)}%`
    : "0";
  $("fire").classList.toggle("hidden", !active);
  $("fire").textContent =
    state.phase === "boss"
      ? state.genki >= state.genkiTarget
        ? copy.launch
        : copy.genki
      : copy.defend;
  lastMission = state.missionIndex;
}
