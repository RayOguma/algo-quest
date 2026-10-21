// エリア画面：1つのジャンルの風景に Lv1〜Lv10 の地点を置く（6〜10 は穴埋め）。
// 地点を選ぶとアルゴくんが道を歩いてそこへ行き、下にステージの詳しい情報と「挑戦する」が出る。
import * as state from "../state.js";
import { show } from "../router.js";
import { h, coinBadge, starsText } from "../ui.js";
import { GENRES, LEVELS, MAX_STARS, genreOf, difficulty } from "../data/genres.js";
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

/** 画面いっぱいに収まる向きと倍率を決める */
function fit() {
  const availW = Math.min((a.sceneWrap.clientWidth || 340) - 16, 1600);
  const availH = Math.max(200, window.innerHeight - 58 - 20);
  const portrait = availW < 640 && availH > availW * 1.15;
  const layout = sceneLayout(LEVELS.length, portrait);
  const dpr = window.devicePixelRatio || 1;
  const raw = Math.min(availW / layout.width, availH / layout.height);
  const snapped = Math.floor(raw * dpr) / dpr;
  const scale = snapped >= raw * 0.92 ? snapped : raw;
  return { layout, scale, key: `${portrait}|${scale}` };
}

function buildScene() {
  const wrap = a.sceneWrap;
  wrap.innerHTML = "";
  cancelAnimationFrame(a.raf);
  if (a.chara) a.chara.destroy();
  const { layout, scale, key } = fit();
  a.fitKey = key;
  const W = Math.round(layout.width * scale);
  const H = Math.round(layout.height * scale);
  const canvas = h("canvas.map-canvas", { width: layout.width, height: layout.height, "aria-hidden": "true" });
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  const inner = h("div.map-inner.scene-inner", { style: { width: W + "px", height: H + "px" } }, canvas);
  wrap.append(inner);
  a.inner = inner;
  a.W = W;
  a.H = H;
  // ジャンルの説明は絵の中の左上に看板として出す
  inner.append(h("div.scene-sign", {}, h("b", {}, `${a.g.num} ${a.g.name}`), h("span", {}, a.g.desc)));
  inner.append(a.panel);
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
  if (a.selected !== null) {
    a.nodeEls[a.selected].classList.add("selected");
    positionPanel(a.selected);
  }
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
      h("span.sp-diff", { title: "むずかしさ" }, `${"★".repeat(difficulty(inf.lv.level))}${"☆".repeat(5 - difficulty(inf.lv.level))} ${inf.lv.name}`),
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
  positionPanel(j);
  p.classList.remove("show");
  void p.offsetWidth;
  p.classList.add("show");
  (goBtn.disabled ? p.querySelector(".sp-actions .btn") : goBtn).focus({ preventScroll: true });
}

/** 選んだ地点の上（入らなければ下）に、吹き出しのようにパネルを出す */
function positionPanel(j) {
  const p = a.panel;
  const pt = a.points[j];
  const pw = p.offsetWidth;
  const ph = p.offsetHeight;
  const gap = 34;
  let above = pt.y - gap - ph >= 6;
  if (!above && pt.y + gap + ph > a.H - 6) above = pt.y > a.H / 2;
  const top = above ? Math.max(6, pt.y - gap - ph) : Math.min(a.H - ph - 6, pt.y + gap);
  const left = Math.max(6, Math.min(a.W - pw - 6, pt.x - pw / 2));
  p.style.left = left + "px";
  p.style.top = top + "px";
  p.classList.toggle("below", !above);
  p.style.setProperty("--tail", Math.max(18, Math.min(pw - 18, pt.x - left)) + "px");
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
          h("span.area-stars", { title: "このエリアの星" }, `★${prog.stars}/${MAX_STARS}`),
          a.badge,
          h("button.btn.small", { type: "button", onclick: () => show("settings", { back: "area", backParams: { genre: g.key } }), "aria-label": "せってい" }, "⚙")
        )
      )
    );
    a.sceneWrap = h("div.scene-wrap");
    a.panel = h("section.stage-panel", { hidden: true, "aria-live": "polite", "aria-label": "ステージの じょうほう" });
    el.append(h("main.area-main", {}, a.sceneWrap));
    buildScene();
    a.onResize = () => {
      if (a && fit().key !== a.fitKey) buildScene();
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
