// ④ arr（ならんだ ぼっくす）
// 配列の値は、宣言のときは最初からセルに表示し、それ以降の変更は必ず運ぶ（DECISIONS「M4〜M5」）。
// 式の答え（result）はここで計算して書き、検証スクリプトが要素番号つきの式（a[2] ＋ a[3] など）を評価して照合する。
import { line, end, emote, builder, autoField } from "./helpers.js";

/** for の制御行：1周目は初期値を入れ、2周目からは 1 増やす（down なら 1 減らす） */
const forStep = (B, n, v, value, first, down = false) => [
  line(n),
  ...(first ? B.set(v, value) : B.calc(v, [v, 1], `${v} ${down ? "－" : "＋"} 1`, value)),
];
/** 負の数は全角の「－」で表示する */
const num = (v) => (v < 0 ? `－${-v}` : `${v}`);
const error = (reason) => [emote("think"), { type: "fail", kind: "error", reason }];

// ---- arr-1：a[2] を読む ----
const A1 = [4, 9, 6];
const R1_FIELD = autoField(["x"], { calc: false, arrays: [{ name: "a", values: A1 }] });
function arr1Events() {
  const B = builder(R1_FIELD);
  return [line(1), line(2), line(3), ...B.copy("x", "a[2]")];
}

const arr1 = {
  id: "arr-1",
  genre: "arr",
  level: 1,
  title: "2番目はどれ？",
  concepts: ["array", "index"],
  intro: "配列は、番号の付いた箱が横に並んだもの。\na[2] は「a の 2番目」。番号は 1 から数えるよ。",
  field: R1_FIELD,
  vars: {},
  varColors: { a: "#FFA726", x: "#4FC3F7" },
  program: {
    ja: ["整数の配列 a を用意して、{4, 9, 6} を入れる", "整数の変数 x を用意する", "a の 2番目の値を x に写す"],
    code: ["整数型の配列: a ← {4, 9, 6}", "整数型: x", "x ← a[2]"],
  },
  notes: ["配列の要素番号は 1 から始まる。"],
  question: "プログラムを実行し終わったときの x の値はどれか。",
  answerType: "vars",
  choices: [
    { ja: "x は 9", code: "x = 9", correct: true },
    {
      ja: "x は 6",
      code: "x = 6",
      wrongFeedback: "要素番号は 1 から数えます。a[1] が 4、a[2] が 9、a[3] が 6 です。0 から数えていませんか？",
      stop: { line: 3 },
    },
    {
      ja: "x は 4",
      code: "x = 4",
      wrongFeedback: "4 は a[1]（1番目）です。3行目で読むのは a[2]（2番目）です。",
      stop: { line: 3 },
    },
    {
      ja: "x は 2",
      code: "x = 2",
      wrongFeedback: "a[2] の 2 は「何番目か」を表す要素番号です。x に入るのは、2番目の箱に入っている値です。",
      stop: { line: 3 },
    },
  ],
  events: [...arr1Events(), end()],
  expectedFinal: { vars: { x: 9 } },
  hints: [
    "1行目で配列 a の 1番目に 4、2番目に 9、3番目に 6 が入ります。要素番号は 1 から数えるので、a[1] は 4 です。",
    "3行目の a[2] は「a の 2番目の値」です。2 という数そのものではありません。",
    "a の 2番目の箱を見てみよう。その値が x に写されます。",
  ],
  explanation: {
    why: "a[2] は配列 a の 2番目の要素です。要素番号は 1 から数えるので、a[1]＝4、a[2]＝9、a[3]＝6。3行目で x に 9 が入ります。",
    trace: [
      { line: 1, state: "a=[4, 9, 6]" },
      { line: 3, state: "x=a[2]=9" },
    ],
    points: ["a[i] は配列 a の i番目の要素", "要素番号は 1 から数える（このゲームと科目Bのきまり）", "[ ] の中の数は番号で、値ではない"],
  },
};

// ---- arr-2：要素どうしの計算 ----
const R2_FIELD = autoField([], { arrays: [{ name: "a", values: [6, 1, 4] }] });
function arr2Events() {
  const B = builder(R2_FIELD);
  return [
    line(1),
    line(2),
    ...B.calc("a[2]", ["a[1]", "a[3]"], "a[1] ＋ a[3]", 10),
    line(3),
    ...B.calc("a[1]", ["a[2]", "a[1]"], "a[2] － a[1]", 4),
  ];
}

const arr2 = {
  id: "arr-2",
  genre: "arr",
  level: 2,
  title: "隣の箱で計算",
  concepts: ["array", "index", "assign"],
  field: R2_FIELD,
  vars: {},
  varColors: { a: "#FFA726" },
  program: {
    ja: [
      "整数の配列 a を用意して、{6, 1, 4} を入れる",
      "a の 1番目と 3番目を足して、その答えを a の 2番目に入れる",
      "a の 2番目から 1番目を引いて、その答えを a の 1番目に入れる",
    ],
    code: ["整数型の配列: a ← {6, 1, 4}", "a[2] ← a[1] ＋ a[3]", "a[1] ← a[2] － a[1]"],
  },
  notes: ["配列の要素番号は 1 から始まる。"],
  question: "プログラムを実行し終わったときの配列 a の内容はどれか。",
  answerType: "arrays",
  choices: [
    { ja: "a は {4, 10, 4}", code: "a = {4, 10, 4}", correct: true },
    {
      ja: "a は {－5, 10, 4}",
      code: "a = {－5, 10, 4}",
      wrongFeedback: "3行目を実行する時点で、a[2] は 2行目で 10 に変わっています。最初の 1 ではありません。",
      stop: { line: 3 },
    },
    {
      ja: "a は {－2, 4, 4}",
      code: "a = {－2, 4, 4}",
      wrongFeedback: "a[1] は「1番目の値」（6）です。要素番号の 1 を足すのではありません。",
      stop: { line: 2 },
    },
    {
      ja: "a は {5, 11, 4}",
      code: "a = {5, 11, 4}",
      wrongFeedback: "2行目は、右側の計算（a[1] ＋ a[3]）の答えで a[2] を置き換えます。前の a[2]（1）に足すのではありません。",
      stop: { line: 2 },
    },
  ],
  events: [...arr2Events(), end()],
  expectedFinal: { arrays: { a: [4, 10, 4] } },
  hints: [
    "2行目：a[1] は 6、a[3] は 4 なので、6 ＋ 4 ＝ 10 が a[2] に入ります。a は {6, 10, 4} になります。",
    "3行目を実行するときは、2行目で変わったあとの値を使います。",
    "3行目は a[2] － a[1] ＝ 10 － 6 です。その答えで a[1] を置き換えます。",
  ],
  explanation: {
    why: "2行目で a[2] ← 6 ＋ 4 ＝ 10 となり a＝{6, 10, 4}。3行目では変わったあとの a[2]（10）を使い、a[1] ← 10 － 6 ＝ 4。よって a＝{4, 10, 4} です。",
    trace: [
      { line: 1, state: "a=[6, 1, 4]" },
      { line: 2, state: "a[2]=6+4=10 → a=[6, 10, 4]" },
      { line: 3, state: "a[1]=10−6=4 → a=[4, 10, 4]" },
    ],
    points: ["a[1] ＋ a[3] は、1番目と 3番目の「値」を足す", "前の行で書き換わった要素は、次の行では新しい値で使う"],
  },
};

// ---- arr-3：最大値と その要素番号 ----
const A3 = [6, 9, 4, 9, 7];
const R3_FIELD = autoField(["mx", "k", "i"], { compare: true, arrays: [{ name: "a", values: A3 }] });
function arr3Events() {
  const B = builder(R3_FIELD);
  const ev = [line(1), line(2), line(3), ...B.copy("mx", "a[1]"), line(4), ...B.set("k", 1)];
  let mx = A3[0];
  for (let i = 2; i <= A3.length; i++) {
    const v = A3[i - 1];
    const big = v > mx;
    ev.push(...forStep(B, 5, "i", i, i === 2), line(6), ...B.cmp([`a[${i}]`, "mx"], `${v} ＞ ${mx}`, big));
    if (big) {
      mx = v;
      ev.push(line(7), ...B.copy("mx", `a[${i}]`), line(8), ...B.copy("k", "i"));
    }
    ev.push(line(9), line(10));
  }
  return ev;
}

const arr3 = {
  id: "arr-3",
  genre: "arr",
  level: 3,
  title: "一番大きいのはどこ？",
  concepts: ["array", "for", "max"],
  field: R3_FIELD,
  vars: {},
  varColors: { a: "#FFA726", mx: "#66BB6A", k: "#F06292", i: "#4FC3F7" },
  program: {
    ja: [
      "整数の配列 a を用意して、{6, 9, 4, 9, 7} を入れる",
      "整数の変数 mx、k、i を用意する",
      "a の 1番目の値を mx に写す",
      "k に 1 を入れる",
      "i を 2 から a の要素数（5）まで 1ずつ増やしながら、6〜9行目を繰り返す",
      "  もし a の i番目が mx より大きいなら、7〜8行目を実行する",
      "    a の i番目の値を mx に写す",
      "    i の値を k に写す",
      "  （ここで分かれ道は終わり）",
      "（繰り返す範囲はここまで。5行目に戻る）",
    ],
    code: [
      "整数型の配列: a ← {6, 9, 4, 9, 7}",
      "整数型: mx, k, i",
      "mx ← a[1]",
      "k ← 1",
      "for (i を 2 から a の要素数 まで 1 ずつ増やす)",
      "  if (a[i] が mx より大きい)",
      "    mx ← a[i]",
      "    k ← i",
      "  endif",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "a の要素数は，配列 a に入っている値の個数（5）である。"],
  question: "プログラムを実行し終わったときの mx と k の値の組合せはどれか。",
  answerType: "vars",
  choices: [
    { ja: "mx は 9、k は 2", code: "mx = 9, k = 2", correct: true },
    {
      ja: "mx は 9、k は 4",
      code: "mx = 9, k = 4",
      wrongFeedback: "6行目は「より大きい」です。i＝4 の a[4]＝9 は mx（9）と等しいので、条件は成り立たず、k は変わりません。",
      stop: { line: 7, mark: [6] },
    },
    {
      ja: "mx は 7、k は 5",
      code: "mx = 7, k = 5",
      wrongFeedback: "7〜8行目は、6行目の条件（a[i] が mx より大きい）が成り立つときだけ実行します。小さい値で mx を置き換えることはありません。",
      stop: { line: 7, mark: [6] },
    },
    {
      ja: "mx は 9、k は 9",
      code: "mx = 9, k = 9",
      wrongFeedback: "8行目で k に入れるのは i（要素番号）です。a[i]（値）ではありません。",
      stop: { line: 8 },
    },
  ],
  events: [...arr3Events(), end()],
  expectedFinal: { vars: { mx: 9, k: 2 } },
  hints: [
    "最初は mx＝a[1]＝6、k＝1 です。i＝2 のとき a[2]＝9 は 6 より大きいので、mx＝9、k＝2 になります。",
    "6行目は「より大きい」なので、mx と等しい値では置き換えません。8行目で k に入るのは要素番号 i です。",
    "i＝3, 4, 5 の a[i] は 4、9、7。どれも mx＝9 より大きくないので、mx と k はそのままです。",
  ],
  explanation: {
    why: "mx はそれまでの最大値、k はその要素番号です。i＝2 で 9 が見つかり mx＝9、k＝2。そのあとの 4、9、7 はどれも 9 より大きくない（a[4]＝9 は等しいだけ）ので、mx＝9、k＝2 のままです。",
    trace: [
      { line: 4, state: "mx=6, k=1" },
      { line: 8, state: "i=2：9 ＞ 6 → mx=9, k=2" },
      { line: 6, state: "i=3：4 ＞ 9 は偽" },
      { line: 6, state: "i=4：9 ＞ 9 は偽（等しい）" },
      { line: 6, state: "i=5：7 ＞ 9 は偽" },
    ],
    points: ["最大値は「1番目を仮の最大値にして、2番目から比べる」", "「より大きい」で比べると、同じ最大値が複数あるときは最初の要素番号が残る", "要素番号（i）と値（a[i]）を区別する"],
  },
};

// ---- arr-4：後ろから 1つずつ ずらす（右へ回転） ----
const A4 = [2, 5, 1, 4, 3];
const R4_FIELD = autoField(["i", "t"], { arrays: [{ name: "a", values: A4 }] });
function arr4Events() {
  const B = builder(R4_FIELD);
  const ev = [line(1), line(2), line(3), ...B.copy("t", "a[5]")];
  for (let i = 5; i >= 2; i--) ev.push(...forStep(B, 4, "i", i, i === 5, true), line(5), ...B.copy(`a[${i}]`, `a[${i - 1}]`), line(6));
  ev.push(line(7), ...B.copy("a[1]", "t"));
  return ev;
}

const arr4 = {
  id: "arr-4",
  genre: "arr",
  level: 4,
  title: "後ろからずらそう",
  concepts: ["array", "for", "shift"],
  field: R4_FIELD,
  vars: {},
  varColors: { a: "#FFA726", i: "#4FC3F7", t: "#F06292" },
  program: {
    ja: [
      "整数の配列 a を用意して、{2, 5, 1, 4, 3} を入れる",
      "整数の変数 i と t を用意する",
      "a の最後（a の要素数＝5番目）の値を t に写す",
      "i を a の要素数（5）から 2 まで 1ずつ減らしながら、5行目を繰り返す",
      "  a の（i － 1）番目の値を a の i番目に写す",
      "（繰り返す範囲はここまで。4行目に戻る）",
      "t の値を a の 1番目に写す",
    ],
    code: [
      "整数型の配列: a ← {2, 5, 1, 4, 3}",
      "整数型: i, t",
      "t ← a[a の要素数]",
      "for (i を a の要素数 から 2 まで 1 ずつ減らす)",
      "  a[i] ← a[i － 1]",
      "endfor",
      "a[1] ← t",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "a の要素数は，配列 a に入っている値の個数（5）である。"],
  question: "プログラムを実行し終わったときの配列 a の内容はどれか。",
  answerType: "arrays",
  choices: [
    { ja: "a は {3, 2, 5, 1, 4}", code: "a = {3, 2, 5, 1, 4}", correct: true },
    {
      ja: "a は {3, 2, 2, 2, 2}",
      code: "a = {3, 2, 2, 2, 2}",
      wrongFeedback: "4行目は i を 5 から 2 へ「減らし」ながら繰り返します。最初は i＝5 で a[5] ← a[4]。後ろからずらすので、まだ写していない値を上書きしません。",
      stop: { line: 5, mark: [4] },
    },
    {
      ja: "a は {4, 2, 5, 1, 4}",
      code: "a = {4, 2, 5, 1, 4}",
      wrongFeedback: "3行目で t に写した 3 は、あとで a[5] が 4 に変わっても 3 のままです。7行目で a[1] に入るのは t の値です。",
      stop: { line: 7, mark: [3, 7] },
    },
    {
      ja: "a は {5, 1, 4, 3, 2}",
      code: "a = {5, 1, 4, 3, 2}",
      wrongFeedback: "5行目は、a[i] に a[i － 1]（1つ前＝左どなり）の値を写します。右どなりの値を写すのではありません。",
      stop: { line: 5 },
    },
  ],
  events: [...arr4Events(), end()],
  expectedFinal: { arrays: { a: [3, 2, 5, 1, 4] } },
  hints: [
    "3行目で t＝a[5]＝3。4行目の繰り返しは i＝5 から始まり、5行目で a[5] ← a[4]（4）となって a＝{2, 5, 1, 4, 4} です。",
    "i は 5 → 4 → 3 → 2 と減ります。後ろから順に「左どなりの値」を写していきます。t の値は 3行目で決まり、あとから変わりません。",
    "i＝4 で a[4] ← a[3]、i＝3 で a[3] ← a[2]、i＝2 で a[2] ← a[1]。最後に a[1] ← t です。",
  ],
  explanation: {
    why: "全部の要素を 1つずつ右へずらし、あふれた最後の値（t に取っておいた 3）を先頭に入れる処理です。後ろからずらすので、写す前の値が上書きされません。a は {2, 5, 1, 4, 4} → {2, 5, 1, 1, 4} → {2, 5, 5, 1, 4} → {2, 2, 5, 1, 4} → {3, 2, 5, 1, 4} と変わります。",
    trace: [
      { line: 3, state: "t=3" },
      { line: 5, state: "i=5：a=[2, 5, 1, 4, 4]" },
      { line: 5, state: "i=4：a=[2, 5, 1, 1, 4]" },
      { line: 5, state: "i=3：a=[2, 5, 5, 1, 4]" },
      { line: 5, state: "i=2：a=[2, 2, 5, 1, 4]" },
      { line: 7, state: "a=[3, 2, 5, 1, 4]" },
    ],
    points: [
      "右へずらすときは後ろから写す（前から写すと、同じ値が続いてしまう）",
      "上書きされる値は、先に別の変数（t）に取っておく",
      "「1 ずつ減らす」の for は、大きい方から小さい方へ進む",
    ],
  },
};

// ---- arr-5：増えた量を 別の配列に 詰める（1つずれ） ----
const A5 = [5, 9, 4, 4, 7, 8];
const R5_FIELD = autoField(["i", "k"], {
  compare: true,
  arrays: [
    { name: "a", values: A5 },
    { name: "b", values: [0, 0, 0, 0, 0] },
  ],
});
function arr5Events() {
  const B = builder(R5_FIELD);
  const ev = [line(1), line(2), line(3), line(4), ...B.set("k", 1)];
  let k = 1;
  for (let i = 2; i <= A5.length; i++) {
    const cur = A5[i - 1];
    const prev = A5[i - 2];
    const up = cur > prev;
    ev.push(...forStep(B, 5, "i", i, i === 2), line(6), ...B.cmp([`a[${i}]`, `a[${i - 1}]`], `${cur} ＞ ${prev}`, up));
    if (up) {
      ev.push(line(7), ...B.calc(`b[${k}]`, [`a[${i}]`, `a[${i - 1}]`], `a[${i}] － a[${i - 1}]`, cur - prev));
      k += 1;
      ev.push(line(8), ...B.calc("k", ["k", 1], "k ＋ 1", k));
    }
    ev.push(line(9), line(10));
  }
  ev.push(line(11), ...B.set(`b[${k}]`, -1));
  return ev;
}

const arr5 = {
  id: "arr-5",
  genre: "arr",
  level: 5,
  title: "増えた分を詰めよう",
  concepts: ["array", "for", "if", "copy", "off-by-one"],
  field: R5_FIELD,
  vars: {},
  varColors: { a: "#FFA726", b: "#26A69A", i: "#4FC3F7", k: "#F06292" },
  program: {
    ja: [
      "整数の配列 a を用意して、{5, 9, 4, 4, 7, 8} を入れる",
      "整数の配列 b を用意して、{0, 0, 0, 0, 0} を入れる",
      "整数の変数 i と k を用意する",
      "k に 1 を入れる",
      "i を 2 から a の要素数（6）まで 1ずつ増やしながら、6〜9行目を繰り返す",
      "  もし a の i番目が a の（i － 1）番目より大きいなら、7〜8行目を実行する",
      "    a の i番目から（i － 1）番目を引いて、その答えを b の k番目に入れる",
      "    k を 1 増やす",
      "  （ここで分かれ道は終わり）",
      "（繰り返す範囲はここまで。5行目に戻る）",
      "b の k番目に －1 を入れる",
    ],
    code: [
      "整数型の配列: a ← {5, 9, 4, 4, 7, 8}",
      "整数型の配列: b ← {0, 0, 0, 0, 0}",
      "整数型: i, k",
      "k ← 1",
      "for (i を 2 から a の要素数 まで 1 ずつ増やす)",
      "  if (a[i] が a[i － 1] より大きい)",
      "    b[k] ← a[i] － a[i － 1]",
      "    k ← k ＋ 1",
      "  endif",
      "endfor",
      "b[k] ← －1",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "a の要素数は，配列 a に入っている値の個数（6）である。"],
  question: "プログラムを実行し終わったときの配列 b の内容はどれか。",
  answerType: "arrays",
  choices: [
    { ja: "b は {4, 3, 1, －1, 0}", code: "b = {4, 3, 1, －1, 0}", correct: true },
    {
      ja: "b は {4, 3, －1, 0, 0}",
      code: "b = {4, 3, －1, 0, 0}",
      wrongFeedback: "k は 1 から始まり、b に入れた「あと」で 1 増えます。繰り返しが終わったとき k は入れた個数（3）より 1 大きい 4 なので、11行目は b[4] に入れます。",
      stop: { line: 11, mark: [8, 11] },
    },
    {
      ja: "b は {4, 0, 3, 1, －1}",
      code: "b = {4, 0, 3, 1, －1}",
      wrongFeedback: "6行目は「より大きい」です。i＝4 の a[4]＝4 と a[3]＝4 は等しいので、条件は成り立たず、b には何も入れません。",
      stop: { line: 6, nth: 3 },
    },
    {
      ja: "b は {9, 7, 8, －1, 0}",
      code: "b = {9, 7, 8, －1, 0}",
      wrongFeedback: "7行目で b に入れるのは a[i] そのものではなく、a[i] － a[i － 1]（前の要素から増えた量）です。",
      stop: { line: 7 },
    },
  ],
  events: [...arr5Events(), end()],
  expectedFinal: { arrays: { b: [4, 3, 1, -1, 0] } },
  hints: [
    "i＝2 のとき a[2]＝9 は a[1]＝5 より大きいので、b[1] ← 9 － 5 ＝ 4、そのあと k＝2 になります。i、a[i]、a[i－1]、k を表にして追ってみよう。",
    "6行目は「より大きい」なので、等しいところ（4 と 4）は入れません。k は b に入れたあとで増えるので、k はいつも「次に入れる場所」を指しています。",
    "b に入るのは 4、3、1 の 3個。繰り返しのあと k はいくつになっているかな？ 11行目はその場所に －1 を入れます。",
  ],
  explanation: {
    why: "前の要素より増えているところで、増えた量を b に前から詰めて入れ、最後に終わりの印 －1 を置く処理です。5→9（4）、4→7（3）、7→8（1）の 3か所が入り、9→4 と 4→4（等しい）は入りません。k は「次に入れる場所」なので最後は 4 で、b[4] に －1 が入ります。",
    trace: [
      { line: 8, state: "i=2：9−5=4 → b[1]=4, k=2" },
      { line: 6, state: "i=3：4 ＞ 9 は偽" },
      { line: 6, state: "i=4：4 ＞ 4 は偽（等しい）" },
      { line: 8, state: "i=5：7−4=3 → b[2]=3, k=3" },
      { line: 8, state: "i=6：8−7=1 → b[3]=1, k=4" },
      { line: 11, state: "b[4]=−1 → b=[4, 3, 1, −1, 0]" },
    ],
    points: [
      "別の配列に詰めるときは、入れる場所（k）を自分で進める",
      "「入れてから k を増やす」と、終わったときの k は入れた個数＋1（次の空き場所）",
      "a[i] と a[i － 1] を比べるときは、i を 2 から始める（a[0] はない）",
    ],
  },
};

// ================= 6〜10：穴埋め =================
// 空欄の記号 a・b と まぎれないよう、穴埋めの問題では 変数名・配列名に a・b を使わない。
// 誤答は、その選択肢を空欄に入れたプログラムを実行して見せる（どの誤答も このデータで 目的と ちがう結果になる）。

// ---- arr-6：合計（足すもの） ----
const D6 = [3, 8, 5, 6];
const R6_FIELD = autoField(["sum", "i"], { arrays: [{ name: "data", values: D6 }] });
function arr6Run(fill) {
  const B = builder(R6_FIELD);
  const ev = [line(1), line(2), ...B.set("sum", 0), line(3)];
  let sum = 0;
  for (let i = 1; i <= D6.length; i++) {
    ev.push(...forStep(B, 4, "i", i, i === 1), line(5));
    if (fill === "i") {
      sum += i;
      ev.push(...B.calc("sum", ["sum", "i"], "sum ＋ i", sum));
    } else {
      const k = fill === "data[i]" ? i : fill === "data[1]" ? 1 : i + 1;
      if (k > D6.length) return [...ev, ...error(`data[${k}] はない！（data は 4番目まで）`)];
      sum += D6[k - 1];
      ev.push(...B.calc("sum", ["sum", `data[${k}]`], `sum ＋ data[${k}]`, sum));
    }
    ev.push(line(6));
  }
  return ev;
}

const arr6 = {
  id: "arr-6",
  genre: "arr",
  level: 6,
  title: "足すものの穴",
  concepts: ["array", "for", "sum", "blank"],
  intro: "ここからは穴埋め問題。［a］ に入るものを選ぼう。\n「ここまで進める」は、穴の手前まで使えるよ。",
  field: R6_FIELD,
  vars: {},
  varColors: { data: "#FFA726", sum: "#66BB6A", i: "#4FC3F7" },
  program: {
    ja: [
      "整数の配列 data を用意して、{3, 8, 5, 6} を入れる",
      "整数の変数 sum を用意して、0 を入れる",
      "整数の変数 i を用意する",
      "i を 1 から data の要素数（4）まで 1ずつ増やしながら、5行目を繰り返す",
      "  sum の値に ［a］ の値を足して、その答えを sum に入れる",
      "（繰り返す範囲はここまで。4行目に戻る）",
    ],
    code: [
      "整数型の配列: data ← {3, 8, 5, 6}",
      "整数型: sum ← 0",
      "整数型: i",
      "for (i を 1 から data の要素数 まで 1 ずつ増やす)",
      "  sum ← sum ＋ ［a］",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "data の要素数は，配列 data に入っている値の個数（4）である。"],
  question: "次のプログラムは、配列 data の全ての要素の値の合計を sum に格納する。\nプログラム中の ［a］ に入れる正しい答えはどれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "data の i番目", code: "data[i]", fill: { a: { code: "data[i]", ja: "data の i番目" } }, correct: true },
    {
      ja: "i",
      code: "i",
      fill: { a: "i" },
      wrongFeedback: "i は要素番号（1, 2, 3, 4）です。これでは番号を足して sum＝10 になります。足したいのは i番目の値 data[i] です。",
      events: arr6Run("i"),
    },
    {
      ja: "data の 1番目",
      code: "data[1]",
      fill: { a: { code: "data[1]", ja: "data の 1番目" } },
      wrongFeedback: "data[1] はいつも 1番目（3）なので、3 を 4回足して sum＝12 になります。i によって変わる data[i] を使います。",
      events: arr6Run("data[1]"),
    },
    {
      ja: "data の（i ＋ 1）番目",
      code: "data[i ＋ 1]",
      fill: { a: { code: "data[i ＋ 1]", ja: "data の（i ＋ 1）番目" } },
      wrongFeedback: "1つ先の要素を足すので、data[1] を足さず、i＝4 のときない要素 data[5] を使おうとして止まります。",
      events: arr6Run("data[i ＋ 1]"),
    },
  ],
  events: [...arr6Run("data[i]"), end()],
  expectedFinal: { vars: { sum: 22 } },
  hints: [
    "i は 1, 2, 3, 4 と変わります。i＝1 のとき足したいのは data の 1番目の値（3）です。",
    "i そのもの（番号）と、data[i]（i番目の値）の違いに気をつけよう。",
    "［a］ は data[i]。sum＝3＋8＋5＋6＝22 です。",
  ],
  explanation: {
    why: "i を 1 から 4 まで変えながら、i番目の値 data[i] を sum に足します。sum は 0 → 3 → 11 → 16 → 22 となります。",
    trace: [
      { line: 5, state: "i=1：sum=3" },
      { line: 5, state: "i=2：sum=11" },
      { line: 5, state: "i=3：sum=16" },
      { line: 5, state: "i=4：sum=22" },
    ],
    points: ["配列の合計は、要素番号 i を 1 から要素数まで変えて data[i] を足す", "i（番号）と data[i]（値）を区別する", "ない要素番号（0 や要素数＋1）を使うと実行できない"],
  },
};

// ---- arr-7：最大値の はじめの値（負の数あり） ----
const D7 = [-2, -7, -4, -9];
const R7_FIELD = autoField(["i", "mx"], { compare: true, arrays: [{ name: "data", values: D7 }] });
function arr7Run(fill) {
  const B = builder(R7_FIELD);
  const ev = [line(1), line(2), line(3)];
  let mx;
  if (fill === "data[i]") return [...ev, ...error("i にまだ値が入っていない！")];
  if (fill === "0") {
    mx = 0;
    ev.push(...B.set("mx", 0));
  } else {
    const k = fill === "data[1]" ? 1 : 2;
    mx = D7[k - 1];
    ev.push(...B.copy("mx", `data[${k}]`));
  }
  for (let i = 2; i <= D7.length; i++) {
    const v = D7[i - 1];
    const big = v > mx;
    ev.push(...forStep(B, 4, "i", i, i === 2), line(5), ...B.cmp([`data[${i}]`, "mx"], `${num(v)} ＞ ${num(mx)}`, big));
    if (big) {
      mx = v;
      ev.push(line(6), ...B.copy("mx", `data[${i}]`));
    }
    ev.push(line(7), line(8));
  }
  return ev;
}

const arr7 = {
  id: "arr-7",
  genre: "arr",
  level: 7,
  title: "最大値の最初の穴",
  concepts: ["array", "for", "max", "blank"],
  field: R7_FIELD,
  vars: {},
  varColors: { data: "#FFA726", i: "#4FC3F7", mx: "#66BB6A" },
  program: {
    ja: [
      "整数の配列 data を用意して、{－2, －7, －4, －9} を入れる",
      "整数の変数 i を用意する（まだ空っぽ）",
      "整数の変数 mx を用意して、［a］ を入れる",
      "i を 2 から data の要素数（4）まで 1ずつ増やしながら、5〜7行目を繰り返す",
      "  もし data の i番目が mx より大きいなら、6行目を実行する",
      "    data の i番目の値を mx に写す",
      "  （ここで分かれ道は終わり）",
      "（繰り返す範囲はここまで。4行目に戻る）",
    ],
    code: [
      "整数型の配列: data ← {－2, －7, －4, －9}",
      "整数型: i",
      "整数型: mx ← ［a］",
      "for (i を 2 から data の要素数 まで 1 ずつ増やす)",
      "  if (data[i] が mx より大きい)",
      "    mx ← data[i]",
      "  endif",
      "endfor",
    ],
  },
  notes: [
    "配列の要素番号は 1 から始まる。",
    "data の要素数は，配列 data に入っている値の個数（4）である。",
    "for の「i を 2 から ○ まで」で，○ が 2 より小さいときは，1回も繰り返さない。",
  ],
  question:
    "次のプログラムは、配列 data の要素の値の最大値を mx に格納する。data の要素数は 1 以上で、要素の値は負の数のこともある。\nプログラム中の ［a］ に入れる正しい答えはどれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "data の 1番目", code: "data[1]", fill: { a: { code: "data[1]", ja: "data の 1番目の値" } }, correct: true },
    {
      ja: "0",
      code: "0",
      fill: { a: "0" },
      wrongFeedback: "要素が全部負の数だと、どの要素も 0 より大きくないので、mx は 0 のまま残ります。0 は data の要素ではありません。",
      events: arr7Run("0"),
    },
    {
      ja: "data の 2番目",
      code: "data[2]",
      fill: { a: { code: "data[2]", ja: "data の 2番目の値" } },
      wrongFeedback: "繰り返しは i＝2 からなので、data[1] は一度も比べられません。最大値の data[1]（－2）を見落として mx＝－4 になります。",
      events: arr7Run("data[2]"),
    },
    {
      ja: "data の i番目",
      code: "data[i]",
      fill: { a: { code: "data[i]", ja: "data の i番目の値" } },
      wrongFeedback: "3行目の時点で i にはまだ値が入っていません（2行目で用意しただけ）。値のない変数は使えません。",
      events: arr7Run("data[i]"),
    },
  ],
  events: [...arr7Run("data[1]"), end()],
  expectedFinal: { vars: { mx: -2 } },
  hints: [
    "4行目の繰り返しは i＝2 から始まります。では data[1] はどこで調べるのかな？",
    "mx の最初の値は、data の要素の 1つでなければなりません（0 にすると、全部負の数のときに困ります）。",
    "［a］ は data[1]。最初は mx＝－2 で、－7、－4、－9 はどれも －2 より大きくないので mx＝－2 です。",
  ],
  explanation: {
    why: "最初に 1番目の値 data[1] を仮の最大値にして、2番目から最後までと比べます。そのため繰り返しは i＝2 からです。0 から始めると、全部が負の数のときに 0 が残ってしまいます。",
    trace: [
      { line: 3, state: "mx=data[1]=−2" },
      { line: 5, state: "i=2：−7 ＞ −2 は偽" },
      { line: 5, state: "i=3：−4 ＞ −2 は偽" },
      { line: 5, state: "i=4：−9 ＞ −2 は偽" },
    ],
    points: ["最大値・最小値の最初の値は、配列の 1番目の要素にする", "0 などの決めうちの値は、負の数があると正しくない", "1番目で始めたら、繰り返しは 2番目から"],
  },
};

// ---- arr-8：逆の順番に 写す（入れる場所） ----
const D8 = [4, 7, 1, 9, 3];
const R8_FIELD = autoField(["n", "i"], {
  arrays: [
    { name: "data", values: D8 },
    { name: "rev", values: [0, 0, 0, 0, 0] },
  ],
});
const R8_POS = { "n － i ＋ 1": (n, i) => n - i + 1, "n － i": (n, i) => n - i, i: (n, i) => i, n: (n) => n };
function arr8Run(fill) {
  const B = builder(R8_FIELD);
  const n = D8.length;
  const ev = [line(1), line(2), line(3), ...B.set("n", n), line(4)];
  for (let i = 1; i <= n; i++) {
    ev.push(...forStep(B, 5, "i", i, i === 1), line(6));
    const k = R8_POS[fill](n, i);
    if (k < 1) return [...ev, ...error(`rev[${k}] はない！（要素番号は 1 から）`)];
    ev.push(...B.copy(`rev[${k}]`, `data[${i}]`), line(7));
  }
  return ev;
}

const arr8 = {
  id: "arr-8",
  genre: "arr",
  level: 8,
  title: "逆さまの穴",
  concepts: ["array", "for", "index", "blank"],
  field: R8_FIELD,
  vars: {},
  varColors: { data: "#FFA726", rev: "#26A69A", n: "#66BB6A", i: "#4FC3F7" },
  program: {
    ja: [
      "整数の配列 data を用意して、{4, 7, 1, 9, 3} を入れる",
      "整数の配列 rev を用意して、{0, 0, 0, 0, 0} を入れる",
      "整数の変数 n を用意して、data の要素数（5）を入れる",
      "整数の変数 i を用意する",
      "i を 1 から n まで 1ずつ増やしながら、6行目を繰り返す",
      "  data の i番目の値を rev の（［a］）番目に写す",
      "（繰り返す範囲はここまで。5行目に戻る）",
    ],
    code: [
      "整数型の配列: data ← {4, 7, 1, 9, 3}",
      "整数型の配列: rev ← {0, 0, 0, 0, 0}",
      "整数型: n ← data の要素数",
      "整数型: i",
      "for (i を 1 から n まで 1 ずつ増やす)",
      "  rev[［a］] ← data[i]",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "data の要素数は，配列 data に入っている値の個数（5）である。"],
  question:
    "次のプログラムは、配列 data の要素を逆の順番に並べたものを配列 rev に格納する。例えば、data が {1, 2, 3} のとき、rev は {3, 2, 1} となる。rev の要素数は data の要素数と同じである。\nプログラム中の ［a］ に入れる正しい答えはどれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "n － i ＋ 1", code: "n － i ＋ 1", fill: { a: "n － i ＋ 1" }, correct: true },
    {
      ja: "n － i",
      code: "n － i",
      fill: { a: "n － i" },
      wrongFeedback: "1つ左にずれます。i＝1 で rev[4] に入り、i＝5 ではない要素 rev[0] に入れようとして止まります。i＝1 のとき入れたい場所は rev[5]（＝n）です。",
      events: arr8Run("n － i"),
    },
    {
      ja: "i",
      code: "i",
      fill: { a: "i" },
      wrongFeedback: "data[i] を同じ場所 rev[i] に写すので、並びがそのまま（{4, 7, 1, 9, 3}）になります。",
      events: arr8Run("i"),
    },
    {
      ja: "n",
      code: "n",
      fill: { a: "n" },
      wrongFeedback: "毎回 rev[5] に入れるので上書きが続き、最後の 3 だけが残ります。i によって入れる場所を変える必要があります。",
      events: arr8Run("n"),
    },
  ],
  events: [...arr8Run("n － i ＋ 1"), end()],
  expectedFinal: { arrays: { rev: [3, 9, 1, 7, 4] } },
  hints: [
    "i＝1 のとき data[1]（4）は rev の最後、つまり rev[5] に入れたい。i＝2 のとき data[2] は rev[4] です。",
    "i が 1 増えると、入れる場所は 1 減ります。i＝1 で n（5）になる式を探そう。",
    "［a］ は n － i ＋ 1。i＝1, 2, 3, 4, 5 で 5, 4, 3, 2, 1 になります。",
  ],
  explanation: {
    why: "data の i番目を rev の後ろから i番目、つまり n － i ＋ 1 番目に入れます。i＝1 で 5、i＝5 で 1 なので、ちょうど逆の順になり rev＝{3, 9, 1, 7, 4} です。",
    trace: [
      { line: 6, state: "i=1：rev[5]=4" },
      { line: 6, state: "i=2：rev[4]=7" },
      { line: 6, state: "i=3：rev[3]=1" },
      { line: 6, state: "i=4：rev[2]=9" },
      { line: 6, state: "i=5：rev[1]=3" },
    ],
    points: ["後ろから i番目の要素番号は n － i ＋ 1（i＝1 で n、i＝n で 1）", "式を決めたら、最初（i＝1）と最後（i＝n）を代入して確かめる"],
  },
};

// ---- arr-9：点数ごとの人数（要素番号に 値を 使う。空欄2つ） ----
const S9 = [3, 5, 2, 3, 1, 4];
const R9_FIELD = autoField(["i", "num"], {
  arrays: [
    { name: "score", values: S9 },
    { name: "cnt", values: [0, 0, 0, 0, 0] },
  ],
});
function arr9Run(fa, fb) {
  const B = builder(R9_FIELD);
  const cnt = [0, 0, 0, 0, 0];
  const ev = [line(1), line(2), line(3)];
  for (let i = 1; i <= S9.length; i++) {
    ev.push(...forStep(B, 4, "i", i, i === 1), line(5));
    const v = fa === "score[i]" ? S9[i - 1] : i;
    if (v > cnt.length) return [...ev, ...error(`cnt[${v}] はない！（cnt は 5番目まで）`)];
    cnt[v - 1] += 1;
    ev.push(...B.calc(`cnt[${v}]`, [`cnt[${v}]`, 1], `cnt[${v}] ＋ 1`, cnt[v - 1]), line(6));
  }
  ev.push(line(7), ...B.set("num", 0));
  let n = 0;
  for (let i = 3; i <= 5; i++) {
    ev.push(...forStep(B, 8, "i", i, i === 3), line(9));
    if (fb === "i") {
      n += i;
      ev.push(...B.calc("num", ["num", "i"], "num ＋ i", n));
    } else {
      const arr = fb === "cnt[i]" ? "cnt" : "score";
      n += (arr === "cnt" ? cnt : S9)[i - 1];
      ev.push(...B.calc("num", ["num", `${arr}[${i}]`], `num ＋ ${arr}[${i}]`, n));
    }
    ev.push(line(10));
  }
  return ev;
}
const FILL9_JA = { a: { "score[i]": "score の i番目の値", i: "i" }, b: { "cnt[i]": "cnt の i番目", i: "i", "score[i]": "score の i番目" } };
const fill9 = (a, b) => ({ a: { code: a, ja: FILL9_JA.a[a] }, b: { code: b, ja: FILL9_JA.b[b] } });

const arr9 = {
  id: "arr-9",
  genre: "arr",
  level: 9,
  title: "点数ごとの人数の穴",
  concepts: ["array", "for", "count", "index", "blank"],
  field: R9_FIELD,
  vars: {},
  varColors: { score: "#FFA726", cnt: "#26A69A", i: "#4FC3F7", num: "#66BB6A" },
  program: {
    ja: [
      "整数の配列 score を用意して、{3, 5, 2, 3, 1, 4} を入れる",
      "整数の配列 cnt を用意して、{0, 0, 0, 0, 0} を入れる",
      "整数の変数 i と num を用意する",
      "i を 1 から score の要素数（6）まで 1ずつ増やしながら、5行目を繰り返す",
      "  cnt の（［a］）番目を 1 増やす",
      "（繰り返す範囲はここまで。4行目に戻る）",
      "num に 0 を入れる",
      "i を 3 から 5 まで 1ずつ増やしながら、9行目を繰り返す",
      "  num の値に ［b］ の値を足して、その答えを num に入れる",
      "（繰り返す範囲はここまで。8行目に戻る）",
    ],
    code: [
      "整数型の配列: score ← {3, 5, 2, 3, 1, 4}",
      "整数型の配列: cnt ← {0, 0, 0, 0, 0}",
      "整数型: i, num",
      "for (i を 1 から score の要素数 まで 1 ずつ増やす)",
      "  cnt[［a］] ← cnt[［a］] ＋ 1",
      "endfor",
      "num ← 0",
      "for (i を 3 から 5 まで 1 ずつ増やす)",
      "  num ← num ＋ ［b］",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "score の要素数は，配列 score に入っている値の個数（6）である。"],
  question:
    "次のプログラムは、配列 score に格納された 6人の点数（どれも 1 以上 5 以下の整数）から、点数ごとの人数を配列 cnt に格納し、そのあと点数が 3 以上の人数を num に格納する。cnt[1] には 1点の人数、cnt[2] には 2点の人数、…、cnt[5] には 5点の人数を格納する。\nプログラム中の ［a］ と ［b］ に入れる正しい答えの組合せはどれか。",
  answerType: "blank",
  blanks: ["a", "b"],
  choices: [
    { ja: "a：score の i番目の値　b：cnt の i番目", code: "a：score[i]　b：cnt[i]", fill: fill9("score[i]", "cnt[i]"), correct: true },
    {
      ja: "a：score の i番目の値　b：i",
      code: "a：score[i]　b：i",
      fill: fill9("score[i]", "i"),
      wrongFeedback: "b に i を入れると、点数（3、4、5）そのものを足して num＝12 になります。足したいのはその点数の人数 cnt[i] です。",
      events: arr9Run("score[i]", "i"),
    },
    {
      ja: "a：score の i番目の値　b：score の i番目",
      code: "a：score[i]　b：score[i]",
      fill: fill9("score[i]", "score[i]"),
      wrongFeedback: "後半の i は点数（3〜5）です。score[i] は「i人目の点数」なので、3〜5人目の点数を足して num＝6 になります。",
      events: arr9Run("score[i]", "score[i]"),
    },
    {
      ja: "a：i　b：cnt の i番目",
      code: "a：i　b：cnt[i]",
      fill: fill9("i", "cnt[i]"),
      wrongFeedback: "a に i を入れると、点数に関係なく cnt[1], cnt[2], …と順に増やしてしまい、i＝6 ではない要素 cnt[6] を使おうとして止まります。増やすのは「i人目の点数」番目、cnt[score[i]] です。",
      events: arr9Run("i", "cnt[i]"),
    },
  ],
  events: [...arr9Run("score[i]", "cnt[i]"), end()],
  expectedFinal: { vars: { num: 4 }, arrays: { cnt: [1, 1, 2, 1, 1] } },
  hints: [
    "i＝1 のとき、1人目の点数は score[1]＝3 です。この人は 3点なので、増やしたいのは cnt[3] です。",
    "前半の i は「何人目か」、後半の i は「何点か」を表します。後半で足したいのは「i点の人数」です。",
    "a は score[i]（i人目の点数）、b は cnt[i]（i点の人数）。cnt＝{1, 1, 2, 1, 1} で、num＝cnt[3]＋cnt[4]＋cnt[5]＝2＋1＋1＝4 です。",
  ],
  explanation: {
    why: "前半では i人目の点数 score[i] を要素番号にして、cnt[score[i]] を 1 増やします。こうすると点数ごとの人数が数えられ、cnt＝{1, 1, 2, 1, 1} になります。後半では i を点数 3〜5 として、その人数 cnt[i] を足し、num＝2＋1＋1＝4 です。",
    trace: [
      { line: 5, state: "i=1：score[1]=3 → cnt[3]=1" },
      { line: 5, state: "i=2：score[2]=5 → cnt[5]=1" },
      { line: 5, state: "i=3：score[3]=2 → cnt[2]=1" },
      { line: 5, state: "i=4：score[4]=3 → cnt[3]=2" },
      { line: 5, state: "i=5：score[5]=1 → cnt[1]=1" },
      { line: 5, state: "i=6：score[6]=4 → cnt[4]=1" },
      { line: 10, state: "num=cnt[3]+cnt[4]+cnt[5]=4" },
    ],
    points: [
      "値を要素番号に使う（cnt[score[i]]）と、値ごとの個数を数えられる",
      "同じ i でも、繰り返しによって「何人目」か「何点」かの意味が違う",
      "要素番号に使う値が配列の範囲（1〜5）に入るかを確かめる",
    ],
  },
};

// ---- arr-10：重複を 取り除いて 詰める（空欄2つ） ----
const D10 = [2, 2, 5, 7, 7, 9];
const R10_FIELD = autoField(["i", "k"], {
  compare: true,
  arrays: [
    { name: "data", values: D10 },
    { name: "uniq", values: [0, 0, 0, 0, 0, 0] },
  ],
});
function arr10Run(fa, fb) {
  const B = builder(R10_FIELD);
  const uniq = [0, 0, 0, 0, 0, 0];
  const ev = [line(1), line(2), line(3), line(4), ...B.set("k", 1), line(5), ...B.copy("uniq[1]", "data[1]")];
  let k = 1;
  uniq[0] = D10[0];
  for (let i = 2; i <= D10.length; i++) {
    ev.push(...forStep(B, 6, "i", i, i === 2), line(7));
    const v = D10[i - 1];
    let ref;
    let other;
    if (fa === "uniq[k]") [ref, other] = [`uniq[${k}]`, uniq[k - 1]];
    else if (fa === "data[k]") [ref, other] = [`data[${k}]`, D10[k - 1]];
    else {
      if (i + 1 > D10.length) return [...ev, ...error(`data[${i + 1}] はない！（data は 6番目まで）`)];
      [ref, other] = [`data[${i + 1}]`, D10[i]];
    }
    const diff = v !== other;
    ev.push(...B.cmp([`data[${i}]`, ref], `${v} ≠ ${other}`, diff));
    if (diff) {
      ev.push(line(8));
      if (fb === "k ← k ＋ 1") {
        k += 1;
        ev.push(...B.calc("k", ["k", 1], "k ＋ 1", k));
      } else {
        k = i;
        ev.push(...B.copy("k", "i"));
      }
      uniq[k - 1] = v;
      ev.push(line(9), ...B.copy(`uniq[${k}]`, `data[${i}]`));
    }
    ev.push(line(10), line(11));
  }
  return ev;
}
const fill10 = (a, b) => ({
  a: { code: a, ja: { "uniq[k]": "uniq の k番目", "data[k]": "data の k番目", "data[i ＋ 1]": "data の（i ＋ 1）番目" }[a] },
  b: { code: b, ja: b === "k ← k ＋ 1" ? "k を 1 増やす" : "i の値を k に写す" },
});

const arr10 = {
  id: "arr-10",
  genre: "arr",
  level: 10,
  title: "同じものを除く穴",
  concepts: ["array", "for", "if", "dedup", "blank"],
  field: R10_FIELD,
  vars: {},
  varColors: { data: "#FFA726", uniq: "#26A69A", i: "#4FC3F7", k: "#F06292" },
  program: {
    ja: [
      "整数の配列 data を用意して、{2, 2, 5, 7, 7, 9} を入れる",
      "整数の配列 uniq を用意して、{0, 0, 0, 0, 0, 0} を入れる",
      "整数の変数 i と k を用意する",
      "k に 1 を入れる",
      "data の 1番目の値を uniq の 1番目に写す",
      "i を 2 から data の要素数（6）まで 1ずつ増やしながら、7〜10行目を繰り返す",
      "  もし data の i番目が ［a］ と等しくないなら、8〜9行目を実行する",
      "    ［b］",
      "    data の i番目の値を uniq の k番目に写す",
      "  （ここで分かれ道は終わり）",
      "（繰り返す範囲はここまで。6行目に戻る）",
    ],
    code: [
      "整数型の配列: data ← {2, 2, 5, 7, 7, 9}",
      "整数型の配列: uniq ← {0, 0, 0, 0, 0, 0}",
      "整数型: i, k",
      "k ← 1",
      "uniq[1] ← data[1]",
      "for (i を 2 から data の要素数 まで 1 ずつ増やす)",
      "  if (data[i] が ［a］ と等しくない)",
      "    ［b］",
      "    uniq[k] ← data[i]",
      "  endif",
      "endfor",
    ],
  },
  notes: [
    "配列の要素番号は 1 から始まる。",
    "data の要素数は，配列 data に入っている値の個数（6）である。",
    "for の「i を 2 から ○ まで」で，○ が 2 より小さいときは，1回も繰り返さない。",
  ],
  question:
    "次のプログラムは、昇順に整列された配列 data から、重複する値を 1つにまとめた値を先頭から順に配列 uniq に格納し、uniq に格納した値の個数を k に格納する。例えば、data が {1, 1, 3} のとき、uniq の先頭から 1、3 が格納され、k は 2 となる。data の要素数は 1 以上で、uniq の要素数は data の要素数と同じである。\nプログラム中の ［a］ と ［b］ に入れる正しい答えの組合せはどれか。",
  answerType: "blank",
  blanks: ["a", "b"],
  choices: [
    {
      ja: "a：uniq の k番目　b：k を 1 増やす",
      code: "a：uniq[k]　b：k ← k ＋ 1",
      fill: fill10("uniq[k]", "k ← k ＋ 1"),
      correct: true,
    },
    {
      ja: "a：data の k番目　b：k を 1 増やす",
      code: "a：data[k]　b：k ← k ＋ 1",
      fill: fill10("data[k]", "k ← k ＋ 1"),
      wrongFeedback: "data[k] は uniq に最後に入れた値ではありません（k は uniq の場所です）。i＝5 で 7 を data[3]（5）と比べてしまい、7 が 2回入って uniq＝{2, 5, 7, 7, 9, 0}、k＝5 になります。",
      events: arr10Run("data[k]", "k ← k ＋ 1"),
    },
    {
      ja: "a：uniq の k番目　b：i の値を k に写す",
      code: "a：uniq[k]　b：k ← i",
      fill: fill10("uniq[k]", "k ← i"),
      wrongFeedback: "k ← i では、data と同じ場所に入れることになり、先頭から詰まりません（uniq＝{2, 0, 5, 7, 0, 9}、k＝6）。k は入れるたびに 1 ずつ進めます。",
      events: arr10Run("uniq[k]", "k ← i"),
    },
    {
      ja: "a：data の（i ＋ 1）番目　b：k を 1 増やす",
      code: "a：data[i ＋ 1]　b：k ← k ＋ 1",
      fill: fill10("data[i ＋ 1]", "k ← k ＋ 1"),
      wrongFeedback: "次の要素と比べると、i＝6 のときない要素 data[7] を使おうとして止まります。それに、違う値になる手前の値（2 など）を入れることになり、1番目の 2 が 2回入ります。",
      events: arr10Run("data[i ＋ 1]", "k ← k ＋ 1"),
    },
  ],
  events: [...arr10Run("uniq[k]", "k ← k ＋ 1"), end()],
  expectedFinal: { vars: { k: 4 }, arrays: { uniq: [2, 5, 7, 9, 0, 0] } },
  hints: [
    "最初に uniq[1]＝2、k＝1 です。i＝2 の data[2]＝2 は、uniq に最後に入れた 2 と等しいので入れません。",
    "k は「uniq に入れた個数」で、uniq[k] は最後に入れた値です。新しい値を入れるときは、k を 1 進めてからその場所に入れます。",
    "a は uniq[k]、b は k ← k ＋ 1。i＝3 で 5、i＝4 で 7、i＝6 で 9 が入り、uniq＝{2, 5, 7, 9, 0, 0}、k＝4 です。",
  ],
  explanation: {
    why: "data は昇順なので、同じ値は隣り合って並びます。そこで data[i] を uniq に最後に入れた値 uniq[k] と比べ、違うときだけ k を 1 進めて uniq[k] に入れます。2、5、7、9 が入り、k＝4 です。",
    trace: [
      { line: 5, state: "uniq[1]=2, k=1" },
      { line: 7, state: "i=2：2 ≠ 2 は偽" },
      { line: 9, state: "i=3：5 ≠ 2 → k=2, uniq[2]=5" },
      { line: 9, state: "i=4：7 ≠ 5 → k=3, uniq[3]=7" },
      { line: 7, state: "i=5：7 ≠ 7 は偽" },
      { line: 9, state: "i=6：9 ≠ 7 → k=4, uniq[4]=9" },
    ],
    points: [
      "詰めて入れるときは、入れた個数 k を自分で進め、uniq[k] が「最後に入れた値」になる",
      "昇順に整列されていれば、同じ値は隣り合うので、最後に入れた値と比べれば重複が分かる",
      "data の番号 i と、uniq の番号 k を区別する",
    ],
  },
};

export default [arr1, arr2, arr3, arr4, arr5, arr6, arr7, arr8, arr9, arr10];
