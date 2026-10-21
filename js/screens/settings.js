// 設定画面（§4.7）
import * as state from "../state.js";
import { show } from "../router.js";
import { h, modal, toast } from "../ui.js";
import { playSE } from "../engine/audio.js";

let back = "title";
let backParams = {};

function toggleRow(label, key, desc) {
  const id = `set-${key}`;
  const input = h("input", { type: "checkbox", id, checked: !!state.settings()[key], role: "switch" });
  input.addEventListener("change", () => {
    state.setSetting(key, input.checked);
    if (key === "sound" && input.checked) playSE("pickup");
  });
  return h("div.set-row", {}, h("label", { for: id }, h("span.set-label", {}, label), desc ? h("small", {}, desc) : null), input);
}

export default {
  el: "screen-settings",
  mount(el, params = {}) {
    back = params.back || "title";
    backParams = params.backParams || {};
    const s = state.settings();
    const vol = h("input", { type: "range", id: "set-volume", min: "0", max: "1", step: "0.05", value: String(s.volume ?? 0.7) });
    vol.addEventListener("change", () => {
      state.setSetting("volume", Number(vol.value));
      playSE("correct");
    });
    const speedSel = h(
      "select",
      { id: "set-speed" },
      ...state.SPEEDS.map((v) => h("option", { value: String(v), selected: state.speed() === v }, `${v}倍`))
    );
    speedSel.addEventListener("change", () => state.setSetting("speed", Number(speedSel.value)));
    const viewSel = h(
      "select",
      { id: "set-codeview" },
      h("option", { value: "code", selected: s.codeView === "code" }, "疑似コード"),
      h("option", { value: "ja", selected: s.codeView === "ja" }, "日本語")
    );
    viewSel.addEventListener("change", () => state.setSetting("codeView", viewSel.value));
    el.append(
      h(
        "header.topbar",
        {},
        h("button.btn.small", { type: "button", onclick: () => show(back, backParams) }, "← 戻る"),
        h("h1.topbar-title", {}, "設定"),
        h("div.topbar-right")
      ),
      h(
        "main.settings",
        {},
        h(
          "div.set-row",
          {},
          h("label", { for: "set-speed" }, h("span.set-label", {}, "実演の速さ"), h("small", {}, "実演中の ⏩ ボタンでも切り替えられます")),
          speedSel
        ),
        toggleRow("効果音", "sound"),
        h("div.set-row", {}, h("label", { for: "set-volume" }, h("span.set-label", {}, "音量")), vol),
        h("div.set-row", {}, h("label", { for: "set-codeview" }, h("span.set-label", {}, "最初の表示形式")), viewSel),
        toggleRow("アニメーションを減らす", "reduceMotion", "移動の揺れや拡大の演出を控えめにします"),
        h(
          "div.set-row",
          {},
          h("span.set-label", {}, "遊び方"),
          h("button.btn", { type: "button", onclick: () => show("tutorial", { from: "settings", back }) }, "もう一度見る")
        ),
        h(
          "div.set-row.danger-zone",
          {},
          h("span.set-label", {}, "セーブデータ"),
          h(
            "button.btn.danger",
            {
              type: "button",
              onclick: async () => {
                const ok = await modal({
                  title: "セーブデータを削除しますか？",
                  body: "コイン・星・クリア状況・設定がすべて消えます。元に戻せません。",
                  actions: [
                    { label: "やめる", value: false, primary: true },
                    { label: "削除する", value: true, danger: true },
                  ],
                });
                if (ok) {
                  state.resetAll();
                  toast("セーブデータを削除しました");
                  show("title");
                }
              },
            },
            "削除する"
          )
        )
      )
    );
  },
  onKey(e) {
    if (e.key === "Escape") show(back, backParams);
  },
};
