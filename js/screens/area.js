// エリア画面：1つのジャンルのステージ（Lv1〜Lv5）を、エリアの風景とカード一覧で見せる
import * as state from "../state.js";
import { show } from "../router.js";
import { h, coinBadge, toast, starsText } from "../ui.js";
import { GENRES, LEVELS, genreOf } from "../data/genres.js";
import { stageFor } from "../data/stages/index.js";
import { sceneLayout, drawScene } from "../engine/mapArt.js";
import { makeSpriteCanvas } from "../engine/character.js";
import { genreProgress } from "./stageList.js";

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
  return { id, stage, rec, unlocked, ready, status, icon, label };
}

function shake(el) {
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
}

function tryOpen(el, inf) {
  if (!inf.ready) {
    shake(el);
    toast("このステージは じゅんびちゅう です");
    return;
  }
  if (!inf.unlocked) {
    shake(el);
    toast("ひとつ まえの レベルを クリアすると ひらきます");
    return;
  }
  walkTo(inf.id);
}

/** アルゴくんが最初に立つ地点：指定 → 未クリアで遊べる最初 → Lv1 */
function startStage(g, focus) {
  if (focus && focus.startsWith(g.key + "-")) return focus;
  for (const lv of LEVELS) {
    const inf = info(g, lv);
    if (inf.ready && inf.unlocked && !inf.rec.cleared) return inf.id;
  }
  return `${g.key}-1`;
}

function buildScene() {
  const wrap = a.sceneWrap;
  wrap.innerHTML = "";
  cancelAnimationFrame(a.raf);
  const layout = sceneLayout(LEVELS.length);
  const availW = Math.min((wrap.clientWidth || 340) - 32, 900);
  const availH = Math.max(160, window.innerHeight * 0.42);
  const dpr = window.devicePixelRatio || 1;
  const raw = Math.min(availW / layout.width, availH / layout.height);
  const snapped = Math.floor(raw * dpr) / dpr;
  const scale = snapped >= raw * 0.9 ? snapped : raw;
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

  a.nodes = {};
  layout.nodes.forEach((p, j) => {
    const lv = LEVELS[j];
    const inf = info(a.g, lv);
    const cls = `${inf.rec.cleared ? ".cleared" : ""}${!inf.ready ? ".not-ready" : !inf.unlocked ? ".locked" : ".open"}`;
    const node = h(
      `button.map-node${cls}`,
      {
        type: "button",
        style: { left: p.x * scale + "px", top: p.y * scale + "px", "--lv": lv.color },
        "aria-label": inf.label,
        "aria-disabled": !inf.ready || !inf.unlocked ? "true" : "false",
        title: inf.stage ? `Lv${lv.level} ${inf.stage.title}` : `Lv${lv.level} じゅんびちゅう`,
      },
      h("span.mn-lv", {}, inf.ready && !inf.unlocked ? "🔒" : String(lv.level)),
      inf.ready ? h("span.mn-stars", { "aria-hidden": "true" }, starsText(inf.rec.stars || 0)) : null
    );
    node.addEventListener("click", () => tryOpen(node, inf));
    inner.append(node);
    a.nodes[inf.id] = { x: p.x * scale, y: p.y * scale };
  });
  const ch = Math.round(Math.max(30, 24 * scale));
  const stand = makeSpriteCanvas("stand", ch);
  const move = makeSpriteCanvas("move", ch);
  move.hidden = true;
  const chara = h("div.map-chara", { "aria-hidden": "true" }, stand, move);
  a.chara = { el: chara, stand, move };
  inner.append(chara);
  place(a.at, false);
}

function place(id, animate) {
  const n = a.nodes[id];
  if (!n) return;
  const el = a.chara.el;
  el.style.transition = animate ? "" : "none";
  el.style.left = n.x + "px";
  el.style.top = n.y + "px";
}

function walkTo(id) {
  if (a.walking) return;
  const from = a.nodes[a.at];
  const to = a.nodes[id];
  if (!from || !to || id === a.at || state.settings().reduceMotion) {
    show("quiz", { id });
    return;
  }
  a.walking = true;
  const ms = Math.min(900, 250 + Math.hypot(to.x - from.x, to.y - from.y) * 1.1);
  const { el, stand, move } = a.chara;
  el.style.setProperty("--walk", ms + "ms");
  el.classList.toggle("flip", to.x < from.x);
  stand.hidden = true;
  move.hidden = false;
  el.classList.add("walking");
  a.at = id;
  place(id, true);
  setTimeout(() => a && show("quiz", { id }), ms + 80);
}

function buildCards(list) {
  for (const lv of LEVELS) {
    const inf = info(a.g, lv);
    const card = h(
      `button.stage-card${!inf.ready ? ".not-ready" : ""}${inf.ready && !inf.unlocked ? ".locked" : ""}${inf.rec.cleared ? ".cleared" : ""}`,
      { type: "button", style: { "--lv": lv.color }, "aria-label": inf.label, "aria-disabled": !inf.ready || !inf.unlocked ? "true" : "false" },
      h("span.lv-badge", {}, `Lv${lv.level}`),
      h("span.lv-name", {}, `${"★".repeat(lv.level)}${"☆".repeat(5 - lv.level)} ${lv.name}`),
      h("span.card-title", {}, inf.stage ? inf.stage.title : "じゅんびちゅう"),
      h("span.card-stars", { "aria-hidden": "true" }, inf.ready ? starsText(inf.rec.stars || 0) : ""),
      h("span.card-status", {}, h("span.icon", { "aria-hidden": "true" }, inf.icon), inf.status)
    );
    card.addEventListener("click", () => tryOpen(card, inf));
    list.append(card);
    if (a.focus === inf.id) setTimeout(() => card.focus({ preventScroll: true }), 0);
  }
}

export default {
  el: "screen-area",
  mount(el, params = {}) {
    const g = genreOf(params.genre) || GENRES[0];
    a = { g, raf: 0, walking: false, focus: params.focus };
    a.at = startStage(g, params.focus);
    state.setSetting("lastGenre", g.key);
    a.badge = coinBadge();
    const p = genreProgress(g);
    el.append(
      h(
        "header.topbar",
        {},
        h("button.btn.small", { type: "button", onclick: () => show("stages", { genre: g.key }), "aria-label": "ワールドマップへ もどる" }, "← マップ"),
        h("h1.topbar-title", {}, `${g.num} ${g.place}`),
        h(
          "div.topbar-right",
          {},
          a.badge,
          h("button.btn.small", { type: "button", onclick: () => show("settings", { back: "area", backParams: { genre: g.key } }), "aria-label": "せってい" }, "⚙")
        )
      )
    );
    a.sceneWrap = h("div.scene-wrap");
    const list = h("div.area-cards");
    el.append(
      h(
        "main.area-main",
        {},
        a.sceneWrap,
        h(
          "section.area-info",
          {},
          h("p.area-desc", {}, h("b", {}, g.name), `：${g.desc}`, h("span.area-stars", {}, `★ ${p.stars} / 15`)),
          list
        )
      )
    );
    buildScene();
    buildCards(list);
    a.onResize = () => {
      if (!a) return;
      const layout = sceneLayout(LEVELS.length);
      const availW = Math.min((a.sceneWrap.clientWidth || 340) - 32, 900);
      const availH = Math.max(160, window.innerHeight * 0.42);
      const dpr = window.devicePixelRatio || 1;
      const raw = Math.min(availW / layout.width, availH / layout.height);
      const snapped = Math.floor(raw * dpr) / dpr;
      const scale = snapped >= raw * 0.9 ? snapped : raw;
      if (String(scale) !== a.fitKey) buildScene();
    };
    window.addEventListener("resize", a.onResize);
  },
  unmount() {
    if (!a) return;
    cancelAnimationFrame(a.raf);
    window.removeEventListener("resize", a.onResize);
    if (a.badge && a.badge._off) a.badge._off();
    a = null;
  },
  onKey(e) {
    if (e.key === "Escape" && a) show("stages", { genre: a.g.key });
  },
};
