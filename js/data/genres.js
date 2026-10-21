// ジャンル定義（§10.1）。place はワールドマップ上のエリア名
export const GENRES = [
  { key: "var", place: "じゅんじょと へんすうの村", num: "①", name: "じゅんじょと へんすう", desc: "順次実行、代入、変数の更新、値の交換" },
  { key: "cond", place: "わかれみちの森", num: "②", name: "わかれみち", desc: "条件分岐（if / else if / else）、複合条件" },
  { key: "loop", place: "ぐるぐる風車の丘", num: "③", name: "ぐるぐる まわる", desc: "繰り返し、回数、ループ変数、合計・カウント" },
  { key: "arr", place: "ならんだ ぼっくすの港", num: "④", name: "ならんだ ぼっくす", desc: "配列の添字、読み書き、合計・最大最小" },
  { key: "search", place: "さがせ！の洞くつ", num: "⑤", name: "さがせ！", desc: "線形探索、番兵、二分探索" },
  { key: "sort", place: "ならびかえの花畑", num: "⑥", name: "ならびかえ", desc: "交換、選択ソート、バブルソート、挿入ソート" },
  { key: "stack", place: "つみかさねの塔", num: "⑦", name: "つみかさね・ならぶ", desc: "スタック、キュー" },
  { key: "rec", place: "よびだしの遺跡", num: "⑧", name: "くりかえし よびだす", desc: "再帰（階乗、フィボナッチ、互除法）" },
  { key: "maze", place: "めいろの城", num: "⑨", name: "めいろ", desc: "右手法、深さ優先探索、幅優先探索" },
];

export const LEVELS = [
  { level: 1, name: "入門", color: "#43A047" },
  { level: 2, name: "かんたん", color: "#29B6F6" },
  { level: 3, name: "ふつう", color: "#FBC02D" },
  { level: 4, name: "ややむずかしい", color: "#FB8C00" },
  { level: 5, name: "むずかしい", color: "#E53935" },
  // 6〜10：穴埋め（科目Bの「空欄に入れる正しい答えはどれか」の形）。むずかしさは 1〜5 と同じ段階
  { level: 6, name: "あなうめ 入門", color: "#43A047", blank: true },
  { level: 7, name: "あなうめ かんたん", color: "#29B6F6", blank: true },
  { level: 8, name: "あなうめ ふつう", color: "#FBC02D", blank: true },
  { level: 9, name: "あなうめ ややむずかしい", color: "#FB8C00", blank: true },
  { level: 10, name: "あなうめ むずかしい", color: "#E53935", blank: true },
];

export const MAX_LEVEL = LEVELS.length;
export const MAX_STARS = LEVELS.length * 3;

/** むずかしさの★の数（1〜5。穴埋めも 1〜5 で数える） */
export function difficulty(level) {
  return ((level - 1) % 5) + 1;
}

export function genreOf(key) {
  return GENRES.find((g) => g.key === key);
}
