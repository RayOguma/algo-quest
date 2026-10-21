// あいさつ＋遊び方案内のページ定義（§4.1b）
// react: アルゴくんのリアクション（jump=小ジャンプ / float=ふわふわ / cheer=よろこぶ）
// demo:  ページ内に出す小さなデモの種類（tutorial.js が描画する）
export const TUTORIAL_PAGES = [
  {
    title: "あいさつ",
    text: "はじめまして！ぼくはアルゴくん。一緒にアルゴリズムを探検しよう！",
    react: "jump",
    demo: null,
  },
  {
    title: "ゲームの目的",
    text: "処理をよく読んで、ぼくがどうなるか、変数がいくつになるかを 4つの中から選んでね。",
    react: "float",
    demo: "choices",
  },
  {
    title: "画面の見方",
    text: "左がフィールド。ぼくが動く場所だよ。右に処理と問題と答えがあるよ。",
    react: "float",
    demo: "layout",
  },
  {
    title: "変数",
    text: "これが変数のボックス。「x に 5 を入れる」（疑似コードでは x ← 5）なら、ぼくが 5 を運んでボックスに入れるよ。",
    react: "float",
    demo: "var",
  },
  {
    title: "疑似コード／日本語",
    text: "処理は「疑似コード」で出るよ。読みにくいときは「日本語」に切り替えると、意味をかみくだいた文で読めるよ。",
    react: "float",
    demo: "toggle",
  },
  {
    title: "答えたあと",
    text: "答えるとぼくが正しい処理を実演するよ。合ってたら ○！違ってたら、読みがずれたところの手前で止まって、見直す行を黄色で教えるよ。速さは 1・2・4倍から選べるよ。",
    react: "float",
    demo: "speed",
  },
  {
    title: "ここまで進める",
    text: "処理の行を押すと、そこまで実演を進めて変数の動きを見られるよ。繰り返しは何回目まで進めるか選べるよ。コインを使うけど、一度見たところまでは無料！",
    react: "float",
    demo: "peek",
  },
  {
    title: "メモ",
    text: "「📝 メモ」を押すと、変数の値や気づいたことを書き込めるよ。メモは問題ごとに残るよ。",
    react: "float",
    demo: "memo",
  },
  {
    title: "穴埋め問題",
    text: "レベル6からは穴埋め問題。処理の ［a］ に入るものを選ぶよ。間違えたら、その処理で動かして、目的とどこが違うかを見せるよ。「ここまで進める」は穴の手前まで使えるよ。",
    react: "float",
    demo: "blank",
  },
  {
    title: "コインとヒント",
    text: "困ったらヒントを使えるよ。コインはクリアや毎日のログインボーナスでもらえるよ。コインがなくてもちゃんと進めるから安心してね。じゃあ、行こう！",
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
