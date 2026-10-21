// メモ：変数ごとの値の入力欄と、自由記入欄。ステージごとに保存する（問題画面の右側に出す）
import * as state from "../state.js";
import { h } from "../ui.js";
import { colorFor } from "../engine/parts.js";

/** 変数・配列の名前（ボックスの色の並び順） */
function varNames(stage) {
  const names = Object.keys(stage.varColors || {});
  for (const b of stage.field.boxes || []) if (!names.includes(b.var)) names.push(b.var);
  for (const a of stage.field.arrays || []) if (!names.includes(a.name)) names.push(a.name);
  return names;
}

/**
 * @param {object} stage
 * @param {{ onToggle?: (open:boolean)=>void }} hooks
 */
export function memoPanel(stage, hooks = {}) {
  const m = state.memo(stage.id);
  const save = () => state.setMemo(stage.id, m);
  const inputs = [];
  const rows = varNames(stage).map((name) => {
    const id = `memo-${name}`;
    const input = h("input.memo-input", {
      type: "text",
      id,
      value: m.vars[name] || "",
      autocomplete: "off",
      placeholder: "れい：3 → 5 → 4",
    });
    input.addEventListener("input", () => {
      m.vars[name] = input.value;
      save();
    });
    inputs.push(input);
    return h("div.memo-row", {}, h("label.var-inline.memo-name", { for: id, style: { "--c": colorFor(stage, name) } }, h("b", {}, name)), input);
  });
  const free = h("textarea.memo-free", { id: "memo-free", rows: 6, placeholder: "気づいたことや 計算を 自由に 書こう" });
  free.value = m.free;
  free.addEventListener("input", () => {
    m.free = free.value;
    save();
  });
  const clearBtn = h("button.btn.small", { type: "button" }, "ぜんぶ けす");
  clearBtn.addEventListener("click", () => {
    inputs.forEach((i) => (i.value = ""));
    free.value = "";
    m.vars = {};
    m.free = "";
    save();
  });
  const closeBtn = h("button.btn.small.memo-close", { type: "button", "aria-label": "メモを とじる" }, "✕ とじる");
  const el = h(
    "aside.memo-panel",
    { "aria-label": "メモ", hidden: true },
    h("div.memo-head", {}, h("b", {}, "📝 メモ"), closeBtn),
    rows.length ? h("p.memo-sub", {}, "変数の 値") : null,
    ...rows,
    h("label.memo-sub", { for: "memo-free" }, "じゆう メモ"),
    free,
    h("div.memo-foot", {}, h("small.muted", {}, "メモは この問題ごとに 保存されます"), clearBtn)
  );
  const button = h("button.btn.small.memo-btn", { type: "button", "aria-pressed": "false", "aria-controls": "memo-panel", title: "Mキー" }, "📝 メモ");
  el.id = "memo-panel";
  const set = (open) => {
    el.hidden = !open;
    button.setAttribute("aria-pressed", String(open));
    hooks.onToggle && hooks.onToggle(open);
    if (open) (inputs[0] || free).focus({ preventScroll: true });
  };
  button.addEventListener("click", () => set(el.hidden));
  closeBtn.addEventListener("click", () => {
    set(false);
    button.focus();
  });
  return { el, button, toggle: () => set(el.hidden), get open() { return !el.hidden; } };
}
