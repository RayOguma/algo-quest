// エントリポイント：状態の読み込み、画面登録、最初のタップで AudioContext 開始
import * as state from "./state.js";
import { register, show, dispatchKey } from "./router.js";
import { unlock, playSE } from "./engine/audio.js";
import { h, modal } from "./ui.js";
import title from "./screens/title.js";
import tutorial from "./screens/tutorial.js";
import stageList from "./screens/stageList.js";
import area from "./screens/area.js";
import quiz from "./screens/quiz.js";
import explanation from "./screens/explanation.js";
import settings from "./screens/settings.js";

state.load();

register("title", title);
register("tutorial", tutorial);
register("stages", stageList);
register("area", area);
register("quiz", quiz);
register("explain", explanation);
register("settings", settings);

// ブラウザの自動再生制限対策：最初の操作で AudioContext を開始
const firstTouch = () => {
  unlock();
  window.removeEventListener("pointerdown", firstTouch, true);
  window.removeEventListener("keydown", firstTouch, true);
};
window.addEventListener("pointerdown", firstTouch, true);
window.addEventListener("keydown", firstTouch, true);

window.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (!document.getElementById("modal").hidden) return;
  // メモなどの入力中は、画面のショートカットキー（1〜4・Enter・T など）を使わない
  const t = e.target;
  if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
  dispatchKey(e);
});

function applyMotionClass() {
  document.documentElement.classList.toggle("reduce-motion", !!state.settings().reduceMotion);
}
applyMotionClass();
state.onChange(applyMotionClass);

show("title");

/** ログインボーナス：起動時と、日付が変わってから画面に戻ってきたときに受け取る */
async function loginBonus() {
  if (!document.getElementById("modal").hidden) return; // 他のダイアログ中は次の機会に
  const r = state.claimLoginBonus();
  if (!r) return;
  playSE("clear");
  const body = h(
    "div.result",
    {},
    h("p.result-coins", {}, h("span.coin-icon"), ` +${r.amount} コイン`),
    r.first
      ? h("p", {}, "はじめての ログイン ボーナス！ ヒントや「ここまで すすめる」に つかえるよ。")
      : h("p", {}, `${r.streak}日 れんぞく ログイン！ ${r.streak < state.DAILY_BONUS.length ? "あしたも くると ふえるよ。" : "まいにち さいだいの ボーナスだよ。"}`),
    h("p.muted", {}, `いまの コイン：${state.coins()}`)
  );
  await modal({ title: r.first ? "🎁 ようこそ！" : "🎁 ログイン ボーナス", body });
}
loginBonus();
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") loginBonus();
});
