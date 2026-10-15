// イベントランナー：events を先頭から順に非同期再生する（§7）
// World.apply() で論理状態を進め、その info をもとに FieldView.vis をアニメーションさせ、最後に sync() で確定する。
import { playSE } from "./audio.js";
import * as state from "../state.js";
import { CONST_COLOR, RESULT_COLOR } from "./field.js";
import { colorFor, ARRAY_COLOR } from "./parts.js";
import { DIRS, parseCellRef } from "./world.js";

// 基本の長さ（ms）。2倍速ではすべて 1/2 になる
const DUR = {
  line: 220,
  move: 700, // 1マス移動（§5.3）
  walk: 300, // 物を取りに行く・運ぶときの1マス
  spawn: 320,
  fly: 320,
  calc: 420,
  compare: 650,
  label: 650,
  emote: 900,
  end: 200,
  finale: 750,
};

// 繰返しの2周目以降の速さ（倍）
const LOOP_BOOST = 4;

const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function dirBetween(a, b) {
  if (b.x > a.x) return "right";
  if (b.x < a.x) return "left";
  if (b.y > a.y) return "down";
  if (b.y < a.y) return "up";
  return null;
}

export class Runner {
  /**
   * @param {import('./field.js').FieldView} view
   * @param {{ onLine?: (n:number)=>void, onStart?: ()=>void, onFinish?: (r:object)=>void }} hooks
   */
  constructor(view, hooks = {}) {
    this.view = view;
    this.hooks = hooks;
    this.playing = false;
    this.skipping = false;
    this.aborted = false;
    this.startedAt = 0;
  }

  get speed() {
    return (state.settings().fast ? 2 : 1) * (this.boost || 1);
  }

  get vis() {
    return this.view.vis;
  }

  /** スキップ（開始0.3秒以内は受け付けない）。受け付けたら true */
  skip() {
    if (!this.playing || this.skipping) return false;
    if (performance.now() - this.startedAt < 300) return false;
    this.skipping = true;
    return true;
  }

  /** 画面を離れるときなどに中断（判定演出なし） */
  abort() {
    this.aborted = true;
    this.skipping = true;
  }

  tween(ms, fn) {
    return new Promise((resolve) => {
      if (this.skipping || ms <= 0) {
        fn(1);
        resolve();
        return;
      }
      let el = 0;
      let last = performance.now();
      const step = (now) => {
        if (this.skipping) {
          fn(1);
          resolve();
          return;
        }
        el += Math.max(0, now - last) * this.speed;
        last = now;
        const t = Math.min(1, el / ms);
        fn(t);
        if (t >= 1) resolve();
        else requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  wait(ms) {
    return this.tween(ms, () => {});
  }

  /**
   * イベント列を再生。盤面は初期状態から始める。
   * @returns {Promise<{result: 'success'|'fail'|null, failInfo: object|null, skipped: boolean, aborted: boolean}>}
   */
  async play(events) {
    const view = this.view;
    view.reset();
    this.playing = true;
    this.skipping = false;
    this.aborted = false;
    this.startedAt = performance.now();
    // 繰返しの2周目以降（一度実行した行にもう一度来たとき）は自動で速くする（§6.2⑥）
    this.seenLines = new Set();
    this.boost = 1;
    this.hooks.onStart && this.hooks.onStart();
    let skippedAny = false;
    for (const ev of events) {
      if (this.aborted) break;
      if (ev.type === "success" || ev.type === "fail") {
        if (this.skipping) {
          skippedAny = true;
          view.sync();
        }
        await this.finale(ev);
        continue;
      }
      if (this.skipping) {
        skippedAny = true;
        this.assignColor(ev);
        view.world.apply(ev);
        if (ev.type === "line") this.line(ev.n);
        continue;
      }
      await this.animate(ev);
    }
    if (this.skipping && !this.aborted) {
      // 最終状態を確定（success/fail の静止表示は finale で設定済み）
      const keep = { emote: this.vis.char.emote, emoteT0: this.vis.char.emoteT0, bubble: this.vis.char.bubble };
      const check = this.vis.check;
      const boxes = this.vis.boxes;
      view.sync();
      Object.assign(this.vis.char, keep);
      this.vis.check = check;
      for (const [k, b] of Object.entries(boxes)) if (b.lock) this.vis.boxes[k].lock = b.lock;
    }
    this.playing = false;
    const r = { result: view.world.result, failInfo: view.world.failInfo, skipped: skippedAny, aborted: this.aborted };
    this.hooks.onFinish && this.hooks.onFinish(r);
    return r;
  }

  line(n) {
    this.hooks.onLine && this.hooks.onLine(n);
  }

  /** 新しく生まれるクリスタルの色（スキップ時も同じ色にする） */
  assignColor(ev) {
    const c = this.view.colors;
    if (ev.type === "spawnItem") c[ev.id] = CONST_COLOR;
    else if (ev.type === "takeCopy" && ev.id) c[ev.id] = this.targetColor(ev.box);
    else if (ev.type === "calc" && ev.id) c[ev.id] = RESULT_COLOR;
  }

  targetColor(target) {
    const cell = parseCellRef(target);
    if (cell) return colorFor(this.view.stage, cell.array) || ARRAY_COLOR;
    return colorFor(this.view.stage, target);
  }

  // ---- 位置ヘルパー（タイル座標） ----
  headPos() {
    const ch = this.vis.char;
    return { x: ch.x, y: ch.y - 0.8 };
  }

  targetPos(t) {
    return { x: t.x, y: t.y + 0.05 };
  }

  padSlotPos(kind, i, n) {
    const p = this.view.stage.field.pads.find((q) => q.kind === kind);
    return { x: p.x + (i - (n - 1) / 2) * 0.3, y: p.y - 0.02 };
  }

  face(dir) {
    if (dir === "left") this.vis.char.flip = true;
    else if (dir === "right") this.vis.char.flip = false;
  }

  async walk(from, path, perTile) {
    const ch = this.vis.char;
    const reduce = this.view.reduce;
    let cur = { ...from };
    for (const p of path) {
      this.face(dirBetween(cur, p));
      ch.moving = true;
      playSE("step", { fast: this.speed > 1 });
      const a = { ...cur };
      if (reduce) {
        // 短いフェードで移動を表現
        await this.tween(perTile * 0.5, (t) => {
          ch.alpha = t < 0.5 ? 1 - t * 1.4 : 0.3 + (t - 0.5) * 1.4;
          if (t >= 0.5) {
            ch.x = p.x;
            ch.y = p.y;
          }
        });
      } else {
        await this.tween(perTile, (t) => {
          ch.x = lerp(a.x, p.x, t);
          ch.y = lerp(a.y, p.y, t);
          ch.bounce = t;
        });
      }
      cur = p;
    }
    ch.moving = false;
    ch.bounce = 0;
    ch.alpha = 1;
  }

  /** クリスタルを放物線で飛ばす */
  async fly(value, color, from, to, ms, { scaleFrom = 1, scaleTo = 1, alphaTo = 1, arc = 0.6 } = {}) {
    const fl = { value, color, x: from.x, y: from.y, scale: scaleFrom, alpha: 1 };
    this.vis.flying.push(fl);
    await this.tween(ms, (t) => {
      const e = ease(t);
      fl.x = lerp(from.x, to.x, e);
      fl.y = lerp(from.y, to.y, e) - Math.sin(Math.PI * t) * arc;
      fl.scale = lerp(scaleFrom, scaleTo, e);
      fl.alpha = lerp(1, alphaTo, e);
    });
    this.vis.flying = this.vis.flying.filter((f) => f !== fl);
  }

  // ---- 各イベントのアニメーション ----
  async animate(ev) {
    const view = this.view;
    const w = view.world;
    const vis = this.vis;
    this.assignColor(ev);
    switch (ev.type) {
      case "line": {
        w.apply(ev);
        this.boost = this.seenLines.has(ev.n) ? LOOP_BOOST : 1;
        this.seenLines.add(ev.n);
        this.line(ev.n);
        await this.wait(DUR.line);
        break;
      }
      case "move": {
        const info = w.apply(ev);
        await this.walk(info.from, [info.to], DUR.move);
        view.sync();
        break;
      }
      case "moveTo": {
        const info = w.apply(ev);
        await this.walk(info.from, info.path, DUR.walk);
        view.sync();
        break;
      }
      case "spawnItem": {
        w.apply(ev);
        view.sync();
        playSE("pop");
        let target;
        if (ev.pad) {
          const pv = vis.pads[ev.pad];
          target = pv.items.find((i) => i.id === ev.id);
          const idx = pv.items.indexOf(target);
          const pos = this.padSlotPos(ev.pad, idx, pv.items.length);
          view.particles.sparkle(pos.x, pos.y);
        } else {
          target = vis.floor[ev.id];
          view.particles.sparkle(ev.x, ev.y);
        }
        await this.tween(DUR.spawn, (t) => {
          if (target) target.scale = t < 0.7 ? (t / 0.7) * 1.2 : 1.2 - ((t - 0.7) / 0.3) * 0.2;
        });
        break;
      }
      case "pickup": {
        const it = w.items[ev.id];
        const src = { ...it.loc };
        let srcPos;
        if (src.type === "floor") srcPos = { x: src.x, y: src.y };
        else {
          const pv = vis.pads[src.pad];
          const idx = pv.items.findIndex((i) => i.id === ev.id);
          srcPos = this.padSlotPos(src.pad, idx, pv.items.length);
        }
        const info = w.apply(ev);
        await this.walk(info.from, info.path, DUR.walk);
        this.face(info.face);
        if (src.type === "floor") delete vis.floor[ev.id];
        else vis.pads[src.pad].items = vis.pads[src.pad].items.filter((i) => i.id !== ev.id);
        playSE("pickup");
        await this.fly(it.value, view.colorOf(ev.id), srcPos, this.headPos(), DUR.fly * 0.8, { arc: 0.3 });
        view.sync();
        break;
      }
      case "takeCopy": {
        const info = w.apply(ev);
        await this.walk(info.from, info.path, DUR.walk);
        this.face(info.face);
        this.glowTarget(info.target);
        playSE("pickup");
        await this.fly(info.value, view.colorOf(info.id), this.targetPos(info.target), this.headPos(), DUR.fly, {
          scaleFrom: 0.4,
          scaleTo: 1,
          arc: 0.5,
        });
        view.sync();
        break;
      }
      case "put": {
        const it = w.items[ev.id];
        const info = w.apply(ev);
        await this.walk(info.from, info.path, DUR.walk);
        this.face(info.face);
        vis.char.held = null;
        const n = info.slot + 1;
        const to = this.padSlotPos(info.target.pad, info.slot, n);
        await this.fly(it.value, view.colorOf(ev.id), this.headPos(), { x: to.x, y: to.y }, DUR.fly, { scaleTo: 0.85, arc: 0.4 });
        playSE("pop");
        view.sync();
        break;
      }
      case "calc": {
        const kind = ev.pad || "calc";
        const before = vis.pads[kind].items.map((i) => ({ ...i }));
        w.apply(ev);
        vis.padLabels[kind] = { text: `${ev.expr} = ${ev.result}` };
        const pv = vis.pads[kind];
        pv.items = before;
        const n = before.length;
        await this.tween(DUR.calc, (t) => {
          before.forEach((it, i) => {
            const off = (i - (n - 1) / 2) * 0.3;
            it.dx = -off * ease(t);
            it.scale = 1 - 0.5 * t;
            it.alpha = 1 - 0.3 * t;
          });
        });
        view.sync();
        playSE("calc");
        const p = this.view.stage.field.pads.find((q) => q.kind === kind);
        view.particles.sparkle(p.x, p.y - 0.1, 7);
        const res = vis.pads[kind].items[0];
        await this.tween(DUR.spawn, (t) => {
          res.scale = t < 0.7 ? 0.4 + (t / 0.7) * 0.8 : 1.2 - ((t - 0.7) / 0.3) * 0.2;
          res.glow = 1 - t;
        });
        await this.wait(DUR.label);
        vis.padLabels[kind] = null;
        break;
      }
      case "compare": {
        const kind = ev.pad || "compare";
        const before = vis.pads[kind].items.map((i) => ({ ...i }));
        w.apply(ev);
        vis.padLabels[kind] = { text: `${ev.expr} → ${ev.result ? "真" : "偽"}`, color: ev.result ? "#2E7D32" : "#C62828" };
        vis.pads[kind].items = before;
        await this.wait(DUR.compare * 0.5);
        playSE(ev.result ? "calc" : "bump");
        vis.pads[kind].lamp = !!ev.result;
        await this.tween(DUR.compare * 0.5, (t) => before.forEach((it) => (it.alpha = 1 - t)));
        view.sync();
        await this.wait(DUR.label);
        vis.padLabels[kind] = null;
        break;
      }
      case "store": {
        const it = w.items[ev.id];
        const color = view.colorOf(ev.id);
        const info = w.apply(ev);
        await this.walk(info.from, info.path, DUR.walk);
        this.face(info.face);
        const tp = this.targetPos(info.target);
        if (info.old !== undefined) {
          // 古い値が先にポンと飛び出して消える
          this.setTargetDisplay(info.target, undefined);
          playSE("pop");
          await this.fly(info.old, this.targetColor(ev.box), tp, { x: tp.x + 0.45, y: tp.y - 0.6 }, DUR.fly, {
            scaleFrom: 0.8,
            scaleTo: 0.6,
            alphaTo: 0,
            arc: 0.5,
          });
        }
        vis.char.held = null;
        await this.fly(it.value, color, this.headPos(), tp, DUR.fly, { scaleTo: 0.3, arc: 0.5 });
        this.setTargetDisplay(info.target, info.value);
        this.glowTarget(info.target);
        view.particles.sparkle(tp.x, tp.y - 0.2, 6);
        playSE("store");
        view.sync();
        await this.wait(120);
        break;
      }
      case "setCell": {
        w.apply(ev);
        view.sync();
        const cv = vis.cells[ev.array];
        if (cv) cv.glowT0[ev.index - 1] = performance.now();
        await this.wait(250);
        break;
      }
      case "toggle":
      case "visit": {
        w.apply(ev);
        view.sync();
        if (ev.type === "visit") view.particles.sparkle(ev.x, ev.y, 4);
        await this.wait(260);
        break;
      }
      case "emote": {
        w.apply(ev);
        vis.char.emote = ev.name;
        vis.char.emoteT0 = performance.now();
        await this.wait(DUR.emote);
        if (ev.name === "think") vis.char.emote = null;
        break;
      }
      case "wait": {
        w.apply(ev);
        await this.wait(ev.ms || 300);
        break;
      }
      case "end": {
        w.apply(ev);
        view.sync();
        await this.wait(DUR.end);
        break;
      }
      default:
        w.apply(ev); // 未対応は World がエラーにする
    }
  }

  setTargetDisplay(t, value) {
    if (t.kind === "box") this.vis.boxes[t.var].value = value;
    else if (t.kind === "cell") this.vis.cells[t.array].values[t.index - 1] = value;
  }

  glowTarget(t) {
    const now = performance.now();
    if (t.kind === "box") this.vis.boxes[t.var].glowT0 = now;
    else if (t.kind === "cell") this.vis.cells[t.array].glowT0[t.index - 1] = now;
  }

  /** 成功/失敗。スキップ中でも最終の見た目（検算マーク・ロック・吹き出し）は必ず出す */
  async finale(ev) {
    const view = this.view;
    const w = view.world;
    const vis = this.vis;
    const ch = vis.char;
    const now = () => performance.now();
    if (ev.type === "success") {
      w.apply(ev);
      if (!this.skipping) view.sync();
      ch.emote = "cheer";
      ch.emoteT0 = now();
      vis.check = { state: "green", x: w.pos.x, y: w.pos.y, t0: now() };
      view.particles.burst(w.pos.x, w.pos.y - 0.6, { n: 14 });
      await this.wait(DUR.finale);
      return;
    }
    // fail
    const held = w.held ? { value: w.items[w.held].value, color: view.colorOf(w.held) } : null;
    const info = w.apply(ev);
    if (!this.skipping && info.path) {
      await this.walk(info.from, info.path, DUR.walk);
      this.face(info.face);
    }
    if (ev.kind === "lock") {
      const t = w.targetInfo(ev.box);
      const tp = this.targetPos(t);
      if (!this.skipping && held) {
        ch.held = null;
        await this.fly(held.value, held.color, this.headPos(), { x: tp.x, y: tp.y - 0.15 }, DUR.fly, { scaleTo: 0.7, arc: 0.5 });
        vis.boxes[ev.box].lock = "red";
        vis.boxes[ev.box].lockT0 = now();
        playSE("bump");
        await this.fly(held.value, held.color, { x: tp.x, y: tp.y - 0.15 }, this.headPos(), DUR.fly, { scaleFrom: 0.7, arc: 0.7 });
        ch.held = held;
      } else {
        if (this.skipping) view.sync();
        vis.boxes[ev.box] && ((vis.boxes[ev.box].lock = "red"), (vis.boxes[ev.box].lockT0 = now()));
      }
    } else if (ev.kind === "wall") {
      const d = DIRS[ev.dir || w.dir] || [1, 0];
      this.face(ev.dir || w.dir);
      playSE("bump");
      await this.tween(500, (t) => {
        const k = Math.sin(Math.PI * Math.min(1, t * 2)) * (t < 0.5 ? 0.3 : 0.3 * (1 - (t - 0.5) * 2));
        ch.bumpX = d[0] * k;
        ch.bumpY = d[1] * k;
      });
      ch.bumpX = 0;
      ch.bumpY = 0;
      view.particles.burst(w.pos.x + d[0] * 0.4, w.pos.y + d[1] * 0.4 - 0.4, { n: 6, colors: ["#FFF176"], speed: 1.4 });
    } else if (ev.kind === "noGoal") {
      vis.flag = { x: w.pos.x, y: w.pos.y, droop: 0 };
      await this.tween(500, (t) => (vis.flag.droop = t));
    } else {
      vis.check = { state: "red", x: w.pos.x, y: w.pos.y, t0: now() };
    }
    ch.emote = "confused";
    ch.emoteT0 = now();
    ch.bubble = ev.reason;
    await this.wait(DUR.finale);
  }
}
