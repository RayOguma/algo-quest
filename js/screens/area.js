// エリア画面：1つのジャンルの風景に Lv1〜Lv5 の地点を置く。
// 地点を選ぶとアルゴくんが道を歩いてそこへ行き、下にステージの詳しい情報と「挑戦する」が出る。
import * as state from "../state.js";
import { show } from "../router.js";
import { h, coinBadge, starsText } from "../ui.js";
import { GENRES, LEVELS, genreOf } from "../data/genres.js";
import { stageFor } from "../data/stages/index.js";
import { sceneLayout, drawScene } from "../engine/mapArt.js";
import { genreProgress } from "./stageList.js";
import { MapChara } from "./mapChara.js";

let a = null;

function info(g, lv) {
  const id = `${g.key}-${lv.level}`;
  const stage = stageFor(g.key, lv.level);
  const rec = state.stageRec(id);
  const unlocked = state.isUnlocked(g.key, lv.level);
  const ready = !!stage;
  let status;
  let icon;
  if (!ready) [status, icon] = ["じゅんびちゅう", "🚧"];
  else if (!unlocked) [status, icon] = ["ロック中", "🔒"];
  else if (rec.cleared) [status, icon] = ["クリア済", "✔"];
  else [status, icon] = ["挑戦できる", "▶"];
  const label = `レベル${lv.level} ${lv.name} ${stage ? stage.title : ""} ${status} ${rec.stars ? "星" + rec.stars : ""}`;
  return { id, lv, stage, rec, unlocked, ready, status, icon, label };
}

/** アルゴくんが最初に立つ地点：指定 → 未クリアで遊べる最初 → Lv1 */
function startIndex(g, focus) {
  if (focus && focus.startsWith(g.key + "-")) return Math.max(0, Number(focus.split("-")[1]) - 1);
  for (const lv of LEVELS) {
    const inf = info(g, lv);
    if (inf.ready && inf.unlocked && !inf.rec.cleared) return lv.level - 1;
  }
  return 0;
}

function fitScale(layout) {
  const availW = Math.min((a.sceneWrap.clientWidth || 340) - 24, 1100);
  // 下に出る詳細パネルの分をあけて、画面に収める
  const availH = Math.max(160, window.innerHeight - 58 - 44 - (window.innerWidth < 720 ? 250 : 236));
  const dpr = window.devicePixelRatio || 1;
  const raw = Math.min(availW / layout.width, availH / layout.height);
  const snapped = Math.floor(raw * dpr) / dpr;
  return snapped >= raw * 0.9 ? snapped : raw;
}

function buildScene() {
  const wrap = a.sceneWrap;
  wrap.innerHTML = "";
  cancelAnimationFrame(a.raf);
  if (a.chara) a.chara.destroy();
  const layout = sceneLayout(LEVELS.length);
  const scale = fitScale(layout);
  a.fitKey = String(scale);
  const W = Math.round(layout.width * scale);
  const H = Math.round(layout.height * scale);
  const canvas = h("canvas.map-canvas", { width: layout.width, height: layout.height, "aria-hidden": "true" });
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  const inner = h("div.map-inner", { style: { width: W + "px", height: H + "px" } }, canvas);
  wrap.append(inner);
  const gi = GENRES.indexOf(a.g);
  drawScene(canvas, a.g.key, layout, gi, 0);
  let last = 0;
  const tick = (now) => {
    if (!state.settings().reduceMotion && now - last > 120) {
      last = now;
      drawScene(canvas, a.g.key, layout, gi, now / 1000);
    }
    a.raf = requestAnimationFrame(tick);
  };
  a.raf = requestAnimationFrame(tick);

  a.points = layout.nodes.map((p) => ({ x: p.x * scale, y: p.y * scale }));
  a.nodeEls = layout.nodes.map((p, j) => {
    const inf = info(a.g, LEVELS[j]);
    const cls = `${inf.rec.cleared ? ".cleared" : ""}${!inf.ready ? ".not-ready" : !inf.unlocked ? ".locked" : ".open"}`;
    const node = h(
      `button.map-node${cls}`,
      {
        type: "button",
        style: { left: a.points[j].x + "px", top: a.points[j].y + "px", "--lv": inf.lv.color },
        "aria-label": inf.label,
        title: inf.stage ? `Lv${inf.lv.level} ${inf.stage.title}` : `Lv${inf.lv.level} じゅんびちゅう`,
      },
      h("span.mn-lv", {}, inf.ready && !inf.unlocked ? "🔒" : String(inf.lv.level)),
      inf.ready ? h("span.mn-stars", { "aria-hidden": "true" }, starsText(inf.rec.stars || 0)) : null
    );
    node.addEventListener("click", () => selectNode(j));
    inner.append(node);
    return node;
  });
  a.chara = new MapChara(inner, Math.round(Math.max(30, 24 * scale)));
  a.chara.setPos(a.points[a.at]);
  if (a.selected !== null) a.nodeEls[a.selected].classList.add("selected");
}

/** 地点を選ぶ：道に沿って歩いてから詳細を出す */
async function selectNode(j) {
  if (!a || a.walking) return;
  if (a.selected === j && !a.panel.hidden) return;
  closePanel(false);
  a.walking = true;
  const step = j > a.at ? 1 : -1;
  const pts = [];
  for (let k = a.at + step; step > 0 ? k <= j : k >= j; k += step) pts.push(a.points[k]);
  if (pts.length) await a.chara.walk(pts, { speed: 230, maxMs: 1500 });
  if (!a) return;
  a.at = j;
  a.walking = false;
  openPanel(j);
}

function openPanel(j) {
  const inf = info(a.g, LEVELS[j]);
  a.selected = j;
  a.nodeEls.forEach((n, k) => n.classList.toggle("selected", k === j));
  const p = a.panel;
  p.innerHTML = "";
  p.style.setProperty("--lv", inf.lv.color);
  let note = null;
  if (!inf.ready) note = "このステージは じゅんびちゅう です。もうすこし まってね。";
  else if (!inf.unlocked) note = `Lv${inf.lv.level - 1} を クリアすると ちょうせん できます。`;
  const goBtn = h(
    "button.btn.primary.big",
    { type: "button", disabled: !inf.ready || !inf.unlocked, onclick: () => show("quiz", { id: inf.id }) },
    inf.rec.cleared ? "もう一度 挑戦する ▶" : "挑戦する ▶"
  );
  const parts = [
    h(
      "div.sp-head",
      {},
      h("span.lv-badge", {}, `Lv${inf.lv.level}`),
      h("span.sp-diff", {}, `むずかしさ ${"★".repeat(inf.lv.level)}${"☆".repeat(5 - inf.lv.level)}　${inf.lv.name}`),
      h("span.sp-status", {}, h("span", { "aria-hidden": "true" }, inf.icon + " "), inf.status)
    ),
    h("h2.sp-title", {}, inf.stage ? inf.stage.title : "じゅんびちゅう"),
    inf.ready
      ? h(
          "p.sp-meta",
          {},
          h("span.sp-stars", { "aria-label": `星 ${inf.rec.stars || 0}` }, starsText(inf.rec.stars || 0)),
          inf.rec.cleared ? "　さいこう記録" : "　まだ クリアしていません"
        )
      : null,
    note ? h("p.sp-note", {}, note) : null,
    h("div.sp-actions", {}, h("button.btn", { type: "button", onclick: () => closePanel(true) }, "もどる"), goBtn),
  ];
  p.append(...parts.filter(Boolean));
  p.hidden = false;
  p.classList.remove("show");
  void p.offsetWidth;
  p.classList.add("show");
  (goBtn.disabled ? p.querySelector(".sp-actions .btn") : goBtn).focus({ preventScroll: true });
}

function closePanel(focusNode) {
  if (!a) return;
  a.panel.hidden = true;
  const j = a.selected;
  a.selected = null;
  a.nodeEls.forEach((n) => n.classList.remove("selected"));
  if (focusNode && j !== null) a.nodeEls[j].focus({ preventScroll: true });
}

export default {
  el: "screen-area",
  mount(el, params = {}) {
    const g = genreOf(params.genre) || GENRES[0];
    a = { g, raf: 0, walking: false, selected: null };
    a.at = startIndex(g, params.focus);
    state.setSetting("lastGenre", g.key);
    a.badge = coinBadge();
    const prog = genreProgress(g);
    el.append(
      h(
        "header.topbar",
        {},
        h("button.btn.small", { type: "button", onclick: () => show("stages", { genre: g.key }), "aria-label": "ワールドマップへ もどる" }, "← マップ"),
        h("h1.topbar-title", {}, `${g.num} ${g.place}`),
        h(
          "div.topbar-right",
          {},
          h("span.area-stars", { title: "このエリアの星" }, `★${prog.stars}/15`),
          a.badge,
          h("button.btn.small", { type: "button", onclick: () => show("settings", { back: "area", backParams: { genre: g.key } }), "aria-label": "せってい" }, "⚙")
        )
      )
    );
    a.sceneWrap = h("div.scene-wrap");
    a.panel = h("section.stage-panel", { hidden: true, "aria-live": "polite", "aria-label": "ステージの じょうほう" });
    el.append(h("main.area-main", {}, h("p.area-desc", {}, h("b", {}, g.name), `：${g.desc}`), a.sceneWrap, a.panel));
    buildScene();
    a.onResize = () => {
      if (a && String(fitScale(sceneLayout(LEVELS.length))) !== a.fitKey) buildScene();
    };
    window.addEventListener("resize", a.onResize);
    a.nodeEls[a.at].focus({ preventScroll: true });
  },
  unmount() {
    if (!a) return;
    cancelAnimationFrame(a.raf);
    if (a.chara) a.chara.destroy();
    window.removeEventListener("resize", a.onResize);
    if (a.badge && a.badge._off) a.badge._off();
    a = null;
  },
  onKey(e) {
    if (!a || e.key !== "Escape") return;
    if (!a.panel.hidden) closePanel(true);
    else show("stages", { genre: a.g.key });
  },
};
