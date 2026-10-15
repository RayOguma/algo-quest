// ① var（じゅんじょと へんすう）
import { line, moves, spawn, spawnOnPad, pickup, takeCopy, put, calc, store, end, mismatch, lockFail, emote, builder, mkField } from "./helpers.js";

const V1_FIELD = {
  cols: 7,
  rows: 5,
  tiles: [".......", ".......", ".......", ".......", "......."],
  start: { x: 1, y: 3, dir: "right" },
  boxes: [],
  pads: [],
  items: [],
  arrays: [],
  switches: [],
  doors: [],
  stacks: [],
  queues: [],
};

const var1 = {
  id: "var-1",
  genre: "var",
  level: 1,
  title: "みぎへ ひだりへ",
  concepts: ["sequence"],
  intro: "しょりは うえから じゅんばんに 1ぎょうずつ じっこうされるよ。\nじゅんばんどおりに たどってみよう。",
  field: V1_FIELD,
  vars: {},
  varColors: {},
  program: {
    ja: ["右へ 2マス 進む", "上へ 1マス 進む", "左へ 1マス 進む"],
    code: ["moveRight(2)", "moveUp(1)", "moveLeft(1)"],
  },
  notes: ["手続 moveRight(n)，moveUp(n)，moveLeft(n) は，アルゴくんをそれぞれ右・上・左へ n マス進める。"],
  question: "この処理を実行したあと、アルゴくんはどこにいますか？",
  answerType: "pos-rel",
  choices: [
    { ja: "スタートから 右に1マス、上に1マス", code: "(x, y) = (+1, −1)", correct: true },
    {
      ja: "スタートから 右に2マス、上に1マス",
      code: "(x, y) = (+2, −1)",
      wrongFeedback: "3行目の「左へ1マス」を見落としていませんか？",
      events: [line(1), ...moves("right", 2), line(2), ...moves("up"), mismatch()],
    },
    {
      ja: "スタートから 右に1マス",
      code: "(x, y) = (+1, 0)",
      wrongFeedback: "2行目の「上へ」の動きを数えましたか？",
      events: [line(1), ...moves("right", 2), line(3), ...moves("left"), mismatch()],
    },
    {
      ja: "スタート地点に もどる",
      code: "(x, y) = (0, 0)",
      wrongFeedback: "右・上・左と動くと、元の位置には戻りません。右へ2マス進んだのに、左へは1マスしか戻りません。",
      events: [
        line(1),
        ...moves("right", 2),
        line(2),
        ...moves("up"),
        line(3),
        ...moves("left", 2),
        ...moves("down"),
        mismatch("あれ？ もとの ばしょじゃ なかった…"),
      ],
    },
  ],
  events: [line(1), ...moves("right", 2), line(2), ...moves("up"), line(3), ...moves("left"), end()],
  expectedFinal: { pos: { x: 2, y: 2 }, vars: {} },
  hints: [
    "1行目で スタートから右へ2マス進み、フィールドの (3,3) に着きます。つづけて 2行目・3行目も、フィールドの目もりで1マスずつ たどってみよう。",
    "2行目で上へ1マス進んで (3,2)。3行目の「左へ1マス」も忘れずに。最後の位置を、スタートの (1,3) とくらべてみよう。",
    "最後の位置は (2,2)。スタート (1,3) から見ると、右に1マス・上に1マス です。",
  ],
  explanation: {
    why: "処理は上から順に実行されます。右へ2マス、上へ1マス、左へ1マス進むので、スタートから見ると「右に1マス、上に1マス」の位置に着きます。",
    trace: [
      { line: 1, state: "位置：(3,3)" },
      { line: 2, state: "位置：(3,2)" },
      { line: 3, state: "位置：(2,2)" },
    ],
    points: ["処理は1行目から順番に実行される（順次実行）", "横の動きと縦の動きは分けて数えると間違えにくい"],
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
    ja: ["整数の 変数 x と y を 用意する", "x に 3 を入れる", "x に 2 を足した値を y に入れる", "y から 1 を引いた値を x に入れる"],
    code: ["整数型: x, y", "x ← 3", "y ← x ＋ 2", "x ← y － 1"],
  },
  question: "処理が終わったとき、x の値はいくつですか？",
  answerType: "vars",
  choices: [
    {
      ja: "x は 3 です",
      code: "x = 3",
      wrongFeedback: "4行目で x が上書きされます。最後に x に入った値を確かめましょう。",
      events: [...v2Line1, ...v2Line2, line(4), spawn("w3", 3, 0, 2), pickup("w3"), lockFail("x")],
    },
    { ja: "x は 4 です", code: "x = 4", correct: true },
    {
      ja: "x は 5 です",
      code: "x = 5",
      wrongFeedback: "5 は y の値です。x は 4行目で「y － 1」に更新されます。",
      events: [...v2Line1, ...v2Line2, line(4), takeCopy("y", "cy"), lockFail("x")],
    },
    {
      ja: "x は 7 です",
      code: "x = 7",
      wrongFeedback: "足し算を重ねていませんか？ 4行目は引き算です。",
      events: [
        ...v2Line1,
        ...v2Line2,
        line(4),
        takeCopy("y", "cy"),
        put("cy", "calc"),
        spawnOnPad("w2", 2, "calc"),
        calc("y ＋ 2", 7, "r7"),
        pickup("r7"),
        lockFail("x"),
      ],
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
    "「入れる」処理（疑似コードの「←」）では、まず右側の計算をして、その答えを左側の変数に入れます。4行目は「y から 1 を引いた値」を計算してから x に入れます。",
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
    points: ["値を入れる処理（疑似コードの「←」）は、右側の計算を先にして、その答えを左側の変数に入れる", "変数に新しい値を入れると、古い値は置き換えられる"],
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
      "整数の 変数 x を 用意して 5 を入れる",
      "整数の 変数 y を 用意して 3 を入れる",
      "x と y を 足した値を x に入れる",
      "x から y を 引いた値を y に入れる",
      "x から y を 引いた値を x に入れる",
    ],
    code: ["整数型: x ← 5", "整数型: y ← 3", "x ← x ＋ y", "y ← x － y", "x ← x － y"],
  },
  question: "処理が終わったとき、x と y の値はいくつですか？",
  answerType: "vars",
  choices: [
    { ja: "x は 3、y は 5", code: "x = 3, y = 5", correct: true },
    {
      ja: "x は 8、y は 5",
      code: "x = 8, y = 5",
      wrongFeedback: "4行目までの値は合っています。5行目で x がもう一度 更新されるのを見落としていませんか？",
      events: [...v3L1, ...v3L2, ...v3L3, ...v3L4, line(5), emote("think"), ...B3.claimCopy("x", "x", "x は 8 の ままじゃ ない みたい…")],
    },
    {
      ja: "x は 5、y は 3",
      code: "x = 5, y = 3",
      wrongFeedback: "3〜5行目で x と y は どちらも書きかえられます。1行ずつ値を追ってみましょう。",
      events: [...v3L1, ...v3L2, line(3), emote("think"), ...B3.claim("x", 5, "x は 5 の ままじゃ ない みたい…")],
    },
    {
      ja: "x は 6、y は 2",
      code: "x = 6, y = 2",
      wrongFeedback: "4行目の x は、3行目で 8 に更新されています。はじめの 5 ではなく 8 を使って計算します。",
      events: [...v3L1, ...v3L2, ...v3L3, line(4), ...B3.calc("y", [5, "y"], "5 － y", 2), line(5), ...B3.calc("x", ["x", "y"], "x － y", 6), mismatch()],
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
      "整数の 変数 a を 用意して 2 を入れる",
      "整数の 変数 b を 用意して 5 を入れる",
      "整数の 変数 c を 用意して 0 を入れる",
      "a と b を 足した値を c に入れる",
      "c から a を 引いた値を a に入れる",
      "a に 2 を かけた値を b に入れる",
      "c から b を 引いた値を c に入れる",
    ],
    code: ["整数型: a ← 2", "整数型: b ← 5", "整数型: c ← 0", "c ← a ＋ b", "a ← c － a", "b ← a × 2", "c ← c － b"],
  },
  question: "処理が終わったとき、a、b、c の値はいくつですか？",
  answerType: "vars",
  choices: [
    { ja: "a は 5、b は 10、c は −3", code: "a = 5, b = 10, c = −3", correct: true },
    {
      ja: "a は 5、b は 4、c は 3",
      code: "a = 5, b = 4, c = 3",
      wrongFeedback: "6行目の a は、5行目で 5 に更新されています。はじめの 2 ではなく 新しい a を使います。",
      events: [...v4Decl, ...v4L4, ...v4L5, line(6), ...B4.calc("b", [2, 2], "2 × 2", 4), line(7), ...B4.calc("c", ["c", "b"], "c － b", 3), mismatch()],
    },
    {
      ja: "a は 5、b は 10、c は 7",
      code: "a = 5, b = 10, c = 7",
      wrongFeedback: "7行目で c が もう一度 更新されます。c は 4行目だけで決まるわけではありません。",
      events: [...v4Decl, ...v4L4, ...v4L5, ...v4L6, line(7), emote("think"), ...B4.claimCopy("c", "c", "c は 7 の ままじゃ ない みたい…")],
    },
    {
      ja: "a は −5、b は −10、c は 17",
      code: "a = −5, b = −10, c = 17",
      wrongFeedback: "5行目は「c から a を引く」（c － a）です。引く順番を逆にしていませんか？",
      events: [
        ...v4Decl,
        ...v4L4,
        line(5),
        ...B4.calc("a", ["a", "c"], "a － c", -5),
        line(6),
        ...B4.calc("b", ["a", 2], "a × 2", -10),
        line(7),
        ...B4.calc("c", ["c", "b"], "c － b", 17),
        mismatch(),
      ],
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
      "整数の 変数 p を 用意して 1 を入れる",
      "整数の 変数 q を 用意して 1 を入れる",
      "整数の 変数 r、s、t を 用意する",
      "p と q を 足した値を r に入れる",
      "q の値を p に入れる",
      "r の値を q に入れる",
      "p と q を 足した値を r に入れる",
      "q の値を p に入れる",
      "r の値を q に入れる",
      "p と q を かけた値を s に入れる",
      "s から r を 引いた値を t に入れる",
      "s と t を 足した値を s に入れる",
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
  question: "処理が終わったとき、s と t の値はいくつですか？",
  answerType: "vars",
  choices: [
    { ja: "s は 9、t は 3", code: "s = 9, t = 3", correct: true },
    {
      ja: "s は 6、t は 3",
      code: "s = 6, t = 3",
      wrongFeedback: "12行目で s が もう一度 更新されます。最後の行まで追いかけましょう。",
      events: [...v5Upto(11), line(12), emote("think"), ...B5.claimCopy("s", "s", "s は 6 の ままじゃ ない みたい…")],
    },
    {
      ja: "s は 10、t は 4",
      code: "s = 10, t = 4",
      wrongFeedback: "11行目の r は、7行目で 3 に更新されています。4行目で入れた 2 のままではありません。",
      events: [...v5Upto(10), line(11), ...B5.calc("t", ["s", 2], "s － 2", 4), line(12), ...B5.calc("s", ["s", "t"], "s ＋ t", 10), mismatch()],
    },
    {
      ja: "s は 6、t は 2",
      code: "s = 6, t = 2",
      wrongFeedback: "7行目で r が 3 に更新されるのを見落としていませんか？ 7〜9行目は 4〜6行目と同じ形の くりかえしです。",
      events: [
        ...v5Upto(6),
        line(7),
        emote("think"),
        ...v5[8],
        ...v5[9],
        line(10),
        ...B5.calc("s", ["p", "q"], "p × q", 4),
        line(11),
        ...B5.calc("t", ["s", "r"], "s － r", 2),
        line(12),
        ...B5.calc("s", ["s", "t"], "s ＋ t", 6),
        mismatch(),
      ],
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

export default [var1, var2, var3, var4, var5];
