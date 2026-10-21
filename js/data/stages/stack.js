// ⑦ stack（積み重ね・並ぶ）
// Lv1〜5：手続 push / pop、enqueue / dequeue（スタックは縦の筒、キューは横の通路の部品）で考え方を学ぶ。
// Lv6〜10（穴埋め）：配列と top・head・tail でスタック・キューを作る（科目Bでよく出る形）。
import { line, end, emote, builder, mkField, autoField } from "./helpers.js";

const STK = "スタック";
const QUE = "キュー";
/** for の制御行：1周目は初期値を入れ、2周目からは 1 増やす */
const forStep = (B, n, v, value, first) => [line(n), ...(first ? B.set(v, value) : B.calc(v, [v, 1], `${v} ＋ 1`, value))];
const error = (reason) => [emote("think"), { type: "fail", kind: "error", reason }];
const num = (v) => (v < 0 ? `－${-v}` : `${v}`);
const STACK_NOTES = [
  "手続 push(v) は，スタックの一番上に v を積む。",
  "関数 pop() は，スタックの一番上の値を取り出して返す。取り出した値はスタックからなくなる。",
  "スタックは，最初は空である。",
];
const QUEUE_NOTES = [
  "手続 enqueue(v) は，キューの最後に v を並べる。",
  "関数 dequeue() は，キューの先頭の値を取り出して返す。取り出した値はキューからなくなる。",
  "キューは，最初は空である。",
];
const COLORS = { [STK]: "#7E57C2", [QUE]: "#26A69A" };

/**
 * スタック・キューの部品を置くフィールド。
 * arrays：[{ name, values }]（1つめは上の行、2つめは下の行）、stack / queue：容量（0 なら置かない）
 */
function sqField(vars, { stack = 0, queue = 0, arrays = [], compare = false } = {}) {
  const rows = 8;
  const len = Math.max(0, ...arrays.map((a) => a.values.length));
  const cols = Math.max(11, len + 4);
  const ys = vars.length <= 3 ? [1, 3, 5].slice(0, vars.length) : vars.map((_, i) => i + 1);
  return mkField({
    cols,
    rows,
    start: { x: 3, y: 1, dir: "right" },
    spawn: { x: 4, y: 1 },
    arrays: arrays.map((a, i) => (i === 0 ? { name: a.name, x: 1, y: 0, values: a.values } : { name: a.name, x: 1, y: rows - 1, values: a.values, access: "up" })),
    stacks: stack ? [{ name: STK, x: 1, y: 2, size: stack, access: { x: 1, y: 1 } }] : [],
    queues: queue ? [{ name: QUE, x: 3, y: 5, size: queue, accessIn: { x: 3 + queue, y: 5 }, accessOut: { x: 2, y: 5 } }] : [],
    boxes: vars.map((v, i) => ({ var: v, x: cols - 2, y: ys[i], access: { x: cols - 3, y: ys[i] } })),
    pads: [...(compare ? [{ kind: "compare", x: 3, y: 3, access: { x: 3, y: 2 } }] : []), { kind: "calc", x: 5, y: 3, access: { x: 5, y: 2 } }],
  });
}

/** 配列 3 つ（上・真ん中・下）のフィールド（キューを配列で作る問題用） */
function threeArrField(vars, arrays, { compare = false } = {}) {
  const rows = 8;
  const len = Math.max(...arrays.map((a) => a.values.length));
  const cols = Math.max(10, len + 3);
  return mkField({
    cols,
    rows,
    start: { x: 1, y: 1, dir: "right" },
    spawn: { x: 4, y: 1 },
    arrays: [
      { name: arrays[0].name, x: 1, y: 0, values: arrays[0].values },
      { name: arrays[1].name, x: 1, y: 3, values: arrays[1].values },
      { name: arrays[2].name, x: 1, y: rows - 1, values: arrays[2].values, access: "up" },
    ],
    boxes: vars.map((v, i) => ({ var: v, x: cols - 2, y: i + 1, access: { x: cols - 3, y: i + 1 } })),
    pads: [...(compare ? [{ kind: "compare", x: 3, y: 5, access: { x: 3, y: 4 } }] : []), { kind: "calc", x: 5, y: 5, access: { x: 5, y: 6 } }],
  });
}

// ---- stack-1：push と pop ----
const F1 = sqField(["x", "y"], { stack: 4 });
function stack1Events() {
  const B = builder(F1);
  return [
    line(1),
    line(2),
    ...B.push(B.holdSet(3), STK),
    line(3),
    ...B.push(B.holdSet(8), STK),
    line(4),
    ...B.push(B.holdSet(5), STK),
    line(5),
    ...B.pop(STK, "x"),
    line(6),
    ...B.pop(STK, "y"),
  ];
}

const stack1 = {
  id: "stack-1",
  genre: "stack",
  level: 1,
  title: "最後に積んだのは？",
  concepts: ["stack", "lifo"],
  intro: "スタックは、積み重ねた箱のようなもの。\n最後に積んだものから先に取り出すよ（後入れ先出し）。",
  field: F1,
  vars: {},
  varColors: { ...COLORS, x: "#4FC3F7", y: "#66BB6A" },
  program: {
    ja: [
      "整数の変数 x と y を用意する",
      "スタックに 3 を積む",
      "スタックに 8 を積む",
      "スタックに 5 を積む",
      "スタックの一番上の値を取り出して、x に入れる",
      "スタックの一番上の値を取り出して、y に入れる",
    ],
    code: ["整数型: x, y", "push(3)", "push(8)", "push(5)", "x ← pop()", "y ← pop()"],
  },
  notes: STACK_NOTES,
  question: "プログラムを実行し終わったときの x と y の値の組合せはどれか。",
  answerType: "vars",
  choices: [
    { ja: "x は 5、y は 8", code: "x = 5, y = 8", correct: true },
    {
      ja: "x は 3、y は 8",
      code: "x = 3, y = 8",
      wrongFeedback: "スタックは、最後に積んだものから取り出します。最初に積んだ 3 は一番下にあるので、最後まで取り出されません。",
      stop: { line: 5 },
    },
    {
      ja: "x は 5、y は 5",
      code: "x = 5, y = 5",
      wrongFeedback: "pop() で取り出した値は、スタックからなくなります。5 を取り出したあとの一番上は 8 です。",
      stop: { line: 6 },
    },
    {
      ja: "x は 5、y は 3",
      code: "x = 5, y = 3",
      wrongFeedback: "pop() は毎回、その時点の一番上を取り出します。5 を取り出したあとの一番上は 8 で、3 はまだその下です。",
      stop: { line: 6 },
    },
  ],
  events: [...stack1Events(), end()],
  expectedFinal: { vars: { x: 5, y: 8 } },
  hints: [
    "2〜4行目で、スタックには下から 3、8、5 の順に積まれます。一番上は 5 です。",
    "pop() は一番上を取り出し、取り出した値はスタックからなくなります。",
    "5 を取り出すと、一番上は何になるかな？",
  ],
  explanation: {
    why: "スタックには下から 3、8、5 と積まれます。5行目で一番上の 5 を取り出して x＝5。残りは 3、8 なので、6行目で一番上の 8 を取り出して y＝8 です。",
    trace: [
      { line: 4, state: "スタック（下から）[3, 8, 5]" },
      { line: 5, state: "x=5 → [3, 8]" },
      { line: 6, state: "y=8 → [3]" },
    ],
    points: ["スタックは後入れ先出し（最後に積んだものから取り出す）", "取り出した値はスタックからなくなる"],
  },
};

// ---- stack-2：キューの順番 ----
const F2 = sqField([], { queue: 4, arrays: [{ name: "out", values: [0, 0, 0] }] });
function stack2Events() {
  const B = builder(F2);
  return [
    line(1),
    line(2),
    ...B.enqueue(B.holdSet(4), QUE),
    line(3),
    ...B.enqueue(B.holdSet(7), QUE),
    line(4),
    ...B.dequeue(QUE, "out[1]"),
    line(5),
    ...B.enqueue(B.holdSet(2), QUE),
    line(6),
    ...B.enqueue(B.holdSet(9), QUE),
    line(7),
    ...B.dequeue(QUE, "out[2]"),
    line(8),
    ...B.dequeue(QUE, "out[3]"),
  ];
}

const stack2 = {
  id: "stack-2",
  genre: "stack",
  level: 2,
  title: "並んだ順に",
  concepts: ["queue", "fifo"],
  field: F2,
  vars: {},
  varColors: { ...COLORS, out: "#FFA726" },
  program: {
    ja: [
      "整数の配列 out を用意して、{0, 0, 0} を入れる",
      "キューの最後に 4 を並べる",
      "キューの最後に 7 を並べる",
      "キューの先頭の値を取り出して、out の 1番目に入れる",
      "キューの最後に 2 を並べる",
      "キューの最後に 9 を並べる",
      "キューの先頭の値を取り出して、out の 2番目に入れる",
      "キューの先頭の値を取り出して、out の 3番目に入れる",
    ],
    code: ["整数型の配列: out ← {0, 0, 0}", "enqueue(4)", "enqueue(7)", "out[1] ← dequeue()", "enqueue(2)", "enqueue(9)", "out[2] ← dequeue()", "out[3] ← dequeue()"],
  },
  notes: [...QUEUE_NOTES, "配列の要素番号は 1 から始まる。"],
  question: "プログラムを実行し終わったときの配列 out の内容はどれか。",
  answerType: "arrays",
  choices: [
    { ja: "out は {4, 7, 2}", code: "out = {4, 7, 2}", correct: true },
    {
      ja: "out は {7, 9, 2}",
      code: "out = {7, 9, 2}",
      wrongFeedback: "それはスタック（最後に入れたものから取り出す）の考え方です。キューは、先に並んだものから順に取り出します（先入れ先出し）。",
      stop: { line: 4 },
    },
    {
      ja: "out は {4, 4, 4}",
      code: "out = {4, 4, 4}",
      wrongFeedback: "dequeue() で取り出した値は、キューからなくなります。4 を取り出したあとの先頭は 7 です。",
      stop: { line: 7 },
    },
    {
      ja: "out は {4, 7, 9}",
      code: "out = {4, 7, 9}",
      wrongFeedback: "5行目で 2、6行目で 9 の順に並んだので、2 の方が先です。キューは並んだ順に取り出します。",
      stop: { line: 8 },
    },
  ],
  events: [...stack2Events(), end()],
  expectedFinal: { arrays: { out: [4, 7, 2] } },
  hints: [
    "2〜3行目で、キューには先頭から 4、7 と並びます。4行目で先頭の 4 を取り出して out[1]＝4 です。",
    "キューは先入れ先出し。後から並んだものは、先に並んだものが全部出てからでないと出られません。",
    "4 を取り出したあと、キューは先頭から 7、2、9 と並びます。そこから 2 つ取り出すと？",
  ],
  explanation: {
    why: "キューは並んだ順に取り出します。4、7 と並んで 4 を取り出し（out[1]＝4）、そのあと 2、9 が並んで先頭から 7、2、9。7 と 2 を順に取り出して out＝{4, 7, 2}。9 はキューに残ります。",
    trace: [
      { line: 4, state: "out[1]=4、キュー（先頭から）[7]" },
      { line: 6, state: "キュー [7, 2, 9]" },
      { line: 7, state: "out[2]=7 → [2, 9]" },
      { line: 8, state: "out[3]=2 → [9]" },
    ],
    points: ["キューは先入れ先出し（並んだ順に取り出す）", "スタックとキューの違いは、取り出す側（一番上か先頭か）"],
  },
};

// ---- stack-3：push と pop が混ざる ----
const F3 = sqField(["x"], { stack: 4 });
function stack3Events() {
  const B = builder(F3);
  return [
    line(1),
    line(2),
    ...B.push(B.holdSet(6), STK),
    line(3),
    ...B.push(B.holdSet(1), STK),
    line(4),
    ...B.pop(STK, "x"),
    line(5),
    ...B.push(B.holdSet(9), STK),
    line(6),
    ...B.push(B.holdCalc(["x", 3], "x ＋ 3", 4), STK),
    line(7),
    ...B.pop(STK, "x"),
    line(8),
    ...B.push(B.holdCalc(["x", 2], "x × 2", 8), STK),
  ];
}

const stack3 = {
  id: "stack-3",
  genre: "stack",
  level: 3,
  title: "最後に残るのは？",
  concepts: ["stack", "lifo"],
  field: F3,
  vars: {},
  varColors: { ...COLORS, x: "#4FC3F7" },
  program: {
    ja: [
      "整数の変数 x を用意する",
      "スタックに 6 を積む",
      "スタックに 1 を積む",
      "スタックの一番上の値を取り出して、x に入れる",
      "スタックに 9 を積む",
      "x の値に 3 を足した値を、スタックに積む",
      "スタックの一番上の値を取り出して、x に入れる",
      "x の値に 2 を掛けた値を、スタックに積む",
    ],
    code: ["整数型: x", "push(6)", "push(1)", "x ← pop()", "push(9)", "push(x ＋ 3)", "x ← pop()", "push(x × 2)"],
  },
  notes: STACK_NOTES,
  question: "プログラムを実行し終わったときのスタックの中身を、下から順に並べたものはどれか。",
  answerType: "arrays",
  choices: [
    { ja: "スタックは（下から）{6, 9, 8}", code: "スタック = {6, 9, 8}", correct: true },
    {
      ja: "スタックは（下から）{8, 9, 6}",
      code: "スタック = {8, 9, 6}",
      wrongFeedback: "これは上から順に並べたものです。一番下は最初に積んだ 6 で、問題は「下から順に」並べたものを聞いています。",
      stop: { line: 8, mark: [2, 8] },
    },
    {
      ja: "スタックは（下から）{6, 1, 9, 4, 8}",
      code: "スタック = {6, 1, 9, 4, 8}",
      wrongFeedback: "pop() で取り出した値は、スタックからなくなります。4行目で 1、7行目で 4 が取り出されています。",
      stop: { line: 5, mark: [4] },
    },
    {
      ja: "スタックは（下から）{9, 9, 2}",
      code: "スタック = {9, 9, 2}",
      wrongFeedback: "pop() は一番上（最後に積んだもの）を取り出します。4行目で取り出すのは、一番下の 6 ではなく一番上の 1 です。",
      stop: { line: 4 },
    },
  ],
  events: [...stack3Events(), end()],
  expectedFinal: { arrays: { [STK]: [6, 9, 8] } },
  hints: [
    "2〜3行目でスタックは（下から）6、1。4行目で一番上の 1 を取り出して x＝1、スタックは 6 だけになります。",
    "6行目で積むのは x ＋ 3、8行目で積むのは x × 2 です。そのときの x の値を使います。",
    "6行目のあとスタックは 6、9、4。7行目で 4 を取り出して x＝4。8行目で積む値はいくつかな？",
  ],
  explanation: {
    why: "スタックは 6、1 → 1 を取り出して x＝1 → 6、9 → 1＋3＝4 を積んで 6、9、4 → 4 を取り出して x＝4 → 4×2＝8 を積んで 6、9、8（下から）です。",
    trace: [
      { line: 4, state: "x=1、スタック（下から）[6]" },
      { line: 6, state: "[6, 9, 4]" },
      { line: 7, state: "x=4 → [6, 9]" },
      { line: 8, state: "[6, 9, 8]" },
    ],
    points: ["push と pop が混ざっても、取り出すのはいつもその時点の一番上", "取り出した値を使って次に積む値を計算するときは、そのときの変数の値を使う"],
  },
};

// ---- stack-4：同じ入力でスタックとキューを比べる ----
const D4 = [3, 8, 5];
const F4 = sqField(["i"], { stack: 3, queue: 3, arrays: [{ name: "data", values: D4 }, { name: "out", values: [0, 0, 0, 0, 0, 0] }] });
function stack4Events() {
  const B = builder(F4);
  const ev = [line(1), line(2), line(3)];
  for (let i = 1; i <= 3; i++) {
    ev.push(...forStep(B, 4, "i", i, i === 1), line(5), ...B.push(B.holdCopy(`data[${i}]`), STK), line(6), ...B.enqueue(B.holdCopy(`data[${i}]`), QUE), line(7));
  }
  for (let i = 1; i <= 3; i++) {
    ev.push(...forStep(B, 8, "i", i, i === 1), line(9), ...B.pop(STK, `out[${i}]`), line(10), ...B.dequeue(QUE, `out[${i + 3}]`), line(11));
  }
  return ev;
}

const stack4 = {
  id: "stack-4",
  genre: "stack",
  level: 4,
  title: "スタックとキューの違い",
  concepts: ["stack", "queue", "for"],
  field: F4,
  vars: {},
  varColors: { ...COLORS, data: "#FFA726", out: "#26A69A", i: "#4FC3F7" },
  program: {
    ja: [
      "整数の配列 data を用意して、{3, 8, 5} を入れる",
      "整数の配列 out を用意して、{0, 0, 0, 0, 0, 0} を入れる",
      "整数の変数 i を用意する",
      "i を 1 から 3 まで 1ずつ増やしながら、5〜6行目を繰り返す",
      "  data の i番目の値をスタックに積む",
      "  data の i番目の値をキューの最後に並べる",
      "（繰り返す範囲はここまで。4行目に戻る）",
      "i を 1 から 3 まで 1ずつ増やしながら、9〜10行目を繰り返す",
      "  スタックの一番上の値を取り出して、out の i番目に入れる",
      "  キューの先頭の値を取り出して、out の（i ＋ 3）番目に入れる",
      "（繰り返す範囲はここまで。8行目に戻る）",
    ],
    code: [
      "整数型の配列: data ← {3, 8, 5}",
      "整数型の配列: out ← {0, 0, 0, 0, 0, 0}",
      "整数型: i",
      "for (i を 1 から 3 まで 1 ずつ増やす)",
      "  push(data[i])",
      "  enqueue(data[i])",
      "endfor",
      "for (i を 1 から 3 まで 1 ずつ増やす)",
      "  out[i] ← pop()",
      "  out[i ＋ 3] ← dequeue()",
      "endfor",
    ],
  },
  notes: [...STACK_NOTES, ...QUEUE_NOTES, "配列の要素番号は 1 から始まる。"],
  question: "プログラムを実行し終わったときの配列 out の内容はどれか。",
  answerType: "arrays",
  choices: [
    { ja: "out は {5, 8, 3, 3, 8, 5}", code: "out = {5, 8, 3, 3, 8, 5}", correct: true },
    {
      ja: "out は {3, 8, 5, 5, 8, 3}",
      code: "out = {3, 8, 5, 5, 8, 3}",
      wrongFeedback: "スタックとキューを逆にしています。スタック（pop）は最後に積んだ 5 から、キュー（dequeue）は最初に並んだ 3 から取り出します。",
      stop: { line: 9 },
    },
    {
      ja: "out は {5, 8, 3, 5, 8, 3}",
      code: "out = {5, 8, 3, 5, 8, 3}",
      wrongFeedback: "キューは、スタックと違って先に並んだものから取り出します。dequeue() で最初に出てくるのは 3 です。",
      stop: { line: 10 },
    },
    {
      ja: "out は {3, 8, 5, 3, 8, 5}",
      code: "out = {3, 8, 5, 3, 8, 5}",
      wrongFeedback: "スタックは、最後に積んだものから取り出します。pop() で最初に出てくるのは 5 です。",
      stop: { line: 9 },
    },
  ],
  events: [...stack4Events(), end()],
  expectedFinal: { arrays: { out: [5, 8, 3, 3, 8, 5] } },
  hints: [
    "最初の繰り返しのあと、スタックには下から 3、8、5、キューには先頭から 3、8、5 と入っています。",
    "pop() は一番上（最後に積んだもの）、dequeue() は先頭（最初に並んだもの）を取り出します。",
    "i＝1 のとき、out[1] にはスタックの一番上、out[4] にはキューの先頭が入ります。",
  ],
  explanation: {
    why: "同じ 3、8、5 を入れても、スタックからは逆の順（5、8、3）、キューからは同じ順（3、8、5）で出てきます。out の前半にスタック、後半にキューから取り出した値が入り、out＝{5, 8, 3, 3, 8, 5} です。",
    trace: [
      { line: 7, state: "スタック（下から）[3, 8, 5]、キュー（先頭から）[3, 8, 5]" },
      { line: 10, state: "i=1：out[1]=5, out[4]=3" },
      { line: 10, state: "i=2：out[2]=8, out[5]=8" },
      { line: 10, state: "i=3：out[3]=3, out[6]=5" },
    ],
    points: ["スタックを通すと順番が逆になる（逆順の出力に使える）", "キューを通すと順番はそのまま"],
  },
};

// ---- stack-5：逆ポーランド記法の計算 ----
const T5 = ["9", "5", "－", "3", "×", "2", "－"];
const F5 = sqField(["i", "x", "y", "r"], { stack: 4, compare: true, arrays: [{ name: "tok", values: T5 }] });
function stack5Events() {
  const B = builder(F5);
  const st = [];
  const ev = [line(1), line(2)];
  T5.forEach((t, k) => {
    const i = k + 1;
    const isNum = /^\d+$/.test(t);
    ev.push(...forStep(B, 3, "i", i, i === 1), line(4), ...B.cmp([`tok[${i}]`], `isNum("${t}")`, isNum));
    if (isNum) {
      st.push(Number(t));
      ev.push(line(5), ...B.push(B.holdCalc([`tok[${i}]`], `toInt("${t}")`, Number(t)), STK));
    } else {
      const y = st.pop();
      const x = st.pop();
      ev.push(line(6), line(7), ...B.pop(STK, "y"), line(8), ...B.pop(STK, "x"), line(9), ...B.cmp([`tok[${i}]`], `"${t}" ＝ "－"`, t === "－"));
      if (t === "－") {
        st.push(x - y);
        ev.push(line(10), ...B.push(B.holdCalc(["x", "y"], "x － y", x - y), STK));
      } else {
        st.push(x * y);
        ev.push(line(11), line(12), ...B.push(B.holdCalc(["x", "y"], "x × y", x * y), STK));
      }
      ev.push(line(13));
    }
    ev.push(line(14), line(15));
  });
  ev.push(line(16), ...B.pop(STK, "r"));
  return ev;
}

const stack5 = {
  id: "stack-5",
  genre: "stack",
  level: 5,
  title: "逆ポーランド記法",
  concepts: ["stack", "rpn", "for", "if"],
  field: F5,
  vars: {},
  varColors: { ...COLORS, tok: "#FFA726", i: "#4FC3F7", x: "#66BB6A", y: "#F06292", r: "#FFB74D" },
  program: {
    ja: [
      "文字列の配列 tok を用意して、{\"9\", \"5\", \"－\", \"3\", \"×\", \"2\", \"－\"} を入れる",
      "整数の変数 i、x、y、r を用意する",
      "i を 1 から tok の要素数（7）まで 1ずつ増やしながら、4〜14行目を繰り返す",
      "  もし tok の i番目が整数を表すなら、5行目を実行する",
      "    tok の i番目を整数に変換した値を、スタックに積む",
      "  そうでないときは、7〜13行目を実行する",
      "    スタックの一番上の値を取り出して、y に入れる",
      "    スタックの一番上の値を取り出して、x に入れる",
      "    もし tok の i番目が \"－\" と等しいなら、10行目を実行する",
      "      x から y を引いた値を、スタックに積む",
      "    そうでないときは、12行目を実行する",
      "      x に y を掛けた値を、スタックに積む",
      "    （ここで内側の分かれ道は終わり）",
      "  （ここで外側の分かれ道は終わり）",
      "（繰り返す範囲はここまで。3行目に戻る）",
      "スタックの一番上の値を取り出して、r に入れる",
    ],
    code: [
      "文字列型の配列: tok ← {\"9\", \"5\", \"－\", \"3\", \"×\", \"2\", \"－\"}",
      "整数型: i, x, y, r",
      "for (i を 1 から tok の要素数 まで 1 ずつ増やす)",
      "  if (isNum(tok[i]))",
      "    push(toInt(tok[i]))",
      "  else",
      "    y ← pop()",
      "    x ← pop()",
      "    if (tok[i] が \"－\" と等しい)",
      "      push(x － y)",
      "    else",
      "      push(x × y)",
      "    endif",
      "  endif",
      "endfor",
      "r ← pop()",
    ],
  },
  notes: [
    ...STACK_NOTES,
    "関数 isNum(s) は，文字列 s が整数を表すとき true を，そうでないとき false を返す。",
    "関数 toInt(s) は，整数を表す文字列 s を整数に変換して返す（例：toInt(\"9\") は 9）。",
    "配列 tok の要素は，整数を表す文字列か，\"－\" または \"×\" である。",
    "配列の要素番号は 1 から始まる。",
  ],
  question: "プログラムを実行し終わったときの r の値はどれか。",
  answerType: "vars",
  choices: [
    { ja: "r は 10", code: "r = 10", correct: true },
    {
      ja: "r は 14",
      code: "r = 14",
      wrongFeedback: "先に取り出す（7行目）のは y、後から取り出す（8行目）のが x です。最初の \"－\" では、y＝5、x＝9 なので x － y ＝ 9 － 5 です。順番を逆にすると、引き算の答えが変わります。",
      stop: { line: 10, mark: [7, 8, 10] },
    },
    {
      ja: "r は 12",
      code: "r = 12",
      wrongFeedback: "12 は \"×\" まで計算したところの値です。tok はあと \"2\" と \"－\" が残っていて、12 － 2 を計算してから 16行目で取り出します。",
      stop: { line: 3, nth: 6, mark: [3] },
    },
    {
      ja: "r は 2",
      code: "r = 2",
      wrongFeedback: "最後に積んだ数は 2 ですが、そのあと \"－\" で 2 と 12 を取り出して 12 － 2 を計算し、その答えを積み直しています。16行目で取り出すのはその答えです。",
      stop: { line: 7, nth: 3, mark: [7, 8, 10, 16] },
    },
  ],
  events: [...stack5Events(), end()],
  expectedFinal: { vars: { r: 10 } },
  hints: [
    "i＝1、2 では \"9\" と \"5\" が整数なので、スタックに 9、5 と積みます。i＝3 の \"－\" で、y に 5、x に 9 を取り出して、9 － 5 ＝ 4 を積みます。",
    "演算子を読んだら、上の 2 つを取り出して計算し、答えを積み直します。先に取り出す方が y（引く数）です。",
    "4 を積んだあと、\"3\" を積んで \"×\" で 4 × 3 ＝ 12。そのあと \"2\" と \"－\" が残っています。",
  ],
  explanation: {
    why: "数はスタックに積み、演算子を読んだら上の 2 つを取り出して計算し、答えを積み直します。9 5 － で 9 － 5 ＝ 4、3 × で 4 × 3 ＝ 12、2 － で 12 － 2 ＝ 10。最後に残った 10 が r に入ります。これは式 (9 － 5) × 3 － 2 を、演算子を数の後に書く「逆ポーランド記法」で計算したものです。",
    trace: [
      { line: 10, state: "9 5 － → x=9, y=5 → 4 を積む" },
      { line: 12, state: "4 3 × → 12 を積む" },
      { line: 10, state: "12 2 － → 10 を積む" },
      { line: 16, state: "r=10" },
    ],
    points: [
      "逆ポーランド記法は、数をスタックに積み、演算子で上の 2 つを取り出して計算する",
      "先に取り出すのが右側の数（y）、後から取り出すのが左側の数（x）",
      "計算の答えはスタックに積み直して、次の計算に使う",
    ],
  },
};

// ================= 6〜10：穴埋め（配列でスタック・キューを作る） =================
// 空欄の記号 a・b と まぎれないよう、穴埋めの問題では 変数名・配列名に a・b を使わない。
// 誤答は、その選択肢を空欄に入れたプログラムを実行して見せる（どの誤答も このデータで 目的と ちがう結果になる）。

// ---- stack-6：配列のスタックに積む ----
const D6 = [7, 2, 9];
const F6 = autoField(["top", "i"], { arrays: [{ name: "stk", values: [0, 0, 0, 0] }, { name: "data", values: D6 }] });
function stack6Run(fill) {
  const B = builder(F6);
  const ev = [line(1), line(2), ...B.set("top", 0), line(3), line(4)];
  let top = 0;
  for (let i = 1; i <= 3; i++) {
    ev.push(...forStep(B, 5, "i", i, i === 1), line(6));
    if (fill === "top ← top ＋ 1") {
      top += 1;
      ev.push(...B.calc("top", ["top", 1], "top ＋ 1", top));
    } else if (fill === "top ← top － 1") {
      top -= 1;
      ev.push(...B.calc("top", ["top", 1], "top － 1", top));
    } else if (fill === "top ← 1") {
      top = 1;
      ev.push(...B.set("top", 1));
    } else {
      top = i + 1;
      ev.push(...B.calc("top", ["i", 1], "i ＋ 1", top));
    }
    ev.push(line(7));
    if (top < 1 || top > 4) return [...ev, ...error(`stk[${num(top)}] は ない！（stk は 1〜4番目）`)];
    ev.push(...B.copy(`stk[${top}]`, `data[${i}]`), line(8));
  }
  return ev;
}
const FILL6_JA = { "top ← top ＋ 1": "top を 1 増やす", "top ← top － 1": "top を 1 減らす", "top ← 1": "top に 1 を入れる", "top ← i ＋ 1": "i に 1 を足して、その答えを top に入れる" };
const fill6 = (s) => ({ a: { code: s, ja: FILL6_JA[s] } });

const stack6 = {
  id: "stack-6",
  genre: "stack",
  level: 6,
  title: "配列で積む穴",
  concepts: ["stack", "array", "blank"],
  intro: "ここからは穴埋め問題。［a］ に入るものを選ぼう。\n「ここまで進める」は、穴の手前まで使えるよ。",
  field: F6,
  vars: {},
  varColors: { stk: "#7E57C2", data: "#FFA726", top: "#F06292", i: "#4FC3F7" },
  program: {
    ja: [
      "整数の配列 stk を用意して、{0, 0, 0, 0} を入れる",
      "整数の変数 top を用意して、0 を入れる",
      "整数の配列 data を用意して、{7, 2, 9} を入れる",
      "整数の変数 i を用意する",
      "i を 1 から data の要素数（3）まで 1ずつ増やしながら、6〜7行目を繰り返す",
      "  ［a］",
      "  data の i番目の値を stk の top番目に写す",
      "（繰り返す範囲はここまで。5行目に戻る）",
    ],
    code: [
      "整数型の配列: stk ← {0, 0, 0, 0}",
      "整数型: top ← 0",
      "整数型の配列: data ← {7, 2, 9}",
      "整数型: i",
      "for (i を 1 から data の要素数 まで 1 ずつ増やす)",
      "  ［a］",
      "  stk[top] ← data[i]",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。"],
  question:
    "次のプログラムは、配列 stk と変数 top でスタックを表し、配列 data の要素を先頭から順にスタックに積む。stk[1] がスタックの一番下で、top は一番上の要素の要素番号を表す。スタックが空のとき、top は 0 である。\nプログラム中の ［a］ に入れる正しい答えはどれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: FILL6_JA["top ← top ＋ 1"], code: "top ← top ＋ 1", fill: fill6("top ← top ＋ 1"), correct: true },
    {
      ja: FILL6_JA["top ← top － 1"],
      code: "top ← top － 1",
      fill: fill6("top ← top － 1"),
      wrongFeedback: "積むときは一番上が 1 つ上がるので、top は増やします。減らすと top＝－1 になり、ない要素 stk[－1] に入れようとして止まります。",
      events: stack6Run("top ← top － 1"),
    },
    {
      ja: FILL6_JA["top ← 1"],
      code: "top ← 1",
      fill: fill6("top ← 1"),
      wrongFeedback: "毎回 stk[1] に入れるので上書きが続き、最後の 9 しか残りません（stk＝{9, 0, 0, 0}）。積むたびに一番上の位置を 1 つ上げます。",
      events: stack6Run("top ← 1"),
    },
    {
      ja: FILL6_JA["top ← i ＋ 1"],
      code: "top ← i ＋ 1",
      fill: fill6("top ← i ＋ 1"),
      wrongFeedback: "i＝1 のとき top＝2 になり、stk[1] が空いたまま 1 つ上から積み始めてしまいます（stk＝{0, 7, 2, 9}）。",
      events: stack6Run("top ← i ＋ 1"),
    },
  ],
  events: [...stack6Run("top ← top ＋ 1"), end()],
  expectedFinal: { vars: { top: 3 }, arrays: { stk: [7, 2, 9, 0] } },
  hints: [
    "最初はスタックが空なので top＝0。1 つ目の 7 は stk[1] に入れたいので、7行目の前に top を 1 にする必要があります。",
    "積むたびに、一番上の要素の要素番号 top は 1 つ上がります。",
    "［a］ は top ← top ＋ 1。stk＝{7, 2, 9, 0}、top＝3 になります。",
  ],
  explanation: {
    why: "top は一番上の要素の要素番号なので、積むときは先に top を 1 増やしてから、その位置 stk[top] に入れます。7、2、9 が stk[1]〜stk[3] に入り、top＝3 です。",
    trace: [
      { line: 7, state: "i=1：top=1, stk[1]=7" },
      { line: 7, state: "i=2：top=2, stk[2]=2" },
      { line: 7, state: "i=3：top=3, stk[3]=9" },
    ],
    points: ["配列のスタックに積むときは「top を 1 増やす → stk[top] に入れる」", "空のとき top＝0 なら、1 つ目は stk[1] に入る"],
  },
};

// ---- stack-7：配列のスタックから取り出す ----
const S7 = [5, 1, 8, 0];
const F7 = autoField(["top", "i"], { arrays: [{ name: "stk", values: S7 }, { name: "out", values: [0, 0, 0] }] });
function stack7Run(fill) {
  const B = builder(F7);
  const ev = [line(1), line(2), ...B.set("top", 3), line(3), line(4)];
  let top = 3;
  for (let i = 1; i <= 3; i++) {
    ev.push(...forStep(B, 5, "i", i, i === 1), line(6));
    if (fill === "stk[top]") ev.push(...B.copy(`out[${i}]`, `stk[${top}]`));
    else if (fill === "stk[i]") ev.push(...B.copy(`out[${i}]`, `stk[${i}]`));
    else if (fill === "stk[top ＋ 1]") ev.push(...B.copy(`out[${i}]`, `stk[${top + 1}]`));
    else ev.push(...B.copy(`out[${i}]`, "top"));
    top -= 1;
    ev.push(line(7), ...B.calc("top", ["top", 1], "top － 1", top), line(8));
  }
  return ev;
}
const FILL7_JA = { "stk[top]": "stk の top番目", "stk[i]": "stk の i番目", "stk[top ＋ 1]": "stk の（top ＋ 1）番目", top: "top" };
const fill7 = (s) => ({ a: { code: s, ja: FILL7_JA[s] } });

const stack7 = {
  id: "stack-7",
  genre: "stack",
  level: 7,
  title: "配列から取り出す穴",
  concepts: ["stack", "array", "blank"],
  field: F7,
  vars: {},
  varColors: { stk: "#7E57C2", out: "#26A69A", top: "#F06292", i: "#4FC3F7" },
  program: {
    ja: [
      "整数の配列 stk を用意して、{5, 1, 8, 0} を入れる",
      "整数の変数 top を用意して、3 を入れる",
      "整数の配列 out を用意して、{0, 0, 0} を入れる",
      "整数の変数 i を用意する",
      "i を 1 から 3 まで 1ずつ増やしながら、6〜7行目を繰り返す",
      "  ［a］ の値を out の i番目に写す",
      "  top を 1 減らす",
      "（繰り返す範囲はここまで。5行目に戻る）",
    ],
    code: [
      "整数型の配列: stk ← {5, 1, 8, 0}",
      "整数型: top ← 3",
      "整数型の配列: out ← {0, 0, 0}",
      "整数型: i",
      "for (i を 1 から 3 まで 1 ずつ増やす)",
      "  out[i] ← ［a］",
      "  top ← top － 1",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。"],
  question:
    "次のプログラムは、配列 stk と変数 top で表したスタックから値を 3 回取り出し、取り出した順に配列 out に格納する。stk[1] 〜 stk[top] に、スタックの中身が下から順に入っている。\nプログラム中の ［a］ に入れる正しい答えはどれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: FILL7_JA["stk[top]"], code: "stk[top]", fill: fill7("stk[top]"), correct: true },
    {
      ja: FILL7_JA["stk[i]"],
      code: "stk[i]",
      fill: fill7("stk[i]"),
      wrongFeedback: "stk[i] は下から順に取り出すことになり、積んだ順のまま（out＝{5, 1, 8}）になります。スタックは一番上から取り出します。",
      events: stack7Run("stk[i]"),
    },
    {
      ja: FILL7_JA["stk[top ＋ 1]"],
      code: "stk[top ＋ 1]",
      fill: fill7("stk[top ＋ 1]"),
      wrongFeedback: "一番上の要素は stk[top] です。stk[top ＋ 1] はその 1 つ上で、スタックの中身ではありません（最初は stk[4]＝0 を取り出してしまう）。",
      events: stack7Run("stk[top ＋ 1]"),
    },
    {
      ja: FILL7_JA.top,
      code: "top",
      fill: fill7("top"),
      wrongFeedback: "top は一番上の要素の要素番号です。取り出したいのは、その位置に入っている値 stk[top] です。",
      events: stack7Run("top"),
    },
  ],
  events: [...stack7Run("stk[top]"), end()],
  expectedFinal: { arrays: { out: [8, 1, 5] } },
  hints: [
    "最初 top＝3 なので、スタックの一番上は stk[3]＝8 です。",
    "取り出したあと 7行目で top を 1 減らすので、次の一番上は stk[2] になります。",
    "［a］ は stk[top]。out＝{8, 1, 5} です。",
  ],
  explanation: {
    why: "一番上の要素は stk[top] なので、その値を取り出してから top を 1 減らします。8、1、5 の順に取り出されて out＝{8, 1, 5} です。",
    trace: [
      { line: 7, state: "i=1：out[1]=stk[3]=8, top=2" },
      { line: 7, state: "i=2：out[2]=stk[2]=1, top=1" },
      { line: 7, state: "i=3：out[3]=stk[1]=5, top=0" },
    ],
    points: ["配列のスタックから取り出すときは「stk[top] を読む → top を 1 減らす」", "積むとき（top を増やしてから入れる）と順番が逆になる"],
  },
};

// ---- stack-8：配列のキュー（先頭の位置） ----
const C8 = [6, 3, 0, 8, 0, 0];
const F8 = threeArrField(["head", "tail", "k", "i"], [{ name: "cmd", values: C8 }, { name: "que", values: [0, 0, 0, 0, 0] }, { name: "out", values: [0, 0, 0] }], { compare: true });
const S8_POS = { head: (h) => h, tail: (h, t) => t, "head ＋ 1": (h) => h + 1, 1: () => 1 };
function stack8Run(fill) {
  const B = builder(F8);
  const que = [0, 0, 0, 0, 0];
  const ev = [line(1), line(2), line(3), line(4), ...B.set("head", 1), line(5), ...B.set("tail", 0), line(6), ...B.set("k", 0), line(7)];
  let [head, tail, k] = [1, 0, 0];
  C8.forEach((c, n) => {
    const i = n + 1;
    ev.push(...forStep(B, 8, "i", i, i === 1), line(9), ...B.cmp([`cmd[${i}]`, 0], `${c} ＝ 0`, c === 0));
    if (c === 0) {
      k += 1;
      const p = S8_POS[fill](head, tail);
      ev.push(line(10), ...B.calc("k", ["k", 1], "k ＋ 1", k), line(11), ...B.copy(`out[${k}]`, `que[${p}]`));
      head += 1;
      ev.push(line(12), ...B.calc("head", ["head", 1], "head ＋ 1", head));
    } else {
      tail += 1;
      que[tail - 1] = c;
      ev.push(line(13), line(14), ...B.calc("tail", ["tail", 1], "tail ＋ 1", tail), line(15), ...B.copy(`que[${tail}]`, `cmd[${i}]`));
    }
    ev.push(line(16), line(17));
  });
  return ev;
}

const stack8 = {
  id: "stack-8",
  genre: "stack",
  level: 8,
  title: "配列のキューの穴",
  concepts: ["queue", "array", "blank"],
  field: F8,
  vars: {},
  varColors: { cmd: "#FFA726", que: "#26A69A", out: "#7E57C2", head: "#4FC3F7", tail: "#F06292", k: "#66BB6A", i: "#9575CD" },
  program: {
    ja: [
      "整数の配列 cmd を用意して、{6, 3, 0, 8, 0, 0} を入れる",
      "整数の配列 que を用意して、{0, 0, 0, 0, 0} を入れる",
      "整数の配列 out を用意して、{0, 0, 0} を入れる",
      "整数の変数 head を用意して、1 を入れる",
      "整数の変数 tail を用意して、0 を入れる",
      "整数の変数 k を用意して、0 を入れる",
      "整数の変数 i を用意する",
      "i を 1 から cmd の要素数（6）まで 1ずつ増やしながら、9〜16行目を繰り返す",
      "  もし cmd の i番目が 0 と等しいなら、10〜12行目を実行する",
      "    k を 1 増やす",
      "    que の（［a］）番目の値を out の k番目に写す",
      "    head を 1 増やす",
      "  そうでないときは、14〜15行目を実行する",
      "    tail を 1 増やす",
      "    cmd の i番目の値を que の tail番目に写す",
      "  （ここで分かれ道は終わり）",
      "（繰り返す範囲はここまで。8行目に戻る）",
    ],
    code: [
      "整数型の配列: cmd ← {6, 3, 0, 8, 0, 0}",
      "整数型の配列: que ← {0, 0, 0, 0, 0}",
      "整数型の配列: out ← {0, 0, 0}",
      "整数型: head ← 1",
      "整数型: tail ← 0",
      "整数型: k ← 0",
      "整数型: i",
      "for (i を 1 から cmd の要素数 まで 1 ずつ増やす)",
      "  if (cmd[i] が 0 と等しい)",
      "    k ← k ＋ 1",
      "    out[k] ← que[［a］]",
      "    head ← head ＋ 1",
      "  else",
      "    tail ← tail ＋ 1",
      "    que[tail] ← cmd[i]",
      "  endif",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。"],
  question:
    "次のプログラムは、配列 que と変数 head、tail でキューを表す。head はキューの先頭の要素の要素番号、tail は最後の要素の要素番号である。配列 cmd の要素を先頭から順に調べ、0 以外の値はキューの最後に並べ、0 のときはキューの先頭から値を 1 つ取り出して、配列 out に先頭から順に格納する。cmd が 0 のとき、キューが空になっていることはない。\nプログラム中の ［a］ に入れる正しい答えはどれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "head", code: "head", fill: { a: "head" }, correct: true },
    {
      ja: "tail",
      code: "tail",
      fill: { a: "tail" },
      wrongFeedback: "tail は最後の要素の位置です。最後に並んだ値を取り出すことになり、out＝{3, 8, 8} になります。キューは先頭（head）から取り出します。",
      events: stack8Run("tail"),
    },
    {
      ja: "head ＋ 1",
      code: "head ＋ 1",
      fill: { a: "head ＋ 1" },
      wrongFeedback: "先頭の要素は que[head] です。head ＋ 1 は 2 番目なので、先頭の 6 を飛ばしてしまいます（out＝{3, 8, 0}）。",
      events: stack8Run("head ＋ 1"),
    },
    {
      ja: "1",
      code: "1",
      fill: { a: "1" },
      wrongFeedback: "que[1] はいつも同じ要素なので、毎回 6 を取り出してしまいます（out＝{6, 6, 6}）。取り出すたびに先頭の位置 head が進みます。",
      events: stack8Run("1"),
    },
  ],
  events: [...stack8Run("head"), end()],
  expectedFinal: { arrays: { out: [6, 3, 8] } },
  hints: [
    "cmd の 6、3 で、que[1]＝6、que[2]＝3 が並び、tail＝2 になります。head は 1 のままです。",
    "取り出すのはキューの先頭です。先頭の要素番号を表している変数はどれかな？",
    "［a］ は head。6、3、8 の順に取り出され、out＝{6, 3, 8} です。",
  ],
  explanation: {
    why: "並べるときは tail を 1 進めて que[tail] に入れ、取り出すときは que[head] を読んでから head を 1 進めます。6、3 を並べて 6 を取り出し、8 を並べて 3、8 を取り出すので out＝{6, 3, 8} です。",
    trace: [
      { line: 15, state: "i=2：que=[6, 3, …], tail=2" },
      { line: 12, state: "i=3：out[1]=que[1]=6, head=2" },
      { line: 15, state: "i=4：que[3]=8, tail=3" },
      { line: 12, state: "i=5：out[2]=que[2]=3, head=3" },
      { line: 12, state: "i=6：out[3]=que[3]=8, head=4" },
    ],
    points: ["配列のキューは、先頭 head と最後 tail の 2 つの位置で表す", "取り出すのは que[head]、並べるのは que[tail]"],
  },
};

// ---- stack-9：環状のキュー（空欄2つ） ----
const C9 = [5, 7, 0, 2, 9, 0, 0, 0];
const F9 = threeArrField(["head", "tail", "k", "i"], [{ name: "cmd", values: C9 }, { name: "que", values: [0, 0, 0] }, { name: "out", values: [0, 0, 0, 0] }], { compare: true });
const S9_NEXT = {
  "tail mod 3 ＋ 1": [["tail", 3, 1], (v) => (v % 3) + 1],
  "tail ＋ 1": [["tail", 1], (v) => v + 1],
  "tail mod 3": [["tail", 3], (v) => v % 3],
  "head mod 3 ＋ 1": [["head", 3, 1], (v) => (v % 3) + 1],
  "head ＋ 1": [["head", 1], (v) => v + 1],
  "head mod 3": [["head", 3], (v) => v % 3],
};
function stack9Run(a, b) {
  const B = builder(F9);
  const que = [0, 0, 0];
  const ev = [line(1), line(2), line(3), line(4), ...B.set("head", 1), line(5), ...B.set("tail", 0), line(6), ...B.set("k", 0), line(7)];
  let [head, tail, k] = [1, 0, 0];
  const bad = (p) => p < 1 || p > 3;
  for (let n = 0; n < C9.length; n++) {
    const i = n + 1;
    const c = C9[n];
    ev.push(...forStep(B, 8, "i", i, i === 1), line(9), ...B.cmp([`cmd[${i}]`, 0], `${c} ＝ 0`, c === 0));
    if (c === 0) {
      k += 1;
      ev.push(line(10), ...B.calc("k", ["k", 1], "k ＋ 1", k), line(11));
      if (bad(head)) return [...ev, ...error(`que[${head}] は ない！（que は 1〜3番目）`)];
      ev.push(...B.copy(`out[${k}]`, `que[${head}]`));
      const [ops, f] = S9_NEXT[b];
      head = f(head);
      ev.push(line(12), ...B.calc("head", ops, b, head));
    } else {
      const [ops, f] = S9_NEXT[a];
      tail = f(tail);
      ev.push(line(13), line(14), ...B.calc("tail", ops, a, tail), line(15));
      if (bad(tail)) return [...ev, ...error(`que[${tail}] は ない！（que は 1〜3番目）`)];
      que[tail - 1] = c;
      ev.push(...B.copy(`que[${tail}]`, `cmd[${i}]`));
    }
    ev.push(line(16), line(17));
  }
  return ev;
}
const ja9 = (a, b) => `a：${a}　b：${b}`;

const stack9 = {
  id: "stack-9",
  genre: "stack",
  level: 9,
  title: "輪になったキューの穴",
  concepts: ["queue", "circular", "mod", "blank"],
  field: F9,
  vars: {},
  varColors: { cmd: "#FFA726", que: "#26A69A", out: "#7E57C2", head: "#4FC3F7", tail: "#F06292", k: "#66BB6A", i: "#9575CD" },
  program: {
    ja: [
      "整数の配列 cmd を用意して、{5, 7, 0, 2, 9, 0, 0, 0} を入れる",
      "整数の配列 que を用意して、{0, 0, 0} を入れる",
      "整数の配列 out を用意して、{0, 0, 0, 0} を入れる",
      "整数の変数 head を用意して、1 を入れる",
      "整数の変数 tail を用意して、0 を入れる",
      "整数の変数 k を用意して、0 を入れる",
      "整数の変数 i を用意する",
      "i を 1 から cmd の要素数（8）まで 1ずつ増やしながら、9〜16行目を繰り返す",
      "  もし cmd の i番目が 0 と等しいなら、10〜12行目を実行する",
      "    k を 1 増やす",
      "    que の head番目の値を out の k番目に写す",
      "    ［b］ を head に入れる",
      "  そうでないときは、14〜15行目を実行する",
      "    ［a］ を tail に入れる",
      "    cmd の i番目の値を que の tail番目に写す",
      "  （ここで分かれ道は終わり）",
      "（繰り返す範囲はここまで。8行目に戻る）",
    ],
    code: [
      "整数型の配列: cmd ← {5, 7, 0, 2, 9, 0, 0, 0}",
      "整数型の配列: que ← {0, 0, 0}",
      "整数型の配列: out ← {0, 0, 0, 0}",
      "整数型: head ← 1",
      "整数型: tail ← 0",
      "整数型: k ← 0",
      "整数型: i",
      "for (i を 1 から cmd の要素数 まで 1 ずつ増やす)",
      "  if (cmd[i] が 0 と等しい)",
      "    k ← k ＋ 1",
      "    out[k] ← que[head]",
      "    head ← ［b］",
      "  else",
      "    tail ← ［a］",
      "    que[tail] ← cmd[i]",
      "  endif",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "x mod y は，x を y で割った余りである。mod は ＋ より先に計算する。"],
  question:
    "次のプログラムは、要素数 3 の配列 que を輪のようにつないで使うキュー（環状のキュー）で、配列 cmd の要素を先頭から順に処理する。0 以外の値はキューの最後に並べ、0 のときはキューの先頭から値を 1 つ取り出して、配列 out に先頭から順に格納する。head は先頭の要素の要素番号、tail は最後の要素の要素番号で、que[3] の次は que[1] とする。キューに入っている値は 3 個以下であり、cmd が 0 のときにキューが空になっていることはない。\nプログラム中の ［a］ と ［b］ に入れる正しい答えの組合せはどれか。",
  answerType: "blank",
  blanks: ["a", "b"],
  choices: [
    { ja: ja9("tail mod 3 ＋ 1", "head mod 3 ＋ 1"), code: "a：tail mod 3 ＋ 1　b：head mod 3 ＋ 1", fill: { a: "tail mod 3 ＋ 1", b: "head mod 3 ＋ 1" }, correct: true },
    {
      ja: ja9("tail ＋ 1", "head ＋ 1"),
      code: "a：tail ＋ 1　b：head ＋ 1",
      fill: { a: "tail ＋ 1", b: "head ＋ 1" },
      wrongFeedback: "que[3] の次で que[1] に戻らないので、4 つ目に並べる 9 で、ない要素 que[4] に入れようとして止まります。",
      events: stack9Run("tail ＋ 1", "head ＋ 1"),
    },
    {
      ja: ja9("tail mod 3 ＋ 1", "head mod 3"),
      code: "a：tail mod 3 ＋ 1　b：head mod 3",
      fill: { a: "tail mod 3 ＋ 1", b: "head mod 3" },
      wrongFeedback: "head＝1 のとき 1 mod 3 ＝ 1 で、head が進みません。同じ que[1] を何度も取り出してしまい、out＝{5, 9, 9, 9} になります。",
      events: stack9Run("tail mod 3 ＋ 1", "head mod 3"),
    },
    {
      ja: ja9("tail mod 3", "head mod 3 ＋ 1"),
      code: "a：tail mod 3　b：head mod 3 ＋ 1",
      fill: { a: "tail mod 3", b: "head mod 3 ＋ 1" },
      wrongFeedback: "最初は tail＝0 なので 0 mod 3 ＝ 0 となり、ない要素 que[0] に入れようとして止まります。",
      events: stack9Run("tail mod 3", "head mod 3 ＋ 1"),
    },
  ],
  events: [...stack9Run("tail mod 3 ＋ 1", "head mod 3 ＋ 1"), end()],
  expectedFinal: { arrays: { out: [5, 7, 2, 9] } },
  hints: [
    "tail の次の位置は、1 → 2 → 3 → 1 → 2 → … と回ります。tail＝3 のとき次は 1、それ以外は tail ＋ 1 です。",
    "1 → 2、2 → 3、3 → 1 となる式を考えよう。tail mod 3 は 1、2、0 になります。それに 1 を足すと？ head も同じように進みます。",
    "a は tail mod 3 ＋ 1、b は head mod 3 ＋ 1。9 は que[1] に入り、out＝{5, 7, 2, 9} です。",
  ],
  explanation: {
    why: "que[3] の次を que[1] にするには、次の位置を「今の位置 mod 3 ＋ 1」で求めます（1→2、2→3、3→1）。5、7 を並べて 5 を取り出し、2 を que[3]、9 を que[1] に並べて（輪になって戻る）、7、2、9 を取り出します。out＝{5, 7, 2, 9} です。",
    trace: [
      { line: 12, state: "i=3：out[1]=que[1]=5, head=2" },
      { line: 15, state: "i=4：tail=3, que[3]=2" },
      { line: 15, state: "i=5：tail=3 mod 3＋1=1, que[1]=9" },
      { line: 12, state: "i=7：out[3]=que[3]=2, head=3 mod 3＋1=1" },
      { line: 12, state: "i=8：out[4]=que[1]=9" },
    ],
    points: ["環状のキューは、配列の最後の次を最初に戻して、空いた所を使い回す", "1〜n を回る次の位置は「位置 mod n ＋ 1」"],
  },
};

// ---- stack-10：括弧の対応を調べる（配列のスタック。空欄2つ） ----
const P10 = ["[", "(", ")", "(", ")", "]"];
const F10 = autoField(["top", "ok", "i"], { compare: true, arrays: [{ name: "s", values: P10 }, { name: "stk", values: ["", "", ""] }] });
function stack10Run(a, b) {
  const B = builder(F10);
  const stk = ["", "", ""];
  const ev = [line(1), line(2), line(3), ...B.set("top", 0), line(4), ...B.set("ok", 1), line(5)];
  let [top, ok] = [0, 1];
  for (let n = 0; n < P10.length; n++) {
    const i = n + 1;
    const c = P10[n];
    ev.push(...forStep(B, 6, "i", i, i === 1), line(7), ...B.cmp([`s[${i}]`], `"${c}" ＝ "("`, c === "("));
    const open = c === "(" ? ")" : c === "[" ? "]" : null;
    if (c !== "(") ev.push(line(10), ...B.cmp([`s[${i}]`], `"${c}" ＝ "["`, c === "["));
    if (open) {
      top += 1;
      const ln = c === "(" ? 8 : 11;
      ev.push(line(ln), ...B.calc("top", ["top", 1], "top ＋ 1", top), line(ln + 1));
      if (top > 3) return [...ev, ...error(`stk[${top}] は ない！（stk は 1〜3番目）`)];
      stk[top - 1] = open;
      ev.push(...B.set(`stk[${top}]`, open));
    } else {
      const at = a === "stk[1] が s[i] と等しくない" ? 1 : top;
      const v = stk[at - 1];
      const hit = a.includes("等しくない") ? v !== c : v === c;
      ev.push(line(13), line(14), ...B.cmp([`stk[${at}]`, `s[${i}]`], `"${v}" ${a.includes("等しくない") ? "≠" : "＝"} "${c}"`, hit));
      if (hit) {
        ok = 0;
        ev.push(line(15), ...B.set("ok", 0));
      }
      ev.push(line(16), line(17));
      if (b === "top ← top － 1") {
        top -= 1;
        ev.push(...B.calc("top", ["top", 1], "top － 1", top));
      } else {
        top += 1;
        ev.push(...B.calc("top", ["top", 1], "top ＋ 1", top));
      }
    }
    ev.push(line(18), line(19));
  }
  return ev;
}
const FILL10_JA = {
  "stk[top] が s[i] と等しくない": "stk の top番目が s の i番目と等しくない",
  "stk[top] が s[i] と等しい": "stk の top番目が s の i番目と等しい",
  "stk[1] が s[i] と等しくない": "stk の 1番目が s の i番目と等しくない",
  "top ← top － 1": "top を 1 減らす",
  "top ← top ＋ 1": "top を 1 増やす",
};
const fill10 = (a, b) => ({ a: { code: a, ja: FILL10_JA[a] }, b: { code: b, ja: FILL10_JA[b] } });
const ja10 = (a, b) => `a：${FILL10_JA[a]}　b：${FILL10_JA[b]}`;

const stack10 = {
  id: "stack-10",
  genre: "stack",
  level: 10,
  title: "括弧の対応の穴",
  concepts: ["stack", "array", "brackets", "blank"],
  field: F10,
  vars: {},
  varColors: { s: "#FFA726", stk: "#7E57C2", top: "#F06292", ok: "#66BB6A", i: "#4FC3F7" },
  program: {
    ja: [
      "文字の配列 s を用意して、{\"[\", \"(\", \")\", \"(\", \")\", \"]\"} を入れる",
      "文字の配列 stk を用意して、{\"\", \"\", \"\"} を入れる",
      "整数の変数 top を用意して、0 を入れる",
      "整数の変数 ok を用意して、1 を入れる",
      "整数の変数 i を用意する",
      "i を 1 から s の要素数（6）まで 1ずつ増やしながら、7〜18行目を繰り返す",
      "  もし s の i番目が \"(\" と等しいなら、8〜9行目を実行する",
      "    top を 1 増やす",
      "    stk の top番目に \")\" を入れる",
      "  そうではなく、s の i番目が \"[\" と等しいなら、11〜12行目を実行する",
      "    top を 1 増やす",
      "    stk の top番目に \"]\" を入れる",
      "  どれにも当てはまらないときは、14〜17行目を実行する",
      "    もし ［a］ なら、15行目を実行する",
      "      ok に 0 を入れる",
      "    （ここで内側の分かれ道は終わり）",
      "    ［b］",
      "  （ここで外側の分かれ道は終わり）",
      "（繰り返す範囲はここまで。6行目に戻る）",
    ],
    code: [
      "文字型の配列: s ← {\"[\", \"(\", \")\", \"(\", \")\", \"]\"}",
      "文字型の配列: stk ← {\"\", \"\", \"\"}",
      "整数型: top ← 0",
      "整数型: ok ← 1",
      "整数型: i",
      "for (i を 1 から s の要素数 まで 1 ずつ増やす)",
      "  if (s[i] が \"(\" と等しい)",
      "    top ← top ＋ 1",
      "    stk[top] ← \")\"",
      "  elseif (s[i] が \"[\" と等しい)",
      "    top ← top ＋ 1",
      "    stk[top] ← \"]\"",
      "  else",
      "    if (［a］)",
      "      ok ← 0",
      "    endif",
      "    ［b］",
      "  endif",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "配列 s の要素は，\"(\"，\")\"，\"[\"，\"]\" のどれかである。"],
  question:
    "次のプログラムは、配列 s に並んだ括弧について、開き括弧と閉じ括弧の種類が正しく対応しているかを調べ、正しければ ok を 1 のままにし、正しくなければ ok を 0 にする。配列 stk と変数 top でスタックを表し（top は一番上の要素の要素番号、空のときは 0）、開き括弧を読んだときは、それに対応する閉じ括弧をスタックに積む。閉じ括弧を読んだときは、スタックの一番上と比べてから、一番上を取り除く。s では、閉じ括弧を読んだときにスタックが空になっていることはない。\nプログラム中の ［a］ と ［b］ に入れる正しい答えの組合せはどれか。",
  answerType: "blank",
  blanks: ["a", "b"],
  choices: [
    { ja: ja10("stk[top] が s[i] と等しくない", "top ← top － 1"), code: "a：stk[top] が s[i] と等しくない　b：top ← top － 1", fill: fill10("stk[top] が s[i] と等しくない", "top ← top － 1"), correct: true },
    {
      ja: ja10("stk[top] が s[i] と等しい", "top ← top － 1"),
      code: "a：stk[top] が s[i] と等しい　b：top ← top － 1",
      fill: fill10("stk[top] が s[i] と等しい", "top ← top － 1"),
      wrongFeedback: "スタックに積んでいるのは「来るはずの閉じ括弧」です。読んだ閉じ括弧がそれと等しいときは正しく対応しているので、ok を 0 にしてはいけません。正しい s なのに ok＝0 になります。",
      events: stack10Run("stk[top] が s[i] と等しい", "top ← top － 1"),
    },
    {
      ja: ja10("stk[1] が s[i] と等しくない", "top ← top － 1"),
      code: "a：stk[1] が s[i] と等しくない　b：top ← top － 1",
      fill: fill10("stk[1] が s[i] と等しくない", "top ← top － 1"),
      wrongFeedback: "stk[1] はスタックの一番下です。閉じ括弧と比べるのは、一番最近の開き括弧（一番上の stk[top]）です。i＝3 の \")\" を一番下の \"]\" と比べて ok＝0 にしてしまいます。",
      events: stack10Run("stk[1] が s[i] と等しくない", "top ← top － 1"),
    },
    {
      ja: ja10("stk[top] が s[i] と等しくない", "top ← top ＋ 1"),
      code: "a：stk[top] が s[i] と等しくない　b：top ← top ＋ 1",
      fill: fill10("stk[top] が s[i] と等しくない", "top ← top ＋ 1"),
      wrongFeedback: "閉じ括弧を読んだら一番上を取り除くので、top は減らします。増やすと、次の \"(\" で top＝4 になり、ない要素 stk[4] に入れようとして止まります。",
      events: stack10Run("stk[top] が s[i] と等しくない", "top ← top ＋ 1"),
    },
  ],
  events: [...stack10Run("stk[top] が s[i] と等しくない", "top ← top － 1"), end()],
  expectedFinal: { vars: { ok: 1, top: 0 } },
  hints: [
    "i＝1 の \"[\" で stk[1]＝\"]\"、i＝2 の \"(\" で stk[2]＝\")\" が積まれ、top＝2 になります。スタックには「次に来るはずの閉じ括弧」が入っています。",
    "閉じ括弧を読んだら、一番上（stk[top]）と比べます。違っていたら対応が正しくないので ok＝0。そのあと一番上を取り除くので top は…？",
    "a は「stk[top] が s[i] と等しくない」、b は top ← top － 1。この s は正しく対応しているので ok＝1、最後に top＝0 です。",
  ],
  explanation: {
    why: "開き括弧を読んだら、対応する閉じ括弧をスタックに積みます。閉じ括弧を読んだら、一番上（一番最近の開き括弧に対応するもの）と比べ、違えば ok＝0 にして、一番上を取り除きます（top を 1 減らす）。s＝[ ( ) ( ) ] は、どの閉じ括弧も一番上と等しいので ok＝1 です。",
    trace: [
      { line: 12, state: "i=1：stk=[\"]\"], top=1" },
      { line: 9, state: "i=2：stk=[\"]\", \")\"], top=2" },
      { line: 17, state: "i=3：\")\" ＝ \")\" → top=1" },
      { line: 17, state: "i=5：\")\" ＝ \")\" → top=1" },
      { line: 17, state: "i=6：\"]\" ＝ \"]\" → top=0" },
    ],
    points: ["括弧の対応は、一番最近の開き括弧と比べる（スタックの一番上）", "対応する閉じ括弧を積んでおくと、比べるのが「等しいかどうか」だけになる"],
  },
};

export default [stack1, stack2, stack3, stack4, stack5, stack6, stack7, stack8, stack9, stack10];
