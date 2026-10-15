// 共通UI：要素生成、ダイアログ、トースト、○×オーバーレイ
import { playSE } from "./engine/audio.js";
import * as state from "./state.js";

/** 要素を作る小さなヘルパー：h("button.primary", {onclick}, "テキスト", child...) */
export function h(sel, attrs = {}, ...children) {
  const [tag, ...classes] = sel.split(".");
  const el = document.createElement(tag || "div");
  if (classes.length) el.className = classes.join(" ");
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (k === "style" && typeof v === "object") {
      for (const [sk, sv] of Object.entries(v)) {
        if (sk.startsWith("--")) el.style.setProperty(sk, sv);
        else el.style[sk] = sv;
      }
    }
    else if (k === "dataset") Object.assign(el.dataset, v);
    else if (k in el && typeof v !== "string") el[k] = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

/** コイン表示 */
export function coinBadge() {
  const el = h("span.coin-badge", { title: "コイン", "aria-label": "コイン" }, h("span.coin-icon", { "aria-hidden": "true" }), h("span.coin-num"));
  const upd = () => (el.querySelector(".coin-num").textContent = String(state.coins()));
  upd();
  const off = state.onChange(upd);
  el._off = off;
  return el;
}

let modalResolve = null;

/**
 * ダイアログ。actions: [{ label, value, primary, danger }]
 * @returns {Promise<any>} 押したボタンの value（閉じたら null）
 */
export function modal({ title, body, actions = [{ label: "OK", value: true, primary: true }] }) {
  const m = document.getElementById("modal");
  document.getElementById("modal-title").textContent = title || "";
  const b = document.getElementById("modal-body");
  b.innerHTML = "";
  if (body instanceof Node) b.append(body);
  else if (body) b.append(h("p", {}, body));
  const a = document.getElementById("modal-actions");
  a.innerHTML = "";
  if (modalResolve) modalResolve(null);
  return new Promise((resolve) => {
    modalResolve = resolve;
    const close = (v) => {
      m.hidden = true;
      modalResolve = null;
      document.removeEventListener("keydown", onKey, true);
      resolve(v);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close(null);
      }
      e.stopPropagation();
    };
    for (const act of actions) {
      a.append(
        h(`button.btn${act.primary ? ".primary" : ""}${act.danger ? ".danger" : ""}`, { type: "button", onclick: () => close(act.value) }, act.label)
      );
    }
    m.hidden = false;
    m.onclick = (e) => {
      if (e.target === m) close(null);
    };
    document.addEventListener("keydown", onKey, true);
    const primary = a.querySelector(".primary") || a.querySelector("button");
    if (primary) primary.focus();
  });
}

let toastTimer = 0;
export function toast(msg, ms = 1800) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.hidden = false;
  t.classList.remove("show");
  void t.offsetWidth;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove("show");
    t.hidden = true;
  }, ms);
}

/**
 * 画面全体の ○ / × 。効果音と同時に開始し、約0.9秒で消える（タップで即閉じ）
 */
export function showOX(ok) {
  const ov = document.getElementById("ox-overlay");
  const reduce = !!state.settings().reduceMotion;
  ov.className = `ox-overlay ${ok ? "is-ok" : "is-ng"}${reduce ? " reduce" : ""}`;
  ov.innerHTML = ok
    ? `<svg viewBox="0 0 200 200" class="ox-mark" role="img" aria-label="せいかい"><circle cx="100" cy="100" r="70" pathLength="100"/></svg>`
    : `<svg viewBox="0 0 200 200" class="ox-mark" role="img" aria-label="ふせいかい"><path d="M45 45 L155 155" pathLength="100"/><path d="M155 45 L45 155" pathLength="100" class="second"/></svg>`;
  ov.hidden = false;
  playSE(ok ? "correct" : "wrong");
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      ov.classList.add("out");
      setTimeout(() => {
        ov.hidden = true;
        ov.classList.remove("out");
        resolve();
      }, 180);
    };
    ov.onclick = finish;
    setTimeout(finish, 900);
  });
}

export function starsText(n, max = 3) {
  return "★".repeat(n) + "☆".repeat(Math.max(0, max - n));
}

export function prefersReduced() {
  return !!state.settings().reduceMotion;
}
