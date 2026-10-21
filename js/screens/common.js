// 問題画面・解説画面で共通の部品：表示切替トグル、処理パネル、速度バー、色付き変数表記
import * as state from "../state.js";
import { h, toast } from "../ui.js";
import { colorFor } from "../engine/parts.js";
import { fillText } from "../engine/world.js";

export function codeView() {
  return state.settings().codeView === "code" ? "code" : "ja";
}

/** 「疑似コード | 日本語」トグル（はじめの表示が疑似コードなので左に置く）。切替は settings.codeView に保存し、onChange(view) を呼ぶ */
export function viewToggle(onChange) {
  const mk = (val, label) => {
    const b = h("button.seg", { type: "button", "aria-pressed": String(codeView() === val), dataset: { val } }, label);
    b.addEventListener("click", () => set(val));
    return b;
  };
  const bJa = mk("ja", "日本語");
  const bCode = mk("code", "疑似コード");
  const el = h("div.view-toggle", { role: "group", "aria-label": "表示形式（Tキーで切替）" }, bCode, bJa);
  const refresh = () => {
    bJa.setAttribute("aria-pressed", String(codeView() === "ja"));
    bCode.setAttribute("aria-pressed", String(codeView() === "code"));
  };
  function set(val) {
    if (codeView() === val) return;
    state.setSetting("codeView", val);
    refresh();
    onChange(val);
  }
  return { el, toggle: () => set(codeView() === "ja" ? "code" : "ja"), refresh };
}

/**
 * 処理の1行を、空欄（［a］）を枠にして描く。fill（選択肢）があれば空欄に入れて緑（wrong なら赤）で示す。
 * @returns {Node[]}
 */
export function lineNodes(text, view, fill, wrong = false) {
  const out = [];
  const re = /［([a-z])］/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = fill ? fillText(fill, m[1], view) : null;
    out.push(
      t !== null
        ? h(`span.blank.filled${wrong ? ".wrong" : ""}`, { title: `空欄 ${m[1]}` }, t)
        : h("span.blank", { "aria-label": `空欄 ${m[1]}` }, m[1])
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/**
 * 選択肢の文。空欄が2つ以上の穴埋めは、空欄ごとに行を分けて「a：…」「b：…」と縦に並べる。
 * @returns {Node|string}
 */
export function choiceContent(stage, choice, view) {
  if (!stage.blanks || stage.blanks.length < 2) return choice[view];
  return h(
    "span.blank-lines",
    {},
    ...stage.blanks.map((k) => h("span.blank-line", {}, h("b.blank-key", {}, `${k}：`), fillText(choice, k, view) ?? ""))
  );
}

/** 空欄を埋めた1行の文字列（解説の表など） */
export function filledLine(stage, view, n, fill) {
  const raw = stage.program[view][n - 1].trim();
  return raw.replace(/［([a-z])］/g, (s, k) => (fill ? fillText(fill, k, view) ?? s : s));
}

/** 行番号付きの処理パネル。fill：空欄に入れる選択肢（解説画面・正解のとき） */
export function programPanel(stage, { onLineClick, fill = null } = {}) {
  const ol = h("ol.program", { "aria-label": "処理" });
  const items = stage.program.ja.map((_, i) => {
    const li = h("li.pline", { dataset: { n: String(i + 1) } }, h("span.ln", { "aria-hidden": "true" }, String(i + 1)), h("span.ptext"));
    if (onLineClick) {
      li.tabIndex = 0;
      li.addEventListener("click", () => onLineClick(i + 1));
      li.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        e.stopPropagation(); // 画面のショートカット（Enter＝こたえる）に渡さない
        onLineClick(i + 1);
      });
    }
    ol.append(li);
    return li;
  });
  let current = 0;
  let filled = fill;
  let filledWrong = false;
  let lastView = codeView();
  const setView = (view) => {
    lastView = view;
    ol.classList.toggle("is-code", view === "code");
    items.forEach((li, i) => {
      // 先頭の空白（半角2つ＝1段）を見やすい字下げに変える
      const raw = stage.program[view][i];
      const m = /^[ 　]*/.exec(raw)[0];
      const depth = Math.round(m.replace(/　/g, "  ").length / 2);
      const t = li.querySelector(".ptext");
      t.replaceChildren(...lineNodes(raw.slice(m.length), view, filled, filledWrong));
      t.style.setProperty("--depth", String(depth));
      t.classList.toggle("indented", depth > 0);
    });
  };
  const highlight = (n) => {
    current = n;
    items.forEach((li, i) => {
      const on = i + 1 === n;
      li.classList.toggle("hl", on);
      if (on) li.setAttribute("aria-current", "step");
      else li.removeAttribute("aria-current");
    });
    const li = items[n - 1];
    if (li && ol.scrollHeight > ol.clientHeight + 2) {
      // 内部スクロールのみ（ページ全体はスクロールさせない）
      const top = li.offsetTop - ol.clientHeight / 2 + li.offsetHeight / 2;
      ol.scrollTo({ top, behavior: state.settings().reduceMotion ? "auto" : "smooth" });
    }
  };
  /** 誤答のあと、見直す行を黄色で示す（空配列で消す） */
  const review = (lines = []) => {
    items.forEach((li, i) => li.classList.toggle("review", lines.includes(i + 1)));
    const li = items[(lines[0] || 0) - 1];
    if (li && ol.scrollHeight > ol.clientHeight + 2) {
      ol.scrollTo({ top: li.offsetTop - ol.clientHeight / 2 + li.offsetHeight / 2, behavior: state.settings().reduceMotion ? "auto" : "smooth" });
    }
  };
  setView(codeView());
  /** 空欄に選択肢を入れて表示する（null で空欄に戻す。wrong＝誤答を入れて実行しているとき） */
  const fillBlanks = (choice, wrong = false) => {
    filled = choice;
    filledWrong = wrong;
    setView(lastView);
  };
  return { el: ol, setView, highlight, review, fill: fillBlanks, clear: () => highlight(0), get current() { return current; } };
}

/** 実演中の [速さ 1倍|2倍|4倍] [⏭ スキップ]。速さは押したときだけ変わる（自動では変えない） */
export function speedBar(getRunner) {
  const segs = state.SPEEDS.map((v) => {
    const b = h("button.seg", { type: "button", dataset: { v: String(v) } }, `${v}倍`);
    b.addEventListener("click", () => setSpeed(v));
    return b;
  });
  const group = h("div.view-toggle.speed-seg", { role: "group", "aria-label": "実演の速さ（Fキーで切替）", title: "Fキー" }, h("span.speed-label", { "aria-hidden": "true" }, "⏩"), ...segs);
  const skip = h("button.btn.small.speed-skip", { type: "button", title: "Sキー" }, "⏭ スキップ");
  const el = h("div.speed-bar", { hidden: true }, group, skip);
  const refresh = () => segs.forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.v) === state.speed())));
  function setSpeed(v) {
    state.setSetting("speed", v);
    refresh();
  }
  const cycle = () => {
    const i = state.SPEEDS.indexOf(state.speed());
    const v = state.SPEEDS[(i + 1) % state.SPEEDS.length];
    setSpeed(v);
    toast(`${v}倍速`, 900);
  };
  const doSkip = () => {
    const r = getRunner();
    if (r) r.skip();
  };
  skip.addEventListener("click", doSkip);
  refresh();
  return {
    el,
    show: (on) => {
      el.hidden = !on;
      refresh();
    },
    toggleFast: cycle,
    skip: doSkip,
  };
}

/** "x=3, y=5" のような文字列の変数名を、ボックスと同じ色のチップにする */
export function coloredState(stage, text) {
  const frag = document.createDocumentFragment();
  const re = /([A-Za-z_]\w*)(\s*=\s*)(-?\d+|\[[^\]]*\])/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) frag.append(text.slice(last, m.index));
    const chip = h("span.var-inline", { style: { "--c": colorFor(stage, m[1]) } }, h("b", {}, m[1]), `=${m[3]}`);
    frag.append(chip);
    last = m.index + m[0].length;
  }
  if (last < text.length) frag.append(text.slice(last));
  return frag;
}

export function stageLabel(stage, genre) {
  return `${genre ? genre.num : ""} Lv${stage.level}「${stage.title}」`;
}

/** 問題文で説明される手続・前提（例：配列の要素番号は 1 から始まる） */
export function notesBox(stage) {
  if (!stage.notes || !stage.notes.length) return null;
  return h("div.notes", {}, h("b", {}, "〔説明〕"), ...stage.notes.map((t) => h("p", {}, t)));
}
