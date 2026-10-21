// ⑧ rec（繰り返し呼び出す）
// 呼び出すたびに 1 つ下の階へ下り（call）、戻り値を持って上の階へ戻る（return）。引数・局所変数は階ごとの箱（n@2 など）。
// 式の答えはここで計算して書く（再帰をそのまま JS の再帰で組み立てる。インタプリタではない）。
import { line, end, emote, builder, mkField, spawnOnPad, takeCopy, put, calc, pickup, store } from "./helpers.js";

let uid = 0;
const U = (p) => `${p}u${++uid}`;
const callE = (label) => ({ type: "call", label });
const retE = () => ({ type: "return" });
const error = (reason) => [emote("think"), { type: "fail", kind: "error", reason }];
const endless = (what) => error(`呼び出しが終わらない…（${what}）`);

/**
 * 再帰のフィールド。上から メイン（globals の箱）、1段目、2段目…の階。各階の左 2 マスに札、x＝2 に変数の箱、x＝3 が階段。
 * locals が 2 つの関数は、1 つの階を 2 行にする。array を渡すと一番下の行に置く。
 */
function recField({ globals = [], locals = [], depth, array = null }) {
  const hm = Math.max(1, globals.length);
  const hl = Math.max(1, locals.length);
  const floorRows = hm + depth * hl;
  const rows = Math.max(5, floorRows + (array ? 2 : 0));
  const cols = 9;
  const tiles = Array.from({ length: rows }, (_, y) => (y < floorRows ? "  " + ".".repeat(cols - 2) : ".".repeat(cols)));
  const floors = [{ depth: 0, y: 0, h: hm, stand: { x: 3, y: 0 }, label: "メイン" }];
  const boxes = globals.map((g, i) => ({ var: g, x: 2, y: i, access: { x: 3, y: i } }));
  for (let d = 1; d <= depth; d++) {
    const y = hm + (d - 1) * hl;
    floors.push({ depth: d, y, h: hl, stand: { x: 3, y } });
    locals.forEach((name, i) => boxes.push({ var: `${name}@${d}`, label: name, x: 2, y: y + i, access: { x: 3, y: y + i } }));
  }
  return mkField({
    cols,
    rows,
    tiles,
    start: { x: 3, y: 0, dir: "right" },
    spawn: { x: 6, y: 2 },
    floors,
    boxes,
    arrays: array ? [{ name: array.name, x: 1, y: rows - 1, values: array.values, access: "up" }] : [],
    pads: [
      { kind: "calc", x: 7, y: 1, access: { x: 6, y: 1 } },
      { kind: "compare", x: 7, y: 3, access: { x: 6, y: 3 } },
    ],
  });
}

/** 呼び出し：最初の引数は呼び出し元で計算して持ったまま下り、下の階の箱に入れる。2 つ目からは下りてから運ぶ */
function invoke(d, label, args) {
  const ev = [];
  const a0 = args[0].h();
  ev.push(...a0.ev, callE(label), store(a0.id, `${args[0].param}@${d + 1}`));
  for (const a of args.slice(1)) {
    const h = a.h();
    ev.push(...h.ev, store(h.id, `${a.param}@${d + 1}`));
  }
  return ev;
}

/** 持っている戻り値を計算台に置き、ほかの材料と計算して、答えを持つ */
function useHeld(heldId, others, expr, result) {
  const ev = [put(heldId, "calc")];
  for (const o of others) {
    if (typeof o === "number") ev.push(spawnOnPad(U("k"), o, "calc"));
    else {
      const c = U("c");
      ev.push(takeCopy(o, c), put(c, "calc"));
    }
  }
  const r = U("r");
  ev.push(calc(expr, result, r), pickup(r));
  return { ev, id: r };
}

const FUNC_NOTE = "関数を呼び出すと，その関数の処理が最初から実行され，return で値を返すと呼び出し元に戻る。呼び出しごとに，引数と変数は別々に用意される。";

// ---- rec-1：何回呼び出す？（手続） ----
const F1 = recField({ globals: ["cnt"], locals: ["n"], depth: 4 });
function rec1Events() {
  const B = builder(F1);
  let cnt = 0;
  const f = (d, n) => {
    const ev = [line(2)];
    cnt += 1;
    ev.push(line(3), ...B.calc("cnt", ["cnt", 1], "cnt ＋ 1", cnt), line(4), ...B.cmp([`n@${d}`, 1], `${n} ＞ 1`, n > 1));
    if (n > 1) ev.push(line(5), ...invoke(d, `f(${n - 1})`, [{ param: "n", h: () => B.holdCalc([`n@${d}`, 1], "n － 1", n - 1) }]), ...f(d + 1, n - 1));
    ev.push(line(6), retE());
    return ev;
  };
  return [line(1), ...B.set("cnt", 0), line(7), ...invoke(0, "f(4)", [{ param: "n", h: () => B.holdSet(4) }]), ...f(1, 4)];
}

const rec1 = {
  id: "rec-1",
  genre: "rec",
  level: 1,
  title: "何回呼び出す？",
  concepts: ["recursion", "call"],
  intro: "関数の中で、その関数自身を呼び出すことを「再帰」というよ。\n呼び出すたびに 1 つ下の階へ。終わったら上の階へ戻るよ。",
  field: F1,
  vars: {},
  varColors: { cnt: "#66BB6A", n: "#4FC3F7" },
  program: {
    ja: [
      "整数の変数 cnt を用意して、0 を入れる",
      "手続 f（整数の引数 n を受け取る）の始まり",
      "  cnt を 1 増やす",
      "  もし n が 1 より大きいなら、5行目を実行する",
      "    n － 1 を引数にして f を呼び出す",
      "  （ここで分かれ道は終わり。f の終わり：呼び出し元に戻る）",
      "4 を引数にして f を呼び出す",
    ],
    code: ["整数型: cnt ← 0", "○f(整数型: n)", "  cnt ← cnt ＋ 1", "  if (n が 1 より大きい)", "    f(n － 1)", "  endif", "f(4)"],
  },
  notes: [FUNC_NOTE, "手続 f は，最後の行まで実行すると呼び出し元に戻る。"],
  question: "プログラムを実行し終わったときの cnt の値はどれか。",
  answerType: "vars",
  choices: [
    { ja: "cnt は 4", code: "cnt = 4", correct: true },
    {
      ja: "cnt は 3",
      code: "cnt = 3",
      wrongFeedback: "f(1) を呼び出したときも、3行目で cnt を 1 増やします。n が 1 より大きくないので、それ以上は呼び出さないだけです。",
      stop: { line: 3, nth: 4 },
    },
    {
      ja: "cnt は 1",
      code: "cnt = 1",
      wrongFeedback: "5行目で、f の中から f(n － 1) を呼び出します。呼び出された f でも、また 3行目から実行します。",
      stop: { line: 5, mark: [5] },
    },
    {
      ja: "cnt は 10",
      code: "cnt = 10",
      wrongFeedback: "3行目は cnt を 1 増やすだけです。n の値（4、3、2、1）を足すのではありません。",
      stop: { line: 3, nth: 2, mark: [3] },
    },
  ],
  events: [...rec1Events(), end()],
  expectedFinal: { vars: { cnt: 4 } },
  hints: [
    "7行目で f(4) を呼び出します。f(4) の中で cnt＝1 になり、4 は 1 より大きいので f(3) を呼び出します。",
    "f(3)、f(2) と呼び出していき、f(1) では n が 1 より大きくないので、それ以上は呼び出しません。でも cnt は増えます。",
    "f(4)、f(3)、f(2)、f(1) の 4 回呼び出されます。",
  ],
  explanation: {
    why: "f(4) → f(3) → f(2) → f(1) と、1 段ずつ深く呼び出します。どの呼び出しでも最初に cnt を 1 増やすので、cnt＝4 です。f(1) では n が 1 より大きくないので呼び出しを止め、そこから順に呼び出し元へ戻ります。",
    trace: [
      { line: 3, state: "f(4)：cnt=1" },
      { line: 3, state: "f(3)：cnt=2" },
      { line: 3, state: "f(2)：cnt=3" },
      { line: 3, state: "f(1)：cnt=4（ここで呼び出しは止まる）" },
    ],
    points: ["再帰は、関数の中で同じ関数を呼び出す", "呼び出しを止める条件（ここでは n が 1 のとき）がないと、いつまでも終わらない"],
  },
};

// ---- rec-2：階乗 ----
const F2 = recField({ globals: ["x"], locals: ["n"], depth: 3 });
function rec2Events() {
  const B = builder(F2);
  const f = (d, n) => {
    const ev = [line(1), line(2), ...B.cmp([`n@${d}`, 1], `${n} ＝ 1`, n === 1)];
    if (n === 1) {
      const h = B.holdSet(1);
      return { ev: [...ev, line(3), ...h.ev, retE()], id: h.id, value: 1 };
    }
    ev.push(line(4), line(5), ...invoke(d, `f(${n - 1})`, [{ param: "n", h: () => B.holdCalc([`n@${d}`, 1], "n － 1", n - 1) }]));
    const sub = f(d + 1, n - 1);
    const u = useHeld(sub.id, [`n@${d}`], `${n} × ${sub.value}`, n * sub.value);
    return { ev: [...ev, ...sub.ev, ...u.ev, retE()], id: u.id, value: n * sub.value };
  };
  const top = f(1, 3);
  return [line(6), ...invoke(0, "f(3)", [{ param: "n", h: () => B.holdSet(3) }]), ...top.ev, store(top.id, "x")];
}

const rec2 = {
  id: "rec-2",
  genre: "rec",
  level: 2,
  title: "戻りながら掛ける",
  concepts: ["recursion", "return", "factorial"],
  field: F2,
  vars: {},
  varColors: { x: "#66BB6A", n: "#4FC3F7" },
  program: {
    ja: [
      "関数 f（整数の引数 n を受け取り、整数を返す）の始まり",
      "  もし n が 1 と等しいなら、3行目を実行する",
      "    1 を結果として返す",
      "  （ここで分かれ道は終わり）",
      "  n － 1 を引数にして f を呼び出し、その結果に n を掛けた値を返す",
      "整数の変数 x を用意して、3 を引数にして f を呼び出した結果を入れる",
    ],
    code: ["○整数型: f(整数型: n)", "  if (n が 1 と等しい)", "    return 1", "  endif", "  return n × f(n － 1)", "整数型: x ← f(3)"],
  },
  notes: [FUNC_NOTE],
  question: "プログラムを実行し終わったときの x の値はどれか。",
  answerType: "vars",
  choices: [
    { ja: "x は 6", code: "x = 6", correct: true },
    {
      ja: "x は 1",
      code: "x = 1",
      wrongFeedback: "f(1) が返す 1 は、呼び出し元の f(2) に戻ります。f(2) はそれに 2 を掛けて f(3) に返し、f(3) はさらに 3 を掛けて x に返します。",
      stop: { line: 3, mark: [3, 5] },
    },
    {
      ja: "x は 3",
      code: "x = 3",
      wrongFeedback: "5行目は n だけを返すのではなく、f(n － 1) の結果に n を掛けた値を返します。f(3) が返すのは 3 × f(2) です。",
      stop: { line: 5, mark: [5] },
    },
    {
      ja: "x は 2",
      code: "x = 2",
      wrongFeedback: "2 は f(2) の戻り値です。f(3) は、その 2 に自分の n（3）を掛けた値を返します。",
      stop: { line: 3, mark: [5] },
    },
  ],
  events: [...rec2Events(), end()],
  expectedFinal: { vars: { x: 6 } },
  hints: [
    "f(3) は 3 × f(2) を返そうとしますが、そのためにまず f(2) を呼び出します。f(2) も 2 × f(1) のために f(1) を呼び出します。",
    "f(1) は 1 を返します。そこから、戻りながら掛け算をしていきます。",
    "f(2) は 2 × 1 ＝ 2 を返し、f(3) は 3 × 2 を返します。",
  ],
  explanation: {
    why: "f(3) → f(2) → f(1) と呼び出し、f(1) が 1 を返します。f(2) は 2 × 1 ＝ 2、f(3) は 3 × 2 ＝ 6 を返します。掛け算は、呼び出しから戻るときに深い方から順に行われます。f(n) は n の階乗です。",
    trace: [
      { line: 3, state: "f(1) が 1 を返す" },
      { line: 5, state: "f(2) が 2 × 1 = 2 を返す" },
      { line: 5, state: "f(3) が 3 × 2 = 6 を返す" },
    ],
    points: ["return n × f(n － 1) は、f(n － 1) が戻ってきてから掛け算をする", "戻り値は 1 つ上の階（呼び出し元）に渡される"],
  },
};

// ---- rec-3：2 ずつ減らして足す ----
const F3 = recField({ globals: ["x"], locals: ["n"], depth: 4 });
function rec3Events() {
  const B = builder(F3);
  const s = (d, n) => {
    const ev = [line(1), line(2), ...B.cmp([`n@${d}`, 1], `${n} ≦ 1`, n <= 1)];
    if (n <= 1) {
      const h = B.holdCopy(`n@${d}`);
      return { ev: [...ev, line(3), ...h.ev, retE()], id: h.id, value: n };
    }
    ev.push(line(4), line(5), ...invoke(d, `s(${n - 2})`, [{ param: "n", h: () => B.holdCalc([`n@${d}`, 2], "n － 2", n - 2) }]));
    const sub = s(d + 1, n - 2);
    const u = useHeld(sub.id, [`n@${d}`], `${n} ＋ ${sub.value}`, n + sub.value);
    return { ev: [...ev, ...sub.ev, ...u.ev, retE()], id: u.id, value: n + sub.value };
  };
  const top = s(1, 6);
  return [line(6), ...invoke(0, "s(6)", [{ param: "n", h: () => B.holdSet(6) }]), ...top.ev, store(top.id, "x")];
}

const rec3 = {
  id: "rec-3",
  genre: "rec",
  level: 3,
  title: "2 つずつ減らして足す",
  concepts: ["recursion", "return", "sum"],
  field: F3,
  vars: {},
  varColors: { x: "#66BB6A", n: "#4FC3F7" },
  program: {
    ja: [
      "関数 s（整数の引数 n を受け取り、整数を返す）の始まり",
      "  もし n が 1 以下なら、3行目を実行する",
      "    n の値を結果として返す",
      "  （ここで分かれ道は終わり）",
      "  n － 2 を引数にして s を呼び出し、その結果に n を足した値を返す",
      "整数の変数 x を用意して、6 を引数にして s を呼び出した結果を入れる",
    ],
    code: ["○整数型: s(整数型: n)", "  if (n が 1 以下)", "    return n", "  endif", "  return n ＋ s(n － 2)", "整数型: x ← s(6)"],
  },
  notes: [FUNC_NOTE],
  question: "プログラムを実行し終わったときの x の値はどれか。",
  answerType: "vars",
  choices: [
    { ja: "x は 12", code: "x = 12", correct: true },
    {
      ja: "x は 21",
      code: "x = 21",
      wrongFeedback: "5行目で呼び出すのは s(n － 2) です。n は 6、4、2、0 と 2 ずつ減ります。1 ずつではありません。",
      stop: { line: 5, mark: [5] },
    },
    {
      ja: "x は 13",
      code: "x = 13",
      wrongFeedback: "3行目は n の値を返します。s(0) では n＝0 なので、返すのは 0 です（1 ではありません）。",
      stop: { line: 3, mark: [3] },
    },
    {
      ja: "x は 10",
      code: "x = 10",
      wrongFeedback: "2行目は「n が 1 以下」です。s(2) では 2 は 1 以下ではないので、さらに s(0) を呼び出して、2 ＋ s(0) を返します。",
      stop: { line: 2, nth: 3, mark: [2] },
    },
  ],
  events: [...rec3Events(), end()],
  expectedFinal: { vars: { x: 12 } },
  hints: [
    "s(6) は 6 ＋ s(4) を返すために、s(4) を呼び出します。s(4) は 4 ＋ s(2) のために s(2) を呼び出します。",
    "呼び出しを止めるのは n が 1 以下のときで、そのとき n をそのまま返します。s(2) は s(0) を呼び出します。",
    "s(0) は 0 を返します。s(2)、s(4)、s(6) が返す値を順に求めよう。",
  ],
  explanation: {
    why: "s(6) → s(4) → s(2) → s(0) と呼び出し、s(0) が 0 を返します。戻りながら s(2)＝2＋0＝2、s(4)＝4＋2＝6、s(6)＝6＋6＝12 を返します。6 以下の偶数の和です。",
    trace: [
      { line: 3, state: "s(0) が 0 を返す" },
      { line: 5, state: "s(2) が 2 + 0 = 2 を返す" },
      { line: 5, state: "s(4) が 4 + 2 = 6 を返す" },
      { line: 5, state: "s(6) が 6 + 6 = 12 を返す" },
    ],
    points: ["呼び出しの引数（n － 2）で、どの値の順に呼び出されるかが決まる", "止まる条件（n が 1 以下）と、そのときの戻り値（n）を正確に読む"],
  },
};

// ---- rec-4：フィボナッチ ----
const F4 = recField({ globals: ["cnt", "x"], locals: ["n", "t"], depth: 4 });
function rec4Events() {
  const B = builder(F4);
  let cnt = 0;
  const fib = (d, n) => {
    cnt += 1;
    const ev = [line(2), line(3), ...B.calc("cnt", ["cnt", 1], "cnt ＋ 1", cnt), line(4), ...B.cmp([`n@${d}`, 1], `${n} ≦ 1`, n <= 1)];
    if (n <= 1) {
      const h = B.holdCopy(`n@${d}`);
      return { ev: [...ev, line(5), ...h.ev, retE()], id: h.id, value: n };
    }
    ev.push(line(6), line(7), ...invoke(d, `fib(${n - 1})`, [{ param: "n", h: () => B.holdCalc([`n@${d}`, 1], "n － 1", n - 1) }]));
    const s1 = fib(d + 1, n - 1);
    ev.push(...s1.ev, store(s1.id, `t@${d}`)); // 1 つ目の戻り値を、2 つ目を呼び出すあいだ t に置いておく
    ev.push(...invoke(d, `fib(${n - 2})`, [{ param: "n", h: () => B.holdCalc([`n@${d}`, 2], "n － 2", n - 2) }]));
    const s2 = fib(d + 1, n - 2);
    const u = useHeld(s2.id, [`t@${d}`], `${s1.value} ＋ ${s2.value}`, s1.value + s2.value);
    return { ev: [...ev, ...s2.ev, ...u.ev, retE()], id: u.id, value: s1.value + s2.value };
  };
  const ev = [line(1), ...B.set("cnt", 0), line(8), ...invoke(0, "fib(4)", [{ param: "n", h: () => B.holdSet(4) }])];
  const top = fib(1, 4);
  return [...ev, ...top.ev, store(top.id, "x")];
}

const rec4 = {
  id: "rec-4",
  genre: "rec",
  level: 4,
  title: "2 回呼び出すフィボナッチ",
  concepts: ["recursion", "fibonacci", "count"],
  field: F4,
  vars: {},
  varColors: { cnt: "#F06292", x: "#66BB6A", n: "#4FC3F7", t: "#B0BEC5" },
  program: {
    ja: [
      "整数の変数 cnt を用意して、0 を入れる",
      "関数 fib（整数の引数 n を受け取り、整数を返す）の始まり",
      "  cnt を 1 増やす",
      "  もし n が 1 以下なら、5行目を実行する",
      "    n の値を結果として返す",
      "  （ここで分かれ道は終わり）",
      "  n － 1 と n － 2 をそれぞれ引数にして fib を呼び出し、2 つの結果を足した値を返す",
      "整数の変数 x を用意して、4 を引数にして fib を呼び出した結果を入れる",
    ],
    code: [
      "整数型: cnt ← 0",
      "○整数型: fib(整数型: n)",
      "  cnt ← cnt ＋ 1",
      "  if (n が 1 以下)",
      "    return n",
      "  endif",
      "  return fib(n － 1) ＋ fib(n － 2)",
      "整数型: x ← fib(4)",
    ],
  },
  notes: [FUNC_NOTE, "7行目では，先に fib(n － 1) を，次に fib(n － 2) を呼び出す。フィールドの箱 t は，fib(n － 1) の戻り値を，fib(n － 2) を呼び出しているあいだ置いておく場所である。"],
  question: "プログラムを実行し終わったときの x と cnt の値の組合せはどれか。",
  answerType: "vars",
  choices: [
    { ja: "x は 3、cnt は 9", code: "x = 3, cnt = 9", correct: true },
    {
      ja: "x は 3、cnt は 5",
      code: "x = 3, cnt = 5",
      wrongFeedback: "同じ引数の呼び出しも、そのたびに数えます。fib(2) は 2 回、fib(1) は 3 回、fib(0) は 2 回呼び出されます。",
      stop: { line: 3, nth: 6, mark: [3, 7] },
    },
    {
      ja: "x は 3、cnt は 4",
      code: "x = 3, cnt = 4",
      wrongFeedback: "4 は一番深い階までの段数です。7行目は 1 回の呼び出しの中で fib を 2 回呼び出すので、戻ったあとにも呼び出しが続きます。",
      stop: { line: 3, nth: 5, mark: [7] },
    },
    {
      ja: "x は 5、cnt は 9",
      code: "x = 5, cnt = 9",
      wrongFeedback: "5行目は n の値を返すので、fib(0) は 0、fib(1) は 1 を返します。fib(0) を 1 としていませんか？",
      stop: { line: 5, nth: 2, mark: [5] },
    },
  ],
  events: [...rec4Events(), end()],
  expectedFinal: { vars: { x: 3, cnt: 9 } },
  hints: [
    "fib(4) は fib(3) と fib(2) を呼び出し、fib(3) は fib(2) と fib(1) を呼び出します。呼び出しの木を書いてみよう。",
    "n が 1 以下なら n を返すので、fib(1)＝1、fib(0)＝0 です。cnt は呼び出しのたびに 1 増えます。",
    "fib(2)＝1、fib(3)＝2、fib(4)＝3。呼び出しは fib(4)、fib(3)、fib(2)、fib(1)、fib(0)、fib(1)、fib(2)、fib(1)、fib(0) です。",
  ],
  explanation: {
    why: "fib(4) は fib(3) と fib(2)、fib(3) は fib(2) と fib(1)、fib(2) は fib(1) と fib(0) を呼び出します。同じ fib(2) が 2 回呼び出されるので、呼び出しは全部で 9 回（cnt＝9）。戻り値は fib(2)＝1＋0＝1、fib(3)＝1＋1＝2、fib(4)＝2＋1＝3 です。",
    trace: [
      { line: 7, state: "fib(2) が 1 + 0 = 1 を返す" },
      { line: 7, state: "fib(3) が 1 + 1 = 2 を返す" },
      { line: 7, state: "fib(2)（2回目）が 1 を返す" },
      { line: 7, state: "fib(4) が 2 + 1 = 3 を返す（cnt=9）" },
    ],
    points: ["1 回の呼び出しの中で 2 回呼び出すと、呼び出しの数は木のように増える", "同じ引数の呼び出しも、そのたびに最初から計算する"],
  },
};

// ---- rec-5：書き込む順番（2 つの呼び出しの間で書く） ----
const F5 = recField({ globals: ["k"], locals: ["n"], depth: 4, array: { name: "out", values: [0, 0, 0, 0] } });
function rec5Events() {
  const B = builder(F5);
  let k = 0;
  const p = (d, n) => {
    const ev = [line(3), line(4), ...B.cmp([`n@${d}`, 0], `${n < 0 ? `－${-n}` : n} ＞ 0`, n > 0)];
    if (n > 0) {
      ev.push(line(5), ...invoke(d, `p(${n - 1})`, [{ param: "n", h: () => B.holdCalc([`n@${d}`, 1], "n － 1", n - 1) }]), ...p(d + 1, n - 1));
      k += 1;
      ev.push(line(6), ...B.calc("k", ["k", 1], "k ＋ 1", k), line(7), ...B.copy(`out[${k}]`, `n@${d}`));
      const m = n - 2;
      ev.push(line(8), ...invoke(d, `p(${m < 0 ? `－${-m}` : m})`, [{ param: "n", h: () => B.holdCalc([`n@${d}`, 2], "n － 2", m) }]), ...p(d + 1, m));
    }
    ev.push(line(9), retE());
    return ev;
  };
  return [line(1), line(2), ...B.set("k", 0), line(10), ...invoke(0, "p(3)", [{ param: "n", h: () => B.holdSet(3) }]), ...p(1, 3)];
}

const rec5 = {
  id: "rec-5",
  genre: "rec",
  level: 5,
  title: "書き込む順番",
  concepts: ["recursion", "order", "array"],
  field: F5,
  vars: {},
  varColors: { out: "#FFA726", k: "#66BB6A", n: "#4FC3F7" },
  program: {
    ja: [
      "整数の配列 out を用意して、{0, 0, 0, 0} を入れる",
      "整数の変数 k を用意して、0 を入れる",
      "手続 p（整数の引数 n を受け取る）の始まり",
      "  もし n が 0 より大きいなら、5〜8行目を実行する",
      "    n － 1 を引数にして p を呼び出す",
      "    k を 1 増やす",
      "    n の値を out の k番目に入れる",
      "    n － 2 を引数にして p を呼び出す",
      "  （ここで分かれ道は終わり。p の終わり：呼び出し元に戻る）",
      "3 を引数にして p を呼び出す",
    ],
    code: [
      "整数型の配列: out ← {0, 0, 0, 0}",
      "整数型: k ← 0",
      "○p(整数型: n)",
      "  if (n が 0 より大きい)",
      "    p(n － 1)",
      "    k ← k ＋ 1",
      "    out[k] ← n",
      "    p(n － 2)",
      "  endif",
      "p(3)",
    ],
  },
  notes: [FUNC_NOTE, "手続 p は，最後の行まで実行すると呼び出し元に戻る。", "配列の要素番号は 1 から始まる。"],
  question: "プログラムを実行し終わったときの配列 out の内容はどれか。",
  answerType: "arrays",
  choices: [
    { ja: "out は {1, 2, 3, 1}", code: "out = {1, 2, 3, 1}", correct: true },
    {
      ja: "out は {3, 2, 1, 1}",
      code: "out = {3, 2, 1, 1}",
      wrongFeedback: "6〜7行目の書き込みは、5行目の p(n － 1) から戻ってきた後です。p(3) が 3 を書くのは、p(2) の中の処理（2 や 1 の書き込み）が全部終わってからです。",
      stop: { line: 5, mark: [5, 6, 7] },
    },
    {
      ja: "out は {1, 2, 3, 0}",
      code: "out = {1, 2, 3, 0}",
      wrongFeedback: "書き込んだ後に 8行目で p(n － 2) も呼び出します。p(3) の中の p(1) で、もう一度 1 が書き込まれます。",
      stop: { line: 8, nth: 3, mark: [8] },
    },
    {
      ja: "out は {1, 2, 1, 3}",
      code: "out = {1, 2, 1, 3}",
      wrongFeedback: "8行目の p(n － 2) は、6〜7行目の書き込みの後に呼び出します。p(3) では、先に 3 を書いてから p(1) を呼び出します。",
      stop: { line: 8, nth: 3, mark: [6, 7, 8] },
    },
  ],
  events: [...rec5Events(), end()],
  expectedFinal: { arrays: { out: [1, 2, 3, 1] } },
  hints: [
    "p(3) は、まず p(2) を呼び出します。p(2) は p(1)、p(1) は p(0) を呼び出し、p(0) は何もせずに戻ります。",
    "書き込みは、p(n － 1) から戻ってきた後、p(n － 2) を呼び出す前です。最初に書き込むのは p(1) の 1 です。",
    "p(1) が 1、p(2) が 2、p(3) が 3 を書きます。そのあと p(3) は p(1) を呼び出します。",
  ],
  explanation: {
    why: "p(3) → p(2) → p(1) → p(0) と下りて、p(0) は何もせず戻ります。p(1) が 1 を書いて p(－1) を呼び出し（何もしない）、戻ります。p(2) が 2 を書いて p(0) を呼び出し、戻ります。p(3) が 3 を書いて p(1) を呼び出し、p(1) がもう一度 1 を書きます。out＝{1, 2, 3, 1} です。",
    trace: [
      { line: 7, state: "p(1)：out[1]=1" },
      { line: 7, state: "p(2)：out[2]=2" },
      { line: 7, state: "p(3)：out[3]=3" },
      { line: 7, state: "p(3) の中の p(1)：out[4]=1" },
    ],
    points: ["再帰呼び出しの前に書くか後に書くかで、書き込む順番が変わる", "1 回の呼び出しの中に呼び出しが 2 つあるときは、1 つ目の呼び出しの中身が全部終わってから、間の処理と 2 つ目の呼び出しに進む"],
  },
};

// ================= 6〜10：穴埋め =================
// 空欄の記号 a・b と まぎれないよう、穴埋めの問題では 変数名・配列名に a・b を使わない。
// 誤答は、その選択肢を空欄に入れたプログラムを実行して見せる。止まらない再帰になる誤答は、一番下の階まで呼び出したところで止める。

// ---- rec-6：階乗の止まるときの値 ----
const F6 = recField({ globals: ["x"], locals: ["n"], depth: 4 });
const BASE6 = { 1: 1, 0: 0, 2: 2, "－1": -1 };
function rec6Run(fill) {
  const B = builder(F6);
  const base = BASE6[fill];
  const f = (d, n) => {
    const ev = [line(1), line(2), ...B.cmp([`n@${d}`, 0], `${n} ＝ 0`, n === 0)];
    if (n === 0) {
      const h = B.holdSet(base);
      return { ev: [...ev, line(3), ...h.ev, retE()], id: h.id, value: base };
    }
    ev.push(line(4), line(5), ...invoke(d, `f(${n - 1})`, [{ param: "n", h: () => B.holdCalc([`n@${d}`, 1], "n － 1", n - 1) }]));
    const sub = f(d + 1, n - 1);
    const v = n * sub.value;
    const u = useHeld(sub.id, [`n@${d}`], `${n} × ${sub.value < 0 ? `(－${-sub.value})` : sub.value}`, v);
    return { ev: [...ev, ...sub.ev, ...u.ev, retE()], id: u.id, value: v };
  };
  const top = f(1, 3);
  return [line(6), ...invoke(0, "f(3)", [{ param: "n", h: () => B.holdSet(3) }]), ...top.ev, store(top.id, "x")];
}

const rec6 = {
  id: "rec-6",
  genre: "rec",
  level: 6,
  title: "止まるときの値の穴",
  concepts: ["recursion", "factorial", "blank"],
  intro: "ここからは穴埋め問題。［a］ に入るものを選ぼう。\n「ここまで進める」は、穴の手前まで使えるよ。",
  field: F6,
  vars: {},
  varColors: { x: "#66BB6A", n: "#4FC3F7" },
  program: {
    ja: [
      "関数 f（整数の引数 n を受け取り、整数を返す）の始まり",
      "  もし n が 0 と等しいなら、3行目を実行する",
      "    ［a］ を結果として返す",
      "  （ここで分かれ道は終わり）",
      "  n － 1 を引数にして f を呼び出し、その結果に n を掛けた値を返す",
      "整数の変数 x を用意して、3 を引数にして f を呼び出した結果を入れる",
    ],
    code: ["○整数型: f(整数型: n)", "  if (n が 0 と等しい)", "    return ［a］", "  endif", "  return n × f(n － 1)", "整数型: x ← f(3)"],
  },
  notes: [FUNC_NOTE],
  question:
    "次のプログラム中の関数 f は、0 以上の整数 n の階乗を返す。n の階乗は、n が 1 以上のときは 1 から n までの整数をすべて掛けた値であり、0 の階乗は 1 である。\nプログラム中の ［a］ に入れる正しい答えはどれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "1", code: "1", fill: { a: "1" }, correct: true },
    {
      ja: "0",
      code: "0",
      fill: { a: "0" },
      wrongFeedback: "f(0) が 0 を返すと、戻りながら掛ける値がすべて 0 になり、x＝0 になります。0 の階乗は 1 です。",
      events: rec6Run("0"),
    },
    {
      ja: "2",
      code: "2",
      fill: { a: "2" },
      wrongFeedback: "f(0) が 2 を返すと、全体が 2 倍になって x＝12 になります。何を掛けても変わらない 1 にします。",
      events: rec6Run("2"),
    },
    {
      ja: "－1",
      code: "－1",
      fill: { a: "－1" },
      wrongFeedback: "f(0) が －1 を返すと、x＝－6 になります。0 の階乗は 1 です。",
      events: rec6Run("－1"),
    },
  ],
  events: [...rec6Run("1"), end()],
  expectedFinal: { vars: { x: 6 } },
  hints: [
    "f(3) → f(2) → f(1) → f(0) と呼び出し、f(0) の戻り値から順に掛けていきます。",
    "問題文に「0 の階乗は 1」とあります。また、f(1) は 1 × f(0) なので、f(0) が 1 なら f(1)＝1 になります。",
    "［a］ は 1。x＝3 × 2 × 1 × 1 ＝ 6 です。",
  ],
  explanation: {
    why: "f(0) が返す値に、戻りながら 1、2、3 を掛けていくので、f(0) は掛けても変わらない 1（0 の階乗）を返します。x＝3 × 2 × 1 × 1 ＝ 6 です。",
    trace: [
      { line: 3, state: "f(0) が 1 を返す" },
      { line: 5, state: "f(1) が 1 × 1 = 1" },
      { line: 5, state: "f(2) が 2 × 1 = 2" },
      { line: 5, state: "f(3) が 3 × 2 = 6" },
    ],
    points: ["止まるときの戻り値（基底）は、問題の定義（0 の階乗は 1）から決める", "掛け算をつなぐときの最初の値は 1"],
  },
};

// ---- rec-7：和の呼び出しの引数 ----
const F7 = recField({ globals: ["x"], locals: ["n"], depth: 5 });
const ARG7 = { "n － 1": (n) => n - 1, n: (n) => n, "n ＋ 1": (n) => n + 1, "n － 2": (n) => n - 2 };
function rec7Run(fill) {
  const B = builder(F7);
  const DEPTH = 5;
  const s = (d, n) => {
    const ev = [line(1), line(2), ...B.cmp([`n@${d}`, 0], `${n} ＝ 0`, n === 0)];
    if (n === 0) {
      const h = B.holdSet(0);
      return { ev: [...ev, line(3), ...h.ev, retE()], id: h.id, value: 0 };
    }
    const m = ARG7[fill](n);
    ev.push(line(4), line(5));
    if (d >= DEPTH) return { ev: [...ev, ...endless("n が 0 にならない")], stop: true };
    ev.push(...invoke(d, `s(${m})`, [{ param: "n", h: () => (fill === "n" ? B.holdCopy(`n@${d}`) : B.holdCalc([`n@${d}`, fill === "n ＋ 1" ? 1 : fill === "n － 2" ? 2 : 1], fill, m)) }]));
    const sub = s(d + 1, m);
    if (sub.stop) return { ev: [...ev, ...sub.ev], stop: true };
    const u = useHeld(sub.id, [`n@${d}`], `${n} ＋ ${sub.value}`, n + sub.value);
    return { ev: [...ev, ...sub.ev, ...u.ev, retE()], id: u.id, value: n + sub.value };
  };
  const top = s(1, 4);
  const ev = [line(6), ...invoke(0, "s(4)", [{ param: "n", h: () => B.holdSet(4) }]), ...top.ev];
  return top.stop ? ev : [...ev, store(top.id, "x")];
}

const rec7 = {
  id: "rec-7",
  genre: "rec",
  level: 7,
  title: "呼び出す引数の穴",
  concepts: ["recursion", "sum", "blank"],
  field: F7,
  vars: {},
  varColors: { x: "#66BB6A", n: "#4FC3F7" },
  program: {
    ja: [
      "関数 s（整数の引数 n を受け取り、整数を返す）の始まり",
      "  もし n が 0 と等しいなら、3行目を実行する",
      "    0 を結果として返す",
      "  （ここで分かれ道は終わり）",
      "  ［a］ を引数にして s を呼び出し、その結果に n を足した値を返す",
      "整数の変数 x を用意して、4 を引数にして s を呼び出した結果を入れる",
    ],
    code: ["○整数型: s(整数型: n)", "  if (n が 0 と等しい)", "    return 0", "  endif", "  return n ＋ s(［a］)", "整数型: x ← s(4)"],
  },
  notes: [FUNC_NOTE],
  question: "次のプログラム中の関数 s は、0 以上の整数 n について、0 から n までの整数の和を返す。\nプログラム中の ［a］ に入れる正しい答えはどれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "n － 1", code: "n － 1", fill: { a: "n － 1" }, correct: true },
    {
      ja: "n",
      code: "n",
      fill: { a: "n" },
      wrongFeedback: "s(4) の中で、また s(4) を呼び出してしまい、n が 0 に近づかないので、呼び出しが終わりません。",
      events: rec7Run("n"),
    },
    {
      ja: "n ＋ 1",
      code: "n ＋ 1",
      fill: { a: "n ＋ 1" },
      wrongFeedback: "n が 5、6、7…と大きくなっていき、止まる条件（n が 0）にたどり着かないので、呼び出しが終わりません。",
      events: rec7Run("n ＋ 1"),
    },
    {
      ja: "n － 2",
      code: "n － 2",
      fill: { a: "n － 2" },
      wrongFeedback: "s(4) → s(2) → s(0) と 2 つずつ減るので、3 と 1 を足さず、x＝4＋2＋0＝6 になります。",
      events: rec7Run("n － 2"),
    },
  ],
  events: [...rec7Run("n － 1"), end()],
  expectedFinal: { vars: { x: 10 } },
  hints: [
    "s(n) は 0 から n までの和なので、n ＋（0 から n － 1 までの和）と考えられます。",
    "呼び出すたびに n が止まる条件（0）に 1 つずつ近づくようにします。",
    "［a］ は n － 1。s(4)＝4＋3＋2＋1＋0＝10 です。",
  ],
  explanation: {
    why: "0 から n までの和は「n ＋（0 から n － 1 までの和）」なので、n ＋ s(n － 1) を返します。n は 4、3、2、1、0 と 1 ずつ減って止まり、x＝4＋3＋2＋1＋0＝10 です。",
    trace: [
      { line: 3, state: "s(0) が 0 を返す" },
      { line: 5, state: "s(1)=1, s(2)=3, s(3)=6" },
      { line: 5, state: "s(4) が 4 + 6 = 10 を返す" },
    ],
    points: ["再帰の引数は、止まる条件に必ず近づくようにする", "「n までの和」＝ n ＋「n － 1 までの和」と、小さい同じ問題に分ける"],
  },
};

// ---- rec-8：べき乗 ----
const F8 = recField({ globals: ["x", "p"], locals: ["n"], depth: 4 });
function rec8Run(fill) {
  const B = builder(F8);
  const DEPTH = 4;
  const pw = (d, n) => {
    const ev = [line(2), line(3), ...B.cmp([`n@${d}`, 0], `${n} ＝ 0`, n === 0)];
    if (n === 0) {
      const h = B.holdSet(1);
      return { ev: [...ev, line(4), ...h.ev, retE()], id: h.id, value: 1 };
    }
    const m = fill === "x × pw(n)" ? n : n - 1;
    ev.push(line(5), line(6));
    if (d >= DEPTH) return { ev: [...ev, ...endless("n が 0 にならない")], stop: true };
    ev.push(...invoke(d, `pw(${m})`, [{ param: "n", h: () => (m === n ? B.holdCopy(`n@${d}`) : B.holdCalc([`n@${d}`, 1], "n － 1", m)) }]));
    const sub = pw(d + 1, m);
    if (sub.stop) return { ev: [...ev, ...sub.ev], stop: true };
    let u;
    let v;
    if (fill === "pw(n － 1)") return { ev: [...ev, ...sub.ev, retE()], id: sub.id, value: sub.value };
    if (fill === "x ＋ pw(n － 1)") {
      v = 2 + sub.value;
      u = useHeld(sub.id, ["x"], `2 ＋ ${sub.value}`, v);
    } else {
      v = 2 * sub.value;
      u = useHeld(sub.id, ["x"], `2 × ${sub.value}`, v);
    }
    return { ev: [...ev, ...sub.ev, ...u.ev, retE()], id: u.id, value: v };
  };
  const ev = [line(1), ...B.set("x", 2), line(7), ...invoke(0, "pw(3)", [{ param: "n", h: () => B.holdSet(3) }])];
  const top = pw(1, 3);
  return top.stop ? [...ev, ...top.ev] : [...ev, ...top.ev, store(top.id, "p")];
}

const rec8 = {
  id: "rec-8",
  genre: "rec",
  level: 8,
  title: "べき乗の穴",
  concepts: ["recursion", "power", "blank"],
  field: F8,
  vars: {},
  varColors: { x: "#FFB74D", p: "#66BB6A", n: "#4FC3F7" },
  program: {
    ja: [
      "整数の変数 x を用意して、2 を入れる",
      "関数 pw（整数の引数 n を受け取り、整数を返す）の始まり",
      "  もし n が 0 と等しいなら、4行目を実行する",
      "    1 を結果として返す",
      "  （ここで分かれ道は終わり）",
      "  ［a］ を結果として返す",
      "整数の変数 p を用意して、3 を引数にして pw を呼び出した結果を入れる",
    ],
    code: ["整数型: x ← 2", "○整数型: pw(整数型: n)", "  if (n が 0 と等しい)", "    return 1", "  endif", "  return ［a］", "整数型: p ← pw(3)"],
  },
  notes: [FUNC_NOTE],
  question: "次のプログラム中の関数 pw は、0 以上の整数 n について、x の n 乗（x を n 個掛けた値。0 乗は 1）を返す。\nプログラム中の ［a］ に入れる正しい答えはどれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "x × pw(n － 1)", code: "x × pw(n － 1)", fill: { a: "x × pw(n － 1)" }, correct: true },
    {
      ja: "x × pw(n)",
      code: "x × pw(n)",
      fill: { a: "x × pw(n)" },
      wrongFeedback: "pw(n) の中で同じ pw(n) を呼び出すので、n が 0 に近づかず、呼び出しが終わりません。",
      events: rec8Run("x × pw(n)"),
    },
    {
      ja: "x ＋ pw(n － 1)",
      code: "x ＋ pw(n － 1)",
      fill: { a: "x ＋ pw(n － 1)" },
      wrongFeedback: "掛けるのではなく足しているので、p＝2＋2＋2＋1＝7 になります。x の n 乗は、x の (n － 1) 乗に x を掛けた値です。",
      events: rec8Run("x ＋ pw(n － 1)"),
    },
    {
      ja: "pw(n － 1)",
      code: "pw(n － 1)",
      fill: { a: "pw(n － 1)" },
      wrongFeedback: "x を掛けていないので、pw(0) の 1 がそのまま返ってきて p＝1 になります。",
      events: rec8Run("pw(n － 1)"),
    },
  ],
  events: [...rec8Run("x × pw(n － 1)"), end()],
  expectedFinal: { vars: { p: 8 } },
  hints: [
    "x の 3 乗は x × x × x。これは x ×（x の 2 乗）と書けます。",
    "x の n 乗 ＝ x ×（x の n － 1 乗）。x の n － 1 乗は pw(n － 1) で求められます。",
    "［a］ は x × pw(n － 1)。p＝2 × 2 × 2 × 1 ＝ 8 です。",
  ],
  explanation: {
    why: "x の n 乗は x ×（x の n － 1 乗）なので、x × pw(n － 1) を返します。pw(0)＝1 から戻りながら 2 を掛けていき、pw(3)＝8 です。",
    trace: [
      { line: 4, state: "pw(0) が 1 を返す" },
      { line: 6, state: "pw(1)=2, pw(2)=4" },
      { line: 6, state: "pw(3) が 2 × 4 = 8 を返す" },
    ],
    points: ["n 乗は「x × (n － 1) 乗」と、小さい同じ問題に分けられる", "止まるとき（0 乗）は 1 を返す"],
  },
};

// ---- rec-9：ユークリッドの互除法（空欄2つ） ----
const F9 = recField({ globals: ["g"], locals: ["m", "n"], depth: 4 });
function rec9Run(a, b) {
  const B = builder(F9);
  const DEPTH = 4;
  const gcd = (d, m, n) => {
    const ev = [line(1), line(2), ...B.cmp([`n@${d}`, 0], `${n} ＝ 0`, n === 0)];
    if (n === 0) {
      const h = B.holdCopy(`${a}@${d}`);
      return { ev: [...ev, line(3), ...h.ev, retE()], id: h.id, value: a === "m" ? m : n };
    }
    let m2;
    let n2;
    let args;
    const modH = (d2) => () => B.holdCalc([`m@${d2}`, `n@${d2}`], `${m} mod ${n}`, m % n);
    if (b === "n, m mod n") {
      [m2, n2] = [n, m % n];
      args = [{ param: "m", h: () => B.holdCopy(`n@${d}`) }, { param: "n", h: modH(d) }];
    } else if (b === "m mod n, n") {
      [m2, n2] = [m % n, n];
      args = [{ param: "m", h: modH(d) }, { param: "n", h: () => B.holdCopy(`n@${d}`) }];
    } else {
      [m2, n2] = [m, m % n];
      args = [{ param: "m", h: () => B.holdCopy(`m@${d}`) }, { param: "n", h: modH(d) }];
    }
    ev.push(line(4), line(5));
    if (d >= DEPTH) return { ev: [...ev, ...endless("n が 0 にならない")], stop: true };
    ev.push(...invoke(d, `gcd(${m2}, ${n2})`, args));
    const sub = gcd(d + 1, m2, n2);
    if (sub.stop) return { ev: [...ev, ...sub.ev], stop: true };
    return { ev: [...ev, ...sub.ev, retE()], id: sub.id, value: sub.value };
  };
  const ev = [line(6), ...invoke(0, "gcd(48, 18)", [{ param: "m", h: () => B.holdSet(48) }, { param: "n", h: () => B.holdSet(18) }])];
  const top = gcd(1, 48, 18);
  return top.stop ? [...ev, ...top.ev] : [...ev, ...top.ev, store(top.id, "g")];
}
const ja9 = (a, b) => `a：${a}　b：${b}`;

const rec9 = {
  id: "rec-9",
  genre: "rec",
  level: 9,
  title: "互除法の穴",
  concepts: ["recursion", "gcd", "mod", "blank"],
  field: F9,
  vars: {},
  varColors: { g: "#66BB6A", m: "#FFB74D", n: "#4FC3F7" },
  program: {
    ja: [
      "関数 gcd（整数の引数 m と n を受け取り、整数を返す）の始まり",
      "  もし n が 0 と等しいなら、3行目を実行する",
      "    ［a］ の値を結果として返す",
      "  （ここで分かれ道は終わり）",
      "  ［b］ を引数にして gcd を呼び出し、その結果を返す",
      "整数の変数 g を用意して、48 と 18 を引数にして gcd を呼び出した結果を入れる",
    ],
    code: ["○整数型: gcd(整数型: m, 整数型: n)", "  if (n が 0 と等しい)", "    return ［a］", "  endif", "  return gcd(［b］)", "整数型: g ← gcd(48, 18)"],
  },
  notes: [FUNC_NOTE, "m mod n は，m を n で割った余りである。"],
  question:
    "次のプログラム中の関数 gcd は、ユークリッドの互除法によって、正の整数 m と 0 以上の整数 n の最大公約数を返す。ユークリッドの互除法は、n が 0 でなければ「m と n の最大公約数は、n と（m を n で割った余り）の最大公約数に等しい」ことを使って問題を小さくし、n が 0 になったときの m が最大公約数となる方法である。\nプログラム中の ［a］ と ［b］ に入れる正しい答えの組合せはどれか。",
  answerType: "blank",
  blanks: ["a", "b"],
  choices: [
    { ja: ja9("m", "n, m mod n"), code: "a：m　b：n, m mod n", fill: { a: "m", b: "n, m mod n" }, correct: true },
    {
      ja: ja9("n", "n, m mod n"),
      code: "a：n　b：n, m mod n",
      fill: { a: "n", b: "n, m mod n" },
      wrongFeedback: "3行目に来るのは n が 0 のときなので、n を返すといつも 0 になります（g＝0）。そのときの m が最大公約数です。",
      events: rec9Run("n", "n, m mod n"),
    },
    {
      ja: ja9("m", "m mod n, n"),
      code: "a：m　b：m mod n, n",
      fill: { a: "m", b: "m mod n, n" },
      wrongFeedback: "引数の順番が逆です。gcd(12, 18) の次も gcd(12, 18) となって n が変わらず、呼び出しが終わりません。",
      events: rec9Run("m", "m mod n, n"),
    },
    {
      ja: ja9("m", "m, m mod n"),
      code: "a：m　b：m, m mod n",
      fill: { a: "m", b: "m, m mod n" },
      wrongFeedback: "m が 48 のまま変わらないので、gcd(48, 12) → gcd(48, 0) となり、g＝48 になってしまいます。次は「n と、m を n で割った余り」です。",
      events: rec9Run("m", "m, m mod n"),
    },
  ],
  events: [...rec9Run("m", "n, m mod n"), end()],
  expectedFinal: { vars: { g: 6 } },
  hints: [
    "問題文のとおり、m と n の最大公約数は、n と（m mod n）の最大公約数に等しい。gcd(48, 18) は gcd(18, 12) になります。",
    "n が 0 になったときの m が答えです。",
    "a は m、b は「n, m mod n」。gcd(48, 18) → gcd(18, 12) → gcd(12, 6) → gcd(6, 0) で、g＝6 です。",
  ],
  explanation: {
    why: "gcd(m, n) は、n が 0 なら m を返し、そうでなければ gcd(n, m mod n) を返します。gcd(48, 18) → gcd(18, 12) → gcd(12, 6) → gcd(6, 0) と呼び出し、gcd(6, 0) が 6 を返して、そのまま上の階へ返されます。g＝6 です。",
    trace: [
      { line: 5, state: "gcd(48, 18) → gcd(18, 12)" },
      { line: 5, state: "gcd(18, 12) → gcd(12, 6)" },
      { line: 5, state: "gcd(12, 6) → gcd(6, 0)" },
      { line: 3, state: "gcd(6, 0) が 6 を返す" },
    ],
    points: ["互除法は「m と n の最大公約数 ＝ n と m mod n の最大公約数」で問題を小さくする", "引数の順番（n, m mod n）を入れ替えると、小さくならない"],
  },
};

// ---- rec-10：速いべき乗（空欄2つ） ----
const F10 = recField({ globals: ["x", "p"], locals: ["n", "h"], depth: 4 });
function rec10Run(a, b) {
  const B = builder(F10);
  const DEPTH = 4;
  const pw = (d, n) => {
    const ev = [line(2), line(3), line(4), ...B.cmp([`n@${d}`, 0], `${n} ＝ 0`, n === 0)];
    if (n === 0) {
      const hh = B.holdSet(1);
      return { ev: [...ev, line(5), ...hh.ev, retE()], id: hh.id, value: 1 };
    }
    const even = n % 2 === 0;
    ev.push(line(6), ...B.cmp([`n@${d}`, 2, 0], `${n} mod 2 ＝ 0`, even));
    if (even) {
      const m = a === "n ÷ 2" ? Math.trunc(n / 2) : a === "n － 2" ? n - 2 : n;
      ev.push(line(7));
      if (d >= DEPTH) return { ev: [...ev, ...endless("n が 0 にならない")], stop: true };
      ev.push(...invoke(d, `pw(${m})`, [{ param: "n", h: () => (a === "n" ? B.holdCopy(`n@${d}`) : B.holdCalc([`n@${d}`, 2], a, m)) }]));
      const sub = pw(d + 1, m);
      if (sub.stop) return { ev: [...ev, ...sub.ev], stop: true };
      const hv = sub.value;
      ev.push(...sub.ev, store(sub.id, `h@${d}`), line(8));
      let v;
      let u;
      if (b === "h × h") {
        v = hv * hv;
        u = B.holdCalc([`h@${d}`, `h@${d}`], `${hv} × ${hv}`, v);
      } else if (b === "h × 2") {
        v = hv * 2;
        u = B.holdCalc([`h@${d}`, 2], `${hv} × 2`, v);
      } else {
        v = 2 * hv;
        u = B.holdCalc(["x", `h@${d}`], `2 × ${hv}`, v);
      }
      return { ev: [...ev, ...u.ev, retE()], id: u.id, value: v };
    }
    ev.push(line(9), line(10));
    if (d >= DEPTH) return { ev: [...ev, ...endless("n が 0 にならない")], stop: true };
    ev.push(...invoke(d, `pw(${n - 1})`, [{ param: "n", h: () => B.holdCalc([`n@${d}`, 1], "n － 1", n - 1) }]));
    const sub = pw(d + 1, n - 1);
    if (sub.stop) return { ev: [...ev, ...sub.ev], stop: true };
    const u = useHeld(sub.id, ["x"], `2 × ${sub.value}`, 2 * sub.value);
    return { ev: [...ev, ...sub.ev, ...u.ev, retE()], id: u.id, value: 2 * sub.value };
  };
  const ev = [line(1), ...B.set("x", 2), line(12), ...invoke(0, "pw(4)", [{ param: "n", h: () => B.holdSet(4) }])];
  const top = pw(1, 4);
  return top.stop ? [...ev, ...top.ev] : [...ev, ...top.ev, store(top.id, "p")];
}
const ja10 = (a, b) => `a：${a}　b：${b}`;

const rec10 = {
  id: "rec-10",
  genre: "rec",
  level: 10,
  title: "速いべき乗の穴",
  concepts: ["recursion", "power", "divide", "blank"],
  field: F10,
  vars: {},
  varColors: { x: "#FFB74D", p: "#66BB6A", n: "#4FC3F7", h: "#F06292" },
  program: {
    ja: [
      "整数の変数 x を用意して、2 を入れる",
      "関数 pw（整数の引数 n を受け取り、整数を返す）の始まり",
      "  整数の変数 h を用意する",
      "  もし n が 0 と等しいなら、5行目を実行する",
      "    1 を結果として返す",
      "  そうではなく、n を 2 で割った余りが 0 なら、7〜8行目を実行する",
      "    ［a］ を引数にして pw を呼び出し、その結果を h に入れる",
      "    ［b］ を結果として返す",
      "  どれにも当てはまらないときは、10行目を実行する",
      "    n － 1 を引数にして pw を呼び出し、その結果に x を掛けた値を返す",
      "  （ここで分かれ道は終わり）",
      "整数の変数 p を用意して、4 を引数にして pw を呼び出した結果を入れる",
    ],
    code: [
      "整数型: x ← 2",
      "○整数型: pw(整数型: n)",
      "  整数型: h",
      "  if (n が 0 と等しい)",
      "    return 1",
      "  elseif (n mod 2 が 0 と等しい)",
      "    h ← pw(［a］)",
      "    return ［b］",
      "  else",
      "    return x × pw(n － 1)",
      "  endif",
      "整数型: p ← pw(4)",
    ],
  },
  notes: [FUNC_NOTE, "n mod 2 は，n を 2 で割った余りである。÷ は，商の小数点以下を切り捨てた整数を求める。"],
  question:
    "次のプログラム中の関数 pw は、0 以上の整数 n について、x の n 乗を返す。n が偶数のときは、x の n 乗が「x の (n ÷ 2) 乗」を 2 回掛けた値に等しいことを使い、呼び出しの回数を減らしている。n が奇数のときは、x の n 乗を x ×（x の n － 1 乗）として求める。0 乗は 1 とする。\nプログラム中の ［a］ と ［b］ に入れる正しい答えの組合せはどれか。",
  answerType: "blank",
  blanks: ["a", "b"],
  choices: [
    { ja: ja10("n ÷ 2", "h × h"), code: "a：n ÷ 2　b：h × h", fill: { a: "n ÷ 2", b: "h × h" }, correct: true },
    {
      ja: ja10("n － 2", "h × h"),
      code: "a：n － 2　b：h × h",
      fill: { a: "n － 2", b: "h × h" },
      wrongFeedback: "n － 2 では「x の (n － 2) 乗」になり、それを 2 回掛けても x の n 乗になりません。この例では pw(4) が pw(2)、pw(0) と進み、p＝1 になります。",
      events: rec10Run("n － 2", "h × h"),
    },
    {
      ja: ja10("n ÷ 2", "h × 2"),
      code: "a：n ÷ 2　b：h × 2",
      fill: { a: "n ÷ 2", b: "h × 2" },
      wrongFeedback: "h は x の (n ÷ 2) 乗です。2 回掛けるには h × h にします。h × 2 では p＝8 になります（x が 2 なので pw(2) だけは偶然 4 になります）。",
      events: rec10Run("n ÷ 2", "h × 2"),
    },
    {
      ja: ja10("n", "h × h"),
      code: "a：n　b：h × h",
      fill: { a: "n", b: "h × h" },
      wrongFeedback: "pw(4) の中でまた pw(4) を呼び出すので、n が小さくならず、呼び出しが終わりません。",
      events: rec10Run("n", "h × h"),
    },
  ],
  events: [...rec10Run("n ÷ 2", "h × h"), end()],
  expectedFinal: { vars: { p: 16 } },
  hints: [
    "x の 4 乗 ＝（x の 2 乗）×（x の 2 乗）。x の 2 乗 ＝（x の 1 乗）×（x の 1 乗）です。",
    "n が偶数なら、まず x の (n ÷ 2) 乗を求めて h に入れ、それを 2 回掛けます。",
    "a は n ÷ 2、b は h × h。pw(1)＝2、pw(2)＝2 × 2＝4、pw(4)＝4 × 4＝16 です。",
  ],
  explanation: {
    why: "n が偶数なら、x の (n ÷ 2) 乗を 1 回だけ求めて h に入れ、h × h を返します。pw(4) → pw(2) → pw(1) → pw(0) と呼び出し、pw(0)＝1、pw(1)＝2 × 1＝2、pw(2)＝2 × 2＝4、pw(4)＝4 × 4＝16 です。n － 1 ずつ減らすより呼び出しが少なくて済みます。",
    trace: [
      { line: 5, state: "pw(0) が 1 を返す" },
      { line: 10, state: "pw(1) が 2 × 1 = 2 を返す" },
      { line: 8, state: "pw(2)：h=2 → 2 × 2 = 4 を返す" },
      { line: 8, state: "pw(4)：h=4 → 4 × 4 = 16 を返す" },
    ],
    points: ["偶数のときは半分の問題を 1 回だけ解き、その答えを 2 回掛ける", "結果を h に入れておけば、同じ呼び出しを 2 回しなくてよい"],
  },
};

export default [rec1, rec2, rec3, rec4, rec5, rec6, rec7, rec8, rec9, rec10];
