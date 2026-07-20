const socket = io();
let state = null,
  audioReady = false,
  clockOffset = 0,
  debugMode = false;
const $ = (id) => document.getElementById(id);
const displayCopies = {
  ja: {
    brand: "全国防衛司令部", live: "LIVE", pilots: "PILOTS", regions: "REGIONS",
    problemKicker: "THE PROBLEM", problemTitle: "今の日本に<br />足りないのは、<em>「元気」</em>", problemCopy: "個人の元気を、地域を越えた大きな力へ。",
    solutionKicker: "THE SOLUTION", solutionTitle: "<span>キミの故郷からログイン！</span><span>47都道府県が配置。</span><span>30秒で集結。</span>",
    experienceKicker: "THE EXPERIENCE", experienceTitle: "120秒で、日本を救え。", phaseRow: "<b>30</b><span>JOIN<br />QRで参戦</span><i>→</i><b>60</b><span>PLAY<br />元気を集める</span><i>→</i><b>30</b><span>BOSS<br />全員で発射</span>",
    openaiKicker: "BUILT WITH OPENAI", openaiTitle: "<span>AIが、会場全体を</span><span><em>ひとつのチーム</em>にする。</span>", openaiCopy: "GPT-5.6がミッションを創り、Codexが体験を実装。",
    presentation: "← → プレゼンテーション", qr: "スキャンして参戦", boss: "⚠ 巨大UFO · ラストボス",
    victoryKicker: "MISSION COMPLETE", victoryTitle: "日本は<br />救われた・・", victoryCopy: "47都道府県の元気が、日本をひとつにした。", top: "トップ5 パイロット",
    start: "ゲーム開始", built: "Codex + GPT-5.6で開発", finalPhase: "最終フェーズ · ボス戦", mission: "ミッション", of: "/ 3", energy: "エネルギー", genki: "元気",
    dailyRule: "1日1回 · 毎日21:00 JST", dailyCountdown: "次回の全国防衛作戦まで", dailyLive: "本日の全国防衛作戦 進行中", scenarioLoading: "本日の危機を解析中…",
    missions: [["シールドを展開せよ", "故郷の防衛グリッドをチャージ"], ["UFOを迎撃せよ", "日本へ到達する前に協力して攻撃"], ["全国元気リレー", "地域を越えて元気を送ろう"], ["日本を救え！", "全国の元気で一斉攻撃"]],
  },
  en: {
    brand: "National Defense Command", live: "LIVE", pilots: "PILOTS", regions: "REGIONS",
    problemKicker: "THE PROBLEM", problemTitle: "Japan is missing<br />one vital force: <em>GENKI.</em>", problemCopy: "Turn individual energy into one nationwide force.",
    solutionKicker: "THE SOLUTION", solutionTitle: "<span>Join from your hometown.</span><span>All 47 prefectures.</span><span>United in 30 seconds.</span>",
    experienceKicker: "THE EXPERIENCE", experienceTitle: "Save Japan in 120 seconds.", phaseRow: "<b>30</b><span>JOIN<br />Scan the QR</span><i>→</i><b>60</b><span>PLAY<br />Build GENKI</span><i>→</i><b>30</b><span>BOSS<br />Fire together</span>",
    openaiKicker: "BUILT WITH OPENAI", openaiTitle: "<span>AI turns an entire venue</span><span>into <em>one team.</em></span>", openaiCopy: "GPT-5.6 creates the mission. Codex built the experience.",
    presentation: "← → PRESENTATION", qr: "SCAN TO JOIN", boss: "⚠ GIANT UFO · FINAL BOSS",
    victoryKicker: "MISSION COMPLETE", victoryTitle: "JAPAN<br />IS SAVED.", victoryCopy: "The energy of 47 prefectures united Japan.", top: "TOP 5 PILOTS",
    start: "START GAME", built: "Built with Codex + GPT-5.6", finalPhase: "FINAL PHASE · BOSS BATTLE", mission: "MISSION", of: "OF 3", energy: "ENERGY", genki: "GENKI",
    dailyRule: "ONCE A DAY · 21:00 JST", dailyCountdown: "NEXT NATIONAL DEFENSE IN", dailyLive: "TODAY'S DEFENSE IS LIVE", scenarioLoading: "ANALYZING TODAY'S CRISIS…", missions: null,
  },
  zh: {
    brand: "全国防卫指挥部", live: "直播", pilots: "飞行员", regions: "地区",
    problemKicker: "当前挑战", problemTitle: "今天的日本<br />缺少的是<em>“元气”</em>", problemCopy: "把每个人的元气汇聚成跨越地区的力量。",
    solutionKicker: "解决方案", solutionTitle: "<span>从你的故乡登录！</span><span>日本47个都道府县。</span><span>30秒内集结。</span>",
    experienceKicker: "游戏体验", experienceTitle: "在120秒内拯救日本。", phaseRow: "<b>30</b><span>加入<br />扫描二维码</span><i>→</i><b>60</b><span>战斗<br />汇聚元气</span><i>→</i><b>30</b><span>首领<br />全员发射</span>",
    openaiKicker: "由 OPENAI 驱动", openaiTitle: "<span>AI让整个会场</span><span>成为<em>一支队伍</em>。</span>", openaiCopy: "GPT-5.6生成任务，Codex构建完整体验。",
    presentation: "← → 演示", qr: "扫码参战", boss: "⚠ 巨型UFO · 最终首领",
    victoryKicker: "任务完成", victoryTitle: "日本<br />得救了……", victoryCopy: "47个都道府县的元气，让日本团结一心。", top: "前5名飞行员",
    start: "开始游戏", built: "使用 Codex + GPT-5.6 构建", finalPhase: "最终阶段 · 首领战", mission: "任务", of: "/ 3", energy: "能量", genki: "元气",
    dailyRule: "每天一次 · 日本时间21:00", dailyCountdown: "距离下次全国防卫作战", dailyLive: "今日全国防卫作战进行中", scenarioLoading: "正在分析今日危机……",
    missions: [["启动防护盾", "为故乡的防卫系统充能"], ["拦截UFO", "在敌人抵达日本前协力攻击"], ["全国元气接力", "跨越地区传递元气"], ["拯救日本！", "汇聚全国元气发动同步攻击"]],
  },
};
let displayLocale = localStorage.getItem("saveJapan.displayLocale") || "ja";
if (!displayCopies[displayLocale]) displayLocale = "ja";
let displayCopy = displayCopies[displayLocale];
const gameQrOverlay = document.createElement("div");
gameQrOverlay.className = "game-qr-overlay hidden";
gameQrOverlay.innerHTML =
  '<img src="/api/qr" alt="Join QR code"><strong>SCAN TO JOIN</strong>';
document.body.append(gameQrOverlay);
function localizedMission(mission, index = state?.missionIndex || 0) {
  if (!mission) return { title: "", brief: "" };
  if (displayLocale === "ja")
    return {
      title: mission.titleJa || displayCopy.missions?.[index]?.[0] || mission.title,
      brief: mission.briefJa || displayCopy.missions?.[index]?.[1] || mission.brief,
    };
  if (displayLocale === "zh")
    return {
      title: mission.titleZh || displayCopy.missions?.[index]?.[0] || mission.title,
      brief: mission.briefZh || displayCopy.missions?.[index]?.[1] || mission.brief,
    };
  return { title: mission.title, brief: mission.brief };
}
function localizedScenario(scenario) {
  if (!scenario)
    return { title: displayCopy.scenarioLoading, summary: "", bossName: "" };
  if (displayLocale === "ja")
    return {
      title: scenario.titleJa || scenario.title,
      summary: scenario.summaryJa || scenario.summary,
      bossName: scenario.bossNameJa || scenario.bossName,
    };
  if (displayLocale === "zh")
    return {
      title: scenario.titleZh || scenario.title,
      summary: scenario.summaryZh || scenario.summary,
      bossName: scenario.bossNameZh || scenario.bossName,
    };
  return scenario;
}
function applyDisplayLocale(locale) {
  if (!displayCopies[locale]) return;
  displayLocale = locale;
  displayCopy = displayCopies[locale];
  localStorage.setItem("saveJapan.displayLocale", locale);
  document.documentElement.lang = locale === "zh" ? "zh-CN" : locale;
  const text = (id, value) => ($(id).textContent = value);
  const html = (id, value) => ($(id).innerHTML = value);
  text("displayBrand", displayCopy.brand); text("liveLabel", displayCopy.live); text("pilotsLabel", displayCopy.pilots); text("regionsLabel", displayCopy.regions);
  text("problemKicker", displayCopy.problemKicker); html("problemTitle", displayCopy.problemTitle); text("problemCopy", displayCopy.problemCopy);
  text("solutionKicker", displayCopy.solutionKicker); html("solutionTitle", displayCopy.solutionTitle);
  text("experienceKicker", displayCopy.experienceKicker); text("experienceTitle", displayCopy.experienceTitle); html("phaseRow", displayCopy.phaseRow);
  text("openaiKicker", displayCopy.openaiKicker); html("openaiTitle", displayCopy.openaiTitle); text("openaiCopy", displayCopy.openaiCopy);
  text("presentationLabel", displayCopy.presentation); text("qrLabel", displayCopy.qr);
  text("displayDailyRule", displayCopy.dailyRule); text("displayDailyLabel", displayCopy.dailyCountdown);
  text("victoryKicker", displayCopy.victoryKicker); html("displayVictoryTitle", displayCopy.victoryTitle); text("displayVictoryCopy", displayCopy.victoryCopy); text("topPilotsLabel", displayCopy.top); text("builtLabel", displayCopy.built);
  gameQrOverlay.querySelector("strong").textContent = displayCopy.qr;
  document.querySelectorAll("[data-display-locale]").forEach((button) => button.classList.toggle("active", button.dataset.displayLocale === locale));
  render();
}
document.querySelectorAll("[data-display-locale]").forEach((button) => button.addEventListener("click", () => applyDisplayLocale(button.dataset.displayLocale)));
applyDisplayLocale(displayLocale);
const commentLayer = document.createElement("div");
commentLayer.className = "live-comments";
document.body.append(commentLayer);
let commentSequence = 0;
let lastCommentAt = 0;
function liveComment(message, tone = "normal") {
  const now = Date.now();
  if (tone === "normal" && now - lastCommentAt < 2400) return;
  if (tone === "normal" && Math.random() > 0.06) return;
  lastCommentAt = now;
  const item = document.createElement("span");
  item.className = `live-comment ${tone}`;
  item.style.setProperty("--lane", commentSequence++ % 7);
  item.style.setProperty("--speed", `${5.8 + Math.random() * 3}s`);
  item.textContent = message;
  commentLayer.append(item);
  setTimeout(() => item.remove(), 9200);
}
const attackCommentTemplates = [
  (p, n) => `${p}の${n}が素晴らしい反撃！`,
  (p, n) => `${p}代表・${n}、迎撃成功！`,
  (p, n) => `${n}の一撃がUFOを捉えた！`,
  (p) => `${p}からミサイル発射！`,
  (p, n) => `${n}、故郷の元気を力に変えた！`,
  (p) => `${p}防衛隊、ナイスホーミング！`,
  (_p, n) => `${n}の軌道が美しすぎる！`,
  (p) => `${p}の反撃が始まった！`,
  (_p, n) => `${n}、敵の死角を突いた！`,
  (p) => `${p}の元気が日本を守る！`,
  (_p, n) => `${n}のミサイルが直撃！`,
  (p) => `${p}、ここで会心の一撃！`,
  (_p, n) => `${n}、完璧な迎撃コース！`,
  (p) => `${p}から熱い援護射撃！`,
  (_p, n) => `${n}の反撃に会場が沸く！`,
  (p) => `${p}の防衛ラインは崩れない！`,
  (_p, n) => `${n}、日本の空を守り切れ！`,
  (p) => `${p}の一撃が戦況を変える！`,
  (_p, n) => `${n}、そのまま押し切れ！`,
  (p, n) => `${p}の${n}、スーパー迎撃！`,
];
function attackComment(prefecture, nickname = "パイロット") {
  if (displayLocale === "en")
    return `${nickname} from ${prefectureLabel(prefecture)} launches a brilliant counterattack!`;
  if (displayLocale === "zh")
    return `来自${prefectureLabel(prefecture)}的${nickname}发动精彩反击！`;
  const template =
    attackCommentTemplates[
      Math.floor(Math.random() * attackCommentTemplates.length)
    ];
  return template(prefectureLabel(prefecture), nickname);
}
const destroyCommentTemplates = [
  (p, n) => `${p}の${n}がUFO撃破！！`,
  (p, n) => `${n}、${p}の空を守り切った！`,
  (p, n) => `${p}代表${n}、敵機を完全撃破！`,
  (_p, n) => `${n}のホーミングが決まったー！`,
  (p) => `${p}防衛隊、UFOを粉砕！`,
  (p, n) => `${p}の${n}、会心の撃破！`,
  (_p, n) => `${n}が敵機を撃ち落とした！`,
  (p) => `${p}上空の脅威を排除！`,
  (p, n) => `${n}の一撃で${p}に勝利の光！`,
  (_p, n) => `${n}、ナイスキル！！`,
];
function destroyComment(prefecture, nickname = "パイロット") {
  if (displayLocale === "en")
    return `${nickname} from ${prefectureLabel(prefecture)} destroyed a UFO!`;
  if (displayLocale === "zh")
    return `来自${prefectureLabel(prefecture)}的${nickname}击毁了UFO！`;
  const template =
    destroyCommentTemplates[
      Math.floor(Math.random() * destroyCommentTemplates.length)
    ];
  return template(prefectureLabel(prefecture), nickname);
}
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
  document
    .querySelector(".qr-card")
    .classList.toggle("qr-visible", slideIndex > 0);
}
function setDebugMode(enabled) {
  debugMode = Boolean(enabled);
  document.body.classList.toggle("debug-enabled", debugMode);
  if (debugMode) {
    liveComment("DEBUG MODE ENABLED", "impact");
    if (audioReady) SaveJapanAudio.launch();
  }
  render();
}
socket.on("host:debugMode", ({ enabled }) => setDebugMode(enabled));
socket.on("disconnect", () => setDebugMode(false));
window.addEventListener("keydown", (event) => {
  enableAudio();
  if (!event.repeat) socket.emit("host:debugKey", { code: event.code });
  if (["lobby", "login"].includes(state?.phase || "lobby")) {
    if (event.key === "ArrowRight") showSlide(slideIndex + 1);
    if (event.key === "ArrowLeft") showSlide(slideIndex - 1);
  }
  if (event.code === "Space") {
    event.preventDefault();
    if (debugMode && (state?.phase || "lobby") === "lobby") $("start").click();
    else if (debugMode && state?.phase === "boss") debugHomingAttack();
  }
  if (
    debugMode &&
    event.key.toLowerCase() === "d" &&
    ["lobby", "login"].includes(state?.phase || "lobby")
  )
    $("debug60").click();
  if (debugMode && event.key.toLowerCase() === "b") $("boss").click();
  if (debugMode && event.key.toLowerCase() === "x") $("finalFire").click();
  if (event.key.toLowerCase() === "f") toggleFullscreen();
  if (event.key.toLowerCase() === "q") gameQrOverlay.classList.toggle("hidden");
  if (debugMode && event.key.toLowerCase() === "r") $("reset").click();
});
async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch (error) {
    console.warn("Fullscreen unavailable", error);
  }
}
window.addEventListener("pointerdown", (event) => {
  if (
    !debugMode ||
    event.target.closest("button, a, input, select") ||
    !["playing", "boss"].includes(state?.phase)
  )
    return;
  debugHomingAttack();
});
function debugHomingAttack() {
  if (!debugMode) return;
  const joined = state?.prefectures?.map(({ name }) => name) || [];
  const pool = joined.length
    ? joined
    : Object.keys(prefectureCoordinateTable());
  const prefecture = pool[Math.floor(Math.random() * pool.length)];
  if (state?.phase === "playing") {
    socket.emit("host:debugAttack", { prefecture });
    return;
  }
  if (state?.phase === "boss") {
    socket.emit("host:bossAttack", { prefecture });
    return;
  }
  const enemies = [...document.querySelectorAll("[data-enemy-id]")];
  const enemy = enemies[Math.floor(Math.random() * enemies.length)];
  pulseRegion(prefecture);
  firePrefectureBeam(prefecture, enemy?.dataset.enemyId || null);
  if (audioReady) SaveJapanAudio.shoot();
}
const cutin = document.createElement("div");
cutin.className = "join-cutin hidden";
cutin.innerHTML =
  '<img src="/assets/sprites/interceptor-yellow.png" alt=""><div><small>NEW INTERCEPTOR ONLINE</small><strong></strong></div>';
document.body.append(cutin);
let knownPlayers = null;
let previousMission = -1;
let visualPhase = "";
let joinCutinSequence = 0;
const clock = document.createElement("strong");
clock.id = "clock";
clock.textContent = "60s";
document.querySelector(".live").append(clock);
async function enableAudio() {
  if (!audioReady) {
    SaveJapanAudio.init();
    audioReady = true;
  }
}
$("start").onclick = async () => {
  await enableAudio();
  socket.emit("host:start");
};
$("reset").onclick = () => {
  if (audioReady) SaveJapanAudio.stopMusic();
  socket.emit("host:reset");
};
$("debug60").onclick = () => debugMode && socket.emit("host:debug60");
$("boss").onclick = () => debugMode && socket.emit("host:boss");
$("qrToggle").onclick = () => gameQrOverlay.classList.toggle("hidden");
$("finalFire").onclick = () => {
  if (!debugMode) return;
  if (audioReady) SaveJapanAudio.hissatsu();
  socket.emit("host:fire");
};
socket.on("debugStarted", () => {
  $("debug60").textContent = "SIMULATING 60 RANDOM LOGINS…";
});
socket.on("debugLoaded", ({ players }) => {
  const button = $("debug60");
  button.textContent = `SIMULATING… ${players} / 60`;
  if (players >= 60)
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
  $("start").textContent =
    displayLocale === "zh"
      ? "GPT-5.6正在生成任务…"
      : displayLocale === "ja"
        ? "GPT-5.6がミッション生成中…"
        : "GPT-5.6 IS CREATING MISSIONS…";
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
  if (state?.phase === "boss") {
    firePrefectureBeam(prefecture);
    if (audioReady) SaveJapanAudio.explosion();
  }
});
socket.on("enemyHit", ({ id, prefecture, nickname }) => {
  firePrefectureBeam(prefecture, id);
  liveComment(attackComment(prefecture, nickname));
});
socket.on("enemyDestroyed", ({ id, nickname, prefecture }) => {
  const enemy = document.querySelector(`[data-enemy-id="${id}"]`);
  if (!enemy) return;
  if (audioReady) SaveJapanAudio.explosion();
  const space = document.querySelector(".space");
  const enemyRect = enemy.getBoundingClientRect();
  const spaceRect = space.getBoundingClientRect();
  const explosion = document.createElement("img");
  explosion.className = "ufo-explosion";
  explosion.src = "/assets/sprites/explosion-cartoon.png";
  explosion.alt = "";
  explosion.style.left = `${enemyRect.left - spaceRect.left + enemyRect.width / 2}px`;
  explosion.style.top = `${enemyRect.top - spaceRect.top + enemyRect.height / 2}px`;
  $("beamLayer").append(explosion);
  enemy.classList.add("destroyed");
  liveComment(destroyComment(prefecture || "Tokyo", nickname), "impact");
  setTimeout(() => enemy.remove(), 520);
  setTimeout(() => explosion.remove(), 900);
});
socket.on("enemyAttack", ({ region }) => fireEnemyLaser(region));
socket.on("bossCritical", () => {
  liveComment(
    displayLocale === "zh"
      ? "就是现在！全员发动必杀攻击！"
      : displayLocale === "en"
        ? "NOW! EVERYONE LAUNCH THE FINAL ATTACK!"
        : "今だ！全員で必殺攻撃を発射！！",
    "danger",
  );
  if (audioReady) SaveJapanAudio.hissatsu();
  document.body.animate(
    [
      { filter: "brightness(1)" },
      { filter: "brightness(3) saturate(2)" },
      { filter: "brightness(1)" },
    ],
    { duration: 900 },
  );
  const hud = $("bossHud");
  hud.animate(
    [
      { transform: "translateX(-50%) scale(1)" },
      { transform: "translateX(-50%) scale(1.35)" },
      { transform: "translateX(-50%) scale(1)" },
    ],
    { duration: 800 },
  );
});
socket.on("bossDefeatSequence", showBossDefeatSequence);
socket.on("bossDefeated", () => {
  document.body.classList.add("result-reveal");
  if (audioReady) SaveJapanAudio.victory();
  setTimeout(() => document.body.classList.remove("result-reveal"), 4200);
});
function showBossDefeatSequence() {
  if (audioReady) SaveJapanAudio.hissatsu();
  const finale = document.createElement("div");
  finale.className = "boss-finale";
  document.body.append(finale);
  let blast = 0;
  const explosions = setInterval(() => {
    const image = document.createElement("img");
    image.src = "/assets/sprites/explosion-cartoon.png";
    image.style.left = `${35 + Math.random() * 30}%`;
    image.style.top = `${8 + Math.random() * 32}%`;
    image.style.setProperty("--blast-size", `${90 + Math.random() * 150}px`);
    image.style.setProperty("--blast-rotate", `${-25 + Math.random() * 50}deg`);
    finale.append(image);
    if (audioReady && blast % 3 === 0) SaveJapanAudio.explosion();
    setTimeout(() => image.remove(), 1100);
    blast += 1;
    if (blast >= 30) clearInterval(explosions);
  }, 125);
  setTimeout(() => finale.classList.add("whiteout"), 3650);
  setTimeout(() => finale.remove(), 5350);
}
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
socket.on("phaseChange", ({ phase }) => {
  if (phase === "bossWarning") showApproachWarning();
  if (phase === "boss") showBossCutin();
});
function showApproachWarning() {
  liveComment(
    displayLocale === "zh"
      ? "巨型敌舰正在接近！！！"
      : displayLocale === "en"
        ? "A GIANT BATTLESHIP IS APPROACHING!"
        : "でかいの来たぞ！！！",
    "danger",
  );
  if (audioReady) SaveJapanAudio.alert();
  cutin.classList.add("approach-cutin");
  cutin.querySelector("small").textContent = "⚠ EMERGENCY TRANSMISSION";
  cutin.querySelector("strong").innerHTML =
    `<span class="approach-message warning-only">WARNING</span><b>${displayLocale === "zh" ? "首领来袭！" : displayLocale === "en" ? "BOSS ATTACK!" : "ボス襲撃！"}</b>`;
  let ticker = cutin.querySelector("em");
  if (ticker)
    ticker.textContent =
      "UNKNOWN ENERGY SIGNATURE · MAXIMUM THREAT LEVEL · BRACE FOR IMPACT";
  cutin.classList.remove("hidden", "animate");
  void cutin.getBoundingClientRect();
  cutin.classList.add("animate");
  document.body.classList.add("boss-warning");
  setTimeout(() => {
    cutin.classList.add("hidden");
    cutin.classList.remove("approach-cutin");
    document.body.classList.remove("boss-warning");
  }, 3600);
}
function showBossCutin() {
  liveComment(
    displayLocale === "zh"
      ? "汇聚所有人的元气！"
      : displayLocale === "en"
        ? "UNITE EVERYONE'S GENKI!"
        : "みんなの元気をひとつに！",
    "impact",
  );
  if (audioReady) SaveJapanAudio.alert();
  cutin.classList.add("boss-cutin");
  cutin.querySelector("small").textContent = "⚠ WARNING · GIANT UFO DETECTED";
  cutin.querySelector("strong").textContent =
    displayLocale === "zh"
      ? "首领来袭！"
      : displayLocale === "en"
        ? "BOSS ATTACK!"
        : "ボス襲撃！";
  let ticker = cutin.querySelector("em");
  if (ticker)
    ticker.textContent =
      displayLocale === "zh"
        ? "汇聚全国元气，全员发动必杀攻击！"
        : displayLocale === "en"
          ? "Gather nationwide GENKI. Everyone launch the final attack!"
          : "全国の元気を集めろ。全員で必殺攻撃を発射！";
  cutin.classList.remove("hidden", "animate");
  void cutin.getBoundingClientRect();
  cutin.classList.add("animate");
  document.body.classList.add("boss-warning");
  setTimeout(() => {
    cutin.classList.add("hidden");
    cutin.classList.remove("boss-cutin");
    cutin.querySelector("small").textContent = "NEW INTERCEPTOR ONLINE";
    document.body.classList.remove("boss-warning");
  }, 2800);
}
function formatDailyCountdown(milliseconds) {
  const total = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
function renderDailyStatus() {
  if (!state) return;
  const active = ["playing", "bossWarning", "boss", "bossDefeat"].includes(
    state.phase,
  );
  const scenario = localizedScenario(state.scenario);
  $("displayDailyLabel").textContent = active
    ? displayCopy.dailyLive
    : displayCopy.dailyCountdown;
  $("displayDailyCountdown").textContent = active
    ? "LIVE"
    : formatDailyCountdown(
        state.schedule.nextStartAt - (Date.now() + clockOffset),
      );
  $("displayScenarioTitle").textContent = scenario.title;
  $("displayScenarioSummary").textContent = scenario.summary;
}
setInterval(() => {
  renderDailyStatus();
  if (["login", "playing", "bossWarning", "boss"].includes(state?.phase)) {
    const left = Math.max(
      0,
      Math.ceil((state.endsAt - (Date.now() + clockOffset)) / 1000),
    );
    clock.textContent = `${left}s`;
    clock.classList.toggle("urgent", left <= 10);
    document.body.classList.toggle(
      "final-ten",
      state?.phase === "boss" && left <= 10,
    );
  } else {
    document.body.classList.remove("final-ten");
  }
}, 100);
function render() {
  if (!state) return;
  renderDailyStatus();
  $("playerCount").textContent = state.players;
  $("regionCount").textContent = state.prefectures.length;
  clock.classList.toggle(
    "hidden",
    !["login", "playing", "bossWarning", "boss"].includes(state.phase),
  );
  $("lobby").classList.toggle(
    "hidden",
    !["lobby", "login"].includes(state.phase),
  );
  $("battle").classList.toggle(
    "hidden",
    !["playing", "bossWarning", "boss", "bossDefeat"].includes(state.phase),
  );
  $("victory").classList.toggle("hidden", state.phase !== "victory");
  $("start").classList.toggle(
    "hidden",
    state.phase !== "lobby" || !debugMode,
  );
  $("reset").classList.toggle("hidden", !debugMode);
  $("debug60").classList.toggle(
    "hidden",
    !["lobby", "login"].includes(state.phase),
  );
  $("start").disabled = false;
  $("start").innerHTML = `<kbd>SPACE</kbd> ${displayCopy.start}`;
  if (["lobby", "login"].includes(state.phase)) {
    $("recent").innerHTML = state.recentPlayers
      .slice(0, 8)
      .map(
        (p) =>
          `<span class="chip">🚀 <b>${safe(p.nickname)}</b> · ${prefectureLabel(p.prefecture)}</span>`,
      )
      .join("");
  }
  if (["playing", "boss", "bossDefeat"].includes(state.phase)) {
    updateEnemyVisuals();
    renderPrefectureMarkers();
    const m = state.missions[state.missionIndex];
    const missionCopy = localizedMission(m, state.missionIndex);
    const scenarioCopy = localizedScenario(state.scenario);
    $("bossLabel").textContent = scenarioCopy.bossName
      ? `⚠ ${scenarioCopy.bossName}`
      : displayCopy.boss;
    $("missionNumber").textContent = ["boss", "bossDefeat"].includes(
      state.phase,
    )
      ? displayCopy.finalPhase
      : `${displayCopy.mission} ${state.missionIndex + 1} ${displayCopy.of}`;
    $("missionIcon").textContent = m.icon;
    $("missionTitle").textContent = missionCopy.title;
    $("missionBrief").textContent = missionCopy.brief;
    $("score").textContent = ["boss", "bossDefeat"].includes(state.phase)
      ? state.genki
      : state.missionScore;
    $("target").textContent = ["boss", "bossDefeat"].includes(state.phase)
      ? `/ ${state.genkiTarget} ${displayCopy.genki}`
      : `/ ${state.missionTarget} ${displayCopy.energy}`;
    $("progressBar").style.width =
      `${Math.min(100, ["boss", "bossDefeat"].includes(state.phase) ? (state.genki / state.genkiTarget) * 100 : (state.missionScore / state.missionTarget) * 100)}%`;
    $("regions").innerHTML = state.prefectures
      .map(
        (r) =>
          `<span class="region">${prefectureLabel(r.name)} ×${r.count}</span>`,
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
          `<span class="ship" title="${safe(p.nickname)} · ${prefectureLabel(p.prefecture)}" style="animation-delay:${(i % 7) * 0.12}s"><img src="/assets/sprites/interceptor-${["yellow", "green", "red", "purple"][i % 4]}.png" alt=""><small><b>${safe(p.nickname)}</b><br>${prefectureLabel(p.prefecture)}</small></span>`,
      )
      .join("");
  }
  if (state.phase === "victory") {
    $("displayStats").textContent =
      displayLocale === "zh"
        ? `${state.players}名飞行员 · ${state.prefectures.length}个地区 · 同一个日本`
        : displayLocale === "ja"
          ? `${state.players} PILOTS · ${state.prefectures.length} 都道府県 · ONE JAPAN`
          : `${state.players} PILOTS · ${state.prefectures.length} REGIONS · ONE JAPAN`;
    $("leaderboard").innerHTML = state.leaderboard
      .slice(0, 5)
      .map(
        (player, index) =>
          `<li class="rank-${index + 1}"><b><i>${["🏆", "🥈", "🥉"][index] || index + 1}</i>${safe(player.nickname)}</b><span>${prefectureLabel(player.prefecture)} · UFO ${player.ufoKills ?? 0} / BOSS ${player.bossDamage ?? 0}</span><strong>${player.score ?? 0}</strong></li>`,
      )
      .join("");
  }
  updateActiveRegions();
}
function updateEnemyVisuals() {
  const space = document.querySelector(".space");
  space.classList.toggle("game-mode", state.phase === "playing");
  space.classList.toggle(
    "boss-mode",
    ["boss", "bossDefeat"].includes(state.phase),
  );
  space.classList.toggle("incoming-mode", state.phase === "bossWarning");
  $("bossHud").classList.toggle(
    "hidden",
    !["boss", "bossDefeat"].includes(state.phase),
  );
  if (["boss", "bossDefeat"].includes(state.phase)) {
    const hp = Math.max(0, 100 - (state.genki / state.genkiTarget) * 100);
    $("bossHp").style.width = `${hp}%`;
  }
  const phaseChanged = visualPhase !== state.phase;
  visualPhase = state.phase;
  if (state.phase === "boss" && phaseChanged) {
    const hud = $("bossHud");
    hud.classList.remove("boss-hud-arrival");
    void hud.getBoundingClientRect();
    hud.classList.add("boss-hud-arrival");
  }
  const fleet = $("enemyFleet");
  if (state.phase !== "playing") {
    fleet.replaceChildren();
    return;
  }
  const activeIds = new Set(state.enemies.map((enemy) => String(enemy.id)));
  fleet.querySelectorAll(".enemy-unit").forEach((unit) => {
    if (!activeIds.has(unit.dataset.enemyId)) unit.remove();
  });
  state.enemies.forEach((enemy, index) => {
    let unit = fleet.querySelector(`[data-enemy-id="${enemy.id}"]`);
    if (!unit) {
      unit = document.createElement("span");
      unit.className = "enemy-unit";
      unit.dataset.enemyId = enemy.id;
      const sprite = ["ufo-scout", "ufo-scanner", "ufo-heavy"][enemy.id % 3];
      unit.innerHTML = `<img src="/assets/sprites/${sprite}.png" alt="Enemy UFO"><i><b></b></i>`;
      fleet.append(unit);
    }
    unit.style.left = `${5 + enemy.lane * 86}%`;
    unit.style.top = `${2 + (index % 3) * 24}%`;
    unit.style.setProperty("--i", index);
    unit.querySelector("i b").style.width =
      `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%`;
  });
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
function firePrefectureBeam(prefecture, enemyId = null) {
  const position = prefecturePosition(prefecture);
  const space = document.querySelector(".space");
  const map = $("japanMap");
  const layer = $("beamLayer");
  if (!space || !map || !layer) return;
  const spaceRect = space.getBoundingClientRect();
  const mapRect = mapContentRect(map);
  const startX = mapRect.left - spaceRect.left + mapRect.width * position[0];
  const startY = mapRect.top - spaceRect.top + mapRect.height * position[1];
  const enemy = enemyId
    ? document.querySelector(`[data-enemy-id="${enemyId}"]`)
    : null;
  const enemyRect = enemy?.getBoundingClientRect();
  const targetX = enemyRect
    ? enemyRect.left - spaceRect.left + enemyRect.width / 2
    : spaceRect.width * 0.5;
  const targetY = enemyRect
    ? enemyRect.top - spaceRect.top + enemyRect.height / 2
    : spaceRect.height * 0.16;
  const pulse = document.createElement("span");
  pulse.className = "prefecture-blast";
  pulse.style.left = `${startX}px`;
  pulse.style.top = `${startY}px`;
  pulse.innerHTML = `<b>${prefectureLabel(prefecture)}</b>`;
  const missile = document.createElement("i");
  missile.className = "homing-missile";
  const direction = startX < targetX ? 1 : -1;
  const jitter = () => (Math.random() - 0.5) * 190;
  const lift = Math.min(startY, targetY);
  missile.style.setProperty("--flight-time", `${0.72 + Math.random() * 0.55}s`);
  missile.style.offsetPath = `path("M ${startX} ${startY} C ${startX + direction * (90 + Math.random() * 160)} ${startY + jitter()} ${startX + jitter()} ${lift - 30 - Math.random() * 130} ${startX + (targetX - startX) * 0.48} ${lift + jitter()} S ${targetX + jitter()} ${targetY + jitter() * 0.25} ${targetX} ${targetY}")`;
  layer.append(pulse, missile);
  setTimeout(() => {
    pulse.remove();
    missile.remove();
  }, 1400);
}
function fireEnemyLaser(region) {
  const representatives = {
    hokkaido: "Hokkaido",
    tohoku: "Miyagi",
    kanto: "Tokyo",
    chubu: "Aichi",
    kinki: "Osaka",
    chugoku: "Hiroshima",
    shikoku: "Ehime",
    kyushu: "Fukuoka",
  };
  const target = prefecturePosition(representatives[region] || "Tokyo");
  const space = document.querySelector(".space");
  const map = $("japanMap");
  const layer = $("beamLayer");
  if (!space || !map || !layer) return;
  const spaceRect = space.getBoundingClientRect();
  const mapRect = mapContentRect(map);
  const endX = mapRect.left - spaceRect.left + mapRect.width * target[0];
  const endY = mapRect.top - spaceRect.top + mapRect.height * target[1];
  const startX = spaceRect.width * (0.12 + Math.random() * 0.76);
  const startY = -10;
  const length = Math.hypot(endX - startX, endY - startY);
  const angle = (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI;
  const laser = document.createElement("i");
  laser.className = "enemy-laser";
  laser.style.cssText = `left:${startX}px;top:${startY}px;width:${length}px;transform:rotate(${angle}deg)`;
  const impact = document.createElement("i");
  impact.className = "enemy-impact";
  impact.style.cssText = `left:${endX}px;top:${endY}px`;
  layer.append(laser, impact);
  setTimeout(() => {
    laser.remove();
    impact.remove();
  }, 700);
}
function renderPrefectureMarkers() {
  const space = document.querySelector(".space");
  const map = $("japanMap");
  const layer = $("beamLayer");
  if (!space || !map || !layer) return;
  const spaceRect = space.getBoundingClientRect();
  const mapRect = mapContentRect(map);
  const active = new Set(state.prefectures.map(({ name }) => name));
  let markerLayer = $("prefectureMarkers");
  if (!markerLayer) {
    markerLayer = document.createElement("div");
    markerLayer.id = "prefectureMarkers";
    markerLayer.className = "prefecture-markers";
    layer.prepend(markerLayer);
  }
  markerLayer.innerHTML = Object.entries(prefectureCoordinateTable())
    .map(([name, [x, y]]) => {
      const left = mapRect.left - spaceRect.left + mapRect.width * x;
      const top = mapRect.top - spaceRect.top + mapRect.height * y;
      return `<i class="prefecture-marker ${active.has(name) ? "online" : ""}" style="left:${left}px;top:${top}px" title="${prefectureLabel(name)}"></i>`;
    })
    .join("");
}
function mapContentRect(map) {
  const box = map.getBoundingClientRect();
  const ratio =
    map.naturalWidth && map.naturalHeight
      ? map.naturalWidth / map.naturalHeight
      : 0.8;
  const width = Math.min(box.width, box.height * ratio);
  const height = width / ratio;
  return {
    left: box.left + (box.width - width) / 2,
    top: box.top + (box.height - height) / 2,
    width,
    height,
  };
}
function prefecturePosition(prefecture) {
  const coordinates = prefectureCoordinateTable();
  return coordinates[prefecture] || [0.58, 0.52];
}
function prefectureCoordinateTable() {
  return {
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
  players.forEach((player, index) => {
    setTimeout(() => showPlayerCutin(player), index * 110);
  });
  [...new Set(players.map((player) => player.prefecture))].forEach(pulseRegion);
}
function showPlayerCutin(player) {
  const sequence = joinCutinSequence++;
  const lane = sequence % 4;
  const item = document.createElement("div");
  item.className = `join-cutin multi ${sequence % 2 ? "from-right" : "from-left"}`;
  item.style.top = `${96 + lane * 66}px`;
  const joinMessage =
    displayLocale === "en"
      ? `${safe(player.nickname)} joins from ${prefectureLabel(player.prefecture)}!`
      : displayLocale === "zh"
        ? `${safe(player.nickname)}从${prefectureLabel(player.prefecture)}加入战斗！`
        : `${safe(player.nickname)} が ${prefectureLabel(player.prefecture)}から参戦！`;
  item.innerHTML = `<img src="/assets/sprites/interceptor-${["yellow", "green", "red", "purple"][joinCutinSequence % 4]}.png" alt=""><div><small>INTERCEPTOR ONLINE</small><strong>${joinMessage}</strong></div>`;
  document.body.append(item);
  pulseRegion(player.prefecture);
  setTimeout(() => item.remove(), 2100);
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
function prefectureLabel(prefecture) {
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
  if (displayLocale === "en") return prefecture;
  const label = names[prefecture] || prefecture;
  if (displayLocale !== "zh") return label;
  return label
    .replaceAll("県", "县")
    .replaceAll("宮", "宫")
    .replaceAll("島", "岛")
    .replaceAll("馬", "马")
    .replaceAll("葉", "叶")
    .replaceAll("東", "东")
    .replaceAll("長", "长")
    .replaceAll("静", "静")
    .replaceAll("岡", "冈")
    .replaceAll("愛", "爱")
    .replaceAll("賀", "贺")
    .replaceAll("庫", "库")
    .replaceAll("鳥", "鸟")
    .replaceAll("広", "广")
    .replaceAll("徳", "德")
    .replaceAll("児", "儿")
    .replaceAll("沖", "冲")
    .replaceAll("縄", "绳");
}
function safe(s) {
  const e = document.createElement("span");
  e.textContent = s;
  return e.innerHTML;
}
