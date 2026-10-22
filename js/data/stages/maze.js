// ⑨ maze（迷路）
// 迷路は番号の付いた部屋の盤（field.maze）。Lv1〜3・6 は盤の上のコマを move(d) で動かす（右手法）。
// Lv4・5・7〜10 は neighbor(v, k) で隣の部屋を調べ、スタック（深さ優先探索）・キュー（幅優先探索）で部屋を訪問する。
// 盤の操作（コマを動かす・進めるか調べる・部屋の番号や隣の部屋を読む）は World が迷路の形と照らして確かめる。
import { line, end, emote, builder, mkField, put } from "./helpers.js";
import { MazeMap } from "../../engine/world.js";

const STK = "スタック";
const QUE = "キュー";
const error = (reason) => [emote("think"), { type: "fail", kind: "error", reason }];
const num = (v) => (v < 0 ? `－${-v}` : `${v}`);
const lit = (a) => `{${a.map(num).join(", ")}}`;
const links = (s) => s.split(" ").map((p) => p.split("-").map(Number));
const range = (a, b) => (a === b ? `${a}行目` : `${a}〜${b}行目`);

// ---- 〔説明〕 ----
const MOVE_NOTES = [
  "迷路は，番号の付いた部屋が並んだもので，隣り合う部屋の間に壁がなければ行き来できる。迷路の外側は壁で囲まれている。",
  "向きは整数で表し，1 は上，2 は右，3 は下，4 は左である。",
  "迷路のコマは，最初は部屋 1 にある。",
  "関数 room() は，コマが今いる部屋の番号を返す。",
  "手続 move(d) は，コマを，今いる部屋から向き d の隣の部屋へ 1 部屋進める。向き d に壁があるときは呼び出さない。",
];
const CAN_NOTES = [
  "関数 canMove(d) は，コマが今いる部屋から向き d の隣の部屋へ進めるとき true を，壁があって進めないとき false を返す。d は 1 以上 4 以下でなければならない。",
  "not canMove(d) は，canMove(d) が false のとき true となる。",
  "x mod y は，x を y で割った余りである。mod は ＋ より先に計算する。",
];
const GRAPH_NOTES = [
  "迷路は，番号の付いた部屋が並んだもので，隣り合う部屋の間に壁がなければ行き来できる。",
  "関数 neighborCount(v) は，部屋 v と行き来できる隣の部屋の数を返す。",
  "関数 neighbor(v, k) は，部屋 v と行き来できる隣の部屋のうち，番号の小さい方から k 番目の部屋の番号を返す。k は 1 以上 neighborCount(v) 以下でなければならない。",
];
const STACK_NOTES = [
  "手続 push(v) は，スタックの一番上に v を積む。関数 pop() は，スタックの一番上の値を取り出して返す。",
  "関数 size() は，スタックに入っている値の個数を返す。スタックは，最初は空である。",
];
const QUEUE_NOTES = [
  "手続 enqueue(v) は，キューの最後に v を並べる。関数 dequeue() は，キューの先頭の値を取り出して返す。",
  "関数 size() は，キューに入っている値の個数を返す。キューは，最初は空である。",
];
const ARRAY_NOTE = "配列の要素番号は 1 から始まる。";
const COLORS = { [STK]: "#7E57C2", [QUE]: "#26A69A", out: "#FFA726", visited: "#90A4AE", d: "#F06292", k: "#9575CD", v: "#4FC3F7", w: "#66BB6A", n: "#FFB74D", c: "#A1887F", r: "#4DB6AC", dir: "#FFA726", cnt: "#FFA726", dist: "#FFA726", prev: "#90A4AE", path: "#FFA726" };

/**
 * 迷路の盤を置くフィールド。歩く距離が短くなるよう、盤のすぐ右に台・変数の箱・スタック／キューを集める。
 *   盤：x＝1〜、y＝2〜（アルゴくんは x＝4、y＝3 に立って操作する）／比較台 (5,2)：上の通路 (5,1) から、計算台 (5,4)：(5,3) から
 *   変数の箱：x＝7、y＝2〜6（(6, y) から）／スタック：x＝9、y＝2〜（(9,1) から）／キュー：y＝4、x＝9〜（右から入れ、(8,4) から出す）
 *   配列：1つめは上の行（y＝0）、2つめは下の行（y＝8）
 */
function mazeField(maze, vars, { arrays = [], stack = 0, queue = 0 } = {}) {
  const cols = 14;
  const rows = arrays.length > 1 ? 9 : 8;
  return mkField({
    cols,
    rows,
    start: { x: 4, y: 3, dir: "right" },
    spawn: { x: 6, y: 1 },
    maze: { x: 1, y: 2, start: 1, access: { x: 4, y: 3 }, ...maze },
    arrays: arrays.map((a, i) => (i === 0 ? { name: a.name, x: 1, y: 0, values: a.values } : { name: a.name, x: 1, y: rows - 1, values: a.values, access: "up" })),
    stacks: stack ? [{ name: STK, x: 9, y: 2, size: stack, access: { x: 9, y: 1 } }] : [],
    queues: queue ? [{ name: QUE, x: 9, y: 4, size: queue, accessIn: { x: 9 + queue, y: 4 }, accessOut: { x: 8, y: 4 } }] : [],
    boxes: vars.map((v, i) => ({ var: v, x: 7, y: 2 + i, access: { x: 6, y: 2 + i } })),
    pads: [
      { kind: "compare", x: 5, y: 2, access: { x: 5, y: 1 } },
      { kind: "calc", x: 5, y: 4, access: { x: 5, y: 3 } },
    ],
  });
}

/** 盤を使うイベントを作る道具（builder と同じく、値はステージ側で計算して渡す） */
function tools(F) {
  const B = builder(F);
  let n = 0;
  const id = () => `mz${++n}`;
  return {
    B,
    /** room() の値を持つ */
    room() {
      const i = id();
      return { ev: [{ type: "mazeRoom", id: i }], id: i };
    },
    /** neighbor(v, k) の値を持つ。argEv があれば、先に k を計算して持ち、それを盤に渡す */
    nbr(v, k, argH = null) {
      const i = id();
      return { ev: [...(argH ? argH.ev : []), { type: "mazeNeighbor", v, k, id: i, ...(argH ? { arg: argH.id } : {}) }], id: i };
    },
    /** neighborCount(v) の値を持つ */
    count(v) {
      const i = id();
      return { ev: [{ type: "mazeCount", v, id: i }], id: i };
    },
    /** 持った値を変数・配列要素に入れる */
    store(h, box) {
      return [...h.ev, { type: "store", id: h.id, box }];
    },
    /** 持った値と数を比較台で比べる */
    cmpHeld(h, others, expr, result) {
      return [...h.ev, put(h.id, "compare"), ...B.cmp(others, expr, result)];
    },
    /** move(box の値)：向きのクリスタルを盤に渡してコマを進める */
    move(box, dir) {
      const h = B.holdCopy(box);
      return [...h.ev, { type: "mazeMove", dir, arg: h.id }];
    },
    /** canMove(box の値) */
    look(box, dir, result) {
      const h = B.holdCopy(box);
      return [...h.ev, { type: "mazeLook", dir, result, arg: h.id }];
    },
    mark(room, label) {
      return [{ type: "mazeMark", room, ...(label !== undefined ? { label: String(label) } : {}) }];
    },
  };
}

/** for の制御行：1周目は初期値（定数）を入れ、2周目からは 1 増やす */
const forStep = (B, n, v, value, first) => [line(n), ...(first ? B.set(v, value) : B.calc(v, [v, 1], `${v} ＋ 1`, value))];

// ===================================================================
// 右手法（Lv2・3・6）
// ===================================================================
const RIGHT = { expr: "d mod 4 ＋ 1", ops: ["d", 4, 1], f: (d) => (d % 4) + 1 };
const LEFT = { expr: "(d ＋ 2) mod 4 ＋ 1", ops: ["d", 2, 4, 1], f: (d) => ((d + 2) % 4) + 1 };
const TURNS = {
  "d mod 4 ＋ 1": RIGHT,
  "(d ＋ 2) mod 4 ＋ 1": LEFT,
  d: { expr: "d", ops: null, f: (d) => d },
  "d ＋ 1": { expr: "d ＋ 1", ops: ["d", 1], f: (d) => d + 1 },
};

/**
 * 右手法のプログラムの実行（行番号は Lv2・6 と Lv3 で共通）
 * 1 宣言（out / cnt）、2 d ← 2、3 k ← 1 / r ← room()、4 out[1] ← room() / cnt[r] ← cnt[r] ＋ 1、5 while、6 右を向く、
 * 7 while (not canMove(d))、8 左を向く、9 endwhile、10 move(d)、11 k ← k ＋ 1 / r ← room()、12 out[k] ← room() / cnt[r] ＋ 1、13 endwhile
 */
function rightHandRun(F, mode, turnKey, outSize) {
  const T = tools(F);
  const B = T.B;
  const mm = new MazeMap(F.maze);
  const turn = TURNS[turnKey];
  let room = 1;
  let d = 2;
  let k = 1;
  const cnt = Array(mm.size).fill(0);
  const ev = [line(1), line(2), ...B.set("d", 2), line(3)];
  if (mode === "out") ev.push(...B.set("k", 1), line(4), ...T.store(T.room(), "out[1]"));
  else {
    cnt[0] = 1;
    ev.push(...T.store(T.room(), "r"), line(4), ...B.calc("cnt[1]", ["cnt[1]", 1], "cnt[1] ＋ 1", 1));
  }
  for (let step = 0; ; step++) {
    ev.push(line(5));
    if (mode === "out") ev.push(...T.cmpHeld(T.room(), [9], `${room} ≠ 9`, room !== 9));
    else ev.push(...B.cmp(["r", 9], `${room} ≠ 9`, room !== 9));
    if (room === 9) break;
    d = turn.f(d);
    ev.push(line(6), ...(turn.ops ? B.calc("d", turn.ops, turn.expr, d) : B.copy("d", "d")));
    for (let g = 0; ; g++) {
      ev.push(line(7));
      if (!(d >= 1 && d <= 4)) return [...ev, ...error(`向き ${d} はない！（向きは 1〜4）`)];
      const ok = mm.canMove(room, d);
      ev.push(...T.look("d", d, ok));
      if (ok) break;
      d = LEFT.f(d);
      ev.push(line(8), ...B.calc("d", LEFT.ops, LEFT.expr, d), line(9));
    }
    room = mm.roomAt(room, d);
    ev.push(line(10), ...T.move("d", d), line(11));
    if (mode === "out") {
      k += 1;
      ev.push(...B.calc("k", ["k", 1], "k ＋ 1", k), line(12));
      if (k > outSize) return [...ev, ...error(`out[${k}] はない！（out は ${outSize}番目まで）`)];
      ev.push(...T.store(T.room(), `out[${k}]`));
    } else {
      cnt[room - 1] += 1;
      ev.push(...T.store(T.room(), "r"), line(12), ...B.calc(`cnt[${room}]`, [`cnt[${room}]`, 1], `cnt[${room}] ＋ 1`, cnt[room - 1]));
    }
    ev.push(line(13));
  }
  return ev;
}

/** 右手法で通る部屋の並び（問題の値を作るのに使う） */
function rightHandPath(def, turnKey = "d mod 4 ＋ 1", max = 30) {
  const mm = new MazeMap(def);
  const turn = TURNS[turnKey];
  let room = 1;
  let d = 2;
  const out = [1];
  while (room !== 9 && out.length <= max) {
    d = turn.f(d);
    while (d >= 1 && d <= 4 && !mm.canMove(room, d)) d = LEFT.f(d);
    if (!(d >= 1 && d <= 4)) break;
    room = mm.roomAt(room, d);
    out.push(room);
  }
  return out;
}

const RH_CODE = (mode, sixth) => {
  const head =
    mode === "out"
      ? ["整数型: d ← 2", "整数型: k ← 1", "out[1] ← room()", "while (room() が 9 と等しくない)"]
      : ["整数型: d ← 2", "整数型: r ← room()", "cnt[r] ← cnt[r] ＋ 1", "while (r が 9 と等しくない)"];
  const tail = mode === "out" ? ["  k ← k ＋ 1", "  out[k] ← room()"] : ["  r ← room()", "  cnt[r] ← cnt[r] ＋ 1"];
  return [...head, `  d ← ${sixth}`, "  while (not canMove(d))", "    d ← (d ＋ 2) mod 4 ＋ 1　/* 左を向く */", "  endwhile", "  move(d)", ...tail, "endwhile"];
};
const RH_JA = (mode, sixth) => {
  const head =
    mode === "out"
      ? [
          "整数の変数 d を用意して、2 を入れる",
          "整数の変数 k を用意して、1 を入れる",
          "コマが今いる部屋の番号を、out の 1番目に入れる",
          "コマが今いる部屋の番号が 9 と等しくないあいだ、6〜12行目を繰り返す",
        ]
      : [
          "整数の変数 d を用意して、2 を入れる",
          "整数の変数 r を用意して、コマが今いる部屋の番号を入れる",
          "cnt の r番目を 1 増やす",
          "r が 9 と等しくないあいだ、6〜12行目を繰り返す",
        ];
  const tail = mode === "out" ? ["  k を 1 増やす", "  コマが今いる部屋の番号を、out の k番目に入れる"] : ["  コマが今いる部屋の番号を r に入れる", "  cnt の r番目を 1 増やす"];
  return [
    ...head,
    sixth,
    "  コマが向き d へ進めないあいだ、8行目を繰り返す",
    "    d に 2 を足して 4 で割った余りに 1 を足し、その答えを d に入れる（左を向く）",
    "  （繰り返す範囲はここまで。7行目に戻る）",
    "  コマを向き d へ 1 部屋進める",
    ...tail,
    "（繰り返す範囲はここまで。5行目に戻る）",
  ];
};

// ---- maze-1：向きのとおりに進む ----
const M1 = { cols: 3, rows: 3, links: links("1-2 2-5 3-6 4-5 5-6 4-7 6-9 8-9"), legend: true };
const DIR1 = [2, 3, 2, 3];
const F1 = mazeField(M1, ["k"], { arrays: [{ name: "dir", values: DIR1 }, { name: "out", values: [0, 0, 0, 0, 0] }] });
function maze1Events() {
  const T = tools(F1);
  const B = T.B;
  const mm = new MazeMap(F1.maze);
  let room = 1;
  const ev = [line(1), line(2), line(3), line(4), ...T.store(T.room(), "out[1]")];
  DIR1.forEach((d, i) => {
    const k = i + 1;
    room = mm.roomAt(room, d);
    ev.push(...forStep(B, 5, "k", k, k === 1), line(6), ...T.move(`dir[${k}]`, d), line(7), ...T.store(T.room(), `out[${k + 1}]`), line(8));
  });
  return ev;
}

const maze1 = {
  id: "maze-1",
  genre: "maze",
  level: 1,
  title: "向きのとおりに進もう",
  concepts: ["maze", "direction", "array"],
  intro: "迷路の部屋には番号が付いているよ。\nmove(d) でコマを向き d へ 1 部屋進め、room() で今いる部屋の番号がわかるよ。",
  field: F1,
  vars: {},
  varColors: COLORS,
  program: {
    ja: [
      "整数の配列 dir を用意して、{2, 3, 2, 3} を入れる",
      "整数の配列 out を用意して、{0, 0, 0, 0, 0} を入れる",
      "整数の変数 k を用意する",
      "コマが今いる部屋の番号を、out の 1番目に入れる",
      "k を 1 から dir の要素数（4）まで 1ずつ増やしながら、6〜7行目を繰り返す",
      "  コマを、dir の k番目の値の向きへ 1 部屋進める",
      "  コマが今いる部屋の番号を、out の（k ＋ 1）番目に入れる",
      "（繰り返す範囲はここまで。5行目に戻る）",
    ],
    code: [
      "整数型の配列: dir ← {2, 3, 2, 3}",
      "整数型の配列: out ← {0, 0, 0, 0, 0}",
      "整数型: k",
      "out[1] ← room()",
      "for (k を 1 から dir の要素数 まで 1 ずつ増やす)",
      "  move(dir[k])",
      "  out[k ＋ 1] ← room()",
      "endfor",
    ],
  },
  notes: [...MOVE_NOTES, ARRAY_NOTE],
  question: "プログラムを実行し終わったときの配列 out の内容はどれか。",
  answerType: "arrays",
  choices: [
    { ja: "out は {1, 2, 5, 6, 9}", code: "out = {1, 2, 5, 6, 9}", correct: true },
    {
      ja: "out は {2, 5, 6, 9, 0}",
      code: "out = {2, 5, 6, 9, 0}",
      wrongFeedback: "4行目で、進む前の部屋 1 を out[1] に入れています。進んだあとの部屋は、7行目で out の（k ＋ 1）番目、つまり out[2] から入ります。",
      stop: { line: 7, mark: [4, 7] },
    },
    {
      ja: "out は {1, 1, 2, 5, 6}",
      code: "out = {1, 1, 2, 5, 6}",
      wrongFeedback: "6行目でコマを進めてから、7行目で部屋の番号を読みます。7行目の room() は、進んだあとの部屋の番号です。",
      stop: { line: 6, mark: [6, 7] },
    },
    {
      ja: "out は {1, 2, 3, 2, 3}",
      code: "out = {1, 2, 3, 2, 3}",
      wrongFeedback: "move(d) の d は部屋の番号ではなく向きです（〔説明〕）。3 は下なので、部屋 2 から下の部屋 5 へ進みます。",
      stop: { line: 6, nth: 2 },
    },
  ],
  events: [...maze1Events(), end()],
  expectedFinal: { arrays: { out: [1, 2, 5, 6, 9] } },
  hints: [
    "4行目で out[1] は 1（最初の部屋）。k＝1 のとき dir[1]＝2 は右なので、コマは部屋 1 から右の部屋 2 へ進み、out[2]＝2 です。",
    "向きは 1 が上、2 が右、3 が下、4 が左。move(d) の d は向きで、部屋の番号ではありません。進んだあとの部屋を out の（k ＋ 1）番目に入れます。",
    "dir は右、下、右、下。コマは 1 → 2 → 5 → … と進みます。残りの 2 回はどの部屋へ行くかな？",
  ],
  explanation: {
    why: "dir は {2, 3, 2, 3}＝右、下、右、下 なので、コマは部屋 1 → 2 → 5 → 6 → 9 と進みます。最初の部屋 1 は 4行目で out[1] に、進んだあとの部屋は 7行目で out[2]〜out[5] に入るので、out＝{1, 2, 5, 6, 9} です。",
    trace: [
      { line: 4, state: "out[1]=1" },
      { line: 7, state: "k=1：右へ → 部屋 2、out[2]=2" },
      { line: 7, state: "k=2：下へ → 部屋 5、out[3]=5" },
      { line: 7, state: "k=3：右へ → 部屋 6、out[4]=6" },
      { line: 7, state: "k=4：下へ → 部屋 9、out[5]=9" },
    ],
    points: ["向きは数で表す（1 上、2 右、3 下、4 左）", "進めてから読むので、room() は進んだあとの部屋"],
  },
};

// ---- maze-2：右手法で進む ----
const M2 = { cols: 3, rows: 3, links: links("1-4 2-3 2-5 4-5 5-8 6-9 7-8 8-9"), goal: 9, legend: true };
const P2 = rightHandPath(M2); // 1, 4, 5, 8, 7, 8, 9
const F2 = mazeField(M2, ["d", "k"], { arrays: [{ name: "out", values: P2.map(() => 0) }] });

const maze2 = {
  id: "maze-2",
  genre: "maze",
  level: 2,
  title: "右手を壁につけて",
  concepts: ["maze", "right-hand", "while", "mod"],
  field: F2,
  vars: {},
  varColors: COLORS,
  program: {
    ja: [`整数の配列 out を用意して、${lit(P2.map(() => 0))} を入れる`, ...RH_JA("out", "  d を 4 で割った余りに 1 を足して、その答えを d に入れる（右を向く）")],
    code: [`整数型の配列: out ← ${lit(P2.map(() => 0))}`, ...RH_CODE("out", "d mod 4 ＋ 1　/* 右を向く */")],
  },
  notes: [...MOVE_NOTES, ...CAN_NOTES, ARRAY_NOTE],
  question: "プログラムを実行し終わったときの配列 out の内容はどれか。",
  answerType: "arrays",
  choices: [
    { ja: `out は ${lit(P2)}`, code: `out = ${lit(P2)}`, correct: true },
    {
      ja: "out は {1, 4, 5, 2, 5, 8, 9}",
      code: "out = {1, 4, 5, 2, 5, 8, 9}",
      wrongFeedback: "6行目で、まず右を向いてから調べます。部屋 5 に右向きで着いたとき、右を向くと下になり、下の部屋 8 へ進めます。",
      stop: { line: 6, nth: 3 },
    },
    {
      ja: "out は {1, 4, 5, 8, 9, 0, 0}",
      code: "out = {1, 4, 5, 8, 9, 0, 0}",
      wrongFeedback: "このプログラムは近道を選びません。部屋 8 に下向きで着くと、右を向いた向き（左）の部屋 7 に進めるので、行き止まりの 7 に入ってから戻ります。",
      stop: { line: 6, nth: 4, mark: [6, 7, 8] },
    },
    {
      ja: "out は {4, 5, 8, 7, 8, 9, 0}",
      code: "out = {4, 5, 8, 7, 8, 9, 0}",
      wrongFeedback: "4行目で、最初の部屋 1 を out[1] に入れています。k は 1 から始まり、11行目で増やしてから入れるので、進んだ部屋は out[2] から入ります。",
      stop: { line: 12, mark: [3, 4, 12] },
    },
  ],
  events: [...rightHandRun(F2, "out", "d mod 4 ＋ 1", P2.length), end()],
  expectedFinal: { arrays: { out: P2 } },
  hints: [
    "最初は d＝2（右）。5行目の繰り返しに入ると、6行目で d は 2 mod 4 ＋ 1 ＝ 3（下）になります。部屋 1 の下は開いているので、部屋 4 へ進みます。",
    "部屋に着くたびに、まず右を向いて（6行目）、進めなければ左へ回ります（8行目）。つまり、右、前、左、後ろの順に調べます。行き止まりでは後ろに戻ります。",
    "1 → 4 → 5 → 8 と進みます。部屋 8 に下向きで着いたとき、右を向くと左向き。部屋 7 へ進めるかな？",
  ],
  explanation: {
    why: "部屋に着くたびに右、前、左、後ろの順に調べて、最初に進める向きへ進みます（右手法）。1 → 4 → 5 → 8 と進み、部屋 8 では右（左向き）の部屋 7 に入ります。7 は行き止まりなので後ろの 8 に戻り、8 では右（下）が壁、前（右）が開いているので 9 に着きます。out＝{1, 4, 5, 8, 7, 8, 9} です。",
    trace: [
      { line: 10, state: "下へ → 部屋 4" },
      { line: 10, state: "右へ → 部屋 5（下は壁）" },
      { line: 10, state: "下へ → 部屋 8" },
      { line: 10, state: "左へ → 部屋 7（行き止まり）" },
      { line: 10, state: "右へ → 部屋 8（後ろに戻る）" },
      { line: 10, state: "右へ → 部屋 9（ゴール）" },
    ],
    points: ["右手法は、右、前、左、後ろの順に調べる", "近道は選ばない。行き止まりでは戻る", "d mod 4 ＋ 1 で右へ 90 度、(d ＋ 2) mod 4 ＋ 1 で左へ 90 度回る"],
  },
};

// ---- maze-3：同じ部屋を何回通る？ ----
const M3 = { cols: 3, rows: 3, links: links("1-4 1-2 2-5 3-6 5-6 5-8 7-8 6-9"), goal: 9, legend: true };
const P3 = rightHandPath(M3); // 1, 4, 1, 2, 5, 8, 7, 8, 5, 6, 9
const C3 = Array.from({ length: 9 }, (_, i) => P3.filter((n) => n === i + 1).length);
const F3 = mazeField(M3, ["d", "r"], { arrays: [{ name: "cnt", values: Array(9).fill(0) }] });

const maze3 = {
  id: "maze-3",
  genre: "maze",
  level: 3,
  title: "何回通った？",
  concepts: ["maze", "right-hand", "count", "array"],
  field: F3,
  vars: {},
  varColors: COLORS,
  program: {
    ja: ["整数の配列 cnt を用意して、{0, 0, 0, 0, 0, 0, 0, 0, 0} を入れる", ...RH_JA("cnt", "  d を 4 で割った余りに 1 を足して、その答えを d に入れる（右を向く）")],
    code: ["整数型の配列: cnt ← {0, 0, 0, 0, 0, 0, 0, 0, 0}", ...RH_CODE("cnt", "d mod 4 ＋ 1　/* 右を向く */")],
  },
  notes: [...MOVE_NOTES, ...CAN_NOTES, ARRAY_NOTE],
  question: "プログラムを実行し終わったときの配列 cnt の内容はどれか。",
  answerType: "arrays",
  choices: [
    { ja: `cnt は ${lit(C3)}`, code: `cnt = ${lit(C3)}`, correct: true },
    {
      ja: "cnt は {1, 1, 0, 0, 1, 1, 0, 0, 1}",
      code: "cnt = {1, 1, 0, 0, 1, 1, 0, 0, 1}",
      wrongFeedback: "このプログラムは近道（1 → 2 → 5 → 6 → 9）を選びません。部屋に着くたびに右、前、左、後ろの順に調べて進むので、行き止まりにも入ります。",
      stop: { line: 6, mark: [6, 7, 8] },
    },
    {
      ja: "cnt は {1, 1, 0, 0, 2, 1, 1, 2, 1}",
      code: "cnt = {1, 1, 0, 0, 2, 1, 1, 2, 1}",
      wrongFeedback: "最初の d は 2（右）ですが、6行目で先に右を向くので、最初に調べる向きは下（3）です。部屋 1 の下は開いているので、まず部屋 4 へ進みます。",
      stop: { line: 6 },
    },
    {
      ja: "cnt は {1, 1, 0, 1, 2, 1, 1, 2, 1}",
      code: "cnt = {1, 1, 0, 1, 2, 1, 1, 2, 1}",
      wrongFeedback: "部屋 4 は行き止まりなので、部屋 1 に戻ります。戻ったときも 12行目で cnt[1] を 1 増やすので、cnt[1] は 2 になります。",
      stop: { line: 12, nth: 2 },
    },
  ],
  events: [...rightHandRun(F3, "cnt", "d mod 4 ＋ 1", 0), end()],
  expectedFinal: { arrays: { cnt: C3 } },
  hints: [
    "3〜4行目で、最初の部屋 1 を数えて cnt[1]＝1。6行目で d は 3（下）になり、部屋 1 の下は開いているので部屋 4 へ進みます。",
    "部屋 4 は行き止まりです。右、前、左が壁なので後ろ（上）に戻り、部屋 1 をもう一度通ります。通るたびに cnt を 1 増やします。",
    "コマは 1 → 4 → 1 → 2 → 5 → 8 → 7 → … と進みます。そのあとゴールの 9 までの道と、2 回通る部屋を数えよう。",
  ],
  explanation: {
    why: `右手法で、コマは ${P3.join(" → ")} と進みます。行き止まりの部屋 4 と 7 で引き返すので、部屋 1・5・8 は 2 回通ります。部屋 3 は 1 回も通りません。cnt＝${lit(C3)} です。`,
    trace: [
      { line: 4, state: "cnt[1]=1" },
      { line: 12, state: "部屋 4（行き止まり）" },
      { line: 12, state: "部屋 1 に戻る：cnt[1]=2" },
      { line: 12, state: "部屋 7（行き止まり）→ 8 に戻る：cnt[8]=2" },
      { line: 12, state: "部屋 5 に戻る：cnt[5]=2 → 6 → 9" },
    ],
    points: ["右手法は行き止まりに入ると、来た道を戻る", "通るたびに数えるので、戻った部屋は 2 回以上数える"],
  },
};

// ---- maze-6：右手法の、最初に調べる向き（穴埋め） ----
const M6 = { cols: 3, rows: 3, links: links("1-2 1-4 3-6 4-5 5-6 5-8 6-9 7-8"), goal: 9, legend: true };
const P6 = rightHandPath(M6); // 1, 4, 5, 8, 7, 8, 5, 6, 9
const F6 = mazeField(M6, ["d", "k"], { arrays: [{ name: "out", values: P6.map(() => 0) }] });
const FILL6_JA = {
  "d mod 4 ＋ 1": "d を 4 で割った余りに 1 を足した値",
  "(d ＋ 2) mod 4 ＋ 1": "d に 2 を足して 4 で割った余りに 1 を足した値",
  d: "d の値",
  "d ＋ 1": "d に 1 を足した値",
};
const fill6 = (s) => ({ a: { code: s, ja: FILL6_JA[s] } });
const run6 = (s) => rightHandRun(F6, "out", s, P6.length);

const maze6 = {
  id: "maze-6",
  genre: "maze",
  level: 6,
  title: "右手法の向きの穴",
  concepts: ["maze", "right-hand", "mod", "blank"],
  intro: "ここからは穴埋め問題。［a］ に入るものを選ぼう。\n「ここまで進める」は、穴の手前まで使えるよ。",
  field: F6,
  vars: {},
  varColors: COLORS,
  program: {
    ja: [`整数の配列 out を用意して、${lit(P6.map(() => 0))} を入れる`, ...RH_JA("out", "  ［a］ を d に入れる")],
    code: [`整数型の配列: out ← ${lit(P6.map(() => 0))}`, ...RH_CODE("out", "［a］")],
  },
  notes: [...MOVE_NOTES, ...CAN_NOTES, ARRAY_NOTE],
  question:
    `次のプログラムは、右手法によって、迷路のコマを部屋 1 からゴールの部屋 9 まで進め、コマが通った部屋の番号を、通った順に配列 out に格納する。同じ部屋を 2 回以上通ったときは、通るたびに格納する。右手法では、部屋に着くたびに、今の向き d から見て右、前、左、後ろの順に進めるかどうかを調べ、最初に進める向きへ 1 部屋進む。最初の向き d は右（2）である。迷路には輪になった道はなく、この迷路では、ゴールに着くまでに通る部屋の数は out の要素数（${P6.length}）と等しい。\nプログラム中の ［a］ に入れる正しい答えはどれか。`,
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: FILL6_JA["d mod 4 ＋ 1"], code: "d mod 4 ＋ 1", fill: fill6("d mod 4 ＋ 1"), correct: true },
    {
      ja: FILL6_JA.d,
      code: "d",
      fill: fill6("d"),
      wrongFeedback: "向きを変えないので、前から調べてしまいます（前、左、後ろ、右の順）。最初に右の部屋 2 へ進み、行き止まりで戻ってから別の道でゴールに着くので、out の並びが違います。",
      events: run6("d"),
    },
    {
      ja: FILL6_JA["(d ＋ 2) mod 4 ＋ 1"],
      code: "(d ＋ 2) mod 4 ＋ 1",
      fill: fill6("(d ＋ 2) mod 4 ＋ 1"),
      wrongFeedback: "これは左を向く式（8行目と同じ）です。左から調べると、部屋 4 と 5 の間を行ったり来たりしてゴールに着かず、out に入りきらなくなります。",
      events: run6("(d ＋ 2) mod 4 ＋ 1"),
    },
    {
      ja: FILL6_JA["d ＋ 1"],
      code: "d ＋ 1",
      fill: fill6("d ＋ 1"),
      wrongFeedback: "d＝4（左）のとき d ＋ 1 は 5 になり、ない向き 5 を調べようとして止まります。4 の次を 1 に戻すために mod 4 を使います。",
      events: run6("d ＋ 1"),
    },
  ],
  events: [...run6("d mod 4 ＋ 1"), end()],
  expectedFinal: { arrays: { out: P6 } },
  hints: [
    "右を向くと、向きは 上(1) → 右(2) → 下(3) → 左(4) → 上(1) と変わります。今の向きが d のとき、d＝4 以外は d ＋ 1、d＝4 なら 1 です。",
    "d ＋ 1 では、d＝4 のとき 5 になってしまいます。d mod 4 は、1→1、2→2、3→3、4→0 になります。さらに 1 を足すと？ 8行目の左を向く式も参考にしよう。",
    "［a］ は d mod 4 ＋ 1。1→2、2→3、3→4、4→1 になり、右に 90 度回ります。",
  ],
  explanation: {
    why: `右手法では、まず右を調べます。右に 90 度回ると、向きは 1→2、2→3、3→4、4→1 と変わるので、d mod 4 ＋ 1 で求められます。進めなければ 8行目で左に 90 度ずつ回るので、右、前、左、後ろの順に調べることになります。コマは ${P6.join(" → ")} と進みます。`,
    trace: [
      { line: 6, state: "部屋 1：d=2 → 3（下）、部屋 4 へ" },
      { line: 6, state: "部屋 4：d=3 → 4（左）は壁、前（下）も壁 → 左（右）、部屋 5 へ" },
      { line: 6, state: "部屋 5：d=2 → 3（下）、部屋 8 へ" },
      { line: 12, state: `out=${lit(P6)}` },
    ],
    points: ["右に 90 度回る：d mod 4 ＋ 1", "左に 90 度回る：(d ＋ 2) mod 4 ＋ 1", "1〜4 を回るときは mod 4 を使って 4 の次を 1 に戻す"],
  },
};


// ===================================================================
// 深さ優先探索（スタック）：Lv4・7・8
// ===================================================================
/**
 * 深さ優先探索の実行。
 * loop："asc"（k を 1 から neighborCount(v) まで）／"desc"（neighborCount(v) から 1 まで）／"c"（c ← neighborCount(v) の行があり、k を 1 から c まで。w ← neighbor(v, idx)）
 * check：8行目（Lv8 は 8行目）の条件、idx：Lv8 の neighbor の 2 つ目の引数
 * 行番号：Lv4・7 は for 12、w 13、if 14、push 15、endif 16、endfor 17、endif 18、endwhile 19。Lv8 は c の行 12 が入るので 1 つずつずれる
 */
function dfsRun(F, { loop = "asc", check = "visited[v] が 0 と等しい", idx = "k", outSize }) {
  const T = tools(F);
  const B = T.B;
  const mm = new MazeMap(F.maze);
  const o = loop === "c" ? 1 : 0;
  const visited = Array(mm.size).fill(0);
  const st = [];
  let n = 0;
  let w;
  const ev = [line(1), line(2), line(3), line(4), ...B.set("n", 0), line(5), ...B.push(B.holdSet(1), STK)];
  st.push(1);
  for (let guard = 0; guard < 60; guard++) {
    ev.push(line(6), ...B.cmp([st.length, 0], `${st.length} ＞ 0`, st.length > 0));
    if (!st.length) return ev;
    const v = st.pop();
    ev.push(line(7), ...B.pop(STK, "v"), line(8));
    let hit;
    if (check === "visited[v] が 0 と等しい") {
      hit = visited[v - 1] === 0;
      ev.push(...B.cmp([`visited[${v}]`, 0], `${visited[v - 1]} ＝ 0`, hit));
    } else if (check === "visited[v] が 1 と等しい") {
      hit = visited[v - 1] === 1;
      ev.push(...B.cmp([`visited[${v}]`, 1], `${visited[v - 1]} ＝ 1`, hit));
    } else if (check === "visited[w] が 0 と等しい") {
      if (w === undefined) return [...ev, ...error("w にはまだ値が入っていない！")];
      hit = visited[w - 1] === 0;
      ev.push(...B.cmp([`visited[${w}]`, 0], `${visited[w - 1]} ＝ 0`, hit));
    } else {
      hit = v !== 0;
      ev.push(...B.cmp(["v", 0], `${v} ≠ 0`, hit));
    }
    if (hit) {
      visited[v - 1] = 1;
      n += 1;
      ev.push(line(9), ...B.set(`visited[${v}]`, 1), line(10), ...B.calc("n", ["n", 1], "n ＋ 1", n), line(11));
      if (n > outSize) return [...ev, ...error(`out[${n}] はない！（out は ${outSize}番目まで）`)];
      ev.push(...B.copy(`out[${n}]`, "v"), ...T.mark(v, n));
      const ns = mm.neighbors(v);
      const c = ns.length;
      if (loop === "c") ev.push(line(12), ...T.store(T.count(v), "c"));
      const ks = loop === "desc" ? ns.map((_, i) => c - i) : ns.map((_, i) => i + 1);
      for (const k of ks) {
        if (loop === "desc") ev.push(line(12), ...(k === c ? T.store(T.count(v), "k") : B.calc("k", ["k", 1], "k － 1", k)));
        else ev.push(...forStep(B, 12 + o, "k", k, k === 1));
        ev.push(line(13 + o));
        if (loop === "c") {
          const IDX = {
            "c － k ＋ 1": [["c", "k", 1], c - k + 1],
            k: [null, k],
            "c － k": [["c", "k"], c - k],
            1: ["const", 1],
          }[idx];
          const h = IDX[0] === "const" ? B.holdSet(IDX[1]) : IDX[0] ? B.holdCalc(IDX[0], idx, IDX[1]) : B.holdCopy(idx);
          const j = IDX[1];
          if (!(j >= 1 && j <= c)) return [...ev, ...h.ev, ...error(`部屋 ${v} の ${j} 番目の隣の部屋はない！（隣の部屋は ${c} つ）`)];
          w = ns[j - 1];
          ev.push(...T.store(T.nbr(v, j, h), "w"));
        } else {
          w = ns[k - 1];
          ev.push(...T.store(T.nbr(v, k), "w"));
        }
        const free = visited[w - 1] === 0;
        ev.push(line(14 + o), ...B.cmp([`visited[${w}]`, 0], `${visited[w - 1]} ＝ 0`, free));
        if (free) {
          st.push(w);
          ev.push(line(15 + o), ...B.push(B.holdCopy("w"), STK));
        }
        ev.push(line(16 + o), line(17 + o));
      }
    }
    ev.push(line(18 + o), line(19 + o));
  }
  return [...ev, ...error("繰り返しが終わらない…")];
}

/** 深さ優先探索の訪問順（番号の小さい部屋から先に進む） */
function dfsOrder(def) {
  const mm = new MazeMap(def);
  const seen = new Set();
  const out = [];
  const go = (v) => {
    seen.add(v);
    out.push(v);
    for (const w of mm.neighbors(v)) if (!seen.has(w)) go(w);
  };
  go(1);
  return out;
}

const DFS_CODE = (size, { check = "visited[v] が 0 と等しい", loop = "asc", idx = "k" } = {}) => {
  const zeros = lit(Array(size).fill(0));
  const forLine =
    loop === "desc" ? "    for (k を neighborCount(v) から 1 まで 1 ずつ減らす)" : loop === "c" ? "    for (k を 1 から c まで 1 ずつ増やす)" : "    for (k を 1 から neighborCount(v) まで 1 ずつ増やす)";
  return [
    `整数型の配列: visited ← ${zeros}`,
    `整数型の配列: out ← ${zeros}`,
    loop === "c" ? "整数型: v, w, k, c" : "整数型: v, w, k",
    "整数型: n ← 0",
    "push(1)",
    "while (size() が 0 より大きい)",
    "  v ← pop()",
    `  if (${check})`,
    "    visited[v] ← 1",
    "    n ← n ＋ 1",
    "    out[n] ← v",
    ...(loop === "c" ? ["    c ← neighborCount(v)"] : []),
    forLine,
    `      w ← neighbor(v, ${idx})`,
    "      if (visited[w] が 0 と等しい)",
    "        push(w)",
    "      endif",
    "    endfor",
    "  endif",
    "endwhile",
  ];
};
const DFS_JA = (size, { check = "visited の v番目が 0 と等しい", loop = "asc", idx = "k" } = {}) => {
  const zeros = lit(Array(size).fill(0));
  const o = loop === "c" ? 1 : 0;
  const forLine =
    loop === "desc"
      ? `    k を部屋 v の隣の部屋の数から 1 まで 1ずつ減らしながら、${range(13, 16)}を繰り返す`
      : loop === "c"
        ? `    k を 1 から c まで 1ずつ増やしながら、${range(14, 17)}を繰り返す`
        : `    k を 1 から部屋 v の隣の部屋の数まで 1ずつ増やしながら、${range(13, 16)}を繰り返す`;
  return [
    `整数の配列 visited を用意して、${zeros} を入れる`,
    `整数の配列 out を用意して、${zeros} を入れる`,
    loop === "c" ? "整数の変数 v、w、k、c を用意する" : "整数の変数 v、w、k を用意する",
    "整数の変数 n を用意して、0 を入れる",
    "スタックに 1 を積む",
    `スタックに入っている値の個数が 0 より大きいあいだ、${range(7, 18 + o)}を繰り返す`,
    "  スタックの一番上の値を取り出して、v に入れる",
    `  もし ${check === "［a］" ? "［a］ " : check}なら、${range(9, 17 + o)}を実行する`,
    "    visited の v番目に 1 を入れる",
    "    n を 1 増やす",
    "    v の値を out の n番目に写す",
    ...(loop === "c" ? ["    部屋 v の隣の部屋の数を c に入れる"] : []),
    forLine,
    `      部屋 v の隣の部屋のうち、番号の小さい方から ${idx === "k" ? "k" : idx === "［a］" ? "［a］" : `（${idx}）`}番目の部屋の番号を w に入れる`,
    `      もし visited の w番目が 0 と等しいなら、${15 + o}行目を実行する`,
    "        スタックに w の値を積む",
    "      （ここで分かれ道は終わり）",
    `    （繰り返す範囲はここまで。${12 + o}行目に戻る）`,
    "  （ここで分かれ道は終わり）",
    "（繰り返す範囲はここまで。6行目に戻る）",
  ];
};
const DFS_PURPOSE =
  "深さ優先探索では、今いる部屋の隣にまだ訪問していない部屋があればそこへ進み、なければ 1 つ前の部屋に戻って続ける。まだ訪問していない隣の部屋が複数あるときは、番号の小さい部屋へ先に進む。";

// ---- maze-4：深さ優先探索の訪問順 ----
const M4 = { cols: 3, rows: 2, links: links("1-2 1-4 2-3 2-5 4-5 5-6"), piece: false };
const F4 = mazeField(M4, ["v", "w", "k", "n"], { arrays: [{ name: "visited", values: Array(6).fill(0) }, { name: "out", values: Array(6).fill(0) }], stack: 4 });
const R4 = [1, 4, 5, 6, 2, 3];

const maze4 = {
  id: "maze-4",
  genre: "maze",
  level: 4,
  title: "スタックで部屋めぐり",
  concepts: ["maze", "dfs", "stack"],
  field: F4,
  vars: {},
  varColors: COLORS,
  program: { ja: DFS_JA(6), code: DFS_CODE(6) },
  notes: [...GRAPH_NOTES, ...STACK_NOTES, ARRAY_NOTE],
  question: "プログラムを実行し終わったときの配列 out の内容はどれか。",
  answerType: "arrays",
  choices: [
    { ja: `out は ${lit(R4)}`, code: `out = ${lit(R4)}`, correct: true },
    {
      ja: "out は {1, 2, 3, 5, 4, 6}",
      code: "out = {1, 2, 3, 5, 4, 6}",
      wrongFeedback: "部屋 1 の隣は 2、4 の順に積むので、スタックの一番上は 4 です。pop() は最後に積んだ値から取り出します。",
      stop: { line: 7, nth: 2 },
    },
    {
      ja: "out は {1, 4, 5, 2, 3, 6}",
      code: "out = {1, 4, 5, 2, 3, 6}",
      wrongFeedback: "部屋 5 では、まだ訪問していない隣の 2、6 をこの順に積むので、一番上は 6 です。次に取り出すのは 6 です。",
      stop: { line: 7, nth: 4 },
    },
    {
      ja: "out は {1, 4, 5, 6, 3, 2}",
      code: "out = {1, 4, 5, 6, 3, 2}",
      wrongFeedback: "部屋 6 と部屋 3 の間は壁です。6 の隣は 5 だけなので、6 では何も積みません。次に取り出すのは、5 で積んだ 2 です。",
      stop: { line: 13, nth: 8 },
    },
  ],
  events: [...dfsRun(F4, { outSize: 6 }), end()],
  expectedFinal: { arrays: { out: R4 } },
  hints: [
    "最初にスタックから 1 を取り出して訪問し（out[1]＝1）、隣の 2、4 をこの順に積みます。スタックは下から {2, 4} です。",
    "pop() は一番上（最後に積んだ値）を取り出します。番号の大きい隣が上に来るので、大きい方から先に訪問します。すでに訪問した部屋を取り出したときは、8行目の条件が成り立たないので何もしません。",
    "1 → 4 → 5 と訪問します。部屋 5 でスタックに積むのは、まだ訪問していない 2 と 6。次に取り出すのはどちらかな？",
  ],
  explanation: {
    why: "スタックは最後に積んだ部屋から取り出すので、番号の大きい隣から先に訪問します。1 → 4 → 5 → 6 と進み、6 の隣はすべて訪問済みなので、5 で積んだ 2 に戻って 2 → 3 と訪問します。最後に残った 2（1 で積んだもの）は訪問済みなので何もしません。out＝{1, 4, 5, 6, 2, 3} です。",
    trace: [
      { line: 11, state: "v=1、スタック（下から）{2, 4}" },
      { line: 11, state: "v=4、スタック {2, 5}" },
      { line: 11, state: "v=5、スタック {2, 2, 6}" },
      { line: 11, state: "v=6、スタック {2, 2}" },
      { line: 11, state: "v=2、スタック {2, 3}" },
      { line: 11, state: "v=3、残りの 2 は訪問済み" },
    ],
    points: ["スタックは後入れ先出しなので、最後に積んだ部屋から訪問する", "同じ部屋が 2 回積まれることがある。訪問済みなら取り出しても何もしない"],
  },
};

// ---- maze-7：訪問済みの部屋を取り出したとき（穴埋め） ----
const M7 = { cols: 3, rows: 2, links: links("1-2 1-4 2-3 3-6 4-5 5-6"), piece: false };
const R7 = dfsOrder(M7); // 1, 2, 3, 6, 5, 4
const F7 = mazeField(M7, ["v", "w", "k", "n"], { arrays: [{ name: "visited", values: Array(6).fill(0) }, { name: "out", values: Array(6).fill(0) }], stack: 4 });
const FILL7_JA = {
  "visited[v] が 0 と等しい": "visited の v番目が 0 と等しい",
  "visited[v] が 1 と等しい": "visited の v番目が 1 と等しい",
  "visited[w] が 0 と等しい": "visited の w番目が 0 と等しい",
  "v が 0 と等しくない": "v が 0 と等しくない",
};
const fill7 = (s) => ({ a: { code: s, ja: FILL7_JA[s] } });
const run7 = (s) => dfsRun(F7, { loop: "desc", check: s, outSize: 6 });

const maze7 = {
  id: "maze-7",
  genre: "maze",
  level: 7,
  title: "訪問したかを確かめる穴",
  concepts: ["maze", "dfs", "stack", "visited", "blank"],
  field: F7,
  vars: {},
  varColors: COLORS,
  program: { ja: DFS_JA(6, { check: "［a］", loop: "desc" }), code: DFS_CODE(6, { check: "［a］", loop: "desc" }) },
  notes: [...GRAPH_NOTES, ...STACK_NOTES, ARRAY_NOTE],
  question: `次のプログラムは、迷路の部屋 1 から始めて、深さ優先探索によってすべての部屋を 1 回ずつ訪問し、訪問した順に部屋の番号を配列 out に格納する。${DFS_PURPOSE}スタックには、これから訪問する候補の部屋を積む。同じ部屋が 2 回以上積まれることもある。visited[i] は、部屋 i を訪問していれば 1、まだ訪問していなければ 0 である。迷路のどの部屋にも、部屋 1 から行くことができる。\nプログラム中の ［a］ に入れる正しい答えはどれか。`,
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: FILL7_JA["visited[v] が 0 と等しい"], code: "visited[v] が 0 と等しい", fill: fill7("visited[v] が 0 と等しい"), correct: true },
    {
      ja: FILL7_JA["visited[v] が 1 と等しい"],
      code: "visited[v] が 1 と等しい",
      fill: fill7("visited[v] が 1 と等しい"),
      wrongFeedback: "最初に取り出す部屋 1 はまだ訪問していない（visited[1]＝0）ので、条件が成り立たず、1 つも訪問しないまま終わります。",
      events: run7("visited[v] が 1 と等しい"),
    },
    {
      ja: FILL7_JA["visited[w] が 0 と等しい"],
      code: "visited[w] が 0 と等しい",
      fill: fill7("visited[w] が 0 と等しい"),
      wrongFeedback: "取り出した部屋は v です。最初に 8行目を実行するとき、w にはまだ値が入っていないので、visited[w] を調べられません。",
      events: run7("visited[w] が 0 と等しい"),
    },
    {
      ja: FILL7_JA["v が 0 と等しくない"],
      code: "v が 0 と等しくない",
      fill: fill7("v が 0 と等しくない"),
      wrongFeedback: "部屋の番号は 0 にならないので、いつも訪問してしまいます。部屋 4 は 1 と 5 から 2 回積まれるので、2 回目に取り出したときもう一度訪問し、out に入りきらなくなります。",
      events: run7("v が 0 と等しくない"),
    },
  ],
  events: [...run7("visited[v] が 0 と等しい"), end()],
  expectedFinal: { arrays: { out: R7 } },
  hints: [
    "最初に部屋 1 を取り出します（v＝1）。部屋 1 はまだ訪問していないので、訪問する（9〜11行目を実行する）必要があります。",
    "同じ部屋が 2 回積まれることがあります。2 回目に取り出したときは、もう訪問済みなので訪問してはいけません。取り出した部屋 v が訪問済みかどうかを調べよう。",
    `［a］ は visited[v] が 0 と等しい。out＝${lit(R7)} になります。`,
  ],
  explanation: {
    why: `部屋 4 は、部屋 1 と部屋 5 の両方から積まれます。8行目で、取り出した部屋 v がまだ訪問していない（visited[v]＝0）ときだけ訪問すれば、2 回目に取り出した 4 は飛ばせます。12行目で隣の部屋を番号の大きい方から積むので、小さい部屋が上に来て先に訪問されます。out＝${lit(R7)} です。`,
    trace: [
      { line: 11, state: "v=1、スタック（下から）{4, 2}" },
      { line: 11, state: "v=2 → 3 → 6 → 5 と進む" },
      { line: 11, state: "v=5 で 4 を積む、スタック {4, 4}" },
      { line: 11, state: "v=4（out[6]=4）" },
      { line: 8, state: "残りの 4 は visited[4]=1 なので何もしない" },
    ],
    points: ["スタックで探すと同じ部屋が何度も積まれることがある", "取り出したときに訪問済みかを確かめる（visited[v]）"],
  },
};

// ---- maze-8：番号の小さい順に進むための積み方（穴埋め） ----
const M8 = { cols: 3, rows: 3, links: links("1-2 2-3 3-6 4-5 4-7 5-6 5-8 7-8 8-9"), piece: false };
const R8 = dfsOrder(M8); // 1, 2, 3, 6, 5, 4, 7, 8, 9
const F8 = mazeField(M8, ["v", "w", "k", "c", "n"], { arrays: [{ name: "visited", values: Array(9).fill(0) }, { name: "out", values: Array(9).fill(0) }], stack: 5 });
const run8 = (s) => dfsRun(F8, { loop: "c", idx: s, outSize: 9 });

const maze8 = {
  id: "maze-8",
  genre: "maze",
  level: 8,
  title: "積む順番の穴",
  concepts: ["maze", "dfs", "stack", "order", "blank"],
  field: F8,
  vars: {},
  varColors: COLORS,
  program: { ja: DFS_JA(9, { loop: "c", idx: "［a］" }), code: DFS_CODE(9, { loop: "c", idx: "［a］" }) },
  notes: [...GRAPH_NOTES, ...STACK_NOTES, ARRAY_NOTE],
  question: `次のプログラムは、迷路の部屋 1 から始めて、深さ優先探索によってすべての部屋を 1 回ずつ訪問し、訪問した順に部屋の番号を配列 out に格納する。${DFS_PURPOSE}スタックには、これから訪問する候補の部屋を積み、すでに訪問した部屋を取り出したときは何もしない。迷路のどの部屋にも、部屋 1 から行くことができる。\nプログラム中の ［a］ に入れる正しい答えはどれか。`,
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "c － k ＋ 1", code: "c － k ＋ 1", fill: { a: "c － k ＋ 1" }, correct: true },
    {
      ja: "k",
      code: "k",
      fill: { a: "k" },
      wrongFeedback: "番号の小さい隣から順に積むと、一番上は番号の大きい部屋になり、大きい部屋へ先に進んでしまいます。部屋 5 で 4 ではなく 8 へ進むので、out の並びが違います。",
      events: run8("k"),
    },
    {
      ja: "c － k",
      code: "c － k",
      fill: { a: "c － k" },
      wrongFeedback: "k＝c のとき c － k は 0 になり、ない「0 番目の隣の部屋」を調べようとして止まります。",
      events: run8("c － k"),
    },
    {
      ja: "1",
      code: "1",
      fill: { a: "1" },
      wrongFeedback: "毎回、番号の一番小さい隣だけを調べるので、ほかの隣の部屋を積みません。部屋 2 の一番小さい隣は訪問済みの 1 なので何も積めず、部屋 1 と 2 だけ訪問して終わります。",
      events: run8("1"),
    },
  ],
  events: [...run8("c － k ＋ 1"), end()],
  expectedFinal: { arrays: { out: R8 } },
  hints: [
    "スタックは最後に積んだ部屋から取り出します。番号の小さい部屋へ先に進むには、番号の小さい部屋がスタックの上に来るように積む必要があります。",
    "つまり、隣の部屋を番号の大きい方から積みます。k が 1、2、…、c と増えるとき、［a］ は c、c － 1、…、1 と減る必要があります。",
    "k＝1 で c、k＝c で 1 になる式は？ c － k では k＝c のとき 0 になってしまいます。",
  ],
  explanation: {
    why: `スタックは最後に積んだ部屋から取り出すので、番号の小さい部屋へ先に進むには、番号の大きい部屋から積みます。k が 1 から c まで増えるとき、c － k ＋ 1 は c から 1 まで減るので、neighbor(v, c － k ＋ 1) で番号の大きい隣から順に調べられます。訪問順は out＝${lit(R8)} です。`,
    trace: [
      { line: 11, state: "v=1 → 2 → 3 → 6 → 5" },
      { line: 16, state: "v=5：隣 8、6、4 の順に調べ、8 と 4 を積む（4 が上）" },
      { line: 11, state: "v=4 → 7 → 8 → 9" },
    ],
    points: ["スタックで小さい順に取り出したいなら、大きい順に積む", "k が 1〜c のとき、c － k ＋ 1 は c〜1"],
  },
};

// ===================================================================
// 幅優先探索（キュー）：Lv5・9・10
// ===================================================================

/** 幅優先探索の訪問順・手数・1つ前の部屋 */
function bfsInfo(def) {
  const mm = new MazeMap(def);
  const dist = Array(mm.size).fill(-1);
  const prev = Array(mm.size).fill(0);
  const out = [];
  const q = [1];
  dist[0] = 0;
  prev[0] = -1;
  while (q.length) {
    const v = q.shift();
    out.push(v);
    for (const w of mm.neighbors(v))
      if (dist[w - 1] === -1) {
        dist[w - 1] = dist[v - 1] + 1;
        prev[w - 1] = v;
        q.push(w);
      }
  }
  return { out, dist, prev };
}

// ---- maze-5：幅優先探索の訪問順 ----
const M5 = { cols: 3, rows: 2, links: links("1-2 1-4 2-5 3-6 4-5 5-6"), piece: false };
const R5 = bfsInfo(M5).out; // 1, 2, 4, 5, 6, 3
const F5 = mazeField(M5, ["v", "w", "k", "n"], { arrays: [{ name: "visited", values: Array(6).fill(0) }, { name: "out", values: Array(6).fill(0) }], queue: 3 });
function maze5Events() {
  const T = tools(F5);
  const B = T.B;
  const mm = new MazeMap(F5.maze);
  const visited = Array(6).fill(0);
  const q = [];
  let n = 0;
  const ev = [line(1), line(2), line(3), line(4), ...B.set("n", 0), line(5), ...B.set("visited[1]", 1), line(6), ...B.enqueue(B.holdSet(1), QUE)];
  visited[0] = 1;
  q.push(1);
  for (;;) {
    ev.push(line(7), ...B.cmp([q.length, 0], `${q.length} ＞ 0`, q.length > 0));
    if (!q.length) break;
    const v = q.shift();
    n += 1;
    ev.push(line(8), ...B.dequeue(QUE, "v"), line(9), ...B.calc("n", ["n", 1], "n ＋ 1", n), line(10), ...B.copy(`out[${n}]`, "v"), ...T.mark(v, n));
    mm.neighbors(v).forEach((w, i) => {
      const k = i + 1;
      const free = visited[w - 1] === 0;
      ev.push(...forStep(B, 11, "k", k, k === 1), line(12), ...T.store(T.nbr(v, k), "w"), line(13), ...B.cmp([`visited[${w}]`, 0], `${visited[w - 1]} ＝ 0`, free));
      if (free) {
        visited[w - 1] = 1;
        q.push(w);
        ev.push(line(14), ...B.set(`visited[${w}]`, 1), line(15), ...B.enqueue(B.holdCopy("w"), QUE));
      }
      ev.push(line(16), line(17));
    });
    ev.push(line(18));
  }
  return ev;
}

const maze5 = {
  id: "maze-5",
  genre: "maze",
  level: 5,
  title: "キューで部屋めぐり",
  concepts: ["maze", "bfs", "queue"],
  field: F5,
  vars: {},
  varColors: COLORS,
  program: {
    ja: [
      "整数の配列 visited を用意して、{0, 0, 0, 0, 0, 0} を入れる",
      "整数の配列 out を用意して、{0, 0, 0, 0, 0, 0} を入れる",
      "整数の変数 v、w、k を用意する",
      "整数の変数 n を用意して、0 を入れる",
      "visited の 1番目に 1 を入れる",
      "キューに 1 を並べる",
      "キューに入っている値の個数が 0 より大きいあいだ、8〜17行目を繰り返す",
      "  キューの先頭の値を取り出して、v に入れる",
      "  n を 1 増やす",
      "  v の値を out の n番目に写す",
      "  k を 1 から部屋 v の隣の部屋の数まで 1ずつ増やしながら、12〜16行目を繰り返す",
      "    部屋 v の隣の部屋のうち、番号の小さい方から k番目の部屋の番号を w に入れる",
      "    もし visited の w番目が 0 と等しいなら、14〜15行目を実行する",
      "      visited の w番目に 1 を入れる",
      "      キューの最後に w の値を並べる",
      "    （ここで分かれ道は終わり）",
      "  （繰り返す範囲はここまで。11行目に戻る）",
      "（繰り返す範囲はここまで。7行目に戻る）",
    ],
    code: [
      "整数型の配列: visited ← {0, 0, 0, 0, 0, 0}",
      "整数型の配列: out ← {0, 0, 0, 0, 0, 0}",
      "整数型: v, w, k",
      "整数型: n ← 0",
      "visited[1] ← 1",
      "enqueue(1)",
      "while (size() が 0 より大きい)",
      "  v ← dequeue()",
      "  n ← n ＋ 1",
      "  out[n] ← v",
      "  for (k を 1 から neighborCount(v) まで 1 ずつ増やす)",
      "    w ← neighbor(v, k)",
      "    if (visited[w] が 0 と等しい)",
      "      visited[w] ← 1",
      "      enqueue(w)",
      "    endif",
      "  endfor",
      "endwhile",
    ],
  },
  notes: [...GRAPH_NOTES, ...QUEUE_NOTES, ARRAY_NOTE],
  question: "プログラムを実行し終わったときの配列 out の内容はどれか。",
  answerType: "arrays",
  choices: [
    { ja: `out は ${lit(R5)}`, code: `out = ${lit(R5)}`, correct: true },
    {
      ja: "out は {1, 2, 5, 4, 6, 3}",
      code: "out = {1, 2, 5, 4, 6, 3}",
      wrongFeedback: "キューは先に並べた値から取り出します。部屋 2 を訪問したときに 5 を並べますが、その前に部屋 1 で並べた 4 が先頭にいます。",
      stop: { line: 8, nth: 3 },
    },
    {
      ja: "out は {1, 4, 5, 6, 3, 2}",
      code: "out = {1, 4, 5, 6, 3, 2}",
      wrongFeedback: "dequeue() は、キューの最後ではなく先頭（最初に並べた値）を取り出します。部屋 1 で 2、4 の順に並べたので、先に取り出すのは 2 です。",
      stop: { line: 8, nth: 2 },
    },
    {
      ja: "out は {1, 2, 4, 3, 5, 6}",
      code: "out = {1, 2, 4, 3, 5, 6}",
      wrongFeedback: "部屋 2 と部屋 3 の間は壁です。部屋 2 の隣は 1 と 5 なので、部屋 2 で並べるのは 5 だけです。部屋 3 は 6 の隣です。",
      stop: { line: 12, nth: 3 },
    },
  ],
  events: [...maze5Events(), end()],
  expectedFinal: { arrays: { out: R5 } },
  hints: [
    "部屋 1 を取り出して訪問し（out[1]＝1）、隣の 2、4 をこの順にキューに並べます。キューは先頭から {2, 4} です。",
    "キューは先に並べたものから取り出します。部屋 1 に近い部屋から順に訪問することになります。並べるときに visited を 1 にするので、同じ部屋は 2 回並びません。",
    "1 → 2 → 4 と訪問します。そのとき並んでいるのは？ 部屋 3 はどの部屋の隣か、迷路の壁をよく見よう。",
  ],
  explanation: {
    why: `キューは先に並べた部屋から取り出すので、部屋 1 に近い部屋から順に訪問します（幅優先探索）。1 で 2、4 を並べ、2 で 5 を並べます。4 の隣の 5 はもう並べてあるので並べません。5 で 6、6 で 3 を並べます。out＝${lit(R5)} です。`,
    trace: [
      { line: 10, state: "v=1、キュー（先頭から）{2, 4}" },
      { line: 10, state: "v=2、キュー {4, 5}" },
      { line: 10, state: "v=4、キュー {5}" },
      { line: 10, state: "v=5、キュー {6}" },
      { line: 10, state: "v=6、キュー {3}" },
      { line: 10, state: "v=3" },
    ],
    points: ["キューは先入れ先出しなので、近い部屋から順に訪問する（幅優先探索）", "並べるときに印を付けると、同じ部屋は 1 回しか並ばない"],
  },
};

// ---- maze-9：最短の手数（穴埋め 2 つ） ----
const M9 = { cols: 3, rows: 3, links: links("1-4 2-3 2-5 3-6 4-7 5-6 5-8 6-9 7-8"), piece: false };
const D9 = bfsInfo(M9).dist; // 0, 5, 6, 1, 4, 5, 2, 3, 6
const F9 = mazeField(M9, ["v", "w", "k"], { arrays: [{ name: "dist", values: Array(9).fill(-1) }], queue: 4 });
/** a：9行目の条件、b：10行目の式 */
function maze9Run(a, b) {
  const T = tools(F9);
  const B = T.B;
  const mm = new MazeMap(F9.maze);
  const dist = Array(9).fill(-1);
  const q = [];
  const ev = [line(1), line(2), line(3), ...B.set("dist[1]", 0), ...T.mark(1, 0), line(4), ...B.enqueue(B.holdSet(1), QUE)];
  dist[0] = 0;
  q.push(1);
  for (let guard = 0; guard < 40; guard++) {
    ev.push(line(5), ...B.cmp([q.length, 0], `${q.length} ＞ 0`, q.length > 0));
    if (!q.length) return ev;
    const v = q.shift();
    ev.push(line(6), ...B.dequeue(QUE, "v"));
    const ns = mm.neighbors(v);
    for (let i = 0; i < ns.length; i++) {
      const k = i + 1;
      const w = ns[i];
      ev.push(...forStep(B, 7, "k", k, k === 1), line(8), ...T.store(T.nbr(v, k), "w"), line(9));
      let hit;
      if (a === "dist[w] が －1 と等しい") {
        hit = dist[w - 1] === -1;
        ev.push(...B.cmp([`dist[${w}]`, -1], `${num(dist[w - 1])} ＝ －1`, hit));
      } else if (a === "dist[w] が －1 と等しくない") {
        hit = dist[w - 1] !== -1;
        ev.push(...B.cmp([`dist[${w}]`, -1], `${num(dist[w - 1])} ≠ －1`, hit));
      } else {
        hit = dist[v - 1] !== -1;
        ev.push(...B.cmp([`dist[${v}]`, -1], `${num(dist[v - 1])} ≠ －1`, hit));
      }
      if (hit) {
        const val = b === "dist[v] ＋ 1" ? dist[v - 1] + 1 : dist[w - 1] + 1;
        dist[w - 1] = val;
        ev.push(line(10), ...B.calc(`dist[${w}]`, [b === "dist[v] ＋ 1" ? `dist[${v}]` : `dist[${w}]`, 1], b, val), ...T.mark(w, val), line(11));
        if (q.length >= 4) return [...ev, ...error("繰り返しが終わらない…（調べ終わった部屋もまた並べてしまう）")];
        q.push(w);
        ev.push(...B.enqueue(B.holdCopy("w"), QUE));
      }
      ev.push(line(12), line(13));
    }
    ev.push(line(14));
  }
  return [...ev, ...error("繰り返しが終わらない…")];
}
const ja9 = (a, b) => `a：${a}　b：${b}`;
const FILL9_JA = {
  "dist[w] が －1 と等しい": "dist の w番目が －1 と等しい",
  "dist[w] が －1 と等しくない": "dist の w番目が －1 と等しくない",
  "dist[v] が －1 と等しくない": "dist の v番目が －1 と等しくない",
  "dist[v] ＋ 1": "dist の v番目に 1 を足した値",
  "dist[w] ＋ 1": "dist の w番目に 1 を足した値",
};
const fill9 = (a, b) => ({ a: { code: a, ja: FILL9_JA[a] }, b: { code: b, ja: FILL9_JA[b] } });
const choice9 = (a, b) => ({ ja: ja9(FILL9_JA[a], FILL9_JA[b]), code: ja9(a, b), fill: fill9(a, b) });

const maze9 = {
  id: "maze-9",
  genre: "maze",
  level: 9,
  title: "最短の手数の穴",
  concepts: ["maze", "bfs", "queue", "distance", "blank"],
  field: F9,
  vars: {},
  varColors: COLORS,
  program: {
    ja: [
      "整数の配列 dist を用意して、{－1, －1, －1, －1, －1, －1, －1, －1, －1} を入れる",
      "整数の変数 v、w、k を用意する",
      "dist の 1番目に 0 を入れる",
      "キューに 1 を並べる",
      "キューに入っている値の個数が 0 より大きいあいだ、6〜13行目を繰り返す",
      "  キューの先頭の値を取り出して、v に入れる",
      "  k を 1 から部屋 v の隣の部屋の数まで 1ずつ増やしながら、8〜12行目を繰り返す",
      "    部屋 v の隣の部屋のうち、番号の小さい方から k番目の部屋の番号を w に入れる",
      "    もし ［a］ なら、10〜11行目を実行する",
      "      ［b］ を dist の w番目に入れる",
      "      キューの最後に w の値を並べる",
      "    （ここで分かれ道は終わり）",
      "  （繰り返す範囲はここまで。7行目に戻る）",
      "（繰り返す範囲はここまで。5行目に戻る）",
    ],
    code: [
      "整数型の配列: dist ← {－1, －1, －1, －1, －1, －1, －1, －1, －1}",
      "整数型: v, w, k",
      "dist[1] ← 0",
      "enqueue(1)",
      "while (size() が 0 より大きい)",
      "  v ← dequeue()",
      "  for (k を 1 から neighborCount(v) まで 1 ずつ増やす)",
      "    w ← neighbor(v, k)",
      "    if (［a］)",
      "      dist[w] ← ［b］",
      "      enqueue(w)",
      "    endif",
      "  endfor",
      "endwhile",
    ],
  },
  notes: [...GRAPH_NOTES, ...QUEUE_NOTES, ARRAY_NOTE],
  question:
    "次のプログラムは、幅優先探索によって、迷路の部屋 1 から各部屋までの最短の手数を求め、配列 dist に格納する。隣の部屋へ 1 部屋進むことを 1 手とし、dist[i] には部屋 1 から部屋 i までの最短の手数を格納する（dist[1] は 0 である）。手数がまだ決まっていない部屋の dist の値は －1 である。迷路のどの部屋にも、部屋 1 から行くことができる。\nプログラム中の ［a］ と ［b］ に入れる正しい答えの組合せはどれか。",
  answerType: "blank",
  blanks: ["a", "b"],
  choices: [
    { ...choice9("dist[w] が －1 と等しい", "dist[v] ＋ 1"), correct: true },
    {
      ...choice9("dist[w] が －1 と等しい", "dist[w] ＋ 1"),
      wrongFeedback: "10行目を実行するとき dist[w] は －1 なので、dist[w] ＋ 1 は 0 になります。部屋 w の手数は、1 つ手前の部屋 v の手数より 1 多い値です。",
      events: maze9Run("dist[w] が －1 と等しい", "dist[w] ＋ 1"),
    },
    {
      ...choice9("dist[w] が －1 と等しくない", "dist[v] ＋ 1"),
      wrongFeedback: "手数が決まっている部屋だけを調べることになり、まだ決まっていない部屋 4 の手数を求めないまま終わります。手数を決めるのは、まだ決まっていない（－1 の）部屋です。",
      events: maze9Run("dist[w] が －1 と等しくない", "dist[v] ＋ 1"),
    },
    {
      ...choice9("dist[v] が －1 と等しくない", "dist[v] ＋ 1"),
      wrongFeedback: "取り出した部屋 v の手数はいつも決まっているので、条件はいつも成り立ちます。手数が決まった部屋もまた並べてしまい、繰り返しが終わりません。",
      events: maze9Run("dist[v] が －1 と等しくない", "dist[v] ＋ 1"),
    },
  ],
  events: [...maze9Run("dist[w] が －1 と等しい", "dist[v] ＋ 1"), end()],
  expectedFinal: { arrays: { dist: D9 } },
  hints: [
    "部屋 1 を取り出すと、隣は部屋 4 だけです。部屋 4 は 1 から 1 手なので、dist[4] は dist[1] ＋ 1 ＝ 1 にしたい値です。",
    "キューは部屋 1 に近い部屋から順に取り出すので、手数が初めて決まるときが最短です。手数がまだ決まっていない（－1 の）部屋だけ、手数を決めて並べます。",
    "［a］ は dist[w] が －1 と等しい、［b］ は dist[v] ＋ 1。部屋 9 は 6 手です。",
  ],
  explanation: {
    why: `キューは部屋 1 に近い部屋から順に取り出すので、ある部屋の手数が初めて決まるときが最短の手数です。そこで、まだ手数が決まっていない部屋 w（dist[w]＝－1）だけ、dist[w] ← dist[v] ＋ 1 として並べます。dist＝${lit(D9)} です。`,
    trace: [
      { line: 10, state: "v=1：dist[4]=1" },
      { line: 10, state: "v=4：dist[7]=2" },
      { line: 10, state: "v=7：dist[8]=3" },
      { line: 10, state: "v=8：dist[5]=4" },
      { line: 10, state: "v=5：dist[2]=5、dist[6]=5" },
      { line: 10, state: "v=2：dist[3]=6、v=6：dist[9]=6" },
    ],
    points: ["幅優先探索では、近い部屋から順に取り出す。初めて手数が決まったときが最短", "隣の部屋の手数 ＝ 今の部屋の手数 ＋ 1"],
  },
};

// ---- maze-10：最短経路をたどる（穴埋め 2 つ） ----
const M10 = { cols: 3, rows: 3, links: links("1-4 2-3 2-5 3-6 4-5 4-7 5-8 6-9 7-8"), goal: 9, piece: false };
const I10 = bfsInfo(M10);
const PATH10 = (() => {
  const p = [];
  for (let v = 9; v !== -1; v = I10.prev[v - 1]) p.push(v);
  return [...p, ...Array(9 - p.length).fill(0)];
})(); // 9, 6, 3, 2, 5, 4, 1, 0, 0
const F10 = mazeField(M10, ["v", "w", "k", "n"], { arrays: [{ name: "prev", values: Array(9).fill(0) }, { name: "path", values: Array(9).fill(0) }], queue: 4 });
function maze10Run(a, b) {
  const T = tools(F10);
  const B = T.B;
  const mm = new MazeMap(F10.maze);
  const prev = Array(9).fill(0);
  const q = [];
  const ev = [line(1), line(2), line(3), line(4), ...B.set("n", 0), line(5), ...B.set("prev[1]", -1), line(6), ...B.enqueue(B.holdSet(1), QUE)];
  prev[0] = -1;
  q.push(1);
  let w;
  let k;
  for (;;) {
    ev.push(line(7), ...B.cmp([q.length, 0], `${q.length} ＞ 0`, q.length > 0));
    if (!q.length) break;
    const v = q.shift();
    ev.push(line(8), ...B.dequeue(QUE, "v"));
    const ns = mm.neighbors(v);
    for (let i = 0; i < ns.length; i++) {
      k = i + 1;
      w = ns[i];
      const free = prev[w - 1] === 0;
      ev.push(...forStep(B, 9, "k", k, k === 1), line(10), ...T.store(T.nbr(v, k), "w"), line(11), ...B.cmp([`prev[${w}]`, 0], `${num(prev[w - 1])} ＝ 0`, free));
      if (free) {
        const val = { v, w, k }[a];
        prev[w - 1] = val;
        ev.push(line(12), ...B.copy(`prev[${w}]`, a), line(13));
        if (q.length >= 4) return [...ev, ...error("繰り返しが終わらない…")];
        q.push(w);
        ev.push(...B.enqueue(B.holdCopy("w"), QUE));
      }
      ev.push(line(14), line(15));
    }
    ev.push(line(16));
  }
  // ゴールから 1 つ前の部屋をたどる
  let v = 9;
  let n = 0;
  ev.push(line(17), ...B.set("v", 9));
  for (let guard = 0; ; guard++) {
    ev.push(line(18), ...B.cmp(["v", -1], `${num(v)} ≠ －1`, v !== -1));
    if (v === -1) break;
    n += 1;
    ev.push(line(19), ...B.calc("n", ["n", 1], "n ＋ 1", n), line(20));
    if (n > 9) return [...ev, ...error("path[10] はない！（path は 9番目まで）")];
    ev.push(...B.copy(`path[${n}]`, "v"), ...T.mark(v, n), line(21));
    const at = b === "prev[v]" ? v : n;
    if (!(at >= 1 && at <= 9)) return [...ev, ...error(`prev[${num(at)}] はない！`)];
    v = prev[at - 1];
    ev.push(...B.copy("v", `prev[${at}]`), line(22));
  }
  return ev;
}
const FILL10_JA = { v: "v", w: "w", k: "k", "prev[v]": "prev の v番目", "prev[n]": "prev の n番目" };
const choice10 = (a, b) => ({ ja: `a：${FILL10_JA[a]}　b：${FILL10_JA[b]}`, code: `a：${a}　b：${b}`, fill: { a, b: { code: b, ja: FILL10_JA[b] } } });

const maze10 = {
  id: "maze-10",
  genre: "maze",
  level: 10,
  title: "最短経路をたどる穴",
  concepts: ["maze", "bfs", "queue", "path", "blank"],
  field: F10,
  vars: {},
  varColors: COLORS,
  program: {
    ja: [
      "整数の配列 prev を用意して、{0, 0, 0, 0, 0, 0, 0, 0, 0} を入れる",
      "整数の配列 path を用意して、{0, 0, 0, 0, 0, 0, 0, 0, 0} を入れる",
      "整数の変数 v、w、k を用意する",
      "整数の変数 n を用意して、0 を入れる",
      "prev の 1番目に －1 を入れる",
      "キューに 1 を並べる",
      "キューに入っている値の個数が 0 より大きいあいだ、8〜15行目を繰り返す",
      "  キューの先頭の値を取り出して、v に入れる",
      "  k を 1 から部屋 v の隣の部屋の数まで 1ずつ増やしながら、10〜14行目を繰り返す",
      "    部屋 v の隣の部屋のうち、番号の小さい方から k番目の部屋の番号を w に入れる",
      "    もし prev の w番目が 0 と等しいなら、12〜13行目を実行する",
      "      ［a］ の値を prev の w番目に入れる",
      "      キューの最後に w の値を並べる",
      "    （ここで分かれ道は終わり）",
      "  （繰り返す範囲はここまで。9行目に戻る）",
      "（繰り返す範囲はここまで。7行目に戻る）",
      "v に 9 を入れる",
      "v が －1 と等しくないあいだ、19〜21行目を繰り返す",
      "  n を 1 増やす",
      "  v の値を path の n番目に写す",
      "  ［b］ の値を v に入れる",
      "（繰り返す範囲はここまで。18行目に戻る）",
    ],
    code: [
      "整数型の配列: prev ← {0, 0, 0, 0, 0, 0, 0, 0, 0}",
      "整数型の配列: path ← {0, 0, 0, 0, 0, 0, 0, 0, 0}",
      "整数型: v, w, k",
      "整数型: n ← 0",
      "prev[1] ← －1",
      "enqueue(1)",
      "while (size() が 0 より大きい)",
      "  v ← dequeue()",
      "  for (k を 1 から neighborCount(v) まで 1 ずつ増やす)",
      "    w ← neighbor(v, k)",
      "    if (prev[w] が 0 と等しい)",
      "      prev[w] ← ［a］",
      "      enqueue(w)",
      "    endif",
      "  endfor",
      "endwhile",
      "v ← 9",
      "while (v が －1 と等しくない)",
      "  n ← n ＋ 1",
      "  path[n] ← v",
      "  v ← ［b］",
      "endwhile",
    ],
  },
  notes: [...GRAPH_NOTES, ...QUEUE_NOTES, ARRAY_NOTE],
  question:
    "次のプログラムは、幅優先探索によって、迷路の部屋 1 からゴールの部屋 9 までの最短経路を求め、その経路で通る部屋の番号を、部屋 9 から部屋 1 まで逆の順に配列 path の先頭から格納する。最短経路とは、隣の部屋へ 1 部屋進むことを 1 手として、手数が最も少ない経路である。prev[i] には、部屋 1 から部屋 i への最短経路（複数あるときはそのうちの 1 つ）で、部屋 i の 1 つ前に通る部屋の番号を格納する。prev[1] には －1 を格納し、prev の値が 0 の部屋は、まだ 1 つ前の部屋が決まっていない部屋を表す。この迷路では、部屋 1 から部屋 9 への最短経路はただ 1 つであり、どの部屋にも部屋 1 から行くことができる。\nプログラム中の ［a］ と ［b］ に入れる正しい答えの組合せはどれか。",
  answerType: "blank",
  blanks: ["a", "b"],
  choices: [
    { ...choice10("v", "prev[v]"), correct: true },
    {
      ...choice10("w", "prev[v]"),
      wrongFeedback: "prev[w] に w 自身を入れると、部屋 9 の 1 つ前が 9 になり、21行目で v がずっと 9 のままになって path に入りきらなくなります。w の 1 つ前の部屋は、w を見つけたときにいる部屋 v です。",
      events: maze10Run("w", "prev[v]"),
    },
    {
      ...choice10("v", "prev[n]"),
      wrongFeedback: "n は path に入れた個数で、部屋の番号ではありません。1 回目は prev[1]＝－1 を v に入れるので、部屋 9 だけ入れて終わってしまいます。今いる部屋 v の 1 つ前は prev[v] です。",
      events: maze10Run("v", "prev[n]"),
    },
    {
      ...choice10("k", "prev[v]"),
      wrongFeedback: "k は「v の何番目の隣か」を表す数で、部屋の番号ではありません。1 つ前の部屋の番号にならないので、たどる道が最短経路になりません。",
      events: maze10Run("k", "prev[v]"),
    },
  ],
  events: [...maze10Run("v", "prev[v]"), end()],
  expectedFinal: { arrays: { path: PATH10 } },
  hints: [
    "部屋 1 を取り出すと、隣の部屋 4 が見つかります。部屋 4 へは部屋 1 から来たので、prev[4] は 1（そのときの v）にしたい値です。",
    "幅優先探索で初めて見つけたときの v が、最短経路での 1 つ前の部屋です。ゴールの 9 から、prev をたどって 1 つ前、また 1 つ前…と戻ると部屋 1 に着き、その次は prev[1]＝－1 で終わります。",
    "［a］ は v、［b］ は prev[v]。path は 9 から始まり、1 で終わります。",
  ],
  explanation: {
    why: `部屋 w を初めて見つけたときにいる部屋 v が、最短経路での w の 1 つ前の部屋なので、prev[w] ← v とします。ゴールの 9 から v ← prev[v] で 1 つ前の部屋をたどり、部屋 1 の次は prev[1]＝－1 で終わります。path＝${lit(PATH10)} です。`,
    trace: [
      { line: 12, state: `prev=${lit(I10.prev)}` },
      { line: 20, state: "path[1]=9 → prev[9]=6" },
      { line: 20, state: "6 → 3 → 2 → 5 → 4 → 1" },
      { line: 21, state: "prev[1]=－1 で終わる" },
    ],
    points: ["見つけたときの 1 つ前の部屋を覚えておくと、あとから経路を逆にたどれる", "ゴールから prev をたどると、経路は逆の順に得られる"],
  },
};

const MAZE_STAGES = [maze1, maze2, maze3, maze4, maze5, maze6, maze7, maze8, maze9, maze10];
// ⑨ は実演が長いので、繰り返しの 2 周目からは自動で速くする（runner.js の loopBoostPlan）
for (const s of MAZE_STAGES) s.autoFast = true;

export default MAZE_STAGES;
