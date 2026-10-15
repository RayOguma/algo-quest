// ジャンル定義（§10.1）
export const GENRES = [
  { key: "var", num: "①", name: "じゅんじょと へんすう", desc: "順次実行、代入、変数の更新、値の交換" },
  { key: "cond", num: "②", name: "わかれみち", desc: "条件分岐（if / else if / else）、複合条件" },
  { key: "loop", num: "③", name: "ぐるぐる まわる", desc: "繰り返し、回数、ループ変数、合計・カウント" },
  { key: "arr", num: "④", name: "ならんだ ぼっくす", desc: "配列の添字、読み書き、合計・最大最小" },
  { key: "search", num: "⑤", name: "さがせ！", desc: "線形探索、番兵、二分探索" },
  { key: "sort", num: "⑥", name: "ならびかえ", desc: "交換、選択ソート、バブルソート、挿入ソート" },
  { key: "stack", num: "⑦", name: "つみかさね・ならぶ", desc: "スタック、キュー" },
  { key: "rec", num: "⑧", name: "くりかえし よびだす", desc: "再帰（階乗、フィボナッチ、互除法）" },
  { key: "maze", num: "⑨", name: "めいろ", desc: "右手法、深さ優先探索、幅優先探索" },
];

export const LEVELS = [
  { level: 1, name: "入門", color: "#43A047" },
  { level: 2, name: "かんたん", color: "#29B6F6" },
  { level: 3, name: "ふつう", color: "#FBC02D" },
  { level: 4, name: "ややむずかしい", color: "#FB8C00" },
  { level: 5, name: "むずかしい", color: "#E53935" },
];

export function genreOf(key) {
  return GENRES.find((g) => g.key === key);
}
