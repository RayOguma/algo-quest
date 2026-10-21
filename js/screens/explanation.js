// 解説画面（§4.6）：左＝フィールド（再実演）、右＝解説
import * as state from "../state.js";
import { show } from "../router.js";
import { h, coinBadge } from "../ui.js";
import { FieldView } from "../engine/field.js";
import { Runner } from "../engine/runner.js";
import { VarBar } from "../engine/varbar.js";
import { getStage, stageFor } from "../data/stages/index.js";
import { genreOf, MAX_LEVEL } from "../data/genres.js";
import { codeView, viewToggle, programPanel, speedBar, coloredState, stageLabel, notesBox, filledLine, choiceContent } from "./common.js";

let x = null;

function fieldMaxHeight() {
  if (window.matchMedia("(max-width: 899px)").matches) return window.innerHeight * 0.4;
  return Math.max(200, window.innerHeight - 250);
}

function showFinal() {
  // 正しい処理の最終状態を表示（演出なしの確定。再実演ボタンで動きを見られる）
  x.view.reset();
  x.view.world.runAll(x.stage.events);
  x.view.sync();
}

async function replay() {
  if (!x || x.playing) return;
  x.playing = true;
  x.root.classList.add("playing");
  x.replayBtn.disabled = true;
  x.replayBtn.parentElement.hidden = true;
  x.speed.show(true);
  if (window.matchMedia("(max-width: 899px)").matches) x.left.scrollIntoView({ block: "start" });
  // 解説では選択に関係なく「正しい処理」を再生
  const r = await x.runner.play(x.stage.events);
  if (!x || r.aborted) return;
  x.speed.show(false);
  x.playing = false;
  x.root.classList.remove("playing");
  x.replayBtn.disabled = false;
  x.replayBtn.parentElement.hidden = false;
}

function renderTexts() {
  const view = codeView();
  const correct = x.stage.choices.find((c) => c.correct);
  x.answerEl.replaceChildren(choiceContent(x.stage, correct, view));
  x.answerEl.classList.toggle("is-code", view === "code");
  x.traceRows.forEach(({ cell, line }) => {
    cell.textContent = filledLine(x.stage, view, line, correct);
    cell.classList.toggle("is-code", view === "code");
  });
}

export default {
  el: "screen-explain",
  mount(el, params) {
    const stage = getStage(params.id);
    if (!stage) {
      show("stages");
      return;
    }
    const genre = genreOf(stage.genre);
    x = { stage, playing: false };
    const badge = coinBadge();
    x.badge = badge;
    const header = h(
      "header.topbar",
      {},
      h("button.btn.small", { type: "button", onclick: () => show("area", { genre: stage.genre, focus: stage.id }) }, "← 戻る"),
      h("h1.topbar-title", {}, `解説 ${stageLabel(stage, genre)}`),
      h("div.topbar-right", {}, badge)
    );

    // 左
    const host = h("div.field-host");
    x.speed = speedBar(() => x && x.runner);
    const vbEl = h("div.varbar");
    const vb = new VarBar(vbEl);
    x.replayBtn = h("button.btn.primary.replay-btn", { type: "button", onclick: () => replay() }, "▶ もう一度実演を見る");
    // 実演が終わったあとの盤面は動かないので、ボタンはフィールドの真ん中に重ねる
    const stageBox = h("div.field-stage", {}, host, h("div.replay-overlay", {}, x.replayBtn));
    x.left = h("section.left-panel", { "aria-label": "フィールド" }, h("div.field-sticky", {}, vbEl, stageBox, x.speed.el));

    // 右
    x.program = programPanel(stage, { onLineClick: (n) => x.program.highlight(n), fill: stage.choices.find((c) => c.correct) });
    const toggle = viewToggle((v) => {
      x.program.setView(v);
      renderTexts();
    });
    x.toggle = toggle;
    x.answerEl = h("span.answer-text");
    x.traceRows = [];
    const tbody = h("tbody");
    stage.explanation.trace.forEach((t) => {
      const cell = h("td.trace-code");
      const tr = h(
        "tr",
        { tabindex: "0", title: "タップすると疑似コードの行が光ります" },
        h("td.trace-ln", {}, `${t.line}行目`),
        cell,
        h("td.trace-state", {}, coloredState(stage, t.state))
      );
      const act = () => {
        tbody.querySelectorAll("tr").forEach((r) => r.classList.remove("on"));
        tr.classList.add("on");
        x.program.highlight(t.line);
        x.codeSection.scrollIntoView({ block: "nearest", behavior: state.settings().reduceMotion ? "auto" : "smooth" });
      };
      tr.addEventListener("click", act);
      tr.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          act();
        }
      });
      tbody.append(tr);
      x.traceRows.push({ cell, line: t.line });
    });
    const next = stageFor(stage.genre, stage.level + 1);
    const nextBtn = next
      ? h("button.btn.primary", { type: "button", onclick: () => state.isUnlocked(next.genre, next.level) ? show("quiz", { id: next.id }) : show("area", { genre: next.genre, focus: next.id }) }, "次のステージへ ▶")
      : h("button.btn", { type: "button", disabled: true, title: "次のステージは準備中" }, stage.level < MAX_LEVEL ? "次のステージは準備中" : "このジャンルは全部クリア！");
    x.codeSection = h("section.ex-sec", {}, h("h3.sec-title", {}, "疑似コード"), h("div.toggle-row", {}, toggle.el), x.program.el, notesBox(stage));
    const right = h(
      "section.right-panel.explain",
      { "aria-label": "解説" },
      h("section.ex-sec.ex-answer", {}, h("h3.sec-title", {}, "⭕ 正解"), h("p", {}, x.answerEl), h("p.why", {}, stage.explanation.why)),
      h(
        "section.ex-sec",
        {},
        h("h3.sec-title", {}, "処理の解説"),
        h(
          "div.table-wrap",
          {},
          h("table.trace", {}, h("thead", {}, h("tr", {}, h("th", {}, "行"), h("th", {}, "実行した行"), h("th", {}, "その時点の変数・位置"))), tbody)
        )
      ),
      x.codeSection,
      h("section.ex-sec", {}, h("h3.sec-title", {}, "この問題のポイント"), h("ul.points", {}, ...stage.explanation.points.map((p) => h("li", {}, p)))),
      h(
        "div.ex-actions",
        {},
        nextBtn,
        h("button.btn", { type: "button", onclick: () => show("quiz", { id: stage.id }) }, "もう一度解く"),
        h("button.btn", { type: "button", onclick: () => show("area", { genre: stage.genre, focus: stage.id }) }, "一覧へ")
      )
    );
    x.root = h("main.quiz-layout", {}, x.left, right);
    el.append(header, x.root);
    x.view = new FieldView(host, stage, { maxHeight: fieldMaxHeight, onFrame: (v) => vb.update(v) });
    x.runner = new Runner(x.view, { onLine: (n) => x && x.program.highlight(n) });
    showFinal();
    renderTexts();
    x.onResize = () => x && x.view.resize();
    window.addEventListener("resize", x.onResize);
  },
  unmount() {
    if (!x) return;
    x.runner.abort();
    x.view.destroy();
    if (x.badge._off) x.badge._off();
    window.removeEventListener("resize", x.onResize);
    x = null;
  },
  onKey(e) {
    if (!x) return;
    const k = e.key;
    if (k === "t" || k === "T") x.toggle.toggle();
    else if (k === "f" || k === "F") x.speed.toggleFast();
    else if ((k === "s" || k === "S") && x.playing) x.speed.skip();
    else if (k === "Escape") show("area", { genre: x.stage.genre, focus: x.stage.id });
  },
};
