// ジャンル定義（§10.1）。place はワールドマップ上のエリア名
export const GENRES = [
  { key: "var", place: "順序と変数の村", num: "①", name: "順序と変数", desc: "順次実行、代入、変数の更新、値の交換" },
  { key: "cond", place: "分かれ道の森", num: "②", name: "分かれ道", desc: "条件分岐（if / else if / else）、複合条件" },
  { key: "loop", place: "ぐるぐる風車の丘", num: "③", name: "ぐるぐる回る", desc: "繰り返し、回数、ループ変数、合計・カウント" },
  { key: "arr", place: "並んだボックスの港", num: "④", name: "並んだボックス", desc: "配列の添字、読み書き、合計・最大最小" },
  { key: "search", place: "探せ！の洞窟", num: "⑤", name: "探せ！", desc: "線形探索、番兵、二分探索" },
  { key: "sort", place: "並べ替えの花畑", num: "⑥", name: "並べ替え", desc: "交換、選択ソート、バブルソート、挿入ソート" },
  { key: "stack", place: "積み重ねの塔", num: "⑦", name: "積み重ね・並ぶ", desc: "スタック、キュー" },
  { key: "rec", place: "呼び出しの遺跡", num: "⑧", name: "繰り返し呼び出す", desc: "再帰（階乗、フィボナッチ、互除法）" },
  { key: "maze", place: "迷路の城", num: "⑨", name: "迷路", desc: "右手法、深さ優先探索、幅優先探索" },
];

export const LEVELS = [
  { level: 1, name: "入門", color: "#43A047" },
  { level: 2, name: "簡単", color: "#29B6F6" },
  { level: 3, name: "普通", color: "#FBC02D" },
  { level: 4, name: "やや難しい", color: "#FB8C00" },
  { level: 5, name: "難しい", color: "#E53935" },
  // 6〜10：穴埋め（科目Bの「空欄に入れる正しい答えはどれか」の形）。むずかしさは 1〜5 と同じ段階
  { level: 6, name: "穴埋め入門", color: "#43A047", blank: true },
  { level: 7, name: "穴埋め簡単", color: "#29B6F6", blank: true },
  { level: 8, name: "穴埋め普通", color: "#FBC02D", blank: true },
  { level: 9, name: "穴埋めやや難しい", color: "#FB8C00", blank: true },
  { level: 10, name: "穴埋め難しい", color: "#E53935", blank: true },
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
