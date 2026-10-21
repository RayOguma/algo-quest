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
    text: "これが へんすうの ボックス。「x に 5 を入れる」（ぎじコードでは x ← 5）なら、ぼくが 5を はこんで ボックスに いれるよ。",
    react: "float",
    demo: "var",
  },
  {
    title: "ぎじコード／にほんご",
    text: "しょりは「ぎじコード」で でるよ。よみにくい ときは「日本語」に きりかえると、いみを かみくだいた ぶんで よめるよ。",
    react: "float",
    demo: "toggle",
  },
  {
    title: "こたえた あと",
    text: "こたえると ぼくが ただしい しょりを じつえんするよ。あってたら ○！ ちがってたら、よみが ずれた ところの てまえで とまって、みなおす ぎょうを きいろで おしえるよ。はやさは 1・2・4ばいから えらべるよ。",
    react: "float",
    demo: "speed",
  },
  {
    title: "ここまで すすめる",
    text: "しょりの ぎょうを おすと、そこまで じつえんを すすめて へんすうの うごきを みられるよ。くりかえしは なんかいめまで すすめるか えらべるよ。コインを つかうけど、いちど みた ところまでは むりょう！",
    react: "float",
    demo: "peek",
  },
  {
    title: "メモ",
    text: "「📝 メモ」を おすと、へんすうの あたいや きづいた ことを かきこめるよ。メモは もんだいごとに のこるよ。",
    react: "float",
    demo: "memo",
  },
  {
    title: "あなうめ もんだい",
    text: "レベル6からは あなうめ もんだい。しょりの ［a］ に はいる ものを えらぶよ。まちがえたら、その しょりで うごかして、もくてきと どこが ちがうかを みせるよ。「ここまで すすめる」は あなの てまえまで つかえるよ。",
    react: "float",
    demo: "blank",
  },
  {
    title: "コインと ヒント",
    text: "こまったら ヒントを つかえるよ。コインは クリアや まいにちの ログインボーナスで もらえるよ。コインが なくても ちゃんと すすめるから あんしんしてね。じゃあ、いこう！",
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
