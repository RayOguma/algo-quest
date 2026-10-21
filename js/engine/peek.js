// 「ここまで 進める」：処理の行を選ぶと、正しい処理（stage.events）をその所まで実演する。
// どこで止めるか・何回目の くりかえしか・何行分 実行するか を、疑似コードの形（if/for/while の範囲）から求める。
// ※ 処理の中身は解釈しない（イベント列の line と、その時点の変数の値を見るだけ）。
import { World } from "./world.js";

/** 疑似コードの if / for / while の範囲を求める（行番号は1始まり） */
export function programBlocks(stage) {
  const blocks = [];
  const stack = [];
  stage.program.code.forEach((raw, i) => {
    const n = i + 1;
    const t = raw.trim();
    let m;
    if (/^if\b/.test(t)) stack.push({ type: "if", start: n });
    else if (/^endif\b/.test(t)) close("if", n);
    else if ((m = /^for\s*\(\s*([A-Za-z_]\w*)/.exec(t))) stack.push({ type: "loop", kind: "for", var: m[1], start: n });
    else if (/^while\b/.test(t)) stack.push({ type: "loop", kind: "while", start: n });
    else if (/^end(for|while)\b/.test(t)) close("loop", n);
  });
  function close(type, n) {
    for (let k = stack.length - 1; k >= 0; k--) {
      if (stack[k].type !== type) continue;
      const b = stack.splice(k, 1)[0];
      b.end = n;
      blocks.push(b);
      return;
    }
  }
  return blocks.sort((a, b) => a.start - b.start);
}

/**
 * 行 n を選んだときに まとめて進める範囲。
 * if 文の中の行なら、その if 文（いちばん内側の くりかえしの中で いちばん外側の if）全体を1つの処理として扱う。
 */
export function peekUnit(stage, n, blocks = programBlocks(stage)) {
  const around = blocks.filter((b) => b.start <= n && n <= b.end);
  const loops = around.filter((b) => b.type === "loop");
  const inner = loops[loops.length - 1];
  const ifs = around.filter((b) => b.type === "if" && (!inner || b.start > inner.start));
  const unit = ifs.length ? { kind: "if", start: ifs[0].start, end: ifs[0].end } : { kind: "line", start: n, end: n };
  // 「何回目の くりかえしか」を選ぶための くりかえし（外側から）
  unit.loops = blocks.filter((b) => b.type === "loop" && b.start <= unit.start && unit.start <= b.end);
  return unit;
}

const countLines = (events, upto) => {
  let c = 0;
  for (let i = 0; i < upto; i++) if (events[i].type === "line") c++;
  return c;
};

/**
 * 選んだ範囲が実行される所（何回目の くりかえしか）の一覧。
 * 各要素：{ stop：ここまで再生するイベントの数, steps：それまでに実行する行の数, keys：くりかえしごとの値（外側から） }
 */
export function peekTargets(stage, unit) {
  const ev = stage.events;
  const ranges = [];
  for (let i = 0; i < ev.length; i++) {
    if (ev[i].type !== "line" || ev[i].n !== unit.start) continue;
    let j = i + 1;
    for (; j < ev.length; j++) {
      const e = ev[j];
      if (e.type === "end") break;
      if (e.type === "line" && (unit.kind === "line" || e.n < unit.start || e.n > unit.end)) break;
    }
    ranges.push({ start: i, stop: j });
  }
  if (!ranges.length) return [];
  // 1回だけ先頭から再生して、止める所の変数の値を読む
  const w = new World(stage);
  const whileCount = {};
  let k = 0;
  const out = [];
  for (const r of ranges) {
    for (; k < r.stop; k++) {
      const e = ev[k];
      if (k === r.start) r.whileAt = { ...whileCount };
      if (e.type === "line") whileCount[e.n] = (whileCount[e.n] || 0) + 1;
      w.apply(e);
    }
    // for はその時点の変数の値、while は何回目か（while の行そのものを選んだときは、その回の判定も数える）
    const keys = unit.loops.map((l) => {
      if (l.kind === "for") return w.vars[l.var];
      return (l.start === unit.start ? whileCount : r.whileAt)[l.start] || 1;
    });
    out.push({ stop: r.stop, steps: countLines(ev, r.stop), keys });
  }
  return out;
}

/** 最後まで実行したときの行の数 */
export function totalSteps(stage) {
  return countLines(stage.events, stage.events.length);
}

/** くりかえしの見出し（例：「i の値」「くりかえし（while）」） */
export function loopLabel(loop) {
  return loop.kind === "for" ? `${loop.var} の値` : `${loop.start}行目の繰り返し`;
}

export function keyText(loop, v) {
  return loop.kind === "for" ? `${loop.var} = ${v}` : `${v}回目`;
}
