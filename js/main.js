// エントリポイント：状態の読み込み、画面登録、最初のタップで AudioContext 開始
import * as state from "./state.js";
import { register, show, dispatchKey } from "./router.js";
import { unlock } from "./engine/audio.js";
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
  dispatchKey(e);
});

function applyMotionClass() {
  document.documentElement.classList.toggle("reduce-motion", !!state.settings().reduceMotion);
}
applyMotionClass();
state.onChange(applyMotionClass);

show("title");
