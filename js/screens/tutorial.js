// あいさつ＋遊び方案内（§4.1b）。ページ定義は data/tutorial.js
import * as state from "../state.js";
import { show } from "../router.js";
import { h } from "../ui.js";
import { playSE } from "../engine/audio.js";
import { makeSpriteCanvas } from "../engine/character.js";
import { FieldView } from "../engine/field.js";
import { Runner } from "../engine/runner.js";
import { TUTORIAL_PAGES, TUTORIAL_VAR_DEMO } from "../data/tutorial.js";

let ctx = null; // 画面ローカルの状態

function finish() {
  state.setTutorialSeen();
  const from = ctx.from;
  if (from === "title") show("title");
  else if (from === "settings") show("settings", { back: ctx.back || "title" });
  else show("stages");
}

function cleanupDemo() {
  if (!ctx) return;
  clearInterval(ctx.demoTimer);
  ctx.demoTimer = 0;
  if (ctx.runner) ctx.runner.abort();
  ctx.runner = null;
  if (ctx.view) ctx.view.destroy();
  ctx.view = null;
}

function buildDemo(kind) {
  const box = h("div.tut-demo", { "aria-hidden": kind ? "false" : "true" });
  if (!kind) return box;
  box.dataset.kind = kind;
  if (kind === "choices") {
    box.append(
      h("p.tut-mini-q", {}, "x の あたいは いくつ？"),
      h("div.tut-choices", {}, ...["A. 3", "B. 4", "C. 5", "D. 7"].map((t, i) => h(`span.tut-choice${i === 1 ? ".pick" : ""}`, {}, t)))
    );
  } else if (kind === "layout") {
    const left = h("div.tut-pane.left", {}, h("b", {}, "フィールド"), h("small", {}, "アルゴくんが うごく"));
    const right = h("div.tut-pane.right", {}, h("b", {}, "しょり と こたえ"), h("small", {}, "よんで えらぶ"));
    box.append(h("div.tut-layout", {}, left, right));
    let i = 0;
    const tick = () => {
      left.classList.toggle("spot", i % 2 === 0);
      right.classList.toggle("spot", i % 2 === 1);
      i++;
    };
    tick();
    ctx.demoTimer = setInterval(tick, 1600);
  } else if (kind === "var") {
    const host = h("div.tut-field");
    const code = h("div.tut-code", {}, h("span.ln", {}, "1"), h("code", {}, "x ← 5"), h("span.ja", {}, "（x に 5 を入れる）"));
    box.append(host, code);
    requestAnimationFrame(() => {
      if (!ctx || !host.isConnected) return;
      ctx.view = new FieldView(host, TUTORIAL_VAR_DEMO, { maxHeight: () => 150 });
      ctx.runner = new Runner(ctx.view, { onLine: () => code.classList.add("hl") });
      const loop = async () => {
        while (ctx && ctx.runner && !ctx.runner.aborted) {
          code.classList.remove("hl");
          const r = await ctx.runner.play(TUTORIAL_VAR_DEMO.events);
          if (r.aborted) break;
          await new Promise((res) => setTimeout(res, 1400));
        }
      };
      loop();
    });
  } else if (kind === "toggle") {
    const btnJa = h("span.seg", {}, "日本語");
    const btnCode = h("span.seg.on", {}, "疑似コード");
    const line = h("div.tut-code", {}, h("span.ln", {}, "1"), h("code", {}, "y ← x ＋ 2"));
    box.append(h("div.tut-toggle.spot", {}, btnCode, btnJa), line);
    let ja = false;
    ctx.demoTimer = setInterval(() => {
      ja = !ja;
      btnJa.classList.toggle("on", ja);
      btnCode.classList.toggle("on", !ja);
      line.querySelector("code").textContent = ja ? "x の値に 2 を足して、その答えを y に入れる" : "y ← x ＋ 2";
    }, 1800);
  } else if (kind === "speed") {
    box.append(
      h("div.tut-ox", {}, h("span.ox-o", { "aria-label": "せいかい" }, "○"), h("span.ox-x", { "aria-label": "ふせいかい" }, "×")),
      h("div.tut-code.review", {}, h("span.ln", {}, "？4"), h("code", {}, "x ← y － 1")),
      h("div.tut-speed.spot", {}, h("span.fake-btn", {}, "⏩ 1倍｜2倍｜4倍"), h("span.fake-btn", {}, "⏭ スキップ")),
      h("small", {}, "じつえん ちゅうは フィールドの したに でるよ")
    );
  } else if (kind === "peek") {
    const lines = ["for (i を 1 から 3 まで …)", "  sum ← sum ＋ i", "endfor"].map((t, i) =>
      h(`div.tut-code${i === 1 ? ".hl" : ""}`, {}, h("span.ln", {}, String(i + 3)), h("code", {}, t))
    );
    box.append(...lines, h("div.tut-coins", {}, h("span.fake-btn", {}, "▶ 4行目まで 進める"), h("span", {}, "i = 2 の ところまで"), h("span.coin-icon"), h("b", {}, "8")));
  } else if (kind === "memo") {
    box.append(
      h(
        "div.tut-memo",
        {},
        h("b", {}, "📝 メモ"),
        h("div.memo-row", {}, h("span.var-inline", { style: { "--c": "#4FC3F7" } }, h("b", {}, "x")), h("span.tut-input", {}, "3 → 4")),
        h("div.memo-row", {}, h("span.var-inline", { style: { "--c": "#66BB6A" } }, h("b", {}, "y")), h("span.tut-input", {}, "5")),
        h("span.tut-input.free", {}, "4行目で x が かわる！")
      )
    );
  } else if (kind === "blank") {
    box.append(
      h("div.tut-code", {}, h("span.ln", {}, "4"), h("code", {}, "t ← x")),
      h("div.tut-code.review", {}, h("span.ln", {}, "5"), h("code", {}, "x ← ", h("span.blank", {}, "a"))),
      h("div.tut-code", {}, h("span.ln", {}, "6"), h("code", {}, "y ← t")),
      h("div.tut-choices", {}, ...["A. y", "B. t", "C. x", "D. y － x"].map((t, i) => h(`span.tut-choice${i === 0 ? ".pick" : ""}`, {}, t)))
    );
  } else if (kind === "coins") {
    box.append(
      h("div.tut-coins", {}, h("span.coin-icon"), h("b", {}, "コイン"), h("span", {}, "クリアと ログインボーナスで もらえる")),
      h("div.tut-coins", {}, h("span.fake-btn", {}, "🎁 はじめての日"), h("b", {}, "+100"), h("span", {}, "つぎの日からも まいにち 10〜50")),
      h("div.tut-coins", {}, h("span.fake-btn", {}, "💡 ヒント"), h("span", {}, "1つめは むりょう！"))
    );
  }
  return box;
}

function render() {
  const page = TUTORIAL_PAGES[ctx.page];
  cleanupDemo();
  const el = ctx.el;
  el.innerHTML = "";
  const chara = makeSpriteCanvas("stand", 170);
  chara.className = `tut-chara react-${page.react}`;
  chara.setAttribute("role", "img");
  chara.setAttribute("aria-label", "アルゴくん");
  const text = h("p.tut-text", { "aria-live": "polite" });
  const bubble = h("div.tut-bubble", { role: "button", tabindex: "0", "aria-label": "つぎへ" }, text);
  const dots = h(
    "div.tut-dots",
    { "aria-label": `${ctx.page + 1} / ${TUTORIAL_PAGES.length} ページ` },
    ...TUTORIAL_PAGES.map((_, i) => h(`span${i === ctx.page ? ".on" : ""}`))
  );
  const backBtn = h("button.btn", { type: "button", disabled: ctx.page === 0, onclick: () => go(-1) }, "もどる");
  const nextBtn = h(
    "button.btn.primary",
    { type: "button", onclick: () => advance() },
    ctx.page === TUTORIAL_PAGES.length - 1 ? "はじめる！" : "つぎへ"
  );
  el.append(
    h("button.btn.small.tut-skip", { type: "button", onclick: () => finish() }, "スキップ"),
    h("h2.tut-title", {}, `${ctx.page + 1}. ${page.title}`),
    h("div.tut-stage", {}, h("div.tut-chara-wrap", {}, chara), h("div.tut-right", {}, bubble, buildDemo(page.demo))),
    h("div.tut-nav", {}, backBtn, dots, nextBtn)
  );
  bubble.addEventListener("click", () => advance());
  bubble.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault();
      advance();
    }
  });
  nextBtn.focus({ preventScroll: true });
  // 1文字ずつ表示
  ctx.full = page.text;
  ctx.shown = 0;
  ctx.typing = true;
  clearInterval(ctx.typeTimer);
  const reduce = state.settings().reduceMotion;
  if (reduce) {
    text.textContent = page.text;
    ctx.typing = false;
  } else {
    text.replaceChildren(h("span.tut-rest", { "aria-hidden": "true" }, page.text));
    ctx.typeTimer = setInterval(() => {
      ctx.shown += 1;
      // まだ出ていない文字も見えない状態で置いておき、吹き出しの高さ（＝キャラの位置）を変えない
      text.replaceChildren(page.text.slice(0, ctx.shown), h("span.tut-rest", { "aria-hidden": "true" }, page.text.slice(ctx.shown)));
      if (ctx.shown % 3 === 0 && page.text[ctx.shown - 1] !== " ") playSE("type");
      if (ctx.shown >= page.text.length) {
        clearInterval(ctx.typeTimer);
        ctx.typing = false;
      }
    }, 45);
  }
  ctx.textEl = text;
}

function advance() {
  if (ctx.typing) {
    clearInterval(ctx.typeTimer);
    ctx.typing = false;
    ctx.textEl.textContent = ctx.full;
    return;
  }
  go(1);
}

function go(d) {
  const n = ctx.page + d;
  if (n < 0) return;
  if (n >= TUTORIAL_PAGES.length) {
    finish();
    return;
  }
  ctx.page = n;
  render();
}

export default {
  el: "screen-tutorial",
  mount(el, params) {
    ctx = { el, page: 0, from: params.from || "start", back: params.back, typeTimer: 0, demoTimer: 0 };
    render();
  },
  unmount() {
    if (!ctx) return;
    clearInterval(ctx.typeTimer);
    cleanupDemo();
    ctx = null;
  },
  onKey(e) {
    if (!ctx) return;
    if (e.key === "Enter" || e.key === "ArrowRight") {
      if (e.target && e.target.tagName === "BUTTON" && e.key === "Enter") return; // ボタン側のクリックに任せる
      e.preventDefault();
      advance();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "Escape") finish();
  },
};
