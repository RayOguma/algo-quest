// 問題画面・解説画面で共通の部品：表示切替トグル、処理パネル、速度バー、色付き変数表記
import * as state from "../state.js";
import { h, toast } from "../ui.js";
import { colorFor } from "../engine/parts.js";

export function codeView() {
  return state.settings().codeView === "code" ? "code" : "ja";
}

/** 「日本語 | 疑似コード」トグル。切替は settings.codeView に保存し、onChange(view) を呼ぶ */
export function viewToggle(onChange) {
  const mk = (val, label) => {
    const b = h("button.seg", { type: "button", "aria-pressed": String(codeView() === val), dataset: { val } }, label);
    b.addEventListener("click", () => set(val));
    return b;
  };
  const bJa = mk("ja", "日本語");
  const bCode = mk("code", "疑似コード");
  const el = h("div.view-toggle", { role: "group", "aria-label": "表示形式（Tキーで切替）" }, bJa, bCode);
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

/** 行番号付きの処理パネル */
export function programPanel(stage, { onLineClick } = {}) {
  const ol = h("ol.program", { "aria-label": "処理" });
  const items = stage.program.ja.map((_, i) => {
    const li = h("li.pline", { dataset: { n: String(i + 1) } }, h("span.ln", { "aria-hidden": "true" }, String(i + 1)), h("span.ptext"));
    if (onLineClick) {
      li.tabIndex = 0;
      li.addEventListener("click", () => onLineClick(i + 1));
    }
    ol.append(li);
    return li;
  });
  let current = 0;
  const setView = (view) => {
    ol.classList.toggle("is-code", view === "code");
    items.forEach((li, i) => (li.querySelector(".ptext").textContent = stage.program[view][i]));
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
  setView(codeView());
  return { el: ol, setView, highlight, clear: () => highlight(0), get current() { return current; } };
}

/** 実演中の [⏩ 2倍速] [⏭ スキップ] */
export function speedBar(getRunner) {
  const fast = h("button.btn.small.speed-fast", { type: "button", "aria-pressed": String(!!state.settings().fast), title: "Fキー" }, "⏩ 2倍速");
  const skip = h("button.btn.small.speed-skip", { type: "button", title: "Sキー" }, "⏭ スキップ");
  const el = h("div.speed-bar", { hidden: true }, fast, skip);
  const toggleFast = () => {
    const v = !state.settings().fast;
    state.setSetting("fast", v);
    fast.setAttribute("aria-pressed", String(v));
    toast(v ? "2倍速 ON" : "2倍速 OFF", 900);
  };
  const doSkip = () => {
    const r = getRunner();
    if (r) r.skip();
  };
  fast.addEventListener("click", toggleFast);
  skip.addEventListener("click", doSkip);
  return {
    el,
    show: (on) => {
      el.hidden = !on;
      fast.setAttribute("aria-pressed", String(!!state.settings().fast));
    },
    toggleFast,
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
