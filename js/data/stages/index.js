// 全ステージの集約。ジャンルのファイルを追加したらここに import を足す（README「ステージ追加手順」）
import varStages from "./var.js";
import condStages from "./cond.js";
import loopStages from "./loop.js";
import arrStages from "./arr.js";

export const STAGES = [...varStages, ...condStages, ...loopStages, ...arrStages];

const byId = new Map(STAGES.map((s) => [s.id, s]));

export function getStage(id) {
  return byId.get(id) || null;
}

export function stageFor(genre, level) {
  return byId.get(`${genre}-${level}`) || null;
}
