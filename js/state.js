// セーブ/ロード、コイン、星、解放状態、設定（§9.5）
const KEY = "algoquest.save.v2";
const VERSION = 2;

export const REWARD_BY_LEVEL = { 1: 20, 2: 25, 3: 30, 4: 40, 5: 50, 6: 30, 7: 35, 8: 40, 9: 50, 10: 60 };
export const NO_MISS_BONUS = 10;
export const HINT_COSTS = [10, 20, 30];
// 「ここまで進める」で最後まで見たときのコイン（途中までなら、実行する行の数に応じて按分）
export const PEEK_FULL_COST = { 1: 30, 2: 35, 3: 40, 4: 45, 5: 50, 6: 30, 7: 35, 8: 40, 9: 45, 10: 50 };
export const SPEEDS = [1, 2, 4];
// ログインボーナス：はじめての日は100、その後は日付が変わるごとに 連続日数に応じて 10〜50
export const FIRST_LOGIN_BONUS = 100;
export const DAILY_BONUS = [10, 20, 30, 40, 50];
// 設定の改訂番号（上げると load 時に一度だけ移行処理をする）
const SETTINGS_REV = 2;

function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function defaultSave() {
  return {
    version: VERSION,
    coins: 0,
    stages: {},
    settings: { speed: 1, reduceMotion: prefersReducedMotion(), codeView: "code", sound: true, volume: 0.7, rev: SETTINGS_REV },
    tutorialSeen: false,
    lastLoginDate: null,
    loginStreak: 0,
    memos: {},
  };
}

let data = defaultSave();
let hasSave = false;
const listeners = new Set();

export function load() {
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch (e) {
    console.warn("[algoquest] localStorage が使えません。進行は保存されません。", e);
  }
  if (!raw) {
    data = defaultSave();
    hasSave = false;
    return data;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== VERSION) throw new Error("unknown version " + (parsed && parsed.version));
    const base = defaultSave();
    data = {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...(parsed.settings || {}) },
      stages: parsed.stages && typeof parsed.stages === "object" ? parsed.stages : {},
    };
    if (typeof data.coins !== "number" || !isFinite(data.coins) || data.coins < 0) data.coins = 0;
    if (!data.memos || typeof data.memos !== "object") data.memos = {};
    migrateSettings(parsed.settings || {});
    hasSave = true;
  } catch (e) {
    console.warn("[algoquest] セーブデータが不明/破損のため初期化しました。", e);
    data = defaultSave();
    hasSave = false;
    persist();
  }
  return data;
}

/** 古い設定の移行（一度だけ） */
function migrateSettings(old) {
  const s = data.settings;
  if ((old.rev || 1) >= SETTINGS_REV) return; // 既定値の rev が混ざるので、保存されていた方で判定する
  // 2倍速の ON/OFF → 速さ（1/2/4倍）
  if (old.speed === undefined) s.speed = old.fast ? 2 : 1;
  delete s.fast;
  // はじめの表示は疑似コードに変えた（日本語は分かりにくい人が切り替えて見る）
  s.codeView = "code";
  s.rev = SETTINGS_REV;
  persist();
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("[algoquest] 保存に失敗しました。", e);
  }
}

export function save() {
  hasSave = true;
  persist();
  listeners.forEach((fn) => fn(data));
}

export function onChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function get() {
  return data;
}

export function saveExists() {
  return hasSave;
}

export function settings() {
  return data.settings;
}

export function setSetting(key, value) {
  data.settings[key] = value;
  save();
}

export function coins() {
  return data.coins;
}

export function stageRec(id) {
  return (
    data.stages[id] || { cleared: false, stars: 0, mistakes: 0, hintsUsed: [false, false, false], freeHint1Used: false }
  );
}

function ensureRec(id) {
  if (!data.stages[id]) data.stages[id] = stageRec(id);
  return data.stages[id];
}

/** ジャンル内はレベル順に解放（Lv1は常に解放） */
export function isUnlocked(genre, level) {
  if (level <= 1) return true;
  return stageRec(`${genre}-${level - 1}`).cleared;
}

export function starsFor(mistakes) {
  return mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1;
}

/** クリアを記録し、獲得コインと星を返す */
export function recordClear(stage, mistakes) {
  const rec = ensureRec(stage.id);
  const first = !rec.cleared;
  const stars = starsFor(mistakes);
  let earned = 0;
  let bonus = 0;
  if (first) {
    earned = REWARD_BY_LEVEL[stage.level] || 20;
    if (mistakes === 0) bonus = NO_MISS_BONUS;
  }
  rec.cleared = true;
  const improved = stars > (rec.stars || 0);
  rec.stars = Math.max(rec.stars || 0, stars);
  rec.mistakes = first ? mistakes : Math.min(rec.mistakes ?? mistakes, mistakes);
  data.coins += earned + bonus;
  save();
  return { first, stars, bestStars: rec.stars, improved, earned, bonus };
}

/** 次に開けるヒントの番号(0〜2)とコスト。全部開いていれば null */
export function nextHint(id) {
  const rec = stageRec(id);
  const idx = rec.hintsUsed.findIndex((u) => !u);
  if (idx < 0) return null;
  const cost = idx === 0 && !rec.freeHint1Used ? 0 : HINT_COSTS[idx];
  return { idx, cost };
}

export function buyHint(id) {
  const h = nextHint(id);
  if (!h) return { ok: false, reason: "all" };
  if (data.coins < h.cost) return { ok: false, reason: "coins", need: h.cost };
  const rec = ensureRec(id);
  data.coins -= h.cost;
  rec.hintsUsed[h.idx] = true;
  if (h.idx === 0) rec.freeHint1Used = true;
  save();
  return { ok: true, idx: h.idx, cost: h.cost };
}

/** 実演の速さ（1/2/4） */
export function speed() {
  const v = Number(data.settings.speed);
  return SPEEDS.includes(v) ? v : 1;
}

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * ログインボーナス。今日まだ受け取っていなければ付与して { amount, first, streak } を返す（受け取り済みなら null）。
 * 連続ログインの日数で 10→20→…→50（6日目以降も50）。1日でも空くと 10 に戻る。
 */
export function claimLoginBonus(now = new Date()) {
  const today = dateKey(now);
  if (data.lastLoginDate === today) return null;
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  const first = !data.lastLoginDate;
  data.loginStreak = !first && data.lastLoginDate === dateKey(y) ? (data.loginStreak || 1) + 1 : 1;
  const amount = first ? FIRST_LOGIN_BONUS : DAILY_BONUS[Math.min(data.loginStreak, DAILY_BONUS.length) - 1];
  data.lastLoginDate = today;
  data.coins += amount;
  save();
  return { amount, first, streak: data.loginStreak };
}

/** メモ（ステージごと）：{ vars: { 変数名: 文字列 }, free: 文字列 } */
export function memo(id) {
  const m = data.memos[id] || {};
  return { vars: { ...(m.vars || {}) }, free: m.free || "" };
}

export function setMemo(id, m) {
  const empty = !m.free && !Object.values(m.vars || {}).some(Boolean);
  if (empty) delete data.memos[id];
  else data.memos[id] = { vars: { ...m.vars }, free: m.free };
  persist(); // コイン表示などの更新は不要なので通知しない
}

/**
 * 「ここまで進める」のコイン。steps＝見たい所までに実行する行の数、total＝最後までの行の数。
 * 一度コインを払って見た所（peekPaid）までは無料で、その先の分だけ払う。クリア済みのステージは無料。
 */
export function peekCost(stage, steps, total) {
  const rec = stageRec(stage.id);
  if (rec.cleared) return 0;
  const paid = rec.peekPaid || 0;
  if (steps <= paid) return 0;
  const full = PEEK_FULL_COST[stage.level] || 40;
  return Math.max(1, Math.ceil((full * (steps - paid)) / Math.max(1, total)));
}

export function buyPeek(stage, steps, total) {
  const cost = peekCost(stage, steps, total);
  if (data.coins < cost) return { ok: false, need: cost };
  const rec = ensureRec(stage.id);
  data.coins -= cost;
  rec.peekPaid = Math.max(rec.peekPaid || 0, steps);
  save();
  return { ok: true, cost };
}

export function setTutorialSeen() {
  data.tutorialSeen = true;
  save();
}

export function resetAll() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  data = defaultSave();
  hasSave = false;
  listeners.forEach((fn) => fn(data));
}
