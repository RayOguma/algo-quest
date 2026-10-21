// ステージデータを書きやすくするための小さなヘルパー（イベントを作るだけで、ロジックは持たない）

export const line = (n) => ({ type: "line", n });

/** 同じ向きに k マス移動 */
export const moves = (dir, k = 1) => Array.from({ length: k }, () => ({ type: "move", dir }));

export const spawn = (id, value, x, y) => ({ type: "spawnItem", id, value, x, y });
export const spawnOnPad = (id, value, pad) => ({ type: "spawnItem", id, value, pad });
export const pickup = (id) => ({ type: "pickup", id });
export const takeCopy = (box, id) => ({ type: "takeCopy", box, id });
export const put = (id, target) => ({ type: "put", id, target });
export const calc = (expr, result, id) => ({ type: "calc", expr, result, id });
export const compare = (expr, result) => ({ type: "compare", expr, result });
export const store = (id, box) => ({ type: "store", id, box });
export const emote = (name) => ({ type: "emote", name });
export const wait = (ms) => ({ type: "wait", ms });
export const end = () => ({ type: "end" });

export const mismatch = (reason = "あれ？ けんざんが あわない…") => ({ type: "fail", kind: "mismatch", reason });
export const lockFail = (box, reason = "ロックが あかない…") => ({ type: "fail", kind: "lock", box, reason });

/**
 * 「アルゴくんが値を運ぶ」イベント列を作る道具（ステージごとに1つ作る）。
 * field.spawn（無ければ start）を、新しい値のクリスタルが出る場所に使う。
 * ※ 計算や判定の答え（result）はステージ側で書き、検証スクリプトが照合する。
 */
export function builder(field) {
  let n = 0;
  const id = (p) => `${p}${++n}`;
  const at = field.spawn || field.start;
  /** 台の上に材料を並べる（数＝新しいクリスタル、文字列＝変数・配列要素のコピー） */
  const lay = (operands, pad) => {
    const ev = [];
    for (const o of operands) {
      if (typeof o === "number") ev.push(spawnOnPad(id("k"), o, pad));
      else {
        const c = id("c");
        ev.push(takeCopy(o, c), put(c, pad));
      }
    }
    return ev;
  };
  return {
    /** box ← 定数 */
    set(box, value) {
      const k = id("k");
      return [spawn(k, value, at.x, at.y), pickup(k), store(k, box)];
    },
    /** dst ← src（値のコピーを運ぶ） */
    copy(dst, src) {
      const c = id("c");
      return [takeCopy(src, c), store(c, dst)];
    },
    /** dst ← 式（計算台で計算して運ぶ） */
    calc(dst, operands, expr, result) {
      const r = id("r");
      return [...lay(operands, "calc"), calc(expr, result, r), pickup(r), store(r, dst)];
    },
    /** 比較台で判定（ランプが点く） */
    cmp(operands, expr, result) {
      return [...lay(operands, "compare"), compare(expr, result)];
    },
  };
}

/** フィールド定義の省略形（tiles を省くと全部「道」） */
export function mkField(o) {
  return {
    tiles: Array.from({ length: o.rows }, () => ".".repeat(o.cols)),
    boxes: [],
    pads: [],
    items: [],
    arrays: [],
    switches: [],
    doors: [],
    stacks: [],
    queues: [],
    ...o,
  };
}

/**
 * 変数ボックス・計算台・比較台・配列を自動で並べたフィールド（新しいステージ用）。
 * vars：ボックスにする変数（1〜5個）、arrays：[{ name, values }]（0〜2個、要素は6個まで）
 */
export function autoField(vars, { compare = false, calc = true, arrays = [] } = {}) {
  const n = vars.length;
  if (!arrays.length) {
    const rows = n <= 3 ? 5 : n + 2;
    const cy = n <= 3 ? 2 : 3; // スタートと台の行
    const ys = n === 1 ? [2] : n === 2 ? [1, 3] : n === 3 ? [0, 2, 4] : vars.map((_, i) => i + 1);
    const pads = [];
    if (calc) pads.push({ kind: "calc", x: 3, y: cy - 1, access: { x: 3, y: cy } });
    if (compare) pads.push({ kind: "compare", x: 3, y: cy + 1, access: { x: 3, y: cy } });
    return mkField({
      cols: 8,
      rows,
      start: { x: 2, y: cy, dir: "right" },
      spawn: { x: 1, y: cy },
      boxes: vars.map((v, i) => ({ var: v, x: 6, y: ys[i], access: { x: 5, y: ys[i] } })),
      pads,
    });
  }
  // 配列あり：1つめは上の行、2つめは下の行（上から操作）
  const len = Math.max(...arrays.map((a) => a.values.length));
  const cols = Math.max(9, len + 4);
  const rows = arrays.length > 1 || n > 3 ? 7 : 6;
  const ys = n <= 3 ? [1, 3, 5].slice(0, n) : vars.map((_, i) => i + 1);
  const pads = [];
  if (compare) pads.push({ kind: "compare", x: 3, y: 3, access: { x: 3, y: 2 } });
  if (calc) pads.push({ kind: "calc", x: 5, y: 3, access: { x: 5, y: 4 } });
  return mkField({
    cols,
    rows,
    start: { x: 1, y: 3, dir: "right" },
    spawn: { x: 4, y: 2 },
    arrays: arrays.map((a, i) => (i === 0 ? { name: a.name, x: 1, y: 0, values: a.values } : { name: a.name, x: 1, y: rows - 1, values: a.values, access: "up" })),
    boxes: vars.map((v, i) => ({ var: v, x: cols - 2, y: ys[i], access: { x: cols - 3, y: ys[i] } })),
    pads,
  });
}
