// ② cond（わかれみち）
import { line, moves, takeCopy, put, spawnOnPad, compare, emote, end, mismatch } from "./helpers.js";

const C1_FIELD = {
  cols: 7,
  rows: 5,
  tiles: ["       ", " ....  ", " ....  ", " ....  ", "       "],
  start: { x: 1, y: 2, dir: "right" },
  boxes: [{ var: "x", x: 0, y: 2, access: { x: 1, y: 2 } }],
  pads: [{ kind: "compare", x: 0, y: 1, access: { x: 1, y: 2 } }],
  items: [],
  arrays: [],
  switches: [],
  doors: [],
  stacks: [],
  queues: [],
};

const checkX = [line(1), takeCopy("x", "cx"), put("cx", "compare"), spawnOnPad("n5", 5, "compare"), compare("7 ≧ 5", true)];

const cond1 = {
  id: "cond-1",
  genre: "cond",
  level: 1,
  title: "わかれみち",
  concepts: ["if"],
  intro: "「もし ～ なら」は、じょうけんが なりたつ ときだけ すすむ みちを えらぶよ。\nなりたたない ときは「そうでなければ」の みちへ。",
  field: C1_FIELD,
  vars: { x: 7 },
  varColors: { x: "#4FC3F7" },
  program: {
    ja: ["もし x が 5 以上なら", "　上へ 1マス 進む", "そうでなければ", "　下へ 1マス 進む", "右へ 2マス 進む"],
    code: ["もし x ≧ 5 ならば", "　上(1)", "そうでなければ", "　下(1)", "右(2)"],
  },
  question: "この処理を実行したあと、アルゴくんはどこにいますか？（x の値は 7）",
  answerType: "pos-rel",
  choices: [
    { ja: "スタートから 右に2マス、上に1マス", code: "(x, y) = (+2, −1)", correct: true },
    {
      ja: "スタートから 下に1マス、右に2マス",
      code: "(x, y) = (+2, +1)",
      wrongFeedback: "x は 7 なので、条件 x ≧ 5 は成り立ちます。成り立つときは「上へ」の側です。",
      events: [line(1), emote("think"), line(3), line(4), ...moves("down"), line(5), ...moves("right", 2), mismatch()],
    },
    {
      ja: "スタートから 右に2マスだけ",
      code: "(x, y) = (+2, 0)",
      wrongFeedback: "条件が成り立つと、2行目の「上へ1マス」が実行されます。どちらの道も進まない、ということはありません。",
      events: [line(1), emote("think"), line(5), ...moves("right", 2), mismatch()],
    },
    {
      ja: "スタートから 上に1マスだけ",
      code: "(x, y) = (0, −1)",
      wrongFeedback: "5行目の「右へ2マス」は分岐の外なので、条件に関係なく実行されます。",
      events: [...checkX, line(2), ...moves("up"), mismatch("あれ？ まだ とちゅう みたい…")],
    },
  ],
  events: [...checkX, line(2), ...moves("up"), line(5), ...moves("right", 2), end()],
  expectedFinal: { pos: { x: 3, y: 1 }, vars: { x: 7 } },
  hints: [
    "まず「x が 5 以上」かどうかを たしかめよう。x は いくつ？",
    "条件が成り立つときは2行目、成り立たないときは4行目だけが実行されます。5行目はどちらの場合も実行されます。",
    "7 ≧ 5 は成り立つので「上へ1マス」。そのあと「右へ2マス」進みます。",
  ],
  explanation: {
    why: "x は 7 なので「x ≧ 5」は真です。2行目の「上へ1マス」が実行され、4行目は実行されません。そのあと5行目の「右へ2マス」は分岐の外なので必ず実行されます。",
    trace: [
      { line: 1, state: "x=7、7 ≧ 5 は 真　位置：(1,2)" },
      { line: 2, state: "位置：(1,1)" },
      { line: 5, state: "位置：(3,1)" },
    ],
    points: ["条件が真のときだけ if 側が実行される", "分岐のあとの処理は両方の場合に実行される"],
  },
};

export default [cond1];
