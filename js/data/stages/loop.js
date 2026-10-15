// ③ loop（ぐるぐる まわる）
// 繰返しは実演が長くなるので、イベントは関数で組み立てる（ロジックは持たず、結果の値はここで計算して書く）。
// 2周目以降は runner が自動で速くする（§6.2⑥）。
import { line, end, mismatch, emote, builder, mkField } from "./helpers.js";

/** 2つ・3つの変数ボックス＋計算台（＋比較台）の基本フィールド */
function boxField(vars, { compare = false, cols = 8 } = {}) {
  const ys = vars.length === 2 ? [1, 3] : [0, 2, 4]; // ラベルが重ならないよう1マスずつ空ける
  return mkField({
    cols,
    rows: 5,
    start: { x: 2, y: 2, dir: "right" },
    spawn: { x: 1, y: 2 },
    boxes: vars.map((v, i) => ({ var: v, x: cols - 2, y: ys[i], access: { x: cols - 3, y: ys[i] } })),
    pads: [
      { kind: "calc", x: 3, y: 1, access: { x: 3, y: 2 } },
      ...(compare ? [{ kind: "compare", x: 3, y: 3, access: { x: 3, y: 2 } }] : []),
    ],
  });
}

/** for ループの制御行：1周目は初期値を入れ、2周目からは 1 増やす */
const forStep = (B, n, v, value, first) => [line(n), ...(first ? B.set(v, value) : B.calc(v, [v, 1], `${v} ＋ 1`, value))];

// ---- loop-1：3回 くりかえす ----
const L1_FIELD = boxField(["x", "k"]);
function loop1Events(times) {
  const B = builder(L1_FIELD);
  const ev = [line(1), ...B.set("x", 0), line(2)];
  for (let k = 1; k <= times; k++) ev.push(...forStep(B, 3, "k", k, k === 1), line(4), ...B.calc("x", ["x", 2], "x ＋ 2", 2 * k), line(5));
  return ev;
}

const loop1 = {
  id: "loop-1",
  genre: "loop",
  level: 1,
  title: "3かい くりかえし",
  concepts: ["for"],
  intro: "「くりかえす」（ぎじコードの for）は、なかの しょりを なんども じっこうするよ。\nk が 1, 2, 3 と かわるたびに 1かいずつ。",
  field: L1_FIELD,
  vars: {},
  varColors: { x: "#4FC3F7", k: "#FFB74D" },
  program: {
    ja: ["整数の 変数 x を 用意して 0 を入れる", "整数の 変数 k を 用意する", "k を 1 から 3 まで 1 ずつ増やしながら くりかえす", "  x を 2 増やす", "（くりかえし ここまで）"],
    code: ["整数型: x ← 0", "整数型: k", "for (k を 1 から 3 まで 1 ずつ増やす)", "  x ← x ＋ 2", "endfor"],
  },
  question: "処理が終わったとき、x の値はいくつですか？",
  answerType: "vars",
  choices: [
    { ja: "x は 6", code: "x = 6", correct: true },
    {
      ja: "x は 2",
      code: "x = 2",
      wrongFeedback: "4行目は1回だけではありません。k が 1、2、3 のそれぞれで実行されます。",
      events: [...loop1Events(1), mismatch()],
    },
    {
      ja: "x は 4",
      code: "x = 4",
      wrongFeedback: "「1 から 3 まで」は 3 もふくみます。k が 3 のときも 4行目を実行します。",
      events: [...loop1Events(2), mismatch()],
    },
    {
      ja: "x は 8",
      code: "x = 8",
      wrongFeedback: "k は 1、2、3 の 3回です。4回ではありません。",
      events: [...loop1Events(4), mismatch()],
    },
  ],
  events: [...loop1Events(3), end()],
  expectedFinal: { vars: { x: 6 } },
  hints: [
    "3行目の くりかえしで、k は 1 → 2 → 3 と変わります。1回目のあと x は 0＋2＝2 です。",
    "k が 1、2、3 の それぞれで 4行目を1回ずつ実行します。全部で何回 x を 2 増やすかな？",
    "3回 実行して、x は 2 → 4 → 6 と増えます。",
  ],
  explanation: {
    why: "k を 1 から 3 まで 1 ずつ増やしながら くりかえすので、4行目は k＝1、2、3 の 3回実行されます。x は 0 → 2 → 4 → 6 になります。",
    trace: [
      { line: 1, state: "x=0" },
      { line: 4, state: "k=1 のとき x=2" },
      { line: 4, state: "k=2 のとき x=4" },
      { line: 4, state: "k=3 のとき x=6" },
    ],
    points: ["「1 から 3 まで 1 ずつ増やす」は 1, 2, 3 の 3回", "くりかえしの中の処理は、1回ごとに上から順に実行される"],
  },
};

// ---- loop-2：1 から 5 までの合計 ----
const L2_FIELD = boxField(["sum", "i"]);
function loop2Events(from, to) {
  const B = builder(L2_FIELD);
  const ev = [line(1), ...B.set("sum", 0), line(2)];
  let sum = 0;
  for (let i = from; i <= to; i++) {
    sum += i;
    ev.push(...forStep(B, 3, "i", i, i === from), line(4), ...B.calc("sum", ["sum", "i"], "sum ＋ i", sum), line(5));
  }
  return ev;
}

const loop2 = {
  id: "loop-2",
  genre: "loop",
  level: 2,
  title: "ぜんぶ たそう",
  concepts: ["for", "sum"],
  field: L2_FIELD,
  vars: {},
  varColors: { sum: "#4FC3F7", i: "#FFB74D" },
  program: {
    ja: ["整数の 変数 sum を 用意して 0 を入れる", "整数の 変数 i を 用意する", "i を 1 から 5 まで 1 ずつ増やしながら くりかえす", "  sum に i を 足す", "（くりかえし ここまで）"],
    code: ["整数型: sum ← 0", "整数型: i", "for (i を 1 から 5 まで 1 ずつ増やす)", "  sum ← sum ＋ i", "endfor"],
  },
  question: "処理が終わったとき、sum の値はいくつですか？",
  answerType: "vars",
  choices: [
    { ja: "sum は 15", code: "sum = 15", correct: true },
    {
      ja: "sum は 10",
      code: "sum = 10",
      wrongFeedback: "「1 から 5 まで」は 5 もふくみます。i が 5 のときも sum に足します。",
      events: [...loop2Events(1, 4), mismatch()],
    },
    {
      ja: "sum は 14",
      code: "sum = 14",
      wrongFeedback: "i は 1 から始まります。最初に足すのは 1 です。",
      events: [...loop2Events(2, 5), mismatch()],
    },
    {
      ja: "sum は 21",
      code: "sum = 21",
      wrongFeedback: "i が 5 のところで くりかえしは終わります。6 は足しません。",
      events: [...loop2Events(1, 6), mismatch()],
    },
  ],
  events: [...loop2Events(1, 5), end()],
  expectedFinal: { vars: { sum: 15 } },
  hints: [
    "1回目は i＝1 なので sum＝0＋1＝1、2回目は i＝2 で sum＝1＋2＝3…と、i と sum を表にして追ってみよう。",
    "i は 1 から 5 まで。5 もふくむので 5回 足します。",
    "sum は 1 → 3 → 6 → 10 → 15 と増えます。",
  ],
  explanation: {
    why: "i が 1、2、3、4、5 のそれぞれで sum に i を足すので、sum＝1＋2＋3＋4＋5＝15 です。",
    trace: [
      { line: 4, state: "i=1, sum=1" },
      { line: 4, state: "i=2, sum=3" },
      { line: 4, state: "i=3, sum=6" },
      { line: 4, state: "i=4, sum=10" },
      { line: 4, state: "i=5, sum=15" },
    ],
    points: ["合計を求めるときは、合計用の変数を 0 にしてから 1つずつ足していく", "くりかえしの範囲（はじめと終わり）を正確に数える"],
  },
};

// ---- loop-3：while と、奇数だけ足す ----
const L3_FIELD = boxField(["n", "total", "count"], { compare: true });
/**
 * mode：correct / early（total が 9 のところで終わると思う）/ countInIf（count を if の中だと思う）/ noIf（if を無視して全部足す）
 */
function loop3Events(mode) {
  const B = builder(L3_FIELD);
  const ev = [line(1), ...B.set("n", 1), line(2), ...B.set("total", 0), line(3), ...B.set("count", 0)];
  let n = 1;
  let total = 0;
  let count = 0;
  for (;;) {
    if (mode === "early" && count === 5) {
      ev.push(line(4), emote("think"));
      break;
    }
    const go = total < 10;
    ev.push(line(4), ...B.cmp(["total", 10], `${total} ＜ 10`, go));
    if (!go) break;
    const odd = n % 2 === 1;
    if (mode === "noIf") {
      ev.push(line(5), emote("think"));
      total += n;
      ev.push(line(6), ...B.calc("total", ["total", "n"], "total ＋ n", total));
    } else {
      ev.push(line(5), ...B.cmp(["n", 2, 1], `${n} mod 2 ＝ 1`, odd));
      if (odd) {
        total += n;
        ev.push(line(6), ...B.calc("total", ["total", "n"], "total ＋ n", total));
        if (mode === "countInIf") {
          count += 1;
          ev.push(line(9), ...B.calc("count", ["count", 1], "count ＋ 1", count));
        }
      }
    }
    ev.push(line(7));
    n += 1;
    ev.push(line(8), ...B.calc("n", ["n", 1], "n ＋ 1", n));
    if (mode !== "countInIf") {
      count += 1;
      ev.push(line(9), ...B.calc("count", ["count", 1], "count ＋ 1", count));
    }
    ev.push(line(10));
  }
  return ev;
}

const loop3 = {
  id: "loop-3",
  genre: "loop",
  level: 3,
  title: "きすうを あつめて",
  concepts: ["while", "mod", "count"],
  field: L3_FIELD,
  vars: {},
  varColors: { n: "#4FC3F7", total: "#66BB6A", count: "#F06292" },
  program: {
    ja: [
      "整数の 変数 n を 用意して 1 を入れる",
      "整数の 変数 total を 用意して 0 を入れる",
      "整数の 変数 count を 用意して 0 を入れる",
      "total が 10 より小さい あいだ くりかえす",
      "  もし n を 2 で割った余りが 1 なら",
      "    total に n を 足す",
      "  （もし ここまで）",
      "  n を 1 増やす",
      "  count を 1 増やす",
      "（くりかえし ここまで）",
    ],
    code: [
      "整数型: n ← 1",
      "整数型: total ← 0",
      "整数型: count ← 0",
      "while (total が 10 より小さい)",
      "  if (n mod 2 が 1 と等しい)",
      "    total ← total ＋ n",
      "  endif",
      "  n ← n ＋ 1",
      "  count ← count ＋ 1",
      "endwhile",
    ],
  },
  notes: ["n mod 2 は，n を 2 で割った余りである（n が奇数なら 1，偶数なら 0）。"],
  question: "処理が終わったとき、count と total の値はいくつですか？",
  answerType: "vars",
  choices: [
    { ja: "count は 7、total は 16", code: "count = 7, total = 16", correct: true },
    {
      ja: "count は 5、total は 9",
      code: "count = 5, total = 9",
      wrongFeedback: "total が 9 のときも「10 より小さい」が成り立つので、まだ くりかえします。くりかえしが終わるのは total が 10 以上になったときです。",
      events: [...loop3Events("early"), mismatch()],
    },
    {
      ja: "count は 4、total は 16",
      code: "count = 4, total = 16",
      wrongFeedback: "9行目の「count を 1 増やす」は「もし ここまで」（疑似コードの endif）の後なので、奇数でも偶数でも毎回 実行されます。",
      events: [...loop3Events("countInIf"), mismatch()],
    },
    {
      ja: "count は 4、total は 10",
      code: "count = 4, total = 10",
      wrongFeedback: "6行目で足すのは n が奇数のとき（n を 2 で割った余りが 1 のとき）だけです。偶数は足しません。",
      events: [...loop3Events("noIf"), mismatch()],
    },
  ],
  events: [...loop3Events("correct"), end()],
  expectedFinal: { vars: { count: 7, total: 16 } },
  hints: [
    "1回目：total＝0 は 10 より小さいので実行。n＝1 は奇数なので total＝1。そのあと n＝2、count＝1。この調子で n、total、count を表に書いていこう。",
    "足すのは n が奇数（1, 3, 5, 7…）のときだけ。count は毎回 1 増えます。4行目の条件は、毎回 くりかえしの始めに調べます。",
    "total は 1 → 4 → 9 → 16 と増えます。total＝16 になった時点で くりかえしは終わります。それまでに何回くりかえしたかな？",
  ],
  explanation: {
    why: "n＝1, 3, 5, 7 のときだけ total に足すので、total は 1 → 4 → 9 → 16。total＝9 の時点ではまだ 10 より小さいので続き、n＝7 を足して 16 になったところで終わります。n は 1〜7 まで進んだので、くりかえしは 7回、count＝7 です。",
    trace: [
      { line: 9, state: "1回目：n=1 を足す → total=1, count=1" },
      { line: 9, state: "2回目：n=2 は偶数 → total=1, count=2" },
      { line: 9, state: "3回目：n=3 を足す → total=4, count=3" },
      { line: 9, state: "4回目：n=4 は偶数 → total=4, count=4" },
      { line: 9, state: "5回目：n=5 を足す → total=9, count=5" },
      { line: 9, state: "6回目：n=6 は偶数 → total=9, count=6" },
      { line: 9, state: "7回目：n=7 を足す → total=16, count=7" },
      { line: 4, state: "total=16 は 10 より小さくない → おわり" },
    ],
    points: ["while（あいだ くりかえす）は、毎回 くりかえしの始めに条件を調べる", "if の外にある処理は、条件に関係なく毎回 実行される"],
  },
};

// ---- loop-4：二重ループ ----
const L4_FIELD = boxField(["i", "j", "cnt"]);
/** inner(i)：内側の j の範囲 [from, to]、add(i, j)：足す値 */
function loop4Events(inner, add) {
  const B = builder(L4_FIELD);
  const ev = [line(1), line(2), ...B.set("cnt", 0)];
  let cnt = 0;
  for (let i = 1; i <= 3; i++) {
    ev.push(...forStep(B, 3, "i", i, i === 1));
    const [from, to] = inner(i);
    for (let j = from; j <= to; j++) {
      ev.push(...forStep(B, 4, "j", j, j === from));
      const v = add(i, j);
      cnt += v;
      const src = v === j ? "j" : "i";
      ev.push(line(5), ...B.calc("cnt", ["cnt", src], `cnt ＋ ${src}`, cnt), line(6));
    }
    ev.push(line(7));
  }
  return ev;
}

const loop4 = {
  id: "loop-4",
  genre: "loop",
  level: 4,
  title: "にじゅうの ループ",
  concepts: ["for", "nested"],
  field: L4_FIELD,
  vars: {},
  varColors: { i: "#FFB74D", j: "#9575CD", cnt: "#4FC3F7" },
  program: {
    ja: [
      "整数の 変数 i と j を 用意する",
      "整数の 変数 cnt を 用意して 0 を入れる",
      "i を 1 から 3 まで 1 ずつ増やしながら くりかえす",
      "  j を 1 から i まで 1 ずつ増やしながら くりかえす",
      "    cnt に j を 足す",
      "  （くりかえし ここまで）",
      "（くりかえし ここまで）",
    ],
    code: [
      "整数型: i, j",
      "整数型: cnt ← 0",
      "for (i を 1 から 3 まで 1 ずつ増やす)",
      "  for (j を 1 から i まで 1 ずつ増やす)",
      "    cnt ← cnt ＋ j",
      "  endfor",
      "endfor",
    ],
  },
  question: "処理が終わったとき、cnt の値はいくつですか？",
  answerType: "vars",
  choices: [
    { ja: "cnt は 10", code: "cnt = 10", correct: true },
    {
      ja: "cnt は 18",
      code: "cnt = 18",
      wrongFeedback: "内側の くりかえしは「j を 1 から i まで」です。i によって回数が変わります（i＝1 なら1回）。",
      events: [...loop4Events(() => [1, 3], (i, j) => j), mismatch()],
    },
    {
      ja: "cnt は 14",
      code: "cnt = 14",
      wrongFeedback: "5行目で足すのは j です。i ではありません。",
      events: [...loop4Events((i) => [1, i], (i) => i), mismatch()],
    },
    {
      ja: "cnt は 6",
      code: "cnt = 6",
      wrongFeedback: "内側の くりかえしは1回だけではありません。i＝3 のときは j＝1, 2, 3 の3回です。",
      events: [...loop4Events((i) => [i, i], (i, j) => j), mismatch()],
    },
  ],
  events: [...loop4Events((i) => [1, i], (i, j) => j), end()],
  expectedFinal: { vars: { cnt: 10 } },
  hints: [
    "i＝1 のとき、内側は j＝1 の1回だけで cnt＝1。i＝2 のときは j＝1、2 の2回で、cnt に 1 と 2 を足します。",
    "内側の回数は i によって変わり、足すのは j の値です。i＝3 のときは 1＋2＋3 を足します。",
    "cnt＝1 ＋（1＋2）＋（1＋2＋3）です。",
  ],
  explanation: {
    why: "外側の i が 1、2、3 と変わるたびに、内側で j を 1 から i まで くりかえして j を足します。i＝1 で 1、i＝2 で 1＋2、i＝3 で 1＋2＋3。合計 cnt＝1＋3＋6＝10 です。",
    trace: [
      { line: 5, state: "i=1, j=1 → cnt=1" },
      { line: 5, state: "i=2, j=1 → cnt=2" },
      { line: 5, state: "i=2, j=2 → cnt=4" },
      { line: 5, state: "i=3, j=1 → cnt=5" },
      { line: 5, state: "i=3, j=2 → cnt=7" },
      { line: 5, state: "i=3, j=3 → cnt=10" },
    ],
    points: ["二重ループでは、外側が1回進むたびに内側が最初から最後まで くりかえす", "内側の範囲が外側の変数（i）で決まるときは、i ごとに回数が変わる"],
  },
};

// ---- loop-5：二重ループ＋条件＋配列への書き込み ----
const L5_FIELD = mkField({
  cols: 9,
  rows: 7,
  start: { x: 1, y: 3, dir: "right" },
  spawn: { x: 4, y: 2 },
  arrays: [
    { name: "a", x: 1, y: 0, values: [3, 8, 2, 7] },
    { name: "b", x: 1, y: 6, values: [0, 0, 0, 0], access: "up" },
  ],
  boxes: [
    { var: "i", x: 7, y: 1, access: { x: 6, y: 1 } },
    { var: "j", x: 7, y: 3, access: { x: 6, y: 3 } },
    { var: "c", x: 7, y: 5, access: { x: 6, y: 5 } },
  ],
  pads: [
    { kind: "compare", x: 3, y: 3, access: { x: 3, y: 2 } },
    { kind: "calc", x: 5, y: 3, access: { x: 5, y: 4 } },
  ],
});
const A5 = [3, 8, 2, 7];
/**
 * test(aj, ai)：比べ方、op：表示する記号、reset：5行目（c ← 0）を毎回実行するか
 */
function loop5Events(test, op, reset = true) {
  const B = builder(L5_FIELD);
  const ev = [line(1), line(2), line(3)];
  let c = 0;
  A5.forEach((ai, k) => {
    const i = k + 1;
    ev.push(...forStep(B, 4, "i", i, i === 1));
    if (reset || i === 1) {
      c = 0;
      ev.push(line(5), ...B.set("c", 0));
    } else ev.push(line(5), emote("think"));
    A5.forEach((aj, m) => {
      const j = m + 1;
      ev.push(...forStep(B, 6, "j", j, j === 1));
      const r = test(aj, ai);
      ev.push(line(7), ...B.cmp([`a[${j}]`, `a[${i}]`], `${aj} ${op} ${ai}`, r));
      if (r) {
        c += 1;
        ev.push(line(8), ...B.calc("c", ["c", 1], "c ＋ 1", c));
      }
      ev.push(line(9), line(10));
    });
    ev.push(line(11), ...B.copy(`b[${i}]`, "c"), line(12));
  });
  return ev;
}

const loop5 = {
  id: "loop-5",
  genre: "loop",
  level: 5,
  title: "じぶんより 大きいのは いくつ？",
  concepts: ["for", "nested", "array", "count"],
  field: L5_FIELD,
  vars: {},
  varColors: { a: "#FFA726", b: "#26A69A", i: "#4FC3F7", j: "#9575CD", c: "#F06292" },
  program: {
    ja: [
      "整数の 配列 a を 用意して {3, 8, 2, 7} を入れる",
      "整数の 配列 b を 用意して {0, 0, 0, 0} を入れる",
      "整数の 変数 i、j、c を 用意する",
      "i を 1 から a の要素数 まで 1 ずつ増やしながら くりかえす",
      "  c に 0 を入れる",
      "  j を 1 から a の要素数 まで 1 ずつ増やしながら くりかえす",
      "    もし a の j 番目が a の i 番目より大きいなら",
      "      c を 1 増やす",
      "    （もし ここまで）",
      "  （くりかえし ここまで）",
      "  c の値を b の i 番目に入れる",
      "（くりかえし ここまで）",
    ],
    code: [
      "整数型の配列: a ← {3, 8, 2, 7}",
      "整数型の配列: b ← {0, 0, 0, 0}",
      "整数型: i, j, c",
      "for (i を 1 から a の要素数 まで 1 ずつ増やす)",
      "  c ← 0",
      "  for (j を 1 から a の要素数 まで 1 ずつ増やす)",
      "    if (a[j] が a[i] より大きい)",
      "      c ← c ＋ 1",
      "    endif",
      "  endfor",
      "  b[i] ← c",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "a の要素数 は，配列 a に入っている値の個数（4）である。"],
  question: "処理が終わったとき、配列 b の内容はどうなっていますか？",
  answerType: "arrays",
  choices: [
    { ja: "b は {2, 0, 3, 1}", code: "b = {2, 0, 3, 1}", correct: true },
    {
      ja: "b は {1, 3, 0, 2}",
      code: "b = {1, 3, 0, 2}",
      wrongFeedback: "7行目は「a[j] が a[i] より大きい」です。a[i] より小さいものを数えていませんか？",
      events: [...loop5Events((aj, ai) => aj < ai, "＜"), mismatch()],
    },
    {
      ja: "b は {3, 1, 4, 2}",
      code: "b = {3, 1, 4, 2}",
      wrongFeedback: "これは「大きい順の順位」です。7行目は「より大きい」なので、同じ値（j＝i のときの自分自身）は数えません。b[i] には「a[i] より大きい値の個数」が入ります。",
      events: [...loop5Events((aj, ai) => aj >= ai, "≧"), mismatch()],
    },
    {
      ja: "b は {2, 2, 5, 6}",
      code: "b = {2, 2, 5, 6}",
      wrongFeedback: "5行目の「c に 0 を入れる」は外側の くりかえしの中なので、i が変わるたびに c は 0 に戻ります。",
      events: [...loop5Events((aj, ai) => aj > ai, "＞", false), mismatch()],
    },
  ],
  events: [...loop5Events((aj, ai) => aj > ai, "＞"), end()],
  expectedFinal: { arrays: { b: [2, 0, 3, 1] } },
  hints: [
    "i＝1 のとき a[1]＝3。内側で a[1]〜a[4]（3, 8, 2, 7）のうち 3 より大きいものを数えると 8 と 7 で c＝2。それが 11行目で b[1] に入ります。",
    "5行目で c は i ごとに 0 に戻ります。比べるのは「a[j] が a[i] より大きい」なので、同じ値（自分自身）は数えません。",
    "b[1]＝2、b[2]＝0（8 より大きい数はない）、b[3]＝3。b[4]（7 より大きい数）も同じように数えてみよう。",
  ],
  explanation: {
    why: "各 i について、a[i] より大きい要素の個数を数えて b[i] に入れる処理です。3 より大きいのは 8、7 の2個、8 より大きいのは 0個、2 より大きいのは 3、8、7 の3個、7 より大きいのは 8 の1個。よって b＝{2, 0, 3, 1}。",
    trace: [
      { line: 11, state: "i=1：a[1]=3 より大きいのは 8, 7 → b=[2, 0, 0, 0]" },
      { line: 11, state: "i=2：a[2]=8 より大きいのは なし → b=[2, 0, 0, 0]" },
      { line: 11, state: "i=3：a[3]=2 より大きいのは 3, 8, 7 → b=[2, 0, 3, 0]" },
      { line: 11, state: "i=4：a[4]=7 より大きいのは 8 → b=[2, 0, 3, 1]" },
    ],
    points: [
      "二重ループで「ある値と全部を比べる」処理は、外側で基準を決め、内側で1つずつ比べる",
      "数える変数（c）を0に戻す位置（外側の中か外か）で結果が変わる",
      "b[i] は「a[i] より大きい値の個数」なので、大きい順の順位とは1ずれる（順位＝b[i]＋1。この例なら {3, 1, 4, 2}）",
    ],
  },
};

export default [loop1, loop2, loop3, loop4, loop5];
