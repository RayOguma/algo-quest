// ① var（じゅんじょと へんすう）
import { line, moves, spawn, spawnOnPad, pickup, takeCopy, put, calc, store, end, mismatch, lockFail } from "./helpers.js";

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
    "1行目から じゅんばんに、1マスずつ 指でたどってみよう。",
    "右へ2マス → 上へ1マス → 左へ1マス。左右の動きは「右2 − 左1」で まとめて考えられます。",
    "横は 右へ2、左へ1 で 差し引き 右へ1マス。縦は 上へ1マス。",
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
    "1行ずつ、x と y の値を メモしながら 進めよう。",
    "「←」は右側を先に計算して、その結果を左側の変数に入れます。3行目のあと y はいくつ？",
    "2行目で x=3、3行目で y=3＋2=5。4行目は y － 1 を x に入れます。",
  ],
  explanation: {
    why: "1行目で x と y を用意し（まだ未定義）、2行目で x=3、3行目で y=x＋2=5 になります。4行目で y－1=4 が x に入るので、x の古い値 3 は置き換えられ、x=4 になります。",
    trace: [
      { line: 1, state: "x, y は 未定義" },
      { line: 2, state: "x=3" },
      { line: 3, state: "x=3, y=5" },
      { line: 4, state: "x=4, y=5" },
    ],
    points: ["代入は右辺を先に計算して、左辺に入れる", "入れた値は古い値を置き換える"],
  },
};

export default [var1, var2];
