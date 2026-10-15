// パーティクル、吹き出し、キラキラ（コード描画）
import { fitText } from "./parts.js";

const FONT = `"Hiragino Sans","Noto Sans JP",sans-serif`;

/** 時間で消えるパーティクル群。座標はタイル単位 */
export class Particles {
  constructor() {
    this.list = [];
  }

  burst(x, y, { n = 10, colors = ["#FFD54F", "#FF8A65", "#81D4FA", "#A5D6A7"], speed = 2.2, life = 800, shape = "star", gravity = 3 } = {}) {
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.6;
      const sp = speed * (0.5 + Math.random() * 0.7);
      this.list.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 1.2,
        life,
        age: 0,
        color: colors[i % colors.length],
        size: 0.08 + Math.random() * 0.06,
        shape,
        gravity,
        rot: Math.random() * Math.PI,
      });
    }
  }

  sparkle(x, y, n = 5) {
    this.burst(x, y, { n, speed: 1.2, life: 600, shape: "spark", gravity: 0, colors: ["#FFF59D", "#FFFFFF", "#B3E5FC"] });
  }

  update(dtMs) {
    const dt = dtMs / 1000;
    for (const p of this.list) {
      p.age += dtMs;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.rot += dt * 4;
    }
    this.list = this.list.filter((p) => p.age < p.life);
  }

  draw(ctx, toPx, T) {
    for (const p of this.list) {
      const k = 1 - p.age / p.life;
      const { x, y } = toPx(p.x, p.y);
      ctx.save();
      ctx.globalAlpha = Math.min(1, k * 1.5);
      ctx.translate(x, y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      const s = p.size * T * (0.6 + 0.4 * k);
      if (p.shape === "star") drawStar(ctx, 0, 0, s, s * 0.45);
      else drawSpark(ctx, 0, 0, s);
      ctx.restore();
    }
  }

  clear() {
    this.list = [];
  }
}

export function drawStar(ctx, cx, cy, R, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;
    ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fill();
}

export function drawSpark(ctx, cx, cy, s) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - s);
  ctx.quadraticCurveTo(cx, cy, cx + s, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + s);
  ctx.quadraticCurveTo(cx, cy, cx - s, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - s);
  ctx.fill();
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * 吹き出し。(ax, ay) はしっぽの先（デバイスpx）。bounds で画面内に収める
 */
export function drawBubble(ctx, ax, ay, text, T, bounds, opts = {}) {
  const size = Math.max(opts.minSize || 10, Math.round(T * (opts.scale || 0.2)));
  ctx.font = `800 ${size}px ${FONT}`;
  const pad = T * 0.12;
  const maxW = Math.min(bounds.w * 0.9, T * 4.5);
  const fs = fitText(ctx, text, maxW - pad * 2, size);
  const tw = ctx.measureText(text).width;
  const w = tw + pad * 2;
  const h = fs + pad * 1.4;
  let x = ax - w / 2;
  let y = ay - h - T * 0.16;
  x = Math.max(bounds.x + 4, Math.min(bounds.x + bounds.w - w - 4, x));
  y = Math.max(bounds.y + 2, y);
  ctx.save();
  ctx.fillStyle = opts.bg || "#fff";
  ctx.strokeStyle = opts.border || "#37474F";
  ctx.lineWidth = Math.max(1.5, T * 0.03);
  rr(ctx, x, y, w, h, Math.min(h / 2, T * 0.14));
  ctx.fill();
  ctx.stroke();
  // しっぽ
  const tx = Math.max(x + h * 0.4, Math.min(x + w - h * 0.4, ax));
  if (ay > y + h) {
    ctx.beginPath();
    ctx.moveTo(tx - T * 0.07, y + h - 1);
    ctx.lineTo(tx, Math.min(ay, y + h + T * 0.14));
    ctx.lineTo(tx + T * 0.07, y + h - 1);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(tx - T * 0.07, y + h);
    ctx.lineTo(tx, Math.min(ay, y + h + T * 0.14));
    ctx.lineTo(tx + T * 0.07, y + h);
    ctx.stroke();
  }
  ctx.fillStyle = opts.color || "#263238";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
  ctx.restore();
}

/** 汗マーク */
export function drawSweat(ctx, cx, cy, s) {
  ctx.save();
  ctx.fillStyle = "#81D4FA";
  ctx.strokeStyle = "#0277BD";
  ctx.lineWidth = Math.max(1, s * 0.12);
  ctx.beginPath();
  ctx.moveTo(cx, cy - s);
  ctx.quadraticCurveTo(cx + s * 0.7, cy, cx, cy + s * 0.5);
  ctx.quadraticCurveTo(cx - s * 0.7, cy, cx, cy - s);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
