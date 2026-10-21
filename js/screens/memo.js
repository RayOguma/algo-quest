// メモ：変数ごとの値の入力欄と、自由記入欄。ステージごとに保存する（問題画面の右側に出す）
import * as state from "../state.js";
import { h } from "../ui.js";
import { colorFor } from "../engine/parts.js";

/** 変数・配列の名前（ボックスの色の並び順） */
function varNames(stage) {
  const names = Object.keys(stage.varColors || {});
  for (const b of stage.field.boxes || []) {
    const name = b.label || b.var; // 再帰の階ごとの変数（n@2）は n として 1 つだけ
    if (!names.includes(name)) names.push(name);
  }
  for (const a of stage.field.arrays || []) if (!names.includes(a.name)) names.push(a.name);
  for (const s of [...(stage.field.stacks || []), ...(stage.field.queues || [])]) if (!names.includes(s.name)) names.push(s.name);
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
      placeholder: "例：3 → 5 → 4",
    });
    input.addEventListener("input", () => {
      m.vars[name] = input.value;
      save();
    });
    inputs.push(input);
    return h("div.memo-row", {}, h("label.var-inline.memo-name", { for: id, style: { "--c": colorFor(stage, name) } }, h("b", {}, name)), input);
  });
  const free = h("textarea.memo-free", { id: "memo-free", rows: 6, placeholder: "気づいたことや計算を自由に書こう" });
  free.value = m.free;
  free.addEventListener("input", () => {
    m.free = free.value;
    save();
  });
  const clearBtn = h("button.btn.small", { type: "button" }, "全部消す");
  clearBtn.addEventListener("click", () => {
    inputs.forEach((i) => (i.value = ""));
    free.value = "";
    m.vars = {};
    m.free = "";
    save();
  });
  const closeBtn = h("button.btn.small.memo-close", { type: "button", "aria-label": "メモを閉じる" }, "✕ 閉じる");
  const el = h(
    "aside.memo-panel",
    { "aria-label": "メモ", hidden: true },
    h("div.memo-head", {}, h("b", {}, "📝 メモ"), closeBtn),
    rows.length ? h("p.memo-sub", {}, "変数の値") : null,
    ...rows,
    h("label.memo-sub", { for: "memo-free" }, "自由メモ"),
    free,
    h("div.memo-foot", {}, h("small.muted", {}, "メモはこの問題ごとに保存されます"), clearBtn)
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
