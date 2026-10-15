// ステージ一覧（§4.2）。ワールドマップ表示（既定）とリスト表示を切り替えられる
import * as state from "../state.js";
import { show } from "../router.js";
import { h, coinBadge, toast, starsText } from "../ui.js";
import { GENRES, LEVELS } from "../data/genres.js";
import { stageFor } from "../data/stages/index.js";
import { computeLayout, drawMap } from "../engine/mapArt.js";
import { makeSpriteCanvas } from "../engine/character.js";

let s = null; // 画面ローカル状態

function shake(el) {
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
}

/** ステージ1枠の状態 */
function info(g, lv) {
  const id = `${g.key}-${lv.level}`;
  const stage = stageFor(g.key, lv.level);
  const rec = state.stageRec(id);
  const unlocked = state.isUnlocked(g.key, lv.level);
  const ready = !!stage;
  let status;
  let icon;
  if (!ready) {
    status = "じゅんびちゅう";
    icon = "🚧";
  } else if (!unlocked) {
    status = "ロック中";
    icon = "🔒";
  } else if (rec.cleared) {
    status = "クリア済";
    icon = "✔";
  } else {
    status = "挑戦できる";
    icon = "▶";
  }
  const label = `${g.name} レベル${lv.level} ${lv.name} ${stage ? stage.title : ""} ${status} ${rec.stars ? "星" + rec.stars : ""}`;
  return { id, stage, rec, unlocked, ready, status, icon, label };
}

function genreStars(g) {
  return LEVELS.reduce((n, lv) => n + (state.stageRec(`${g.key}-${lv.level}`).stars || 0), 0);
}

/** 押したとき：遊べないなら揺れるだけ、遊べるなら go() */
function tryOpen(el, inf, go) {
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
  go();
}

// ---------- リスト表示 ----------
function renderList(main, params) {
  for (const g of GENRES) {
    const cards = LEVELS.map((lv) => {
      const inf = info(g, lv);
      const card = h(
        `button.stage-card${!inf.ready ? ".not-ready" : ""}${inf.ready && !inf.unlocked ? ".locked" : ""}${inf.rec.cleared ? ".cleared" : ""}`,
        { type: "button", style: { "--lv": lv.color }, "aria-label": inf.label, "aria-disabled": !inf.ready || !inf.unlocked ? "true" : "false" },
        h("span.lv-badge", {}, `Lv${lv.level}`),
        h("span.lv-name", {}, `${"★".repeat(lv.level)}${"☆".repeat(5 - lv.level)} ${lv.name}`),
        h("span.card-title", {}, inf.stage ? inf.stage.title : "じゅんびちゅう"),
        h("span.card-stars", { "aria-hidden": "true" }, inf.ready ? starsText(inf.rec.stars || 0) : ""),
        h("span.card-status", {}, h("span.icon", { "aria-hidden": "true" }, inf.icon), inf.status)
      );
      card.addEventListener("click", () => tryOpen(card, inf, () => show("quiz", { id: inf.id })));
      if (params.focus === inf.id) setTimeout(() => card.focus(), 0);
      return card;
    });
    main.append(
      h(
        "section.genre",
        { "aria-label": g.name },
        h(
          "h2.genre-head",
          {},
          h("span.genre-num", {}, g.num),
          h("span.genre-name", {}, g.place),
          h("span.genre-stars", { title: "ジャンル内の星合計" }, `★ ${genreStars(g)} / 15`)
        ),
        h("p.genre-desc", {}, `${g.name}：${g.desc}`),
        h("div.card-row", {}, ...cards)
      )
    );
  }
}

// ---------- マップ表示 ----------
/** アルゴくんが最初に立つステージ：指定 → 未クリアで遊べる最初 → 最初 */
function startStage(params) {
  if (params.focus && stageFor(...params.focus.split("-").map((v, i) => (i ? Number(v) : v)))) return params.focus;
  for (const g of GENRES)
    for (const lv of LEVELS) {
      const inf = info(g, lv);
      if (inf.ready && inf.unlocked && !inf.rec.cleared) return inf.id;
    }
  return "var-1";
}

function renderMap(main, params) {
  const wrap = h("div.map-wrap");
  main.append(wrap);
  const build = () => {
    wrap.innerHTML = "";
    cancelAnimationFrame(s.raf);
    const avail = Math.min(wrap.clientWidth || 360, 1100);
    const cols = avail >= 720 ? 3 : 1;
    const layout = computeLayout(GENRES.length, cols);
    const scale = avail / layout.width >= 1 ? Math.floor(avail / layout.width) : avail / layout.width;
    s.layoutKey = `${cols}|${scale}`;
    const W = layout.width * scale;
    const H = layout.height * scale;
    const canvas = h("canvas.map-canvas", { width: layout.width, height: layout.height, "aria-hidden": "true" });
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    const inner = h("div.map-inner", { style: { width: W + "px", height: H + "px", "--s": String(scale) } }, canvas);
    wrap.append(inner);
    const keys = GENRES.map((g) => g.key);
    const reduce = () => !!state.settings().reduceMotion;
    drawMap(canvas, layout, keys, 0);
    // ゆっくり動く（風車・水・たいまつ）。ドット絵らしく 8fps 程度
    let last = 0;
    const tick = (now) => {
      if (!reduce() && now - last > 120) {
        last = now;
        drawMap(canvas, layout, keys, now / 1000);
      }
      s.raf = requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);

    // エリアの看板とステージ地点
    const nodeEls = {};
    layout.areas.forEach((ar, i) => {
      const g = GENRES[i];
      const anyReady = LEVELS.some((lv) => stageFor(g.key, lv.level));
      inner.append(
        h(
          "div.map-banner",
          { style: { left: (ar.ox + 4) * scale + "px", top: (ar.oy + 4) * scale + "px" }, title: `${g.name}：${g.desc}` },
          h("span.mb-num", {}, g.num),
          h("span.mb-name", {}, g.place),
          h("span.mb-stars", {}, `★${genreStars(g)}/15`),
          anyReady ? null : h("span.mb-soon", {}, "じゅんびちゅう")
        )
      );
      ar.nodes.forEach((p, j) => {
        const lv = LEVELS[j];
        const inf = info(g, lv);
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
        node.addEventListener("click", () => tryOpen(node, inf, () => walkTo(inf.id)));
        node.addEventListener("focus", () => showTip(inf, lv, p, scale));
        node.addEventListener("pointerenter", () => showTip(inf, lv, p, scale));
        nodeEls[inf.id] = { el: node, x: p.x * scale, y: p.y * scale };
        inner.append(node);
      });
    });
    s.nodes = nodeEls;
    s.tip = h("div.map-tip", { hidden: true, "aria-hidden": "true" });
    inner.append(s.tip);

    // アルゴくん
    const ch = Math.round(Math.max(30, 22 * scale));
    const stand = makeSpriteCanvas("stand", ch);
    const move = makeSpriteCanvas("move", ch);
    move.hidden = true;
    const chara = h("div.map-chara", { "aria-hidden": "true" }, stand, move);
    s.chara = { el: chara, stand, move };
    inner.append(chara);
    s.at = s.at && nodeEls[s.at] ? s.at : startStage(params);
    placeChara(s.at, false);
    const cur = nodeEls[s.at];
    if (cur) {
      requestAnimationFrame(() => {
        const r = cur.el.getBoundingClientRect();
        window.scrollTo({ top: Math.max(0, window.scrollY + r.top - window.innerHeight / 2) });
        if (params.focus) cur.el.focus({ preventScroll: true });
      });
    }
  };
  s.ro = new ResizeObserver(() => {
    const avail = Math.min(wrap.clientWidth || 360, 1100);
    const cols = avail >= 720 ? 3 : 1;
    const layout = computeLayout(GENRES.length, cols);
    const scale = avail / layout.width >= 1 ? Math.floor(avail / layout.width) : avail / layout.width;
    if (`${cols}|${scale}` !== s.layoutKey) build();
  });
  s.ro.observe(wrap);
  build();
}

function showTip(inf, lv, p, scale) {
  if (!s || !s.tip) return;
  s.tip.hidden = false;
  s.tip.textContent = inf.stage ? `Lv${lv.level} ${lv.name}「${inf.stage.title}」 ${inf.status}` : `Lv${lv.level} じゅんびちゅう`;
  s.tip.style.left = p.x * scale + "px";
  s.tip.style.top = p.y * scale + "px";
}

function placeChara(id, animate) {
  const n = s.nodes[id];
  if (!n) return;
  const el = s.chara.el;
  el.style.transition = animate ? "" : "none";
  el.style.left = n.x + "px";
  el.style.top = n.y + "px";
}

/** アルゴくんが地点まで歩いてから問題へ */
function walkTo(id) {
  if (s.walking) return;
  const from = s.nodes[s.at];
  const to = s.nodes[id];
  const reduce = !!state.settings().reduceMotion;
  if (!from || !to || id === s.at || reduce) {
    show("quiz", { id });
    return;
  }
  s.walking = true;
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const ms = Math.min(900, 250 + dist * 1.2);
  const { el, stand, move } = s.chara;
  el.style.setProperty("--walk", ms + "ms");
  el.classList.toggle("flip", to.x < from.x);
  stand.hidden = true;
  move.hidden = false;
  el.classList.add("walking");
  placeChara(id, true);
  s.at = id;
  setTimeout(() => {
    if (!s) return;
    show("quiz", { id });
  }, ms + 80);
}

function render(params) {
  const main = s.main;
  main.innerHTML = "";
  cancelAnimationFrame(s.raf);
  if (s.ro) s.ro.disconnect();
  s.ro = null;
  const mode = state.settings().stageView === "list" ? "list" : "map";
  main.className = mode === "map" ? "stage-main map-mode" : "stage-main genre-list";
  s.viewBtn.textContent = mode === "map" ? "☰ リスト" : "🗺 マップ";
  s.viewBtn.setAttribute("aria-label", mode === "map" ? "リスト表示に きりかえ" : "マップ表示に きりかえ");
  if (mode === "map") renderMap(main, params);
  else renderList(main, params);
}

export default {
  el: "screen-stages",
  mount(el, params = {}) {
    s = { raf: 0, ro: null, at: null, walking: false };
    s.badge = coinBadge();
    s.viewBtn = h("button.btn.small", {
      type: "button",
      onclick: () => {
        state.setSetting("stageView", state.settings().stageView === "list" ? "map" : "list");
        render({});
      },
    });
    el.append(
      h(
        "header.topbar",
        {},
        h("button.btn.small", { type: "button", onclick: () => show("title"), "aria-label": "タイトルへ もどる" }, "← もどる"),
        h("h1.topbar-title", {}, "ワールドマップ"),
        h("div.topbar-right", {}, s.badge, s.viewBtn, h("button.btn.small", { type: "button", onclick: () => show("settings", { back: "stages" }), "aria-label": "せってい" }, "⚙"))
      )
    );
    s.main = h("main.stage-main");
    el.append(s.main);
    render(params);
  },
  unmount() {
    if (!s) return;
    cancelAnimationFrame(s.raf);
    if (s.ro) s.ro.disconnect();
    if (s.badge && s.badge._off) s.badge._off();
    s = null;
  },
  onKey(e) {
    if (e.key === "Escape") show("title");
  },
};
