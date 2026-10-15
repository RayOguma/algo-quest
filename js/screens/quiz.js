// 問題画面（§4.3〜4.5）
import * as state from "../state.js";
import { show } from "../router.js";
import { h, coinBadge, modal, showOX, toast, starsText } from "../ui.js";
import { playSE } from "../engine/audio.js";
import { FieldView } from "../engine/field.js";
import { Runner } from "../engine/runner.js";
import { VarBar } from "../engine/varbar.js";
import { eventsForChoice } from "../engine/world.js";
import { getStage, stageFor } from "../data/stages/index.js";
import { genreOf } from "../data/genres.js";
import { codeView, viewToggle, programPanel, speedBar, stageLabel, notesBox } from "./common.js";

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
  // PC：左半分の高さに収める（ヘッダー・速度バー・変数バーの分を引く）
  return Math.max(200, window.innerHeight - 64 - 110) || 480;
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
      h("span.choice-text", {}, c[view]),
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

async function answer() {
  if (!q || q.playing || !q.selected) return;
  const choice = q.selected;
  const stage = q.stage;
  q.feedback.hidden = true;
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
    if (!next && stage.level < 5) body.append(h("p.muted", {}, "つぎの問題は じゅんびちゅう です"));
    const actions = [{ label: "一覧へ", value: "list" }];
    if (next) actions.push({ label: "次の問題へ ▶", value: "next" });
    actions.push({ label: "かいせつを みる", value: "explain", primary: true });
    const v = await modal({ title: "クリア！", body, actions });
    if (v === "list") show("area", { genre: stage.genre, focus: stage.id });
    else if (v === "next") show("quiz", { id: next.id });
    else show("explain", { id: stage.id });
    return;
  }
  // 誤答
  q.mistakes += 1;
  q.wrong.add(choice);
  q.selected = null;
  q.view.reset();
  q.program.clear();
  setPlaying(false);
  q.feedback.innerHTML = "";
  q.feedback.append(
    h("span.fb-icon", { "aria-hidden": "true" }, "✕"),
    h("div", {}, h("b", {}, "ざんねん！ ここを 見直してみよう"), h("p", {}, choice.wrongFeedback || "もう一度 処理を たどってみよう。"))
  );
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
    q.leftPanel = h("section.left-panel", { "aria-label": "フィールド" }, h("div.field-sticky", {}, q.fieldHost, q.speed.el), q.varbar);

    // 右：処理＋問題＋4択
    q.program = programPanel(stage);
    const toggle = viewToggle((v) => {
      q.program.setView(v);
      renderChoices();
    });
    q.toggle = toggle;
    q.choicesEl = h("div.choices", { role: "radiogroup", "aria-label": "こたえの せんたくし（1〜4キー）" });
    q.answerBtn = h("button.btn.primary.big.answer-btn", { type: "button", onclick: () => answer(), title: "Enterキー" }, "こたえる");
    q.feedback = h("div.feedback", { hidden: true, role: "alert" });
    const right = h(
      "section.right-panel",
      { "aria-label": "処理と問題" },
      h("div.toggle-row", {}, toggle.el),
      stage.intro && !state.stageRec(stage.id).cleared ? h("p.intro", {}, stage.intro) : null,
      h("h3.sec-title", {}, "処理"),
      q.program.el,
      notesBox(stage),
      h("h3.sec-title", {}, "問題"),
      h("p.question", {}, stage.question),
      q.choicesEl,
      q.feedback,
      h("div.answer-bar", {}, q.answerBtn)
    );
    q.root = h("main.quiz-layout", {}, q.leftPanel, right);
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
    else if (k === "f" || k === "F") q.speed.toggleFast();
    else if (k === "s" || k === "S") {
      if (q.playing) q.speed.skip();
    } else if (k === "Escape" && !q.playing) show("area", { genre: q.stage.genre, focus: q.stage.id });
  },
};
