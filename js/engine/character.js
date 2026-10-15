// アルゴくん：提供画像2枚（立ち絵・移動絵）の描画、バウンド、エフェクト合成（§5）
import { drawCrystal } from "./parts.js";
import { drawBubble, drawSweat } from "./effects.js";

const SRC = {
  stand: "assets/img/algokun_stand.png",
  move: "assets/img/algokun_move.png",
};

export const sprites = {
  stand: { img: null, ok: false, bbox: null },
  move: { img: null, ok: false, bbox: null },
};

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ img, ok: true });
    img.onerror = () => {
      console.warn(`[algoquest] 画像を読み込めませんでした: ${src}（四角いプレースホルダで代替します）`);
      resolve({ img: null, ok: false });
    };
    img.src = src;
  });
}

/** 透明部分を除いたバウンディングボックス（足元基準で揃えるため） */
function computeBBox(img) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  try {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const cx = c.getContext("2d", { willReadFrequently: true });
    cx.drawImage(img, 0, 0);
    const d = cx.getImageData(0, 0, w, h).data;
    let minX = w;
    let minY = h;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (d[(y * w + x) * 4 + 3] > 16) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    // 四隅が不透明なら背景が焼き込まれている可能性
    const corner = [0, w - 1, (h - 1) * w, h * w - 1].some((i) => d[i * 4 + 3] > 16);
    if (corner) console.warn("[algoquest] キャラ画像の四隅が透明ではありません（tools/remove-bg.py を参照）");
    if (maxX < 0) return { x: 0, y: 0, w, h };
    return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  } catch {
    // file:// などで読み取れない場合は画像全体
    return { x: 0, y: 0, w, h };
  }
}

export const ready = Promise.all(
  Object.entries(SRC).map(async ([k, src]) => {
    const r = await loadImage(src);
    sprites[k].img = r.img;
    sprites[k].ok = r.ok;
    if (r.ok) sprites[k].bbox = computeBBox(r.img);
  })
);

const cache = new Map();

/** 目的サイズに一度だけ高品質縮小したキャンバス（描画時はにじませずに転送する） */
function scaled(pose, dw, dh, flip) {
  const key = `${pose}|${dw}|${dh}|${flip ? 1 : 0}`;
  let c = cache.get(key);
  if (c) return c;
  const sp = sprites[pose];
  c = document.createElement("canvas");
  c.width = dw;
  c.height = dh;
  const cx = c.getContext("2d");
  cx.imageSmoothingEnabled = true;
  cx.imageSmoothingQuality = "high";
  if (flip) {
    cx.translate(dw, 0);
    cx.scale(-1, 1);
  }
  const b = sp.bbox;
  cx.drawImage(sp.img, b.x, b.y, b.w, b.h, 0, 0, dw, dh);
  if (cache.size > 80) cache.clear();
  cache.set(key, c);
  return c;
}

/**
 * スプライトを足元基準で描く。height は立ち絵の高さ（移動絵は同じ倍率で描く）
 */
export function drawSprite(ctx, pose, footX, footY, height, flip = false, alpha = 1, rot = 0) {
  const sp = sprites[pose].ok ? sprites[pose] : sprites.stand.ok ? sprites.stand : null;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.imageSmoothingEnabled = false;
  if (rot) {
    ctx.translate(footX, footY);
    ctx.rotate(rot);
    ctx.translate(-footX, -footY);
  }
  if (!sp) {
    // プレースホルダ
    const w = height * 0.62;
    ctx.fillStyle = "#E3F2FD";
    ctx.strokeStyle = "#1565C0";
    ctx.lineWidth = Math.max(2, height * 0.04);
    ctx.fillRect(footX - w / 2, footY - height, w, height);
    ctx.strokeRect(footX - w / 2, footY - height, w, height);
    ctx.fillStyle = "#1565C0";
    ctx.fillRect(footX - w * 0.3, footY - height * 0.75, w * 0.6, height * 0.25);
    ctx.restore();
    return;
  }
  const ref = sprites.stand.ok ? sprites.stand.bbox.h : sp.bbox.h;
  const scale = height / ref;
  const dw = Math.max(1, Math.round(sp.bbox.w * scale));
  const dh = Math.max(1, Math.round(sp.bbox.h * scale));
  const img = scaled(sp === sprites.move ? "move" : "stand", dw, dh, flip);
  ctx.drawImage(img, Math.round(footX - dw / 2), Math.round(footY - dh));
  ctx.restore();
}

/** タイトル等のDOM用：指定サイズの立ち絵キャンバスを作る */
export function makeSpriteCanvas(pose, cssHeight) {
  const dpr = window.devicePixelRatio || 1;
  const h = Math.round(cssHeight * dpr);
  const c = document.createElement("canvas");
  const draw = () => {
    const sp = sprites[pose].ok ? sprites[pose] : sprites.stand;
    const ratio = sp.ok ? sp.bbox.w / sp.bbox.h : 0.65;
    c.width = Math.round(h * ratio) + 2;
    c.height = h + 2;
    c.style.width = c.width / dpr + "px";
    c.style.height = c.height / dpr + "px";
    const ctx = c.getContext("2d");
    drawSprite(ctx, pose, c.width / 2, c.height - 1, h, false);
  };
  ready.then(draw);
  return c;
}

/**
 * アルゴくんを状態つきで描画。
 * ch: { x, y（タイル座標・セル中心）, moving, flip, bounce(0..1 の位相), alpha, held, emote, emoteT0, bumpX, bumpY, bubble }
 * g:  { T, toPx(x,y), bounds, now, reduce }
 */
export function drawAlgo(ctx, ch, g) {
  const { T, now, reduce } = g;
  const base = g.toPx(ch.x, ch.y);
  const footX = base.x + (ch.bumpX || 0) * T;
  let footY = base.y + T * 0.38 + (ch.bumpY || 0) * T;
  const height = T * 1.12;
  let dy = 0;
  let dx = 0;
  let rot = 0;
  if (ch.moving) {
    // 1マスあたり2回バウンド（振幅 タイル高さの約7%）
    if (!reduce) dy = -Math.abs(Math.sin(ch.bounce * Math.PI * 2)) * T * 0.07;
  } else if (!reduce) {
    const em = ch.emote;
    const et = (now - (ch.emoteT0 || 0)) / 1000;
    if (em === "cheer") {
      // 2回ジャンプ
      const jt = Math.min(et, 1.0);
      if (et < 1.0) dy = -Math.abs(Math.sin(jt * Math.PI * 2)) * T * 0.3;
    } else if (em === "confused") {
      dx = Math.sin(et * 14) * T * 0.035 * Math.max(0, 1 - et / 1.6);
    } else {
      // idle：ふわふわ ±2px、数秒おきに軽く傾く
      const dpr = g.dpr || 1;
      dy = Math.sin(now / 600) * 2 * dpr;
      const cyc = (now / 1000) % 4.5;
      if (cyc < 0.5) rot = Math.sin((cyc / 0.5) * Math.PI) * 0.06;
    }
  }
  // 影
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,.18)";
  ctx.beginPath();
  const shrink = 1 + dy / (T * 0.8);
  ctx.ellipse(footX, base.y + T * 0.38, T * 0.28 * shrink, T * 0.07 * shrink, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  footY += dy;
  const pose = ch.moving ? "move" : "stand";
  drawSprite(ctx, pose, footX + dx, footY, height, !!ch.flip, ch.alpha ?? 1, rot);

  const headY = footY - height;
  // 持っているクリスタル（頭上）
  if (ch.held) {
    const r = T * 0.2 * (ch.held.scale ?? 1);
    drawCrystal(ctx, footX + dx + (ch.held.ox || 0) * T, headY - r * 0.2 + (ch.held.oy || 0) * T, r, ch.held.value, {
      color: ch.held.color,
      alpha: ch.held.alpha ?? 1,
    });
  }
  const em = ch.emote;
  if (em === "think") {
    drawBubble(ctx, footX + T * 0.25, headY + T * 0.1, "…", T, g.bounds, { scale: 0.26, minSize: 14 * (g.dpr || 1) });
  } else if (em === "confused") {
    ctx.save();
    ctx.font = `900 ${Math.round(T * 0.38)}px "Hiragino Sans","Noto Sans JP",sans-serif`;
    ctx.textAlign = "center";
    ctx.lineWidth = Math.max(2, T * 0.05);
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "#E53935";
    const qy = Math.max(g.bounds.y + T * 0.35, headY + T * 0.05) + Math.sin(now / 200) * T * 0.02;
    ctx.strokeText("？", footX - T * 0.32, qy);
    ctx.fillText("？", footX - T * 0.32, qy);
    ctx.restore();
    drawSweat(ctx, footX + T * 0.34, headY + T * 0.42 + ((now / 900) % 1) * T * 0.08, T * 0.09);
  }
  if (ch.bubble) {
    drawBubble(ctx, footX, Math.max(g.bounds.y + T * 0.5, headY - (ch.held ? T * 0.25 : 0)), ch.bubble, T, g.bounds, {
      scale: 0.19,
      minSize: 13 * (g.dpr || 1),
      border: ch.bubbleColor || "#37474F",
    });
  }
  return { footX, footY, headY };
}
