// フィールド上の部品（すべてコード描画）：変数ボックス、値クリスタル、計算台/比較台、配列セル、検算マーク等
// 座標はすべてデバイスピクセル。T はタイル1枚の大きさ。

export const DEFAULT_VAR_COLORS = { x: "#4FC3F7", y: "#66BB6A", z: "#F06292", tmp: "#B0BEC5" };
export const ARRAY_COLOR = "#FFA726";

export function colorFor(stage, name) {
  return (stage && stage.varColors && stage.varColors[name]) || DEFAULT_VAR_COLORS[name] || "#9575CD";
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

export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const f = (c) => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
  r = f(r);
  g = f(g);
  b = f(b);
  return `rgb(${r},${g},${b})`;
}

export function fitText(ctx, text, maxW, size, weight = 800) {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px "Hiragino Sans","Noto Sans JP",sans-serif`;
    if (ctx.measureText(text).width <= maxW) break;
    s -= 1;
  } while (s > 6);
  return s;
}

/**
 * 変数ボックス（宝箱風）。cx, cy はセル中心。
 * opts: { name, value, color, glow(0..1), lock: null|"red"|"open", lockBlink(0..1) }
 */
export function drawBox(ctx, cx, cy, T, opts) {
  const { name, value, color = "#4FC3F7", glow = 0 } = opts;
  const w = T * 0.84;
  const h = T * 0.62;
  const x = cx - w / 2;
  const y = cy - h / 2 + T * 0.1;
  // 影
  ctx.fillStyle = "rgba(0,0,0,.15)";
  ctx.beginPath();
  ctx.ellipse(cx, y + h + T * 0.03, w * 0.5, T * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  if (glow > 0) {
    ctx.save();
    ctx.shadowColor = "rgba(255,240,120,1)";
    ctx.shadowBlur = T * 0.5 * glow;
    ctx.fillStyle = `rgba(255,245,160,${0.6 * glow})`;
    rr(ctx, x - T * 0.06, y - T * 0.2, w + T * 0.12, h + T * 0.26, T * 0.14);
    ctx.fill();
    ctx.restore();
  }
  // 本体
  ctx.fillStyle = shade(color, -0.12);
  rr(ctx, x, y, w, h, T * 0.08);
  ctx.fill();
  ctx.lineWidth = Math.max(1, T * 0.035);
  ctx.strokeStyle = shade(color, -0.55);
  ctx.stroke();
  // ふた
  ctx.fillStyle = shade(color, 0.15);
  rr(ctx, x - T * 0.03, y - T * 0.12, w + T * 0.06, T * 0.2, T * 0.06);
  ctx.fill();
  ctx.stroke();
  // 値の窓
  const ww = w * 0.74;
  const wh = h * 0.6;
  ctx.fillStyle = "#fffdf5";
  rr(ctx, cx - ww / 2, y + h * 0.28, ww, wh, T * 0.05);
  ctx.fill();
  ctx.lineWidth = Math.max(1, T * 0.02);
  ctx.strokeStyle = shade(color, -0.4);
  ctx.stroke();
  const vtxt = value === undefined || value === null ? "?" : String(value);
  fitText(ctx, vtxt, ww * 0.9, Math.round(T * 0.3));
  ctx.fillStyle = value === undefined || value === null ? "#9aa" : "#263238";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(vtxt, cx, y + h * 0.28 + wh / 2 + T * 0.01);
  // ラベル（変数名）
  const lw = Math.max(T * 0.34, T * 0.16 * String(name).length + T * 0.14);
  ctx.fillStyle = shade(color, -0.45);
  rr(ctx, cx - lw / 2, y - T * 0.33, lw, T * 0.24, T * 0.08);
  ctx.fill();
  fitText(ctx, name, lw * 0.9, Math.round(T * 0.19));
  ctx.fillStyle = "#fff";
  ctx.fillText(name, cx, y - T * 0.21);
  // 検算ロック
  if (opts.lock) drawLock(ctx, cx + w * 0.42, y + h * 0.1, T * 0.3, opts.lock, opts.lockBlink || 0);
}

export function drawLock(ctx, cx, cy, s, kind, blink) {
  const red = kind === "red";
  const on = red ? 0.55 + 0.45 * Math.sin(blink * Math.PI * 6) : 1;
  ctx.save();
  ctx.globalAlpha = Math.max(0.3, on);
  ctx.lineWidth = s * 0.16;
  ctx.strokeStyle = red ? "#B71C1C" : "#2E7D32";
  ctx.beginPath();
  if (kind === "open") ctx.arc(cx + s * 0.18, cy - s * 0.15, s * 0.26, Math.PI, Math.PI * 1.9);
  else ctx.arc(cx, cy - s * 0.12, s * 0.26, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = red ? "#E53935" : "#43A047";
  rr(ctx, cx - s * 0.42, cy - s * 0.12, s * 0.84, s * 0.66, s * 0.12);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(cx, cy + s * 0.16, s * 0.1, 0, Math.PI * 2);
  ctx.fill();
  if (red) {
    ctx.shadowColor = "#ff1744";
    ctx.shadowBlur = s * 0.8 * on;
    ctx.strokeStyle = "rgba(255,23,68,.8)";
    ctx.lineWidth = s * 0.06;
    rr(ctx, cx - s * 0.5, cy - s * 0.5, s, s * 1.1, s * 0.2);
    ctx.stroke();
  }
  ctx.restore();
}

/** 値クリスタル（多面体の宝石に数字）。r は半径 */
export function drawCrystal(ctx, cx, cy, r, value, opts = {}) {
  const color = opts.color || "#B388FF";
  const alpha = opts.alpha ?? 1;
  if (alpha <= 0 || r <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  // 光
  if (opts.glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = r * 1.2 * opts.glow;
  }
  const pts = [
    [0, -1],
    [0.86, -0.42],
    [0.86, 0.42],
    [0, 1],
    [-0.86, 0.42],
    [-0.86, -0.42],
  ];
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(cx + px * r, cy + py * r) : ctx.moveTo(cx + px * r, cy + py * r)));
  ctx.closePath();
  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, shade(color, 0.55));
  g.addColorStop(0.5, color);
  g.addColorStop(1, shade(color, -0.3));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = Math.max(1, r * 0.1);
  ctx.strokeStyle = shade(color, -0.55);
  ctx.stroke();
  // 面のハイライト
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx - r * 0.86, cy - r * 0.42);
  ctx.lineTo(cx - r * 0.3, cy - r * 0.2);
  ctx.closePath();
  ctx.fill();
  // 数字
  const txt = String(value);
  fitText(ctx, txt, r * 1.5, Math.round(r * 0.95), 900);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = Math.max(2, r * 0.22);
  ctx.strokeStyle = "rgba(40,20,80,.85)";
  ctx.strokeText(txt, cx, cy + r * 0.06);
  ctx.fillStyle = "#fff";
  ctx.fillText(txt, cx, cy + r * 0.06);
  ctx.restore();
}

/** 計算台/比較台。lamp: null | true | false */
export function drawPad(ctx, cx, cy, T, kind, lamp) {
  const w = T * 0.86;
  const h = T * 0.44;
  const x = cx - w / 2;
  const y = cy - h / 2 + T * 0.14;
  ctx.fillStyle = "rgba(0,0,0,.15)";
  ctx.beginPath();
  ctx.ellipse(cx, y + h + T * 0.02, w * 0.5, T * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  const base = kind === "compare" ? "#90A4AE" : "#A1887F";
  ctx.fillStyle = shade(base, -0.1);
  rr(ctx, x, y, w, h, T * 0.08);
  ctx.fill();
  ctx.lineWidth = Math.max(1, T * 0.03);
  ctx.strokeStyle = shade(base, -0.55);
  ctx.stroke();
  ctx.fillStyle = shade(base, 0.35);
  rr(ctx, x + T * 0.05, y + T * 0.04, w - T * 0.1, h * 0.42, T * 0.05);
  ctx.fill();
  // 記号
  ctx.fillStyle = shade(base, -0.6);
  const label = kind === "compare" ? "くらべる" : "けいさん";
  fitText(ctx, label, w * 0.9, Math.round(T * 0.14));
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, cx, y + h * 0.74);
  if (kind === "compare") {
    // ランプ
    const lx = cx + w * 0.5 - T * 0.02;
    const ly = y - T * 0.08;
    ctx.fillStyle = "#455A64";
    ctx.fillRect(lx - T * 0.03, ly, T * 0.06, T * 0.12);
    ctx.beginPath();
    ctx.arc(lx, ly, T * 0.11, 0, Math.PI * 2);
    ctx.fillStyle = lamp === true ? "#00E676" : lamp === false ? "#FF1744" : "#CFD8DC";
    if (lamp !== null && lamp !== undefined) {
      ctx.save();
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = T * 0.4;
      ctx.fill();
      ctx.restore();
    } else ctx.fill();
    ctx.lineWidth = Math.max(1, T * 0.025);
    ctx.strokeStyle = "#263238";
    ctx.stroke();
    if (lamp === true || lamp === false) {
      // 色だけに頼らない（○/×）
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = Math.max(1.5, T * 0.03);
      ctx.beginPath();
      if (lamp) ctx.arc(lx, ly, T * 0.055, 0, Math.PI * 2);
      else {
        ctx.moveTo(lx - T * 0.05, ly - T * 0.05);
        ctx.lineTo(lx + T * 0.05, ly + T * 0.05);
        ctx.moveTo(lx + T * 0.05, ly - T * 0.05);
        ctx.lineTo(lx - T * 0.05, ly + T * 0.05);
      }
      ctx.stroke();
    }
  }
}

/** 台の上のスロット位置（n個並べたときの i 番目） */
export function padSlot(cx, cy, T, i, n) {
  const span = T * 0.3;
  const off = (i - (n - 1) / 2) * span;
  return { x: cx + off, y: cy - T * 0.02 };
}

/** 配列のセル1つ（添字付き） */
export function drawCell(ctx, cx, cy, T, value, index, opts = {}) {
  const s = T * 0.8;
  const x = cx - s / 2;
  const y = cy - s / 2;
  const color = opts.color || ARRAY_COLOR;
  if (opts.glow) {
    ctx.save();
    ctx.shadowColor = "#FFEE58";
    ctx.shadowBlur = T * 0.4 * opts.glow;
    ctx.fillStyle = "rgba(255,238,88,.6)";
    rr(ctx, x - 3, y - 3, s + 6, s + 6, T * 0.1);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = shade(color, 0.55);
  rr(ctx, x, y, s, s, T * 0.08);
  ctx.fill();
  ctx.lineWidth = Math.max(1, T * 0.04);
  ctx.strokeStyle = shade(color, -0.45);
  ctx.stroke();
  const txt = value === undefined || value === null ? "" : String(value);
  fitText(ctx, txt, s * 0.85, Math.round(T * 0.32));
  ctx.fillStyle = "#3E2723";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(txt, cx, cy + T * 0.02);
  // 添字（1始まり）
  ctx.font = `700 ${Math.round(T * 0.16)}px "Hiragino Sans","Noto Sans JP",sans-serif`;
  ctx.fillStyle = shade(color, -0.5);
  ctx.fillText(String(index), cx, y - T * 0.1);
}

/** 検算マーク（虫眼鏡＋チェック）。state: "green" | "red" | "idle" */
export function drawCheckMark(ctx, cx, cy, T, state, t) {
  const s = T * 0.42;
  const red = state === "red";
  const green = state === "green";
  const blink = red ? 0.5 + 0.5 * Math.sin(t * Math.PI * 8) : 1;
  ctx.save();
  ctx.globalAlpha = red ? 0.45 + 0.55 * blink : 1;
  const col = green ? "#00C853" : red ? "#FF1744" : "#78909C";
  if (green || red) {
    ctx.shadowColor = col;
    ctx.shadowBlur = T * 0.35;
  }
  // 柄
  ctx.strokeStyle = "#5D4037";
  ctx.lineWidth = s * 0.22;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.35, cy + s * 0.35);
  ctx.lineTo(cx + s * 0.8, cy + s * 0.8);
  ctx.stroke();
  // レンズ
  ctx.fillStyle = "rgba(255,255,255,.9)";
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = s * 0.16;
  ctx.strokeStyle = col;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.lineWidth = s * 0.14;
  ctx.beginPath();
  if (red) {
    ctx.moveTo(cx - s * 0.22, cy - s * 0.22);
    ctx.lineTo(cx + s * 0.22, cy + s * 0.22);
    ctx.moveTo(cx + s * 0.22, cy - s * 0.22);
    ctx.lineTo(cx - s * 0.22, cy + s * 0.22);
  } else if (green) {
    ctx.moveTo(cx - s * 0.25, cy);
    ctx.lineTo(cx - s * 0.05, cy + s * 0.2);
    ctx.lineTo(cx + s * 0.28, cy - s * 0.2);
  } else {
    ctx.arc(cx, cy, s * 0.06, 0, Math.PI * 2);
  }
  ctx.stroke();
  ctx.restore();
}

/** アイテム出現場所（台座） */
export function drawSpawnSpot(ctx, cx, cy, T) {
  ctx.save();
  ctx.fillStyle = "rgba(179,136,255,.25)";
  ctx.strokeStyle = "rgba(124,77,255,.55)";
  ctx.lineWidth = Math.max(1, T * 0.03);
  ctx.setLineDash([T * 0.06, T * 0.05]);
  ctx.beginPath();
  ctx.ellipse(cx, cy + T * 0.18, T * 0.32, T * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/** しぼむ旗（noGoal 用） */
export function drawFlag(ctx, cx, cy, T, droop) {
  ctx.save();
  ctx.strokeStyle = "#6D4C41";
  ctx.lineWidth = Math.max(2, T * 0.05);
  ctx.beginPath();
  ctx.moveTo(cx, cy + T * 0.35);
  ctx.lineTo(cx, cy - T * 0.4);
  ctx.stroke();
  ctx.fillStyle = droop > 0 ? "#90A4AE" : "#FF7043";
  ctx.beginPath();
  ctx.moveTo(cx, cy - T * 0.4);
  ctx.lineTo(cx + T * 0.4 * (1 - droop * 0.7), cy - T * 0.4 + T * 0.13 + droop * T * 0.25);
  ctx.lineTo(cx, cy - T * 0.14 + droop * T * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
