// ① var（じゅんじょと へんすう）
import { line, spawn, spawnOnPad, pickup, takeCopy, put, calc, store, end, builder, mkField, autoField } from "./helpers.js";

// ---- var-1：上から順に実行する（同じ変数を2回 更新する） ----
const V1_FIELD = autoField(["x"]);
const B1 = builder(V1_FIELD);

const var1 = {
  id: "var-1",
  genre: "var",
  level: 1,
  title: "じゅんばんに けいさん",
  concepts: ["sequence", "assign"],
  intro: "しょりは うえから じゅんばんに 1ぎょうずつ じっこうされるよ。\nじゅんばんどおりに たどってみよう。",
  field: V1_FIELD,
  vars: {},
  varColors: { x: "#4FC3F7" },
  program: {
    ja: ["整数の 変数 x を 用意して、2 を入れる", "x の値に 3 を足して、その答えを x に入れる", "x の値に 2 を かけて、その答えを x に入れる"],
    code: ["整数型: x ← 2", "x ← x ＋ 3", "x ← x × 2"],
  },
  question: "プログラムを 実行し終わったときの x の値は どれか。",
  answerType: "vars",
  choices: [
    { ja: "x は 10", code: "x = 10", correct: true },
    {
      ja: "x は 7",
      code: "x = 7",
      wrongFeedback: "2行目と3行目の順番を 入れかえて 計算していませんか？ 処理は 上から順に 実行します。先に 2行目で x＝2＋3＝5 になります。",
      stop: { line: 2 },
    },
    {
      ja: "x は 5",
      code: "x = 5",
      wrongFeedback: "3行目の「x ← x × 2」を 見落としていませんか？ 2行目のあとも 処理は続きます。",
      stop: { line: 3 },
    },
    {
      ja: "x は 8",
      code: "x = 8",
      wrongFeedback: "3行目では、そのときの x の値（5）全体に 2 を かけます。2＋3×2 のように 3 だけに かけていませんか？",
      stop: { line: 3 },
    },
  ],
  events: [line(1), ...B1.set("x", 2), line(2), ...B1.calc("x", ["x", 3], "x ＋ 3", 5), line(3), ...B1.calc("x", ["x", 2], "x × 2", 10), end()],
  expectedFinal: { vars: { x: 10 } },
  hints: [
    "1行目で x に 2 が入ります。2行目は、そのときの x の値（2）に 3 を足して、答えを x に入れます。",
    "2行目のあと x は 5 です。3行目は 新しい x（5）に 2 を かけます。",
    "5 × 2 ＝ 10 です。",
  ],
  explanation: {
    why: "処理は上から順に実行されます。1行目で x＝2、2行目で x＝2＋3＝5、3行目で x＝5×2＝10 になります。",
    trace: [
      { line: 1, state: "x=2" },
      { line: 2, state: "x=5" },
      { line: 3, state: "x=10" },
    ],
    points: ["処理は1行目から順番に実行される（順次実行）", "「x ← x ＋ 3」は、いまの x の値を使って計算し、その答えで x を置きかえる"],
  },
};

// ---- var-2 ----
const V2_FIELD = {
  cols: 7,
  rows: 5,
  tiles: [".......", ".......", ".......", ".......", "......."],
  start: { x: 2, y: 2, dir: "right" },
  spawn: { x: 0, y: 2 },
  boxes: [
    { var: "x", x: 5, y: 1, access: { x: 5, y: 2 } },
    { var: "y", x: 5, y: 3, access: { x: 5, y: 2 } },
  ],
  pads: [{ kind: "calc", x: 3, y: 1, access: { x: 3, y: 2 } }],
  items: [],
  arrays: [],
  switches: [],
  doors: [],
  stacks: [],
  queues: [],
};

const v2Line1 = [line(1), line(2), spawn("n3", 3, 0, 2), pickup("n3"), store("n3", "x")];
const v2Line2 = [
  line(3),
  takeCopy("x", "cx"),
  put("cx", "calc"),
  spawnOnPad("n2", 2, "calc"),
  calc("x ＋ 2", 5, "r5"),
  pickup("r5"),
  store("r5", "y"),
];

const var2 = {
  id: "var-2",
  genre: "var",
  level: 2,
  title: "ぼっくすに いれよう",
  concepts: ["assign"],
  field: V2_FIELD,
  vars: {},
  varColors: { x: "#4FC3F7", y: "#66BB6A" },
  program: {
    ja: [
      "整数を入れる 変数 x と y を 用意する（まだ 空っぽ）",
      "x に 3 を入れる",
      "x の値に 2 を足して、その答えを y に入れる",
      "y の値から 1 を引いて、その答えを x に入れる",
    ],
    code: ["整数型: x, y", "x ← 3", "y ← x ＋ 2", "x ← y － 1"],
  },
  question: "プログラムを 実行し終わったときの x の値は どれか。",
  answerType: "vars",
  choices: [
    {
      ja: "x は 3 です",
      code: "x = 3",
      wrongFeedback: "4行目で x が上書きされます。最後に x に入った値を確かめましょう。",
      stop: { line: 4 },
    },
    { ja: "x は 4 です", code: "x = 4", correct: true },
    {
      ja: "x は 5 です",
      code: "x = 5",
      wrongFeedback: "5 は y の値です。x は 4行目で「y － 1」に更新されます。",
      stop: { line: 4 },
    },
    {
      ja: "x は 7 です",
      code: "x = 7",
      wrongFeedback: "足し算を重ねていませんか？ 4行目は引き算です。",
      stop: { line: 4 },
    },
  ],
  events: [
    ...v2Line1,
    ...v2Line2,
    line(4),
    takeCopy("y", "cy"),
    put("cy", "calc"),
    spawnOnPad("n1", 1, "calc"),
    calc("y － 1", 4, "r4"),
    pickup("r4"),
    store("r4", "x"),
    end(),
  ],
  expectedFinal: { vars: { x: 4, y: 5 } },
  hints: [
    "2行目で x に 3 が入り、3行目で y に 3＋2＝5 が入ります。4行目では、y の 5 を使って x に何が入るかを考えよう。",
    "「←」（右の値を 左の変数に 入れる）では、まず右側の計算をして、その答えを左側の変数に入れます。4行目は「y から 1 を引いた値」を計算してから x に入れます。",
    "4行目の計算は 5－1＝4。この 4 が x に入り、x の古い値 3 は消えます。",
  ],
  explanation: {
    why: "1行目で x と y を用意し（まだ未定義）、2行目で x=3、3行目で y=x＋2=5 になります。4行目で y－1=4 が x に入るので、x の古い値 3 は置き換えられ、x=4 になります。",
    trace: [
      { line: 1, state: "x, y は 未定義" },
      { line: 2, state: "x=3" },
      { line: 3, state: "x=3, y=5" },
      { line: 4, state: "x=4, y=5" },
    ],
    points: ["「←」で値を入れる処理は、右側の計算を先にして、その答えを左側の変数に入れる", "変数に新しい値を入れると、古い値は置き換えられる"],
  },
};

// ---- var-3：足し算・引き算で値を入れかえる（前の行で更新された値を使う） ----
const V3_FIELD = mkField({
  cols: 7,
  rows: 5,
  start: { x: 2, y: 2, dir: "right" },
  spawn: { x: 0, y: 2 },
  boxes: [
    { var: "x", x: 5, y: 1, access: { x: 5, y: 2 } },
    { var: "y", x: 5, y: 3, access: { x: 5, y: 2 } },
  ],
  pads: [{ kind: "calc", x: 3, y: 1, access: { x: 3, y: 2 } }],
});
const B3 = builder(V3_FIELD);
const v3L1 = [line(1), ...B3.set("x", 5)];
const v3L2 = [line(2), ...B3.set("y", 3)];
const v3L3 = [line(3), ...B3.calc("x", ["x", "y"], "x ＋ y", 8)];
const v3L4 = [line(4), ...B3.calc("y", ["x", "y"], "x － y", 5)];
const v3L5 = [line(5), ...B3.calc("x", ["x", "y"], "x － y", 3)];

const var3 = {
  id: "var-3",
  genre: "var",
  level: 3,
  title: "いれかえ マジック",
  concepts: ["assign", "swap"],
  field: V3_FIELD,
  vars: {},
  varColors: { x: "#4FC3F7", y: "#66BB6A" },
  program: {
    ja: [
      "整数の 変数 x を 用意して、5 を入れる",
      "整数の 変数 y を 用意して、3 を入れる",
      "x の値と y の値を 足して、その答えを x に入れる",
      "x の値から y の値を 引いて、その答えを y に入れる",
      "x の値から y の値を 引いて、その答えを x に入れる",
    ],
    code: ["整数型: x ← 5", "整数型: y ← 3", "x ← x ＋ y", "y ← x － y", "x ← x － y"],
  },
  question: "プログラムを 実行し終わったときの x と y の値の 組合せは どれか。",
  answerType: "vars",
  choices: [
    { ja: "x は 3、y は 5", code: "x = 3, y = 5", correct: true },
    {
      ja: "x は 8、y は 5",
      code: "x = 8, y = 5",
      wrongFeedback: "4行目までの値は合っています。5行目で x がもう一度 更新されるのを見落としていませんか？",
      stop: { line: 5 },
    },
    {
      ja: "x は 5、y は 3",
      code: "x = 5, y = 3",
      wrongFeedback: "3〜5行目で x と y は どちらも書きかえられます。1行ずつ値を追ってみましょう。",
      stop: { line: 3 },
    },
    {
      ja: "x は 6、y は 2",
      code: "x = 6, y = 2",
      wrongFeedback: "4行目の x は、3行目で 8 に更新されています。はじめの 5 ではなく 8 を使って計算します。",
      stop: { line: 4 },
    },
  ],
  events: [...v3L1, ...v3L2, ...v3L3, ...v3L4, ...v3L5, end()],
  expectedFinal: { vars: { x: 3, y: 5 } },
  hints: [
    "3行目で x に 5＋3＝8 が入ります。4行目の「x から y を引く」では、x はもう 8 になっていることに注意して計算してみよう。",
    "4行目は 8－3＝5 で、y に 5 が入ります。5行目も、新しい x（8）と 新しい y（5）を使います。",
    "5行目は 8－5＝3 で x＝3。最後は x＝3、y＝5 です。",
  ],
  explanation: {
    why: "3行目で x＝5＋3＝8。4行目は 新しい x を使って y＝8－3＝5。5行目は x＝8－5＝3。はじめの x と y の値（5 と 3）が入れかわりました。",
    trace: [
      { line: 1, state: "x=5" },
      { line: 2, state: "x=5, y=3" },
      { line: 3, state: "x=8, y=3" },
      { line: 4, state: "x=8, y=5" },
      { line: 5, state: "x=3, y=5" },
    ],
    points: ["次の行では、前の行で更新された新しい値を使って計算する", "足し算と引き算を組み合わせると、別の変数を使わずに2つの値を入れかえられる"],
  },
};

// ---- var-4：3つの変数と更新の順番 ----
const V4_FIELD = mkField({
  cols: 8,
  rows: 5,
  start: { x: 2, y: 2, dir: "right" },
  spawn: { x: 0, y: 2 },
  boxes: [
    { var: "a", x: 6, y: 1, access: { x: 5, y: 1 } },
    { var: "b", x: 6, y: 2, access: { x: 5, y: 2 } },
    { var: "c", x: 6, y: 3, access: { x: 5, y: 3 } },
  ],
  pads: [{ kind: "calc", x: 3, y: 1, access: { x: 3, y: 2 } }],
});
const B4 = builder(V4_FIELD);
const v4Decl = [line(1), ...B4.set("a", 2), line(2), ...B4.set("b", 5), line(3), ...B4.set("c", 0)];
const v4L4 = [line(4), ...B4.calc("c", ["a", "b"], "a ＋ b", 7)];
const v4L5 = [line(5), ...B4.calc("a", ["c", "a"], "c － a", 5)];
const v4L6 = [line(6), ...B4.calc("b", ["a", 2], "a × 2", 10)];
const v4L7 = [line(7), ...B4.calc("c", ["c", "b"], "c － b", -3)];

const var4 = {
  id: "var-4",
  genre: "var",
  level: 4,
  title: "じゅんばんが だいじ",
  concepts: ["assign", "order"],
  field: V4_FIELD,
  vars: {},
  varColors: { a: "#4FC3F7", b: "#66BB6A", c: "#F06292" },
  program: {
    ja: [
      "整数の 変数 a を 用意して、2 を入れる",
      "整数の 変数 b を 用意して、5 を入れる",
      "整数の 変数 c を 用意して、0 を入れる",
      "a の値と b の値を 足して、その答えを c に入れる",
      "c の値から a の値を 引いて、その答えを a に入れる",
      "a の値に 2 を かけて、その答えを b に入れる",
      "c の値から b の値を 引いて、その答えを c に入れる",
    ],
    code: ["整数型: a ← 2", "整数型: b ← 5", "整数型: c ← 0", "c ← a ＋ b", "a ← c － a", "b ← a × 2", "c ← c － b"],
  },
  question: "プログラムを 実行し終わったときの a、b、c の値の 組合せは どれか。",
  answerType: "vars",
  choices: [
    { ja: "a は 5、b は 10、c は −3", code: "a = 5, b = 10, c = −3", correct: true },
    {
      ja: "a は 5、b は 4、c は 3",
      code: "a = 5, b = 4, c = 3",
      wrongFeedback: "6行目の a は、5行目で 5 に更新されています。はじめの 2 ではなく 新しい a を使います。",
      stop: { line: 6 },
    },
    {
      ja: "a は 5、b は 10、c は 7",
      code: "a = 5, b = 10, c = 7",
      wrongFeedback: "7行目で c が もう一度 更新されます。c は 4行目だけで決まるわけではありません。",
      stop: { line: 7 },
    },
    {
      ja: "a は −5、b は −10、c は 17",
      code: "a = −5, b = −10, c = 17",
      wrongFeedback: "5行目は「c から a を引く」（c － a）です。引く順番を逆にしていませんか？",
      stop: { line: 5 },
    },
  ],
  events: [...v4Decl, ...v4L4, ...v4L5, ...v4L6, ...v4L7, end()],
  expectedFinal: { vars: { a: 5, b: 10, c: -3 } },
  hints: [
    "4行目で c に 2＋5＝7 が入ります。5行目の「c から a を引く」は 7－2。このとき a はまだ 2 です。",
    "5行目のあと a は 5 に変わります。6行目では 新しい a（5）を使い、7行目では 新しい b を使います。",
    "6行目で b＝5×2＝10、7行目で c＝7－10＝−3 です。",
  ],
  explanation: {
    why: "4行目で c＝2＋5＝7。5行目で a＝7－2＝5。6行目は更新後の a を使って b＝5×2＝10。7行目は c＝7－10＝−3。どの行も、その時点の最新の値を使って計算します。",
    trace: [
      { line: 3, state: "a=2, b=5, c=0" },
      { line: 4, state: "a=2, b=5, c=7" },
      { line: 5, state: "a=5, b=5, c=7" },
      { line: 6, state: "a=5, b=10, c=7" },
      { line: 7, state: "a=5, b=10, c=-3" },
    ],
    points: ["変数を使うときは、その時点で入っている最新の値を使う", "引き算は順番に注意（c － a と a － c はちがう）"],
  },
};

// ---- var-5：5つの変数の追跡（リレーのように値を受けわたす） ----
const V5_FIELD = mkField({
  cols: 8,
  rows: 6,
  start: { x: 2, y: 3, dir: "right" },
  spawn: { x: 0, y: 3 },
  boxes: ["p", "q", "r", "s", "t"].map((v, i) => ({ var: v, x: 6, y: i + 1, access: { x: 5, y: i + 1 } })),
  pads: [{ kind: "calc", x: 3, y: 2, access: { x: 3, y: 3 } }],
});
const B5 = builder(V5_FIELD);
const v5 = {
  1: [line(1), ...B5.set("p", 1)],
  2: [line(2), ...B5.set("q", 1)],
  3: [line(3)],
  4: [line(4), ...B5.calc("r", ["p", "q"], "p ＋ q", 2)],
  5: [line(5), ...B5.copy("p", "q")],
  6: [line(6), ...B5.copy("q", "r")],
  7: [line(7), ...B5.calc("r", ["p", "q"], "p ＋ q", 3)],
  8: [line(8), ...B5.copy("p", "q")],
  9: [line(9), ...B5.copy("q", "r")],
  10: [line(10), ...B5.calc("s", ["p", "q"], "p × q", 6)],
  11: [line(11), ...B5.calc("t", ["s", "r"], "s － r", 3)],
  12: [line(12), ...B5.calc("s", ["s", "t"], "s ＋ t", 9)],
};
const v5Upto = (n) => Array.from({ length: n }, (_, i) => v5[i + 1]).flat();

const var5 = {
  id: "var-5",
  genre: "var",
  level: 5,
  title: "へんすう リレー",
  concepts: ["assign", "trace"],
  field: V5_FIELD,
  vars: {},
  varColors: { p: "#4FC3F7", q: "#66BB6A", r: "#F06292", s: "#FFB74D", t: "#9575CD" },
  program: {
    ja: [
      "整数の 変数 p を 用意して、1 を入れる",
      "整数の 変数 q を 用意して、1 を入れる",
      "整数の 変数 r、s、t を 用意する（まだ 空っぽ）",
      "p の値と q の値を 足して、その答えを r に入れる",
      "q の値を p に 写す（q は そのまま）",
      "r の値を q に 写す（r は そのまま）",
      "p の値と q の値を 足して、その答えを r に入れる",
      "q の値を p に 写す（q は そのまま）",
      "r の値を q に 写す（r は そのまま）",
      "p の値と q の値を かけて、その答えを s に入れる",
      "s の値から r の値を 引いて、その答えを t に入れる",
      "s の値と t の値を 足して、その答えを s に入れる",
    ],
    code: [
      "整数型: p ← 1",
      "整数型: q ← 1",
      "整数型: r, s, t",
      "r ← p ＋ q",
      "p ← q",
      "q ← r",
      "r ← p ＋ q",
      "p ← q",
      "q ← r",
      "s ← p × q",
      "t ← s － r",
      "s ← s ＋ t",
    ],
  },
  question: "プログラムを 実行し終わったときの s と t の値の 組合せは どれか。",
  answerType: "vars",
  choices: [
    { ja: "s は 9、t は 3", code: "s = 9, t = 3", correct: true },
    {
      ja: "s は 6、t は 3",
      code: "s = 6, t = 3",
      wrongFeedback: "12行目で s が もう一度 更新されます。最後の行まで追いかけましょう。",
      stop: { line: 12 },
    },
    {
      ja: "s は 10、t は 4",
      code: "s = 10, t = 4",
      wrongFeedback: "11行目の r は、7行目で 3 に更新されています。4行目で入れた 2 のままではありません。",
      stop: { line: 11 },
    },
    {
      ja: "s は 6、t は 2",
      code: "s = 6, t = 2",
      wrongFeedback: "7行目で r が 3 に更新されるのを見落としていませんか？ 7〜9行目は 4〜6行目と同じ形の くりかえしです。",
      stop: { line: 7 },
    },
  ],
  events: [...v5Upto(12), end()],
  expectedFinal: { vars: { p: 2, q: 3, r: 3, s: 9, t: 3 } },
  hints: [
    "4〜6行目を1行ずつ たどろう。4行目で r＝1＋1＝2、5行目で p に q の値 1、6行目で q に r の値 2 が入ります。この時点で p＝1、q＝2、r＝2。",
    "7〜9行目も同じ形です。7行目の r は 新しい p と q（1 と 2）を使います。11行目の r は 7行目で更新された値です。",
    "7〜9行目のあと p＝2、q＝3、r＝3。10行目で s＝2×3＝6、11行目で t＝6－3＝3、12行目で s＝6＋3＝9。",
  ],
  explanation: {
    why: "4〜6行目と7〜9行目は、p と q を「となりの値」に送り出すリレーです（1, 1 → 1, 2 → 2, 3）。10行目で s＝2×3＝6、11行目で t＝6－3＝3、12行目で s＝6＋3＝9 になります。",
    trace: [
      { line: 3, state: "p=1, q=1" },
      { line: 4, state: "p=1, q=1, r=2" },
      { line: 5, state: "p=1, q=1, r=2" },
      { line: 6, state: "p=1, q=2, r=2" },
      { line: 7, state: "p=1, q=2, r=3" },
      { line: 8, state: "p=2, q=2, r=3" },
      { line: 9, state: "p=2, q=3, r=3" },
      { line: 10, state: "p=2, q=3, r=3, s=6" },
      { line: 11, state: "s=6, t=3" },
      { line: 12, state: "s=9, t=3" },
    ],
    points: ["変数が多いときは、1行ごとに全部の変数の値を表に書いて追う（追跡表）", "「p ← q」のような代入は、q の値のコピーを p に入れる（q は変わらない）"],
  },
};

// ================= 6〜10：穴埋め（科目Bの「［a］に入れる正しい答えはどれか」の形） =================
// 空欄の記号 a・b と まぎれないよう、穴埋めの問題では 変数名に a・b を使わない。
// 誤答は、その選択肢を空欄に入れたプログラムを実行して見せる（目的と合わない結果になる）。
// どの誤答も、このデータで 目的と ちがう結果になるように 値を選ぶ（検証スクリプトが確かめる）。

// ---- var-6：2つの値の入れかえ ----
const V6_FIELD = autoField(["x", "y", "t"]);
/** 5行目「x ← ［a］」に a を入れたときの動き */
function var6Run(a) {
  const B = builder(V6_FIELD);
  const ev = [line(1), ...B.set("x", 3), line(2), ...B.set("y", 8), line(3), line(4), ...B.copy("t", "x"), line(5)];
  if (a === "y － x") ev.push(...B.calc("x", ["y", "x"], "y － x", 5));
  else ev.push(...B.copy("x", a));
  ev.push(line(6), ...B.copy("y", "t"));
  return ev;
}

const var6 = {
  id: "var-6",
  genre: "var",
  level: 6,
  title: "いれかえの あな",
  concepts: ["assign", "swap", "blank"],
  intro: "ここからは あなうめ もんだい。［a］ に はいる ものを えらぼう。\n「ここまで すすめる」は、あなの てまえまで つかえるよ。",
  field: V6_FIELD,
  vars: {},
  varColors: { x: "#4FC3F7", y: "#66BB6A", t: "#FFB74D" },
  program: {
    ja: [
      "整数の 変数 x を 用意して、3 を入れる",
      "整数の 変数 y を 用意して、8 を入れる",
      "整数の 変数 t を 用意する（まだ 空っぽ）",
      "x の値を t に 写す（x は そのまま）",
      "［a］ の値を x に 写す",
      "t の値を y に 写す（t は そのまま）",
    ],
    code: ["整数型: x ← 3", "整数型: y ← 8", "整数型: t", "t ← x", "x ← ［a］", "y ← t"],
  },
  question: "次のプログラムは、変数 x と y の値を 入れ替える。\nプログラム中の ［a］ に入れる 正しい答えは どれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "y", code: "y", fill: { a: "y" }, correct: true },
    {
      ja: "t",
      code: "t",
      fill: { a: "t" },
      wrongFeedback: "t には 4行目で x の値（3）を とってあります。x ← t では x は 3 のまま、6行目で y も 3 になり、8 が どこにも 残りません。",
      events: var6Run("t"),
    },
    {
      ja: "x",
      code: "x",
      fill: { a: "x" },
      wrongFeedback: "x ← x では x は 3 のまま 変わりません。x に入れたいのは もう一方の y の値（8）です。",
      events: var6Run("x"),
    },
    {
      ja: "y － x",
      code: "y － x",
      fill: { a: "y － x" },
      wrongFeedback: "y － x は 8－3＝5 です。x に入れたいのは y の値（8）そのものです。",
      events: var6Run("y － x"),
    },
  ],
  events: [...var6Run("y"), end()],
  expectedFinal: { vars: { x: 8, y: 3 } },
  hints: [
    "4行目で t に x の値（3）を とっておきます。こうすると x を上書きしても 3 は なくなりません。",
    "5行目で x に入れたいのは、もう一方の変数の値です。6行目では t にとっておいた 3 を y に入れます。",
    "［a］ は y。x に y の値（8）を入れると、最後に x＝8、y＝3 になります。",
  ],
  explanation: {
    why: "2つの変数を入れかえるときは、片方の値を いったん t に とっておきます。4行目で t＝3、5行目で x に y の値 8 を入れ、6行目で y に t の 3 を入れると、x＝8、y＝3 になります。",
    trace: [
      { line: 4, state: "x=3, y=8, t=3" },
      { line: 5, state: "x=8, y=8, t=3" },
      { line: 6, state: "x=8, y=3, t=3" },
    ],
    points: ["値を入れかえるときは、上書きで消える値を 別の変数（t）に とっておく", "「x ← y」は y の値のコピーを x に入れる（y は変わらない）"],
  },
};

// ---- var-7：平均（式の計算の順番） ----
const V7_FIELD = autoField(["x", "y", "z", "sum", "ave"]);
const V7_EXPR = {
  "sum ÷ 3": [["sum", 3], 8],
  "sum ÷ 2": [["sum", 2], 12],
  "x ＋ y ＋ z ÷ 3": [["x", "y", "z", 3], 16],
  "sum － 3": [["sum", 3], 21],
};
function var7Run(a) {
  const B = builder(V7_FIELD);
  const [ops, val] = V7_EXPR[a];
  return [
    line(1),
    ...B.set("x", 5),
    line(2),
    ...B.set("y", 7),
    line(3),
    ...B.set("z", 12),
    line(4),
    ...B.calc("sum", ["x", "y", "z"], "x ＋ y ＋ z", 24),
    line(5),
    ...B.calc("ave", ops, a, val),
  ];
}

const var7 = {
  id: "var-7",
  genre: "var",
  level: 7,
  title: "へいきんの あな",
  concepts: ["assign", "expression", "blank"],
  field: V7_FIELD,
  vars: {},
  varColors: { x: "#4FC3F7", y: "#66BB6A", z: "#F06292", sum: "#FFB74D", ave: "#9575CD" },
  program: {
    ja: [
      "整数の 変数 x を 用意して、5 を入れる",
      "整数の 変数 y を 用意して、7 を入れる",
      "整数の 変数 z を 用意して、12 を入れる",
      "整数の 変数 sum を 用意して、x と y と z の値を 足した答えを 入れる",
      "整数の 変数 ave を 用意して、［a］ を 入れる",
    ],
    code: ["整数型: x ← 5", "整数型: y ← 7", "整数型: z ← 12", "整数型: sum ← x ＋ y ＋ z", "整数型: ave ← ［a］"],
  },
  notes: ["÷ は割り算で，答えの小数点以下は切り捨てる（例：7 ÷ 2 は 3）。"],
  question: "次のプログラムは、x、y、z の 平均値を ave に 格納する。\nプログラム中の ［a］ に入れる 正しい答えは どれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "sum を 3 で 割った値", code: "sum ÷ 3", fill: { a: { code: "sum ÷ 3", ja: "sum を 3 で 割った値" } }, correct: true },
    {
      ja: "sum を 2 で 割った値",
      code: "sum ÷ 2",
      fill: { a: { code: "sum ÷ 2", ja: "sum を 2 で 割った値" } },
      wrongFeedback: "sum ÷ 2 は 24÷2＝12 です。平均は 合計を 値の 個数で 割ります。値は x、y、z の 3個です。",
      events: var7Run("sum ÷ 2"),
    },
    {
      ja: "x と y と、z を 3 で 割った値を 足した値",
      code: "x ＋ y ＋ z ÷ 3",
      fill: { a: { code: "x ＋ y ＋ z ÷ 3", ja: "x と y と、z を 3 で 割った値を 足した値" } },
      wrongFeedback: "÷ は ＋ より先に 計算します。x ＋ y ＋ z ÷ 3 は 5＋7＋(12÷3)＝16 になってしまいます。",
      events: var7Run("x ＋ y ＋ z ÷ 3"),
    },
    {
      ja: "sum から 3 を 引いた値",
      code: "sum － 3",
      fill: { a: { code: "sum － 3", ja: "sum から 3 を 引いた値" } },
      wrongFeedback: "sum － 3 は 24－3＝21 です。平均は 合計を 個数で「割った」値です。",
      events: var7Run("sum － 3"),
    },
  ],
  events: [...var7Run("sum ÷ 3"), end()],
  expectedFinal: { vars: { ave: 8 } },
  hints: [
    "4行目で sum に 5＋7＋12＝24 が入ります。平均は「合計 ÷ 個数」です。",
    "値は x、y、z の 3個。合計の sum を いくつで 割ればよいかな？ また、× と ÷ は ＋ と － より先に計算することに 注意しよう。",
    "［a］ は sum ÷ 3。24 ÷ 3 ＝ 8 です。",
  ],
  explanation: {
    why: "平均は 合計を 個数で割った値です。4行目で sum＝24 を求めたので、5行目は sum ÷ 3 で ave＝8 になります。x ＋ y ＋ z ÷ 3 と書くと、割り算が先に計算されて 16 になってしまいます。",
    trace: [
      { line: 4, state: "sum=24" },
      { line: 5, state: "ave=8" },
    ],
    points: ["平均 ＝ 合計 ÷ 個数", "× と ÷ は ＋ と － より先に計算する（式の順番に注意）"],
  },
};

// ---- var-8：十の位（mod と ÷） ----
const V8_FIELD = autoField(["n", "one", "ten"]);
const V8_EXPR = {
  "(n － one) ÷ 10": [["n", "one", 10], 4],
  "n － one": [["n", "one"], 40],
  "n mod 10": [["n", 10], 7],
  "(n － one) mod 10": [["n", "one", 10], 0],
};
function var8Run(a) {
  const B = builder(V8_FIELD);
  const [ops, val] = V8_EXPR[a];
  return [line(1), ...B.set("n", 47), line(2), ...B.calc("one", ["n", 10], "n mod 10", 7), line(3), ...B.calc("ten", ops, a, val)];
}

const var8 = {
  id: "var-8",
  genre: "var",
  level: 8,
  title: "じゅうのくらいの あな",
  concepts: ["assign", "mod", "blank"],
  field: V8_FIELD,
  vars: {},
  varColors: { n: "#4FC3F7", one: "#66BB6A", ten: "#F06292" },
  program: {
    ja: [
      "整数の 変数 n を 用意して、47 を入れる",
      "整数の 変数 one を 用意して、n を 10 で 割った余りを 入れる",
      "整数の 変数 ten を 用意して、［a］ を 入れる",
    ],
    code: ["整数型: n ← 47", "整数型: one ← n mod 10", "整数型: ten ← ［a］"],
  },
  notes: ["n mod 10 は，n を 10 で割った余りである。"],
  question: "次のプログラムは、2けたの 正の整数 n の 一の位の 数字を one に、十の位の 数字を ten に 格納する。\nプログラム中の ［a］ に入れる 正しい答えは どれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    {
      ja: "n から one を 引いて 10 で 割った値",
      code: "(n － one) ÷ 10",
      fill: { a: { code: "(n － one) ÷ 10", ja: "n から one を 引いて 10 で 割った値" } },
      correct: true,
    },
    {
      ja: "n から one を 引いた値",
      code: "n － one",
      fill: { a: { code: "n － one", ja: "n から one を 引いた値" } },
      wrongFeedback: "47－7＝40 です。十の位の 4 にするには、さらに 10 で 割ります。",
      events: var8Run("n － one"),
    },
    {
      ja: "n を 10 で 割った余り",
      code: "n mod 10",
      fill: { a: { code: "n mod 10", ja: "n を 10 で 割った余り" } },
      wrongFeedback: "n mod 10 は 一の位（7）です。2行目の one と 同じに なってしまいます。",
      events: var8Run("n mod 10"),
    },
    {
      ja: "n から one を 引いて 10 で 割った余り",
      code: "(n － one) mod 10",
      fill: { a: { code: "(n － one) mod 10", ja: "n から one を 引いて 10 で 割った余り" } },
      wrongFeedback: "40 を 10 で 割った「余り」は 0 です。十の位は 割った「答え」の方です。",
      events: var8Run("(n － one) mod 10"),
    },
  ],
  events: [...var8Run("(n － one) ÷ 10"), end()],
  expectedFinal: { vars: { one: 7, ten: 4 } },
  hints: [
    "2行目で one に 一の位の 7 が入ります。十の位は 47 の「4」です。",
    "47 から 一の位を 引くと 40。そこから 4 を 取り出すには？",
    "［a］ は (n － one) ÷ 10。40 ÷ 10 ＝ 4 です。",
  ],
  explanation: {
    why: "2行目で one＝47 mod 10＝7。47 から 7 を引いた 40 を 10 で 割ると、十の位の 4 が求められます。",
    trace: [
      { line: 2, state: "one=7" },
      { line: 3, state: "ten=4" },
    ],
    points: ["mod は割り算の余り。n mod 10 は一の位", "(n － 一の位) ÷ 10 で 十の位が求められる"],
  },
};

// ---- var-9：3けたの数の 各けたを 逆に並べる（空欄2つ） ----
const V9_FIELD = autoField(["n", "h", "t", "o", "r"]);
const V9_A = {
  "(n ÷ 10) mod 10": [["n", 10, 10], 5],
  "n ÷ 10": [["n", 10], 35],
  "n mod 100": [["n", 100], 52],
};
const V9_B = {
  "o × 100 ＋ t × 10 ＋ h": ["o", 100, "t", 10, "h"],
  "h × 100 ＋ t × 10 ＋ o": ["h", 100, "t", 10, "o"],
};
function var9Run(a, b) {
  const B = builder(V9_FIELD);
  const [opsA, t] = V9_A[a];
  const h = 3;
  const o = 2;
  const r = b.startsWith("o") ? o * 100 + t * 10 + h : h * 100 + t * 10 + o;
  return [
    line(1),
    ...B.set("n", 352),
    line(2),
    ...B.calc("h", ["n", 100], "n ÷ 100", h),
    line(3),
    ...B.calc("t", opsA, a, t),
    line(4),
    ...B.calc("o", ["n", 10], "n mod 10", o),
    line(5),
    ...B.calc("r", V9_B[b], b, r),
  ];
}

const var9 = {
  id: "var-9",
  genre: "var",
  level: 9,
  title: "さかさの かずの あな",
  concepts: ["assign", "div", "mod", "blank"],
  field: V9_FIELD,
  vars: {},
  varColors: { n: "#4FC3F7", h: "#66BB6A", t: "#F06292", o: "#FFB74D", r: "#9575CD" },
  program: {
    ja: [
      "整数の 変数 n を 用意して、352 を入れる",
      "整数の 変数 h を 用意して、n を 100 で 割った商を 入れる",
      "整数の 変数 t を 用意して、［a］ を 入れる",
      "整数の 変数 o を 用意して、n を 10 で 割った余りを 入れる",
      "整数の 変数 r を 用意して、［b］ を 入れる",
    ],
    code: ["整数型: n ← 352", "整数型: h ← n ÷ 100", "整数型: t ← ［a］", "整数型: o ← n mod 10", "整数型: r ← ［b］"],
  },
  notes: ["÷ は，商の小数点以下を切り捨てた整数を求める（例：352 ÷ 100 は 3）。", "n mod 10 は，n を 10 で割った余りである。"],
  question:
    "次のプログラムは、3けたの正の整数 n の 各けたの数字を 逆の順に 並べた整数を r に 格納する。例えば、n が 352 のとき、r は 253 となる。ここで、h、t、o には それぞれ n の 百の位、十の位、一の位の 数字を 格納する。\nプログラム中の ［a］ と ［b］ に入れる 正しい答えの 組合せは どれか。",
  answerType: "blank",
  blanks: ["a", "b"],
  choices: [
    {
      ja: "a：n を 10 で 割った商を 10 で 割った余り　b：o × 100 ＋ t × 10 ＋ h",
      code: "a：(n ÷ 10) mod 10　b：o × 100 ＋ t × 10 ＋ h",
      fill: { a: { code: "(n ÷ 10) mod 10", ja: "n を 10 で 割った商を 10 で 割った余り" }, b: "o × 100 ＋ t × 10 ＋ h" },
      correct: true,
    },
    {
      ja: "a：n を 10 で 割った商　b：o × 100 ＋ t × 10 ＋ h",
      code: "a：n ÷ 10　b：o × 100 ＋ t × 10 ＋ h",
      fill: { a: { code: "n ÷ 10", ja: "n を 10 で 割った商" }, b: "o × 100 ＋ t × 10 ＋ h" },
      wrongFeedback: "352 ÷ 10 は 35 で、十の位の 数字（5）だけでは ありません。百の位の 3 が 残っているので、さらに 10 で 割った余りを 取り出します。",
      events: var9Run("n ÷ 10", "o × 100 ＋ t × 10 ＋ h"),
    },
    {
      ja: "a：n を 10 で 割った商を 10 で 割った余り　b：h × 100 ＋ t × 10 ＋ o",
      code: "a：(n ÷ 10) mod 10　b：h × 100 ＋ t × 10 ＋ o",
      fill: { a: { code: "(n ÷ 10) mod 10", ja: "n を 10 で 割った商を 10 で 割った余り" }, b: "h × 100 ＋ t × 10 ＋ o" },
      wrongFeedback: "h × 100 ＋ t × 10 ＋ o は、もとの 352 に もどるだけです。逆に 並べるには、一の位の o を 百の位に します。",
      events: var9Run("(n ÷ 10) mod 10", "h × 100 ＋ t × 10 ＋ o"),
    },
    {
      ja: "a：n を 100 で 割った余り　b：o × 100 ＋ t × 10 ＋ h",
      code: "a：n mod 100　b：o × 100 ＋ t × 10 ＋ h",
      fill: { a: { code: "n mod 100", ja: "n を 100 で 割った余り" }, b: "o × 100 ＋ t × 10 ＋ h" },
      wrongFeedback: "352 mod 100 は 52 で、一の位の 2 が 残っています。十の位の 数字だけを 取り出す必要が あります。",
      events: var9Run("n mod 100", "o × 100 ＋ t × 10 ＋ h"),
    },
  ],
  events: [...var9Run("(n ÷ 10) mod 10", "o × 100 ＋ t × 10 ＋ h"), end()],
  expectedFinal: { vars: { r: 253 } },
  hints: [
    "352 の 十の位は 5 です。352 ÷ 10 は 35（小数点以下は 切り捨て）。この 35 から 5 だけを 取り出すには？",
    "逆に 並べると、一の位の o（2）が 百の位、十の位の t（5）は そのまま、百の位の h（3）が 一の位に なります。",
    "a は (n ÷ 10) mod 10（35 mod 10 ＝ 5）、b は o × 100 ＋ t × 10 ＋ h（200＋50＋3＝253）です。",
  ],
  explanation: {
    why: "十の位は、n ÷ 10 で 一の位を 切り捨てて 35 にし、その一の位を mod 10 で 取り出して 5 です。逆に並べた数は、一の位 o を 百の位に、百の位 h を 一の位に して o × 100 ＋ t × 10 ＋ h ＝ 253 です。",
    trace: [
      { line: 2, state: "h=3" },
      { line: 3, state: "t=5" },
      { line: 4, state: "o=2" },
      { line: 5, state: "r=253" },
    ],
    points: ["n ÷ 10 で 一の位を 切り捨て、mod 10 で 一の位を 取り出す。組み合わせると 好きな けたが 取り出せる", "けたの数字から 数を 組み立てるときは、百の位 × 100 ＋ 十の位 × 10 ＋ 一の位"],
  },
};

// ---- var-10：時刻の計算（24時をこえたら 0時に もどる。空欄2つ） ----
const V10_FIELD = autoField(["h", "m", "d", "t", "nh", "nm"]);
const V10_A = {
  "h × 60 ＋ m ＋ d": [["h", 60, "m", "d"], 1465],
  "h ＋ m ＋ d": [["h", "m", "d"], 167],
};
const V10_B = {
  "(t ÷ 60) mod 24": [["t", 60, 24], (t) => Math.trunc(t / 60) % 24],
  "t ÷ 60": [["t", 60], (t) => Math.trunc(t / 60)],
  "(t mod 60) mod 24": [["t", 60, 24], (t) => (t % 60) % 24],
};
function var10Run(a, b) {
  const B = builder(V10_FIELD);
  const [opsA, t] = V10_A[a];
  const [opsB, f] = V10_B[b];
  return [
    line(1),
    ...B.set("h", 22),
    line(2),
    ...B.set("m", 50),
    line(3),
    ...B.set("d", 95),
    line(4),
    ...B.calc("t", opsA, a, t),
    line(5),
    ...B.calc("nh", opsB, b, f(t)),
    line(6),
    ...B.calc("nm", ["t", 60], "t mod 60", t % 60),
  ];
}

const var10 = {
  id: "var-10",
  genre: "var",
  level: 10,
  title: "とけいの あな",
  concepts: ["assign", "div", "mod", "blank"],
  field: V10_FIELD,
  vars: {},
  varColors: { h: "#4FC3F7", m: "#66BB6A", d: "#F06292", t: "#FFB74D", nh: "#9575CD", nm: "#26A69A" },
  program: {
    ja: [
      "整数の 変数 h を 用意して、22 を入れる",
      "整数の 変数 m を 用意して、50 を入れる",
      "整数の 変数 d を 用意して、95 を入れる",
      "整数の 変数 t を 用意して、［a］ を 入れる",
      "整数の 変数 nh を 用意して、［b］ を 入れる",
      "整数の 変数 nm を 用意して、t を 60 で 割った余りを 入れる",
    ],
    code: ["整数型: h ← 22", "整数型: m ← 50", "整数型: d ← 95", "整数型: t ← ［a］", "整数型: nh ← ［b］", "整数型: nm ← t mod 60"],
  },
  notes: ["÷ は，商の小数点以下を切り捨てた整数を求める。", "t mod 60 は，t を 60 で割った余りである。"],
  question:
    "次のプログラムは、h 時 m 分 から d 分 たった 時刻を、nh 時 nm 分 として 求める。時刻は 24 時間制で、nh は 0 以上 23 以下 とする。例えば、h が 22、m が 50、d が 95 のとき、0 時 25 分 となる。t には、0 時 0 分 から 数えた 分の数を 格納する。\nプログラム中の ［a］ と ［b］ に入れる 正しい答えの 組合せは どれか。",
  answerType: "blank",
  blanks: ["a", "b"],
  choices: [
    { ja: "a：h × 60 ＋ m ＋ d　b：(t ÷ 60) mod 24", code: "a：h × 60 ＋ m ＋ d　b：(t ÷ 60) mod 24", fill: { a: "h × 60 ＋ m ＋ d", b: "(t ÷ 60) mod 24" }, correct: true },
    {
      ja: "a：h ＋ m ＋ d　b：(t ÷ 60) mod 24",
      code: "a：h ＋ m ＋ d　b：(t ÷ 60) mod 24",
      fill: { a: "h ＋ m ＋ d", b: "(t ÷ 60) mod 24" },
      wrongFeedback: "h は「時」なので、分に そろえるには 60 を かけます。h ＋ m ＋ d では 時と分を そのまま 足して しまい、t＝167 に なります。",
      events: var10Run("h ＋ m ＋ d", "(t ÷ 60) mod 24"),
    },
    {
      ja: "a：h × 60 ＋ m ＋ d　b：t ÷ 60",
      code: "a：h × 60 ＋ m ＋ d　b：t ÷ 60",
      fill: { a: "h × 60 ＋ m ＋ d", b: "t ÷ 60" },
      wrongFeedback: "t ÷ 60 は 24 で、24 時間制の 0〜23 に なりません。24 時を こえたら 0 時に もどすため、24 で 割った余りに します。",
      events: var10Run("h × 60 ＋ m ＋ d", "t ÷ 60"),
    },
    {
      ja: "a：h × 60 ＋ m ＋ d　b：(t mod 60) mod 24",
      code: "a：h × 60 ＋ m ＋ d　b：(t mod 60) mod 24",
      fill: { a: "h × 60 ＋ m ＋ d", b: "(t mod 60) mod 24" },
      wrongFeedback: "t mod 60 は「分」の 部分（25）です。何時かは、t を 60 で 割った「商」から 求めます。",
      events: var10Run("h × 60 ＋ m ＋ d", "(t mod 60) mod 24"),
    },
  ],
  events: [...var10Run("h × 60 ＋ m ＋ d", "(t ÷ 60) mod 24"), end()],
  expectedFinal: { vars: { nh: 0, nm: 25 } },
  hints: [
    "t は 0 時 0 分 から 数えた 分の数です。22 時 50 分 は 何分 たった ところかな？（1 時間は 60 分）",
    "t を 60 で 割った 商が「何時間」。24 時間 たつと 0 時に もどるので、24 で 割った 余りを 使います。",
    "a は h × 60 ＋ m ＋ d（1465）、b は (t ÷ 60) mod 24（24 mod 24 ＝ 0）。nm は 1465 mod 60 ＝ 25 です。",
  ],
  explanation: {
    why: "時刻を すべて 分に そろえると t ＝ 22 × 60 ＋ 50 ＋ 95 ＝ 1465。t ÷ 60 ＝ 24（時間）、24 時間制なので 24 で割った余りの 0 が nh。t mod 60 ＝ 25 が nm で、0 時 25 分 です。",
    trace: [
      { line: 4, state: "t=1465" },
      { line: 5, state: "nh=0" },
      { line: 6, state: "nm=25" },
    ],
    points: ["単位の ちがう 量は、いちばん 小さい 単位（分）に そろえてから 計算する", "÷ で 大きい単位（時）、mod で のこり（分）を 取り出す", "くり返す 値（24時間）は mod で 範囲に もどす"],
  },
};

export default [var1, var2, var3, var4, var5, var6, var7, var8, var9, var10];
