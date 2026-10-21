// ステージデータ検証（§9.4）
// 使い方: node tools/validate-stages.mjs [--complete]
//   --complete : 9ジャンル×10レベル（6〜10は穴埋め）が揃っていることも必須にする（v1.0完了時）
import { STAGES } from "../js/data/stages/index.js";
import { GENRES, LEVELS } from "../js/data/genres.js";
import { World, WorldError, eventsForChoice, stopIndex, reviewLines, matchesExpected, blankLines, blankStopIndex, fillText } from "../js/engine/world.js";

const requireComplete = process.argv.includes("--complete");

const errors = [];
const warnings = [];
const err = (id, msg) => errors.push(`[${id}] ${msg}`);
const warn = (id, msg) => warnings.push(`[${id}] ${msg}`);

const MINUS = /[−–ー－]/g;

/**
 * 式の値を計算（変数・配列参照を現在値に置換して評価）。評価できなければ undefined。
 * 疑似言語にあわせて ÷ は商の小数点以下を切り捨てる（例：352 ÷ 10 ＝ 35）。
 */
function evalExpr(expr, world) {
  let s = String(expr)
    .replace(MINUS, "-")
    .replace(/＋/g, "+")
    .replace(/＜/g, "<")
    .replace(/＞/g, ">")
    .replace(/×/g, "*")
    .replace(/≧/g, ">=")
    .replace(/≦/g, "<=")
    .replace(/≠/g, "!=")
    .replace(/＝/g, "==")
    .replace(/\bmod\b/g, "%")
    .replace(/\band\b/g, "&&")
    .replace(/\bor\b/g, "||")
    .replace(/\bnot\b/g, "!");
  s = s.replace(/([A-Za-z_]\w*)\[(\d+)\]/g, (m, a, i) => {
    const arr = world.arrays[a];
    return arr && arr[i - 1] !== undefined ? `(${arr[i - 1]})` : "NaN";
  });
  s = s.replace(/[A-Za-z_]\w*/g, (name) => (name in world.vars ? `(${world.vars[name]})` : "NaN"));
  if (!/^[\d\s+\-*÷%().<>=!&|]+$/.test(s)) return undefined;
  try {
    return parseExpr(s);
  } catch {
    return undefined;
  }
}

/** 小さな式パーサ（優先順位：単項 → × ÷ mod → ＋ － → 比較 → 等しい → and → or） */
function parseExpr(src) {
  const toks = src.match(/\d+|<=|>=|==|!=|&&|\|\||[-+*÷%()<>!]/g) || [];
  let k = 0;
  const peek = () => toks[k];
  const eat = (t) => {
    if (toks[k] !== t) throw new Error(`expected ${t}`);
    k++;
  };
  const LEVELS = [["||"], ["&&"], ["==", "!="], ["<", ">", "<=", ">="], ["+", "-"], ["*", "÷", "%"]];
  const apply = (op, a, b) => {
    switch (op) {
      case "||": return a || b;
      case "&&": return a && b;
      case "==": return a === b;
      case "!=": return a !== b;
      case "<": return a < b;
      case ">": return a > b;
      case "<=": return a <= b;
      case ">=": return a >= b;
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "÷": return Math.trunc(a / b);
      case "%": return a % b;
    }
    throw new Error(op);
  };
  const level = (n) => {
    if (n === LEVELS.length) return unary();
    let v = level(n + 1);
    while (LEVELS[n].includes(peek())) {
      const op = toks[k++];
      v = apply(op, v, level(n + 1));
    }
    return v;
  };
  const unary = () => {
    const t = peek();
    if (t === "-") {
      k++;
      return -unary();
    }
    if (t === "!") {
      k++;
      return !unary();
    }
    if (t === "(") {
      k++;
      const v = level(0);
      eat(")");
      return v;
    }
    if (/^\d+$/.test(t)) {
      k++;
      return Number(t);
    }
    throw new Error(`token ${t}`);
  };
  const v = level(0);
  if (k !== toks.length) throw new Error("extra tokens");
  return v;
}

/** イベント列を空シミュレーション。エラーは配列で返す */
function simulate(stage, events, label) {
  const w = new World(stage);
  const problems = [];
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    try {
      if (ev.type === "calc") {
        const v = evalExpr(ev.expr, w);
        if (v !== undefined && v !== ev.result) problems.push(`${label} #${i} calc "${ev.expr}" は ${v} ですが result=${ev.result}`);
      }
      if (ev.type === "compare") {
        const v = evalExpr(ev.expr, w);
        if (v !== undefined && !!v !== !!ev.result) problems.push(`${label} #${i} compare "${ev.expr}" は ${v} ですが result=${ev.result}`);
      }
      w.apply(ev);
    } catch (e) {
      if (e instanceof WorldError) {
        problems.push(`${label} #${i} (${ev.type}): ${e.message}`);
        return { world: w, problems, crashed: true };
      }
      throw e;
    }
  }
  return { world: w, problems, crashed: false };
}

/** 選択肢の code 表現を解析して、expectedFinal と照合できる形にする */
function parseChoiceCode(code, stage) {
  const s = String(code).replace(MINUS, "-").replace(/＋/g, "+");
  let m = /^\(よこ,\s*たて\)\s*=\s*\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*\)$/.exec(s);
  if (m) {
    const rel = /[+-]/.test(m[1]) || /[+-]/.test(m[2]) || stage.answerType === "pos-rel";
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (stage.answerType === "pos-abs") return { pos: { x: a, y: b } };
    if (rel || m[1] === "0") return { pos: { x: stage.field.start.x + a, y: stage.field.start.y + b } };
    return { pos: { x: a, y: b } };
  }
  // 配列・スタック・キュー：a = {3, 1, 2}（スタックは「スタック = {…}」で下から、キューは先頭から。空は {}）
  m = /^([A-Za-z_]\w*|スタック|キュー)\s*=\s*[\[{]([^\]}]*)[\]}]$/.exec(s);
  if (m) {
    const items = m[2].trim() === "" ? [] : m[2].split(",").map((v) => v.trim());
    return { arrays: { [m[1]]: items.map((v) => (/^-?\d+$/.test(v) ? Number(v) : v.replace(/^"|"$/g, ""))) } };
  }
  const parts = s.split(",").map((p) => p.trim());
  const vars = {};
  for (const p of parts) {
    const mm = /^([A-Za-z_]\w*)\s*=\s*(-?\d+)$/.exec(p);
    if (!mm) return null;
    vars[mm[1]] = Number(mm[2]);
  }
  return { vars };
}

function checkStage(stage) {
  const id = stage.id || "(idなし)";
  const genreKeys = GENRES.map((g) => g.key);
  if (!/^[a-z]+-([1-9]|10)$/.test(id)) err(id, "id は「ジャンルキー-レベル（1〜10）」形式にしてください");
  if (!genreKeys.includes(stage.genre)) err(id, `genre "${stage.genre}" は未定義です`);
  if (id !== `${stage.genre}-${stage.level}`) err(id, "id と genre/level が一致しません");
  for (const k of ["title", "question", "field", "program", "choices", "events", "expectedFinal", "hints", "explanation"]) {
    if (stage[k] === undefined) err(id, `${k} がありません`);
  }
  if (!stage.program || !stage.choices || !stage.events || !stage.field) return;

  // program
  const { ja, code } = stage.program;
  if (!Array.isArray(ja) || !Array.isArray(code) || ja.length !== code.length)
    err(id, `program.ja(${ja && ja.length}) と program.code(${code && code.length}) の行数が一致しません`);
  else
    ja.forEach((l, i) => {
      const ij = /^[\s　]*/.exec(l)[0].length;
      const ic = /^[\s　]*/.exec(code[i])[0].length;
      if (ij !== ic) warn(id, `${i + 1}行目のインデントが ja/code で揃っていません`);
    });

  // 穴埋め（6〜10）：program に空欄「［a］」、選択肢に fill（空欄ごとに入れるもの）
  const isBlank = stage.answerType === "blank";
  const lvDef = LEVELS.find((l) => l.level === stage.level);
  if (lvDef && !!lvDef.blank !== isBlank) err(id, `Lv${stage.level} は ${lvDef.blank ? "穴埋め（answerType: \"blank\"）" : "穴埋めではない問題"} にしてください`);
  if (isBlank) {
    if (!Array.isArray(stage.blanks) || !stage.blanks.length) err(id, "穴埋めには blanks（例 [\"a\"]）が必要です");
    for (const k of stage.blanks || []) {
      if (!code.some((l) => l.includes(`［${k}］`))) err(id, `program.code に空欄「［${k}］」がありません`);
      if (!ja.some((l) => l.includes(`［${k}］`))) err(id, `program.ja に空欄「［${k}］」がありません`);
      stage.choices.forEach((c, i) => {
        if (fillText(c, k, "code") === null) err(id, `choice${i + 1} に fill.${k} がありません`);
      });
    }
    if (!blankLines(stage).length) err(id, "空欄のある行がありません");
    else if (blankStopIndex(stage) < 0) err(id, "空欄の行が events の中で一度も実行されていません");
    const fills = stage.choices.map((c) => JSON.stringify((stage.blanks || []).map((k) => fillText(c, k, "code"))));
    if (new Set(fills).size !== fills.length) err(id, "fill が同じ選択肢があります");
  }

  // field
  const f = stage.field;
  if (!Array.isArray(f.tiles) || f.tiles.length !== f.rows || f.tiles.some((r) => r.length !== f.cols))
    err(id, `field.tiles の大きさが cols×rows(${f.cols}×${f.rows}) と一致しません`);
  const w0 = new World(stage);
  if (!w0.isWalkable(f.start.x, f.start.y)) err(id, "start が歩けない場所です");

  // events（正しい処理）
  const main = simulate(stage, stage.events, "events");
  main.problems.forEach((p) => err(id, p));
  if (!main.crashed) {
    if (!main.world.ended || stage.events[stage.events.length - 1]?.type !== "end") err(id, "events が end で終わっていません");
    if (!matchesExpected(main.world.snapshot(), stage.expectedFinal))
      err(id, `events の最終状態 ${JSON.stringify(main.world.snapshot())} が expectedFinal と一致しません`);
  }

  // choices
  if (stage.choices.length !== 4) err(id, `choices が ${stage.choices.length} 個です（4個必要）`);
  const corrects = stage.choices.filter((c) => c.correct === true);
  if (corrects.length !== 1) err(id, `correct:true が ${corrects.length} 個です（1個必要）`);
  const seenCode = new Set();
  stage.choices.forEach((c, i) => {
    const label = `choice${i + 1}`;
    if (!c.ja || !c.code) err(id, `${label} に ja と code が必要です`);
    if (seenCode.has(c.code)) err(id, `${label} の code "${c.code}" が重複しています`);
    seenCode.add(c.code);
    const evs = eventsForChoice(stage, c);
    const parsed = parseChoiceCode(c.code, stage);
    if (c.correct) {
      const r = simulate(stage, evs, label);
      r.problems.forEach((p) => err(id, p));
      if (evs[evs.length - 1]?.type !== "success") err(id, `${label}（正解）の events は success で終わる必要があります`);
      if (!r.crashed && !matchesExpected(r.world.snapshot(), stage.expectedFinal))
        err(id, `${label}（正解）の最終状態が expectedFinal と一致しません`);
      if (parsed && !matchesExpected(merge(r.world.snapshot(), parsed), stage.expectedFinal))
        err(id, `${label}（正解）の code "${c.code}" が expectedFinal と矛盾します`);
      if (!parsed && !isBlank) warn(id, `${label}（正解）の code "${c.code}" は自動照合できない形式です`);
    } else {
      if (!c.wrongFeedback) err(id, `${label}（不正解）に wrongFeedback がありません`);
      // 穴埋めの誤答：その選択肢を入れたプログラムを実行する（events）。目的と合わない結果か、途中の fail で終わる
      if (isBlank) {
        if (!Array.isArray(c.events) || !c.events.length) {
          err(id, `${label}（不正解）に events（その選択肢を入れて実行したときの動き）がありません`);
          return;
        }
        const r = simulate(stage, evs, label);
        r.problems.forEach((p) => err(id, p));
        const last = evs[evs.length - 1];
        if (last.type !== "fail") err(id, `${label}（不正解）の events は fail で終わる必要があります`);
        if (!r.crashed && last.kind === "mismatch" && matchesExpected(r.world.snapshot(), stage.expectedFinal))
          err(id, `${label}（不正解）を入れて実行しても 目的どおりの結果になってしまいます（データを変えて、ちがいが出るようにする）`);
        return;
      }
      // 追跡の誤答は 読みまちがいの処理を見せず、正しい処理を「読みがずれる行」の手前で止める
      if (c.events) err(id, `${label}（不正解）に events は書きません（stop で止める位置を指定します）`);
      if (!c.stop || !Number.isInteger(c.stop.line)) {
        err(id, `${label}（不正解）に stop: { line } がありません`);
        return;
      }
      if (stopIndex(stage, c) < 0)
        err(id, `${label}（不正解）の stop：${c.stop ? `${c.stop.line}行目の ${c.stop.nth || 1}回目` : "空欄の行"}は events の中にありません`);
      for (const n of reviewLines(c, stage)) if (!(n >= 1 && n <= code.length)) err(id, `${label}（不正解）の stop.mark ${n} が処理の範囲外です`);
      const r = simulate(stage, evs, label);
      r.problems.forEach((p) => err(id, p));
      if (!r.crashed && matchesExpected(r.world.snapshot(), stage.expectedFinal))
        err(id, `${label}（不正解）の止める位置では もう正解の状態になっています（答えが見えてしまいます）`);
      if (!isBlank && parsed && matchesExpected(merge(main.world.snapshot(), parsed), stage.expectedFinal))
        err(id, `${label}（不正解）の code "${c.code}" が正解の値と一致してしまいます`);
    }
  });

  // hints / explanation
  if (!Array.isArray(stage.hints) || stage.hints.length !== 3) err(id, "hints は3つ必要です");
  const ex = stage.explanation || {};
  if (!ex.why) err(id, "explanation.why がありません");
  if (!Array.isArray(ex.points) || ex.points.length === 0) err(id, "explanation.points がありません");
  if (!Array.isArray(ex.trace) || ex.trace.length === 0) err(id, "explanation.trace がありません");
  else
    ex.trace.forEach((t, i) => {
      if (!(t.line >= 1 && t.line <= code.length)) err(id, `trace[${i}] の line ${t.line} が処理の範囲外です`);
    });
  if (stage.level === 1 && !stage.intro) warn(id, "Lv1 には intro があるとよいです");
}

function merge(snapshot, parsed) {
  return {
    pos: parsed.pos || snapshot.pos,
    vars: { ...snapshot.vars, ...(parsed.vars || {}) },
    arrays: { ...snapshot.arrays, ...(parsed.arrays || {}) },
  };
}

// ---- 実行 ----
const ids = new Set();
for (const s of STAGES) {
  if (ids.has(s.id)) err(s.id, "ステージIDが重複しています");
  ids.add(s.id);
  try {
    checkStage(s);
  } catch (e) {
    err(s.id, `検証中に例外: ${e.stack || e}`);
  }
}

const missing = [];
for (const g of GENRES) for (const { level: lv } of LEVELS) if (!ids.has(`${g.key}-${lv}`)) missing.push(`${g.key}-${lv}`);
if (missing.length) {
  const msg = `未実装のステージ ${missing.length} 件（${missing.slice(0, 6).join(", ")}${missing.length > 6 ? " …" : ""}）`;
  if (requireComplete) err("all", msg);
  else warnings.push(`[all] ${msg}`);
}

for (const w of warnings) console.log("⚠ " + w);
if (errors.length) {
  for (const e of errors) console.error("✗ " + e);
  console.error(`\n検証失敗：${errors.length} 件のエラー（${STAGES.length} ステージ）`);
  process.exit(1);
}
console.log(`✓ 検証成功：${STAGES.length} ステージ（${[...ids].join(", ")}）`);
