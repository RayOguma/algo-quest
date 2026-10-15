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
    /** 値を問う誤答：その値を持ってきて検算ロックではじかれる */
    claim(box, value, reason) {
      const k = id("k");
      return [spawn(k, value, at.x, at.y), pickup(k), lockFail(box, reason)];
    },
    /** 変数の今の値を持って検算ロックではじかれる */
    claimCopy(box, src, reason) {
      const c = id("c");
      return [takeCopy(src, c), lockFail(box, reason)];
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
