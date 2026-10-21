// タイトル画面（§4.1）
import * as state from "../state.js";
import { show } from "../router.js";
import { h } from "../ui.js";
import { makeSpriteCanvas } from "../engine/character.js";

let raf = 0;
let ro = null;

/** パステルのグラデーション＋ふわふわ浮かぶ数字・記号の粒 */
function startBackground(canvas) {
  const ctx = canvas.getContext("2d");
  const glyphs = ["0", "1", "2", "3", "5", "7", "x", "y", "i", "←", "＋", "≧", "{ }", "[ ]", "?", "＝"];
  const colors = ["#7E57C2", "#29B6F6", "#66BB6A", "#FFA726", "#EC407A"];
  let W = 0;
  let H = 0;
  let dpr = 1;
  let parts = [];
  const resize = () => {
    dpr = window.devicePixelRatio || 1;
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const n = Math.round(Math.min(40, (W * H) / 26000) + 8);
    parts = Array.from({ length: n }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      s: 14 + Math.random() * 22,
      sp: 8 + Math.random() * 16,
      ph: Math.random() * Math.PI * 2,
      g: glyphs[i % glyphs.length],
      c: colors[i % colors.length],
    }));
  };
  resize();
  ro = new ResizeObserver(resize);
  ro.observe(canvas);
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const reduce = state.settings().reduceMotion;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#fde2f3");
    g.addColorStop(0.5, "#e3f2fd");
    g.addColorStop(1, "#e8f5e9");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const p of parts) {
      if (!reduce) {
        p.y -= p.sp * dt;
        if (p.y < -30) {
          p.y = H + 30;
          p.x = Math.random() * W;
        }
      }
      const x = p.x + (reduce ? 0 : Math.sin(now / 1500 + p.ph) * 12);
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = p.c;
      ctx.font = `800 ${p.s}px "Hiragino Sans","Noto Sans JP",sans-serif`;
      ctx.fillText(p.g, x, p.y);
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
}

export default {
  el: "screen-title",
  mount(el) {
    const bg = h("canvas.title-bg", { "aria-hidden": "true" });
    const chara = makeSpriteCanvas("stand", 200);
    chara.className = "title-chara";
    chara.setAttribute("role", "img");
    chara.setAttribute("aria-label", "アルゴくん");
    const fresh = !state.saveExists() || !state.get().tutorialSeen;
    const startBtn = fresh
      ? h("button.btn.primary.big", { type: "button", "data-autofocus": "true", onclick: () => show("tutorial", { from: "start" }) }, "ゲーム開始")
      : h("button.btn.primary.big", { type: "button", "data-autofocus": "true", onclick: () => show("stages") }, "続きから");
    el.append(
      bg,
      h(
        "div.title-wrap",
        {},
        h("h1.logo", {}, h("span.logo-main", {}, "アルゴクエスト"), h("span.logo-sub", {}, "アルゴくんとアルゴリズムの探検")),
        h("div.title-chara-wrap", {}, chara),
        h(
          "div.title-buttons",
          {},
          startBtn,
          h("button.btn", { type: "button", onclick: () => show("tutorial", { from: "title" }) }, "遊び方"),
          h("button.btn", { type: "button", onclick: () => show("settings", { back: "title" }) }, "設定")
        )
      )
    );
    startBackground(bg);
  },
  unmount() {
    cancelAnimationFrame(raf);
    if (ro) ro.disconnect();
    ro = null;
  },
};
