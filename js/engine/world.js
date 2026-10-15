// ステージの論理状態とイベントの適用（DOMに依存しない。ブラウザの実演と tools/validate-stages.mjs の両方で使う）
// 実演（runner.js）は apply() が返す info をもとにアニメーションを付ける。

export const DIRS = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

export class WorldError extends Error {
  constructor(message, ev) {
    super(message);
    this.name = "WorldError";
    this.ev = ev;
  }
}

const WALKABLE = new Set([".", "G"]);

function dirBetween(a, b) {
  const dx = Math.sign(b.x - a.x);
  const dy = Math.sign(b.y - a.y);
  if (dx > 0) return "right";
  if (dx < 0) return "left";
  if (dy > 0) return "down";
  if (dy < 0) return "up";
  return null;
}

/** "a[2]" → { array: "a", index: 2 }（添字は1始まり） */
export function parseCellRef(ref) {
  const m = /^([A-Za-z_]\w*)\[(\d+)\]$/.exec(String(ref));
  return m ? { array: m[1], index: Number(m[2]) } : null;
}

export class World {
  constructor(stage) {
    this.stage = stage;
    this.field = stage.field;
    this.reset();
  }

  reset() {
    const f = this.field;
    this.pos = { x: f.start.x, y: f.start.y };
    this.dir = f.start.dir || "right";
    this.vars = { ...(this.stage.vars || {}) };
    this.arrays = {};
    for (const a of f.arrays || []) this.arrays[a.name] = [...a.values];
    this.items = {};
    for (const it of f.items || []) this.items[it.id] = { id: it.id, value: it.value, loc: { type: "floor", x: it.x, y: it.y } };
    this.pads = {};
    for (const p of f.pads || []) this.pads[p.kind] = { ...p, items: [], lamp: null };
    this.doors = {};
    for (const d of f.doors || []) this.doors[d.id] = { ...d, open: !!d.open };
    this.held = null;
    this.visits = [];
    this.line = 0;
    this.ended = false;
    this.result = null;
    this.failInfo = null;
    this.autoId = 0;
  }

  // ---- 盤面の問い合わせ ----
  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.field.cols && y < this.field.rows;
  }

  tileAt(x, y) {
    if (!this.inBounds(x, y)) return " ";
    return this.field.tiles[y][x] || " ";
  }

  /** 部品が置かれていて歩けないセル */
  objectAt(x, y) {
    const f = this.field;
    for (const b of f.boxes || []) if (b.x === x && b.y === y) return { kind: "box", obj: b };
    for (const p of f.pads || []) if (p.x === x && p.y === y) return { kind: "pad", obj: p };
    for (const a of f.arrays || []) {
      if (a.y === y && x >= a.x && x < a.x + a.values.length) return { kind: "array", obj: a };
    }
    for (const d of f.doors || []) if (d.x === x && d.y === y && !this.doors[d.id].open) return { kind: "door", obj: d };
    return null;
  }

  isWalkable(x, y) {
    return this.inBounds(x, y) && WALKABLE.has(this.tileAt(x, y)) && !this.objectAt(x, y);
  }

  findPath(from, to) {
    if (from.x === to.x && from.y === to.y) return [];
    if (!this.isWalkable(to.x, to.y)) throw new WorldError(`目的セル (${to.x},${to.y}) は歩けません`);
    const key = (p) => p.x + "," + p.y;
    const prev = new Map([[key(from), null]]);
    const q = [from];
    // 経路の見た目が安定するよう探索順を固定（右・左・下・上）
    const order = ["right", "left", "down", "up"];
    while (q.length) {
      const c = q.shift();
      if (c.x === to.x && c.y === to.y) break;
      for (const d of order) {
        const n = { x: c.x + DIRS[d][0], y: c.y + DIRS[d][1] };
        if (prev.has(key(n)) || !this.isWalkable(n.x, n.y)) continue;
        prev.set(key(n), c);
        q.push(n);
      }
    }
    if (!prev.has(key(to))) throw new WorldError(`(${from.x},${from.y}) から (${to.x},${to.y}) への道がありません`);
    const path = [];
    for (let c = to; c && key(c) !== key(from); c = prev.get(key(c))) path.unshift(c);
    return path;
  }

  /** 対象（変数名 / "a[2]" / 台の種類）の位置と、アルゴくんが立つ場所 */
  targetInfo(target) {
    const f = this.field;
    const cell = parseCellRef(target);
    if (cell) {
      const a = (f.arrays || []).find((v) => v.name === cell.array);
      if (!a) throw new WorldError(`配列 ${cell.array} がありません`);
      if (cell.index < 1 || cell.index > a.values.length) throw new WorldError(`添字 ${target} が範囲外です`);
      const x = a.x + cell.index - 1;
      const access = a.access === "up" ? { x, y: a.y - 1 } : { x, y: a.y + 1 };
      return { kind: "cell", x, y: a.y, access, array: a.name, index: cell.index };
    }
    const box = (f.boxes || []).find((b) => b.var === target);
    if (box) return { kind: "box", x: box.x, y: box.y, access: box.access || { x: box.x, y: box.y + 1 }, var: box.var };
    const pad = (f.pads || []).find((p) => p.kind === target);
    if (pad) return { kind: "pad", x: pad.x, y: pad.y, access: pad.access || { x: pad.x, y: pad.y + 1 }, pad: pad.kind };
    throw new WorldError(`対象 "${target}" が見つかりません`);
  }

  readValue(target) {
    const cell = parseCellRef(target);
    if (cell) return this.arrays[cell.array][cell.index - 1];
    if (!(target in this.vars)) throw new WorldError(`変数 ${target} はまだ値がありません`);
    return this.vars[target];
  }

  writeValue(target, value) {
    const cell = parseCellRef(target);
    if (cell) this.arrays[cell.array][cell.index - 1] = value;
    else this.vars[target] = value;
  }

  /** 対象の前まで歩く。経路と向きを返す */
  approach(t) {
    const from = { ...this.pos };
    const path = this.findPath(this.pos, t.access);
    if (path.length) {
      this.dir = dirBetween(path.length > 1 ? path[path.length - 2] : from, path[path.length - 1]) || this.dir;
      this.pos = { ...path[path.length - 1] };
    }
    const face = dirBetween(this.pos, t) || this.dir;
    return { from, path, face };
  }

  newId(prefix = "c") {
    this.autoId += 1;
    return `_${prefix}${this.autoId}`;
  }

  snapshot() {
    return {
      pos: { ...this.pos },
      vars: { ...this.vars },
      arrays: Object.fromEntries(Object.entries(this.arrays).map(([k, v]) => [k, [...v]])),
    };
  }

  // ---- イベント適用 ----
  apply(ev) {
    const t = ev.type;
    switch (t) {
      case "line": {
        const n = ev.n;
        if (!(n >= 1 && n <= this.stage.program.code.length)) throw new WorldError(`line ${n} は処理の範囲外です`, ev);
        this.line = n;
        return {};
      }
      case "move": {
        const d = DIRS[ev.dir];
        if (!d) throw new WorldError(`move の向き "${ev.dir}" が不正です`, ev);
        const from = { ...this.pos };
        const to = { x: from.x + d[0], y: from.y + d[1] };
        if (!this.isWalkable(to.x, to.y)) throw new WorldError(`(${from.x},${from.y}) から ${ev.dir} は壁です`, ev);
        this.pos = to;
        this.dir = ev.dir;
        return { from, to, dir: ev.dir };
      }
      case "moveTo": {
        const from = { ...this.pos };
        let path;
        if (ev.path) {
          path = ev.path.map((p) => ({ x: p.x ?? p[0], y: p.y ?? p[1] }));
          let c = from;
          for (const p of path) {
            if (Math.abs(p.x - c.x) + Math.abs(p.y - c.y) !== 1 || !this.isWalkable(p.x, p.y))
              throw new WorldError(`moveTo の経路 (${p.x},${p.y}) が不正です`, ev);
            c = p;
          }
        } else {
          path = this.findPath(from, { x: ev.x, y: ev.y });
        }
        if (path.length) {
          this.dir = dirBetween(path.length > 1 ? path[path.length - 2] : from, path[path.length - 1]) || this.dir;
          this.pos = { ...path[path.length - 1] };
        }
        return { from, path };
      }
      case "spawnItem": {
        if (this.items[ev.id]) throw new WorldError(`アイテム ${ev.id} は既にあります`, ev);
        if (ev.pad) {
          const pad = this.pads[ev.pad];
          if (!pad) throw new WorldError(`台 ${ev.pad} がありません`, ev);
          pad.items.push(ev.id);
          this.items[ev.id] = { id: ev.id, value: ev.value, loc: { type: "pad", pad: ev.pad } };
        } else {
          if (!this.isWalkable(ev.x, ev.y)) throw new WorldError(`アイテム ${ev.id} の出現位置が歩けない場所です`, ev);
          this.items[ev.id] = { id: ev.id, value: ev.value, loc: { type: "floor", x: ev.x, y: ev.y } };
        }
        return { item: this.items[ev.id] };
      }
      case "pickup": {
        const it = this.items[ev.id];
        if (!it) throw new WorldError(`アイテム ${ev.id} がありません`, ev);
        if (this.held) throw new WorldError(`すでに ${this.held} を持っています`, ev);
        let walk;
        const src = it.loc;
        if (src.type === "floor") {
          const from = { ...this.pos };
          const path = this.findPath(this.pos, src);
          if (path.length) {
            this.dir = dirBetween(path.length > 1 ? path[path.length - 2] : from, path[path.length - 1]) || this.dir;
            this.pos = { ...path[path.length - 1] };
          }
          walk = { from, path, face: this.dir };
        } else if (src.type === "pad") {
          walk = this.approach(this.targetInfo(src.pad));
          const pad = this.pads[src.pad];
          pad.items = pad.items.filter((i) => i !== ev.id);
        } else throw new WorldError(`アイテム ${ev.id} は拾えません`, ev);
        it.loc = { type: "held" };
        this.held = ev.id;
        return { ...walk, src, item: it };
      }
      case "takeCopy": {
        if (this.held) throw new WorldError(`すでに ${this.held} を持っています`, ev);
        const tInfo = this.targetInfo(ev.box);
        const walk = this.approach(tInfo);
        const value = this.readValue(ev.box);
        const id = ev.id || this.newId("copy");
        this.items[id] = { id, value, loc: { type: "held" } };
        this.held = id;
        return { ...walk, target: tInfo, value, id };
      }
      case "put": {
        if (this.held !== ev.id) throw new WorldError(`${ev.id} を持っていません（持っているのは ${this.held}）`, ev);
        const tInfo = this.targetInfo(ev.target);
        if (tInfo.kind !== "pad") throw new WorldError(`put の置き場所 ${ev.target} は台ではありません`, ev);
        const walk = this.approach(tInfo);
        this.pads[tInfo.pad].items.push(ev.id);
        this.items[ev.id].loc = { type: "pad", pad: tInfo.pad };
        this.held = null;
        return { ...walk, target: tInfo, slot: this.pads[tInfo.pad].items.length - 1 };
      }
      case "calc": {
        const padKind = ev.pad || "calc";
        const pad = this.pads[padKind];
        if (!pad || pad.items.length === 0) throw new WorldError(`計算台に材料がありません`, ev);
        const consumed = [...pad.items];
        for (const i of consumed) delete this.items[i];
        const id = ev.id || this.newId("calc");
        pad.items = [id];
        this.items[id] = { id, value: ev.result, loc: { type: "pad", pad: padKind } };
        return { consumed, id, pad: padKind };
      }
      case "compare": {
        const padKind = ev.pad || "compare";
        const pad = this.pads[padKind];
        if (!pad) throw new WorldError(`比較台がありません`, ev);
        const consumed = [...pad.items];
        for (const i of consumed) delete this.items[i];
        pad.items = [];
        pad.lamp = !!ev.result;
        return { consumed, pad: padKind };
      }
      case "store": {
        if (this.held !== ev.id) throw new WorldError(`${ev.id} を持っていません（持っているのは ${this.held}）`, ev);
        const tInfo = this.targetInfo(ev.box);
        const walk = this.approach(tInfo);
        let old;
        try {
          old = this.readValue(ev.box);
        } catch {
          old = undefined;
        }
        const value = this.items[ev.id].value;
        this.writeValue(ev.box, value);
        delete this.items[ev.id];
        this.held = null;
        return { ...walk, target: tInfo, old, value };
      }
      case "setCell": {
        const arr = this.arrays[ev.array];
        if (!arr || ev.index < 1 || ev.index > arr.length) throw new WorldError(`setCell ${ev.array}[${ev.index}] が不正です`, ev);
        const old = arr[ev.index - 1];
        arr[ev.index - 1] = ev.value;
        return { old };
      }
      case "toggle": {
        const d = this.doors[ev.target];
        if (!d) throw new WorldError(`扉/スイッチ ${ev.target} がありません`, ev);
        d.open = !d.open;
        return { door: d };
      }
      case "visit": {
        this.visits.push({ x: ev.x, y: ev.y });
        return { order: this.visits.length };
      }
      case "emote":
      case "wait":
        return {};
      case "end":
        this.ended = true;
        return {};
      case "success":
        this.result = "success";
        return {};
      case "fail": {
        if (!ev.kind || !ev.reason) throw new WorldError("fail には kind と reason が必要です", ev);
        let walk = null;
        if (ev.kind === "lock") {
          if (!ev.box) throw new WorldError("fail(lock) には box が必要です", ev);
          walk = this.approach(this.targetInfo(ev.box));
        }
        this.result = "fail";
        this.failInfo = { kind: ev.kind, reason: ev.reason };
        return { ...(walk || {}) };
      }
      default:
        throw new WorldError(`未対応のイベント種別 "${t}"`, ev);
    }
  }

  /** イベント列をすべて適用（検証やスキップ用） */
  runAll(events) {
    for (const ev of events) this.apply(ev);
    return this;
  }
}

/** 選択肢が再生するイベント列（正解で events 省略時は stage.events + success） */
export function eventsForChoice(stage, choice) {
  if (choice.events) return choice.events;
  if (choice.correct) return [...stage.events, { type: "success" }];
  return [];
}

/** expectedFinal に書かれた項目だけを比較 */
export function matchesExpected(snapshot, expected) {
  if (!expected) return true;
  if (expected.pos && (snapshot.pos.x !== expected.pos.x || snapshot.pos.y !== expected.pos.y)) return false;
  for (const [k, v] of Object.entries(expected.vars || {})) if (snapshot.vars[k] !== v) return false;
  for (const [k, v] of Object.entries(expected.arrays || {})) {
    const a = snapshot.arrays[k];
    if (!a || a.length !== v.length || a.some((x, i) => x !== v[i])) return false;
  }
  return true;
}
