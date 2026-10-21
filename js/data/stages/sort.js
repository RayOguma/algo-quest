// ⑥ sort（並べ替え）
// 交換は tmp を使って 3 回運ぶ（仕様 §6.2⑤）。結果の値はここで計算して書き、検証スクリプトが照合する。
import { line, end, emote, builder, autoField } from "./helpers.js";

/** for の制御行：1周目は初期値を入れ、2周目からは 1 増やす */
const forStep = (B, n, v, value, first) => [line(n), ...(first ? B.set(v, value) : B.calc(v, [v, 1], `${v} ＋ 1`, value))];
const error = (reason) => [emote("think"), { type: "fail", kind: "error", reason }];
/** ln 行目から 3 行で p と q を交換する（tmp ← p、p ← q、q ← tmp） */
const swap3 = (B, ln, p, q) => [line(ln), ...B.copy("tmp", p), line(ln + 1), ...B.copy(p, q), line(ln + 2), ...B.copy(q, "tmp")];
const swapArr = (arr, p, q) => ([arr[p - 1], arr[q - 1]] = [arr[q - 1], arr[p - 1]]);
const fmt = (arr) => `{${arr.join(", ")}}`;

// ---- sort-1：2 つの要素の交換 ----
const F1 = autoField(["tmp"], { calc: false, arrays: [{ name: "a", values: [5, 9, 2] }] });
function sort1Events() {
  const B = builder(F1);
  return [line(1), line(2), ...swap3(B, 3, "a[1]", "a[3]")];
}

const sort1 = {
  id: "sort-1",
  genre: "sort",
  level: 1,
  title: "入れ替えよう",
  concepts: ["swap", "array"],
  intro: "並べ替えの基本は、2 つの値の交換。\n片方を tmp に取っておいてから入れ替えるよ。",
  field: F1,
  vars: {},
  varColors: { a: "#FFA726", tmp: "#9575CD" },
  program: {
    ja: [
      "整数の配列 a を用意して、{5, 9, 2} を入れる",
      "整数の変数 tmp を用意する",
      "a の 1番目の値を tmp に写す",
      "a の 3番目の値を a の 1番目に写す",
      "tmp の値を a の 3番目に写す",
    ],
    code: ["整数型の配列: a ← {5, 9, 2}", "整数型: tmp", "tmp ← a[1]", "a[1] ← a[3]", "a[3] ← tmp"],
  },
  notes: ["配列の要素番号は 1 から始まる。"],
  question: "プログラムを実行し終わったときの配列 a の内容はどれか。",
  answerType: "arrays",
  choices: [
    { ja: "a は {2, 9, 5}", code: "a = {2, 9, 5}", correct: true },
    {
      ja: "a は {2, 9, 2}",
      code: "a = {2, 9, 2}",
      wrongFeedback: "3行目で tmp に写した 5 は、4行目で a[1] が 2 に変わっても 5 のままです。5行目で a[3] に入るのは 5 です。",
      stop: { line: 5 },
    },
    {
      ja: "a は {5, 9, 5}",
      code: "a = {5, 9, 5}",
      wrongFeedback: "4行目は「a[3] の値を a[1] に写す」です。右側（a[3]）の値が左側（a[1]）に入ります。向きを逆にしていませんか？",
      stop: { line: 4 },
    },
    {
      ja: "a は {9, 5, 2}",
      code: "a = {9, 5, 2}",
      wrongFeedback: "入れ替えるのは a[1] と a[3]（1番目と 3番目）です。隣の a[2] ではありません。",
      stop: { line: 4 },
    },
  ],
  events: [...sort1Events(), end()],
  expectedFinal: { arrays: { a: [2, 9, 5] } },
  hints: [
    "3行目で tmp に a[1] の 5 が入ります。4行目で a[1] に a[3] の 2 が入り、a は {2, 9, 2} になります。",
    "tmp に取っておいた値は、a[1] が書き換わっても変わりません。",
    "5行目で a[3] に tmp の 5 が入ります。",
  ],
  explanation: {
    why: "a[1] をいきなり上書きすると 5 が消えてしまうので、先に tmp に取っておきます。tmp＝5、a[1]＝2、a[3]＝5 の順に運んで、a[1] と a[3] が入れ替わり {2, 9, 5} になります。",
    trace: [
      { line: 3, state: "tmp=5" },
      { line: 4, state: "a=[2, 9, 2]" },
      { line: 5, state: "a=[2, 9, 5]" },
    ],
    points: ["交換は「tmp に取っておく → 上書き → tmp から戻す」の 3 行", "並べ替えは、この交換をくり返して行う"],
  },
};

// ---- sort-2：隣どうしを比べて交換（1周） ----
const A2 = [7, 4, 2];
const F2 = autoField(["i", "tmp"], { compare: true, arrays: [{ name: "a", values: A2 }] });
function sort2Events() {
  const B = builder(F2);
  const arr = [...A2];
  const ev = [line(1), line(2)];
  for (let i = 1; i <= 2; i++) {
    const big = arr[i - 1] > arr[i];
    ev.push(...forStep(B, 3, "i", i, i === 1), line(4), ...B.cmp([`a[${i}]`, `a[${i + 1}]`], `${arr[i - 1]} ＞ ${arr[i]}`, big));
    if (big) {
      ev.push(...swap3(B, 5, `a[${i}]`, `a[${i + 1}]`));
      swapArr(arr, i, i + 1);
    }
    ev.push(line(8), line(9));
  }
  return ev;
}

const sort2 = {
  id: "sort-2",
  genre: "sort",
  level: 2,
  title: "大きい方を右へ",
  concepts: ["swap", "for", "if"],
  field: F2,
  vars: {},
  varColors: { a: "#FFA726", i: "#4FC3F7", tmp: "#9575CD" },
  program: {
    ja: [
      "整数の配列 a を用意して、{7, 4, 2} を入れる",
      "整数の変数 i と tmp を用意する",
      "i を 1 から 2 まで 1ずつ増やしながら、4〜8行目を繰り返す",
      "  もし a の i番目が a の（i ＋ 1）番目より大きいなら、5〜7行目を実行する",
      "    a の i番目の値を tmp に写す",
      "    a の（i ＋ 1）番目の値を a の i番目に写す",
      "    tmp の値を a の（i ＋ 1）番目に写す",
      "  （ここで分かれ道は終わり）",
      "（繰り返す範囲はここまで。3行目に戻る）",
    ],
    code: [
      "整数型の配列: a ← {7, 4, 2}",
      "整数型: i, tmp",
      "for (i を 1 から 2 まで 1 ずつ増やす)",
      "  if (a[i] が a[i ＋ 1] より大きい)",
      "    tmp ← a[i]",
      "    a[i] ← a[i ＋ 1]",
      "    a[i ＋ 1] ← tmp",
      "  endif",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。"],
  question: "プログラムを実行し終わったときの配列 a の内容はどれか。",
  answerType: "arrays",
  choices: [
    { ja: "a は {4, 2, 7}", code: "a = {4, 2, 7}", correct: true },
    {
      ja: "a は {2, 4, 7}",
      code: "a = {2, 4, 7}",
      wrongFeedback: "繰り返しは i＝1、2 の 2 回だけです。隣どうしを 1 周比べると、一番大きい 7 が右端に移りますが、全体が並ぶとは限りません。",
      stop: { line: 4, nth: 2, mark: [3] },
    },
    {
      ja: "a は {4, 7, 2}",
      code: "a = {4, 7, 2}",
      wrongFeedback: "i＝2 のときは a[2] と a[3] を比べます。a[2] は i＝1 の交換で 7 に変わっているので、7 と 2 を比べて交換します。",
      stop: { line: 4, nth: 2 },
    },
    {
      ja: "a は {7, 4, 2}",
      code: "a = {7, 4, 2}",
      wrongFeedback: "4行目は「a[i] が a[i ＋ 1] より大きい」ときに交換します。7 は 4 より大きいので、i＝1 で交換します。",
      stop: { line: 5, mark: [4] },
    },
  ],
  events: [...sort2Events(), end()],
  expectedFinal: { arrays: { a: [4, 2, 7] } },
  hints: [
    "i＝1 のとき、a[1]＝7 は a[2]＝4 より大きいので交換して、a は {4, 7, 2} になります。",
    "i＝2 のときは、交換したあとの a[2] と a[3] を比べます。",
    "7 と 2 を比べて交換すると、a はどうなるかな？ i は 2 までです。",
  ],
  explanation: {
    why: "隣どうしを比べて、左の方が大きければ交換します。7 と 4 を交換して {4, 7, 2}、7 と 2 を交換して {4, 2, 7}。1 周で一番大きい 7 が右端に移ります（全体はまだ並んでいません）。",
    trace: [
      { line: 7, state: "i=1：7 ＞ 4 → a=[4, 7, 2]" },
      { line: 7, state: "i=2：7 ＞ 2 → a=[4, 2, 7]" },
    ],
    points: ["隣どうしを比べて大きい方を右へ送ると、1 周で最大値が右端に来る", "交換した値は、次の比較でそのまま使われる"],
  },
};

// ---- sort-3：選択ソートの途中経過 ----
const A3 = [5, 7, 8, 1, 4];
const F3 = autoField(["i", "j", "m", "tmp"], { compare: true, arrays: [{ name: "a", values: A3 }] });
function sort3Events() {
  const B = builder(F3);
  const arr = [...A3];
  const ev = [line(1), line(2)];
  for (let i = 1; i <= 2; i++) {
    ev.push(...forStep(B, 3, "i", i, i === 1), line(4), ...B.copy("m", "i"));
    let m = i;
    for (let j = i + 1; j <= 5; j++) {
      const small = arr[j - 1] < arr[m - 1];
      ev.push(line(5), ...(j === i + 1 ? B.calc("j", ["i", 1], "i ＋ 1", j) : B.calc("j", ["j", 1], "j ＋ 1", j)));
      ev.push(line(6), ...B.cmp([`a[${j}]`, `a[${m}]`], `${arr[j - 1]} ＜ ${arr[m - 1]}`, small));
      if (small) {
        m = j;
        ev.push(line(7), ...B.copy("m", "j"));
      }
      ev.push(line(8), line(9));
    }
    ev.push(...swap3(B, 10, `a[${i}]`, `a[${m}]`));
    swapArr(arr, i, m);
    ev.push(line(13));
  }
  return ev;
}

const sort3 = {
  id: "sort-3",
  genre: "sort",
  level: 3,
  title: "一番小さいのを前へ",
  concepts: ["selection-sort", "nested"],
  field: F3,
  vars: {},
  varColors: { a: "#FFA726", i: "#4FC3F7", j: "#9575CD", m: "#F06292", tmp: "#26A69A" },
  program: {
    ja: [
      "整数の配列 a を用意して、{5, 7, 8, 1, 4} を入れる",
      "整数の変数 i、j、m、tmp を用意する",
      "i を 1 から 2 まで 1ずつ増やしながら、4〜12行目を繰り返す",
      "  i の値を m に写す",
      "  j を i ＋ 1 から 5 まで 1ずつ増やしながら、6〜8行目を繰り返す",
      "    もし a の j番目が a の m番目より小さいなら、7行目を実行する",
      "      j の値を m に写す",
      "    （ここで分かれ道は終わり）",
      "  （内側の繰り返す範囲はここまで。5行目に戻る）",
      "  a の i番目の値を tmp に写す",
      "  a の m番目の値を a の i番目に写す",
      "  tmp の値を a の m番目に写す",
      "（外側の繰り返す範囲はここまで。3行目に戻る）",
    ],
    code: [
      "整数型の配列: a ← {5, 7, 8, 1, 4}",
      "整数型: i, j, m, tmp",
      "for (i を 1 から 2 まで 1 ずつ増やす)",
      "  m ← i",
      "  for (j を i ＋ 1 から 5 まで 1 ずつ増やす)",
      "    if (a[j] が a[m] より小さい)",
      "      m ← j",
      "    endif",
      "  endfor",
      "  tmp ← a[i]",
      "  a[i] ← a[m]",
      "  a[m] ← tmp",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。"],
  question: "プログラムを実行し終わったときの配列 a の内容はどれか。",
  answerType: "arrays",
  choices: [
    { ja: "a は {1, 4, 8, 5, 7}", code: "a = {1, 4, 8, 5, 7}", correct: true },
    {
      ja: "a は {1, 4, 5, 7, 8}",
      code: "a = {1, 4, 5, 7, 8}",
      wrongFeedback: "外側の繰り返しは i＝1、2 の 2 回だけです。前の 2 つは決まりますが、3番目から後ろはまだ並べ替えていません。",
      stop: { line: 4, nth: 2, mark: [3] },
    },
    {
      ja: "a は {1, 7, 8, 5, 4}",
      code: "a = {1, 7, 8, 5, 4}",
      wrongFeedback: "外側の繰り返しは i＝2 のときも実行します。2番目から後ろ（7, 8, 5, 4）の最小値 4 を 2番目と交換します。",
      stop: { line: 4, nth: 2 },
    },
    {
      ja: "a は {8, 7, 5, 1, 4}",
      code: "a = {8, 7, 5, 1, 4}",
      wrongFeedback: "6行目は「a[j] が a[m] より小さい」ときに m を j にします。m は一番小さい要素の要素番号になります。大きい方を探していませんか？",
      stop: { line: 6 },
    },
  ],
  events: [...sort3Events(), end()],
  expectedFinal: { arrays: { a: [1, 4, 8, 5, 7] } },
  hints: [
    "i＝1 のとき、内側の繰り返しで a[1]〜a[5] の一番小さい値の要素番号を探します。最小値 1 は 4番目なので m＝4。10〜12行目で a[1] と a[4] を交換して {1, 7, 8, 5, 4} です。",
    "m は「それまでで一番小さい要素の要素番号」です。i＝2 のときは、2番目から後ろだけで探します。",
    "i＝2 のとき、7, 8, 5, 4 の最小値 4 は 5番目。a[2] と a[5] を交換します。i は 2 までです。",
  ],
  explanation: {
    why: "選択ソートは、まだ並んでいない部分の最小値を探して、その部分の先頭と交換します。i＝1 で最小値 1（4番目）と交換して {1, 7, 8, 5, 4}、i＝2 で 2番目から後ろの最小値 4（5番目）と交換して {1, 4, 8, 5, 7} です。i は 2 までなので、ここで終わります。",
    trace: [
      { line: 12, state: "i=1：最小値 1 は m=4 → a=[1, 7, 8, 5, 4]" },
      { line: 12, state: "i=2：最小値 4 は m=5 → a=[1, 4, 8, 5, 7]" },
    ],
    points: ["選択ソートは、未整列の部分の最小値を探して先頭と交換する", "i 回目が終わると、前から i 個が確定する", "m は値ではなく要素番号"],
  },
};

// ---- sort-4：バブルソートの途中経過 ----
const A4 = [4, 6, 1, 5, 3];
const F4 = autoField(["i", "j", "tmp"], { compare: true, arrays: [{ name: "a", values: A4 }] });
function sort4Events() {
  const B = builder(F4);
  const arr = [...A4];
  const ev = [line(1), line(2)];
  for (let i = 1; i <= 2; i++) {
    ev.push(...forStep(B, 3, "i", i, i === 1));
    for (let j = 1; j <= 5 - i; j++) {
      const big = arr[j - 1] > arr[j];
      ev.push(...forStep(B, 4, "j", j, j === 1), line(5), ...B.cmp([`a[${j}]`, `a[${j + 1}]`], `${arr[j - 1]} ＞ ${arr[j]}`, big));
      if (big) {
        ev.push(...swap3(B, 6, `a[${j}]`, `a[${j + 1}]`));
        swapArr(arr, j, j + 1);
      }
      ev.push(line(9), line(10));
    }
    ev.push(line(11));
  }
  return ev;
}

const sort4 = {
  id: "sort-4",
  genre: "sort",
  level: 4,
  title: "泡のように浮かぶ",
  concepts: ["bubble-sort", "nested"],
  field: F4,
  vars: {},
  varColors: { a: "#FFA726", i: "#4FC3F7", j: "#9575CD", tmp: "#26A69A" },
  program: {
    ja: [
      "整数の配列 a を用意して、{4, 6, 1, 5, 3} を入れる",
      "整数の変数 i、j、tmp を用意する",
      "i を 1 から 2 まで 1ずつ増やしながら、4〜10行目を繰り返す",
      "  j を 1 から 5 － i まで 1ずつ増やしながら、5〜9行目を繰り返す",
      "    もし a の j番目が a の（j ＋ 1）番目より大きいなら、6〜8行目を実行する",
      "      a の j番目の値を tmp に写す",
      "      a の（j ＋ 1）番目の値を a の j番目に写す",
      "      tmp の値を a の（j ＋ 1）番目に写す",
      "    （ここで分かれ道は終わり）",
      "  （内側の繰り返す範囲はここまで。4行目に戻る）",
      "（外側の繰り返す範囲はここまで。3行目に戻る）",
    ],
    code: [
      "整数型の配列: a ← {4, 6, 1, 5, 3}",
      "整数型: i, j, tmp",
      "for (i を 1 から 2 まで 1 ずつ増やす)",
      "  for (j を 1 から 5 － i まで 1 ずつ増やす)",
      "    if (a[j] が a[j ＋ 1] より大きい)",
      "      tmp ← a[j]",
      "      a[j] ← a[j ＋ 1]",
      "      a[j ＋ 1] ← tmp",
      "    endif",
      "  endfor",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "for の終わりの値（5 － i）は，その繰り返しを始めるときの i で決まる。"],
  question: "プログラムを実行し終わったときの配列 a の内容はどれか。",
  answerType: "arrays",
  choices: [
    { ja: "a は {1, 4, 3, 5, 6}", code: "a = {1, 4, 3, 5, 6}", correct: true },
    {
      ja: "a は {1, 3, 4, 5, 6}",
      code: "a = {1, 3, 4, 5, 6}",
      wrongFeedback: "外側の繰り返しは i＝1、2 の 2 回だけです。2 周では、右から 2 つ（5 と 6）が確定するだけで、全体はまだ並んでいません。",
      stop: { line: 4, nth: 6, mark: [3] },
    },
    {
      ja: "a は {4, 1, 5, 3, 6}",
      code: "a = {4, 1, 5, 3, 6}",
      wrongFeedback: "これは 1 周目（i＝1）が終わったときの配列です。i＝2 の周でも、j＝1〜3 で隣どうしを比べて交換します。",
      stop: { line: 3, nth: 2 },
    },
    {
      ja: "a は {6, 5, 4, 3, 1}",
      code: "a = {6, 5, 4, 3, 1}",
      wrongFeedback: "5行目は「a[j] が a[j ＋ 1] より大きい」ときに交換するので、大きい方が右へ移ります。逆に小さい方を右へ送っていませんか？",
      stop: { line: 5 },
    },
  ],
  events: [...sort4Events(), end()],
  expectedFinal: { arrays: { a: [1, 4, 3, 5, 6] } },
  hints: [
    "i＝1 のとき、j は 1 から 4 まで。4 と 6 はそのまま、6 と 1 を交換して {4, 1, 6, 5, 3}…と、大きい 6 が右へ移っていきます。",
    "1 周目が終わると一番大きい値が右端に来るので、2 周目は j を 1 から 3（5 － 2）までにします。",
    "1 周目のあとは {4, 1, 5, 3, 6}。2 周目に j＝1〜3 で比べると、どうなるかな？",
  ],
  explanation: {
    why: "隣どうしを比べて大きい方を右へ送る処理を、2 周行います。1 周目で 6 が右端へ動いて {4, 1, 5, 3, 6}。2 周目は j＝1〜3 で、4 と 1、5 と 3 を交換して {1, 4, 3, 5, 6} です。",
    trace: [
      { line: 8, state: "i=1, j=2：6 ＞ 1 → [4, 1, 6, 5, 3]" },
      { line: 8, state: "i=1, j=3：6 ＞ 5 → [4, 1, 5, 6, 3]" },
      { line: 8, state: "i=1, j=4：6 ＞ 3 → [4, 1, 5, 3, 6]" },
      { line: 8, state: "i=2, j=1：4 ＞ 1 → [1, 4, 5, 3, 6]" },
      { line: 8, state: "i=2, j=3：5 ＞ 3 → [1, 4, 3, 5, 6]" },
    ],
    points: ["バブルソートは隣どうしを比べて交換し、1 周ごとに最大値が右端に確定する", "確定した部分は比べないので、内側の終わりは 5 － i"],
  },
};

// ---- sort-5：交換がなければ打ち切るバブルソート ----
const A5 = [2, 1, 4, 5, 3];
const F5 = autoField(["i", "f", "cmp", "j", "tmp"], { compare: true, arrays: [{ name: "a", values: A5 }] });
function sort5Events() {
  const B = builder(F5);
  const arr = [...A5];
  const ev = [line(1), line(2), line(3), ...B.set("i", 1), line(4), ...B.set("f", 1), line(5), ...B.set("cmp", 0)];
  let [i, f, cmp] = [1, 1, 0];
  for (;;) {
    const go = f === 1 && i <= 4;
    ev.push(line(6), ...B.cmp(["f", 1, "i", 4], `${f} ＝ 1 and ${i} ≦ 4`, go));
    if (!go) break;
    f = 0;
    ev.push(line(7), ...B.set("f", 0));
    for (let j = 1; j <= 5 - i; j++) {
      cmp += 1;
      const big = arr[j - 1] > arr[j];
      ev.push(...forStep(B, 8, "j", j, j === 1), line(9), ...B.calc("cmp", ["cmp", 1], "cmp ＋ 1", cmp));
      ev.push(line(10), ...B.cmp([`a[${j}]`, `a[${j + 1}]`], `${arr[j - 1]} ＞ ${arr[j]}`, big));
      if (big) {
        ev.push(...swap3(B, 11, `a[${j}]`, `a[${j + 1}]`), line(14), ...B.set("f", 1));
        swapArr(arr, j, j + 1);
        f = 1;
      }
      ev.push(line(15), line(16));
    }
    i += 1;
    ev.push(line(17), ...B.calc("i", ["i", 1], "i ＋ 1", i), line(18));
  }
  return ev;
}

const sort5 = {
  id: "sort-5",
  genre: "sort",
  level: 5,
  title: "交換がなければ終わり",
  concepts: ["bubble-sort", "flag", "count"],
  field: F5,
  vars: {},
  varColors: { a: "#FFA726", i: "#4FC3F7", f: "#F06292", cmp: "#66BB6A", j: "#9575CD", tmp: "#26A69A" },
  program: {
    ja: [
      "整数の配列 a を用意して、{2, 1, 4, 5, 3} を入れる",
      "整数の変数 j と tmp を用意する",
      "整数の変数 i を用意して、1 を入れる",
      "整数の変数 f を用意して、1 を入れる",
      "整数の変数 cmp を用意して、0 を入れる",
      "「f が 1 と等しい」と「i が 4 以下」が両方とも成り立つあいだ、7〜17行目を繰り返す",
      "  f に 0 を入れる",
      "  j を 1 から 5 － i まで 1ずつ増やしながら、9〜15行目を繰り返す",
      "    cmp を 1 増やす",
      "    もし a の j番目が a の（j ＋ 1）番目より大きいなら、11〜14行目を実行する",
      "      a の j番目の値を tmp に写す",
      "      a の（j ＋ 1）番目の値を a の j番目に写す",
      "      tmp の値を a の（j ＋ 1）番目に写す",
      "      f に 1 を入れる",
      "    （ここで分かれ道は終わり）",
      "  （内側の繰り返す範囲はここまで。8行目に戻る）",
      "  i を 1 増やす",
      "（繰り返す範囲はここまで。6行目に戻る）",
    ],
    code: [
      "整数型の配列: a ← {2, 1, 4, 5, 3}",
      "整数型: j, tmp",
      "整数型: i ← 1",
      "整数型: f ← 1",
      "整数型: cmp ← 0",
      "while ((f が 1 と等しい) and (i が 4 以下))",
      "  f ← 0",
      "  for (j を 1 から 5 － i まで 1 ずつ増やす)",
      "    cmp ← cmp ＋ 1",
      "    if (a[j] が a[j ＋ 1] より大きい)",
      "      tmp ← a[j]",
      "      a[j] ← a[j ＋ 1]",
      "      a[j ＋ 1] ← tmp",
      "      f ← 1",
      "    endif",
      "  endfor",
      "  i ← i ＋ 1",
      "endwhile",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "for の終わりの値（5 － i）は，その繰り返しを始めるときの i で決まる。"],
  question: "プログラムを実行し終わったときの cmp と i の値の組合せはどれか。",
  answerType: "vars",
  choices: [
    { ja: "cmp は 9、i は 4", code: "cmp = 9, i = 4", correct: true },
    {
      ja: "cmp は 7、i は 3",
      code: "cmp = 7, i = 3",
      wrongFeedback: "2 周目の途中で配列は並び終わりますが、2 周目には交換があったので f＝1 のままです。交換がない周（3 周目）を 1 回行って、f＝0 になってから終わります。",
      stop: { line: 6, nth: 3, mark: [6, 14] },
    },
    {
      ja: "cmp は 10、i は 5",
      code: "cmp = 10, i = 5",
      wrongFeedback: "6行目は「f が 1 と等しい」も成り立つあいだだけ繰り返します。3 周目で一度も交換がなければ f＝0 のままなので、i が 4 以下でも終わります。",
      stop: { line: 6, nth: 3, mark: [6, 7] },
    },
    {
      ja: "cmp は 9、i は 3",
      code: "cmp = 9, i = 3",
      wrongFeedback: "17行目の「i を 1 増やす」は内側の繰り返しの後にあり、交換がなかった 3 周目の最後にも実行されます。",
      stop: { line: 17, nth: 3 },
    },
  ],
  events: [...sort5Events(), end()],
  expectedFinal: { vars: { cmp: 9, i: 4 }, arrays: { a: [1, 2, 3, 4, 5] } },
  hints: [
    "1 周目（i＝1）は j＝1〜4 の 4 回比べます。2 と 1、5 と 3 を交換して {1, 2, 4, 3, 5}、f＝1、cmp＝4 です。",
    "f は「その周で交換があったか」を表します。周の始めに 0 にし、交換したら 1 にします。f が 0 のまま周が終わると、繰り返しを終えます。",
    "2 周目（j＝1〜3）で 4 と 3 を交換して並び終わりますが、f＝1 です。3 周目（j＝1〜2）では交換がありません。cmp と i はいくつになるかな？",
  ],
  explanation: {
    why: "周の始めに f＝0 とし、交換があったら f＝1 にします。交換がない周があれば、もう並んでいるので終わります。1 周目は 4 回比べて 2 回交換、2 周目は 3 回比べて 1 回交換（ここで並び終わる）、3 周目は 2 回比べて交換なし（f＝0）。cmp＝4＋3＋2＝9、i は 3 周分増えて 4 です。",
    trace: [
      { line: 17, state: "1周目：[1, 2, 4, 3, 5]、f=1, cmp=4, i=2" },
      { line: 17, state: "2周目：[1, 2, 3, 4, 5]、f=1, cmp=7, i=3" },
      { line: 17, state: "3周目：交換なし、f=0, cmp=9, i=4" },
      { line: 6, state: "0 ＝ 1 は偽 → 終わり" },
    ],
    points: [
      "交換がない周があれば、もう並び終わっているので打ち切れる（改良バブルソート）",
      "並び終わったことは「交換がない周」を 1 回行って初めて分かる",
      "比較回数は、周ごとの内側の回数（5 － i）の合計",
    ],
  },
};

// ================= 6〜10：穴埋め =================
// 空欄の記号 a・b と まぎれないよう、穴埋めの問題では 変数名・配列名に a・b を使わない。
// 誤答は、その選択肢を空欄に入れたプログラムを実行して見せる（どの誤答も このデータで 目的と ちがう結果になる）。

// ---- sort-6：交換の3行目 ----
const D6 = [8, 3, 6, 1];
const F6 = autoField(["i", "tmp"], { compare: true, arrays: [{ name: "data", values: D6 }] });
function sort6Run(fill) {
  const B = builder(F6);
  const arr = [...D6];
  let tmp;
  const ev = [line(1), line(2)];
  for (let i = 1; i <= 3; i++) {
    const big = arr[i - 1] > arr[i];
    ev.push(...forStep(B, 3, "i", i, i === 1), line(4), ...B.cmp([`data[${i}]`, `data[${i + 1}]`], `${arr[i - 1]} ＞ ${arr[i]}`, big));
    if (big) {
      tmp = arr[i - 1];
      ev.push(line(5), ...B.copy("tmp", `data[${i}]`), line(6), ...B.copy(`data[${i}]`, `data[${i + 1}]`), line(7));
      arr[i - 1] = arr[i];
      if (fill === "tmp") {
        arr[i] = tmp;
        ev.push(...B.copy(`data[${i + 1}]`, "tmp"));
      } else if (fill === "data[i]") {
        arr[i] = arr[i - 1];
        ev.push(...B.copy(`data[${i + 1}]`, `data[${i}]`));
      } else if (fill === "i") {
        arr[i] = i;
        ev.push(...B.copy(`data[${i + 1}]`, "i"));
      } else {
        if (i - 1 < 1) return [...ev, ...error("data[0] は ない！（要素番号は 1 から）")];
        arr[i] = arr[i - 2];
        ev.push(...B.copy(`data[${i + 1}]`, `data[${i - 1}]`));
      }
    }
    ev.push(line(8), line(9));
  }
  return ev;
}

const sort6 = {
  id: "sort-6",
  genre: "sort",
  level: 6,
  title: "交換の穴",
  concepts: ["swap", "blank"],
  intro: "ここからは穴埋め問題。［a］ に入るものを選ぼう。\n「ここまで進める」は、穴の手前まで使えるよ。",
  field: F6,
  vars: {},
  varColors: { data: "#FFA726", i: "#4FC3F7", tmp: "#9575CD" },
  program: {
    ja: [
      "整数の配列 data を用意して、{8, 3, 6, 1} を入れる",
      "整数の変数 i と tmp を用意する",
      "i を 1 から 3 まで 1ずつ増やしながら、4〜8行目を繰り返す",
      "  もし data の i番目が data の（i ＋ 1）番目より大きいなら、5〜7行目を実行する",
      "    data の i番目の値を tmp に写す",
      "    data の（i ＋ 1）番目の値を data の i番目に写す",
      "    ［a］ の値を data の（i ＋ 1）番目に写す",
      "  （ここで分かれ道は終わり）",
      "（繰り返す範囲はここまで。3行目に戻る）",
    ],
    code: [
      "整数型の配列: data ← {8, 3, 6, 1}",
      "整数型: i, tmp",
      "for (i を 1 から 3 まで 1 ずつ増やす)",
      "  if (data[i] が data[i ＋ 1] より大きい)",
      "    tmp ← data[i]",
      "    data[i] ← data[i ＋ 1]",
      "    data[i ＋ 1] ← ［a］",
      "  endif",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。"],
  question:
    "次のプログラムは、配列 data の隣り合う要素を前から順に比べ、前の要素の方が大きいときは 2 つの要素を交換することによって、最も大きい値を最後の要素に移す。\nプログラム中の ［a］ に入れる正しい答えはどれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "tmp", code: "tmp", fill: { a: "tmp" }, correct: true },
    {
      ja: "data の i番目",
      code: "data[i]",
      fill: { a: { code: "data[i]", ja: "data の i番目" } },
      wrongFeedback: "6行目で data[i] はもう data[i ＋ 1] の値に書き換わっています。同じ値が 2 つ並び、元の data[i] の値（tmp に取っておいた値）が消えてしまいます。",
      events: sort6Run("data[i]"),
    },
    {
      ja: "i",
      code: "i",
      fill: { a: "i" },
      wrongFeedback: "i は要素番号です。入れたいのは、5行目で tmp に取っておいた元の data[i] の値です。",
      events: sort6Run("i"),
    },
    {
      ja: "data の（i － 1）番目",
      code: "data[i － 1]",
      fill: { a: { code: "data[i － 1]", ja: "data の（i － 1）番目" } },
      wrongFeedback: "i＝1 のとき data[0] になり、ない要素を使おうとして止まります。入れたいのは tmp に取っておいた値です。",
      events: sort6Run("data[i － 1]"),
    },
  ],
  events: [...sort6Run("tmp"), end()],
  expectedFinal: { arrays: { data: [3, 6, 1, 8] } },
  hints: [
    "i＝1 のとき、data[1]＝8 は data[2]＝3 より大きいので交換します。5行目で tmp＝8、6行目で data[1]＝3 になります。",
    "7行目で data[2] に入れたいのは、元の data[1] の値 8 です。それは今どこにあるかな？",
    "［a］ は tmp。8 が右へ送られていき、data＝{3, 6, 1, 8} になります。",
  ],
  explanation: {
    why: "交換は、5行目で data[i] を tmp に取っておき、6行目で data[i] を上書きし、7行目で tmp の値を data[i ＋ 1] に入れます。8 が右へ送られて data＝{3, 6, 1, 8} になります。",
    trace: [
      { line: 7, state: "i=1：8 ＞ 3 → [3, 8, 6, 1]" },
      { line: 7, state: "i=2：8 ＞ 6 → [3, 6, 8, 1]" },
      { line: 7, state: "i=3：8 ＞ 1 → [3, 6, 1, 8]" },
    ],
    points: ["交換の 3 行目は、1 行目で取っておいた tmp を戻す", "上書きされた要素（data[i]）には、もう元の値は残っていない"],
  },
};

// ---- sort-7：両端から交換して逆順にする ----
const D7 = [4, 8, 2, 6, 9];
const F7 = autoField(["n", "i", "tmp"], { arrays: [{ name: "data", values: D7 }] });
const D7_END = { "n ÷ 2": 2, n: 5, "n － 1": 4, "n ＋ 1": 6 };
function sort7Run(fill) {
  const B = builder(F7);
  const n = D7.length;
  const ev = [line(1), line(2), ...B.set("n", n), line(3)];
  const last = D7_END[fill];
  for (let i = 1; i <= last; i++) {
    const k = n - i + 1;
    ev.push(...forStep(B, 4, "i", i, i === 1));
    if (k < 1 || i > n) return [...ev, line(5), ...error(`data[${i > n ? i : k}] は ない！（data は 1〜5番目）`)];
    ev.push(...swap3(B, 5, `data[${i}]`, `data[${k}]`), line(8));
  }
  return ev;
}

const sort7 = {
  id: "sort-7",
  genre: "sort",
  level: 7,
  title: "両端から入れ替える穴",
  concepts: ["swap", "reverse", "blank"],
  field: F7,
  vars: {},
  varColors: { data: "#FFA726", n: "#66BB6A", i: "#4FC3F7", tmp: "#9575CD" },
  program: {
    ja: [
      "整数の配列 data を用意して、{4, 8, 2, 6, 9} を入れる",
      "整数の変数 n を用意して、data の要素数（5）を入れる",
      "整数の変数 i と tmp を用意する",
      "i を 1 から ［a］ まで 1ずつ増やしながら、5〜7行目を繰り返す",
      "  data の i番目の値を tmp に写す",
      "  data の（n － i ＋ 1）番目の値を data の i番目に写す",
      "  tmp の値を data の（n － i ＋ 1）番目に写す",
      "（繰り返す範囲はここまで。4行目に戻る）",
    ],
    code: [
      "整数型の配列: data ← {4, 8, 2, 6, 9}",
      "整数型: n ← data の要素数",
      "整数型: i, tmp",
      "for (i を 1 から ［a］ まで 1 ずつ増やす)",
      "  tmp ← data[i]",
      "  data[i] ← data[n － i ＋ 1]",
      "  data[n － i ＋ 1] ← tmp",
      "endfor",
    ],
  },
  notes: [
    "配列の要素番号は 1 から始まる。",
    "÷ は，商の小数点以下を切り捨てた整数を求める（例：5 ÷ 2 は 2）。",
    "for の「1 から ○ まで」で，○ が 1 より小さいときは，1回も繰り返さない。",
  ],
  question:
    "次のプログラムは、配列 data の要素の並びを逆の順番にする。別の配列は使わず、先頭から i番目の要素と最後から i番目の要素を交換していく。例えば、data が {1, 2, 3} のとき、実行後の data は {3, 2, 1} となる。data の要素数は 1 以上である。\nプログラム中の ［a］ に入れる正しい答えはどれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "n ÷ 2", code: "n ÷ 2", fill: { a: "n ÷ 2" }, correct: true },
    {
      ja: "n",
      code: "n",
      fill: { a: "n" },
      wrongFeedback: "i が真ん中を過ぎても交換を続けるので、一度入れ替えた組をもう一度入れ替えて元に戻し、data は {4, 8, 2, 6, 9} のままになります。",
      events: sort7Run("n"),
    },
    {
      ja: "n － 1",
      code: "n － 1",
      fill: { a: "n － 1" },
      wrongFeedback: "i＝4 のとき、i＝2 で入れ替えた data[2] と data[4] をもう一度入れ替えてしまい、data＝{9, 8, 2, 6, 4} になります。",
      events: sort7Run("n － 1"),
    },
    {
      ja: "n ＋ 1",
      code: "n ＋ 1",
      fill: { a: "n ＋ 1" },
      wrongFeedback: "途中で元に戻るうえ、i＝6 のとき、ない要素 data[6] を使おうとして止まります。",
      events: sort7Run("n ＋ 1"),
    },
  ],
  events: [...sort7Run("n ÷ 2"), end()],
  expectedFinal: { arrays: { data: [9, 6, 2, 8, 4] } },
  hints: [
    "i＝1 のとき、data[1] と data[5]（n － 1 ＋ 1）を交換します。i＝2 のときは data[2] と data[4] です。",
    "真ん中を過ぎてから交換すると、一度入れ替えた組を元に戻してしまいます。要素数が 5 なら、交換するのは何組かな？（真ん中の 3番目はそのまま）",
    "［a］ は n ÷ 2。5 ÷ 2 ＝ 2 なので 2 組を交換し、data＝{9, 6, 2, 8, 4} になります。",
  ],
  explanation: {
    why: "先頭から i番目と最後から i番目を交換するのは、真ん中までで十分です。それより先まで続けると、入れ替えた組をもう一度入れ替えて元に戻してしまいます。交換する組の数は n ÷ 2（小数点以下切り捨て）で、要素数が奇数のときは真ん中の要素はそのままです。",
    trace: [
      { line: 7, state: "i=1：data[1] と data[5] → [9, 8, 2, 6, 4]" },
      { line: 7, state: "i=2：data[2] と data[4] → [9, 6, 2, 8, 4]" },
    ],
    points: ["両端から交換して逆順にするときは、真ん中まで（n ÷ 2 回）", "後ろから i番目の要素番号は n － i ＋ 1", "要素数が奇数でも偶数でも n ÷ 2 でよいか、両方で確かめる"],
  },
};

// ---- sort-8：バブルソートの交換の条件 ----
const D8 = [3, 1, 4, 2];
const F8 = autoField(["n", "i", "j", "tmp"], { compare: true, arrays: [{ name: "data", values: D8 }] });
const D8_TEST = {
  "data[j] が data[j ＋ 1] より大きい": (arr, j) => [[`data[${j}]`, `data[${j + 1}]`], `${arr[j - 1]} ＞ ${arr[j]}`, arr[j - 1] > arr[j]],
  "data[j] が data[j ＋ 1] より小さい": (arr, j) => [[`data[${j}]`, `data[${j + 1}]`], `${arr[j - 1]} ＜ ${arr[j]}`, arr[j - 1] < arr[j]],
  "data[j] が data[i] より大きい": (arr, j, i) => [[`data[${j}]`, `data[${i}]`], `${arr[j - 1]} ＞ ${arr[i - 1]}`, arr[j - 1] > arr[i - 1]],
  "j が j ＋ 1 より大きい": (arr, j) => [["j", "j", 1], `${j} ＞ ${j} ＋ 1`, j > j + 1],
};
function sort8Run(fill) {
  const B = builder(F8);
  const arr = [...D8];
  const n = arr.length;
  const ev = [line(1), line(2), ...B.set("n", n), line(3)];
  for (let i = 1; i <= n - 1; i++) {
    ev.push(...forStep(B, 4, "i", i, i === 1));
    for (let j = 1; j <= n - i; j++) {
      const [ops, e, ok] = D8_TEST[fill](arr, j, i);
      ev.push(...forStep(B, 5, "j", j, j === 1), line(6), ...B.cmp(ops, e, ok));
      if (ok) {
        ev.push(...swap3(B, 7, `data[${j}]`, `data[${j + 1}]`));
        swapArr(arr, j, j + 1);
      }
      ev.push(line(10), line(11));
    }
    ev.push(line(12));
  }
  return ev;
}
const FILL8_JA = {
  "data[j] が data[j ＋ 1] より大きい": "data の j番目が data の（j ＋ 1）番目より大きい",
  "data[j] が data[j ＋ 1] より小さい": "data の j番目が data の（j ＋ 1）番目より小さい",
  "data[j] が data[i] より大きい": "data の j番目が data の i番目より大きい",
  "j が j ＋ 1 より大きい": "j が j ＋ 1 より大きい",
};
const fill8 = (s) => ({ a: { code: s, ja: FILL8_JA[s] } });

const sort8 = {
  id: "sort-8",
  genre: "sort",
  level: 8,
  title: "交換する条件の穴",
  concepts: ["bubble-sort", "blank"],
  field: F8,
  vars: {},
  varColors: { data: "#FFA726", n: "#66BB6A", i: "#4FC3F7", j: "#9575CD", tmp: "#26A69A" },
  program: {
    ja: [
      "整数の配列 data を用意して、{3, 1, 4, 2} を入れる",
      "整数の変数 n を用意して、data の要素数（4）を入れる",
      "整数の変数 i、j、tmp を用意する",
      "i を 1 から n － 1 まで 1ずつ増やしながら、5〜11行目を繰り返す",
      "  j を 1 から n － i まで 1ずつ増やしながら、6〜10行目を繰り返す",
      "    もし ［a］ なら、7〜9行目を実行する",
      "      data の j番目の値を tmp に写す",
      "      data の（j ＋ 1）番目の値を data の j番目に写す",
      "      tmp の値を data の（j ＋ 1）番目に写す",
      "    （ここで分かれ道は終わり）",
      "  （内側の繰り返す範囲はここまで。5行目に戻る）",
      "（外側の繰り返す範囲はここまで。4行目に戻る）",
    ],
    code: [
      "整数型の配列: data ← {3, 1, 4, 2}",
      "整数型: n ← data の要素数",
      "整数型: i, j, tmp",
      "for (i を 1 から n － 1 まで 1 ずつ増やす)",
      "  for (j を 1 から n － i まで 1 ずつ増やす)",
      "    if (［a］)",
      "      tmp ← data[j]",
      "      data[j] ← data[j ＋ 1]",
      "      data[j ＋ 1] ← tmp",
      "    endif",
      "  endfor",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "for の終わりの値（n － i）は，その繰り返しを始めるときの i で決まる。"],
  question: "次のプログラムは、バブルソートによって配列 data の要素を昇順（小さい順）に並べ替える。\nプログラム中の ［a］ に入れる正しい答えはどれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: FILL8_JA["data[j] が data[j ＋ 1] より大きい"], code: "data[j] が data[j ＋ 1] より大きい", fill: fill8("data[j] が data[j ＋ 1] より大きい"), correct: true },
    {
      ja: FILL8_JA["data[j] が data[j ＋ 1] より小さい"],
      code: "data[j] が data[j ＋ 1] より小さい",
      fill: fill8("data[j] が data[j ＋ 1] より小さい"),
      wrongFeedback: "前の要素の方が小さいときに交換すると、小さい方が右へ送られて降順（大きい順）の {4, 3, 2, 1} になります。",
      events: sort8Run("data[j] が data[j ＋ 1] より小さい"),
    },
    {
      ja: FILL8_JA["data[j] が data[i] より大きい"],
      code: "data[j] が data[i] より大きい",
      fill: fill8("data[j] が data[i] より大きい"),
      wrongFeedback: "交換するのは data[j] と data[j ＋ 1] なので、比べる相手も隣の data[j ＋ 1] です。data[i] と比べると、交換すべきでない所で交換してしまいます。",
      events: sort8Run("data[j] が data[i] より大きい"),
    },
    {
      ja: FILL8_JA["j が j ＋ 1 より大きい"],
      code: "j が j ＋ 1 より大きい",
      fill: fill8("j が j ＋ 1 より大きい"),
      wrongFeedback: "j と j ＋ 1 は要素番号なので、この条件はいつも成り立たず、一度も交換しません。比べるのは要素の値です。",
      events: sort8Run("j が j ＋ 1 より大きい"),
    },
  ],
  events: [...sort8Run("data[j] が data[j ＋ 1] より大きい"), end()],
  expectedFinal: { arrays: { data: [1, 2, 3, 4] } },
  hints: [
    "7〜9行目は data[j] と data[j ＋ 1] を交換します。どんなときに隣どうしを交換すれば、小さい順になるかな？",
    "昇順にしたいので、前の要素の方が大きいとき（順番が逆になっているとき）に交換します。",
    "［a］ は「data[j] が data[j ＋ 1] より大きい」。data は {1, 2, 3, 4} になります。",
  ],
  explanation: {
    why: "昇順に並べるには、隣り合う 2 つが逆の順番（前の方が大きい）のときに交換します。これを繰り返すと、1 周ごとに一番大きい値が右端へ移り、data＝{1, 2, 3, 4} になります。",
    trace: [
      { line: 9, state: "i=1：[1, 3, 4, 2] → [1, 3, 2, 4]" },
      { line: 9, state: "i=2：[1, 2, 3, 4]" },
      { line: 6, state: "i=3：1 ＞ 2 は偽（交換なし）" },
    ],
    points: ["昇順のバブルソートは「前の方が大きければ交換」", "比べる 2 つと、交換する 2 つは同じ（data[j] と data[j ＋ 1]）"],
  },
};

// ---- sort-9：選択ソート（空欄2つ） ----
const D9 = [6, 2, 9, 4];
const F9 = autoField(["n", "i", "j", "m", "tmp"], { compare: true, arrays: [{ name: "data", values: D9 }] });
const D9_START = { "i ＋ 1": (i) => i + 1, 1: () => 1, "i ＋ 2": (i) => i + 2 };
const D9_TEST = {
  "data[m]": (arr, j, m) => [[`data[${j}]`, `data[${m}]`], `${arr[j - 1]} ＜ ${arr[m - 1]}`, arr[j - 1] < arr[m - 1]],
  "data[i]": (arr, j, m, i) => [[`data[${j}]`, `data[${i}]`], `${arr[j - 1]} ＜ ${arr[i - 1]}`, arr[j - 1] < arr[i - 1]],
};
function sort9Run(a, b) {
  const B = builder(F9);
  const arr = [...D9];
  const n = arr.length;
  const ev = [line(1), line(2), ...B.set("n", n), line(3)];
  for (let i = 1; i <= n - 1; i++) {
    ev.push(...forStep(B, 4, "i", i, i === 1), line(5), ...B.copy("m", "i"));
    let m = i;
    const start = D9_START[a](i);
    if (start > n) ev.push(line(6)); // 始まりが終わりより大きい：1回も繰り返さない
    for (let j = start; j <= n; j++) {
      const [ops, e, ok] = D9_TEST[b](arr, j, m, i);
      ev.push(line(6));
      if (j === start) ev.push(...(a === "1" ? B.set("j", 1) : B.calc("j", ["i", a === "i ＋ 1" ? 1 : 2], a, j)));
      else ev.push(...B.calc("j", ["j", 1], "j ＋ 1", j));
      ev.push(line(7), ...B.cmp(ops, e, ok));
      if (ok) {
        m = j;
        ev.push(line(8), ...B.copy("m", "j"));
      }
      ev.push(line(9), line(10));
    }
    ev.push(...swap3(B, 11, `data[${i}]`, `data[${m}]`), line(14));
    swapArr(arr, i, m);
  }
  return ev;
}
const fill9 = (a, b) => ({ a, b: { code: b, ja: b === "data[m]" ? "data の m番目" : "data の i番目" } });
const ja9 = (a, b) => `a：${a}　b：${b === "data[m]" ? "data の m番目" : "data の i番目"}`;

const sort9 = {
  id: "sort-9",
  genre: "sort",
  level: 9,
  title: "選択ソートの穴",
  concepts: ["selection-sort", "nested", "blank"],
  field: F9,
  vars: {},
  varColors: { data: "#FFA726", n: "#66BB6A", i: "#4FC3F7", j: "#9575CD", m: "#F06292", tmp: "#26A69A" },
  program: {
    ja: [
      "整数の配列 data を用意して、{6, 2, 9, 4} を入れる",
      "整数の変数 n を用意して、data の要素数（4）を入れる",
      "整数の変数 i、j、m、tmp を用意する",
      "i を 1 から n － 1 まで 1ずつ増やしながら、5〜13行目を繰り返す",
      "  i の値を m に写す",
      "  j を ［a］ から n まで 1ずつ増やしながら、7〜9行目を繰り返す",
      "    もし data の j番目が ［b］ より小さいなら、8行目を実行する",
      "      j の値を m に写す",
      "    （ここで分かれ道は終わり）",
      "  （内側の繰り返す範囲はここまで。6行目に戻る）",
      "  data の i番目の値を tmp に写す",
      "  data の m番目の値を data の i番目に写す",
      "  tmp の値を data の m番目に写す",
      "（外側の繰り返す範囲はここまで。4行目に戻る）",
    ],
    code: [
      "整数型の配列: data ← {6, 2, 9, 4}",
      "整数型: n ← data の要素数",
      "整数型: i, j, m, tmp",
      "for (i を 1 から n － 1 まで 1 ずつ増やす)",
      "  m ← i",
      "  for (j を ［a］ から n まで 1 ずつ増やす)",
      "    if (data[j] が ［b］ より小さい)",
      "      m ← j",
      "    endif",
      "  endfor",
      "  tmp ← data[i]",
      "  data[i] ← data[m]",
      "  data[m] ← tmp",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "for の「○ から n まで」で，○ が n より大きいときは，1回も繰り返さない。"],
  question:
    "次のプログラムは、選択ソートによって配列 data の要素を昇順に並べ替える。i 回目の繰り返しでは、data[i] 〜 data[n] の中で最も小さい値の要素を探してその要素番号を m に求め、data[i] と data[m] を交換する。\nプログラム中の ［a］ と ［b］ に入れる正しい答えの組合せはどれか。",
  answerType: "blank",
  blanks: ["a", "b"],
  choices: [
    { ja: ja9("i ＋ 1", "data[m]"), code: "a：i ＋ 1　b：data[m]", fill: fill9("i ＋ 1", "data[m]"), correct: true },
    {
      ja: ja9("1", "data[m]"),
      code: "a：1　b：data[m]",
      fill: fill9("1", "data[m]"),
      wrongFeedback: "j を 1 から始めると、もう並べ終わった前の部分まで探してしまいます。i＝2 のとき、確定した data[1]（2）が最小として選ばれて data[2] と交換され、並びが崩れます。",
      events: sort9Run("1", "data[m]"),
    },
    {
      ja: ja9("i ＋ 1", "data[i]"),
      code: "a：i ＋ 1　b：data[i]",
      fill: fill9("i ＋ 1", "data[i]"),
      wrongFeedback: "data[i] と比べると、「data[i] より小さい要素のうち最後のもの」が m に残ります。最小値とは限らず、この例では i＝1 で 4 が選ばれてしまいます。比べる相手は、それまでの最小の data[m] です。",
      events: sort9Run("i ＋ 1", "data[i]"),
    },
    {
      ja: ja9("i ＋ 2", "data[m]"),
      code: "a：i ＋ 2　b：data[m]",
      fill: fill9("i ＋ 2", "data[m]"),
      wrongFeedback: "j を i ＋ 2 から始めると data[i ＋ 1] を調べないので、data[i ＋ 1] が最小のときに見落とします。この例では i＝1 で最小値 2（2番目）を見落とします。",
      events: sort9Run("i ＋ 2", "data[m]"),
    },
  ],
  events: [...sort9Run("i ＋ 1", "data[m]"), end()],
  expectedFinal: { arrays: { data: [2, 4, 6, 9] } },
  hints: [
    "5行目で m＝i（とりあえず data[i] を最小とする）にしています。そのあと比べるのは、i の次からです。",
    "m は「それまでで最小の要素の要素番号」です。新しい data[j] が、それまでの最小より小さければ m を更新します。",
    "a は i ＋ 1、b は data[m]。i＝1 で 2、i＝2 で 4、i＝3 で 6 が選ばれ、data＝{2, 4, 6, 9} です。",
  ],
  explanation: {
    why: "m ← i で data[i] を仮の最小とし、j を i ＋ 1 から n まで変えながら、それまでの最小 data[m] より小さい要素が見つかったら m を更新します。最後に data[i] と data[m] を交換します。i＝1 で 2 と 6、i＝2 で 4 と 6、i＝3 で 6 と 9 を交換して data＝{2, 4, 6, 9} です。",
    trace: [
      { line: 13, state: "i=1：最小 2 は m=2 → [2, 6, 9, 4]" },
      { line: 13, state: "i=2：最小 4 は m=4 → [2, 4, 9, 6]" },
      { line: 13, state: "i=3：最小 6 は m=4 → [2, 4, 6, 9]" },
    ],
    points: ["最小値を探すときは、それまでの最小（data[m]）と比べる", "確定した前の部分は探さない（j は i ＋ 1 から）"],
  },
};

// ---- sort-10：番兵つき挿入ソート（空欄2つ） ----
const D10 = [0, 5, 2, 4, 6, 1];
const F10 = autoField(["n", "i", "j", "x"], { compare: true, arrays: [{ name: "data", values: D10 }] });
const D10_COND = {
  "data[j] が x より大きい": (arr, j, x) => (j < 1 ? null : [[`data[${j}]`, "x"], `${arr[j - 1]} ＞ ${x}`, arr[j - 1] > x]),
  "data[j] が x より小さい": (arr, j, x) => (j < 1 ? null : [[`data[${j}]`, "x"], `${arr[j - 1]} ＜ ${x}`, arr[j - 1] < x]),
  "j が 1 以上": (arr, j) => [["j", 1], `${j} ≧ 1`, j >= 1],
};
function sort10Run(a, b) {
  const B = builder(F10);
  const arr = [...D10];
  const n = arr.length;
  const ev = [line(1), line(2), ...B.set("n", n), line(3)];
  for (let i = 3; i <= n; i++) {
    const x = arr[i - 1];
    let j = i - 1;
    ev.push(...forStep(B, 4, "i", i, i === 3), line(5), ...B.copy("x", `data[${i}]`), line(6), ...B.calc("j", ["i", 1], "i － 1", j));
    for (;;) {
      const c = D10_COND[a](arr, j, x);
      ev.push(line(7));
      if (!c) return [...ev, ...error("data[0] は ない！（要素番号は 1 から）")];
      ev.push(...B.cmp(...c));
      if (!c[2]) break;
      arr[j] = arr[j - 1];
      ev.push(line(8), ...B.copy(`data[${j + 1}]`, `data[${j}]`));
      j -= 1;
      ev.push(line(9), ...B.calc("j", ["j", 1], "j － 1", j), line(10));
    }
    ev.push(line(11));
    const at = b === "data[j ＋ 1] ← x" ? j + 1 : j;
    if (at < 1) return [...ev, ...error("data[0] は ない！（要素番号は 1 から）")];
    arr[at - 1] = x;
    ev.push(...B.copy(`data[${at}]`, "x"), line(12));
  }
  return ev;
}
const FILL10_JA = {
  "data[j] が x より大きい": "data の j番目が x より大きい",
  "data[j] が x より小さい": "data の j番目が x より小さい",
  "j が 1 以上": "j が 1 以上",
  "data[j ＋ 1] ← x": "x の値を data の（j ＋ 1）番目に写す",
  "data[j] ← x": "x の値を data の j番目に写す",
};
const fill10 = (a, b) => ({ a: { code: a, ja: FILL10_JA[a] }, b: { code: b, ja: FILL10_JA[b] } });
const ja10 = (a, b) => `a：${FILL10_JA[a]}　b：${FILL10_JA[b]}`;

const sort10 = {
  id: "sort-10",
  genre: "sort",
  level: 10,
  title: "挿入ソートの穴",
  concepts: ["insertion-sort", "sentinel", "blank"],
  field: F10,
  vars: {},
  varColors: { data: "#FFA726", n: "#66BB6A", i: "#4FC3F7", j: "#9575CD", x: "#F06292" },
  program: {
    ja: [
      "整数の配列 data を用意して、{0, 5, 2, 4, 6, 1} を入れる",
      "整数の変数 n を用意して、data の要素数（6）を入れる",
      "整数の変数 i、j、x を用意する",
      "i を 3 から n まで 1ずつ増やしながら、5〜11行目を繰り返す",
      "  data の i番目の値を x に写す",
      "  i から 1 を引いて、その答えを j に入れる",
      "  ［a］ のあいだ、8〜9行目を繰り返す",
      "    data の j番目の値を data の（j ＋ 1）番目に写す",
      "    j を 1 減らす",
      "  （内側の繰り返す範囲はここまで。7行目に戻る）",
      "  ［b］",
      "（外側の繰り返す範囲はここまで。4行目に戻る）",
    ],
    code: [
      "整数型の配列: data ← {0, 5, 2, 4, 6, 1}",
      "整数型: n ← data の要素数",
      "整数型: i, j, x",
      "for (i を 3 から n まで 1 ずつ増やす)",
      "  x ← data[i]",
      "  j ← i － 1",
      "  while (［a］)",
      "    data[j ＋ 1] ← data[j]",
      "    j ← j － 1",
      "  endwhile",
      "  ［b］",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "data の要素数 は，配列 data に入っている値の個数（6）である。"],
  question:
    "次のプログラムは、挿入ソートによって、配列 data の 2番目から n番目までの要素を昇順に並べ替える。並べ替える値はすべて 1 以上であり、data[1] には、それらのどの値よりも小さい 0 が番兵として格納されている。i 回目の繰り返しでは、data[2] 〜 data[i － 1] が昇順に並んでいる所へ、data[i] の値 x を、x より大きい要素を 1 つずつ後ろにずらしながら、正しい位置に挿入する。\nプログラム中の ［a］ と ［b］ に入れる正しい答えの組合せはどれか。",
  answerType: "blank",
  blanks: ["a", "b"],
  choices: [
    { ja: ja10("data[j] が x より大きい", "data[j ＋ 1] ← x"), code: "a：data[j] が x より大きい　b：data[j ＋ 1] ← x", fill: fill10("data[j] が x より大きい", "data[j ＋ 1] ← x"), correct: true },
    {
      ja: ja10("data[j] が x より大きい", "data[j] ← x"),
      code: "a：data[j] が x より大きい　b：data[j] ← x",
      fill: fill10("data[j] が x より大きい", "data[j] ← x"),
      wrongFeedback: "繰り返しが終わったとき、data[j] は x 以下の要素（ずらしていない要素）です。そこに x を入れるとその値を消してしまい、最初の周で番兵の 0 も消えるので、最後はない要素 data[0] を使おうとして止まります。空いているのは 1 つ後ろの data[j ＋ 1] です。",
      events: sort10Run("data[j] が x より大きい", "data[j] ← x"),
    },
    {
      ja: ja10("data[j] が x より小さい", "data[j ＋ 1] ← x"),
      code: "a：data[j] が x より小さい　b：data[j ＋ 1] ← x",
      fill: fill10("data[j] が x より小さい", "data[j ＋ 1] ← x"),
      wrongFeedback: "後ろにずらすのは x より大きい要素です。「小さい」では逆になり、番兵の 0 も x より小さいので j が 0 まで進み、ない要素 data[0] を使おうとして止まります。",
      events: sort10Run("data[j] が x より小さい", "data[j ＋ 1] ← x"),
    },
    {
      ja: ja10("j が 1 以上", "data[j ＋ 1] ← x"),
      code: "a：j が 1 以上　b：data[j ＋ 1] ← x",
      fill: fill10("j が 1 以上", "data[j ＋ 1] ← x"),
      wrongFeedback: "値を比べずに、毎回番兵まで全部ずらしてしまいます。x はいつも data[1] に入り、番兵の 0 も後ろへずれて、並べ替えになりません。",
      events: sort10Run("j が 1 以上", "data[j ＋ 1] ← x"),
    },
  ],
  events: [...sort10Run("data[j] が x より大きい", "data[j ＋ 1] ← x"), end()],
  expectedFinal: { arrays: { data: [0, 1, 2, 4, 5, 6] } },
  hints: [
    "i＝3 のとき x＝data[3]＝2、j＝2。data[2]＝5 は 2 より大きいので後ろへずらし（data[3]＝5）、j＝1 になります。",
    "ずらすのは x より大きいあいだです。data[1] の番兵 0 はどの値よりも小さいので、j が 1 になれば必ず止まります（j が 0 にならない）。止まったとき、空いている場所は data[j] の 1 つ後ろです。",
    "a は「data[j] が x より大きい」、b は data[j ＋ 1] ← x。i＝3 のあと {0, 2, 5, 4, 6, 1}、最後に {0, 1, 2, 4, 5, 6} です。",
  ],
  explanation: {
    why: "x より大きい要素を 1 つずつ後ろにずらし、x 以下の要素（または番兵）に当たったら、その 1 つ後ろ data[j ＋ 1] に x を入れます。番兵 0 があるので、j の範囲を調べなくても必ず止まります。2 → {0, 2, 5, 4, 6, 1}、4 → {0, 2, 4, 5, 6, 1}、6 はそのまま、1 → {0, 1, 2, 4, 5, 6} です。",
    trace: [
      { line: 11, state: "i=3：x=2 → [0, 2, 5, 4, 6, 1]" },
      { line: 11, state: "i=4：x=4 → [0, 2, 4, 5, 6, 1]" },
      { line: 11, state: "i=5：x=6 → そのまま" },
      { line: 11, state: "i=6：x=1 → [0, 1, 2, 4, 5, 6]" },
    ],
    points: [
      "挿入ソートは、整列済みの部分に x を入れる場所を、後ろから大きい要素をずらしながら探す",
      "ずらし終わったとき、空いているのは data[j ＋ 1]",
      "先頭に番兵を置くと、繰り返しの条件に要素番号の範囲を書かなくてよい（⑤ の番兵と同じ考え方）",
    ],
  },
};

export default [sort1, sort2, sort3, sort4, sort5, sort6, sort7, sort8, sort9, sort10];
