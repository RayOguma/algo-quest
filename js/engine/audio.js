// 効果音（Web Audio APIでコード生成。音源ファイルは使わない）§7.5
import * as state from "../state.js";

let ctx = null;
let master = null;
let active = []; // 再生中のノード（correct/wrong の開始時に止める）
let lastStep = 0;

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.connect(ctx.destination);
  return ctx;
}

/** タイトル画面の最初のタップで呼ぶ */
export function unlock() {
  const c = ensure();
  if (c && c.state === "suspended") c.resume().catch(() => {});
}

function volume() {
  const s = state.settings();
  return s.sound ? Math.max(0, Math.min(1, s.volume ?? 0.7)) : 0;
}

function track(node, stopAt) {
  active.push(node);
  node.onended = () => {
    active = active.filter((n) => n !== node);
  };
  node.stop(stopAt);
}

function stopAll() {
  for (const n of active) {
    try {
      n.stop();
    } catch {
      /* already stopped */
    }
  }
  active = [];
}

/** 指数減衰する1音 */
function tone({ freq, type = "sine", start, dur, gain = 0.3, attack = 0.005, dest, endFreq }) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), start + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(dest || master);
  o.start(start);
  track(o, start + dur + 0.02);
}

/** 鐘のような音（基音＋軽い倍音） */
function bell(freq, start, dur, gain) {
  tone({ freq, start, dur, gain });
  tone({ freq: freq * 2, start, dur: dur * 0.6, gain: gain * 0.25 });
  tone({ freq: freq * 3, start, dur: dur * 0.3, gain: gain * 0.08 });
}

const SOUNDS = {
  correct(t, v) {
    bell(1319, t, 0.15 + 0.1, 0.32 * v);
    bell(1047, t + 0.15, 0.45 + 0.2, 0.32 * v);
  },
  wrong(t, v) {
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1200;
    lp.connect(master);
    const g = 0.25 * v;
    const buzz = (freq, start, dur) => {
      const o = ctx.createOscillator();
      const gn = ctx.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(freq, start);
      gn.gain.setValueAtTime(0.0001, start);
      gn.gain.linearRampToValueAtTime(g, start + 0.015);
      gn.gain.setValueAtTime(g, start + dur - 0.04);
      gn.gain.linearRampToValueAtTime(0.0001, start + dur);
      o.connect(gn).connect(lp);
      o.start(start);
      track(o, start + dur + 0.02);
    };
    buzz(150, t, 0.18);
    buzz(140, t + 0.18 + 0.08, 0.45);
  },
  pickup(t, v) {
    tone({ freq: 660, endFreq: 1100, start: t, dur: 0.09, gain: 0.18 * v });
  },
  store(t, v) {
    tone({ freq: 220, type: "triangle", start: t, dur: 0.12, gain: 0.3 * v, endFreq: 140 });
    tone({ freq: 1760, start: t + 0.06, dur: 0.18, gain: 0.07 * v });
    tone({ freq: 2349, start: t + 0.1, dur: 0.16, gain: 0.05 * v });
  },
  step(t, v) {
    tone({ freq: 520, type: "triangle", start: t, dur: 0.06, gain: 0.07 * v, endFreq: 420 });
  },
  pop(t, v) {
    tone({ freq: 900, start: t, dur: 0.08, gain: 0.12 * v, endFreq: 500 });
  },
  calc(t, v) {
    tone({ freq: 784, start: t, dur: 0.1, gain: 0.12 * v });
    tone({ freq: 1175, start: t + 0.08, dur: 0.18, gain: 0.12 * v });
  },
  bump(t, v) {
    tone({ freq: 180, type: "triangle", start: t, dur: 0.2, gain: 0.25 * v, endFreq: 90 });
  },
  clear(t, v) {
    [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, type: "triangle", start: t + i * 0.09, dur: 0.22, gain: 0.16 * v }));
  },
  type(t, v) {
    tone({ freq: 1400, type: "square", start: t, dur: 0.025, gain: 0.025 * v });
  },
};

/**
 * 効果音を鳴らす。opts.fast=true のとき step は間引く。
 */
export function playSE(name, opts = {}) {
  const v = volume();
  if (v <= 0) return;
  const c = ensure();
  if (!c || !SOUNDS[name]) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  const now = c.currentTime + 0.01;
  if (name === "step") {
    const gap = opts.fast ? 0.3 : 0.12;
    if (now - lastStep < gap) return;
    lastStep = now;
  }
  if (name === "correct" || name === "wrong") stopAll();
  master.gain.value = 1;
  try {
    SOUNDS[name](now, v);
  } catch (e) {
    console.warn("[algoquest] 効果音エラー", e);
  }
}
