// ③ loop（ぐるぐる まわる）
// 繰返しは実演が長くなるので、イベントは関数で組み立てる（ロジックは持たず、結果の値はここで計算して書く）。
// 2周目以降は runner が自動で速くする（§6.2⑥）。
import { line, end, emote, builder, mkField, autoField } from "./helpers.js";

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
function loop1Events() {
  const B = builder(L1_FIELD);
  const ev = [line(1), ...B.set("x", 0), line(2)];
  for (let k = 1; k <= 3; k++) ev.push(...forStep(B, 3, "k", k, k === 1), line(4), ...B.calc("x", ["x", 2], "x ＋ 2", 2 * k), line(5));
  return ev;
}

const loop1 = {
  id: "loop-1",
  genre: "loop",
  level: 1,
  title: "3かい くりかえし",
  concepts: ["for"],
  intro: "for は、endfor までの しょりを なんども じっこうするよ。\nk が 1, 2, 3 と かわるたびに 1かいずつ。",
  field: L1_FIELD,
  vars: {},
  varColors: { x: "#4FC3F7", k: "#FFB74D" },
  program: {
    ja: [
      "整数の 変数 x を 用意して、0 を入れる",
      "整数の 変数 k を 用意する",
      "k を 1 から 3 まで 1ずつ 増やしながら、4行目を くりかえす",
      "  x の値に 2 を 足して、その答えを x に入れる",
      "（くりかえす 範囲は ここまで。3行目に もどる）",
    ],
    code: ["整数型: x ← 0", "整数型: k", "for (k を 1 から 3 まで 1 ずつ増やす)", "  x ← x ＋ 2", "endfor"],
  },
  question: "プログラムを 実行し終わったときの x の値は どれか。",
  answerType: "vars",
  choices: [
    { ja: "x は 6", code: "x = 6", correct: true },
    {
      ja: "x は 2",
      code: "x = 2",
      wrongFeedback: "4行目は1回だけではありません。k が 1、2、3 のそれぞれで実行されます。",
      stop: { line: 3, nth: 2 },
    },
    {
      ja: "x は 4",
      code: "x = 4",
      wrongFeedback: "「1 から 3 まで」は 3 もふくみます。k が 3 のときも 4行目を実行します。",
      stop: { line: 3, nth: 3 },
    },
    {
      ja: "x は 8",
      code: "x = 8",
      wrongFeedback: "k は 1、2、3 の 3回です。4回ではありません。",
      stop: { line: 3, nth: 3 },
    },
  ],
  events: [...loop1Events(), end()],
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
function loop2Events() {
  const B = builder(L2_FIELD);
  const ev = [line(1), ...B.set("sum", 0), line(2)];
  let sum = 0;
  for (let i = 1; i <= 5; i++) {
    sum += i;
    ev.push(...forStep(B, 3, "i", i, i === 1), line(4), ...B.calc("sum", ["sum", "i"], "sum ＋ i", sum), line(5));
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
    ja: [
      "整数の 変数 sum を 用意して、0 を入れる",
      "整数の 変数 i を 用意する",
      "i を 1 から 5 まで 1ずつ 増やしながら、4行目を くりかえす",
      "  sum の値に i の値を 足して、その答えを sum に入れる",
      "（くりかえす 範囲は ここまで。3行目に もどる）",
    ],
    code: ["整数型: sum ← 0", "整数型: i", "for (i を 1 から 5 まで 1 ずつ増やす)", "  sum ← sum ＋ i", "endfor"],
  },
  question: "プログラムを 実行し終わったときの sum の値は どれか。",
  answerType: "vars",
  choices: [
    { ja: "sum は 15", code: "sum = 15", correct: true },
    {
      ja: "sum は 10",
      code: "sum = 10",
      wrongFeedback: "「1 から 5 まで」は 5 もふくみます。i が 5 のときも sum に足します。",
      stop: { line: 3, nth: 5 },
    },
    {
      ja: "sum は 14",
      code: "sum = 14",
      wrongFeedback: "i は 1 から始まります。最初に足すのは 1 です。",
      stop: { line: 3 },
    },
    {
      ja: "sum は 21",
      code: "sum = 21",
      wrongFeedback: "i が 5 のところで くりかえしは終わります。6 は足しません。",
      stop: { line: 3, nth: 5 },
    },
  ],
  events: [...loop2Events(), end()],
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
function loop3Events() {
  const B = builder(L3_FIELD);
  const ev = [line(1), ...B.set("n", 1), line(2), ...B.set("total", 0), line(3), ...B.set("count", 0)];
  let n = 1;
  let total = 0;
  let count = 0;
  for (;;) {
    const go = total < 10;
    ev.push(line(4), ...B.cmp(["total", 10], `${total} ＜ 10`, go));
    if (!go) break;
    const odd = n % 2 === 1;
    ev.push(line(5), ...B.cmp(["n", 2, 1], `${n} mod 2 ＝ 1`, odd));
    if (odd) {
      total += n;
      ev.push(line(6), ...B.calc("total", ["total", "n"], "total ＋ n", total));
    }
    ev.push(line(7));
    n += 1;
    ev.push(line(8), ...B.calc("n", ["n", 1], "n ＋ 1", n));
    count += 1;
    ev.push(line(9), ...B.calc("count", ["count", 1], "count ＋ 1", count), line(10));
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
      "整数の 変数 n を 用意して、1 を入れる",
      "整数の 変数 total を 用意して、0 を入れる",
      "整数の 変数 count を 用意して、0 を入れる",
      "total が 10 より小さい あいだ、5〜9行目を くりかえす",
      "  もし n を 2 で割った 余りが 1（n が 奇数）なら、6行目を 実行する",
      "    total の値に n の値を 足して、その答えを total に入れる",
      "  （ここで 分かれ道は おわり）",
      "  n を 1 増やす",
      "  count を 1 増やす",
      "（くりかえす 範囲は ここまで。4行目に もどる）",
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
  question: "プログラムを 実行し終わったときの count と total の値の 組合せは どれか。",
  answerType: "vars",
  choices: [
    { ja: "count は 7、total は 16", code: "count = 7, total = 16", correct: true },
    {
      ja: "count は 5、total は 9",
      code: "count = 5, total = 9",
      wrongFeedback: "total が 9 のときも「10 より小さい」が成り立つので、まだ くりかえします。くりかえしが終わるのは total が 10 以上になったときです。",
      stop: { line: 4, nth: 6 },
    },
    {
      ja: "count は 4、total は 16",
      code: "count = 4, total = 16",
      wrongFeedback: "9行目の「count を 1 増やす」は 7行目の endif（分かれ道の おわり）の後なので、奇数でも偶数でも毎回 実行されます。",
      stop: { line: 9, nth: 2 },
    },
    {
      ja: "count は 4、total は 10",
      code: "count = 4, total = 10",
      wrongFeedback: "6行目で足すのは n が奇数のとき（n を 2 で割った余りが 1 のとき）だけです。偶数は足しません。",
      stop: { line: 5, nth: 2 },
    },
  ],
  events: [...loop3Events(), end()],
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
    points: ["while（～の あいだ くりかえす）は、毎回 くりかえしの始めに条件を調べる", "if の外にある処理は、条件に関係なく毎回 実行される"],
  },
};

// ---- loop-4：二重ループ ----
const L4_FIELD = boxField(["i", "j", "cnt"]);
function loop4Events() {
  const B = builder(L4_FIELD);
  const ev = [line(1), line(2), ...B.set("cnt", 0)];
  let cnt = 0;
  for (let i = 1; i <= 3; i++) {
    ev.push(...forStep(B, 3, "i", i, i === 1));
    for (let j = 1; j <= i; j++) {
      ev.push(...forStep(B, 4, "j", j, j === 1));
      cnt += j;
      ev.push(line(5), ...B.calc("cnt", ["cnt", "j"], "cnt ＋ j", cnt), line(6));
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
      "整数の 変数 cnt を 用意して、0 を入れる",
      "i を 1 から 3 まで 1ずつ 増やしながら、4〜6行目を くりかえす",
      "  j を 1 から i まで 1ずつ 増やしながら、5行目を くりかえす",
      "    cnt の値に j の値を 足して、その答えを cnt に入れる",
      "  （内側の くりかえす 範囲は ここまで。4行目に もどる）",
      "（外側の くりかえす 範囲は ここまで。3行目に もどる）",
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
  question: "プログラムを 実行し終わったときの cnt の値は どれか。",
  answerType: "vars",
  choices: [
    { ja: "cnt は 10", code: "cnt = 10", correct: true },
    {
      ja: "cnt は 18",
      code: "cnt = 18",
      wrongFeedback: "内側の くりかえしは「j を 1 から i まで」です。i によって回数が変わります（i＝1 なら1回）。",
      stop: { line: 7, mark: [4] },
    },
    {
      ja: "cnt は 14",
      code: "cnt = 14",
      wrongFeedback: "5行目で足すのは j です。i ではありません。",
      stop: { line: 5, nth: 2 },
    },
    {
      ja: "cnt は 6",
      code: "cnt = 6",
      wrongFeedback: "内側の くりかえしは1回だけではありません。i＝3 のときは j＝1, 2, 3 の3回です。",
      stop: { line: 4, nth: 2 },
    },
  ],
  events: [...loop4Events(), end()],
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
function loop5Events() {
  const B = builder(L5_FIELD);
  const ev = [line(1), line(2), line(3)];
  let c = 0;
  A5.forEach((ai, k) => {
    const i = k + 1;
    ev.push(...forStep(B, 4, "i", i, i === 1));
    c = 0;
    ev.push(line(5), ...B.set("c", 0));
    A5.forEach((aj, m) => {
      const j = m + 1;
      ev.push(...forStep(B, 6, "j", j, j === 1));
      const r = aj > ai;
      ev.push(line(7), ...B.cmp([`a[${j}]`, `a[${i}]`], `${aj} ＞ ${ai}`, r));
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
      "整数の 配列 a を 用意して、{3, 8, 2, 7} を入れる",
      "整数の 配列 b を 用意して、{0, 0, 0, 0} を入れる",
      "整数の 変数 i、j、c を 用意する",
      "i を 1 から a の要素数（4）まで 1ずつ 増やしながら、5〜11行目を くりかえす",
      "  c に 0 を入れる",
      "  j を 1 から a の要素数（4）まで 1ずつ 増やしながら、7〜9行目を くりかえす",
      "    もし a の j番目 が a の i番目 より大きい なら、8行目を 実行する",
      "      c を 1 増やす",
      "    （ここで 分かれ道は おわり）",
      "  （内側の くりかえす 範囲は ここまで。6行目に もどる）",
      "  c の値を b の i番目 に入れる",
      "（外側の くりかえす 範囲は ここまで。4行目に もどる）",
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
  question: "プログラムを 実行し終わったときの 配列 b の内容は どれか。",
  answerType: "arrays",
  choices: [
    { ja: "b は {2, 0, 3, 1}", code: "b = {2, 0, 3, 1}", correct: true },
    {
      ja: "b は {1, 3, 0, 2}",
      code: "b = {1, 3, 0, 2}",
      wrongFeedback: "7行目は「a[j] が a[i] より大きい」です。a[i] より小さいものを数えていませんか？",
      stop: { line: 7, nth: 2 },
    },
    {
      ja: "b は {3, 1, 4, 2}",
      code: "b = {3, 1, 4, 2}",
      wrongFeedback: "これは「大きい順の順位」です。7行目は「より大きい」なので、同じ値（j＝i のときの自分自身）は数えません。b[i] には「a[i] より大きい値の個数」が入ります。",
      stop: { line: 7 },
    },
    {
      ja: "b は {2, 2, 5, 6}",
      code: "b = {2, 2, 5, 6}",
      wrongFeedback: "5行目の「c に 0 を入れる」は外側の くりかえしの中なので、i が変わるたびに c は 0 に戻ります。",
      stop: { line: 5, nth: 2 },
    },
  ],
  events: [...loop5Events(), end()],
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

// ================= 6〜10：穴埋め =================
// 空欄の記号 a・b と まぎれないよう、穴埋めの問題では 変数名・配列名に a・b を使わない。
// 誤答は、その選択肢を空欄に入れたプログラムを実行して見せる（どの誤答も このデータで 目的と ちがう結果になる）。

// ---- loop-6：1 から n までの合計（くりかえしの終わり） ----
const L6_FIELD = autoField(["n", "sum", "i"]);
/** 4行目「i を 1 から ［a］ まで」の終わりの値（くりかえしを始めるときに決まる） */
const L6_END = { n: 4, "n － 1": 3, "n ＋ 1": 5, sum: 0 };
function loop6Run(a) {
  const B = builder(L6_FIELD);
  const ev = [line(1), ...B.set("n", 4), line(2), ...B.set("sum", 0), line(3)];
  const last = L6_END[a];
  if (last < 1) return [...ev, line(4)]; // 1 から 0 まで：1回も くりかえさない
  let sum = 0;
  for (let i = 1; i <= last; i++) {
    sum += i;
    ev.push(...forStep(B, 4, "i", i, i === 1), line(5), ...B.calc("sum", ["sum", "i"], "sum ＋ i", sum), line(6));
  }
  return ev;
}

const loop6 = {
  id: "loop-6",
  genre: "loop",
  level: 6,
  title: "どこまで たすかの あな",
  concepts: ["for", "sum", "blank"],
  intro: "ここからは あなうめ もんだい。［a］ に はいる ものを えらぼう。\n「ここまで すすめる」は、あなの てまえまで つかえるよ。",
  field: L6_FIELD,
  vars: {},
  varColors: { n: "#4FC3F7", sum: "#66BB6A", i: "#FFB74D" },
  program: {
    ja: [
      "整数の 変数 n を 用意して、4 を入れる",
      "整数の 変数 sum を 用意して、0 を入れる",
      "整数の 変数 i を 用意する",
      "i を 1 から ［a］ まで 1ずつ 増やしながら、5行目を くりかえす",
      "  sum の値に i の値を 足して、その答えを sum に入れる",
      "（くりかえす 範囲は ここまで。4行目に もどる）",
    ],
    code: ["整数型: n ← 4", "整数型: sum ← 0", "整数型: i", "for (i を 1 から ［a］ まで 1 ずつ増やす)", "  sum ← sum ＋ i", "endfor"],
  },
  notes: ["for の「1 から ○ まで」の ○ は、くりかえしを 始めるときの値で決まる。○ が 1 より小さいときは 1回も くりかえさない。"],
  question: "次のプログラムは、1 から n までの 整数の 和を sum に 格納する。ここで、n は 1 以上 とする。\nプログラム中の ［a］ に入れる 正しい答えは どれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "n", code: "n", fill: { a: "n" }, correct: true },
    {
      ja: "n － 1",
      code: "n － 1",
      fill: { a: "n － 1" },
      wrongFeedback: "これだと i は n－1（3）までで、n（4）を 足しません（sum＝6）。「1 から n まで」は n も ふくみます。",
      events: loop6Run("n － 1"),
    },
    {
      ja: "n ＋ 1",
      code: "n ＋ 1",
      fill: { a: "n ＋ 1" },
      wrongFeedback: "これだと i が n＋1（5）のときも 足してしまい、sum＝15 に なります。",
      events: loop6Run("n ＋ 1"),
    },
    {
      ja: "sum",
      code: "sum",
      fill: { a: "sum" },
      wrongFeedback: "くりかえしを 始めるとき sum は 0 なので「1 から 0 まで」となり、1回も 足しません（sum＝0）。終わりは「何まで 足すか」の n です。",
      events: loop6Run("sum"),
    },
  ],
  events: [...loop6Run("n"), end()],
  expectedFinal: { vars: { sum: 10 } },
  hints: [
    "1 から n までを 足したいので、i を 1 から いくつまで 増やせば よいかな？",
    "n＝4 なら i＝1, 2, 3, 4 の 4回 足します。",
    "［a］ は n。sum＝1＋2＋3＋4＝10 です。",
  ],
  explanation: {
    why: "1 から n までの合計なので、i を 1 から n まで 増やしながら sum に足します。n＝4 なら sum＝1＋2＋3＋4＝10 です。",
    trace: [
      { line: 5, state: "i=1, sum=1" },
      { line: 5, state: "i=2, sum=3" },
      { line: 5, state: "i=3, sum=6" },
      { line: 5, state: "i=4, sum=10" },
    ],
    points: ["「1 から n まで」は n も ふくむ", "合計は 0 から始めて 1つずつ足す"],
  },
};

// ---- loop-7：階乗（積のはじめの値） ----
const L7_FIELD = autoField(["n", "i", "f"]);
function loop7Run(a) {
  const B = builder(L7_FIELD);
  const ev = [line(1), ...B.set("n", 4), line(2), line(3)];
  if (a === "i") return [...ev, emote("think"), { type: "fail", kind: "error", reason: "i に まだ 値が 入っていない！" }];
  let f;
  if (a === "n") {
    f = 4;
    ev.push(...B.copy("f", "n"));
  } else {
    f = Number(a);
    ev.push(...B.set("f", f));
  }
  for (let i = 1; i <= 4; i++) {
    f *= i;
    ev.push(...forStep(B, 4, "i", i, i === 1), line(5), ...B.calc("f", ["f", "i"], "f × i", f), line(6));
  }
  return ev;
}

const loop7 = {
  id: "loop-7",
  genre: "loop",
  level: 7,
  title: "かけざんの あな",
  concepts: ["for", "product", "blank"],
  field: L7_FIELD,
  vars: {},
  varColors: { n: "#4FC3F7", i: "#FFB74D", f: "#66BB6A" },
  program: {
    ja: [
      "整数の 変数 n を 用意して、4 を入れる",
      "整数の 変数 i を 用意する（まだ 空っぽ）",
      "整数の 変数 f を 用意して、［a］ を 入れる",
      "i を 1 から n まで 1ずつ 増やしながら、5行目を くりかえす",
      "  f の値に i の値を かけて、その答えを f に入れる",
      "（くりかえす 範囲は ここまで。4行目に もどる）",
    ],
    code: ["整数型: n ← 4", "整数型: i", "整数型: f ← ［a］", "for (i を 1 から n まで 1 ずつ増やす)", "  f ← f × i", "endfor"],
  },
  question: "次のプログラムは、n の 階乗（1 × 2 × … × n）を f に 格納する。ここで、n は 1 以上 とする。\nプログラム中の ［a］ に入れる 正しい答えは どれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "1", code: "1", fill: { a: "1" }, correct: true },
    {
      ja: "0",
      code: "0",
      fill: { a: "0" },
      wrongFeedback: "0 から始めると、何を かけても 0 のままです。かけ算を くりかえすときは 1 から始めます。",
      events: loop7Run("0"),
    },
    {
      ja: "n",
      code: "n",
      fill: { a: "n" },
      wrongFeedback: "n から始めると、最初から n を かけた ことになり、n が 2回 かかって 96 に なってしまいます。",
      events: loop7Run("n"),
    },
    {
      ja: "i",
      code: "i",
      fill: { a: "i" },
      wrongFeedback: "3行目の時点で i には まだ 値が入っていません（2行目で 用意しただけ）。値の ない変数は 使えません。",
      events: loop7Run("i"),
    },
  ],
  events: [...loop7Run("1"), end()],
  expectedFinal: { vars: { f: 24 } },
  hints: [
    "かけ算を くりかえして まとめる変数は、何を かけても 変わらない数から 始めます。",
    "足し算の合計は 0 から、かけ算の積は … から始めます。",
    "［a］ は 1。f は 1 → 1 → 2 → 6 → 24 です。",
  ],
  explanation: {
    why: "f に 1、2、3、4 を 順に かけていくので、はじめの f は かけても値が変わらない 1 にします。f＝1×1×2×3×4＝24 です。0 から始めると ずっと 0 のままです。",
    trace: [
      { line: 3, state: "f=1" },
      { line: 5, state: "i=1, f=1" },
      { line: 5, state: "i=2, f=2" },
      { line: 5, state: "i=3, f=6" },
      { line: 5, state: "i=4, f=24" },
    ],
    points: ["積（かけ算のまとめ）は 1 から、和（足し算のまとめ）は 0 から始める", "値を入れていない変数は 使えない"],
  },
};

// ---- loop-8：条件に合う値を数える（配列） ----
const DATA8 = [4, 9, 2, 7, 5];
const L8_FIELD = autoField(["cnt", "i"], { compare: true, arrays: [{ name: "data", values: DATA8 }] });
/** 5行目の条件：[比べる材料, 表示する式, 判定] を i・値から作る */
const L8_TEST = {
  "data[i] が 5 以上": (i, v) => [[`data[${i}]`, 5], `${v} ≧ 5`, v >= 5],
  "data[i] が 5 より大きい": (i, v) => [[`data[${i}]`, 5], `${v} ＞ 5`, v > 5],
  "i が 5 以上": (i) => [["i", 5], `${i} ≧ 5`, i >= 5],
  "data[i] が 5 より小さい": (i, v) => [[`data[${i}]`, 5], `${v} ＜ 5`, v < 5],
};
function loop8Run(a) {
  const B = builder(L8_FIELD);
  const ev = [line(1), line(2), ...B.set("cnt", 0), line(3)];
  let cnt = 0;
  DATA8.forEach((v, k) => {
    const i = k + 1;
    ev.push(...forStep(B, 4, "i", i, i === 1));
    const [ops, expr, ok] = L8_TEST[a](i, v);
    ev.push(line(5), ...B.cmp(ops, expr, ok));
    if (ok) {
      cnt += 1;
      ev.push(line(6), ...B.calc("cnt", ["cnt", 1], "cnt ＋ 1", cnt));
    }
    ev.push(line(7), line(8));
  });
  return ev;
}

const loop8 = {
  id: "loop-8",
  genre: "loop",
  level: 8,
  title: "かぞえる あな",
  concepts: ["for", "array", "count", "blank"],
  field: L8_FIELD,
  vars: {},
  varColors: { data: "#FFA726", cnt: "#66BB6A", i: "#4FC3F7" },
  program: {
    ja: [
      "整数の 配列 data を 用意して、{4, 9, 2, 7, 5} を入れる",
      "整数の 変数 cnt を 用意して、0 を入れる",
      "整数の 変数 i を 用意する",
      "i を 1 から data の要素数（5）まで 1ずつ 増やしながら、5〜7行目を くりかえす",
      "  もし ［a］ なら、6行目を 実行する",
      "    cnt を 1 増やす",
      "  （ここで 分かれ道は おわり）",
      "（くりかえす 範囲は ここまで。4行目に もどる）",
    ],
    code: [
      "整数型の配列: data ← {4, 9, 2, 7, 5}",
      "整数型: cnt ← 0",
      "整数型: i",
      "for (i を 1 から data の要素数 まで 1 ずつ増やす)",
      "  if (［a］)",
      "    cnt ← cnt ＋ 1",
      "  endif",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "data の要素数 は，配列 data に入っている値の個数（5）である。"],
  question: "次のプログラムは、配列 data の 要素の うち、値が 5 以上で ある 要素の 個数を cnt に 格納する。\nプログラム中の ［a］ に入れる 正しい答えは どれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "data の i番目 が 5 以上", code: "data[i] が 5 以上", fill: { a: { code: "data[i] が 5 以上", ja: "data の i番目 が 5 以上" } }, correct: true },
    {
      ja: "data の i番目 が 5 より大きい",
      code: "data[i] が 5 より大きい",
      fill: { a: { code: "data[i] が 5 より大きい", ja: "data の i番目 が 5 より大きい" } },
      wrongFeedback: "「5 より大きい」は 5 を ふくみません。5番目の 5 が 数えられず、cnt＝2 に なってしまいます。",
      events: loop8Run("data[i] が 5 より大きい"),
    },
    {
      ja: "i が 5 以上",
      code: "i が 5 以上",
      fill: { a: "i が 5 以上" },
      wrongFeedback: "i は 要素番号（何番目か）です。これでは 5番目かどうかを 調べてしまいます。調べるのは 値 data[i] の方です。",
      events: loop8Run("i が 5 以上"),
    },
    {
      ja: "data の i番目 が 5 より小さい",
      code: "data[i] が 5 より小さい",
      fill: { a: { code: "data[i] が 5 より小さい", ja: "data の i番目 が 5 より小さい" } },
      wrongFeedback: "それでは 5 より小さい値（4 と 2）を 数えてしまいます。",
      events: loop8Run("data[i] が 5 より小さい"),
    },
  ],
  events: [...loop8Run("data[i] が 5 以上"), end()],
  expectedFinal: { vars: { cnt: 3 } },
  hints: [
    "調べるのは、i番目の値 data[i] が 5 以上かどうか です。i は 何番目かを表す番号です。",
    "「以上」は 5 も ふくみ、「より大きい」は ふくみません。",
    "［a］ は「data[i] が 5 以上」。9、7、5 の 3個で cnt＝3 です。",
  ],
  explanation: {
    why: "i を 1 から 5 まで変えながら、i番目の値 data[i] が 5 以上なら cnt を増やします。5 以上は 9、7、5 の 3個なので cnt＝3 です。",
    trace: [
      { line: 6, state: "i=2：data[2]=9 → cnt=1" },
      { line: 6, state: "i=4：data[4]=7 → cnt=2" },
      { line: 6, state: "i=5：data[5]=5 → cnt=3" },
    ],
    points: ["配列の i番目の値は data[i]。i は要素番号", "「以上」は境界の値をふくむ"],
  },
};

// ---- loop-9：引き算で 最大公約数（while と if。空欄2つ） ----
const L9_FIELD = autoField(["x", "y"], { compare: true });
/** while の続ける条件：[表示する式, 判定] */
const L9_WHILE = {
  "x が y と等しくない": (x, y) => [`${x} ≠ ${y}`, x !== y],
  "x が y より大きい": (x, y) => [`${x} ＞ ${y}`, x > y],
  "x が y と等しい": (x, y) => [`${x} ＝ ${y}`, x === y],
};
const L9_LIMIT = 6; // これだけ くりかえしても終わらなければ「終わらない」として止める
function loop9Run(a, b) {
  const B = builder(L9_FIELD);
  const ev = [line(1), ...B.set("x", 84), line(2), ...B.set("y", 36)];
  let x = 84;
  let y = 36;
  for (let k = 0; ; k++) {
    const [e, go] = L9_WHILE[a](x, y);
    ev.push(line(3), ...B.cmp(["x", "y"], e, go));
    if (!go) break;
    if (k >= L9_LIMIT) return [...ev, emote("think"), { type: "fail", kind: "error", reason: "くりかえしが おわらない…（x と y が 等しく ならない）" }];
    const big = x > y;
    ev.push(line(4), ...B.cmp(["x", "y"], `${x} ＞ ${y}`, big));
    if (big) {
      x -= y;
      ev.push(line(5), ...B.calc("x", ["x", "y"], "x － y", x));
    } else if (b === "y ← y － x") {
      y -= x;
      ev.push(line(6), line(7), ...B.calc("y", ["y", "x"], "y － x", y));
    } else {
      y = x - y;
      ev.push(line(6), line(7), ...B.calc("y", ["x", "y"], "x － y", y));
    }
    ev.push(line(8), line(9));
  }
  return ev;
}

const loop9 = {
  id: "loop-9",
  genre: "loop",
  level: 9,
  title: "さいだいこうやくすうの あな",
  concepts: ["while", "if", "gcd", "blank"],
  field: L9_FIELD,
  vars: {},
  varColors: { x: "#4FC3F7", y: "#66BB6A" },
  program: {
    ja: [
      "整数の 変数 x を 用意して、84 を入れる",
      "整数の 変数 y を 用意して、36 を入れる",
      "［a］ の あいだ、4〜8行目を くりかえす",
      "  もし x が y より大きい なら、5行目を 実行する",
      "    x から y を 引いて、その答えを x に入れる",
      "  そうでない ときは、7行目を 実行する",
      "    ［b］",
      "  （ここで 分かれ道は おわり）",
      "（くりかえす 範囲は ここまで。3行目に もどる）",
    ],
    code: ["整数型: x ← 84", "整数型: y ← 36", "while (［a］)", "  if (x が y より大きい)", "    x ← x － y", "  else", "    ［b］", "  endif", "endwhile"],
  },
  question:
    "次のプログラムは、正の整数 x と y の 最大公約数を 求める。x と y の うち 大きい方から 小さい方を 引くことを、x と y が 等しくなるまで 繰り返すと、そのときの x（y と 等しい）の値が 最初の x と y の 最大公約数となる。\nプログラム中の ［a］ と ［b］ に入れる 正しい答えの 組合せは どれか。",
  answerType: "blank",
  blanks: ["a", "b"],
  choices: [
    {
      ja: "a：x が y と等しくない　b：y から x を 引いて、その答えを y に入れる",
      code: "a：x が y と等しくない　b：y ← y － x",
      fill: { a: "x が y と等しくない", b: { code: "y ← y － x", ja: "y から x を 引いて、その答えを y に入れる" } },
      correct: true,
    },
    {
      ja: "a：x が y と等しくない　b：x から y を 引いて、その答えを y に入れる",
      code: "a：x が y と等しくない　b：y ← x － y",
      fill: { a: "x が y と等しくない", b: { code: "y ← x － y", ja: "x から y を 引いて、その答えを y に入れる" } },
      wrongFeedback: "7行目に 来るのは x が y 以下の ときです。x － y は 小さい方から 大きい方を 引くので 負の数に なり、x と y は 等しく ならないまま、くりかえしが 終わりません。",
      events: loop9Run("x が y と等しくない", "y ← x － y"),
    },
    {
      ja: "a：x が y より大きい　b：y から x を 引いて、その答えを y に入れる",
      code: "a：x が y より大きい　b：y ← y － x",
      fill: { a: "x が y より大きい", b: { code: "y ← y － x", ja: "y から x を 引いて、その答えを y に入れる" } },
      wrongFeedback: "x が y より 小さく なった 時点で くりかえしが 終わり、y は 36 の まま 残ります。x と y が 等しくなるまで 続けます。",
      events: loop9Run("x が y より大きい", "y ← y － x"),
    },
    {
      ja: "a：x が y と等しい　b：y から x を 引いて、その答えを y に入れる",
      code: "a：x が y と等しい　b：y ← y － x",
      fill: { a: "x が y と等しい", b: { code: "y ← y － x", ja: "y から x を 引いて、その答えを y に入れる" } },
      wrongFeedback: "while は 条件が 成り立つ「あいだ」くりかえします。はじめ x と y は 等しくないので、1回も くりかえしません。",
      events: loop9Run("x が y と等しい", "y ← y － x"),
    },
  ],
  events: [...loop9Run("x が y と等しくない", "y ← y － x"), end()],
  expectedFinal: { vars: { x: 12, y: 12 } },
  hints: [
    "while は、条件が 成り立つ「あいだ」くりかえします。問題文では「x と y が 等しくなるまで」くりかえします。",
    "7行目に 来るのは、x が y より 大きくない（y の方が 大きいか 等しい）ときです。大きい方から 小さい方を 引きます。",
    "a は「x が y と等しくない」、b は「y ← y － x」。(84, 36) → (48, 36) → (12, 36) → (12, 24) → (12, 12) で、最大公約数は 12 です。",
  ],
  explanation: {
    why: "「等しくなるまで 繰り返す」は「等しくない あいだ 繰り返す」なので a は「x が y と等しくない」。7行目は y の方が大きいときなので、大きい y から 小さい x を引く「y ← y － x」が b です。x と y は (84, 36) → (48, 36) → (12, 36) → (12, 24) → (12, 12) と変わり、最大公約数は 12 です。",
    trace: [
      { line: 5, state: "x=48, y=36" },
      { line: 5, state: "x=12, y=36" },
      { line: 7, state: "x=12, y=24" },
      { line: 7, state: "x=12, y=12" },
      { line: 3, state: "12 ≠ 12 → 偽 → おわり" },
    ],
    points: ["「〜になるまで 繰り返す」は、while では「〜でない あいだ 繰り返す」と書く", "引き算は 大きい方から 小さい方を 引く（逆にすると 負の数に なる）"],
  },
};

// ---- loop-10：二重ループで 素数を 数える（空欄2つ） ----
const L10_FIELD = autoField(["cnt", "i", "j", "f"], { compare: true });
const L10_END = { "i － 1": (i) => i - 1, i: (i) => i };
const L10_TEST = {
  "i mod j が 0 と等しい": (i, j) => [["i", "j", 0], `${i} mod ${j} ＝ 0`, i % j === 0],
  "j mod i が 0 と等しい": (i, j) => [["j", "i", 0], `${j} mod ${i} ＝ 0`, j % i === 0],
  "i mod j が 0 と等しくない": (i, j) => [["i", "j", 0], `${i} mod ${j} ≠ 0`, i % j !== 0],
};
function loop10Run(a, b) {
  const B = builder(L10_FIELD);
  const ev = [line(1), ...B.set("cnt", 0), line(2)];
  let cnt = 0;
  for (let i = 2; i <= 10; i++) {
    ev.push(...forStep(B, 3, "i", i, i === 2), line(4), ...B.set("f", 1));
    let f = 1;
    const last = L10_END[a](i);
    if (last < 2) ev.push(line(5)); // 2 から 1 まで：1回も くりかえさない
    for (let j = 2; j <= last; j++) {
      const [ops, e, hit] = L10_TEST[b](i, j);
      ev.push(...forStep(B, 5, "j", j, j === 2), line(6), ...B.cmp(ops, e, hit));
      if (hit) {
        f = 0;
        ev.push(line(7), ...B.set("f", 0));
      }
      ev.push(line(8), line(9));
    }
    const prime = f === 1;
    ev.push(line(10), ...B.cmp(["f", 1], `${f} ＝ 1`, prime));
    if (prime) {
      cnt += 1;
      ev.push(line(11), ...B.calc("cnt", ["cnt", 1], "cnt ＋ 1", cnt));
    }
    ev.push(line(12), line(13));
  }
  return ev;
}

const loop10 = {
  id: "loop-10",
  genre: "loop",
  level: 10,
  title: "そすうの あな",
  concepts: ["for", "nested", "mod", "flag", "blank"],
  field: L10_FIELD,
  vars: {},
  varColors: { cnt: "#66BB6A", i: "#4FC3F7", j: "#9575CD", f: "#F06292" },
  program: {
    ja: [
      "整数の 変数 cnt を 用意して、0 を入れる",
      "整数の 変数 i、j、f を 用意する",
      "i を 2 から 10 まで 1ずつ 増やしながら、4〜12行目を くりかえす",
      "  f に 1 を入れる",
      "  j を 2 から ［a］ まで 1ずつ 増やしながら、6〜8行目を くりかえす",
      "    もし ［b］ なら、7行目を 実行する",
      "      f に 0 を入れる",
      "    （ここで 分かれ道は おわり）",
      "  （内側の くりかえす 範囲は ここまで。5行目に もどる）",
      "  もし f が 1 と 等しい なら、11行目を 実行する",
      "    cnt を 1 増やす",
      "  （ここで 分かれ道は おわり）",
      "（外側の くりかえす 範囲は ここまで。3行目に もどる）",
    ],
    code: [
      "整数型: cnt ← 0",
      "整数型: i, j, f",
      "for (i を 2 から 10 まで 1 ずつ増やす)",
      "  f ← 1",
      "  for (j を 2 から ［a］ まで 1 ずつ増やす)",
      "    if (［b］)",
      "      f ← 0",
      "    endif",
      "  endfor",
      "  if (f が 1 と等しい)",
      "    cnt ← cnt ＋ 1",
      "  endif",
      "endfor",
    ],
  },
  notes: ["for の「j を 2 から ○ まで」で，○ が 2 より小さいときは，1回も繰り返さない。", "i mod j は，i を j で割った余りである。"],
  question:
    "次のプログラムは、2 から 10 までの 整数の うち、素数の 個数を cnt に 格納する。素数とは、1 と その数 自身 以外に 約数を もたない 2 以上の 整数である。f には、i が 素数で あれば 1 を、素数で なければ 0 を 格納する。\nプログラム中の ［a］ と ［b］ に入れる 正しい答えの 組合せは どれか。",
  answerType: "blank",
  blanks: ["a", "b"],
  choices: [
    { ja: "a：i － 1　b：i mod j が 0 と等しい", code: "a：i － 1　b：i mod j が 0 と等しい", fill: { a: "i － 1", b: "i mod j が 0 と等しい" }, correct: true },
    {
      ja: "a：i　b：i mod j が 0 と等しい",
      code: "a：i　b：i mod j が 0 と等しい",
      fill: { a: "i", b: "i mod j が 0 と等しい" },
      wrongFeedback: "j を i まで 増やすと、最後に i を i 自身で 割るので 必ず 割り切れ、どの数も 素数で ない（f＝0）と されて しまいます。調べるのは 2 から i － 1 までです。",
      events: loop10Run("i", "i mod j が 0 と等しい"),
    },
    {
      ja: "a：i － 1　b：j mod i が 0 と等しい",
      code: "a：i － 1　b：j mod i が 0 と等しい",
      fill: { a: "i － 1", b: "j mod i が 0 と等しい" },
      wrongFeedback: "j は i より 小さいので、j mod i は j の まま 0 に なりません。どの数も 素数と されて しまいます。調べたいのは「i が j で 割り切れるか」です。",
      events: loop10Run("i － 1", "j mod i が 0 と等しい"),
    },
    {
      ja: "a：i － 1　b：i mod j が 0 と等しくない",
      code: "a：i － 1　b：i mod j が 0 と等しくない",
      fill: { a: "i － 1", b: "i mod j が 0 と等しくない" },
      wrongFeedback: "これでは「割り切れない 数が 1つでも あれば 素数でない」に なってしまいます。素数でないのは、i を 割り切る j が 見つかったときです。",
      events: loop10Run("i － 1", "i mod j が 0 と等しくない"),
    },
  ],
  events: [...loop10Run("i － 1", "i mod j が 0 と等しい"), end()],
  expectedFinal: { vars: { cnt: 4 } },
  hints: [
    "i が 素数かどうかは、2 から i － 1 までの 数で 割り切れるかを 調べれば 分かります（1 と i 自身は 調べない）。",
    "割り切れる j が 1つでも 見つかったら、i は 素数では ありません（f を 0 に する）。「割り切れる」は「i mod j が 0 と等しい」です。",
    "a は i － 1、b は「i mod j が 0 と等しい」。素数は 2、3、5、7 の 4個で cnt＝4 です。",
  ],
  explanation: {
    why: "外側の くりかえしで i を 2 から 10 まで 変え、はじめは f＝1（素数と 仮定）にします。内側で j を 2 から i － 1 まで 変え、i が j で 割り切れたら f＝0 にします。最後まで f＝1 なら 素数なので cnt を 増やします。i＝2 のときは 内側を 1回も くりかえさず、素数と 判定されます。素数は 2、3、5、7 で cnt＝4 です。",
    trace: [
      { line: 11, state: "i=2 → 素数 → cnt=1" },
      { line: 11, state: "i=3 → 素数 → cnt=2" },
      { line: 7, state: "i=4：4 mod 2 ＝ 0 → f=0" },
      { line: 11, state: "i=5 → 素数 → cnt=3" },
      { line: 11, state: "i=7 → 素数 → cnt=4" },
    ],
    points: ["「あるか どうか」は、はじめに f＝1 として、見つかったら f＝0 に する（フラグ）", "割り切れるかは mod の答えが 0 と 等しいか で 調べる", "くりかえしの 範囲（2 から i － 1）を 正確に 決める"],
  },
};

export default [loop1, loop2, loop3, loop4, loop5, loop6, loop7, loop8, loop9, loop10];
