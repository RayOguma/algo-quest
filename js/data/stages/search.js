// ⑤ search（探せ！）
// 線形探索・番兵・二分探索。式の答え（result）はここで計算して書き、検証スクリプトが照合する。
import { line, end, emote, builder, autoField } from "./helpers.js";

/** for の制御行：1周目は初期値を入れ、2周目からは 1 増やす */
const forStep = (B, n, v, value, first) => [line(n), ...(first ? B.set(v, value) : B.calc(v, [v, 1], `${v} ＋ 1`, value))];
/** 負の数は全角の「－」で表示する */
const num = (v) => (v < 0 ? `－${-v}` : `${v}`);
const error = (reason) => [emote("think"), { type: "fail", kind: "error", reason }];
const LIMIT = 8; // これだけ繰り返しても終わらなければ「終わらない」として止める
const endless = () => error("繰り返しが終わらない…（low と high が変わらない）");

// ---- search-1：前から順に比べる ----
const S1 = [7, 4, 9];
const F1 = autoField(["x", "k", "i"], { compare: true, arrays: [{ name: "box", values: S1 }] });
function search1Events() {
  const B = builder(F1);
  const ev = [line(1), line(2), ...B.set("x", 4), line(3), ...B.set("k", 0), line(4)];
  S1.forEach((v, n) => {
    const i = n + 1;
    const hit = v === 4;
    ev.push(...forStep(B, 5, "i", i, i === 1), line(6), ...B.cmp([`box[${i}]`, "x"], `${v} ＝ 4`, hit));
    if (hit) ev.push(line(7), ...B.copy("k", "i"));
    ev.push(line(8), line(9));
  });
  return ev;
}

const search1 = {
  id: "search-1",
  genre: "search",
  level: 1,
  title: "何番目にある？",
  concepts: ["linear-search"],
  intro: "前から順に 1 つずつ比べて探す方法を「線形探索」というよ。\n見つかった場所（要素番号）を k に入れるよ。",
  field: F1,
  vars: {},
  varColors: { box: "#FFA726", x: "#66BB6A", k: "#F06292", i: "#4FC3F7" },
  program: {
    ja: [
      "整数の配列 box を用意して、{7, 4, 9} を入れる",
      "整数の変数 x を用意して、4 を入れる",
      "整数の変数 k を用意して、0 を入れる",
      "整数の変数 i を用意する",
      "i を 1 から 3 まで 1ずつ増やしながら、6〜8行目を繰り返す",
      "  もし box の i番目が x と等しいなら、7行目を実行する",
      "    i の値を k に写す",
      "  （ここで分かれ道は終わり）",
      "（繰り返す範囲はここまで。5行目に戻る）",
    ],
    code: [
      "整数型の配列: box ← {7, 4, 9}",
      "整数型: x ← 4",
      "整数型: k ← 0",
      "整数型: i",
      "for (i を 1 から 3 まで 1 ずつ増やす)",
      "  if (box[i] が x と等しい)",
      "    k ← i",
      "  endif",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。"],
  question: "プログラムを実行し終わったときの k の値はどれか。",
  answerType: "vars",
  choices: [
    { ja: "k は 2", code: "k = 2", correct: true },
    {
      ja: "k は 4",
      code: "k = 4",
      wrongFeedback: "7行目で k に入れるのは i（要素番号）です。見つかった値の 4 ではありません。",
      stop: { line: 7 },
    },
    {
      ja: "k は 1",
      code: "k = 1",
      wrongFeedback: "要素番号は 1 から数えます。4 は box の 2番目です。",
      stop: { line: 7 },
    },
    {
      ja: "k は 3",
      code: "k = 3",
      wrongFeedback: "k が変わるのは、box[i] が x と等しいときだけです。3番目の 9 は 4 と等しくないので、k は変わりません。",
      stop: { line: 7, mark: [6, 7] },
    },
  ],
  events: [...search1Events(), end()],
  expectedFinal: { vars: { k: 2 } },
  hints: [
    "i＝1 のとき、box[1] は 7 です。7 は x（4）と等しくないので、7行目は実行しません。",
    "x と等しい要素が見つかったときだけ、7行目で k に「何番目か」（i）を入れます。",
    "4 は box の何番目にあるかな？そのときの i が k に入ります。",
  ],
  explanation: {
    why: "i を 1 から 3 まで変えながら、box[i] と x（4）を比べます。i＝2 のとき box[2]＝4 が x と等しいので、k に 2 が入ります。i＝3 の 9 は等しくないので、k は 2 のままです。",
    trace: [
      { line: 6, state: "i=1：7 ＝ 4 は偽" },
      { line: 7, state: "i=2：4 ＝ 4 は真 → k=2" },
      { line: 6, state: "i=3：9 ＝ 4 は偽" },
    ],
    points: ["線形探索は、前から順に 1 つずつ比べる", "見つかった場所は、値ではなく要素番号（i）で表す"],
  },
};

// ---- search-2：見つかるまで進める ----
const S2 = [5, 8, 3, 6, 2];
const F2 = autoField(["x", "i", "cnt"], { compare: true, arrays: [{ name: "data", values: S2 }] });
function search2Events() {
  const B = builder(F2);
  const ev = [line(1), line(2), ...B.set("x", 6), line(3), ...B.set("i", 1), line(4), ...B.set("cnt", 0)];
  let i = 1;
  let cnt = 0;
  for (;;) {
    const go = S2[i - 1] !== 6;
    ev.push(line(5), ...B.cmp([`data[${i}]`, "x"], `${S2[i - 1]} ≠ 6`, go));
    if (!go) break;
    i += 1;
    cnt += 1;
    ev.push(line(6), ...B.calc("i", ["i", 1], "i ＋ 1", i), line(7), ...B.calc("cnt", ["cnt", 1], "cnt ＋ 1", cnt), line(8));
  }
  return ev;
}

const search2 = {
  id: "search-2",
  genre: "search",
  level: 2,
  title: "見つかるまで進もう",
  concepts: ["linear-search", "while", "count"],
  field: F2,
  vars: {},
  varColors: { data: "#FFA726", x: "#66BB6A", i: "#4FC3F7", cnt: "#F06292" },
  program: {
    ja: [
      "整数の配列 data を用意して、{5, 8, 3, 6, 2} を入れる",
      "整数の変数 x を用意して、6 を入れる",
      "整数の変数 i を用意して、1 を入れる",
      "整数の変数 cnt を用意して、0 を入れる",
      "data の i番目が x と等しくないあいだ、6〜7行目を繰り返す",
      "  i を 1 増やす",
      "  cnt を 1 増やす",
      "（繰り返す範囲はここまで。5行目に戻る）",
    ],
    code: [
      "整数型の配列: data ← {5, 8, 3, 6, 2}",
      "整数型: x ← 6",
      "整数型: i ← 1",
      "整数型: cnt ← 0",
      "while (data[i] が x と等しくない)",
      "  i ← i ＋ 1",
      "  cnt ← cnt ＋ 1",
      "endwhile",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。"],
  question: "プログラムを実行し終わったときの i と cnt の値の組合せはどれか。",
  answerType: "vars",
  choices: [
    { ja: "i は 4、cnt は 3", code: "i = 4, cnt = 3", correct: true },
    {
      ja: "i は 4、cnt は 4",
      code: "i = 4, cnt = 4",
      wrongFeedback: "data[4]＝6 と比べたときは「等しくない」が成り立たないので、繰り返しの中（6〜7行目）には入りません。cnt が増えるのは、等しくなかった 3 回だけです。",
      stop: { line: 7, nth: 3, mark: [5, 7] },
    },
    {
      ja: "i は 5、cnt は 4",
      code: "i = 5, cnt = 4",
      wrongFeedback: "while（〜のあいだ繰り返す）は、繰り返しの始めに条件を調べます。data[4] が x と等しくなった時点で、6〜7行目は実行せずに繰り返しを終えます。",
      stop: { line: 7, nth: 3, mark: [5] },
    },
    {
      ja: "i は 1、cnt は 0",
      code: "i = 1, cnt = 0",
      wrongFeedback: "5行目は「等しくない」あいだ繰り返します。data[1]＝5 は 6 と等しくないので、繰り返しの中に入ります。",
      stop: { line: 6, mark: [5] },
    },
  ],
  events: [...search2Events(), end()],
  expectedFinal: { vars: { i: 4, cnt: 3 } },
  hints: [
    "最初は i＝1 で、data[1]＝5 は 6 と等しくないので、6〜7行目を実行して i＝2、cnt＝1 になります。",
    "5行目の条件は繰り返しの始めに毎回調べます。等しくなったら、6〜7行目は実行しません。",
    "data[2]＝8、data[3]＝3 も 6 と等しくありません。data[4]＝6 で止まります。そのときの i と cnt はいくつかな？",
  ],
  explanation: {
    why: "data[i] が x（6）と等しくないあいだ、i と cnt を 1 ずつ増やします。5、8、3 の 3 回は等しくないので進み、i＝4 で data[4]＝6 が等しくなって止まります。i＝4、cnt＝3 です。",
    trace: [
      { line: 7, state: "5 ≠ 6 → i=2, cnt=1" },
      { line: 7, state: "8 ≠ 6 → i=3, cnt=2" },
      { line: 7, state: "3 ≠ 6 → i=4, cnt=3" },
      { line: 5, state: "6 ≠ 6 は偽 → 終わり" },
    ],
    points: ["while は条件が成り立つあいだ繰り返し、成り立たなくなったら中に入らずに終わる", "cnt は「等しくなかった回数」。最後の等しかった比較は数えない"],
  },
};

// ---- search-3：見つかったら止める ----
const S3 = [4, 7, 2, 9];
const F3 = autoField(["x", "i", "pos"], { compare: true, arrays: [{ name: "data", values: S3 }] });
function search3Events() {
  const B = builder(F3);
  const ev = [line(1), line(2), ...B.set("x", 2), line(3), ...B.set("i", 1), line(4), ...B.set("pos", -1)];
  let i = 1;
  let pos = -1;
  for (;;) {
    const go = i <= 4 && pos === -1;
    ev.push(line(5), ...B.cmp(["i", 4, "pos", -1], `${i} ≦ 4 and ${num(pos)} ＝ －1`, go));
    if (!go) break;
    const hit = S3[i - 1] === 2;
    ev.push(line(6), ...B.cmp([`data[${i}]`, "x"], `${S3[i - 1]} ＝ 2`, hit));
    if (hit) {
      pos = i;
      ev.push(line(7), ...B.copy("pos", "i"));
    }
    i += 1;
    ev.push(line(8), line(9), ...B.calc("i", ["i", 1], "i ＋ 1", i), line(10));
  }
  return ev;
}

const search3 = {
  id: "search-3",
  genre: "search",
  level: 3,
  title: "見つかったら止めよう",
  concepts: ["linear-search", "while", "and"],
  field: F3,
  vars: {},
  varColors: { data: "#FFA726", x: "#66BB6A", i: "#4FC3F7", pos: "#F06292" },
  program: {
    ja: [
      "整数の配列 data を用意して、{4, 7, 2, 9} を入れる",
      "整数の変数 x を用意して、2 を入れる",
      "整数の変数 i を用意して、1 を入れる",
      "整数の変数 pos を用意して、－1 を入れる",
      "「i が data の要素数以下」と「pos が －1 と等しい」が両方とも成り立つあいだ、6〜9行目を繰り返す",
      "  もし data の i番目が x と等しいなら、7行目を実行する",
      "    i の値を pos に写す",
      "  （ここで分かれ道は終わり）",
      "  i を 1 増やす",
      "（繰り返す範囲はここまで。5行目に戻る）",
    ],
    code: [
      "整数型の配列: data ← {4, 7, 2, 9}",
      "整数型: x ← 2",
      "整数型: i ← 1",
      "整数型: pos ← －1",
      "while ((i が data の要素数 以下) and (pos が －1 と等しい))",
      "  if (data[i] が x と等しい)",
      "    pos ← i",
      "  endif",
      "  i ← i ＋ 1",
      "endwhile",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "data の要素数は，配列 data に入っている値の個数（4）である。", "pos が －1 のときは，まだ見つかっていないことを表す。"],
  question: "プログラムを実行し終わったときの pos と i の値の組合せはどれか。",
  answerType: "vars",
  choices: [
    { ja: "pos は 3、i は 4", code: "pos = 3, i = 4", correct: true },
    {
      ja: "pos は 3、i は 3",
      code: "pos = 3, i = 3",
      wrongFeedback: "9行目の「i を 1 増やす」は endif（分かれ道の終わり）の後なので、見つかった周でも実行されます。そのあと 5行目で pos が －1 でないことを調べて終わります。",
      stop: { line: 9, nth: 3, mark: [9] },
    },
    {
      ja: "pos は 3、i は 5",
      code: "pos = 3, i = 5",
      wrongFeedback: "5行目は「pos が －1 と等しい」も成り立つあいだだけ繰り返します。pos＝3 になったら、i が 4 でも繰り返しを終えます。",
      stop: { line: 9, nth: 3, mark: [5] },
    },
    {
      ja: "pos は 2、i は 3",
      code: "pos = 2, i = 3",
      wrongFeedback: "要素番号は 1 から数えます。2 は data の 3番目です。",
      stop: { line: 7 },
    },
  ],
  events: [...search3Events(), end()],
  expectedFinal: { vars: { pos: 3, i: 4 } },
  hints: [
    "最初は i＝1、pos＝－1 なので 5行目の条件は成り立ちます。data[1]＝4 は x（2）と等しくないので、9行目で i＝2 になります。",
    "見つかった周でも、9行目の「i を 1 増やす」は実行されます。5行目は、pos が －1 でなくなったら成り立ちません。",
    "i＝3 で data[3]＝2 が見つかり pos＝3。その周の 9行目で i はいくつになるかな？",
  ],
  explanation: {
    why: "見つかるまで（pos が －1 のあいだ）i を進める処理です。i＝3 で data[3]＝2 が見つかって pos＝3。同じ周の 9行目で i＝4 になり、5行目で pos が －1 でないので終わります。pos＝3、i＝4 です。",
    trace: [
      { line: 9, state: "i=1：4 ＝ 2 は偽 → i=2" },
      { line: 9, state: "i=2：7 ＝ 2 は偽 → i=3" },
      { line: 9, state: "i=3：2 ＝ 2 は真 → pos=3, i=4" },
      { line: 5, state: "4 ≦ 4 and 3 ＝ －1 は偽 → 終わり" },
    ],
    points: ["「見つかったら止める」は、見つかったかどうか（pos）も繰り返しの条件に入れる", "if の外の処理（i を 1 増やす）は、見つかった周でも実行される", "and は両方が成り立つときだけ真"],
  },
};

// ---- search-4：最初と最後に見つかった位置 ----
const S4 = [3, 8, 5, 8, 6, 8];
const F4 = autoField(["x", "first", "last", "i"], { compare: true, arrays: [{ name: "data", values: S4 }] });
function search4Events() {
  const B = builder(F4);
  const ev = [line(1), line(2), ...B.set("x", 8), line(3), ...B.set("first", 0), line(4), ...B.set("last", 0), line(5)];
  let first = 0;
  S4.forEach((v, n) => {
    const i = n + 1;
    const hit = v === 8;
    ev.push(...forStep(B, 6, "i", i, i === 1), line(7), ...B.cmp([`data[${i}]`, "x"], `${v} ＝ 8`, hit));
    if (hit) {
      const none = first === 0;
      ev.push(line(8), ...B.cmp(["first", 0], `${first} ＝ 0`, none));
      if (none) {
        first = i;
        ev.push(line(9), ...B.copy("first", "i"));
      }
      ev.push(line(10), line(11), ...B.copy("last", "i"));
    }
    ev.push(line(12), line(13));
  });
  return ev;
}

const search4 = {
  id: "search-4",
  genre: "search",
  level: 4,
  title: "最初と最後",
  concepts: ["linear-search", "nested-if"],
  field: F4,
  vars: {},
  varColors: { data: "#FFA726", x: "#66BB6A", first: "#F06292", last: "#9575CD", i: "#4FC3F7" },
  program: {
    ja: [
      "整数の配列 data を用意して、{3, 8, 5, 8, 6, 8} を入れる",
      "整数の変数 x を用意して、8 を入れる",
      "整数の変数 first を用意して、0 を入れる",
      "整数の変数 last を用意して、0 を入れる",
      "整数の変数 i を用意する",
      "i を 1 から data の要素数（6）まで 1ずつ増やしながら、7〜12行目を繰り返す",
      "  もし data の i番目が x と等しいなら、8〜11行目を実行する",
      "    もし first が 0 と等しいなら、9行目を実行する",
      "      i の値を first に写す",
      "    （ここで内側の分かれ道は終わり）",
      "    i の値を last に写す",
      "  （ここで外側の分かれ道は終わり）",
      "（繰り返す範囲はここまで。6行目に戻る）",
    ],
    code: [
      "整数型の配列: data ← {3, 8, 5, 8, 6, 8}",
      "整数型: x ← 8",
      "整数型: first ← 0",
      "整数型: last ← 0",
      "整数型: i",
      "for (i を 1 から data の要素数 まで 1 ずつ増やす)",
      "  if (data[i] が x と等しい)",
      "    if (first が 0 と等しい)",
      "      first ← i",
      "    endif",
      "    last ← i",
      "  endif",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "data の要素数は，配列 data に入っている値の個数（6）である。"],
  question: "プログラムを実行し終わったときの first と last の値の組合せはどれか。",
  answerType: "vars",
  choices: [
    { ja: "first は 2、last は 6", code: "first = 2, last = 6", correct: true },
    {
      ja: "first は 6、last は 6",
      code: "first = 6, last = 6",
      wrongFeedback: "9行目は、8行目の「first が 0 と等しい」が成り立つときだけ実行します。i＝2 で first＝2 になったあとは 0 ではないので、first は変わりません。",
      stop: { line: 8, nth: 2 },
    },
    {
      ja: "first は 2、last は 2",
      code: "first = 2, last = 2",
      wrongFeedback: "11行目は 10行目の endif（内側の分かれ道の終わり）の後なので、first が 0 かどうかに関係なく、x が見つかるたびに実行されます。",
      stop: { line: 11, nth: 2 },
    },
    {
      ja: "first は 1、last は 5",
      code: "first = 1, last = 5",
      wrongFeedback: "要素番号は 1 から数えます。最初の 8 は data の 2番目です。",
      stop: { line: 9 },
    },
  ],
  events: [...search4Events(), end()],
  expectedFinal: { vars: { first: 2, last: 6 } },
  hints: [
    "i＝2 で data[2]＝8 が見つかります。このとき first は 0 なので、first＝2、そして last＝2 になります。",
    "first に入れるのは first が 0 のとき（まだ見つかっていないとき）だけ。last は見つかるたびに入れ直します。",
    "8 は 2、4、6番目にあります。first は最初の 1 回だけ、last は 3 回とも入れ直されます。",
  ],
  explanation: {
    why: "first は 0 のときだけ入れるので、最初に見つかった要素番号 2 が残ります。last は見つかるたびに入れ直すので、最後に見つかった 6 が残ります。",
    trace: [
      { line: 11, state: "i=2：first=2, last=2" },
      { line: 11, state: "i=4：first は 0 でない → first=2, last=4" },
      { line: 11, state: "i=6：first=2, last=6" },
    ],
    points: ["最初の位置は「まだ入れていないとき（0 のとき）だけ入れる」", "最後の位置は「見つかるたびに入れ直す」", "入れ子の if では、どの endif の後かで実行される条件が変わる"],
  },
};

// ---- search-5：二分探索（見つからない場合） ----
const S5 = [3, 7, 11, 15, 19, 24, 30];
const F5 = autoField(["x", "low", "high", "mid", "pos", "cnt"], { compare: true, arrays: [{ name: "data", values: S5 }] });
function search5Events() {
  const B = builder(F5);
  const x = 20;
  const ev = [line(1), line(2), ...B.set("x", x), line(3), ...B.set("low", 1), line(4), ...B.set("high", S5.length), line(5), line(6), ...B.set("pos", -1), line(7), ...B.set("cnt", 0)];
  let [low, high, pos, cnt] = [1, S5.length, -1, 0];
  for (;;) {
    const go = low <= high && pos === -1;
    ev.push(line(8), ...B.cmp(["low", "high", "pos", -1], `${low} ≦ ${high} and ${num(pos)} ＝ －1`, go));
    if (!go) break;
    const mid = Math.trunc((low + high) / 2);
    cnt += 1;
    ev.push(line(9), ...B.calc("mid", ["low", "high", 2], "(low ＋ high) ÷ 2", mid), line(10), ...B.calc("cnt", ["cnt", 1], "cnt ＋ 1", cnt));
    const v = S5[mid - 1];
    ev.push(line(11), ...B.cmp([`data[${mid}]`, "x"], `${v} ＝ ${x}`, v === x));
    if (v === x) {
      pos = mid;
      ev.push(line(12), ...B.copy("pos", "mid"));
    } else {
      ev.push(line(13), ...B.cmp([`data[${mid}]`, "x"], `${v} ＜ ${x}`, v < x));
      if (v < x) {
        low = mid + 1;
        ev.push(line(14), ...B.calc("low", ["mid", 1], "mid ＋ 1", low));
      } else {
        high = mid - 1;
        ev.push(line(15), line(16), ...B.calc("high", ["mid", 1], "mid － 1", high));
      }
    }
    ev.push(line(17), line(18));
  }
  return ev;
}

const search5 = {
  id: "search-5",
  genre: "search",
  level: 5,
  title: "半分に絞って探そう",
  concepts: ["binary-search", "while"],
  field: F5,
  vars: {},
  varColors: { data: "#FFA726", x: "#66BB6A", low: "#4FC3F7", high: "#9575CD", mid: "#FFB74D", pos: "#F06292", cnt: "#26A69A" },
  program: {
    ja: [
      "整数の配列 data を用意して、{3, 7, 11, 15, 19, 24, 30} を入れる",
      "整数の変数 x を用意して、20 を入れる",
      "整数の変数 low を用意して、1 を入れる",
      "整数の変数 high を用意して、data の要素数（7）を入れる",
      "整数の変数 mid を用意する",
      "整数の変数 pos を用意して、－1 を入れる",
      "整数の変数 cnt を用意して、0 を入れる",
      "「low が high 以下」と「pos が －1 と等しい」が両方とも成り立つあいだ、9〜17行目を繰り返す",
      "  low と high を足して 2 で割った値（小数点以下は切り捨て）を mid に入れる",
      "  cnt を 1 増やす",
      "  もし data の mid番目が x と等しいなら、12行目を実行する",
      "    mid の値を pos に写す",
      "  そうではなく、data の mid番目が x より小さいなら、14行目を実行する",
      "    mid に 1 を足して、その答えを low に入れる",
      "  どれにも当てはまらないときは、16行目を実行する",
      "    mid から 1 を引いて、その答えを high に入れる",
      "  （ここで分かれ道は終わり）",
      "（繰り返す範囲はここまで。8行目に戻る）",
    ],
    code: [
      "整数型の配列: data ← {3, 7, 11, 15, 19, 24, 30}",
      "整数型: x ← 20",
      "整数型: low ← 1",
      "整数型: high ← data の要素数",
      "整数型: mid",
      "整数型: pos ← －1",
      "整数型: cnt ← 0",
      "while ((low が high 以下) and (pos が －1 と等しい))",
      "  mid ← (low ＋ high) ÷ 2",
      "  cnt ← cnt ＋ 1",
      "  if (data[mid] が x と等しい)",
      "    pos ← mid",
      "  elseif (data[mid] が x より小さい)",
      "    low ← mid ＋ 1",
      "  else",
      "    high ← mid － 1",
      "  endif",
      "endwhile",
    ],
  },
  notes: [
    "配列の要素番号は 1 から始まる。",
    "data の要素数は，配列 data に入っている値の個数（7）である。",
    "÷ は，商の小数点以下を切り捨てた整数を求める（例：13 ÷ 2 は 6）。",
  ],
  question: "プログラムを実行し終わったときの cnt と low の値の組合せはどれか。",
  answerType: "vars",
  choices: [
    { ja: "cnt は 3、low は 6", code: "cnt = 3, low = 6", correct: true },
    {
      ja: "cnt は 2、low は 5",
      code: "cnt = 2, low = 5",
      wrongFeedback: "8行目は「low が high 以下」です。low＝5、high＝5 のときは等しいので成り立ち、もう 1 回繰り返します。",
      stop: { line: 8, nth: 3 },
    },
    {
      ja: "cnt は 3、low は 1",
      code: "cnt = 3, low = 1",
      wrongFeedback: "13行目は「data[mid] が x より小さい」なら low を動かします。data[4]＝15 は 20 より小さいので、探す範囲は右半分（low＝5 から）になります。",
      stop: { line: 14, mark: [13, 14] },
    },
    {
      ja: "cnt は 4、low は 6",
      code: "cnt = 4, low = 6",
      wrongFeedback: "8行目の条件は繰り返しの始めに毎回調べます。low＝6、high＝5 になった時点で条件は成り立たず、9〜10行目（mid の計算と cnt を増やす）は実行しません。",
      stop: { line: 8, nth: 3, mark: [8] },
    },
  ],
  events: [...search5Events(), end()],
  expectedFinal: { vars: { cnt: 3, low: 6, high: 5, pos: -1 } },
  hints: [
    "1 回目：low＝1、high＝7 なので mid＝(1＋7)÷2＝4。data[4]＝15 は 20 より小さいので、low＝4＋1＝5 になります。",
    "8行目は「low が high 以下」（等しいときも含む）のあいだ繰り返します。low と high は、探す範囲の左端と右端です。",
    "2 回目は mid＝(5＋7)÷2＝6 で data[6]＝24、3 回目は mid＝5 で data[5]＝19。それぞれ low と high はどう変わるかな？",
  ],
  explanation: {
    why: "探す範囲の真ん中 mid と x（20）を比べ、x の方が大きければ右半分（low ← mid ＋ 1）、小さければ左半分（high ← mid － 1）に絞ります。15＜20 で low＝5、24＞20 で high＝5、19＜20 で low＝6。low が high より大きくなり、範囲が空になったので終わります（20 は見つからず pos＝－1）。比較は 3 回で cnt＝3、low＝6 です。",
    trace: [
      { line: 14, state: "low=1, high=7 → mid=4：15 ＜ 20 → low=5（cnt=1）" },
      { line: 16, state: "low=5, high=7 → mid=6：24 ＞ 20 → high=5（cnt=2）" },
      { line: 14, state: "low=5, high=5 → mid=5：19 ＜ 20 → low=6（cnt=3）" },
      { line: 8, state: "6 ≦ 5 は偽 → 終わり" },
    ],
    points: [
      "二分探索は、整列済みの配列で、探す範囲を毎回半分にする",
      "low と high が等しくなっても、まだ 1 つ調べる要素が残っている（low ≦ high で続ける）",
      "見つからないときは、low が high より大きくなって終わる",
    ],
  },
};

// ================= 6〜10：穴埋め =================
// 空欄の記号 a・b と まぎれないよう、穴埋めの問題では 変数名・配列名に a・b を使わない。
// 誤答は、その選択肢を空欄に入れたプログラムを実行して見せる（どの誤答も このデータで 目的と ちがう結果になる）。

// ---- search-6：見つかった位置 ----
const S6 = [6, 3, 9, 4];
const F6 = autoField(["x", "pos", "i"], { compare: true, arrays: [{ name: "data", values: S6 }] });
function search6Run(fill) {
  const B = builder(F6);
  const ev = [line(1), line(2), ...B.set("x", 9), line(3), ...B.set("pos", 0), line(4)];
  S6.forEach((v, n) => {
    const i = n + 1;
    const hit = v === 9;
    ev.push(...forStep(B, 5, "i", i, i === 1), line(6), ...B.cmp([`data[${i}]`, "x"], `${v} ＝ 9`, hit));
    if (hit) {
      ev.push(line(7));
      if (fill === "i") ev.push(...B.copy("pos", "i"));
      else if (fill === "x") ev.push(...B.copy("pos", "x"));
      else if (fill === "i ＋ 1") ev.push(...B.calc("pos", ["i", 1], "i ＋ 1", i + 1));
      else ev.push(...B.calc("pos", ["i", 1], "i － 1", i - 1));
    }
    ev.push(line(8), line(9));
  });
  return ev;
}

const search6 = {
  id: "search-6",
  genre: "search",
  level: 6,
  title: "見つけた場所の穴",
  concepts: ["linear-search", "blank"],
  intro: "ここからは穴埋め問題。［a］ に入るものを選ぼう。\n「ここまで進める」は、穴の手前まで使えるよ。",
  field: F6,
  vars: {},
  varColors: { data: "#FFA726", x: "#66BB6A", pos: "#F06292", i: "#4FC3F7" },
  program: {
    ja: [
      "整数の配列 data を用意して、{6, 3, 9, 4} を入れる",
      "整数の変数 x を用意して、9 を入れる",
      "整数の変数 pos を用意して、0 を入れる",
      "整数の変数 i を用意する",
      "i を 1 から data の要素数（4）まで 1ずつ増やしながら、6〜8行目を繰り返す",
      "  もし data の i番目が x と等しいなら、7行目を実行する",
      "    ［a］ の値を pos に入れる",
      "  （ここで分かれ道は終わり）",
      "（繰り返す範囲はここまで。5行目に戻る）",
    ],
    code: [
      "整数型の配列: data ← {6, 3, 9, 4}",
      "整数型: x ← 9",
      "整数型: pos ← 0",
      "整数型: i",
      "for (i を 1 から data の要素数 まで 1 ずつ増やす)",
      "  if (data[i] が x と等しい)",
      "    pos ← ［a］",
      "  endif",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "data の要素数は，配列 data に入っている値の個数（4）である。"],
  question:
    "次のプログラムは、配列 data の要素のうち x と等しい要素を探し、その要素番号を pos に格納する。data の要素の値はすべて異なる。x と等しい要素がないときは、pos は 0 のままとする。\nプログラム中の ［a］ に入れる正しい答えはどれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "i", code: "i", fill: { a: "i" }, correct: true },
    {
      ja: "x",
      code: "x",
      fill: { a: "x" },
      wrongFeedback: "x は探している値（9）です。これでは pos＝9 になります。pos に入れたいのは、見つかった場所の要素番号です。",
      events: search6Run("x"),
    },
    {
      ja: "i ＋ 1",
      code: "i ＋ 1",
      fill: { a: "i ＋ 1" },
      wrongFeedback: "要素番号は 1 から数えるので、見つかったときの i がそのまま要素番号です。1 を足すと pos＝4 になり、1 つ右にずれます。",
      events: search6Run("i ＋ 1"),
    },
    {
      ja: "i － 1",
      code: "i － 1",
      fill: { a: "i － 1" },
      wrongFeedback: "0 から数える言語の考え方です。この問題の要素番号は 1 から始まるので、1 を引くと pos＝2 になり、1 つ左にずれます。",
      events: search6Run("i － 1"),
    },
  ],
  events: [...search6Run("i"), end()],
  expectedFinal: { vars: { pos: 3 } },
  hints: [
    "i＝1、2 のとき data[i] は 6、3 で、9 ではありません。i＝3 のとき data[3]＝9 が x と等しくなります。",
    "そのとき pos に入れたいのは「何番目か」です。",
    "［a］ は i。pos＝3 になります。",
  ],
  explanation: {
    why: "i を 1 から変えながら data[i] と x を比べ、等しいときの i（要素番号）を pos に入れます。data[3]＝9 なので pos＝3 です。",
    trace: [
      { line: 6, state: "i=1：6 ＝ 9 は偽" },
      { line: 6, state: "i=2：3 ＝ 9 は偽" },
      { line: 7, state: "i=3：9 ＝ 9 は真 → pos=3" },
      { line: 6, state: "i=4：4 ＝ 9 は偽" },
    ],
    points: ["見つかった場所は、そのときのループ変数 i（要素番号）", "要素番号が 1 から始まるか 0 から始まるかに注意する"],
  },
};

// ---- search-7：番兵を置く場所 ----
const S7 = [6, 3, 9, 4, 0];
const F7 = autoField(["n", "x", "i", "pos"], { compare: true, arrays: [{ name: "data", values: S7 }] });
const S7_AT = { "n ＋ 1": 5, n: 4, 1: 1, 0: 0 };
function search7Run(fill) {
  const B = builder(F7);
  const data = [...S7];
  const ev = [line(1), line(2), ...B.set("n", 4), line(3), ...B.set("x", 5), line(4), ...B.set("i", 1), line(5), line(6)];
  const at = S7_AT[fill];
  if (at < 1) return [...ev, ...error("data[0] はない！（要素番号は 1 から）")];
  data[at - 1] = 5;
  ev.push(...B.copy(`data[${at}]`, "x"));
  let i = 1;
  for (;;) {
    const go = data[i - 1] !== 5;
    ev.push(line(7), ...B.cmp([`data[${i}]`, "x"], `${data[i - 1]} ≠ 5`, go));
    if (!go) break;
    i += 1;
    ev.push(line(8), ...B.calc("i", ["i", 1], "i ＋ 1", i), line(9));
  }
  const none = i === 5;
  ev.push(line(10), ...B.cmp(["i", "n", 1], `${i} ＝ 4 ＋ 1`, none));
  if (none) ev.push(line(11), ...B.set("pos", -1));
  else ev.push(line(12), line(13), ...B.copy("pos", "i"));
  return ev;
}

const search7 = {
  id: "search-7",
  genre: "search",
  level: 7,
  title: "番兵を置く穴",
  concepts: ["linear-search", "sentinel", "blank"],
  field: F7,
  vars: {},
  varColors: { data: "#FFA726", n: "#26A69A", x: "#66BB6A", i: "#4FC3F7", pos: "#F06292" },
  program: {
    ja: [
      "整数の配列 data を用意して、{6, 3, 9, 4, 0} を入れる",
      "整数の変数 n を用意して、4 を入れる",
      "整数の変数 x を用意して、5 を入れる",
      "整数の変数 i を用意して、1 を入れる",
      "整数の変数 pos を用意する",
      "x の値を data の（［a］）番目に写す",
      "data の i番目が x と等しくないあいだ、8行目を繰り返す",
      "  i を 1 増やす",
      "（繰り返す範囲はここまで。7行目に戻る）",
      "もし i が n ＋ 1 と等しいなら、11行目を実行する",
      "  pos に －1 を入れる",
      "そうでないときは、13行目を実行する",
      "  i の値を pos に写す",
      "（ここで分かれ道は終わり）",
    ],
    code: [
      "整数型の配列: data ← {6, 3, 9, 4, 0}",
      "整数型: n ← 4",
      "整数型: x ← 5",
      "整数型: i ← 1",
      "整数型: pos",
      "data[［a］] ← x",
      "while (data[i] が x と等しくない)",
      "  i ← i ＋ 1",
      "endwhile",
      "if (i が n ＋ 1 と等しい)",
      "  pos ← －1",
      "else",
      "  pos ← i",
      "endif",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。"],
  question:
    "次のプログラムは、配列 data の 1番目から n番目までの要素のうち x と等しい要素を探し、最初に見つかった要素の要素番号を pos に格納する。x と等しい要素がないときは、pos に －1 を格納する。data の n ＋ 1 番目は、探索を必ず止めるための値（番兵）を置く場所として空けてある。\nプログラム中の ［a］ に入れる正しい答えはどれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "n ＋ 1", code: "n ＋ 1", fill: { a: "n ＋ 1" }, correct: true },
    {
      ja: "n",
      code: "n",
      fill: { a: "n" },
      wrongFeedback: "data[n]（4番目）は探索する範囲の最後の要素です。ここに x を入れると元の値 4 が消え、x がないのに 4番目で「見つかった」ことになって pos＝4 になります。",
      events: search7Run("n"),
    },
    {
      ja: "1",
      code: "1",
      fill: { a: "1" },
      wrongFeedback: "data[1] に x を入れると、最初の要素で必ず止まり、pos＝1 になってしまいます。番兵は探索する範囲の外（最後の次）に置きます。",
      events: search7Run("1"),
    },
    {
      ja: "0",
      code: "0",
      fill: { a: "0" },
      wrongFeedback: "要素番号は 1 から始まるので、data[0] はありません。",
      events: search7Run("0"),
    },
  ],
  events: [...search7Run("n ＋ 1"), end()],
  expectedFinal: { vars: { pos: -1 } },
  hints: [
    "探す範囲は data の 1〜4番目（6, 3, 9, 4）で、5番目は番兵のために空けてあります。x＝5 は範囲の中にありません。",
    "番兵は、探す範囲の最後の次に x を置いておくことで、7行目の繰り返しが必ずそこで止まるようにするものです。範囲の中に置くと、元の値を壊してしまいます。",
    "［a］ は n ＋ 1。i は 5 まで進み、10行目で i が n ＋ 1 と等しいので pos＝－1 です。",
  ],
  explanation: {
    why: "探す範囲（1〜n番目）の次の n ＋ 1 番目に x を置くと、x が範囲の中になくても、7行目の繰り返しは n ＋ 1 番目で必ず止まります。止まった場所が n ＋ 1 なら「範囲の中にはなかった」と分かるので pos＝－1 にします。この例では 5 が範囲にないので、i＝5 で止まって pos＝－1 です。",
    trace: [
      { line: 6, state: "data[5]=5（番兵）" },
      { line: 8, state: "6, 3, 9, 4 は 5 と等しくない → i=5" },
      { line: 7, state: "data[5]=5 ≠ 5 は偽 → 終わり" },
      { line: 11, state: "i=5 は n＋1 → pos=−1" },
    ],
    points: ["番兵は探す範囲の外（最後の次）に置き、繰り返しの条件を「等しくない」だけにできる", "止まった場所が番兵の位置なら、見つからなかったと分かる"],
  },
};

// ---- search-8：最初に見つかった位置を残す条件 ----
const S8 = [5, 7, 3, 7, 9];
const F8 = autoField(["x", "pos", "i"], { compare: true, arrays: [{ name: "data", values: S8 }] });
/** ［a］ の条件：[比べる材料, 表示する式, 判定] */
const S8_TEST = {
  "pos が －1 と等しい": (pos) => [["pos", -1], `${num(pos)} ＝ －1`, pos === -1],
  "pos が －1 と等しくない": (pos) => [["pos", -1], `${num(pos)} ≠ －1`, pos !== -1],
  "pos が i より小さい": (pos, i) => [["pos", "i"], `${num(pos)} ＜ ${i}`, pos < i],
  "i が data の要素数 と等しい": (pos, i) => [["i", 5], `${i} ＝ 5`, i === 5],
};
function search8Run(fill) {
  const B = builder(F8);
  const ev = [line(1), line(2), ...B.set("x", 7), line(3), ...B.set("pos", -1), line(4)];
  let pos = -1;
  S8.forEach((v, n) => {
    const i = n + 1;
    const [ops, e, ok] = S8_TEST[fill](pos, i);
    const hit = v === 7 && ok;
    ev.push(...forStep(B, 5, "i", i, i === 1), line(6), ...B.cmp([`data[${i}]`, "x", ...ops], `${v} ＝ 7 and ${e}`, hit));
    if (hit) {
      pos = i;
      ev.push(line(7), ...B.copy("pos", "i"));
    }
    ev.push(line(8), line(9));
  });
  return ev;
}
const fill8 = (s) => ({ a: { code: s, ja: s.replace("要素数と", "要素数と") } });

const search8 = {
  id: "search-8",
  genre: "search",
  level: 8,
  title: "最初の場所を残す穴",
  concepts: ["linear-search", "and", "blank"],
  field: F8,
  vars: {},
  varColors: { data: "#FFA726", x: "#66BB6A", pos: "#F06292", i: "#4FC3F7" },
  program: {
    ja: [
      "整数の配列 data を用意して、{5, 7, 3, 7, 9} を入れる",
      "整数の変数 x を用意して、7 を入れる",
      "整数の変数 pos を用意して、－1 を入れる",
      "整数の変数 i を用意する",
      "i を 1 から data の要素数（5）まで 1ずつ増やしながら、6〜8行目を繰り返す",
      "  もし「data の i番目が x と等しい」と「［a］」が両方とも成り立つなら、7行目を実行する",
      "    i の値を pos に写す",
      "  （ここで分かれ道は終わり）",
      "（繰り返す範囲はここまで。5行目に戻る）",
    ],
    code: [
      "整数型の配列: data ← {5, 7, 3, 7, 9}",
      "整数型: x ← 7",
      "整数型: pos ← －1",
      "整数型: i",
      "for (i を 1 から data の要素数 まで 1 ずつ増やす)",
      "  if ((data[i] が x と等しい) and (［a］))",
      "    pos ← i",
      "  endif",
      "endfor",
    ],
  },
  notes: ["配列の要素番号は 1 から始まる。", "data の要素数は，配列 data に入っている値の個数（5）である。"],
  question:
    "次のプログラムは、配列 data の要素のうち x と等しい要素を探し、その要素番号を pos に格納する。x と等しい要素が複数あるときは、そのうち最も小さい要素番号を格納する。x と等しい要素がないときは、pos に －1 を格納する。\nプログラム中の ［a］ に入れる正しい答えはどれか。",
  answerType: "blank",
  blanks: ["a"],
  choices: [
    { ja: "pos が －1 と等しい", code: "pos が －1 と等しい", fill: fill8("pos が －1 と等しい"), correct: true },
    {
      ja: "pos が －1 と等しくない",
      code: "pos が －1 と等しくない",
      fill: fill8("pos が －1 と等しくない"),
      wrongFeedback: "pos は最初 －1 なので、この条件は最初から成り立たず、一度も pos に入れられません。pos＝－1 のままになります。",
      events: search8Run("pos が －1 と等しくない"),
    },
    {
      ja: "pos が i より小さい",
      code: "pos が i より小さい",
      fill: fill8("pos が i より小さい"),
      wrongFeedback: "pos はいつも i より小さい（それまでに入れた要素番号か －1）ので、見つかるたびに入れ直され、最後の 7 の要素番号 4 が残ります。",
      events: search8Run("pos が i より小さい"),
    },
    {
      ja: "i が data の要素数と等しい",
      code: "i が data の要素数 と等しい",
      fill: fill8("i が data の要素数 と等しい"),
      wrongFeedback: "これでは最後の要素（data[5]＝9）だけを調べることになり、7 は見つからず pos＝－1 のままです。",
      events: search8Run("i が data の要素数 と等しい"),
    },
  ],
  events: [...search8Run("pos が －1 と等しい"), end()],
  expectedFinal: { vars: { pos: 2 } },
  hints: [
    "7 は data の 2番目と 4番目にあります。条件が「data[i] が x と等しい」だけだと、pos は 2 → 4 と入れ直され、最後の 4 が残ってしまいます。",
    "最初に見つかった場所を残すには、「まだ見つかっていないとき」だけ pos に入れればよい。まだ見つかっていないとき、pos はいくつかな？",
    "［a］ は「pos が －1 と等しい」。i＝2 で pos＝2 になり、i＝4 では pos が －1 でないので入れ直しません。",
  ],
  explanation: {
    why: "pos は「まだ見つかっていない」ことを －1 で表しています。そこで「pos が －1 と等しい」ときだけ入れると、最初に見つかった 2 が入ったあとは、もう入れ直されません。pos＝2 です。",
    trace: [
      { line: 7, state: "i=2：7 ＝ 7 and −1 ＝ −1 → pos=2" },
      { line: 6, state: "i=4：7 ＝ 7 and 2 ＝ −1 は偽" },
    ],
    points: ["最初の位置を残すには「まだ見つかっていないときだけ」入れる", "－1 などの「ありえない値」で、まだ見つかっていないことを表す"],
  },
};

// ---- search-9：二分探索の条件と mid（空欄2つ） ----
const S9 = [3, 7, 11, 15, 19, 24, 30];
const F9 = autoField(["x", "low", "high", "mid", "pos"], { compare: true, arrays: [{ name: "data", values: S9 }] });
const S9_COND = {
  "low が high 以下": (l, h) => [`${l} ≦ ${h}`, l <= h],
  "low が high より小さい": (l, h) => [`${l} ＜ ${h}`, l < h],
};
const S9_MID = {
  "(low ＋ high) ÷ 2": (l, h) => Math.trunc((l + h) / 2),
  "low ＋ high ÷ 2": (l, h) => l + Math.trunc(h / 2),
  "(high － low) ÷ 2": (l, h) => Math.trunc((h - l) / 2),
};
function search9Run(a, b) {
  const B = builder(F9);
  const x = 19;
  const ev = [line(1), line(2), ...B.set("x", x), line(3), ...B.set("low", 1), line(4), ...B.set("high", S9.length), line(5), line(6), ...B.set("pos", -1)];
  let [low, high, pos] = [1, S9.length, -1];
  for (let k = 0; ; k++) {
    const [e, ok] = S9_COND[a](low, high);
    const go = ok && pos === -1;
    ev.push(line(7), ...B.cmp(["low", "high", "pos", -1], `${e} and ${num(pos)} ＝ －1`, go));
    if (!go) break;
    if (k >= LIMIT) return [...ev, ...endless()];
    const mid = S9_MID[b](low, high);
    ev.push(line(8), ...B.calc("mid", ["low", "high", 2], b, mid));
    if (mid < 1 || mid > S9.length) return [...ev, line(9), ...error(`data[${mid}] はない！（data は 7番目まで）`)];
    const v = S9[mid - 1];
    ev.push(line(9), ...B.cmp([`data[${mid}]`, "x"], `${v} ＝ ${x}`, v === x));
    if (v === x) {
      pos = mid;
      ev.push(line(10), ...B.copy("pos", "mid"));
    } else {
      ev.push(line(11), ...B.cmp([`data[${mid}]`, "x"], `${v} ＜ ${x}`, v < x));
      if (v < x) {
        low = mid + 1;
        ev.push(line(12), ...B.calc("low", ["mid", 1], "mid ＋ 1", low));
      } else {
        high = mid - 1;
        ev.push(line(13), line(14), ...B.calc("high", ["mid", 1], "mid － 1", high));
      }
    }
    ev.push(line(15), line(16));
  }
  return ev;
}
const fill9 = (a, b) => ({ a, b });

const search9 = {
  id: "search-9",
  genre: "search",
  level: 9,
  title: "二分探索の穴",
  concepts: ["binary-search", "while", "blank"],
  field: F9,
  vars: {},
  varColors: { data: "#FFA726", x: "#66BB6A", low: "#4FC3F7", high: "#9575CD", mid: "#FFB74D", pos: "#F06292" },
  program: {
    ja: [
      "整数の配列 data を用意して、{3, 7, 11, 15, 19, 24, 30} を入れる",
      "整数の変数 x を用意して、19 を入れる",
      "整数の変数 low を用意して、1 を入れる",
      "整数の変数 high を用意して、data の要素数（7）を入れる",
      "整数の変数 mid を用意する",
      "整数の変数 pos を用意して、－1 を入れる",
      "「［a］」と「pos が －1 と等しい」が両方とも成り立つあいだ、8〜15行目を繰り返す",
      "  ［b］ を mid に入れる",
      "  もし data の mid番目が x と等しいなら、10行目を実行する",
      "    mid の値を pos に写す",
      "  そうではなく、data の mid番目が x より小さいなら、12行目を実行する",
      "    mid に 1 を足して、その答えを low に入れる",
      "  どれにも当てはまらないときは、14行目を実行する",
      "    mid から 1 を引いて、その答えを high に入れる",
      "  （ここで分かれ道は終わり）",
      "（繰り返す範囲はここまで。7行目に戻る）",
    ],
    code: [
      "整数型の配列: data ← {3, 7, 11, 15, 19, 24, 30}",
      "整数型: x ← 19",
      "整数型: low ← 1",
      "整数型: high ← data の要素数",
      "整数型: mid",
      "整数型: pos ← －1",
      "while ((［a］) and (pos が －1 と等しい))",
      "  mid ← ［b］",
      "  if (data[mid] が x と等しい)",
      "    pos ← mid",
      "  elseif (data[mid] が x より小さい)",
      "    low ← mid ＋ 1",
      "  else",
      "    high ← mid － 1",
      "  endif",
      "endwhile",
    ],
  },
  notes: [
    "配列の要素番号は 1 から始まる。",
    "data の要素数は，配列 data に入っている値の個数（7）である。",
    "÷ は，商の小数点以下を切り捨てた整数を求める。÷ は ＋ と － より先に計算する。",
  ],
  question:
    "次のプログラムは、昇順に整列された配列 data から、二分探索によって x と等しい要素を探し、その要素番号を pos に格納する。data の要素の値はすべて異なる。x と等しい要素がないときは、pos に －1 を格納する。low と high は、探す範囲の最初と最後の要素番号を表す。\nプログラム中の ［a］ と ［b］ に入れる正しい答えの組合せはどれか。",
  answerType: "blank",
  blanks: ["a", "b"],
  choices: [
    { ja: "a：low が high 以下　b：(low ＋ high) ÷ 2", code: "a：low が high 以下　b：(low ＋ high) ÷ 2", fill: fill9("low が high 以下", "(low ＋ high) ÷ 2"), correct: true },
    {
      ja: "a：low が high より小さい　b：(low ＋ high) ÷ 2",
      code: "a：low が high より小さい　b：(low ＋ high) ÷ 2",
      fill: fill9("low が high より小さい", "(low ＋ high) ÷ 2"),
      wrongFeedback: "low と high が等しい（範囲に要素が 1 つだけ残っている）ときに繰り返しを終えてしまいます。この例では low＝high＝5 の data[5]＝19 を調べずに終わり、pos＝－1 になります。",
      events: search9Run("low が high より小さい", "(low ＋ high) ÷ 2"),
    },
    {
      ja: "a：low が high 以下　b：low ＋ high ÷ 2",
      code: "a：low が high 以下　b：low ＋ high ÷ 2",
      fill: fill9("low が high 以下", "low ＋ high ÷ 2"),
      wrongFeedback: "÷ は ＋ より先に計算するので、low ＋ (high ÷ 2) になってしまいます。2 回目に mid＝5＋3＝8 となり、ない要素 data[8] を使おうとして止まります。",
      events: search9Run("low が high 以下", "low ＋ high ÷ 2"),
    },
    {
      ja: "a：low が high 以下　b：(high － low) ÷ 2",
      code: "a：low が high 以下　b：(high － low) ÷ 2",
      fill: fill9("low が high 以下", "(high － low) ÷ 2"),
      wrongFeedback: "(high － low) ÷ 2 は範囲の幅の半分で、範囲の真ん中の要素番号ではありません。mid が範囲の外を指して low が進まなくなり、繰り返しが終わりません。",
      events: search9Run("low が high 以下", "(high － low) ÷ 2"),
    },
  ],
  events: [...search9Run("low が high 以下", "(low ＋ high) ÷ 2"), end()],
  expectedFinal: { vars: { pos: 5 } },
  hints: [
    "最初は low＝1、high＝7。範囲の真ん中の要素番号は (1 ＋ 7) ÷ 2 ＝ 4 で、data[4]＝15 は 19 より小さいので low＝5 になります。",
    "÷ は ＋ より先に計算されることに注意。また、low と high が等しいときも、範囲にはまだ 1 つ要素が残っています。",
    "a は「low が high 以下」、b は (low ＋ high) ÷ 2。mid は 4 → 6 → 5 と変わり、data[5]＝19 で pos＝5 です。",
  ],
  explanation: {
    why: "範囲の真ん中は (low ＋ high) ÷ 2 です（括弧がないと ÷ が先に計算される）。範囲に要素が 1 つでも残っているあいだ（low ≦ high）は続けます。mid＝4（15＜19 → low＝5）、mid＝6（24＞19 → high＝5）、mid＝5（19＝19）で pos＝5 です。",
    trace: [
      { line: 12, state: "low=1, high=7 → mid=4：15 ＜ 19 → low=5" },
      { line: 14, state: "low=5, high=7 → mid=6：24 ＞ 19 → high=5" },
      { line: 10, state: "low=5, high=5 → mid=5：19 ＝ 19 → pos=5" },
    ],
    points: ["真ん中の要素番号は (low ＋ high) ÷ 2。括弧を忘れない", "low ＝ high でも 1 つ調べる要素が残っているので「low が high 以下」で続ける"],
  },
};

// ---- search-10：x 以上が最初に現れる位置（二分探索。空欄2つ） ----
const S10 = [2, 4, 4, 7, 9, 9, 12];
const F10 = autoField(["x", "low", "high", "mid", "pos"], { compare: true, arrays: [{ name: "data", values: S10 }] });
const S10_TEST = {
  "data[mid] が x 以上": (v, x) => [`${v} ≧ ${x}`, v >= x],
  "data[mid] が x より大きい": (v, x) => [`${v} ＞ ${x}`, v > x],
  "data[mid] が x と等しい": (v, x) => [`${v} ＝ ${x}`, v === x],
};
function search10Run(a, b) {
  const B = builder(F10);
  const x = 4;
  const n = S10.length;
  const ev = [line(1), line(2), ...B.set("x", x), line(3), ...B.set("low", 1), line(4), ...B.set("high", n + 1), line(5)];
  let [low, high] = [1, n + 1];
  for (let k = 0; ; k++) {
    const go = low < high;
    ev.push(line(6), ...B.cmp(["low", "high"], `${low} ＜ ${high}`, go));
    if (!go) break;
    if (k >= LIMIT) return [...ev, ...endless()];
    const mid = Math.trunc((low + high) / 2);
    const v = S10[mid - 1];
    const [e, ok] = S10_TEST[a](v, x);
    ev.push(line(7), ...B.calc("mid", ["low", "high", 2], "(low ＋ high) ÷ 2", mid), line(8), ...B.cmp([`data[${mid}]`, "x"], e, ok));
    if (ok) {
      ev.push(line(9));
      if (b === "high ← mid") {
        high = mid;
        ev.push(...B.copy("high", "mid"));
      } else {
        high = mid - 1;
        ev.push(...B.calc("high", ["mid", 1], "mid － 1", high));
      }
    } else {
      low = mid + 1;
      ev.push(line(10), line(11), ...B.calc("low", ["mid", 1], "mid ＋ 1", low));
    }
    ev.push(line(12), line(13));
  }
  ev.push(line(14), ...B.copy("pos", "low"));
  return ev;
}
const FILL10_JA = {
  "data[mid] が x 以上": "data の mid番目が x 以上",
  "data[mid] が x より大きい": "data の mid番目が x より大きい",
  "data[mid] が x と等しい": "data の mid番目が x と等しい",
  "high ← mid": "mid の値を high に写す",
  "high ← mid － 1": "mid から 1 を引いて、その答えを high に入れる",
};
const fill10 = (a, b) => ({ a: { code: a, ja: FILL10_JA[a] }, b: { code: b, ja: FILL10_JA[b] } });
const ja10 = (a, b) => `a：${FILL10_JA[a]}　b：${FILL10_JA[b]}`;

const search10 = {
  id: "search-10",
  genre: "search",
  level: 10,
  title: "以上が始まる場所の穴",
  concepts: ["binary-search", "lower-bound", "blank"],
  field: F10,
  vars: {},
  varColors: { data: "#FFA726", x: "#66BB6A", low: "#4FC3F7", high: "#9575CD", mid: "#FFB74D", pos: "#F06292" },
  program: {
    ja: [
      "整数の配列 data を用意して、{2, 4, 4, 7, 9, 9, 12} を入れる",
      "整数の変数 x を用意して、4 を入れる",
      "整数の変数 low を用意して、1 を入れる",
      "整数の変数 high を用意して、data の要素数 ＋ 1（8）を入れる",
      "整数の変数 mid と pos を用意する",
      "low が high より小さいあいだ、7〜12行目を繰り返す",
      "  low と high を足して 2 で割った値（小数点以下は切り捨て）を mid に入れる",
      "  もし ［a］ なら、9行目を実行する",
      "    ［b］",
      "  そうでないときは、11行目を実行する",
      "    mid に 1 を足して、その答えを low に入れる",
      "  （ここで分かれ道は終わり）",
      "（繰り返す範囲はここまで。6行目に戻る）",
      "low の値を pos に写す",
    ],
    code: [
      "整数型の配列: data ← {2, 4, 4, 7, 9, 9, 12}",
      "整数型: x ← 4",
      "整数型: low ← 1",
      "整数型: high ← data の要素数 ＋ 1",
      "整数型: mid, pos",
      "while (low が high より小さい)",
      "  mid ← (low ＋ high) ÷ 2",
      "  if (［a］)",
      "    ［b］",
      "  else",
      "    low ← mid ＋ 1",
      "  endif",
      "endwhile",
      "pos ← low",
    ],
  },
  notes: [
    "配列の要素番号は 1 から始まる。",
    "data の要素数は，配列 data に入っている値の個数（7）である。",
    "÷ は，商の小数点以下を切り捨てた整数を求める。",
  ],
  question:
    "次のプログラムは、昇順に整列された配列 data（同じ値の要素が複数あることもある）から、二分探索によって、値が x 以上である要素のうち最も小さい要素番号を求め、pos に格納する。x 以上の要素がないときは、data の要素数 ＋ 1 を pos に格納する。\nプログラム中の ［a］ と ［b］ に入れる正しい答えの組合せはどれか。",
  answerType: "blank",
  blanks: ["a", "b"],
  choices: [
    {
      ja: ja10("data[mid] が x 以上", "high ← mid"),
      code: "a：data[mid] が x 以上　b：high ← mid",
      fill: fill10("data[mid] が x 以上", "high ← mid"),
      correct: true,
    },
    {
      ja: ja10("data[mid] が x より大きい", "high ← mid"),
      code: "a：data[mid] が x より大きい　b：high ← mid",
      fill: fill10("data[mid] が x より大きい", "high ← mid"),
      wrongFeedback: "これは「x より大きい要素」の最初の位置を求めてしまいます。x と等しい 4 を飛ばして、7 の要素番号 4 になります。",
      events: search10Run("data[mid] が x より大きい", "high ← mid"),
    },
    {
      ja: ja10("data[mid] が x 以上", "high ← mid － 1"),
      code: "a：data[mid] が x 以上　b：high ← mid － 1",
      fill: fill10("data[mid] が x 以上", "high ← mid － 1"),
      wrongFeedback: "data[mid] が x 以上なら、mid 自身が答えかもしれません。high ← mid － 1 では答えの候補を範囲から外してしまい、この例では pos＝1（値 2）になります。",
      events: search10Run("data[mid] が x 以上", "high ← mid － 1"),
    },
    {
      ja: ja10("data[mid] が x と等しい", "high ← mid"),
      code: "a：data[mid] が x と等しい　b：high ← mid",
      fill: fill10("data[mid] が x と等しい", "high ← mid"),
      wrongFeedback: "最初の mid＝4 で data[4]＝7 は 4 と等しくないので low が右へ進み、x より大きい値でも右へ進み続けて pos＝8 になります。x より大きい値のときも左半分に絞る必要があります。",
      events: search10Run("data[mid] が x と等しい", "high ← mid"),
    },
  ],
  events: [...search10Run("data[mid] が x 以上", "high ← mid"), end()],
  expectedFinal: { vars: { pos: 2 } },
  hints: [
    "最初は low＝1、high＝8 で、mid＝(1＋8)÷2＝4。data[4]＝7 は x（4）以上です。答えは 4番目かそれより左にあります。",
    "答えの候補の範囲は low 以上 high 未満です。data[mid] が x 以上なら mid 自身も答えの候補なので、high を mid にします（mid － 1 にすると候補から外れる）。",
    "a は「data[mid] が x 以上」、b は high ← mid。mid は 4 → 2 → 1 と変わり、low＝high＝2 で終わって pos＝2 です。",
  ],
  explanation: {
    why: "答えの候補を「low 以上 high 未満」の範囲で表し、data[mid] が x 以上なら答えは mid か左にある（high ← mid）、x より小さければ右にある（low ← mid ＋ 1）として範囲を絞ります。low と high が等しくなったところが答えです。mid＝4（7≧4 → high＝4）、mid＝2（4≧4 → high＝2）、mid＝1（2＜4 → low＝2）で pos＝2 です。",
    trace: [
      { line: 9, state: "low=1, high=8 → mid=4：7 ≧ 4 → high=4" },
      { line: 9, state: "low=1, high=4 → mid=2：4 ≧ 4 → high=2" },
      { line: 11, state: "low=1, high=2 → mid=1：2 ≧ 4 は偽 → low=2" },
      { line: 14, state: "low=high=2 → pos=2" },
    ],
    points: [
      "「条件を満たす最初の位置」を二分探索で求めるときは、範囲を「low 以上 high 未満」で考える",
      "data[mid] が条件を満たすなら mid も候補なので high ← mid（mid － 1 にしない）",
      "同じ値が複数あっても、x 以上の最初の位置（2番目）が求められる",
    ],
  },
};

export default [search1, search2, search3, search4, search5, search6, search7, search8, search9, search10];
