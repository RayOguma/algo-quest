// ② cond（わかれみち）
import { line, end, builder, mkField, autoField } from "./helpers.js";

// ---- cond-1：if / else の2方向 ----
const C1_FIELD = autoField(["x", "y"], { compare: true });
const B1 = builder(C1_FIELD);

const cond1 = {
  id: "cond-1",
  genre: "cond",
  level: 1,
  title: "わかれみち",
  concepts: ["if"],
  intro: "if（もし ～なら）は、じょうけんが なりたつ ときだけ すぐ下の しょりを するよ。\nなりたたない ときは else（それ いがい）の 下へ。endif で わかれみちは おわり。",
  field: C1_FIELD,
  vars: {},
  varColors: { x: "#4FC3F7", y: "#66BB6A" },
  program: {
    ja: [
      "整数の 変数 x を 用意して、7 を入れる",
      "整数の 変数 y を 用意して、0 を入れる",
      "もし x が 5 以上 なら、4行目を 実行する",
      "  y の値に 3 を足して、その答えを y に入れる",
      "x が 5 以上 でない ときは、6行目を 実行する",
      "  y の値に 5 を足して、その答えを y に入れる",
      "（ここで 分かれ道は おわり。この先は どちらでも 実行する）",
      "y の値に 2 を かけて、その答えを y に入れる",
    ],
    code: ["整数型: x ← 7", "整数型: y ← 0", "if (x が 5 以上)", "  y ← y ＋ 3", "else", "  y ← y ＋ 5", "endif", "y ← y × 2"],
  },
  question: "プログラムを 実行し終わったときの y の値は どれか。",
  answerType: "vars",
  choices: [
    { ja: "y は 6", code: "y = 6", correct: true },
    {
      ja: "y は 10",
      code: "y = 10",
      wrongFeedback: "x は 7 なので、条件「x が 5 以上」は成り立ちます。成り立つときは 4行目が実行され、else の下の 6行目は実行されません。",
      stop: { line: 3 },
    },
    {
      ja: "y は 3",
      code: "y = 3",
      wrongFeedback: "8行目の「y ← y × 2」は、7行目の endif（分かれ道の おわり）より後なので、条件に関係なく実行されます。",
      stop: { line: 8 },
    },
    {
      ja: "y は 16",
      code: "y = 16",
      wrongFeedback: "条件が成り立って 4行目を実行したら、else の下（6行目）は実行しません。実行されるのは どちらか一方だけです。",
      stop: { line: 7, mark: [5, 6] },
    },
  ],
  events: [
    line(1),
    ...B1.set("x", 7),
    line(2),
    ...B1.set("y", 0),
    line(3),
    ...B1.cmp(["x", 5], "7 ≧ 5", true),
    line(4),
    ...B1.calc("y", ["y", 3], "y ＋ 3", 3),
    line(7),
    line(8),
    ...B1.calc("y", ["y", 2], "y × 2", 6),
    end(),
  ],
  expectedFinal: { vars: { x: 7, y: 6 } },
  hints: [
    "1行目で x＝7。3行目の条件「x が 5 以上」は、7 が 5 以上か ということ。成り立つなら 4行目、成り立たないなら 6行目へ進みます。",
    "7 は 5 以上なので 4行目を実行し、6行目は飛ばします。7行目の endif（分かれ道の おわり）より後の 8行目は、どちらの場合も実行されます。",
    "4行目で y＝0＋3＝3、8行目で y＝3×2＝6 です。",
  ],
  explanation: {
    why: "x は 7 なので「x が 5 以上」は成り立ちます（真）。そのため 4行目で y＝3 になり、else（それ以外のとき）の下の 6行目は実行されません。8行目は endif（分かれ道の おわり）より後なので必ず実行され、y＝3×2＝6 です。",
    trace: [
      { line: 2, state: "x=7, y=0" },
      { line: 3, state: "x が 5 以上 → 真" },
      { line: 4, state: "y=3" },
      { line: 8, state: "y=6" },
    ],
    points: ["条件が成り立つ（真）ときは if の下、成り立たない（偽）ときは else の下だけが実行される", "endif（分かれ道の おわり）より後の処理は、どちらの場合も実行される"],
  },
};

// ---- cond-2：if / elseif / else の3方向 ----
const C2_FIELD = autoField(["x", "y"], { compare: true });
const B2 = builder(C2_FIELD);

const cond2 = {
  id: "cond-2",
  genre: "cond",
  level: 2,
  title: "みっつの みち",
  concepts: ["if", "elseif"],
  field: C2_FIELD,
  vars: {},
  varColors: { x: "#4FC3F7", y: "#66BB6A" },
  program: {
    ja: [
      "整数の 変数 x を 用意して、4 を入れる",
      "整数の 変数 y を 用意して、0 を入れる",
      "もし x が 7 以上 なら、4行目を 実行する",
      "  y の値に 1 を足して、その答えを y に入れる",
      "そうではなく、x が 3 以上 なら、6行目を 実行する",
      "  y の値に 10 を足して、その答えを y に入れる",
      "どれにも 当てはまらない ときは、8行目を 実行する",
      "  y の値に 100 を足して、その答えを y に入れる",
      "（ここで 分かれ道は おわり）",
    ],
    code: ["整数型: x ← 4", "整数型: y ← 0", "if (x が 7 以上)", "  y ← y ＋ 1", "elseif (x が 3 以上)", "  y ← y ＋ 10", "else", "  y ← y ＋ 100", "endif"],
  },
  question: "プログラムを 実行し終わったときの y の値は どれか。",
  answerType: "vars",
  choices: [
    { ja: "y は 10", code: "y = 10", correct: true },
    {
      ja: "y は 1",
      code: "y = 1",
      wrongFeedback: "x は 4 なので、3行目の「x が 7 以上」は成り立ちません。4行目は実行されません。",
      stop: { line: 3 },
    },
    {
      ja: "y は 100",
      code: "y = 100",
      wrongFeedback: "5行目の「x が 3 以上」は、4 なので成り立ちます。else の下（8行目）に行くのは、どの条件も成り立たないときだけです。",
      stop: { line: 5 },
    },
    {
      ja: "y は 110",
      code: "y = 110",
      wrongFeedback: "条件が成り立った所（6行目）を実行したら、残りの else の下は実行しません。実行されるのは どれか1つだけです。",
      stop: { line: 6, mark: [7, 8] },
    },
  ],
  events: [
    line(1),
    ...B2.set("x", 4),
    line(2),
    ...B2.set("y", 0),
    line(3),
    ...B2.cmp(["x", 7], "4 ≧ 7", false),
    line(5),
    ...B2.cmp(["x", 3], "4 ≧ 3", true),
    line(6),
    ...B2.calc("y", ["y", 10], "y ＋ 10", 10),
    line(9),
    end(),
  ],
  expectedFinal: { vars: { x: 4, y: 10 } },
  hints: [
    "1行目で x＝4。3行目の「x が 7 以上」は、4 が 7 以上か？ 成り立たなければ、5行目の条件に進みます。",
    "5行目の「x が 3 以上」は成り立ちます。成り立った所の中（6行目）だけを実行し、そのあとの else の下は実行しません。",
    "6行目だけを実行するので、y＝0＋10＝10 です。",
  ],
  explanation: {
    why: "条件は上から順に調べます。「x が 7 以上」は 4 なので成り立たず、次の「x が 3 以上」が成り立つので 6行目だけを実行して y＝10 になります。最初に成り立った所の処理を1つだけ実行し、残りは実行しません。",
    trace: [
      { line: 2, state: "x=4, y=0" },
      { line: 3, state: "x が 7 以上 → 偽" },
      { line: 5, state: "x が 3 以上 → 真" },
      { line: 6, state: "y=10" },
    ],
    points: ["条件は上から順に調べ、最初に成り立った所の処理だけを実行する", "else（それ以外のとき）の下は、どの条件も成り立たないときだけ実行される"],
  },
};

// ---- cond-3：複合条件（and・or） ----
const C3_FIELD = autoField(["x", "y", "s"], { compare: true });
const B3c = builder(C3_FIELD);

const cond3 = {
  id: "cond-3",
  genre: "cond",
  level: 3,
  title: "かつ と または",
  concepts: ["if", "and", "or"],
  field: C3_FIELD,
  vars: {},
  varColors: { x: "#4FC3F7", y: "#66BB6A", s: "#F06292" },
  program: {
    ja: [
      "整数の 変数 x を 用意して、6 を入れる",
      "整数の 変数 y を 用意して、2 を入れる",
      "整数の 変数 s を 用意して、0 を入れる",
      "もし「x が 5 以上」と「y が 3 以上」が 両方とも 成り立つ なら、5行目を 実行する",
      "  s の値に 1 を足して、その答えを s に入れる",
      "そうではなく、「x が 5 以上」と「y が 3 以上」の どちらか1つでも 成り立つ なら、7行目を 実行する",
      "  s の値に 10 を足して、その答えを s に入れる",
      "どれにも 当てはまらない ときは、9行目を 実行する",
      "  s の値に 100 を足して、その答えを s に入れる",
      "（ここで 分かれ道は おわり）",
    ],
    code: [
      "整数型: x ← 6",
      "整数型: y ← 2",
      "整数型: s ← 0",
      "if ((x が 5 以上) and (y が 3 以上))",
      "  s ← s ＋ 1",
      "elseif ((x が 5 以上) or (y が 3 以上))",
      "  s ← s ＋ 10",
      "else",
      "  s ← s ＋ 100",
      "endif",
    ],
  },
  question: "プログラムを 実行し終わったときの s の値は どれか。",
  answerType: "vars",
  choices: [
    { ja: "s は 10", code: "s = 10", correct: true },
    {
      ja: "s は 1",
      code: "s = 1",
      wrongFeedback: "4行目は and（かつ：両方とも）なので、両方が成り立つ必要があります。y は 2 なので「y が 3 以上」は成り立ちません。",
      stop: { line: 4 },
    },
    {
      ja: "s は 100",
      code: "s = 100",
      wrongFeedback: "6行目は or（または：どちらか1つでも）なので、どちらか片方が成り立てば成立します。x は 6 なので「x が 5 以上」は成り立ちます。",
      stop: { line: 6 },
    },
    {
      ja: "s は 11",
      code: "s = 11",
      wrongFeedback: "4行目の条件は成り立たないので 5行目は実行されません。また、実行されるのは 成り立った所の1つだけです。",
      stop: { line: 4 },
    },
  ],
  events: [
    line(1),
    ...B3c.set("x", 6),
    line(2),
    ...B3c.set("y", 2),
    line(3),
    ...B3c.set("s", 0),
    line(4),
    ...B3c.cmp(["x", 5, "y", 3], "(6 ≧ 5) and (2 ≧ 3)", false),
    line(6),
    ...B3c.cmp(["x", 5, "y", 3], "(6 ≧ 5) or (2 ≧ 3)", true),
    line(7),
    ...B3c.calc("s", ["s", 10], "s ＋ 10", 10),
    line(10),
    end(),
  ],
  expectedFinal: { vars: { x: 6, y: 2, s: 10 } },
  hints: [
    "x＝6、y＝2 です。4行目は「x が 5 以上」と「y が 3 以上」の 両方が成り立つときだけ。それぞれ 成り立つか 調べよう。",
    "and（かつ）は両方、or（または）はどちらか片方が成り立てば成立。y が 2 なので「y が 3 以上」は成り立ちません。",
    "4行目は不成立、6行目は成立 → 7行目だけを実行して s＝10 です。",
  ],
  explanation: {
    why: "「x が 5 以上」は真、「y が 3 以上」は偽です。4行目の and（かつ）は両方が真でないと成り立たないので偽。6行目の or（または）は片方が真なら成り立つので真。だから 7行目だけを実行し、s＝10 です。",
    trace: [
      { line: 3, state: "x=6, y=2, s=0" },
      { line: 4, state: "真 かつ 偽 → 偽" },
      { line: 6, state: "真 または 偽 → 真" },
      { line: 7, state: "s=10" },
    ],
    points: ["and（かつ）は両方が真のときだけ真", "or（または）はどちらか片方でも真なら真"],
  },
};

// ---- cond-4：入れ子の if と変数の更新 ----
const C4_FIELD = mkField({
  cols: 8,
  rows: 5,
  start: { x: 2, y: 2, dir: "right" },
  spawn: { x: 0, y: 2 },
  boxes: [
    { var: "a", x: 6, y: 1, access: { x: 5, y: 1 } },
    { var: "b", x: 6, y: 3, access: { x: 5, y: 3 } },
  ],
  pads: [
    { kind: "calc", x: 3, y: 1, access: { x: 3, y: 2 } },
    { kind: "compare", x: 3, y: 3, access: { x: 3, y: 2 } },
  ],
});
const B4c = builder(C4_FIELD);
const c4Decl = [line(1), ...B4c.set("a", 7), line(2), ...B4c.set("b", 0)];
const c4Outer = [line(3), ...B4c.cmp(["a", 5], "7 ＞ 5", true)];
const c4L4 = [line(4), ...B4c.calc("b", ["a", 5], "a － 5", 2)];

const cond4 = {
  id: "cond-4",
  genre: "cond",
  level: 4,
  title: "いれこの わかれみち",
  concepts: ["if", "nested"],
  field: C4_FIELD,
  vars: {},
  varColors: { a: "#4FC3F7", b: "#66BB6A" },
  program: {
    ja: [
      "整数の 変数 a を 用意して、7 を入れる",
      "整数の 変数 b を 用意して、0 を入れる",
      "もし a が 5 より大きい なら、4〜9行目を 実行する",
      "  a の値から 5 を引いて、その答えを b に入れる",
      "  もし b が 2 以上 なら、6行目を 実行する",
      "    a の値から b の値を 引いて、その答えを a に入れる",
      "  b が 2 以上 でない ときは、8行目を 実行する",
      "    a の値と b の値を 足して、その答えを a に入れる",
      "  （ここで 内側の 分かれ道は おわり）",
      "a が 5 より大きく ない ときは、11行目を 実行する",
      "  5 から a の値を 引いて、その答えを b に入れる",
      "（ここで 外側の 分かれ道は おわり）",
    ],
    code: [
      "整数型: a ← 7",
      "整数型: b ← 0",
      "if (a が 5 より大きい)",
      "  b ← a － 5",
      "  if (b が 2 以上)",
      "    a ← a － b",
      "  else",
      "    a ← a ＋ b",
      "  endif",
      "else",
      "  b ← 5 － a",
      "endif",
    ],
  },
  question: "プログラムを 実行し終わったときの a と b の値の 組合せは どれか。",
  answerType: "vars",
  choices: [
    { ja: "a は 5、b は 2", code: "a = 5, b = 2", correct: true },
    {
      ja: "a は 9、b は 2",
      code: "a = 9, b = 2",
      wrongFeedback: "5行目は「b が 2 以上」です。b は 2 なので成り立ちます（「2 より大きい」とはちがいます）。",
      stop: { line: 5 },
    },
    {
      ja: "a は 7、b は 2",
      code: "a = 7, b = 2",
      wrongFeedback: "4行目のあと、内側の if（5〜9行目）でも a が更新されます。外側の if の中は最後まで実行されます。",
      stop: { line: 5 },
    },
    {
      ja: "a は 7、b は −2",
      code: "a = 7, b = −2",
      wrongFeedback: "a は 7 なので、3行目の「a が 5 より大きい」は成り立ちます。外側の else の下（11行目）には進みません。",
      stop: { line: 3 },
    },
  ],
  events: [...c4Decl, ...c4Outer, ...c4L4, line(5), ...B4c.cmp(["b", 2], "2 ≧ 2", true), line(6), ...B4c.calc("a", ["a", "b"], "a － b", 5), line(9), line(12), end()],
  expectedFinal: { vars: { a: 5, b: 2 } },
  hints: [
    "a＝7 なので、3行目の「a が 5 より大きい」は成り立ちます。4行目で b に 7－5＝2 が入ります。次は5行目の 内側の条件を調べよう。",
    "5行目は「b が 2 以上」。b は 2 なので成り立ちます（「以上」は その数も ふくみます）。6行目を実行し、8行目は実行しません。",
    "6行目で a＝7－2＝5。外側の else（10〜11行目）は実行しません。",
  ],
  explanation: {
    why: "外側の条件「a が 5 より大きい」が真なので4〜9行目を実行します。4行目で b＝2。内側の条件「b が 2 以上」も真（2 は 2 以上）なので6行目で a＝7－2＝5。外側の else の下は実行されません。",
    trace: [
      { line: 2, state: "a=7, b=0" },
      { line: 3, state: "a が 5 より大きい → 真" },
      { line: 4, state: "a=7, b=2" },
      { line: 5, state: "b が 2 以上 → 真" },
      { line: 6, state: "a=5, b=2" },
    ],
    points: ["if の中に if があるときは、外側の条件 → 内側の条件の順に調べる", "「以上」「以下」はその数をふくみ、「より大きい」「より小さい」はふくまない"],
  },
};

// ---- cond-5：配列＋繰返し＋複数の分岐（境界値 ≧ と ＞） ----
const C5_FIELD = mkField({
  cols: 9,
  rows: 6,
  start: { x: 1, y: 2, dir: "right" },
  spawn: { x: 4, y: 2 },
  arrays: [{ name: "score", x: 1, y: 0, values: [80, 60, 59, 90, 70] }],
  boxes: [
    { var: "i", x: 7, y: 1, access: { x: 6, y: 1 } },
    { var: "a", x: 7, y: 2, access: { x: 6, y: 2 } },
    { var: "b", x: 7, y: 3, access: { x: 6, y: 3 } },
    { var: "c", x: 7, y: 4, access: { x: 6, y: 4 } },
  ],
  pads: [
    { kind: "compare", x: 3, y: 3, access: { x: 3, y: 2 } },
    { kind: "calc", x: 5, y: 3, access: { x: 5, y: 2 } },
  ],
});
const SCORES = [80, 60, 59, 90, 70];

/** 繰返しの実演を作る（80以上→a、60より大きい→b、それ以外→c） */
function cond5Events() {
  const B = builder(C5_FIELD);
  const ev = [line(1), line(2), line(3), ...B.set("a", 0), line(4), ...B.set("b", 0), line(5), ...B.set("c", 0)];
  const cnt = { a: 0, b: 0, c: 0 };
  const inc = (v) => {
    cnt[v] += 1;
    return B.calc(v, [v, 1], `${v} ＋ 1`, cnt[v]);
  };
  SCORES.forEach((v, k) => {
    const i = k + 1;
    ev.push(line(6), ...(i === 1 ? B.set("i", 1) : B.calc("i", ["i", 1], "i ＋ 1", i)));
    const ref = `score[${i}]`;
    const first = v >= 80;
    ev.push(line(7), ...B.cmp([ref, 80], `${v} ≧ 80`, first));
    const second = v > 60;
    if (first) ev.push(line(8), ...inc("a"));
    else {
      ev.push(line(9), ...B.cmp([ref, 60], `${v} ＞ 60`, second));
      if (second) ev.push(line(10), ...inc("b"));
      else ev.push(line(11), line(12), ...inc("c"));
    }
    ev.push(line(13), line(14));
  });
  return ev;
}

const cond5 = {
  id: "cond-5",
  genre: "cond",
  level: 5,
  title: "せいせき しらべ",
  concepts: ["if", "elseif", "loop", "array", "boundary"],
  field: C5_FIELD,
  vars: {},
  varColors: { score: "#FFA726", i: "#4FC3F7", a: "#EF5350", b: "#66BB6A", c: "#AB47BC" },
  program: {
    ja: [
      "整数の 配列 score を 用意して、{80, 60, 59, 90, 70} を入れる",
      "整数の 変数 i、a、b、c を 用意する",
      "a に 0 を入れる",
      "b に 0 を入れる",
      "c に 0 を入れる",
      "i を 1 から score の要素数（5）まで 1ずつ 増やしながら、7〜13行目を くりかえす",
      "  もし score の i番目 が 80 以上 なら、8行目を 実行する",
      "    a を 1 増やす",
      "  そうではなく、score の i番目 が 60 より大きい なら、10行目を 実行する",
      "    b を 1 増やす",
      "  どれにも 当てはまらない ときは、12行目を 実行する",
      "    c を 1 増やす",
      "  （ここで 分かれ道は おわり）",
      "（くりかえす 範囲は ここまで。6行目に もどる）",
    ],
    code: [
      "整数型の配列: score ← {80, 60, 59, 90, 70}",
      "整数型: i, a, b, c",
      "a ← 0",
      "b ← 0",
      "c ← 0",
      "for (i を 1 から score の要素数 まで 1 ずつ増やす)",
      "  if (score[i] が 80 以上)",
      "    a ← a ＋ 1",
      "  elseif (score[i] が 60 より大きい)",
      "    b ← b ＋ 1",
      "  else",
      "    c ← c ＋ 1",
      "  endif",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "score の要素数 は，配列 score に入っている値の個数（5）である。"],
  question: "プログラムを 実行し終わったときの a、b、c の値の 組合せは どれか。",
  answerType: "vars",
  choices: [
    { ja: "a は 2、b は 1、c は 2", code: "a = 2, b = 1, c = 2", correct: true },
    {
      ja: "a は 2、b は 2、c は 1",
      code: "a = 2, b = 2, c = 1",
      wrongFeedback: "9行目は「60 より大きい」です。60 は 60 より大きくないので、score[2] の 60 は b ではなく c に数えます。",
      stop: { line: 9 },
    },
    {
      ja: "a は 1、b は 2、c は 2",
      code: "a = 1, b = 2, c = 2",
      wrongFeedback: "7行目は「80 以上」です。80 も ふくむので、score[1] の 80 は a に数えます。",
      stop: { line: 7 },
    },
    {
      ja: "a は 2、b は 3、c は 2",
      code: "a = 2, b = 3, c = 2",
      wrongFeedback: "7行目が成り立ったら、9行目の条件は調べません（実行されるのは どれか1つだけ）。80 や 90 を b にも数えていませんか？",
      stop: { line: 13, mark: [9] },
    },
  ],
  events: [...cond5Events(), end()],
  expectedFinal: { vars: { a: 2, b: 1, c: 2 } },
  hints: [
    "score[1] の 80 は「80 以上」が成り立つので a が 1 増えます。score[2] の 60 は「80 以上」でも「60 より大きい」でもありません。どこに数えるかな？",
    "「60 より大きい」（＞）に 60 は入りません。「80 以上」（≧）には 80 が入ります。また、上から調べて最初に成り立った所だけを実行します。",
    "80→a、60→c、59→c、90→a、70→b と分かれます。",
  ],
  explanation: {
    why: "5つの値を順に調べます。80 は「80 以上」なので a。60 は「60 より大きい」が成り立たない（60 は 60 より大きくない）ので c。59 も c。90 は a。70 は「60 より大きい」なので b。よって a＝2、b＝1、c＝2 です。",
    trace: [
      { line: 5, state: "a=0, b=0, c=0" },
      { line: 8, state: "i=1：score[1]=80 → a=1" },
      { line: 12, state: "i=2：score[2]=60 → c=1" },
      { line: 12, state: "i=3：score[3]=59 → c=2" },
      { line: 8, state: "i=4：score[4]=90 → a=2" },
      { line: 10, state: "i=5：score[5]=70 → b=1" },
    ],
    points: ["「以上」（≧）は境界の数をふくみ、「より大きい」（＞）はふくまない", "if / elseif / else は、上から調べて最初に成り立った所の処理だけを実行する"],
  },
};

// ================= 6〜10：穴埋め =================
// 空欄の記号 a・b と まぎれないよう、穴埋めの問題では 変数名に a・b を使わない。
// 誤答は、その選択肢を空欄に入れたプログラムを実行して見せる（どの誤答も このデータで 目的と ちがう結果になる）。

// ---- cond-6：大きい方を選ぶ ----
const C6_FIELD = autoField(["p", "q", "m"], { compare: true });
const C6_COND = {
  "p が q より大きい": [["p", "q"], "6 ＞ 9", false],
  "p が q より小さい": [["p", "q"], "6 ＜ 9", true],
  "q が p より大きい": [["q", "p"], "9 ＞ 6", true],
  "p が 0 より大きい": [["p", 0], "6 ＞ 0", true],
};
function cond6Run(a) {
  const B = builder(C6_FIELD);
  const [ops, expr, ok] = C6_COND[a];
  const ev = [line(1), ...B.set("p", 6), line(2), ...B.set("q", 9), line(3), line(4), ...B.cmp(ops, expr, ok)];
  if (ok) ev.push(line(5), ...B.copy("m", "p"), line(8));
  else ev.push(line(6), line(7), ...B.copy("m", "q"), line(8));
  return ev;
}

const cond6 = {
  id: "cond-6",
  genre: "cond",
  level: 6,
  title: "おおきいほうの あな",
  concepts: ["if", "max", "blank"],
  intro: "ここからは あなうめ もんだい。［a］ に はいる ものを えらぼう。\n「ここまで すすめる」は、あなの てまえまで つかえるよ。",
  field: C6_FIELD,
  vars: {},
  varColors: { p: "#4FC3F7", q: "#66BB6A", m: "#F06292" },
  program: {
    ja: [
      "整数の 変数 p を 用意して、6 を入れる",
      "整数の 変数 q を 用意して、9 を入れる",
      "整数の 変数 m を 用意する（まだ 空っぽ）",
      "もし ［a］ なら、5行目を 実行する",
      "  p の値を m に 写す",
      "そうでない ときは、7行目を 実行する",
      "  q の値を m に 写す",
      "（ここで 分かれ道は おわり）",
    ],
    code: ["整数型: p ← 6", "整数型: q ← 9", "整数型: m", "if (［a］)", "  m ← p", "else", "  m ← q", "endif"],
  },
  question: "次のプログラムは、p と q の うち 大きい方の値を m に 格納する。p と q の値が 等しいときは、q の値を m に 格納する。\nプログラム中の ［a］ に入れる 正しい答えは どれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "p が q より大きい", code: "p が q より大きい", fill: { a: "p が q より大きい" }, correct: true },
    {
      ja: "p が q より小さい",
      code: "p が q より小さい",
      fill: { a: "p が q より小さい" },
      wrongFeedback: "p＝6 は q＝9 より小さいので 条件が成り立ち、5行目の m ← p で 小さい方の 6 が 入ってしまいます。",
      events: cond6Run("p が q より小さい"),
    },
    {
      ja: "q が p より大きい",
      code: "q が p より大きい",
      fill: { a: "q が p より大きい" },
      wrongFeedback: "9 は 6 より大きいので 条件が成り立ち、5行目の m ← p で 小さい方の 6 が 入ってしまいます。条件が成り立つと 入るのは p の方です。",
      events: cond6Run("q が p より大きい"),
    },
    {
      ja: "p が 0 より大きい",
      code: "p が 0 より大きい",
      fill: { a: "p が 0 より大きい" },
      wrongFeedback: "p が 0 より大きいかどうかでは、q と どちらが大きいか 分かりません。p＝6 は 0 より大きいので m ← p が実行され、m＝6 に なってしまいます。",
      events: cond6Run("p が 0 より大きい"),
    },
  ],
  events: [...cond6Run("p が q より大きい"), end()],
  expectedFinal: { vars: { m: 9 } },
  hints: [
    "問題文を 場合に 分けると、「p が q より大きい → p を 格納」「p が q 以下（等しいときも ふくむ） → q を 格納」です。条件が 成り立つと 5行目（m ← p）を 実行します。",
    "問題文の 決まりでは、p を入れるのは「p が q より大きい」とき、q を入れるのは「p が q 以下」（等しいときも）です。等しいときは else（7行目）に進みます。",
    "［a］ は「p が q より大きい」。p＝6、q＝9 なので条件は偽、7行目で m＝9 になります。",
  ],
  explanation: {
    why: "条件が成り立つと 5行目の m ← p、成り立たないと 7行目の m ← q を実行します。決まりでは p を入れるのは「p が q より大きい」ときなので、［a］ は「p が q より大きい」。p と q が等しいときは 条件が成り立たず、決まりどおり q が入ります。p＝6、q＝9 では条件は偽なので m＝9 です。",
    trace: [
      { line: 2, state: "p=6, q=9" },
      { line: 4, state: "6 が 9 より大きい → 偽" },
      { line: 7, state: "m=9" },
    ],
    points: ["条件を考えるときは「成り立ったら どの行を実行するか」から逆に考える", "「より大きい」は 等しいときを ふくまない。等しいときは else に進む"],
  },
};

// ---- cond-7：偶数・奇数（mod） ----
const C7_FIELD = autoField(["n", "e", "o"], { compare: true });
const C7_COND = {
  "n mod 2 が 0 と等しい": [["n", 2, 0], "14 mod 2 ＝ 0", true],
  "n mod 2 が 1 と等しい": [["n", 2, 1], "14 mod 2 ＝ 1", false],
  "n ÷ 2 が 0 と等しい": [["n", 2, 0], "14 ÷ 2 ＝ 0", false],
  "n mod 10 が 0 と等しい": [["n", 10, 0], "14 mod 10 ＝ 0", false],
};
function cond7Run(a) {
  const B = builder(C7_FIELD);
  const [ops, expr, ok] = C7_COND[a];
  const ev = [line(1), ...B.set("n", 14), line(2), ...B.set("e", 0), line(3), ...B.set("o", 0), line(4), ...B.cmp(ops, expr, ok)];
  if (ok) ev.push(line(5), ...B.calc("e", ["e", 1], "e ＋ 1", 1), line(8));
  else ev.push(line(6), line(7), ...B.calc("o", ["o", 1], "o ＋ 1", 1), line(8));
  return ev;
}

const cond7 = {
  id: "cond-7",
  genre: "cond",
  level: 7,
  title: "ぐうすうの あな",
  concepts: ["if", "mod", "blank"],
  field: C7_FIELD,
  vars: {},
  varColors: { n: "#4FC3F7", e: "#66BB6A", o: "#F06292" },
  program: {
    ja: [
      "整数の 変数 n を 用意して、14 を入れる",
      "整数の 変数 e を 用意して、0 を入れる",
      "整数の 変数 o を 用意して、0 を入れる",
      "もし ［a］ なら、5行目を 実行する",
      "  e を 1 増やす",
      "そうでない ときは、7行目を 実行する",
      "  o を 1 増やす",
      "（ここで 分かれ道は おわり）",
    ],
    code: ["整数型: n ← 14", "整数型: e ← 0", "整数型: o ← 0", "if (［a］)", "  e ← e ＋ 1", "else", "  o ← o ＋ 1", "endif"],
  },
  notes: ["n mod 2 は，n を 2 で割った余りである。"],
  question: "次のプログラムは、n が 偶数の ときは e に、奇数の ときは o に 1 を 加える。\nプログラム中の ［a］ に入れる 正しい答えは どれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "n を 2 で 割った余りが 0", code: "n mod 2 が 0 と等しい", fill: { a: { code: "n mod 2 が 0 と等しい", ja: "n を 2 で 割った余りが 0" } }, correct: true },
    {
      ja: "n を 2 で 割った余りが 1",
      code: "n mod 2 が 1 と等しい",
      fill: { a: { code: "n mod 2 が 1 と等しい", ja: "n を 2 で 割った余りが 1" } },
      wrongFeedback: "余りが 1 なのは 奇数です。14 は 余り 0 なので 条件は成り立たず、奇数を数える o が 増えて しまいます。",
      events: cond7Run("n mod 2 が 1 と等しい"),
    },
    {
      ja: "n を 2 で 割った値が 0",
      code: "n ÷ 2 が 0 と等しい",
      fill: { a: { code: "n ÷ 2 が 0 と等しい", ja: "n を 2 で 割った値が 0" } },
      wrongFeedback: "n ÷ 2 は 割り算の答え（14 なら 7）です。0 とは等しくないので o が増えてしまいます。偶数かどうかは 余り（mod）で調べます。",
      events: cond7Run("n ÷ 2 が 0 と等しい"),
    },
    {
      ja: "n を 10 で 割った余りが 0",
      code: "n mod 10 が 0 と等しい",
      fill: { a: { code: "n mod 10 が 0 と等しい", ja: "n を 10 で 割った余りが 0" } },
      wrongFeedback: "10 で 割り切れるかどうかでは、偶数か奇数かは 分かりません。14 は偶数ですが 10 では割り切れないので、o が増えてしまいます。",
      events: cond7Run("n mod 10 が 0 と等しい"),
    },
  ],
  events: [...cond7Run("n mod 2 が 0 と等しい"), end()],
  expectedFinal: { vars: { e: 1, o: 0 } },
  hints: [
    "偶数は 2 で 割り切れる数、つまり 2 で割った 余りが 0 の数です。",
    "mod は 余りを求めます。条件が成り立つと 5行目（e を増やす）を実行します。",
    "［a］ は「n mod 2 が 0 と等しい」。14 は偶数なので e＝1 になります。",
  ],
  explanation: {
    why: "偶数は 2 で割った余りが 0 の数です。条件が成り立つと e を増やすので、条件は「n mod 2 が 0 と等しい」。14 mod 2 ＝ 0 なので 5行目を実行し、e＝1 です。",
    trace: [
      { line: 3, state: "n=14, e=0, o=0" },
      { line: 4, state: "14 mod 2 ＝ 0 → 真" },
      { line: 5, state: "e=1" },
    ],
    points: ["偶数は 2 で割った余りが 0、奇数は 余りが 1", "÷ は割り算の答え、mod は余り"],
  },
};

// ---- cond-8：elseif の範囲 ----
const C8_FIELD = autoField(["s", "r"], { compare: true });
const C8_COND = {
  "s が 60 以上": [["s", 60], "55 ≧ 60", false],
  "s が 80 より小さい": [["s", 80], "55 ＜ 80", true],
  "s が 60 より小さい": [["s", 60], "55 ＜ 60", true],
  "s が 50 以上": [["s", 50], "55 ≧ 50", true],
};
function cond8Run(a) {
  const B = builder(C8_FIELD);
  const [ops, expr, ok] = C8_COND[a];
  const ev = [line(1), ...B.set("s", 55), line(2), ...B.set("r", 0), line(3), ...B.cmp(["s", 80], "55 ≧ 80", false), line(5), ...B.cmp(ops, expr, ok)];
  if (ok) ev.push(line(6), ...B.set("r", 2), line(9));
  else ev.push(line(7), line(8), ...B.set("r", 3), line(9));
  return ev;
}

const cond8 = {
  id: "cond-8",
  genre: "cond",
  level: 8,
  title: "はんいの あな",
  concepts: ["if", "elseif", "range", "blank"],
  field: C8_FIELD,
  vars: {},
  varColors: { s: "#4FC3F7", r: "#66BB6A" },
  program: {
    ja: [
      "整数の 変数 s を 用意して、55 を入れる",
      "整数の 変数 r を 用意して、0 を入れる",
      "もし s が 80 以上 なら、4行目を 実行する",
      "  r に 1 を入れる",
      "そうではなく、［a］ なら、6行目を 実行する",
      "  r に 2 を入れる",
      "どれにも 当てはまらない ときは、8行目を 実行する",
      "  r に 3 を入れる",
      "（ここで 分かれ道は おわり）",
    ],
    code: ["整数型: s ← 55", "整数型: r ← 0", "if (s が 80 以上)", "  r ← 1", "elseif (［a］)", "  r ← 2", "else", "  r ← 3", "endif"],
  },
  question: "次のプログラムは、点数 s が 80 以上の ときは r に 1 を、60 以上 80 未満の ときは 2 を、60 未満の ときは 3 を 格納する。\nプログラム中の ［a］ に入れる 正しい答えは どれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "s が 60 以上", code: "s が 60 以上", fill: { a: "s が 60 以上" }, correct: true },
    {
      ja: "s が 80 より小さい",
      code: "s が 80 より小さい",
      fill: { a: "s が 80 より小さい" },
      wrongFeedback: "elseif に来るのは、もう「80 以上ではない」と分かったときです。「80 より小さい」だと 55 点でも成り立ち、60 未満なのに r＝2 に なってしまいます。",
      events: cond8Run("s が 80 より小さい"),
    },
    {
      ja: "s が 60 より小さい",
      code: "s が 60 より小さい",
      fill: { a: "s が 60 より小さい" },
      wrongFeedback: "60 より小さいときは r＝3 に したいので、逆です。55 点で r＝2 に なってしまいます。",
      events: cond8Run("s が 60 より小さい"),
    },
    {
      ja: "s が 50 以上",
      code: "s が 50 以上",
      fill: { a: "s が 50 以上" },
      wrongFeedback: "これだと 50〜59 点も r＝2 に なってしまいます。r＝2 に するのは 60 以上 80 未満 です。",
      events: cond8Run("s が 50 以上"),
    },
  ],
  events: [...cond8Run("s が 60 以上"), end()],
  expectedFinal: { vars: { r: 3 } },
  hints: [
    "elseif の条件は、上の if（80 以上）が 成り立たなかったときだけ 調べます。",
    "elseif に来たときは もう「80 未満」と 分かっています。あとは 60 以上かどうかを 調べれば十分です。",
    "［a］ は「s が 60 以上」。s＝55 なので 成り立たず、r＝3 です。",
  ],
  explanation: {
    why: "elseif の条件は、上の条件が成り立たなかったときだけ調べます。ここに来たときは s が 80 未満と分かっているので、「s が 60 以上」だけで「60 以上 80 未満」を表せます。s＝55 は どちらも成り立たないので r＝3 です。",
    trace: [
      { line: 3, state: "55 が 80 以上 → 偽" },
      { line: 5, state: "55 が 60 以上 → 偽" },
      { line: 8, state: "r=3" },
    ],
    points: ["elseif は、上の条件が すべて成り立たなかったときだけ調べる", "範囲の上側は、上の条件で もう除かれている"],
  },
};

/** for の制御行：1周目は初期値を入れ、2周目からは 1 増やす */
const forStep = (B, n, v, value, first) => [line(n), ...(first ? B.set(v, value) : B.calc(v, [v, 1], `${v} ＋ 1`, value))];

// ---- cond-9：うるう年を数える（複合条件。空欄2つ） ----
const YEARS = [1900, 2000, 2024, 2023, 2100];
const C9_FIELD = autoField(["cnt", "i", "y"], { compare: true, arrays: [{ name: "years", values: YEARS }] });
/** 空欄に入る条件：[表示する式（y の値を入れる）, 判定] */
const C9_COND = {
  "y mod 100 が 0 と等しくない": (y) => [`${y} mod 100 ≠ 0`, y % 100 !== 0],
  "y mod 100 が 0 と等しい": (y) => [`${y} mod 100 ＝ 0`, y % 100 === 0],
  "y mod 400 が 0 と等しい": (y) => [`${y} mod 400 ＝ 0`, y % 400 === 0],
  "y mod 400 が 0 と等しくない": (y) => [`${y} mod 400 ≠ 0`, y % 400 !== 0],
};
function cond9Run(a, b) {
  const B = builder(C9_FIELD);
  const ev = [line(1), line(2), ...B.set("cnt", 0), line(3)];
  let cnt = 0;
  YEARS.forEach((y, k) => {
    const i = k + 1;
    ev.push(...forStep(B, 4, "i", i, i === 1), line(5), ...B.copy("y", `years[${i}]`));
    const [ea, va] = C9_COND[a](y);
    const [eb, vb] = C9_COND[b](y);
    const ok = (y % 4 === 0 && va) || vb;
    ev.push(line(6), ...B.cmp(["y", 4, 100, 400], `((${y} mod 4 ＝ 0) and (${ea})) or (${eb})`, ok));
    if (ok) {
      cnt += 1;
      ev.push(line(7), ...B.calc("cnt", ["cnt", 1], "cnt ＋ 1", cnt));
    }
    ev.push(line(8), line(9));
  });
  return ev;
}

const cond9 = {
  id: "cond-9",
  genre: "cond",
  level: 9,
  title: "うるうどしの あな",
  concepts: ["if", "and", "or", "mod", "loop", "blank"],
  field: C9_FIELD,
  vars: {},
  varColors: { years: "#FFA726", cnt: "#66BB6A", i: "#4FC3F7", y: "#F06292" },
  program: {
    ja: [
      "整数の 配列 years を 用意して、{1900, 2000, 2024, 2023, 2100} を入れる",
      "整数の 変数 cnt を 用意して、0 を入れる",
      "整数の 変数 i と y を 用意する",
      "i を 1 から years の要素数（5）まで 1ずつ 増やしながら、5〜8行目を くりかえす",
      "  years の i番目 の値を y に 写す",
      "  もし「y が 4 で 割り切れる かつ ［a］」または「［b］」なら、7行目を 実行する",
      "    cnt を 1 増やす",
      "  （ここで 分かれ道は おわり）",
      "（くりかえす 範囲は ここまで。4行目に もどる）",
    ],
    code: [
      "整数型の配列: years ← {1900, 2000, 2024, 2023, 2100}",
      "整数型: cnt ← 0",
      "整数型: i, y",
      "for (i を 1 から years の要素数 まで 1 ずつ増やす)",
      "  y ← years[i]",
      "  if (((y mod 4 が 0 と等しい) and (［a］)) or (［b］))",
      "    cnt ← cnt ＋ 1",
      "  endif",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "y mod 4 は，y を 4 で割った余りである。"],
  question:
    "次のプログラムは、配列 years に 格納された 西暦年の うち、うるう年の 個数を cnt に 格納する。うるう年は、次の (1)、(2) の どちらかに 当てはまる 年である。\n(1) 4 で 割り切れ、かつ 100 で 割り切れない 年\n(2) 400 で 割り切れる 年\nプログラム中の ［a］ と ［b］ に入れる 正しい答えの 組合せは どれか。",
  answerType: "blank",
  blanks: ["a", "b"],
  choices: [
    {
      ja: "a：y mod 100 が 0 と等しくない　b：y mod 400 が 0 と等しい",
      code: "a：y mod 100 が 0 と等しくない　b：y mod 400 が 0 と等しい",
      fill: { a: "y mod 100 が 0 と等しくない", b: "y mod 400 が 0 と等しい" },
      correct: true,
    },
    {
      ja: "a：y mod 100 が 0 と等しい　b：y mod 400 が 0 と等しい",
      code: "a：y mod 100 が 0 と等しい　b：y mod 400 が 0 と等しい",
      fill: { a: "y mod 100 が 0 と等しい", b: "y mod 400 が 0 と等しい" },
      wrongFeedback: "(1) は「100 で 割り切れない」年です。「mod 100 が 0 と等しい」は 割り切れる年なので、1900 年や 2100 年を 数えて しまいます。",
      events: cond9Run("y mod 100 が 0 と等しい", "y mod 400 が 0 と等しい"),
    },
    {
      ja: "a：y mod 100 が 0 と等しくない　b：y mod 400 が 0 と等しくない",
      code: "a：y mod 100 が 0 と等しくない　b：y mod 400 が 0 と等しくない",
      fill: { a: "y mod 100 が 0 と等しくない", b: "y mod 400 が 0 と等しくない" },
      wrongFeedback: "(2) は「400 で 割り切れる」年です。「等しくない」では 400 で 割り切れない年（2023 年など）が すべて 数えられて しまいます。",
      events: cond9Run("y mod 100 が 0 と等しくない", "y mod 400 が 0 と等しくない"),
    },
    {
      ja: "a：y mod 400 が 0 と等しい　b：y mod 100 が 0 と等しくない",
      code: "a：y mod 400 が 0 と等しい　b：y mod 100 が 0 と等しくない",
      fill: { a: "y mod 400 が 0 と等しい", b: "y mod 100 が 0 と等しくない" },
      wrongFeedback: "(1) と (2) の 条件が 入れかわっています。b を「100 で 割り切れない」に すると、4 で 割り切れない 2023 年まで 数えて しまいます。",
      events: cond9Run("y mod 400 が 0 と等しい", "y mod 100 が 0 と等しくない"),
    },
  ],
  events: [...cond9Run("y mod 100 が 0 と等しくない", "y mod 400 が 0 と等しい"), end()],
  expectedFinal: { vars: { cnt: 2 } },
  hints: [
    "6行目の 条件は「(4 で 割り切れる かつ ［a］) または ［b］」の形です。問題文の (1)、(2) と 見くらべよう。",
    "(1) の「100 で 割り切れない」は「y mod 100 が 0 と等しくない」、(2) の「400 で 割り切れる」は「y mod 400 が 0 と等しい」と 書けます。",
    "a は「y mod 100 が 0 と等しくない」、b は「y mod 400 が 0 と等しい」。うるう年は 2000 と 2024 の 2つで cnt＝2 です。",
  ],
  explanation: {
    why: "6行目の条件は「(4 で割り切れる かつ 100 で割り切れない) または 400 で割り切れる」です。1900 と 2100 は 100 で割り切れて 400 では割り切れないので ちがう、2000 は 400 で割り切れるので うるう年、2024 は (1) に当てはまり うるう年、2023 は 4 で割り切れないので ちがいます。cnt＝2 です。",
    trace: [
      { line: 6, state: "i=1：1900 → 偽" },
      { line: 7, state: "i=2：2000 → 真 → cnt=1" },
      { line: 7, state: "i=3：2024 → 真 → cnt=2" },
      { line: 6, state: "i=4：2023 → 偽" },
      { line: 6, state: "i=5：2100 → 偽" },
    ],
    points: ["「割り切れる」は mod の答えが 0 と等しい、「割り切れない」は 0 と等しくない", "and と or が まざった 条件は、かっこの まとまりごとに 考える"],
  },
};

// ---- cond-10：3 と 5 の 倍数を 数え分ける（elseif の 順番。空欄2つ） ----
const C10_FIELD = autoField(["t15", "t3", "t5", "i"], { compare: true });
const C10_TEST = {
  "i mod 15 が 0 と等しい": (i) => [["i", 15, 0], `${i} mod 15 ＝ 0`, i % 15 === 0],
  "i mod 3 が 0 と等しい": (i) => [["i", 3, 0], `${i} mod 3 ＝ 0`, i % 3 === 0],
  "i mod 5 が 0 と等しい": (i) => [["i", 5, 0], `${i} mod 5 ＝ 0`, i % 5 === 0],
  "(i mod 3 が 0 と等しい) or (i mod 5 が 0 と等しい)": (i) => [["i", 3, 5, 0], `(${i} mod 3 ＝ 0) or (${i} mod 5 ＝ 0)`, i % 3 === 0 || i % 5 === 0],
};
function cond10Run(a, b) {
  const B = builder(C10_FIELD);
  const ev = [line(1), ...B.set("t15", 0), line(2), ...B.set("t3", 0), line(3), ...B.set("t5", 0), line(4)];
  const cnt = { t15: 0, t3: 0, t5: 0 };
  const inc = (v) => {
    cnt[v] += 1;
    return B.calc(v, [v, 1], `${v} ＋ 1`, cnt[v]);
  };
  for (let i = 1; i <= 15; i++) {
    ev.push(...forStep(B, 5, "i", i, i === 1));
    const [o1, e1, v1] = C10_TEST[a](i);
    ev.push(line(6), ...B.cmp(o1, e1, v1));
    if (v1) ev.push(line(7), ...inc("t15"));
    else {
      const [o2, e2, v2] = C10_TEST["i mod 3 が 0 と等しい"](i);
      ev.push(line(8), ...B.cmp(o2, e2, v2));
      if (v2) ev.push(line(9), ...inc("t3"));
      else {
        const [o3, e3, v3] = C10_TEST[b](i);
        ev.push(line(10), ...B.cmp(o3, e3, v3));
        if (v3) ev.push(line(11), ...inc("t5"));
      }
    }
    ev.push(line(12), line(13));
  }
  return ev;
}

const cond10 = {
  id: "cond-10",
  genre: "cond",
  level: 10,
  title: "3と5の あな",
  concepts: ["if", "elseif", "mod", "loop", "blank"],
  field: C10_FIELD,
  vars: {},
  varColors: { t15: "#9575CD", t3: "#66BB6A", t5: "#F06292", i: "#4FC3F7" },
  program: {
    ja: [
      "整数の 変数 t15 を 用意して、0 を入れる",
      "整数の 変数 t3 を 用意して、0 を入れる",
      "整数の 変数 t5 を 用意して、0 を入れる",
      "整数の 変数 i を 用意する",
      "i を 1 から 15 まで 1ずつ 増やしながら、6〜12行目を くりかえす",
      "  もし ［a］ なら、7行目を 実行する",
      "    t15 を 1 増やす",
      "  そうではなく、i を 3 で 割った余りが 0 なら、9行目を 実行する",
      "    t3 を 1 増やす",
      "  そうではなく、［b］ なら、11行目を 実行する",
      "    t5 を 1 増やす",
      "  （ここで 分かれ道は おわり）",
      "（くりかえす 範囲は ここまで。5行目に もどる）",
    ],
    code: [
      "整数型: t15 ← 0",
      "整数型: t3 ← 0",
      "整数型: t5 ← 0",
      "整数型: i",
      "for (i を 1 から 15 まで 1 ずつ増やす)",
      "  if (［a］)",
      "    t15 ← t15 ＋ 1",
      "  elseif (i mod 3 が 0 と等しい)",
      "    t3 ← t3 ＋ 1",
      "  elseif (［b］)",
      "    t5 ← t5 ＋ 1",
      "  endif",
      "endfor",
    ],
  },
  notes: ["i mod 3 は，i を 3 で割った余りである。"],
  question:
    "次のプログラムは、1 から 15 までの 整数を 調べ、3 と 5 の 両方で 割り切れる 数の 個数を t15 に、3 で 割り切れるが 5 では 割り切れない 数の 個数を t3 に、5 で 割り切れるが 3 では 割り切れない 数の 個数を t5 に 格納する。\nプログラム中の ［a］ と ［b］ に入れる 正しい答えの 組合せは どれか。",
  answerType: "blank",
  blanks: ["a", "b"],
  choices: [
    { ja: "a：i mod 15 が 0 と等しい　b：i mod 5 が 0 と等しい", code: "a：i mod 15 が 0 と等しい　b：i mod 5 が 0 と等しい", fill: { a: "i mod 15 が 0 と等しい", b: "i mod 5 が 0 と等しい" }, correct: true },
    {
      ja: "a：i mod 3 が 0 と等しい　b：i mod 5 が 0 と等しい",
      code: "a：i mod 3 が 0 と等しい　b：i mod 5 が 0 と等しい",
      fill: { a: "i mod 3 が 0 と等しい", b: "i mod 5 が 0 と等しい" },
      wrongFeedback: "6行目が「3 で 割り切れる」だと、3、6、9、12 も t15 に 数えられ、8行目の t3 には 1つも 来ません。両方で 割り切れる 数を 最初に 取り分けます。",
      events: cond10Run("i mod 3 が 0 と等しい", "i mod 5 が 0 と等しい"),
    },
    {
      ja: "a：i mod 15 が 0 と等しい　b：i mod 15 が 0 と等しい",
      code: "a：i mod 15 が 0 と等しい　b：i mod 15 が 0 と等しい",
      fill: { a: "i mod 15 が 0 と等しい", b: "i mod 15 が 0 と等しい" },
      wrongFeedback: "10行目に 来るのは、15 でも 3 でも 割り切れない 数です。そこで「15 で 割り切れる」を 調べても 成り立つことは なく、5、10 が t5 に 数えられません。",
      events: cond10Run("i mod 15 が 0 と等しい", "i mod 15 が 0 と等しい"),
    },
    {
      ja: "a：(i mod 3 が 0 と等しい) or (i mod 5 が 0 と等しい)　b：i mod 5 が 0 と等しい",
      code: "a：(i mod 3 が 0 と等しい) or (i mod 5 が 0 と等しい)　b：i mod 5 が 0 と等しい",
      fill: { a: "(i mod 3 が 0 と等しい) or (i mod 5 が 0 と等しい)", b: "i mod 5 が 0 と等しい" },
      wrongFeedback: "or（または）は どちらか 片方で 成り立つので、3 の倍数も 5 の倍数も すべて t15 に 数えられて しまいます。両方で 割り切れるのは 15 で 割り切れる 数です。",
      events: cond10Run("(i mod 3 が 0 と等しい) or (i mod 5 が 0 と等しい)", "i mod 5 が 0 と等しい"),
    },
  ],
  events: [...cond10Run("i mod 15 が 0 と等しい", "i mod 5 が 0 と等しい"), end()],
  expectedFinal: { vars: { t15: 1, t3: 4, t5: 2 } },
  hints: [
    "if / elseif は 上から 調べて、最初に 成り立った所だけを 実行します。15 は 3 でも 5 でも 割り切れるので、どの条件を 先に 調べるかが だいじです。",
    "3 と 5 の 両方で 割り切れる 数は、15 で 割り切れる 数です。それを 最初に 取り分ければ、8行目に 来るのは「3 で 割り切れるが 5 では 割り切れない」数だけに なります。",
    "a は「i mod 15 が 0 と等しい」、b は「i mod 5 が 0 と等しい」。t15＝1（15）、t3＝4（3, 6, 9, 12）、t5＝2（5, 10）です。",
  ],
  explanation: {
    why: "上から順に調べるので、いちばん せまい「両方で割り切れる（15 で割り切れる）」を 最初に 調べます。8行目に来るのは 15 で割り切れない数なので、3 で割り切れれば「3 だけで割り切れる」数。10行目に来るのは 15 でも 3 でも割り切れない数なので、5 で割り切れれば「5 だけで割り切れる」数です。t15＝1、t3＝4、t5＝2 です。",
    trace: [
      { line: 9, state: "i=3, 6, 9, 12 → t3 が 1 ずつ 増える" },
      { line: 11, state: "i=5, 10 → t5 が 1 ずつ 増える" },
      { line: 7, state: "i=15 → t15=1" },
    ],
    points: ["if / elseif は 最初に 成り立った所だけを 実行する。せまい条件を 先に 書く", "elseif に 来たときは、上の条件が 成り立たなかったことが 分かっている"],
  },
};

export default [cond1, cond2, cond3, cond4, cond5, cond6, cond7, cond8, cond9, cond10];
