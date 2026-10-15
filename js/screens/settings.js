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
    const viewSel = h(
      "select",
      { id: "set-codeview" },
      h("option", { value: "ja", selected: s.codeView === "ja" }, "日本語"),
      h("option", { value: "code", selected: s.codeView === "code" }, "疑似コード")
    );
    viewSel.addEventListener("change", () => state.setSetting("codeView", viewSel.value));
    el.append(
      h(
        "header.topbar",
        {},
        h("button.btn.small", { type: "button", onclick: () => show(back, backParams) }, "← もどる"),
        h("h1.topbar-title", {}, "せってい"),
        h("div.topbar-right")
      ),
      h(
        "main.settings",
        {},
        toggleRow("実演を 常に 2倍速にする", "fast", "実演中の ⏩ ボタンでも 切り替えられます"),
        toggleRow("効果音", "sound"),
        h("div.set-row", {}, h("label", { for: "set-volume" }, h("span.set-label", {}, "音量")), vol),
        h("div.set-row", {}, h("label", { for: "set-codeview" }, h("span.set-label", {}, "はじめの 表示形式")), viewSel),
        toggleRow("アニメーションを 減らす", "reduceMotion", "移動の揺れや拡大の演出を ひかえめにします"),
        h(
          "div.set-row",
          {},
          h("span.set-label", {}, "あそびかた"),
          h("button.btn", { type: "button", onclick: () => show("tutorial", { from: "settings", back }) }, "もう一度 見る")
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
                  title: "セーブデータを 削除しますか？",
                  body: "コイン・星・クリア状況・設定が すべて 消えます。元に戻せません。",
                  actions: [
                    { label: "やめる", value: false, primary: true },
                    { label: "削除する", value: true, danger: true },
                  ],
                });
                if (ok) {
                  state.resetAll();
                  toast("セーブデータを 削除しました");
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
