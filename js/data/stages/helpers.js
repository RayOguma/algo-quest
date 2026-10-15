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
