// ② cond（わかれみち）
import { line, moves, spawn, pickup, store, takeCopy, put, spawnOnPad, compare, emote, end, mismatch, builder, mkField } from "./helpers.js";

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

// ---- cond-2：if / elseif / else の3方向 ----
const C2_FIELD = { ...C1_FIELD };
const B2 = builder(C2_FIELD);
const c2Decl = [line(1), ...B2.set("x", 4)];
const c2Check1 = [line(2), ...B2.cmp(["x", 7], "4 ≧ 7", false)];
const c2Check2 = [line(4), ...B2.cmp(["x", 3], "4 ≧ 3", true)];

const cond2 = {
  id: "cond-2",
  genre: "cond",
  level: 2,
  title: "みっつの みち",
  concepts: ["if", "elseif"],
  field: C2_FIELD,
  vars: {},
  varColors: { x: "#4FC3F7" },
  program: {
    ja: [
      "整数の 変数 x を 用意して 4 を入れる",
      "もし x が 7 以上なら",
      "  上へ 1マス 進む",
      "そうでなく、もし x が 3 以上なら",
      "  右へ 1マス 進む",
      "そうでなければ",
      "  下へ 1マス 進む",
      "（もし ここまで）",
    ],
    code: ["整数型: x ← 4", "if (x が 7 以上)", "  moveUp(1)", "elseif (x が 3 以上)", "  moveRight(1)", "else", "  moveDown(1)", "endif"],
  },
  notes: ["手続 moveUp(n)，moveRight(n)，moveDown(n) は，アルゴくんをそれぞれ上・右・下へ n マス進める。"],
  question: "この処理を実行したあと、アルゴくんはどこにいますか？",
  answerType: "pos-rel",
  choices: [
    { ja: "スタートから 右に1マス", code: "(x, y) = (+1, 0)", correct: true },
    {
      ja: "スタートから 上に1マス",
      code: "(x, y) = (0, −1)",
      wrongFeedback: "x は 4 なので、2行目の「x が 7 以上」は成り立ちません。3行目は実行されません。",
      events: [...c2Decl, line(2), emote("think"), line(3), ...moves("up"), mismatch()],
    },
    {
      ja: "スタートから 下に1マス",
      code: "(x, y) = (0, +1)",
      wrongFeedback: "4行目の「x が 3 以上」は、4 なので成り立ちます。「そうでなければ」の中（7行目）に行くのは、どの条件も成り立たないときだけです。",
      events: [...c2Decl, ...c2Check1, line(4), emote("think"), line(6), line(7), ...moves("down"), line(8), mismatch()],
    },
    {
      ja: "スタートから 右に1マス、下に1マス",
      code: "(x, y) = (+1, +1)",
      wrongFeedback: "条件が成り立った所（5行目）を実行したら、残りの「そうでなければ」の中は実行しません。実行されるのは どれか1つだけです。",
      events: [...c2Decl, ...c2Check1, ...c2Check2, line(5), ...moves("right"), line(6), line(7), ...moves("down"), line(8), mismatch()],
    },
  ],
  events: [...c2Decl, ...c2Check1, ...c2Check2, line(5), ...moves("right"), line(8), end()],
  expectedFinal: { pos: { x: 2, y: 2 }, vars: { x: 4 } },
  hints: [
    "1行目で x＝4。2行目の「x が 7 以上」は、4 が 7 以上か？ 成り立たなければ、4行目の条件に進みます。",
    "4行目の「x が 3 以上」は成り立ちます。成り立った所の中（5行目）だけを実行し、そのあとの「そうでなければ」の中は実行しません。",
    "右へ1マス だけ進みます。",
  ],
  explanation: {
    why: "条件は上から順に調べます。「x が 7 以上」は 4 なので成り立たず、次の「x が 3 以上」が成り立つので5行目の「右へ1マス」だけを実行します。最初に成り立った所の処理を1つだけ実行し、残りは実行しません。",
    trace: [
      { line: 1, state: "x=4　位置：(1,2)" },
      { line: 2, state: "x が 7 以上 → 偽" },
      { line: 4, state: "x が 3 以上 → 真" },
      { line: 5, state: "位置：(2,2)" },
    ],
    points: ["条件は上から順に調べ、最初に成り立った所の処理だけを実行する", "「そうでなければ」（疑似コードの else）は、どの条件も成り立たないときだけ実行される"],
  },
};

// ---- cond-3：複合条件（かつ・または） ----
const C3_FIELD = mkField({
  cols: 7,
  rows: 5,
  tiles: ["       ", " ....  ", " ....  ", " ....  ", "       "],
  start: { x: 1, y: 2, dir: "right" },
  boxes: [
    { var: "x", x: 0, y: 1, access: { x: 1, y: 2 } },
    { var: "y", x: 0, y: 3, access: { x: 1, y: 2 } },
  ],
  pads: [{ kind: "compare", x: 0, y: 2, access: { x: 1, y: 2 } }],
});
const B3c = builder(C3_FIELD);
const c3Decl = [line(1), ...B3c.set("x", 6), line(2), ...B3c.set("y", 2)];
const c3And = (n) => [line(n), ...B3c.cmp(["x", 5, "y", 3], "(6 ≧ 5) and (2 ≧ 3)", false)];
const c3Or = (n) => [line(n), ...B3c.cmp(["x", 5, "y", 3], "(6 ≧ 5) or (2 ≧ 3)", true)];

const cond3 = {
  id: "cond-3",
  genre: "cond",
  level: 3,
  title: "かつ と または",
  concepts: ["if", "and", "or"],
  field: C3_FIELD,
  vars: {},
  varColors: { x: "#4FC3F7", y: "#66BB6A" },
  program: {
    ja: [
      "整数の 変数 x を 用意して 6 を入れる",
      "整数の 変数 y を 用意して 2 を入れる",
      "もし x が 5 以上 かつ y が 3 以上なら",
      "  上へ 1マス 進む",
      "そうでなく、もし x が 5 以上 または y が 3 以上なら",
      "  右へ 2マス 進む",
      "そうでなければ",
      "  下へ 1マス 進む",
      "（もし ここまで）",
    ],
    code: [
      "整数型: x ← 6",
      "整数型: y ← 2",
      "if ((x が 5 以上) and (y が 3 以上))",
      "  moveUp(1)",
      "elseif ((x が 5 以上) or (y が 3 以上))",
      "  moveRight(2)",
      "else",
      "  moveDown(1)",
      "endif",
    ],
  },
  notes: ["手続 moveUp(n)，moveRight(n)，moveDown(n) は，アルゴくんをそれぞれ上・右・下へ n マス進める。"],
  question: "この処理を実行したあと、アルゴくんはどこにいますか？",
  answerType: "pos-rel",
  choices: [
    { ja: "スタートから 右に2マス", code: "(x, y) = (+2, 0)", correct: true },
    {
      ja: "スタートから 上に1マス",
      code: "(x, y) = (0, −1)",
      wrongFeedback: "3行目は「かつ」（疑似コードの and）なので、両方が成り立つ必要があります。y は 2 なので「y が 3 以上」は成り立ちません。",
      events: [...c3Decl, line(3), ...B3c.cmp(["x", 5, "y", 3], "(6 ≧ 5) or (2 ≧ 3)", true), line(4), ...moves("up"), line(9), mismatch()],
    },
    {
      ja: "スタートから 下に1マス",
      code: "(x, y) = (0, +1)",
      wrongFeedback: "5行目は「または」（疑似コードの or）なので、どちらか片方が成り立てば成立します。x は 6 なので「x が 5 以上」は成り立ちます。",
      events: [...c3Decl, ...c3And(3), line(5), ...B3c.cmp(["x", 5, "y", 3], "(6 ≧ 5) and (2 ≧ 3)", false), line(7), line(8), ...moves("down"), line(9), mismatch()],
    },
    {
      ja: "スタートから 上に1マス、右に2マス",
      code: "(x, y) = (+2, −1)",
      wrongFeedback: "3行目の条件は成り立たないので4行目は実行されません。また、実行されるのは 成り立った所の1つだけです。",
      events: [...c3Decl, line(3), emote("think"), line(4), ...moves("up"), line(5), emote("think"), line(6), ...moves("right", 2), line(9), mismatch()],
    },
  ],
  events: [...c3Decl, ...c3And(3), ...c3Or(5), line(6), ...moves("right", 2), line(9), end()],
  expectedFinal: { pos: { x: 3, y: 2 }, vars: { x: 6, y: 2 } },
  hints: [
    "x＝6、y＝2 です。3行目は「x が 5 以上」と「y が 3 以上」の 両方が成り立つときだけ。それぞれ 成り立つか 調べよう。",
    "「かつ」（疑似コードの and）は両方、「または」（疑似コードの or）はどちらか片方が成り立てば成立。y が 2 なので「y が 3 以上」は成り立ちません。",
    "3行目は不成立、5行目は成立 → 6行目の「右へ2マス」だけを実行します。",
  ],
  explanation: {
    why: "「x が 5 以上」は真、「y が 3 以上」は偽です。3行目の「かつ」（and）は両方が真でないと成り立たないので偽。5行目の「または」（or）は片方が真なら成り立つので真。だから6行目の「右へ2マス」を実行します。",
    trace: [
      { line: 2, state: "x=6, y=2　位置：(1,2)" },
      { line: 3, state: "真 かつ 偽 → 偽" },
      { line: 5, state: "真 または 偽 → 真" },
      { line: 6, state: "位置：(3,2)" },
    ],
    points: ["「かつ」（and）は両方が真のときだけ真", "「または」（or）はどちらか片方でも真なら真"],
  },
};

// ---- cond-4：入れ子の if と変数の更新 ----
const C4_FIELD = mkField({
  cols: 8,
  rows: 5,
  start: { x: 2, y: 2, dir: "right" },
  spawn: { x: 0, y: 2 },
  boxes: [
    { var: "a", x: 6, y: 1, access: { x: 5, y: 1 } },
    { var: "b", x: 6, y: 3, access: { x: 5, y: 3 } },
  ],
  pads: [
    { kind: "calc", x: 3, y: 1, access: { x: 3, y: 2 } },
    { kind: "compare", x: 3, y: 3, access: { x: 3, y: 2 } },
  ],
});
const B4c = builder(C4_FIELD);
const c4Decl = [line(1), ...B4c.set("a", 7), line(2), ...B4c.set("b", 0)];
const c4Outer = [line(3), ...B4c.cmp(["a", 5], "7 ＞ 5", true)];
const c4L4 = [line(4), ...B4c.calc("b", ["a", 5], "a － 5", 2)];

const cond4 = {
  id: "cond-4",
  genre: "cond",
  level: 4,
  title: "いれこの わかれみち",
  concepts: ["if", "nested"],
  field: C4_FIELD,
  vars: {},
  varColors: { a: "#4FC3F7", b: "#66BB6A" },
  program: {
    ja: [
      "整数の 変数 a を 用意して 7 を入れる",
      "整数の 変数 b を 用意して 0 を入れる",
      "もし a が 5 より大きいなら",
      "  a から 5 を 引いた値を b に入れる",
      "  もし b が 2 以上なら",
      "    a から b を 引いた値を a に入れる",
      "  そうでなければ",
      "    a と b を 足した値を a に入れる",
      "  （もし ここまで）",
      "そうでなければ",
      "  5 から a を 引いた値を b に入れる",
      "（もし ここまで）",
    ],
    code: [
      "整数型: a ← 7",
      "整数型: b ← 0",
      "if (a が 5 より大きい)",
      "  b ← a － 5",
      "  if (b が 2 以上)",
      "    a ← a － b",
      "  else",
      "    a ← a ＋ b",
      "  endif",
      "else",
      "  b ← 5 － a",
      "endif",
    ],
  },
  question: "処理が終わったとき、a と b の値はいくつですか？",
  answerType: "vars",
  choices: [
    { ja: "a は 5、b は 2", code: "a = 5, b = 2", correct: true },
    {
      ja: "a は 9、b は 2",
      code: "a = 9, b = 2",
      wrongFeedback: "5行目は「b が 2 以上」です。b は 2 なので成り立ちます（「2 より大きい」とはちがいます）。",
      events: [...c4Decl, ...c4Outer, ...c4L4, line(5), ...B4c.cmp(["b", 2], "2 ＞ 2", false), line(7), line(8), ...B4c.calc("a", ["a", "b"], "a ＋ b", 9), line(9), line(12), mismatch()],
    },
    {
      ja: "a は 7、b は 2",
      code: "a = 7, b = 2",
      wrongFeedback: "4行目のあと、内側の if（5〜9行目）でも a が更新されます。外側の if の中は最後まで実行されます。",
      events: [...c4Decl, ...c4Outer, ...c4L4, line(5), emote("think"), ...B4c.claimCopy("a", "a", "a は 7 の ままじゃ ない みたい…")],
    },
    {
      ja: "a は 7、b は −2",
      code: "a = 7, b = −2",
      wrongFeedback: "a は 7 なので、3行目の「a が 5 より大きい」は成り立ちます。外側の「そうでなければ」（11行目）には進みません。",
      events: [...c4Decl, line(3), emote("think"), line(10), line(11), ...B4c.calc("b", [5, "a"], "5 － a", -2), line(12), mismatch()],
    },
  ],
  events: [...c4Decl, ...c4Outer, ...c4L4, line(5), ...B4c.cmp(["b", 2], "2 ≧ 2", true), line(6), ...B4c.calc("a", ["a", "b"], "a － b", 5), line(9), line(12), end()],
  expectedFinal: { vars: { a: 5, b: 2 } },
  hints: [
    "a＝7 なので、3行目の「a が 5 より大きい」は成り立ちます。4行目で b に 7－5＝2 が入ります。次は5行目の 内側の条件を調べよう。",
    "5行目は「b が 2 以上」。b は 2 なので成り立ちます（「以上」は その数も ふくみます）。6行目を実行し、8行目は実行しません。",
    "6行目で a＝7－2＝5。外側の「そうでなければ」（10〜11行目）は実行しません。",
  ],
  explanation: {
    why: "外側の条件「a が 5 より大きい」が真なので4〜9行目を実行します。4行目で b＝2。内側の条件「b が 2 以上」も真（2 は 2 以上）なので6行目で a＝7－2＝5。外側の「そうでなければ」は実行されません。",
    trace: [
      { line: 2, state: "a=7, b=0" },
      { line: 3, state: "a が 5 より大きい → 真" },
      { line: 4, state: "a=7, b=2" },
      { line: 5, state: "b が 2 以上 → 真" },
      { line: 6, state: "a=5, b=2" },
    ],
    points: ["if の中に if があるときは、外側の条件 → 内側の条件の順に調べる", "「以上」「以下」はその数をふくみ、「より大きい」「より小さい」はふくまない"],
  },
};

// ---- cond-5：配列＋繰返し＋複数の分岐（境界値 ≧ と ＞） ----
const C5_FIELD = mkField({
  cols: 9,
  rows: 6,
  start: { x: 1, y: 2, dir: "right" },
  spawn: { x: 4, y: 2 },
  arrays: [{ name: "score", x: 1, y: 0, values: [80, 60, 59, 90, 70] }],
  boxes: [
    { var: "i", x: 7, y: 1, access: { x: 6, y: 1 } },
    { var: "a", x: 7, y: 2, access: { x: 6, y: 2 } },
    { var: "b", x: 7, y: 3, access: { x: 6, y: 3 } },
    { var: "c", x: 7, y: 4, access: { x: 6, y: 4 } },
  ],
  pads: [
    { kind: "compare", x: 3, y: 3, access: { x: 3, y: 2 } },
    { kind: "calc", x: 5, y: 3, access: { x: 5, y: 2 } },
  ],
});
const SCORES = [80, 60, 59, 90, 70];

/**
 * 繰返しの実演を作る。mode で「選択肢の読みちがい」を再現する。
 *  correct：80以上→a、60より大きい→b、それ以外→c
 *  b60：「60 より大きい」を「60 以上」と読む
 *  a80：「80 以上」を「80 より大きい」と読む
 *  both：成り立った所のあとも次の条件を調べて実行してしまう
 */
function cond5Events(mode) {
  const B = builder(C5_FIELD);
  const ev = [line(1), line(2), line(3), ...B.set("a", 0), line(4), ...B.set("b", 0), line(5), ...B.set("c", 0)];
  const cnt = { a: 0, b: 0, c: 0 };
  const inc = (v) => {
    cnt[v] += 1;
    return B.calc(v, [v, 1], `${v} ＋ 1`, cnt[v]);
  };
  SCORES.forEach((v, k) => {
    const i = k + 1;
    ev.push(line(6), ...(i === 1 ? B.set("i", 1) : B.calc("i", ["i", 1], "i ＋ 1", i)));
    const ref = `score[${i}]`;
    const first = mode === "a80" ? v > 80 : v >= 80;
    ev.push(line(7), ...B.cmp([ref, 80], `${v} ${mode === "a80" ? "＞" : "≧"} 80`, first));
    const second = mode === "b60" ? v >= 60 : v > 60;
    const secondOp = mode === "b60" ? "≧" : "＞";
    if (first) {
      ev.push(line(8), ...inc("a"));
      if (mode === "both") {
        ev.push(line(9), ...B.cmp([ref, 60], `${v} ${secondOp} 60`, second));
        if (second) ev.push(line(10), ...inc("b"));
      }
    } else {
      ev.push(line(9), ...B.cmp([ref, 60], `${v} ${secondOp} 60`, second));
      if (second) ev.push(line(10), ...inc("b"));
      else ev.push(line(11), line(12), ...inc("c"));
    }
    ev.push(line(13), line(14));
  });
  return ev;
}

const cond5 = {
  id: "cond-5",
  genre: "cond",
  level: 5,
  title: "せいせき しらべ",
  concepts: ["if", "elseif", "loop", "array", "boundary"],
  field: C5_FIELD,
  vars: {},
  varColors: { score: "#FFA726", i: "#4FC3F7", a: "#EF5350", b: "#66BB6A", c: "#AB47BC" },
  program: {
    ja: [
      "整数の 配列 score を 用意して {80, 60, 59, 90, 70} を入れる",
      "整数の 変数 i、a、b、c を 用意する",
      "a に 0 を入れる",
      "b に 0 を入れる",
      "c に 0 を入れる",
      "i を 1 から score の要素数 まで 1 ずつ増やしながら くりかえす",
      "  もし score の i 番目が 80 以上なら",
      "    a を 1 増やす",
      "  そうでなく、もし score の i 番目が 60 より大きいなら",
      "    b を 1 増やす",
      "  そうでなければ",
      "    c を 1 増やす",
      "  （もし ここまで）",
      "（くりかえし ここまで）",
    ],
    code: [
      "整数型の配列: score ← {80, 60, 59, 90, 70}",
      "整数型: i, a, b, c",
      "a ← 0",
      "b ← 0",
      "c ← 0",
      "for (i を 1 から score の要素数 まで 1 ずつ増やす)",
      "  if (score[i] が 80 以上)",
      "    a ← a ＋ 1",
      "  elseif (score[i] が 60 より大きい)",
      "    b ← b ＋ 1",
      "  else",
      "    c ← c ＋ 1",
      "  endif",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "score の要素数 は，配列 score に入っている値の個数（5）である。"],
  question: "処理が終わったとき、a、b、c の値はいくつですか？",
  answerType: "vars",
  choices: [
    { ja: "a は 2、b は 1、c は 2", code: "a = 2, b = 1, c = 2", correct: true },
    {
      ja: "a は 2、b は 2、c は 1",
      code: "a = 2, b = 2, c = 1",
      wrongFeedback: "9行目は「60 より大きい」です。60 は 60 より大きくないので、score[2] の 60 は b ではなく c に数えます。",
      events: [...cond5Events("b60"), mismatch()],
    },
    {
      ja: "a は 1、b は 2、c は 2",
      code: "a = 1, b = 2, c = 2",
      wrongFeedback: "7行目は「80 以上」です。80 も ふくむので、score[1] の 80 は a に数えます。",
      events: [...cond5Events("a80"), mismatch()],
    },
    {
      ja: "a は 2、b は 3、c は 2",
      code: "a = 2, b = 3, c = 2",
      wrongFeedback: "7行目が成り立ったら、9行目の条件は調べません（実行されるのは どれか1つだけ）。80 や 90 を b にも数えていませんか？",
      events: [...cond5Events("both"), mismatch()],
    },
  ],
  events: [...cond5Events("correct"), end()],
  expectedFinal: { vars: { a: 2, b: 1, c: 2 } },
  hints: [
    "score[1] の 80 は「80 以上」が成り立つので a が 1 増えます。score[2] の 60 は「80 以上」でも「60 より大きい」でもありません。どこに数えるかな？",
    "「60 より大きい」（＞）に 60 は入りません。「80 以上」（≧）には 80 が入ります。また、上から調べて最初に成り立った所だけを実行します。",
    "80→a、60→c、59→c、90→a、70→b と分かれます。",
  ],
  explanation: {
    why: "5つの値を順に調べます。80 は「80 以上」なので a。60 は「60 より大きい」が成り立たない（60 は 60 より大きくない）ので c。59 も c。90 は a。70 は「60 より大きい」なので b。よって a＝2、b＝1、c＝2 です。",
    trace: [
      { line: 5, state: "a=0, b=0, c=0" },
      { line: 8, state: "i=1：score[1]=80 → a=1" },
      { line: 12, state: "i=2：score[2]=60 → c=1" },
      { line: 12, state: "i=3：score[3]=59 → c=2" },
      { line: 8, state: "i=4：score[4]=90 → a=2" },
      { line: 10, state: "i=5：score[5]=70 → b=1" },
    ],
    points: ["「以上」（≧）は境界の数をふくみ、「より大きい」（＞）はふくまない", "if / elseif / else は、上から調べて最初に成り立った所の処理だけを実行する"],
  },
};

export default [cond1, cond2, cond3, cond4, cond5];
