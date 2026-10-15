// あいさつ＋遊び方案内のページ定義（§4.1b）
// react: アルゴくんのリアクション（jump=小ジャンプ / float=ふわふわ / cheer=よろこぶ）
// demo:  ページ内に出す小さなデモの種類（tutorial.js が描画する）
export const TUTORIAL_PAGES = [
  {
    title: "あいさつ",
    text: "はじめまして！ ぼくは アルゴくん。いっしょに アルゴリズムを たんけんしよう！",
    react: "jump",
    demo: null,
  },
  {
    title: "ゲームの もくてき",
    text: "しょりを よく よんで、ぼくが どうなるか、へんすうが いくつに なるかを 4つの なかから えらんでね。",
    react: "float",
    demo: "choices",
  },
  {
    title: "がめんの みかた",
    text: "ひだりが フィールド。ぼくが うごく ばしょだよ。みぎに しょりと もんだいと こたえが あるよ。",
    react: "float",
    demo: "layout",
  },
  {
    title: "へんすう",
    text: "これが へんすうの ボックス。「x ← 5」なら、ぼくが 5を はこんで ボックスに いれるよ。",
    react: "float",
    demo: "var",
  },
  {
    title: "にほんご／ぎじコード",
    text: "しょりは「にほんご」と「ぎじコード」で きりかえられるよ。どっちも おなじ しょり。すきな ほうで よんでね。",
    react: "float",
    demo: "toggle",
  },
  {
    title: "こたえた あと",
    text: "えらんだ こたえどおりに ぼくが うごくよ。あってたら ○ と ピンポン！ ちがってたら × と ぶっぶー！ なんどでも ちょうせんできるよ。",
    react: "float",
    demo: "speed",
  },
  {
    title: "コインと ヒント",
    text: "こまったら ヒントを つかえるよ。コインが なくても ちゃんと すすめるから あんしんしてね。じゃあ、いこう！",
    react: "cheer",
    demo: "coins",
  },
];

/** ページ4のデモ用ミニステージ（x ← 5） */
export const TUTORIAL_VAR_DEMO = {
  id: "tutorial-demo",
  genre: "var",
  level: 1,
  title: "デモ",
  field: {
    cols: 5,
    rows: 2,
    tiles: [".....", "....."],
    start: { x: 1, y: 1, dir: "right" },
    spawn: { x: 0, y: 1 },
    boxes: [{ var: "x", x: 4, y: 0 }],
    pads: [],
    items: [],
    arrays: [],
    switches: [],
    doors: [],
    stacks: [],
    queues: [],
  },
  vars: {},
  varColors: { x: "#4FC3F7" },
  program: { ja: ["x に 5 を入れる"], code: ["x ← 5"] },
  events: [
    { type: "line", n: 1 },
    { type: "spawnItem", id: "five", value: 5, x: 0, y: 1 },
    { type: "pickup", id: "five" },
    { type: "store", id: "five", box: "x" },
    { type: "end" },
  ],
};
