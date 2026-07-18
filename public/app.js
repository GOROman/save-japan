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
const prefecturesZh = [
  "北海道",
  "青森县",
  "岩手县",
  "宫城县",
  "秋田县",
  "山形县",
  "福岛县",
  "茨城县",
  "栃木县",
  "群马县",
  "埼玉县",
  "千叶县",
  "东京都",
  "神奈川县",
  "新潟县",
  "富山县",
  "石川县",
  "福井县",
  "山梨县",
  "长野县",
  "岐阜县",
  "静冈县",
  "爱知县",
  "三重县",
  "滋贺县",
  "京都府",
  "大阪府",
  "兵库县",
  "奈良县",
  "和歌山县",
  "鸟取县",
  "岛根县",
  "冈山县",
  "广岛县",
  "山口县",
  "德岛县",
  "香川县",
  "爱媛县",
  "高知县",
  "福冈县",
  "佐贺县",
  "长崎县",
  "熊本县",
  "大分县",
  "宫崎县",
  "鹿儿岛县",
  "冲绳县",
];
const translations = {
  ja: {
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
      victoryTitle: "日本は<br />救われた・・",
      victoryCopy:
        "47都道府県、ひとつのチーム。<br />この元気を、現実の日本へ。",
      joinFailed: "参加できませんでした",
      missions: [
        ["シールドを展開せよ", "故郷の防衛グリッドをチャージしよう"],
        ["UFOを迎撃せよ", "日本へ到達する前に力を合わせて攻撃しよう"],
        ["全国元気リレー", "地域を越えて元気を送り合おう"],
        ["日本を救え！", "全国の元気を集めて一斉攻撃しよう"],
      ],
    },
  en: {
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
      victoryTitle: "JAPAN<br />IS SAVED.",
      victoryCopy:
        "47 prefectures. One team.<br />Bring this energy into the real Japan.",
      joinFailed: "JOIN FAILED",
      missions: null,
    },
  zh: {
      network: "全国防卫网络",
      alert: "UFO警报 · 最高级别",
      hero: "你的故乡正在等待你。与来自日本47个都道府县的伙伴并肩作战，一起保卫日本。",
      name: "代号",
      nickname: "输入昵称",
      hometown: "你的故乡在哪里？",
      join: "驾驶拦截机参战 →",
      fine: "无需注册，无需下载，只需要团队合作。",
      standby: "待命",
      waiting: "等待作战开始",
      soon: "防卫指挥部即将启动作战。",
      contribution: "你的贡献",
      defenseTeam: "防卫队",
      finalBoss: "最终决战",
      mission: "任务",
      defend: "迎击！",
      genki: "传递元气！",
      launch: "发射！",
      planning: "GPT-5.6正在制定作战计划…",
      analyzing: "正在分析参战地区",
      complete: "完成 — 进入下一个任务",
      ranking: "排行榜",
      ufo: "击落UFO",
      bossDamage: "首领伤害",
      victoryTitle: "日本<br />得救了……",
      victoryCopy:
        "47个都道府县，组成一支队伍。<br />把这份元气带到现实中的日本。",
      joinFailed: "参战失败",
      missions: [
        ["启动防护盾", "为故乡的防卫系统充能"],
        ["拦截UFO", "在敌人抵达日本前协力攻击"],
        ["全国元气接力", "跨越地区传递元气"],
        ["拯救日本！", "汇聚全国元气，发动同步攻击"],
      ],
    },
};
const browserLanguage = (
  navigator.languages?.[0] ||
  navigator.language ||
  "ja"
).toLowerCase();
const automaticLocale = browserLanguage.startsWith("zh")
  ? "zh"
  : browserLanguage.startsWith("ja")
    ? "ja"
    : "en";
const storedLocale = localStorage.getItem("saveJapan.locale");
let currentLocale = Object.hasOwn(translations, storedLocale)
  ? storedLocale
  : automaticLocale;
let copy = translations[currentLocale];
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
const savedNickname = localStorage.getItem("saveJapan.nickname") || "";
const savedPrefecture = localStorage.getItem("saveJapan.prefecture") || "Tokyo";
$("nickname").value = savedNickname;
function localizedPrefecture(prefecture) {
  const index = prefectures.indexOf(prefecture);
  if (index < 0) return prefecture;
  if (currentLocale === "ja") return prefecturesJa[index];
  if (currentLocale === "zh") return prefecturesZh[index];
  return prefecture;
}
function renderPrefectureOptions(
  selected = $("prefecture").value || savedPrefecture,
) {
  $("prefecture").innerHTML = prefectures
    .map(
      (prefecture) =>
        `<option value="${prefecture}" ${prefecture === selected ? "selected" : ""}>${localizedPrefecture(prefecture)}</option>`,
    )
    .join("");
}
function applyLocale(nextLocale, { persist = true } = {}) {
  if (!Object.hasOwn(translations, nextLocale)) return;
  currentLocale = nextLocale;
  copy = translations[currentLocale];
  if (persist) localStorage.setItem("saveJapan.locale", currentLocale);
  document.documentElement.lang = currentLocale === "zh" ? "zh-CN" : currentLocale;
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
  $("victoryTitle").innerHTML = copy.victoryTitle;
  $("victoryCopy").innerHTML = copy.victoryCopy;
  document.querySelectorAll("[data-locale]").forEach((button) => {
    const active = button.dataset.locale === currentLocale;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  renderPrefectureOptions();
  if (player) {
    $("pilotRegion").textContent =
      `${localizedPrefecture(player.prefecture)} ${copy.defenseTeam}`;
  }
  render();
}
document.querySelectorAll("[data-locale]").forEach((button) =>
  button.addEventListener("click", () => applyLocale(button.dataset.locale)),
);
applyLocale(currentLocale, { persist: false });
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
      if (!result?.player) {
        $("joinButton").textContent = copy.joinFailed;
        setTimeout(() => ($("joinButton").textContent = copy.join), 1800);
        return;
      }
      player = result.player;
      $("join").classList.add("hidden");
      $("game").classList.remove("hidden");
      $("pilotName").textContent = player.nickname;
      $("pilotRegion").textContent =
        `${localizedPrefecture(player.prefecture)} ${copy.defenseTeam}`;
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
  const localizedTitle =
    copy.missions?.[state?.missionIndex]?.[0] || title;
  t.textContent = `✓ ${localizedTitle} ${copy.complete}`;
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
        const hometown = localizedPrefecture(entry.prefecture);
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
  const localizedMission = copy.missions?.[state.missionIndex];
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
    ? `${m.icon} ${localizedMission?.[0] || m.title}`
    : copy.waiting;
  $("missionBrief").textContent = active
    ? localizedMission?.[1] || m.brief
    : copy.soon;
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
