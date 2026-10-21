// ワールドマップ（ジャンルを選ぶ）。ジャンルを選ぶとエリア画面（area.js）でステージ一覧を見られる
import * as state from "../state.js";
import { show } from "../router.js";
import { h, coinBadge } from "../ui.js";
import { GENRES, LEVELS, MAX_LEVEL, MAX_STARS } from "../data/genres.js";
import { stageFor } from "../data/stages/index.js";
import { worldLayout, drawWorld } from "../engine/mapArt.js";
import { MapChara } from "./mapChara.js";

let s = null;

/** ジャンルの進み具合 */
export function genreProgress(g) {
  let stars = 0;
  let cleared = 0;
  let ready = 0;
  for (const lv of LEVELS) {
    const rec = state.stageRec(`${g.key}-${lv.level}`);
    stars += rec.stars || 0;
    if (rec.cleared) cleared++;
    if (stageFor(g.key, lv.level)) ready++;
  }
  return { stars, cleared, ready };
}

/** アルゴくんが最初に立つエリア：前回のエリア → まだ遊べるステージがある最初のエリア */
function startGenre(params) {
  const last = params.genre || state.settings().lastGenre;
  if (last && GENRES.some((g) => g.key === last)) return last;
  for (const g of GENRES) {
    const p = genreProgress(g);
    if (p.ready > p.cleared) return g.key;
  }
  return GENRES[0].key;
}

function fit(wrap) {
  const availW = Math.min((wrap.clientWidth || 360) - 8, 1400);
  const topbar = 56;
  const availH = Math.max(300, window.innerHeight - topbar - 36);
  const portrait = availW < 720 && availH > availW;
  const layout = worldLayout(GENRES.length, portrait);
  const dpr = window.devicePixelRatio || 1;
  const raw = Math.min(availW / layout.width, availH / layout.height);
  // デバイスの整数ピクセルにそろえて、ドットの大きさが不ぞろいにならないようにする
  // （そろえると小さくなりすぎる場合はそのままの倍率）
  const snapped = Math.floor(raw * dpr) / dpr;
  const scale = snapped >= raw * 0.9 ? snapped : raw;
  return { layout, scale, key: `${portrait}|${scale}` };
}

function build() {
  const wrap = s.wrap;
  wrap.innerHTML = "";
  cancelAnimationFrame(s.raf);
  const { layout, scale, key } = fit(wrap);
  s.fitKey = key;
  const W = Math.round(layout.width * scale);
  const H = Math.round(layout.height * scale);
  const canvas = h("canvas.map-canvas", { width: layout.width, height: layout.height, "aria-hidden": "true" });
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  const inner = h("div.map-inner", { style: { width: W + "px", height: H + "px" } }, canvas);
  wrap.append(inner);
  const keys = GENRES.map((g) => g.key);
  drawWorld(canvas, layout, keys, 0);
  let last = 0;
  const tick = (now) => {
    if (!state.settings().reduceMotion && now - last > 120) {
      last = now;
      drawWorld(canvas, layout, keys, now / 1000);
    }
    s.raf = requestAnimationFrame(tick);
  };
  s.raf = requestAnimationFrame(tick);

  s.plazas = {};
  layout.areas.forEach((ar, i) => {
    const g = GENRES[i];
    const p = genreProgress(g);
    const status = p.ready === 0 ? "じゅんびちゅう" : `クリア ${p.cleared}/${MAX_LEVEL}`;
    const btn = h(
      "button.region",
      {
        type: "button",
        style: { left: ar.ox * scale + "px", top: ar.oy * scale + "px", width: ar.w * scale + "px", height: ar.h * scale + "px" },
        "aria-label": `${g.num} ${g.place}（${g.name}） 星 ${p.stars} / ${MAX_STARS} ${status}`,
        title: `${g.name}：${g.desc}`,
      },
      h(
        "span.region-sign",
        {},
        h("span.rs-name", {}, h("span.rs-num", {}, g.num), g.place),
        h(
          "span.rs-sub",
          {},
          h("span.rs-stars", {}, `★${p.stars}/${MAX_STARS}`),
          p.ready === 0 ? h("span.rs-soon", { title: "じゅんびちゅう" }, h("span.rs-soon-text", {}, "じゅんびちゅう")) : h("span.rs-prog", {}, `${p.cleared}/${MAX_LEVEL}`)
        )
      )
    );
    btn.addEventListener("click", () => walkTo(g.key));
    inner.append(btn);
    s.plazas[g.key] = { x: ar.plaza.x * scale, y: ar.plaza.y * scale, row: ar.row, col: ar.col, el: btn };
  });

  // アルゴくん
  s.cellW = layout.areas[0].w * scale;
  if (s.chara) s.chara.destroy();
  s.chara = new MapChara(inner, Math.round(Math.max(32, 26 * scale)));
  const p0 = s.plazas[s.at];
  if (p0) s.chara.setPos(p0);
}

/** 道（格子）に沿った経路：同じ段なら横へ、違う段なら列の境目の縦道を通る */
function roadPath(fromKey, toKey) {
  const A = s.plazas[fromKey];
  const B = s.plazas[toKey];
  if (A.row === B.row) return [B];
  let boundary;
  if (A.col === 0) boundary = 1;
  else if (A.col === 2) boundary = 2;
  else boundary = B.col === 2 ? 2 : 1;
  const bx = boundary * s.cellW;
  return [{ x: bx, y: A.y }, { x: bx, y: B.y }, B];
}

async function walkTo(key) {
  if (!s || s.walking) return;
  s.walking = true;
  state.setSetting("lastGenre", key);
  if (key !== s.at) await s.chara.walk(roadPath(s.at, key), { speed: 260, maxMs: 1800 });
  if (!s) return;
  s.at = key;
  await s.chara.hop();
  if (s) show("area", { genre: key });
}

export default {
  el: "screen-stages",
  mount(el, params = {}) {
    s = { raf: 0, walking: false, at: startGenre(params) };
    s.badge = coinBadge();
    el.append(
      h(
        "header.topbar",
        {},
        h("button.btn.small", { type: "button", onclick: () => show("title"), "aria-label": "タイトルへ もどる" }, "← もどる"),
        h("h1.topbar-title", {}, "ワールドマップ"),
        h("div.topbar-right", {}, s.badge, h("button.btn.small", { type: "button", onclick: () => show("settings", { back: "stages" }), "aria-label": "せってい" }, "⚙"))
      )
    );
    s.wrap = h("div.map-wrap");
    el.append(h("main.world-main", {}, s.wrap));
    build();
    s.onResize = () => {
      if (s && fit(s.wrap).key !== s.fitKey) build();
    };
    window.addEventListener("resize", s.onResize);
    const cur = s.plazas[s.at];
    if (cur && params.genre) cur.el.focus({ preventScroll: true });
  },
  unmount() {
    if (!s) return;
    cancelAnimationFrame(s.raf);
    if (s.chara) s.chara.destroy();
    window.removeEventListener("resize", s.onResize);
    if (s.badge && s.badge._off) s.badge._off();
    s = null;
  },
  onKey(e) {
    if (e.key === "Escape") show("title");
  },
};
