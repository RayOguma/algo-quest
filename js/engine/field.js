// フィールドの描画（タイル・部品・キャラ・エフェクトの合成）、座標、衝突は World に委譲
import { World } from "./world.js";
import { drawAlgo } from "./character.js";
import { Particles, drawBubble } from "./effects.js";
import {
  drawBox,
  drawCrystal,
  drawPad,
  padSlot,
  drawCell,
  drawCheckMark,
  drawSpawnSpot,
  drawFlag,
  colorFor,
  ARRAY_COLOR,
  shade,
} from "./parts.js";
import * as state from "../state.js";

export const CONST_COLOR = "#B388FF";
export const RESULT_COLOR = "#FFCA28";
const TOP_PAD = 0.75; // 上の余白（アンテナ・吹き出し用、タイル単位）

function hash(x, y) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

export class FieldView {
  /**
   * @param {HTMLElement} host  キャンバスを入れる要素
   * @param {object} stage
   * @param {object} opts { maxHeight: () => number(css px) }
   */
  constructor(host, stage, opts = {}) {
    this.host = host;
    this.opts = opts;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "field-canvas";
    this.canvas.setAttribute("role", "img");
    this.canvas.setAttribute("aria-label", "フィールド（アルゴくんが動く場所）");
    host.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.particles = new Particles();
    this.colors = {};
    this.running = true;
    this.last = performance.now();
    this.setStage(stage);
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  setStage(stage) {
    this.stage = stage;
    this.world = new World(stage);
    this.colors = {};
    this.reset();
    this.resize();
  }

  get reduce() {
    return !!state.settings().reduceMotion;
  }

  /** 盤面を初期状態に戻す */
  reset() {
    this.world.reset();
    this.particles.clear();
    this.vis = {
      char: { x: 0, y: 0, moving: false, flip: false, bounce: 0, alpha: 1, held: null, emote: null, emoteT0: 0, bubble: null },
      boxes: {},
      cells: {},
      pads: {},
      floor: {},
      flying: [],
      check: null,
      flag: null,
      padLabels: {},
    };
    const d = this.world.dir;
    this.vis.char.flip = d === "left";
    this.sync();
  }

  colorOf(id) {
    return this.colors[id] || CONST_COLOR;
  }

  /** 論理状態（World）を見た目に反映 */
  sync() {
    const w = this.world;
    const v = this.vis;
    v.char.x = w.pos.x;
    v.char.y = w.pos.y;
    v.char.moving = false;
    v.char.bumpX = 0;
    v.char.bumpY = 0;
    v.char.alpha = 1;
    if (w.dir === "left") v.char.flip = true;
    else if (w.dir === "right") v.char.flip = false;
    v.char.held = w.held ? { value: w.items[w.held].value, color: this.colorOf(w.held) } : null;
    for (const b of this.stage.field.boxes || []) {
      const prev = v.boxes[b.var] || {};
      v.boxes[b.var] = { ...prev, value: w.vars[b.var] };
    }
    for (const [name, arr] of Object.entries(w.arrays)) {
      const prev = v.cells[name] || { glowT0: [] };
      v.cells[name] = { values: [...arr], glowT0: prev.glowT0 || [] };
    }
    for (const [kind, p] of Object.entries(w.pads)) {
      v.pads[kind] = { items: p.items.map((id) => ({ id, value: w.items[id].value, color: this.colorOf(id) })), lamp: p.lamp };
    }
    v.floor = {};
    for (const it of Object.values(w.items)) {
      if (it.loc.type === "floor") v.floor[it.id] = { value: it.value, x: it.loc.x, y: it.loc.y, color: this.colorOf(it.id) };
    }
    v.flying = [];
  }

  resize() {
    const f = this.stage.field;
    const dpr = window.devicePixelRatio || 1;
    const W = Math.max(120, this.host.clientWidth);
    const maxH = this.opts.maxHeight ? this.opts.maxHeight() : Infinity;
    const T = Math.max(16, Math.min(W / f.cols, maxH / (f.rows + TOP_PAD)));
    const cw = Math.floor(T * f.cols);
    const ch = Math.floor(T * (f.rows + TOP_PAD));
    this.canvas.style.width = cw + "px";
    this.canvas.style.height = ch + "px";
    this.canvas.width = Math.round(cw * dpr);
    this.canvas.height = Math.round(ch * dpr);
    this.dpr = dpr;
    this.T = this.canvas.width / f.cols;
    this.oy = TOP_PAD * this.T;
  }

  toPx(tx, ty) {
    return { x: (tx + 0.5) * this.T, y: this.oy + (ty + 0.5) * this.T };
  }

  destroy() {
    this.running = false;
    this.ro.disconnect();
    this.canvas.remove();
  }

  loop(now) {
    if (!this.running) return;
    const dt = Math.min(100, now - this.last);
    this.last = now;
    this.particles.update(dt);
    try {
      this.draw(now);
      if (this.opts.onFrame) this.opts.onFrame(this);
    } catch (e) {
      console.error(e);
      this.running = false;
      return;
    }
    requestAnimationFrame(this.loop);
  }

  // ---- 描画 ----
  draw(now) {
    const ctx = this.ctx;
    const f = this.stage.field;
    const T = this.T;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const v = this.vis;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    // 背景（草地）
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#d9f2c4");
    bg.addColorStop(1, "#bfe6a6");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    for (let y = 0; y < f.rows; y++) {
      for (let x = 0; x < f.cols; x++) this.drawTile(ctx, x, y, f.tiles[y][x] || " ");
    }
    // スタート地点
    const sp = this.toPx(f.start.x, f.start.y);
    ctx.save();
    ctx.strokeStyle = "rgba(255,112,67,.7)";
    ctx.lineWidth = Math.max(1, T * 0.04);
    ctx.setLineDash([T * 0.08, T * 0.06]);
    ctx.strokeRect(sp.x - T * 0.4, sp.y - T * 0.4, T * 0.8, T * 0.8);
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(230,81,0,.75)";
    ctx.font = `800 ${Math.round(T * 0.15)}px "Hiragino Sans","Noto Sans JP",sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("スタート", sp.x - T * 0.37, sp.y + T * 0.2);
    ctx.restore();

    if (f.spawn) {
      const p = this.toPx(f.spawn.x, f.spawn.y);
      drawSpawnSpot(ctx, p.x, p.y, T);
    }
    // 訪問済み
    this.world.visits.forEach((c, i) => {
      const p = this.toPx(c.x, c.y);
      ctx.fillStyle = "rgba(255,213,79,.55)";
      ctx.fillRect(p.x - T * 0.46, p.y - T * 0.46, T * 0.92, T * 0.92);
      ctx.fillStyle = "#6D4C41";
      ctx.font = `800 ${Math.round(T * 0.2)}px sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(String(i + 1), p.x - T * 0.42, p.y - T * 0.44);
    });
    // 台
    for (const p of f.pads || []) {
      const c = this.toPx(p.x, p.y);
      const pv = v.pads[p.kind] || { items: [], lamp: null };
      drawPad(ctx, c.x, c.y, T, p.kind, pv.lamp);
      pv.items.forEach((it, i) => {
        if (it.hidden) return;
        const s = padSlot(c.x, c.y, T, i, pv.items.length);
        drawCrystal(ctx, s.x + (it.dx || 0) * T, s.y + (it.dy || 0) * T, T * 0.17 * (it.scale ?? 1), it.value, {
          color: it.color,
          alpha: it.alpha ?? 1,
          glow: it.glow,
        });
      });
    }
    // ボックス
    for (const b of f.boxes || []) {
      const c = this.toPx(b.x, b.y);
      const bv = v.boxes[b.var] || {};
      const glow = bv.glowT0 ? Math.max(0, 1 - (now - bv.glowT0) / 700) : 0;
      drawBox(ctx, c.x, c.y, T, {
        name: b.var,
        value: bv.value,
        color: colorFor(this.stage, b.var),
        glow,
        lock: bv.lock || null,
        lockBlink: bv.lockT0 ? (now - bv.lockT0) / 1000 : 0,
      });
    }
    // 配列
    for (const a of f.arrays || []) {
      const cv = v.cells[a.name];
      if (!cv) continue;
      cv.values.forEach((val, i) => {
        const c = this.toPx(a.x + i, a.y);
        const g0 = cv.glowT0[i];
        drawCell(ctx, c.x, c.y, T, val, i + 1, { color: colorFor(this.stage, a.name) || ARRAY_COLOR, glow: g0 ? Math.max(0, 1 - (now - g0) / 700) : 0 });
      });
      const c0 = this.toPx(a.x, a.y);
      ctx.fillStyle = shade(ARRAY_COLOR, -0.5);
      ctx.font = `800 ${Math.round(T * 0.22)}px "Hiragino Sans","Noto Sans JP",sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(a.name, c0.x - T * 0.45, c0.y);
    }
    // 床のクリスタル
    for (const it of Object.values(v.floor)) {
      if (it.hidden) continue;
      const c = this.toPx(it.x, it.y);
      const bob = this.reduce ? 0 : Math.sin(now / 400 + it.x) * T * 0.03;
      drawCrystal(ctx, c.x, c.y + bob, T * 0.2 * (it.scale ?? 1), it.value, { color: it.color, alpha: it.alpha ?? 1 });
    }
    if (v.flag) {
      const c = this.toPx(v.flag.x, v.flag.y);
      drawFlag(ctx, c.x + T * 0.3, c.y, T, v.flag.droop);
    }
    // キャラ
    const bounds = { x: 0, y: 0, w: W, h: H };
    drawAlgo(ctx, v.char, { T, toPx: (x, y) => this.toPx(x, y), bounds, now, reduce: this.reduce, dpr: this.dpr });
    // 飛んでいるクリスタル
    for (const fl of v.flying) {
      const c = this.toPx(fl.x, fl.y);
      drawCrystal(ctx, c.x, c.y, T * 0.2 * (fl.scale ?? 1), fl.value, { color: fl.color, alpha: fl.alpha ?? 1, glow: fl.glow });
    }
    // 台の式ラベル
    for (const [kind, label] of Object.entries(v.padLabels)) {
      if (!label) continue;
      const p = (f.pads || []).find((q) => q.kind === kind);
      if (!p) continue;
      const c = this.toPx(p.x, p.y);
      drawBubble(ctx, c.x, c.y - T * 0.22, label.text, T, bounds, { scale: 0.2, minSize: 13 * this.dpr, border: label.color || "#5D4037", bg: "#FFFDE7" });
    }
    // 検算マーク
    if (v.check) {
      const c = this.toPx(v.check.x, v.check.y);
      drawCheckMark(ctx, c.x + T * 0.42, c.y - T * 0.55, T, v.check.state, (now - v.check.t0) / 1000);
    }
    this.particles.draw(ctx, (x, y) => this.toPx(x, y), T);
  }

  drawTile(ctx, x, y, t) {
    const T = this.T;
    const px = x * T;
    const py = this.oy + y * T;
    if (t === "." || t === "G") {
      ctx.fillStyle = (x + y) % 2 ? "#fff3d6" : "#ffeec4";
      ctx.fillRect(px, py, T, T);
      ctx.strokeStyle = "rgba(190,150,90,.35)";
      ctx.lineWidth = Math.max(1, T * 0.02);
      ctx.strokeRect(px + 0.5, py + 0.5, T - 1, T - 1);
      if (t === "G") drawFlag(ctx, px + T * 0.5, py + T * 0.5, T, 0);
    } else if (t === "#") {
      ctx.fillStyle = "#9e9e9e";
      ctx.fillRect(px, py, T, T);
      ctx.fillStyle = "#bdbdbd";
      const h = T / 3;
      for (let r = 0; r < 3; r++) {
        const off = r % 2 ? T / 4 : 0;
        for (let k = -1; k < 3; k++) {
          const bx = px + off + k * (T / 2) + 1.5;
          const x0 = Math.max(px, bx);
          const x1 = Math.min(px + T, bx + T / 2 - 3);
          if (x1 > x0) ctx.fillRect(x0, py + r * h + 1.5, x1 - x0, h - 3);
        }
      }
    } else {
      // 草地：小さな草と花（決まった乱数）
      const r = hash(x, y);
      ctx.fillStyle = "rgba(76,140,60,.35)";
      const gx = px + T * (0.2 + r * 0.5);
      const gy = py + T * (0.3 + hash(y, x) * 0.4);
      ctx.fillRect(gx, gy, T * 0.04, T * 0.1);
      ctx.fillRect(gx + T * 0.07, gy + T * 0.03, T * 0.04, T * 0.08);
      if (r > 0.7) {
        ctx.fillStyle = r > 0.85 ? "#ffffff" : "#ffd1dc";
        ctx.beginPath();
        ctx.arc(px + T * 0.7, py + T * 0.7, T * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffeb3b";
        ctx.beginPath();
        ctx.arc(px + T * 0.7, py + T * 0.7, T * 0.025, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
