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
  title: "2ばんめは どれ？",
  concepts: ["array", "index"],
  intro: "はいれつは、ばんごうの ついた ぼっくすが よこに ならんだ もの。\na[2] は「a の 2ばんめ」。ばんごうは 1 から かぞえるよ。",
  field: R1_FIELD,
  vars: {},
  varColors: { a: "#FFA726", x: "#4FC3F7" },
  program: {
    ja: ["整数の 配列 a を 用意して、{4, 9, 6} を入れる", "整数の 変数 x を 用意する", "a の 2番目の値を x に 写す"],
    code: ["整数型の配列: a ← {4, 9, 6}", "整数型: x", "x ← a[2]"],
  },
  notes: ["配列の要素番号は 1 から始まる。"],
  question: "プログラムを 実行し終わったときの x の値は どれか。",
  answerType: "vars",
  choices: [
    { ja: "x は 9", code: "x = 9", correct: true },
    {
      ja: "x は 6",
      code: "x = 6",
      wrongFeedback: "要素番号は 1 から 数えます。a[1] が 4、a[2] が 9、a[3] が 6 です。0 から 数えていませんか？",
      stop: { line: 3 },
    },
    {
      ja: "x は 4",
      code: "x = 4",
      wrongFeedback: "4 は a[1]（1番目）です。3行目で 読むのは a[2]（2番目）です。",
      stop: { line: 3 },
    },
    {
      ja: "x は 2",
      code: "x = 2",
      wrongFeedback: "a[2] の 2 は「何番目か」を 表す 要素番号です。x に入るのは、2番目の箱に 入っている 値です。",
      stop: { line: 3 },
    },
  ],
  events: [...arr1Events(), end()],
  expectedFinal: { vars: { x: 9 } },
  hints: [
    "1行目で 配列 a の 1番目に 4、2番目に 9、3番目に 6 が 入ります。要素番号は 1 から 数えるので、a[1] は 4 です。",
    "3行目の a[2] は「a の 2番目の 値」です。2 という 数 そのものでは ありません。",
    "a の 2番目の箱を 見てみよう。その値が x に 写されます。",
  ],
  explanation: {
    why: "a[2] は 配列 a の 2番目の 要素です。要素番号は 1 から 数えるので、a[1]＝4、a[2]＝9、a[3]＝6。3行目で x に 9 が 入ります。",
    trace: [
      { line: 1, state: "a=[4, 9, 6]" },
      { line: 3, state: "x=a[2]=9" },
    ],
    points: ["a[i] は 配列 a の i番目の 要素", "要素番号は 1 から 数える（このゲームと 科目Bの きまり）", "[ ] の 中の 数は 番号で、値では ない"],
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
  title: "となりの はこで けいさん",
  concepts: ["array", "index", "assign"],
  field: R2_FIELD,
  vars: {},
  varColors: { a: "#FFA726" },
  program: {
    ja: [
      "整数の 配列 a を 用意して、{6, 1, 4} を入れる",
      "a の 1番目と 3番目を 足して、その答えを a の 2番目に入れる",
      "a の 2番目から 1番目を 引いて、その答えを a の 1番目に入れる",
    ],
    code: ["整数型の配列: a ← {6, 1, 4}", "a[2] ← a[1] ＋ a[3]", "a[1] ← a[2] － a[1]"],
  },
  notes: ["配列の要素番号は 1 から始まる。"],
  question: "プログラムを 実行し終わったときの 配列 a の内容は どれか。",
  answerType: "arrays",
  choices: [
    { ja: "a は {4, 10, 4}", code: "a = {4, 10, 4}", correct: true },
    {
      ja: "a は {－5, 10, 4}",
      code: "a = {－5, 10, 4}",
      wrongFeedback: "3行目を 実行する時点で、a[2] は 2行目で 10 に 変わっています。はじめの 1 では ありません。",
      stop: { line: 3 },
    },
    {
      ja: "a は {－2, 4, 4}",
      code: "a = {－2, 4, 4}",
      wrongFeedback: "a[1] は「1番目の 値」（6）です。要素番号の 1 を 足すのでは ありません。",
      stop: { line: 2 },
    },
    {
      ja: "a は {5, 11, 4}",
      code: "a = {5, 11, 4}",
      wrongFeedback: "2行目は、右側の 計算（a[1] ＋ a[3]）の答えで a[2] を 置きかえます。前の a[2]（1）に 足すのでは ありません。",
      stop: { line: 2 },
    },
  ],
  events: [...arr2Events(), end()],
  expectedFinal: { arrays: { a: [4, 10, 4] } },
  hints: [
    "2行目：a[1] は 6、a[3] は 4 なので、6 ＋ 4 ＝ 10 が a[2] に 入ります。a は {6, 10, 4} に なります。",
    "3行目を 実行するときは、2行目で 変わった あとの 値を 使います。",
    "3行目は a[2] － a[1] ＝ 10 － 6 です。その答えで a[1] を 置きかえます。",
  ],
  explanation: {
    why: "2行目で a[2] ← 6 ＋ 4 ＝ 10 となり a＝{6, 10, 4}。3行目では 変わった あとの a[2]（10）を使い、a[1] ← 10 － 6 ＝ 4。よって a＝{4, 10, 4} です。",
    trace: [
      { line: 1, state: "a=[6, 1, 4]" },
      { line: 2, state: "a[2]=6+4=10 → a=[6, 10, 4]" },
      { line: 3, state: "a[1]=10−6=4 → a=[4, 10, 4]" },
    ],
    points: ["a[1] ＋ a[3] は、1番目と 3番目の「値」を 足す", "前の行で 書きかわった 要素は、次の行では 新しい値で 使う"],
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
  title: "いちばん 大きいのは どこ？",
  concepts: ["array", "for", "max"],
  field: R3_FIELD,
  vars: {},
  varColors: { a: "#FFA726", mx: "#66BB6A", k: "#F06292", i: "#4FC3F7" },
  program: {
    ja: [
      "整数の 配列 a を 用意して、{6, 9, 4, 9, 7} を入れる",
      "整数の 変数 mx、k、i を 用意する",
      "a の 1番目の値を mx に 写す",
      "k に 1 を入れる",
      "i を 2 から a の要素数（5）まで 1ずつ 増やしながら、6〜9行目を くりかえす",
      "  もし a の i番目 が mx より大きい なら、7〜8行目を 実行する",
      "    a の i番目の値を mx に 写す",
      "    i の値を k に 写す",
      "  （ここで 分かれ道は おわり）",
      "（くりかえす 範囲は ここまで。5行目に もどる）",
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
  notes: ["配列の要素番号は 1 から始まる。", "a の要素数 は，配列 a に入っている値の個数（5）である。"],
  question: "プログラムを 実行し終わったときの mx と k の値の 組合せは どれか。",
  answerType: "vars",
  choices: [
    { ja: "mx は 9、k は 2", code: "mx = 9, k = 2", correct: true },
    {
      ja: "mx は 9、k は 4",
      code: "mx = 9, k = 4",
      wrongFeedback: "6行目は「より大きい」です。i＝4 の a[4]＝9 は mx（9）と 等しいので、条件は 成り立たず、k は 変わりません。",
      stop: { line: 7, mark: [6] },
    },
    {
      ja: "mx は 7、k は 5",
      code: "mx = 7, k = 5",
      wrongFeedback: "7〜8行目は、6行目の条件（a[i] が mx より大きい）が 成り立つ ときだけ 実行します。小さい値で mx を 置きかえる ことは ありません。",
      stop: { line: 7, mark: [6] },
    },
    {
      ja: "mx は 9、k は 9",
      code: "mx = 9, k = 9",
      wrongFeedback: "8行目で k に 入れるのは i（要素番号）です。a[i]（値）では ありません。",
      stop: { line: 8 },
    },
  ],
  events: [...arr3Events(), end()],
  expectedFinal: { vars: { mx: 9, k: 2 } },
  hints: [
    "はじめは mx＝a[1]＝6、k＝1 です。i＝2 のとき a[2]＝9 は 6 より大きいので、mx＝9、k＝2 に なります。",
    "6行目は「より大きい」なので、mx と 等しい値では 置きかえません。8行目で k に 入るのは 要素番号 i です。",
    "i＝3, 4, 5 の a[i] は 4、9、7。どれも mx＝9 より 大きく ないので、mx と k は そのままです。",
  ],
  explanation: {
    why: "mx は それまでの 最大値、k は その 要素番号です。i＝2 で 9 が 見つかり mx＝9、k＝2。そのあとの 4、9、7 は どれも 9 より 大きく ない（a[4]＝9 は 等しいだけ）ので、mx＝9、k＝2 の ままです。",
    trace: [
      { line: 4, state: "mx=6, k=1" },
      { line: 8, state: "i=2：9 ＞ 6 → mx=9, k=2" },
      { line: 6, state: "i=3：4 ＞ 9 は 偽" },
      { line: 6, state: "i=4：9 ＞ 9 は 偽（等しい）" },
      { line: 6, state: "i=5：7 ＞ 9 は 偽" },
    ],
    points: ["最大値は「1番目を 仮の 最大値にして、2番目から 比べる」", "「より大きい」で 比べると、同じ 最大値が 複数あるときは 最初の 要素番号が 残る", "要素番号（i）と 値（a[i]）を 区別する"],
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
  title: "うしろから ずらそう",
  concepts: ["array", "for", "shift"],
  field: R4_FIELD,
  vars: {},
  varColors: { a: "#FFA726", i: "#4FC3F7", t: "#F06292" },
  program: {
    ja: [
      "整数の 配列 a を 用意して、{2, 5, 1, 4, 3} を入れる",
      "整数の 変数 i と t を 用意する",
      "a の 最後（a の要素数＝5番目）の値を t に 写す",
      "i を a の要素数（5）から 2 まで 1ずつ 減らしながら、5行目を くりかえす",
      "  a の（i － 1）番目の値を a の i番目に 写す",
      "（くりかえす 範囲は ここまで。4行目に もどる）",
      "t の値を a の 1番目に 写す",
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
  notes: ["配列の要素番号は 1 から始まる。", "a の要素数 は，配列 a に入っている値の個数（5）である。"],
  question: "プログラムを 実行し終わったときの 配列 a の内容は どれか。",
  answerType: "arrays",
  choices: [
    { ja: "a は {3, 2, 5, 1, 4}", code: "a = {3, 2, 5, 1, 4}", correct: true },
    {
      ja: "a は {3, 2, 2, 2, 2}",
      code: "a = {3, 2, 2, 2, 2}",
      wrongFeedback: "4行目は i を 5 から 2 へ「減らし」ながら くりかえします。最初は i＝5 で a[5] ← a[4]。後ろから ずらすので、まだ 写していない値を 上書きしません。",
      stop: { line: 5, mark: [4] },
    },
    {
      ja: "a は {4, 2, 5, 1, 4}",
      code: "a = {4, 2, 5, 1, 4}",
      wrongFeedback: "3行目で t に 写した 3 は、あとで a[5] が 4 に 変わっても 3 の ままです。7行目で a[1] に 入るのは t の値です。",
      stop: { line: 7, mark: [3, 7] },
    },
    {
      ja: "a は {5, 1, 4, 3, 2}",
      code: "a = {5, 1, 4, 3, 2}",
      wrongFeedback: "5行目は、a[i] に a[i － 1]（1つ前＝左どなり）の値を 写します。右どなりの値を 写すのでは ありません。",
      stop: { line: 5 },
    },
  ],
  events: [...arr4Events(), end()],
  expectedFinal: { arrays: { a: [3, 2, 5, 1, 4] } },
  hints: [
    "3行目で t＝a[5]＝3。4行目の くりかえしは i＝5 から 始まり、5行目で a[5] ← a[4]（4）となって a＝{2, 5, 1, 4, 4} です。",
    "i は 5 → 4 → 3 → 2 と 減ります。後ろから 順に「左どなりの値」を 写していきます。t の値は 3行目で 決まり、あとから 変わりません。",
    "i＝4 で a[4] ← a[3]、i＝3 で a[3] ← a[2]、i＝2 で a[2] ← a[1]。最後に a[1] ← t です。",
  ],
  explanation: {
    why: "全部の要素を 1つずつ 右へ ずらし、あふれた 最後の値（t に 取っておいた 3）を 先頭に 入れる処理です。後ろから ずらすので、写す前の値が 上書きされません。a は {2, 5, 1, 4, 4} → {2, 5, 1, 1, 4} → {2, 5, 5, 1, 4} → {2, 2, 5, 1, 4} → {3, 2, 5, 1, 4} と 変わります。",
    trace: [
      { line: 3, state: "t=3" },
      { line: 5, state: "i=5：a=[2, 5, 1, 4, 4]" },
      { line: 5, state: "i=4：a=[2, 5, 1, 1, 4]" },
      { line: 5, state: "i=3：a=[2, 5, 5, 1, 4]" },
      { line: 5, state: "i=2：a=[2, 2, 5, 1, 4]" },
      { line: 7, state: "a=[3, 2, 5, 1, 4]" },
    ],
    points: [
      "右へ ずらすときは 後ろから 写す（前から 写すと、同じ値が 続いて しまう）",
      "上書きされる値は、先に 別の変数（t）に 取っておく",
      "「1 ずつ減らす」の for は、大きい方から 小さい方へ 進む",
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
  title: "ふえた ぶんを つめよう",
  concepts: ["array", "for", "if", "copy", "off-by-one"],
  field: R5_FIELD,
  vars: {},
  varColors: { a: "#FFA726", b: "#26A69A", i: "#4FC3F7", k: "#F06292" },
  program: {
    ja: [
      "整数の 配列 a を 用意して、{5, 9, 4, 4, 7, 8} を入れる",
      "整数の 配列 b を 用意して、{0, 0, 0, 0, 0} を入れる",
      "整数の 変数 i と k を 用意する",
      "k に 1 を入れる",
      "i を 2 から a の要素数（6）まで 1ずつ 増やしながら、6〜9行目を くりかえす",
      "  もし a の i番目 が a の（i － 1）番目 より大きい なら、7〜8行目を 実行する",
      "    a の i番目から（i － 1）番目を 引いて、その答えを b の k番目に入れる",
      "    k を 1 増やす",
      "  （ここで 分かれ道は おわり）",
      "（くりかえす 範囲は ここまで。5行目に もどる）",
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
  notes: ["配列の要素番号は 1 から始まる。", "a の要素数 は，配列 a に入っている値の個数（6）である。"],
  question: "プログラムを 実行し終わったときの 配列 b の内容は どれか。",
  answerType: "arrays",
  choices: [
    { ja: "b は {4, 3, 1, －1, 0}", code: "b = {4, 3, 1, －1, 0}", correct: true },
    {
      ja: "b は {4, 3, －1, 0, 0}",
      code: "b = {4, 3, －1, 0, 0}",
      wrongFeedback: "k は 1 から 始まり、b に 入れた「あと」で 1 増えます。くりかえしが 終わったとき k は 入れた個数（3）より 1 大きい 4 なので、11行目は b[4] に 入れます。",
      stop: { line: 11, mark: [8, 11] },
    },
    {
      ja: "b は {4, 0, 3, 1, －1}",
      code: "b = {4, 0, 3, 1, －1}",
      wrongFeedback: "6行目は「より大きい」です。i＝4 の a[4]＝4 と a[3]＝4 は 等しいので、条件は 成り立たず、b には 何も 入れません。",
      stop: { line: 6, nth: 3 },
    },
    {
      ja: "b は {9, 7, 8, －1, 0}",
      code: "b = {9, 7, 8, －1, 0}",
      wrongFeedback: "7行目で b に 入れるのは a[i] そのものでは なく、a[i] － a[i － 1]（前の要素から 増えた量）です。",
      stop: { line: 7 },
    },
  ],
  events: [...arr5Events(), end()],
  expectedFinal: { arrays: { b: [4, 3, 1, -1, 0] } },
  hints: [
    "i＝2 のとき a[2]＝9 は a[1]＝5 より大きいので、b[1] ← 9 － 5 ＝ 4、そのあと k＝2 に なります。i、a[i]、a[i－1]、k を 表に して 追ってみよう。",
    "6行目は「より大きい」なので、等しい ところ（4 と 4）は 入れません。k は b に 入れた あとで 増えるので、k は いつも「次に 入れる 場所」を 指しています。",
    "b に 入るのは 4、3、1 の 3個。くりかえしの あと k は いくつに なっているかな？ 11行目は その場所に －1 を 入れます。",
  ],
  explanation: {
    why: "前の要素より 増えている ところで、増えた量を b に 前から 詰めて 入れ、最後に 終わりの印 －1 を 置く処理です。5→9（4）、4→7（3）、7→8（1）の 3か所が 入り、9→4 と 4→4（等しい）は 入りません。k は「次に 入れる 場所」なので 最後は 4 で、b[4] に －1 が 入ります。",
    trace: [
      { line: 8, state: "i=2：9−5=4 → b[1]=4, k=2" },
      { line: 6, state: "i=3：4 ＞ 9 は 偽" },
      { line: 6, state: "i=4：4 ＞ 4 は 偽（等しい）" },
      { line: 8, state: "i=5：7−4=3 → b[2]=3, k=3" },
      { line: 8, state: "i=6：8−7=1 → b[3]=1, k=4" },
      { line: 11, state: "b[4]=−1 → b=[4, 3, 1, −1, 0]" },
    ],
    points: [
      "別の配列に 詰めるときは、入れる場所（k）を 自分で 進める",
      "「入れてから k を 増やす」と、終わったときの k は 入れた個数＋1（次の 空き場所）",
      "a[i] と a[i － 1] を 比べるときは、i を 2 から 始める（a[0] は ない）",
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
      if (k > D6.length) return [...ev, ...error(`data[${k}] は ない！（data は 4番目まで）`)];
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
  title: "たす ものの あな",
  concepts: ["array", "for", "sum", "blank"],
  intro: "ここからは あなうめ もんだい。［a］ に はいる ものを えらぼう。\n「ここまで すすめる」は、あなの てまえまで つかえるよ。",
  field: R6_FIELD,
  vars: {},
  varColors: { data: "#FFA726", sum: "#66BB6A", i: "#4FC3F7" },
  program: {
    ja: [
      "整数の 配列 data を 用意して、{3, 8, 5, 6} を入れる",
      "整数の 変数 sum を 用意して、0 を入れる",
      "整数の 変数 i を 用意する",
      "i を 1 から data の要素数（4）まで 1ずつ 増やしながら、5行目を くりかえす",
      "  sum の値に ［a］ の値を 足して、その答えを sum に入れる",
      "（くりかえす 範囲は ここまで。4行目に もどる）",
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
  notes: ["配列の要素番号は 1 から始まる。", "data の要素数 は，配列 data に入っている値の個数（4）である。"],
  question: "次のプログラムは、配列 data の 全ての 要素の 値の 合計を sum に 格納する。\nプログラム中の ［a］ に入れる 正しい答えは どれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "data の i番目", code: "data[i]", fill: { a: { code: "data[i]", ja: "data の i番目" } }, correct: true },
    {
      ja: "i",
      code: "i",
      fill: { a: "i" },
      wrongFeedback: "i は 要素番号（1, 2, 3, 4）です。これでは 番号を 足して sum＝10 に なります。足したいのは i番目の 値 data[i] です。",
      events: arr6Run("i"),
    },
    {
      ja: "data の 1番目",
      code: "data[1]",
      fill: { a: { code: "data[1]", ja: "data の 1番目" } },
      wrongFeedback: "data[1] は いつも 1番目（3）なので、3 を 4回 足して sum＝12 に なります。i に よって 変わる data[i] を 使います。",
      events: arr6Run("data[1]"),
    },
    {
      ja: "data の（i ＋ 1）番目",
      code: "data[i ＋ 1]",
      fill: { a: { code: "data[i ＋ 1]", ja: "data の（i ＋ 1）番目" } },
      wrongFeedback: "1つ 先の 要素を 足すので、data[1] を 足さず、i＝4 のとき ない 要素 data[5] を 使おうとして 止まります。",
      events: arr6Run("data[i ＋ 1]"),
    },
  ],
  events: [...arr6Run("data[i]"), end()],
  expectedFinal: { vars: { sum: 22 } },
  hints: [
    "i は 1, 2, 3, 4 と 変わります。i＝1 のとき 足したいのは data の 1番目の 値（3）です。",
    "i そのもの（番号）と、data[i]（i番目の 値）の ちがいに 気をつけよう。",
    "［a］ は data[i]。sum＝3＋8＋5＋6＝22 です。",
  ],
  explanation: {
    why: "i を 1 から 4 まで 変えながら、i番目の 値 data[i] を sum に 足します。sum は 0 → 3 → 11 → 16 → 22 と なります。",
    trace: [
      { line: 5, state: "i=1：sum=3" },
      { line: 5, state: "i=2：sum=11" },
      { line: 5, state: "i=3：sum=16" },
      { line: 5, state: "i=4：sum=22" },
    ],
    points: ["配列の 合計は、要素番号 i を 1 から 要素数 まで 変えて data[i] を 足す", "i（番号）と data[i]（値）を 区別する", "ない 要素番号（0 や 要素数＋1）を 使うと 実行できない"],
  },
};

// ---- arr-7：最大値の はじめの値（負の数あり） ----
const D7 = [-2, -7, -4, -9];
const R7_FIELD = autoField(["i", "mx"], { compare: true, arrays: [{ name: "data", values: D7 }] });
function arr7Run(fill) {
  const B = builder(R7_FIELD);
  const ev = [line(1), line(2), line(3)];
  let mx;
  if (fill === "data[i]") return [...ev, ...error("i に まだ 値が 入っていない！")];
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
  title: "さいだいちの はじめの あな",
  concepts: ["array", "for", "max", "blank"],
  field: R7_FIELD,
  vars: {},
  varColors: { data: "#FFA726", i: "#4FC3F7", mx: "#66BB6A" },
  program: {
    ja: [
      "整数の 配列 data を 用意して、{－2, －7, －4, －9} を入れる",
      "整数の 変数 i を 用意する（まだ 空っぽ）",
      "整数の 変数 mx を 用意して、［a］ を 入れる",
      "i を 2 から data の要素数（4）まで 1ずつ 増やしながら、5〜7行目を くりかえす",
      "  もし data の i番目 が mx より大きい なら、6行目を 実行する",
      "    data の i番目の値を mx に 写す",
      "  （ここで 分かれ道は おわり）",
      "（くりかえす 範囲は ここまで。4行目に もどる）",
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
    "data の要素数 は，配列 data に入っている値の個数（4）である。",
    "for の「i を 2 から ○ まで」で，○ が 2 より小さいときは，1回も繰り返さない。",
  ],
  question:
    "次のプログラムは、配列 data の 要素の 値の 最大値を mx に 格納する。data の 要素数は 1 以上で、要素の 値は 負の数の ことも ある。\nプログラム中の ［a］ に入れる 正しい答えは どれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "data の 1番目", code: "data[1]", fill: { a: { code: "data[1]", ja: "data の 1番目の値" } }, correct: true },
    {
      ja: "0",
      code: "0",
      fill: { a: "0" },
      wrongFeedback: "要素が 全部 負の数だと、どの要素も 0 より 大きく ないので、mx は 0 の まま 残ります。0 は data の 要素では ありません。",
      events: arr7Run("0"),
    },
    {
      ja: "data の 2番目",
      code: "data[2]",
      fill: { a: { code: "data[2]", ja: "data の 2番目の値" } },
      wrongFeedback: "くりかえしは i＝2 から なので、data[1] は 一度も 比べられません。最大値の data[1]（－2）を 見落として mx＝－4 に なります。",
      events: arr7Run("data[2]"),
    },
    {
      ja: "data の i番目",
      code: "data[i]",
      fill: { a: { code: "data[i]", ja: "data の i番目の値" } },
      wrongFeedback: "3行目の 時点で i には まだ 値が 入っていません（2行目で 用意しただけ）。値の ない変数は 使えません。",
      events: arr7Run("data[i]"),
    },
  ],
  events: [...arr7Run("data[1]"), end()],
  expectedFinal: { vars: { mx: -2 } },
  hints: [
    "4行目の くりかえしは i＝2 から 始まります。では data[1] は どこで 調べるのかな？",
    "mx の はじめの値は、data の 要素の 1つで なければ なりません（0 にすると、全部 負の数の ときに 困ります）。",
    "［a］ は data[1]。はじめ mx＝－2 で、－7、－4、－9 は どれも －2 より 大きく ないので mx＝－2 です。",
  ],
  explanation: {
    why: "はじめに 1番目の 値 data[1] を 仮の 最大値に して、2番目から 最後までと 比べます。そのため くりかえしは i＝2 から です。0 から 始めると、全部が 負の数の ときに 0 が 残って しまいます。",
    trace: [
      { line: 3, state: "mx=data[1]=−2" },
      { line: 5, state: "i=2：−7 ＞ −2 は 偽" },
      { line: 5, state: "i=3：−4 ＞ −2 は 偽" },
      { line: 5, state: "i=4：−9 ＞ −2 は 偽" },
    ],
    points: ["最大値・最小値の はじめの値は、配列の 1番目の 要素に する", "0 などの 決めうちの 値は、負の数が あると 正しく ない", "1番目で 始めたら、くりかえしは 2番目から"],
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
    if (k < 1) return [...ev, ...error(`rev[${k}] は ない！（要素番号は 1 から）`)];
    ev.push(...B.copy(`rev[${k}]`, `data[${i}]`), line(7));
  }
  return ev;
}

const arr8 = {
  id: "arr-8",
  genre: "arr",
  level: 8,
  title: "さかさまの あな",
  concepts: ["array", "for", "index", "blank"],
  field: R8_FIELD,
  vars: {},
  varColors: { data: "#FFA726", rev: "#26A69A", n: "#66BB6A", i: "#4FC3F7" },
  program: {
    ja: [
      "整数の 配列 data を 用意して、{4, 7, 1, 9, 3} を入れる",
      "整数の 配列 rev を 用意して、{0, 0, 0, 0, 0} を入れる",
      "整数の 変数 n を 用意して、data の要素数（5）を 入れる",
      "整数の 変数 i を 用意する",
      "i を 1 から n まで 1ずつ 増やしながら、6行目を くりかえす",
      "  data の i番目の値を rev の（［a］）番目に 写す",
      "（くりかえす 範囲は ここまで。5行目に もどる）",
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
  notes: ["配列の要素番号は 1 から始まる。", "data の要素数 は，配列 data に入っている値の個数（5）である。"],
  question:
    "次のプログラムは、配列 data の 要素を 逆の 順番に 並べたものを 配列 rev に 格納する。例えば、data が {1, 2, 3} の とき、rev は {3, 2, 1} と なる。rev の 要素数は data の 要素数と 同じである。\nプログラム中の ［a］ に入れる 正しい答えは どれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "n － i ＋ 1", code: "n － i ＋ 1", fill: { a: "n － i ＋ 1" }, correct: true },
    {
      ja: "n － i",
      code: "n － i",
      fill: { a: "n － i" },
      wrongFeedback: "1つ 左に ずれます。i＝1 で rev[4] に 入り、i＝5 では ない 要素 rev[0] に 入れようとして 止まります。i＝1 の とき 入れたい場所は rev[5]（＝n）です。",
      events: arr8Run("n － i"),
    },
    {
      ja: "i",
      code: "i",
      fill: { a: "i" },
      wrongFeedback: "data[i] を 同じ 場所 rev[i] に 写すので、並びが そのまま（{4, 7, 1, 9, 3}）に なります。",
      events: arr8Run("i"),
    },
    {
      ja: "n",
      code: "n",
      fill: { a: "n" },
      wrongFeedback: "毎回 rev[5] に 入れるので 上書きが 続き、最後の 3 だけが 残ります。i に よって 入れる 場所を 変える 必要が あります。",
      events: arr8Run("n"),
    },
  ],
  events: [...arr8Run("n － i ＋ 1"), end()],
  expectedFinal: { arrays: { rev: [3, 9, 1, 7, 4] } },
  hints: [
    "i＝1 の とき data[1]（4）は rev の 最後、つまり rev[5] に 入れたい。i＝2 の とき data[2] は rev[4] です。",
    "i が 1 増えると、入れる 場所は 1 減ります。i＝1 で n（5）に なる 式を 探そう。",
    "［a］ は n － i ＋ 1。i＝1, 2, 3, 4, 5 で 5, 4, 3, 2, 1 に なります。",
  ],
  explanation: {
    why: "data の i番目を rev の 後ろから i番目、つまり n － i ＋ 1 番目に 入れます。i＝1 で 5、i＝5 で 1 なので、ちょうど 逆の順に なり rev＝{3, 9, 1, 7, 4} です。",
    trace: [
      { line: 6, state: "i=1：rev[5]=4" },
      { line: 6, state: "i=2：rev[4]=7" },
      { line: 6, state: "i=3：rev[3]=1" },
      { line: 6, state: "i=4：rev[2]=9" },
      { line: 6, state: "i=5：rev[1]=3" },
    ],
    points: ["後ろから i番目の 要素番号は n － i ＋ 1（i＝1 で n、i＝n で 1）", "式を 決めたら、最初（i＝1）と 最後（i＝n）を 代入して 確かめる"],
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
    if (v > cnt.length) return [...ev, ...error(`cnt[${v}] は ない！（cnt は 5番目まで）`)];
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
  title: "てんすうごとの にんずうの あな",
  concepts: ["array", "for", "count", "index", "blank"],
  field: R9_FIELD,
  vars: {},
  varColors: { score: "#FFA726", cnt: "#26A69A", i: "#4FC3F7", num: "#66BB6A" },
  program: {
    ja: [
      "整数の 配列 score を 用意して、{3, 5, 2, 3, 1, 4} を入れる",
      "整数の 配列 cnt を 用意して、{0, 0, 0, 0, 0} を入れる",
      "整数の 変数 i と num を 用意する",
      "i を 1 から score の要素数（6）まで 1ずつ 増やしながら、5行目を くりかえす",
      "  cnt の（［a］）番目を 1 増やす",
      "（くりかえす 範囲は ここまで。4行目に もどる）",
      "num に 0 を入れる",
      "i を 3 から 5 まで 1ずつ 増やしながら、9行目を くりかえす",
      "  num の値に ［b］ の値を 足して、その答えを num に入れる",
      "（くりかえす 範囲は ここまで。8行目に もどる）",
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
  notes: ["配列の要素番号は 1 から始まる。", "score の要素数 は，配列 score に入っている値の個数（6）である。"],
  question:
    "次のプログラムは、配列 score に 格納された 6人の 点数（どれも 1 以上 5 以下の 整数）から、点数ごとの 人数を 配列 cnt に 格納し、そのあと 点数が 3 以上の 人数を num に 格納する。cnt[1] には 1点の 人数、cnt[2] には 2点の 人数、…、cnt[5] には 5点の 人数を 格納する。\nプログラム中の ［a］ と ［b］ に入れる 正しい答えの 組合せは どれか。",
  answerType: "blank",
  blanks: ["a", "b"],
  choices: [
    { ja: "a：score の i番目の値　b：cnt の i番目", code: "a：score[i]　b：cnt[i]", fill: fill9("score[i]", "cnt[i]"), correct: true },
    {
      ja: "a：score の i番目の値　b：i",
      code: "a：score[i]　b：i",
      fill: fill9("score[i]", "i"),
      wrongFeedback: "b に i を 入れると、点数（3、4、5）そのものを 足して num＝12 に なります。足したいのは その点数の 人数 cnt[i] です。",
      events: arr9Run("score[i]", "i"),
    },
    {
      ja: "a：score の i番目の値　b：score の i番目",
      code: "a：score[i]　b：score[i]",
      fill: fill9("score[i]", "score[i]"),
      wrongFeedback: "後半の i は 点数（3〜5）です。score[i] は「i人目の 点数」なので、3〜5人目の 点数を 足して num＝6 に なります。",
      events: arr9Run("score[i]", "score[i]"),
    },
    {
      ja: "a：i　b：cnt の i番目",
      code: "a：i　b：cnt[i]",
      fill: fill9("i", "cnt[i]"),
      wrongFeedback: "a に i を 入れると、点数に 関係なく cnt[1], cnt[2], … と 順に 増やして しまい、i＝6 では ない 要素 cnt[6] を 使おうとして 止まります。増やすのは「i人目の 点数」番目、cnt[score[i]] です。",
      events: arr9Run("i", "cnt[i]"),
    },
  ],
  events: [...arr9Run("score[i]", "cnt[i]"), end()],
  expectedFinal: { vars: { num: 4 }, arrays: { cnt: [1, 1, 2, 1, 1] } },
  hints: [
    "i＝1 の とき、1人目の 点数は score[1]＝3 です。この人は 3点なので、増やしたいのは cnt[3] です。",
    "前半の i は「何人目か」、後半の i は「何点か」を 表します。後半で 足したいのは「i点の 人数」です。",
    "a は score[i]（i人目の 点数）、b は cnt[i]（i点の 人数）。cnt＝{1, 1, 2, 1, 1} で、num＝cnt[3]＋cnt[4]＋cnt[5]＝2＋1＋1＝4 です。",
  ],
  explanation: {
    why: "前半では i人目の 点数 score[i] を 要素番号に して、cnt[score[i]] を 1 増やします。こうすると 点数ごとの 人数が 数えられ、cnt＝{1, 1, 2, 1, 1} に なります。後半では i を 点数 3〜5 として、その 人数 cnt[i] を 足し、num＝2＋1＋1＝4 です。",
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
      "値を 要素番号に 使う（cnt[score[i]]）と、値ごとの 個数を 数えられる",
      "同じ i でも、くりかえしに よって「何人目」か「何点」かの 意味が ちがう",
      "要素番号に 使う値が 配列の 範囲（1〜5）に 入るかを 確かめる",
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
      if (i + 1 > D10.length) return [...ev, ...error(`data[${i + 1}] は ない！（data は 6番目まで）`)];
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
  b: { code: b, ja: b === "k ← k ＋ 1" ? "k を 1 増やす" : "i の値を k に 写す" },
});

const arr10 = {
  id: "arr-10",
  genre: "arr",
  level: 10,
  title: "おなじ ものを のぞく あな",
  concepts: ["array", "for", "if", "dedup", "blank"],
  field: R10_FIELD,
  vars: {},
  varColors: { data: "#FFA726", uniq: "#26A69A", i: "#4FC3F7", k: "#F06292" },
  program: {
    ja: [
      "整数の 配列 data を 用意して、{2, 2, 5, 7, 7, 9} を入れる",
      "整数の 配列 uniq を 用意して、{0, 0, 0, 0, 0, 0} を入れる",
      "整数の 変数 i と k を 用意する",
      "k に 1 を入れる",
      "data の 1番目の値を uniq の 1番目に 写す",
      "i を 2 から data の要素数（6）まで 1ずつ 増やしながら、7〜10行目を くりかえす",
      "  もし data の i番目 が ［a］ と 等しくない なら、8〜9行目を 実行する",
      "    ［b］",
      "    data の i番目の値を uniq の k番目に 写す",
      "  （ここで 分かれ道は おわり）",
      "（くりかえす 範囲は ここまで。6行目に もどる）",
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
    "data の要素数 は，配列 data に入っている値の個数（6）である。",
    "for の「i を 2 から ○ まで」で，○ が 2 より小さいときは，1回も繰り返さない。",
  ],
  question:
    "次のプログラムは、昇順に 整列された 配列 data から、重複する 値を 1つに まとめた 値を 先頭から 順に 配列 uniq に 格納し、uniq に 格納した 値の 個数を k に 格納する。例えば、data が {1, 1, 3} の とき、uniq の 先頭から 1、3 が 格納され、k は 2 と なる。data の 要素数は 1 以上で、uniq の 要素数は data の 要素数と 同じである。\nプログラム中の ［a］ と ［b］ に入れる 正しい答えの 組合せは どれか。",
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
      wrongFeedback: "data[k] は uniq に 最後に 入れた値では ありません（k は uniq の 場所です）。i＝5 で 7 を data[3]（5）と 比べて しまい、7 が 2回 入って uniq＝{2, 5, 7, 7, 9, 0}、k＝5 に なります。",
      events: arr10Run("data[k]", "k ← k ＋ 1"),
    },
    {
      ja: "a：uniq の k番目　b：i の値を k に 写す",
      code: "a：uniq[k]　b：k ← i",
      fill: fill10("uniq[k]", "k ← i"),
      wrongFeedback: "k ← i では、data と 同じ 場所に 入れることに なり、先頭から 詰まりません（uniq＝{2, 0, 5, 7, 0, 9}、k＝6）。k は 入れるたびに 1 ずつ 進めます。",
      events: arr10Run("uniq[k]", "k ← i"),
    },
    {
      ja: "a：data の（i ＋ 1）番目　b：k を 1 増やす",
      code: "a：data[i ＋ 1]　b：k ← k ＋ 1",
      fill: fill10("data[i ＋ 1]", "k ← k ＋ 1"),
      wrongFeedback: "次の 要素と 比べると、i＝6 のとき ない 要素 data[7] を 使おうとして 止まります。それに、ちがう 値に なる 手前の 値（2 など）を 入れる ことに なり、1番目の 2 が 2回 入ります。",
      events: arr10Run("data[i ＋ 1]", "k ← k ＋ 1"),
    },
  ],
  events: [...arr10Run("uniq[k]", "k ← k ＋ 1"), end()],
  expectedFinal: { vars: { k: 4 }, arrays: { uniq: [2, 5, 7, 9, 0, 0] } },
  hints: [
    "はじめに uniq[1]＝2、k＝1 です。i＝2 の data[2]＝2 は、uniq に 最後に 入れた 2 と 等しいので 入れません。",
    "k は「uniq に 入れた 個数」で、uniq[k] は 最後に 入れた値です。新しい値を 入れるときは、k を 1 進めてから その場所に 入れます。",
    "a は uniq[k]、b は k ← k ＋ 1。i＝3 で 5、i＝4 で 7、i＝6 で 9 が 入り、uniq＝{2, 5, 7, 9, 0, 0}、k＝4 です。",
  ],
  explanation: {
    why: "data は 昇順なので、同じ値は 隣り合って 並びます。そこで data[i] を uniq に 最後に 入れた値 uniq[k] と 比べ、ちがうときだけ k を 1 進めて uniq[k] に 入れます。2、5、7、9 が 入り、k＝4 です。",
    trace: [
      { line: 5, state: "uniq[1]=2, k=1" },
      { line: 7, state: "i=2：2 ≠ 2 は 偽" },
      { line: 9, state: "i=3：5 ≠ 2 → k=2, uniq[2]=5" },
      { line: 9, state: "i=4：7 ≠ 5 → k=3, uniq[3]=7" },
      { line: 7, state: "i=5：7 ≠ 7 は 偽" },
      { line: 9, state: "i=6：9 ≠ 7 → k=4, uniq[4]=9" },
    ],
    points: [
      "詰めて 入れるときは、入れた個数 k を 自分で 進め、uniq[k] が「最後に 入れた値」に なる",
      "昇順に 整列されていれば、同じ値は 隣り合うので、最後に 入れた値と 比べれば 重複が 分かる",
      "data の 番号 i と、uniq の 番号 k を 区別する",
    ],
  },
};

export default [arr1, arr2, arr3, arr4, arr5, arr6, arr7, arr8, arr9, arr10];
