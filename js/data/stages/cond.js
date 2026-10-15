// ② cond（わかれみち）
import { line, moves, spawn, pickup, store, takeCopy, put, spawnOnPad, compare, emote, end, mismatch } from "./helpers.js";

const C1_FIELD = {
  cols: 7,
  rows: 5,
  tiles: ["       ", " ....  ", " ....  ", " ....  ", "       "],
  start: { x: 1, y: 2, dir: "right" },
  boxes: [{ var: "x", x: 0, y: 2, access: { x: 1, y: 2 } }],
  pads: [{ kind: "compare", x: 0, y: 1, access: { x: 1, y: 2 } }],
  items: [],
  arrays: [],
  switches: [],
  doors: [],
  stacks: [],
  queues: [],
};

// 1行目：x を用意して 7 を入れる（クリスタルはアルゴくんの足もとに出る）
const declX = [line(1), spawn("n7", 7, 1, 2), pickup("n7"), store("n7", "x")];
// 2行目：x のコピーと 5 を比較台に並べて判定
const checkX = [line(2), takeCopy("x", "cx"), put("cx", "compare"), spawnOnPad("n5", 5, "compare"), compare("7 ≧ 5", true)];

const cond1 = {
  id: "cond-1",
  genre: "cond",
  level: 1,
  title: "わかれみち",
  concepts: ["if"],
  intro: "「もし ～なら」（ぎじコードの if）は、じょうけんが なりたつ ときだけ その中の しょりを するよ。\nなりたたない ときは「そうでなければ」（ぎじコードの else）の中へ。",
  field: C1_FIELD,
  vars: {},
  varColors: { x: "#4FC3F7" },
  program: {
    ja: [
      "整数の 変数 x を 用意して 7 を入れる",
      "もし x が 5 以上なら",
      "  上へ 1マス 進む",
      "そうでなければ",
      "  下へ 1マス 進む",
      "（もし ここまで）",
      "右へ 2マス 進む",
    ],
    code: ["整数型: x ← 7", "if (x が 5 以上)", "  moveUp(1)", "else", "  moveDown(1)", "endif", "moveRight(2)"],
  },
  notes: ["手続 moveUp(n)，moveDown(n)，moveRight(n) は，アルゴくんをそれぞれ上・下・右へ n マス進める。"],
  question: "この処理を実行したあと、アルゴくんはどこにいますか？",
  answerType: "pos-rel",
  choices: [
    { ja: "スタートから 右に2マス、上に1マス", code: "(x, y) = (+2, −1)", correct: true },
    {
      ja: "スタートから 下に1マス、右に2マス",
      code: "(x, y) = (+2, +1)",
      wrongFeedback: "x は 7 なので、条件「x が 5 以上」は成り立ちます。成り立つときは、2行目のすぐ下の3行目（上へ1マス）が実行されます。",
      events: [...declX, line(2), emote("think"), line(4), line(5), ...moves("down"), line(6), line(7), ...moves("right", 2), mismatch()],
    },
    {
      ja: "スタートから 右に2マスだけ",
      code: "(x, y) = (+2, 0)",
      wrongFeedback: "条件が成り立つと、3行目の「上へ1マス」が実行されます。3行目と5行目のどちらも実行されない、ということはありません。",
      events: [...declX, line(2), emote("think"), line(6), line(7), ...moves("right", 2), mismatch()],
    },
    {
      ja: "スタートから 上に1マスだけ",
      code: "(x, y) = (0, −1)",
      wrongFeedback: "7行目の「右へ2マス」は、6行目の「もし ここまで」（疑似コードの endif）より後なので、条件に関係なく実行されます。",
      events: [...declX, ...checkX, line(3), ...moves("up"), mismatch("あれ？ まだ とちゅう みたい…")],
    },
  ],
  events: [...declX, ...checkX, line(3), ...moves("up"), line(6), line(7), ...moves("right", 2), end()],
  expectedFinal: { pos: { x: 3, y: 1 }, vars: { x: 7 } },
  hints: [
    "1行目で x には 7 が入ります。2行目の条件「x が 5 以上」は、7 が 5 以上かどうか、ということ。成り立つなら 3行目、成り立たないなら 5行目へ進みます。",
    "7 は 5 以上なので、条件は成り立ちます。3行目の「上へ1マス」を実行し、5行目は飛ばします。6行目「もし ここまで」より後の7行目は、どちらの場合も実行されます。",
    "上へ1マス進んでから、右へ2マス。スタートから見ると、右に2マス・上に1マス です。",
  ],
  explanation: {
    why: "x は 7 なので「x が 5 以上」は成り立ちます（真）。そのため3行目「上へ1マス」が実行され、「そうでなければ」（疑似コードの else）の中の5行目は実行されません。7行目の「右へ2マス」は「もし ここまで」（疑似コードの endif）より後なので、必ず実行されます。",
    trace: [
      { line: 1, state: "x=7　位置：(1,2)" },
      { line: 2, state: "x が 5 以上 → 真" },
      { line: 3, state: "位置：(1,1)" },
      { line: 7, state: "位置：(3,1)" },
    ],
    points: ["条件が成り立つ（真）ときは「もし」の中、成り立たない（偽）ときは「そうでなければ」の中だけが実行される", "「もし ここまで」（疑似コードの endif）より後の処理は、どちらの場合も実行される"],
  },
};

export default [cond1];
