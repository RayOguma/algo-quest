// 問題画面（§4.3〜4.5）
import * as state from "../state.js";
import { show } from "../router.js";
import { h, coinBadge, modal, showOX, toast, starsText } from "../ui.js";
import { playSE } from "../engine/audio.js";
import { FieldView } from "../engine/field.js";
import { Runner } from "../engine/runner.js";
import { VarBar } from "../engine/varbar.js";
import { eventsForChoice, reviewLines, blankStopIndex, compareWithGoal, fillText } from "../engine/world.js";
import { colorFor } from "../engine/parts.js";
import { getStage, stageFor } from "../data/stages/index.js";
import { genreOf, MAX_LEVEL } from "../data/genres.js";
import { codeView, viewToggle, programPanel, speedBar, stageLabel, notesBox, choiceContent } from "./common.js";
import { memoPanel } from "./memo.js";
import { peekUnit, peekTargets, totalSteps, loopLabel, keyText } from "../engine/peek.js";

const LABELS = ["A", "B", "C", "D"];
const HINT_NAMES = ["① 方向性", "② 考え方", "③ 解答補助"];

let q = null; // 画面ローカル状態

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isMobile() {
  return window.matchMedia("(max-width: 899px)").matches;
}

function fieldMaxHeight() {
  if (isMobile()) return window.innerHeight * 0.4;
  // PC：左半分の高さに収める（ヘッダー・変数バー・速度バーと、下端のタスクバー等にかからない余白の分を引く）
  return Math.max(200, window.innerHeight - 250) || 480;
}

/** [5] → "5行目"、[5, 6, 7] → "5〜7行目"、[4, 7] → "4・7行目" */
function lineRange(lines) {
  if (!lines.length) return "行";
  const s = [...lines].sort((x, y) => x - y);
  const a = s[0];
  const b = s[s.length - 1];
  if (a === b) return `${a}行目`;
  return b - a + 1 === s.length ? `${a}〜${b}行目` : `${s.join("・")}行目`;
}

function renderChoices() {
  const view = codeView();
  q.choicesEl.innerHTML = "";
  q.choicesEl.classList.toggle("is-code", view === "code");
  q.order.forEach((c, i) => {
    const wrong = q.wrong.has(c);
    const selected = q.selected === c;
    const b = h(
      `button.choice${selected ? ".selected" : ""}${wrong ? ".wrong" : ""}`,
      {
        type: "button",
        role: "radio",
        "aria-checked": String(selected),
        disabled: wrong || q.playing,
        "aria-label": `${LABELS[i]}. ${c[view]}${wrong ? "（まちがい）" : ""}`,
        title: `${i + 1}キーで選択`,
      },
      h("span.choice-label", { "aria-hidden": "true" }, LABELS[i]),
      h("span.choice-text", {}, choiceContent(q.stage, c, view)),
      wrong ? h("span.choice-mark", { "aria-hidden": "true" }, "✕") : selected ? h("span.choice-mark.sel", { "aria-hidden": "true" }, "●") : null
    );
    b.addEventListener("click", () => select(i));
    q.choicesEl.append(b);
  });
  q.answerBtn.disabled = !q.selected || q.playing;
}

function select(i) {
  if (q.playing) return;
  const c = q.order[i];
  if (!c || q.wrong.has(c)) return;
  q.selected = c;
  renderChoices();
}

/** ヒントボタンの表示（開いた数・次が無料か） */
function renderHints() {
  const rec = state.stageRec(q.stage.id);
  const opened = rec.hintsUsed.filter(Boolean).length;
  const next = state.nextHint(q.stage.id);
  q.hintBtn.innerHTML = "";
  q.hintBtn.append(
    "💡 ヒント",
    opened ? h("span.hint-count", {}, `${opened}/3`) : "",
    next && next.cost === 0 ? h("span.free-tag", {}, "むりょう") : ""
  );
  q.hintBtn.setAttribute(
    "aria-label",
    `ヒント（${opened}こ ひらいています。${next ? `つぎは ${next.cost === 0 ? "むりょう" : next.cost + "コイン"}` : "ぜんぶ ひらいています"}）`
  );
}

/**
 * ヒントはダイアログで見る（問題画面の中には出さない）。
 * 開いたヒントは保存されるので、もう一度ボタンを押せば何度でも見られる。
 */
async function openHint(justOpened = -1) {
  if (!q) return;
  const rec = state.stageRec(q.stage.id);
  const next = state.nextHint(q.stage.id);
  const list = h("div.hint-list");
  rec.hintsUsed.forEach((u, i) => {
    if (u) list.append(h(`p.hint${i === justOpened ? ".new" : ""}`, {}, h("b", {}, HINT_NAMES[i] + "："), q.stage.hints[i]));
  });
  if (!list.children.length) list.append(h("p.muted", {}, "まだ ヒントを ひらいていません。"));
  const body = h("div", {}, list);
  const actions = [];
  if (next) {
    const costText = next.cost === 0 ? "むりょう" : `${next.cost} コイン`;
    body.append(
      h(
        "p.muted.hint-next",
        {},
        `つぎは ヒント${HINT_NAMES[next.idx]}（${costText}）　いまの コイン：${state.coins()}`,
        h("br"),
        "ヒントを つかっても 星や コインは へりません"
      )
    );
    actions.push({ label: `ヒント${HINT_NAMES[next.idx].slice(0, 1)}を ひらく（${costText}）`, value: "open", primary: true });
  }
  actions.push({ label: "とじる", value: null, primary: !next });
  const v = await modal({ title: "💡 ヒント", body, actions });
  if (v !== "open" || !q) return;
  const r = state.buyHint(q.stage.id);
  if (!r.ok && r.reason === "coins") {
    await modal({ title: "コインが足りません", body: "ステージをクリアすると集まります。ヒントがなくても、なんどでも ちょうせんできるよ。" });
    return;
  }
  playSE("pickup");
  renderHints();
  openHint(r.idx);
}

function setPlaying(on) {
  q.playing = on;
  q.root.classList.toggle("playing", on);
  q.speed.show(on);
  renderChoices();
}

/**
 * 「ここまで 進める」：選んだ行（if 文の中なら if 文全体）が実行し終わる所まで、正しい処理を実演する。
 * くりかえしの中なら、何回目（for は変数の値）まで進めるかを選ぶ。実行する行の数に応じてコインを使う。
 */
async function peek(n) {
  if (!q || q.playing) return;
  const stage = q.stage;
  const unit = peekUnit(stage, n);
  const all = peekTargets(stage, unit);
  if (!all.length) {
    toast(`${n}行目は この問題では 実行されません`);
    return;
  }
  // 穴埋め：空欄の行が初めて実行される手前までしか進められない
  const limit = stage.blanks ? blankStopIndex(stage) : Infinity;
  const targets = all.filter((t) => t.stop <= limit);
  if (!targets.length) {
    toast("空欄の 行から 先は 進められません。空欄より 前の 行を えらんでね", 2600);
    return;
  }
  const total = totalSteps(stage);
  // くりかえしごとの選択欄（外側から。外側の値で、内側の選べる値をしぼる）
  const sels = unit.loops.map((l) => h("select.peek-sel", { "aria-label": loopLabel(l) }));
  const pick = () => targets.find((t) => t.keys.every((v, k) => String(v) === sels[k].value)) || targets[0];
  const fill = (from) => {
    for (let k = from; k < sels.length; k++) {
      const ok = targets.filter((t) => t.keys.slice(0, k).every((v, j) => String(v) === sels[j].value));
      const vals = [...new Set(ok.map((t) => t.keys[k]))];
      const keep = sels[k].value;
      sels[k].replaceChildren(...vals.map((v) => h("option", { value: String(v) }, keyText(unit.loops[k], v))));
      if (vals.map(String).includes(keep)) sels[k].value = keep;
    }
  };
  const costEl = h("p.peek-cost");
  const update = () => {
    const t = pick();
    const cost = state.peekCost(stage, t.steps, total);
    costEl.replaceChildren(
      cost === 0
        ? h("b", {}, state.stageRec(stage.id).cleared ? "むりょう（クリアずみ）" : "むりょう（もう 見た 所まで）")
        : h("span", {}, h("span.coin-icon"), h("b", {}, ` ${cost} コイン`), " つかいます"),
      h("small.muted", {}, `　いまの コイン：${state.coins()}`)
    );
    return cost;
  };
  fill(0);
  sels.forEach((s, k) =>
    s.addEventListener("change", () => {
      fill(k + 1);
      update();
    })
  );
  update();
  const range = unit.kind === "if" ? `${unit.start}〜${unit.end}行目の if 文` : `${n}行目`;
  const body = h(
    "div.peek",
    {},
    h("p", {}, `${range}が 実行し おわる所まで、アルゴくんが 正しい 処理を 実演します。`),
    unit.kind === "if" ? h("p.muted", {}, "if 文は、分かれ道 ぜんたいを 1つの 処理として 進めます。") : null,
    sels.length ? h("div.peek-sels", {}, ...sels.map((s, k) => h("label.peek-row", {}, h("span", {}, loopLabel(unit.loops[k]) + "："), s))) : null,
    sels.length ? h("p.muted", {}, "くりかえしの 何回目（変数が いくつの とき）まで 進めるかを えらべます。") : null,
    costEl,
    h("p.muted", {}, "コインは 実行する 行の 数に おうじて きまります。一度 見た 所までは 何度でも むりょう です。")
  );
  const v = await modal({
    title: `▶ ${range}まで 進める`,
    body,
    actions: [
      { label: "やめる", value: null },
      { label: "進める", value: "go", primary: true },
    ],
  });
  if (v !== "go" || !q || q.stage !== stage || q.playing) return;
  const t = pick();
  const r = state.buyPeek(stage, t.steps, total);
  if (!r.ok) {
    await modal({ title: "コインが 足りません", body: `あと ${r.need - state.coins()} コイン ひつようです。ヒントや、もっと 手前の 行なら 少ない コインで 見られます。` });
    return;
  }
  q.feedback.hidden = true;
  q.program.review([]);
  if (stage.blanks) q.program.fill(null); // 空欄の手前までの実演なので、空欄は空のまま
  setPlaying(true);
  if (isMobile()) q.leftPanel.scrollIntoView({ block: "start", behavior: "auto" });
  const res = await q.runner.play(stage.events.slice(0, t.stop));
  if (!q || res.aborted) return;
  setPlaying(false);
  q.program.review(unit.kind === "if" ? range2(unit.start, unit.end) : [n]);
  toast("ここまで 進めました。こたえると はじめから 実演します", 2600);
}

/** 追跡の誤答：正しい処理を手前で止めた所から、黄色の行を見直してもらう */
function traceFeedback(choice, lines) {
  return h(
    "div",
    {},
    h("b", {}, `ざんねん！ 黄色の ${lineRange(lines)}を 見直してみよう`),
    h("p", {}, choice.wrongFeedback || "もう一度 処理を たどってみよう。"),
    h("p.fb-retry", {}, "左の フィールドは、その手前まで 正しく 実行した ようすです。黄色の 行で 何が おきるか、もう一度 考えてみよう。")
  );
}

/** 穴埋めの誤答：その選択肢を入れて実行した結果を、目的と並べて どこが合わないかを示す */
function blankFeedback(choice, r) {
  const stage = q.stage;
  const view = codeView();
  const put = stage.blanks.map((k) => `［${k}］ に「${fillText(choice, k, view)}」`).join("、");
  const chip = (name, val, ng) => h(`span.var-inline${ng ? ".ng" : ""}`, { style: { "--c": colorFor(stage, name) } }, h("b", {}, name), `=${val}`);
  const parts = [];
  if (r.failInfo && r.failInfo.kind !== "mismatch") {
    parts.push(h("b", {}, `ざんねん！ ${put} を 入れると、とちゅうで 実行できなく なりました`), h("p", {}, `とまった りゆう：${r.failInfo.reason}`));
  } else {
    const rows = compareWithGoal(q.view.world.snapshot(), stage.expectedFinal);
    parts.push(
      h("b", {}, `ざんねん！ ${put} を 入れると、目的と ちがう 結果に なりました`),
      h(
        "div.goal-compare",
        {},
        h("span.gc-label", {}, "目的"),
        h("span.gc-vals", {}, ...rows.map((x) => chip(x.name, x.want, false))),
        h("span.gc-label", {}, "結果"),
        h("span.gc-vals", {}, ...rows.map((x) => chip(x.name, x.got, !x.ok)))
      )
    );
  }
  parts.push(
    h("p", {}, choice.wrongFeedback || "もう一度 処理を たどってみよう。"),
    h("p.fb-retry", {}, "黄色の 空欄に 何を 入れれば 目的どおりに なるか、もう一度 考えてみよう。")
  );
  return h("div", {}, ...parts);
}

const range2 = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

async function answer() {
  if (!q || q.playing || !q.selected) return;
  const choice = q.selected;
  const stage = q.stage;
  q.feedback.hidden = true;
  q.program.review([]);
  // 穴埋め：選んだものを空欄に入れて、そのプログラムを実演する（誤答は赤で示す）
  if (stage.blanks) q.program.fill(choice, !choice.correct);
  setPlaying(true);
  if (isMobile()) q.leftPanel.scrollIntoView({ block: "start", behavior: "auto" });
  const r = await q.runner.play(eventsForChoice(stage, choice));
  if (!q || r.aborted) return;
  const ok = r.result === "success";
  q.speed.show(false);
  await showOX(ok);
  if (!q) return;
  if (ok) {
    const res = state.recordClear(stage, q.mistakes);
    q.playing = false;
    playSE("clear");
    const body = h(
      "div.result",
      {},
      h("p.result-stars", { "aria-label": `星 ${res.stars}` }, starsText(res.stars)),
      h("p", {}, q.mistakes === 0 ? "ノーミス！ すごい！" : `まちがい ${q.mistakes} 回 → ★${res.stars}`),
      res.first
        ? h("p.result-coins", {}, h("span.coin-icon"), ` +${res.earned} コイン`, res.bonus ? `（ノーミス ボーナス +${res.bonus}）` : "")
        : h("p.muted", {}, "さいちょうせん：コインは もらえません（さいこう記録は のこります）"),
      h("p.muted", {}, `いまの コイン：${state.coins()}`)
    );
    // 解説を飛ばしたい人のために、次の問題・一覧へも直接行けるようにする
    const next = stageFor(stage.genre, stage.level + 1);
    if (!next && stage.level < MAX_LEVEL) body.append(h("p.muted", {}, "つぎの問題は じゅんびちゅう です"));
    const actions = [{ label: "一覧へ", value: "list" }];
    if (next) actions.push({ label: "次の問題へ ▶", value: "next" });
    actions.push({ label: "かいせつを みる", value: "explain", primary: true });
    const v = await modal({ title: "クリア！", body, actions });
    if (!q || q.stage !== stage) return; // 画面を離れていたら何もしない
    if (v === "list") show("area", { genre: stage.genre, focus: stage.id });
    else if (v === "next") show("quiz", { id: next.id });
    else show("explain", { id: stage.id });
    return;
  }
  // 誤答：盤面は止めた所のまま残し、見直す行を黄色で示す
  q.mistakes += 1;
  q.wrong.add(choice);
  q.selected = null;
  q.program.clear();
  const lines = reviewLines(choice, stage);
  q.program.review(lines);
  setPlaying(false);
  q.feedback.innerHTML = "";
  q.feedback.append(h("span.fb-icon", { "aria-hidden": "true" }, "✕"), stage.blanks ? blankFeedback(choice, r) : traceFeedback(choice, lines));
  q.feedback.hidden = false;
  q.feedback.scrollIntoView({ block: "nearest", behavior: state.settings().reduceMotion ? "auto" : "smooth" });
}

export default {
  el: "screen-quiz",
  mount(el, params) {
    const stage = getStage(params.id);
    if (!stage) {
      show("stages");
      return;
    }
    const genre = genreOf(stage.genre);
    q = { stage, el, order: shuffle(stage.choices), selected: null, wrong: new Set(), mistakes: 0, playing: false };
    const badge = coinBadge();
    q.badge = badge;
    q.hintBtn = h("button.btn.small.hint-btn", { type: "button", onclick: () => openHint() }, "💡 ヒント");
    const header = h(
      "header.topbar",
      {},
      h("button.btn.small", { type: "button", onclick: () => show("area", { genre: stage.genre, focus: stage.id }), "aria-label": "ステージ いちらんへ もどる" }, "← もどる"),
      h("h1.topbar-title", {}, stageLabel(stage, genre)),
      h("div.topbar-right", {}, badge, q.hintBtn)
    );

    // 左：フィールド
    q.fieldHost = h("div.field-host");
    q.speed = speedBar(() => q && q.runner);
    q.varbar = h("div.varbar", { "aria-label": "変数の いまの値" });
    const vb = new VarBar(q.varbar);
    // 変数バーはフィールドの上に置く（画面の下端だとタスクバーに隠れることがあるため）
    q.leftPanel = h("section.left-panel", { "aria-label": "フィールド" }, h("div.field-sticky", {}, q.varbar, q.fieldHost, q.speed.el));

    // 右：処理＋問題＋4択（処理の行を押すと「ここまで 進める」）
    q.program = programPanel(stage, { onLineClick: (n) => peek(n) });
    const toggle = viewToggle((v) => {
      q.program.setView(v);
      renderChoices();
    });
    q.toggle = toggle;
    // メモ：「疑似コード｜日本語」の反対側にボタン、パネルは画面の右側に出す
    q.memo = memoPanel(stage, {
      onToggle: (open) => {
        q.root.classList.toggle("memo-open", open);
        q.view.resize();
      },
    });
    q.choicesEl = h("div.choices", { role: "radiogroup", "aria-label": "こたえの せんたくし（1〜4キー）" });
    q.answerBtn = h("button.btn.primary.big.answer-btn", { type: "button", onclick: () => answer(), title: "Enterキー" }, "こたえる");
    q.feedback = h("div.feedback", { hidden: true, role: "alert" });
    const right = h(
      "section.right-panel",
      { "aria-label": "処理と問題" },
      h("div.toggle-row", {}, q.memo.button, toggle.el),
      stage.intro && !state.stageRec(stage.id).cleared ? h("p.intro", {}, stage.intro) : null,
      h("h3.sec-title", {}, "処理"),
      h(
        "p.peek-tip",
        {},
        stage.blanks
          ? "▶ 空欄より 前の 行を おすと、そこまで 実演を 進めて 値の うごきを 見られます（コインを つかいます）"
          : "▶ 行を おすと、そこまで 実演を 進めて 値の うごきを 見られます（コインを つかいます）"
      ),
      q.program.el,
      notesBox(stage),
      h("h3.sec-title", {}, "問題"),
      h("p.question", {}, stage.question),
      q.choicesEl,
      q.feedback,
      h("div.answer-bar", {}, q.answerBtn)
    );
    q.root = h("main.quiz-layout", {}, q.leftPanel, right, q.memo.el);
    el.append(header, q.root);

    q.view = new FieldView(q.fieldHost, stage, { maxHeight: fieldMaxHeight, onFrame: (v) => vb.update(v) });
    q.runner = new Runner(q.view, { onLine: (n) => q && q.program.highlight(n) });
    renderChoices();
    renderHints();
    q.onResize = () => q && q.view.resize();
    window.addEventListener("resize", q.onResize);
  },
  unmount() {
    if (!q) return;
    q.runner.abort();
    q.view.destroy();
    if (q.badge._off) q.badge._off();
    window.removeEventListener("resize", q.onResize);
    q = null;
  },
  onKey(e) {
    if (!q) return;
    const k = e.key;
    if (k >= "1" && k <= "4") {
      select(Number(k) - 1);
      const b = q.choicesEl.children[Number(k) - 1];
      if (b && !b.disabled) b.focus();
    } else if (k === "Enter") {
      if (e.target && e.target.tagName === "BUTTON" && !e.target.classList.contains("choice")) return;
      e.preventDefault();
      answer();
    } else if (k === "t" || k === "T") q.toggle.toggle();
    else if (k === "m" || k === "M") q.memo.toggle();
    else if (k === "f" || k === "F") q.speed.toggleFast();
    else if (k === "s" || k === "S") {
      if (q.playing) q.speed.skip();
    } else if (k === "Escape" && !q.playing) show("area", { genre: q.stage.genre, focus: q.stage.id });
  },
};
