// 単一HTML内のセクション切替（自前ルーター）
const screens = {};
let current = null;
let currentName = null;

export function register(name, screen) {
  screens[name] = screen;
}

export function currentScreen() {
  return currentName;
}

/**
 * 画面を切り替える。screen は { el: セクションID, mount(el, params), unmount?(), onKey?(e) }
 */
export function show(name, params = {}) {
  const next = screens[name];
  if (!next) throw new Error(`unknown screen: ${name}`);
  if (current && current.unmount) current.unmount();
  for (const s of document.querySelectorAll(".screen")) {
    s.classList.remove("active");
    s.hidden = true;
  }
  const el = document.getElementById(next.el);
  el.innerHTML = "";
  el.hidden = false;
  el.classList.add("active");
  current = next;
  currentName = name;
  window.scrollTo(0, 0);
  next.mount(el, params);
  const focusTarget = el.querySelector("[data-autofocus]") || el.querySelector("h1, h2");
  if (focusTarget) {
    if (!focusTarget.hasAttribute("tabindex") && !/^(BUTTON|INPUT|SELECT|A)$/.test(focusTarget.tagName))
      focusTarget.setAttribute("tabindex", "-1");
    focusTarget.focus({ preventScroll: true });
  }
}

export function dispatchKey(e) {
  if (current && current.onKey) current.onKey(e);
}
