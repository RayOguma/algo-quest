// ワールドマップのドット絵（すべてコード描画）。
// 低解像度キャンバス（1論理px = 1ドット）に描き、CSS の image-rendering: pixelated で整数倍に拡大する。

export const AREA_W = 160;
export const AREA_H = 128;
const ROAD_W = 9;

// ---- 小さな道具 ----
function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let ctx = null;
function R(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function distToSeg(px, py, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / l2));
  return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
}

// ---- レイアウト ----
/**
 * エリアの並びと、道・ステージ地点の座標を計算する。
 * cols=3 のときは左右に蛇行、cols=1 のときは縦一列。
 */
export function computeLayout(count, cols) {
  const rows = Math.ceil(count / cols);
  const cells = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const k = i % cols;
    const col = cols === 1 ? 0 : row % 2 === 0 ? k : cols - 1 - k;
    cells.push({ col, row, ox: col * AREA_W, oy: row * AREA_H });
  }
  const sidePoint = (c, side) => {
    if (side === "left") return { x: c.ox, y: c.oy + AREA_H * 0.56 };
    if (side === "right") return { x: c.ox + AREA_W, y: c.oy + AREA_H * 0.56 };
    if (side === "top") return { x: c.ox + AREA_W * 0.5, y: c.oy };
    return { x: c.ox + AREA_W * 0.5, y: c.oy + AREA_H };
  };
  const sideToward = (a, b) => (b.col > a.col ? "right" : b.col < a.col ? "left" : b.row > a.row ? "bottom" : "top");
  const areas = cells.map((c, i) => {
    const prev = cells[i - 1];
    const next = cells[i + 1];
    const inSide = prev ? sideToward(c, prev) : cols === 1 ? "top" : "left";
    const outSide = next ? sideToward(c, next) : cols === 1 ? "bottom" : row0Out(c, cols);
    const a = sidePoint(c, inSide);
    const b = sidePoint(c, outSide);
    const horiz = (sd) => sd === "left" || sd === "right";
    const ts = [0.14, 0.32, 0.5, 0.68, 0.86];
    const wob = [1, -1, 1, -1, 1];
    let nodes;
    if (!horiz(inSide) && !horiz(outSide)) {
      // 縦一列：エリアごとに左右どちらかへ寄せて蛇行し、反対側を景色に使う
      const side = i % 2 ? 1 : -1;
      const vts = [0.3, 0.45, 0.6, 0.75, 0.9];
      nodes = vts.map((t, j) => ({ x: c.ox + AREA_W * (0.5 + side * 0.2) + wob[j] * AREA_W * 0.09, y: c.oy + AREA_H * t }));
    } else {
      // 横一直線、または角を曲がる（L字）道に沿って置く
      const pts = [a];
      if (horiz(inSide) !== horiz(outSide)) {
        const hp = horiz(inSide) ? a : b;
        const vp = horiz(inSide) ? b : a;
        pts.push({ x: vp.x, y: hp.y });
      }
      pts.push(b);
      const lens = [];
      let total = 0;
      for (let k = 0; k < pts.length - 1; k++) {
        const l = Math.hypot(pts[k + 1].x - pts[k].x, pts[k + 1].y - pts[k].y);
        lens.push(l);
        total += l;
      }
      const amp = pts.length > 2 ? 10 : 16;
      nodes = ts.map((t, j) => {
        let d = t * total;
        let k = 0;
        while (k < lens.length - 1 && d > lens[k]) d -= lens[k++];
        const p0 = pts[k];
        const p1 = pts[k + 1];
        const f = d / (lens[k] || 1);
        const ux = (p1.x - p0.x) / (lens[k] || 1);
        const uy = (p1.y - p0.y) / (lens[k] || 1);
        return { x: p0.x + (p1.x - p0.x) * f - uy * amp * wob[j], y: p0.y + (p1.y - p0.y) * f + ux * amp * wob[j] };
      });
    }
    // 看板（左上）と重ならないようにする
    for (const n of nodes) if (n.x < c.ox + 118 && n.y < c.oy + 30) n.y = c.oy + 34;
    return { ...c, entry: a, exit: b, nodes };
  });
  const path = [];
  areas.forEach((ar) => path.push(ar.entry, ...ar.nodes, ar.exit));
  return { areas, path, width: cols * AREA_W, height: rows * AREA_H };
}

function row0Out(c, cols) {
  // 最後のエリア：蛇行の向きに合わせて抜ける
  return c.row % 2 === 0 ? "right" : "left";
}

// ---- 地形のテーマ ----
const THEMES = {
  var: { ground: "#86d46c", dot1: "#6fbf57", dot2: "#a6e58c" },
  cond: { ground: "#4f9d4c", dot1: "#3f8a3d", dot2: "#66b45f" },
  loop: { ground: "#b2e07c", dot1: "#98cc62", dot2: "#cdeea0" },
  arr: { ground: "#ecd59a", dot1: "#d8bd7c", dot2: "#f6e6b8" },
  search: { ground: "#a49181", dot1: "#8c7a6b", dot2: "#bcab9b" },
  sort: { ground: "#bfe78f", dot1: "#a6d676", dot2: "#d6f1b0" },
  stack: { ground: "#d3dde8", dot1: "#bac7d6", dot2: "#eef3f8" },
  rec: { ground: "#bba9dc", dot1: "#a391c9", dot2: "#d3c6ec" },
  maze: { ground: "#77c46f", dot1: "#62ad5b", dot2: "#93d88b" },
};

// ---- 部品（x, y は足元の中央） ----
function tree(x, y, c1 = "#2f8a3a", c2 = "#5cc25e") {
  R(x - 1, y - 4, 3, 4, "#7a4b28");
  R(x - 5, y - 11, 11, 7, c1);
  R(x - 4, y - 13, 9, 2, c1);
  R(x - 2, y - 14, 5, 1, c1);
  R(x - 3, y - 12, 4, 3, c2);
  R(x - 5, y - 5, 11, 1, "rgba(0,0,0,.18)");
}
function pine(x, y) {
  R(x - 1, y - 3, 2, 3, "#6b4226");
  R(x - 6, y - 7, 12, 4, "#1f6b3a");
  R(x - 4, y - 11, 8, 4, "#25804a");
  R(x - 2, y - 14, 4, 3, "#2e9455");
  R(x - 1, y - 16, 2, 2, "#2e9455");
}
function bush(x, y, c = "#3f9a45") {
  R(x - 4, y - 4, 8, 4, c);
  R(x - 3, y - 5, 6, 1, c);
  R(x - 2, y - 4, 2, 1, "rgba(255,255,255,.25)");
}
function house(x, y, wall = "#f3e2c0", roof = "#d9534f") {
  R(x - 7, y - 8, 14, 8, wall);
  R(x - 7, y - 1, 14, 1, "rgba(0,0,0,.15)");
  R(x - 1, y - 5, 3, 5, "#7a4b28");
  R(x - 5, y - 6, 3, 2, "#7fd0ff");
  R(x + 3, y - 6, 3, 2, "#7fd0ff");
  R(x - 9, y - 10, 18, 2, roof);
  R(x - 7, y - 12, 14, 2, roof);
  R(x - 5, y - 14, 10, 2, roof);
  R(x - 3, y - 15, 6, 1, roof);
  R(x + 3, y - 16, 2, 4, "#8a5a3b");
  R(x - 8, y - 10, 16, 1, "rgba(255,255,255,.25)");
}
function well(x, y) {
  R(x - 4, y - 4, 8, 4, "#9aa3ad");
  R(x - 3, y - 4, 6, 1, "#3d6fb8");
  R(x - 4, y - 9, 1, 5, "#7a4b28");
  R(x + 3, y - 9, 1, 5, "#7a4b28");
  R(x - 5, y - 10, 10, 2, "#b5523b");
}
function fence(x, y, n = 3) {
  for (let i = 0; i < n; i++) R(x + i * 4, y - 5, 1, 5, "#9b6b3d");
  R(x - 1, y - 4, n * 4, 1, "#b88352");
}
function mushroom(x, y) {
  R(x - 1, y - 3, 2, 3, "#f4ead2");
  R(x - 3, y - 5, 6, 2, "#e04848");
  R(x - 2, y - 6, 4, 1, "#e04848");
  R(x - 2, y - 5, 1, 1, "#fff");
  R(x + 1, y - 6, 1, 1, "#fff");
}
function signpost(x, y) {
  R(x, y - 12, 2, 12, "#7a4b28");
  R(x - 6, y - 12, 7, 3, "#c8955c");
  R(x - 7, y - 11, 1, 1, "#c8955c");
  R(x + 2, y - 8, 7, 3, "#c8955c");
  R(x + 9, y - 7, 1, 1, "#c8955c");
}
function windmill(x, y, t) {
  R(x - 5, y - 6, 10, 6, "#e8dccb");
  R(x - 4, y - 12, 8, 6, "#efe5d6");
  R(x - 3, y - 17, 6, 5, "#f6efe4");
  R(x - 1, y - 4, 3, 4, "#7a4b28");
  R(x - 4, y - 19, 8, 2, "#c0504d");
  const hx = x;
  const hy = y - 15;
  for (let b = 0; b < 4; b++) {
    const a = t + (b * Math.PI) / 2;
    for (let k = 2; k < 11; k++) R(hx + Math.cos(a) * k, hy + Math.sin(a) * k, 2, 2, k > 4 ? "#fafafa" : "#8d6e63");
  }
  R(hx - 1, hy - 1, 2, 2, "#5d4037");
}
function flower(x, y, c) {
  R(x, y - 3, 1, 3, "#3c8d40");
  R(x - 1, y - 4, 3, 1, c);
  R(x, y - 5, 1, 3, c);
  R(x, y - 4, 1, 1, "#fff59d");
}
function flowerRing(x, y) {
  const cs = ["#ff6f91", "#ffd54f", "#81d4fa", "#ce93d8"];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    flower(x + Math.cos(a) * 7, y + Math.sin(a) * 4, cs[i % 4]);
  }
}
function crate(x, y) {
  R(x - 4, y - 8, 8, 8, "#b5793f");
  R(x - 4, y - 8, 8, 1, "#d39a5c");
  R(x - 4, y - 5, 8, 1, "#8a5a2b");
  R(x - 1, y - 8, 1, 8, "#8a5a2b");
}
function water(x, y, w, h, t) {
  R(x, y, w, h, "#4fa3e0");
  R(x, y, w, 1, "#8fd0ff");
  for (let i = 0; i < w; i += 9) {
    const off = Math.round(Math.sin(t * 2 + i) * 2);
    R(x + i + off + 2, y + 4 + ((i / 9) % 3) * 4, 4, 1, "#a8dcff");
  }
}
function boat(x, y) {
  R(x - 7, y - 3, 14, 3, "#8d5a33");
  R(x - 6, y, 12, 1, "#6b4226");
  R(x, y - 13, 1, 10, "#6b4226");
  R(x + 1, y - 12, 6, 7, "#fafafa");
}
function rock(x, y, c = "#7d6f63") {
  R(x - 4, y - 4, 8, 4, c);
  R(x - 3, y - 6, 6, 2, c);
  R(x - 2, y - 6, 2, 1, "rgba(255,255,255,.25)");
}
function cave(x, y) {
  R(x - 14, y - 16, 28, 16, "#6e5f54");
  R(x - 12, y - 19, 24, 3, "#6e5f54");
  R(x - 8, y - 21, 16, 2, "#6e5f54");
  R(x - 7, y - 12, 14, 12, "#1f1a17");
  R(x - 5, y - 14, 10, 2, "#1f1a17");
}
function torch(x, y, t) {
  R(x, y - 7, 1, 7, "#6b4226");
  const f = Math.sin(t * 9 + x) > 0 ? 1 : 0;
  R(x - 1, y - 10 - f, 3, 3, "#ff9800");
  R(x, y - 10 - f, 1, 2, "#ffeb3b");
}
function gem(x, y, c, t) {
  R(x - 1, y - 3, 3, 3, c);
  R(x, y - 4, 1, 1, c);
  if (Math.sin(t * 3 + x * 7) > 0.7) R(x + 1, y - 5, 1, 1, "#fff");
}
function sortedBed(x, y) {
  const cs = ["#ff6f91", "#ffa726", "#ffd54f", "#66bb6a", "#42a5f5", "#ab47bc"];
  for (let i = 0; i < 6; i++) {
    const hgt = 3 + i * 2;
    R(x + i * 4, y - hgt, 1, hgt, "#3c8d40");
    R(x + i * 4 - 1, y - hgt - 2, 3, 2, cs[i]);
  }
  R(x - 2, y, 26, 1, "#8a6a3d");
}
function blockTower(x, y) {
  const cs = ["#ef5350", "#ffca28", "#66bb6a", "#42a5f5", "#ab47bc"];
  for (let i = 0; i < 5; i++) {
    R(x - 5, y - (i + 1) * 5, 10, 5, cs[i]);
    R(x - 5, y - (i + 1) * 5, 10, 1, "rgba(255,255,255,.35)");
  }
  R(x - 6, y - 26, 12, 1, "#455a64");
}
function cart(x, y, c) {
  R(x - 3, y - 5, 6, 4, c);
  R(x - 2, y - 1, 1, 1, "#333");
  R(x + 1, y - 1, 1, 1, "#333");
}
function column(x, y) {
  R(x - 2, y - 14, 5, 14, "#e7e1f2");
  R(x - 3, y - 15, 7, 2, "#cfc6e3");
  R(x - 3, y - 1, 7, 1, "#cfc6e3");
  R(x - 1, y - 12, 1, 10, "rgba(0,0,0,.08)");
}
function nested(x, y) {
  const cs = ["#7e57c2", "#9575cd", "#b39ddb", "#d1c4e9", "#ede7f6"];
  for (let i = 0; i < 5; i++) R(x - 12 + i * 2.5, y - 20 + i * 2.5, 24 - i * 5, 20 - i * 5, cs[i]);
}
function hedgeMaze(x, y) {
  const w = 30;
  const h = 22;
  R(x, y, w, h, "#8fd18a");
  const c = "#2f7a35";
  R(x, y, w, 2, c);
  R(x, y + h - 2, w, 2, c);
  R(x, y, 2, h, c);
  R(x + w - 2, y, 2, h - 8, c);
  R(x + 6, y + 2, 2, 12, c);
  R(x + 12, y + 8, 2, 12, c);
  R(x + 18, y + 2, 2, 10, c);
  R(x + 18, y + 12, 8, 2, c);
  R(x + 6, y + 14, 6, 2, c);
}
function castle(x, y, t) {
  R(x - 14, y - 16, 28, 16, "#b0bec5");
  R(x - 17, y - 22, 7, 22, "#cfd8dc");
  R(x + 10, y - 22, 7, 22, "#cfd8dc");
  for (let i = 0; i < 4; i++) {
    R(x - 17 + i * 2, y - 24, 1, 2, "#cfd8dc");
    R(x + 10 + i * 2, y - 24, 1, 2, "#cfd8dc");
  }
  R(x - 4, y - 9, 8, 9, "#5d4037");
  R(x - 3, y - 11, 6, 2, "#5d4037");
  R(x - 13, y - 12, 2, 3, "#37474f");
  R(x + 11, y - 12, 2, 3, "#37474f");
  R(x, y - 30, 1, 14, "#6d4c41");
  const f = Math.sin(t * 4) > 0 ? 1 : 0;
  R(x + 1, y - 30, 6, 3 + f, "#e53935");
}

// ---- エリアの装飾 ----
// ランドマークの横幅（足元中央からの左端・右端）
const SPAN = { var: [-10, 32], cond: [-7, 14], loop: [-12, 34], arr: [-4, 41], search: [-19, 20], sort: [-2, 25], stack: [-6, 34], rec: [-21, 22], maze: [-17, 51] };

const DECOR = {
  var: { landmark: (x, y) => (house(x, y), house(x + 22, y + 6, "#e9d6f5", "#5c7cfa"), well(x + 12, y + 18)), items: [(x, y) => tree(x, y), (x, y) => fence(x, y), (x, y) => flower(x, y, "#ff6f91"), (x, y) => bush(x, y)] },
  cond: { landmark: (x, y) => (signpost(x, y), mushroom(x + 10, y + 2)), items: [(x, y) => tree(x, y, "#1f6b2e", "#3f9a45"), (x, y) => tree(x, y), (x, y) => pine(x, y), (x, y) => mushroom(x, y), (x, y) => bush(x, y, "#2f7a35")] },
  loop: { landmark: (x, y, t) => (windmill(x, y, t), flowerRing(x + 24, y - 2)), items: [(x, y) => flower(x, y, "#ffd54f"), (x, y) => bush(x, y), (x, y) => flower(x, y, "#ff6f91"), (x, y) => tree(x, y)] },
  arr: { landmark: (x, y) => [0, 1, 2, 3, 4].forEach((i) => crate(x + i * 9, y)), items: [(x, y) => crate(x, y), (x, y) => rock(x, y, "#b49a6b"), (x, y) => bush(x, y, "#7cb342")] },
  search: { landmark: (x, y, t) => (cave(x, y), torch(x - 18, y, t), torch(x + 18, y, t)), items: [(x, y) => rock(x, y), (x, y, t) => gem(x, y, "#4dd0e1", t), (x, y, t) => gem(x, y, "#f06292", t), (x, y) => rock(x, y, "#6a5d52")] },
  sort: { landmark: (x, y) => sortedBed(x, y), items: [(x, y) => flower(x, y, "#ff6f91"), (x, y) => flower(x, y, "#ce93d8"), (x, y) => flower(x, y, "#ffd54f"), (x, y) => flower(x, y, "#81d4fa"), (x, y) => bush(x, y)] },
  stack: { landmark: (x, y) => (blockTower(x, y), [0, 1, 2].forEach((i) => cart(x + 14 + i * 8, y, ["#ef5350", "#66bb6a", "#42a5f5"][i]))), items: [(x, y) => pine(x, y), (x, y) => rock(x, y, "#90a4ae"), (x, y) => cart(x, y, "#ffca28")] },
  rec: { landmark: (x, y) => (nested(x, y), column(x - 18, y), column(x + 18, y)), items: [(x, y) => column(x, y), (x, y) => rock(x, y, "#8e7cb5"), (x, y) => flower(x, y, "#e1bee7")] },
  maze: { landmark: (x, y, t) => (castle(x, y, t), hedgeMaze(x + 20, y - 22)), items: [(x, y) => bush(x, y, "#2f7a35"), (x, y) => tree(x, y), (x, y) => flower(x, y, "#fff")] },
};

/**
 * マップ全体を描く。genreKeys はエリアの順番、layout は computeLayout の結果
 */
export function drawMap(c, layout, genreKeys, t = 0) {
  ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const segs = [];
  for (let i = 0; i < layout.path.length - 1; i++) segs.push([layout.path[i], layout.path[i + 1]]);
  const nearPath = (x, y, r) => segs.some(([a, b]) => distToSeg(x, y, a, b) < r);

  layout.areas.forEach((ar, i) => {
    const key = genreKeys[i];
    const th = THEMES[key] || THEMES.var;
    R(ar.ox, ar.oy, AREA_W, AREA_H, th.ground);
    const rnd = mulberry(1000 + i * 77);
    for (let k = 0; k < 140; k++) {
      R(ar.ox + rnd() * AREA_W, ar.oy + rnd() * AREA_H, 1, 1, k % 2 ? th.dot1 : th.dot2);
    }
    // 港の水辺
    if (key === "arr") water(ar.ox, ar.oy + AREA_H - 26, AREA_W, 26, t);
  });

  // 道
  for (const [a, b] of segs) {
    const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y));
    for (let s = 0; s <= steps; s++) {
      const x = a.x + ((b.x - a.x) * s) / steps;
      const y = a.y + ((b.y - a.y) * s) / steps;
      R(x - ROAD_W / 2 - 1, y - ROAD_W / 2 - 1, ROAD_W + 2, ROAD_W + 2, "#b98d55");
    }
  }
  for (const [a, b] of segs) {
    const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y));
    for (let s = 0; s <= steps; s++) {
      const x = a.x + ((b.x - a.x) * s) / steps;
      const y = a.y + ((b.y - a.y) * s) / steps;
      R(x - ROAD_W / 2, y - ROAD_W / 2, ROAD_W, ROAD_W, "#ead2a0");
    }
  }
  // 道の小石
  const rr = mulberry(42);
  for (const [a, b] of segs) {
    if (rr() > 0.6) {
      const s = rr();
      R(a.x + (b.x - a.x) * s + (rr() - 0.5) * 4, a.y + (b.y - a.y) * s + (rr() - 0.5) * 4, 1, 1, "#c9a76f");
    }
  }

  // 装飾（道と看板の場所を避ける）。上から順に描いて奥行きを出す
  layout.areas.forEach((ar, i) => {
    const key = genreKeys[i];
    const deco = DECOR[key] || DECOR.var;
    const rnd = mulberry(5000 + i * 131);
    const banner = (x, y) => x < ar.ox + 118 && y < ar.oy + 26;
    const placed = [];
    // ランドマーク：道から離れた候補地を選ぶ
    const cands = [
      [0.2, 0.42],
      [0.68, 0.3],
      [0.3, 0.88],
      [0.7, 0.86],
      [0.62, 0.56],
      [0.2, 0.7],
      [0.82, 0.45],
      [0.82, 0.75],
      [0.15, 0.95],
      [0.8, 0.98],
    ];
    const [l0, r0] = SPAN[key] || [-10, 10];
    for (const [fx, fy] of cands) {
      const x = Math.max(ar.ox + 3 - l0, Math.min(ar.ox + AREA_W - 3 - r0, ar.ox + AREA_W * fx));
      const y = Math.min(ar.oy + AREA_H - 3, ar.oy + AREA_H * fy);
      let ok = !banner(x + l0, y - 22) && !banner(x + r0, y - 22);
      for (let sx = l0; ok && sx <= r0; sx += 6) if (nearPath(x + sx, y - 6, 9) || nearPath(x + sx, y - 16, 9)) ok = false;
      if (key === "arr" && y > ar.oy + AREA_H - 26) ok = false;
      if (ok) {
        placed.push({ x, y, fn: deco.landmark, big: true, l: l0, r: r0 });
        break;
      }
    }
    for (let k = 0; k < 60 && placed.length < 16; k++) {
      const x = ar.ox + 8 + rnd() * (AREA_W - 16);
      const y = ar.oy + 18 + rnd() * (AREA_H - 22);
      if (key === "arr" && y > ar.oy + AREA_H - 26) continue;
      if (nearPath(x, y - 5, 13) || banner(x, y - 10)) continue;
      if (placed.some((p) => (p.big ? x > p.x + p.l - 8 && x < p.x + p.r + 8 && y > p.y - 30 && y < p.y + 8 : Math.abs(p.x - x) < 11 && Math.abs(p.y - y) < 10))) continue;
      placed.push({ x, y, fn: deco.items[Math.floor(rnd() * deco.items.length)] });
    }
    if (key === "arr") {
      const bx = ar.ox + AREA_W * 0.8;
      const by = ar.oy + AREA_H - 8;
      if (!nearPath(bx, by - 4, 14)) boat(bx, by + Math.round(Math.sin(t * 2) * 1));
    }
    placed.sort((a, b) => a.y - b.y).forEach((p) => p.fn(p.x, p.y, t));
  });
}
