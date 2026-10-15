// セーブ/ロード、コイン、星、解放状態、設定（§9.5）
const KEY = "algoquest.save.v2";
const VERSION = 2;

export const REWARD_BY_LEVEL = { 1: 20, 2: 25, 3: 30, 4: 40, 5: 50 };
export const NO_MISS_BONUS = 10;
export const HINT_COSTS = [10, 20, 30];

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
    settings: { fast: false, reduceMotion: prefersReducedMotion(), codeView: "ja", sound: true, volume: 0.7 },
    tutorialSeen: false,
    lastLoginDate: null,
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
    hasSave = true;
  } catch (e) {
    console.warn("[algoquest] セーブデータが不明/破損のため初期化しました。", e);
    data = defaultSave();
    hasSave = false;
    persist();
  }
  return data;
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
