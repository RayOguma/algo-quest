// マップ上のアルゴくん：道に沿って歩く（立ち絵／移動絵の切替・左右反転・バウンド）
import * as state from "../state.js";
import { h } from "../ui.js";
import { makeSpriteCanvas } from "../engine/character.js";

export class MapChara {
  constructor(parent, cssHeight) {
    this.stand = makeSpriteCanvas("stand", cssHeight);
    this.move = makeSpriteCanvas("move", cssHeight);
    this.move.hidden = true;
    this.el = h("div.map-chara", { "aria-hidden": "true" }, this.stand, this.move);
    parent.append(this.el);
    this.pos = { x: 0, y: 0 };
    this.raf = 0;
  }

  setPos(p) {
    this.pos = { x: p.x, y: p.y };
    this.el.style.left = p.x + "px";
    this.el.style.top = p.y + "px";
  }

  setWalking(on) {
    this.stand.hidden = on;
    this.move.hidden = !on;
    this.el.classList.toggle("walking", on);
  }

  /** 折れ線 points（最初は現在地でなくてよい）に沿って歩く */
  walk(points, { speed = 240, maxMs = 1600 } = {}) {
    cancelAnimationFrame(this.raf);
    const pts = [this.pos, ...points];
    const lens = [];
    let total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const l = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
      lens.push(l);
      total += l;
    }
    if (total < 1 || state.settings().reduceMotion) {
      if (pts.length > 1) this.setPos(pts[pts.length - 1]);
      return Promise.resolve();
    }
    const dur = Math.min(maxMs, (total / speed) * 1000);
    this.setWalking(true);
    return new Promise((resolve) => {
      const t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - t0) / dur);
        let d = t * total;
        let k = 0;
        while (k < lens.length - 1 && d > lens[k]) d -= lens[k++];
        const a = pts[k];
        const b = pts[k + 1];
        const f = lens[k] ? d / lens[k] : 1;
        if (Math.abs(b.x - a.x) > 0.5) this.el.classList.toggle("flip", b.x < a.x);
        this.setPos({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f });
        if (t < 1) this.raf = requestAnimationFrame(step);
        else {
          this.setWalking(false);
          resolve();
        }
      };
      this.raf = requestAnimationFrame(step);
    });
  }

  /** その場で小さくジャンプ（目的地に入る合図） */
  hop() {
    if (state.settings().reduceMotion) return Promise.resolve();
    this.el.classList.remove("hop");
    void this.el.offsetWidth;
    this.el.classList.add("hop");
    return new Promise((r) => setTimeout(r, 380));
  }

  destroy() {
    cancelAnimationFrame(this.raf);
  }
}
