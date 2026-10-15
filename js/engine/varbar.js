// 変数一覧バー：フィールド上のボックスと同じ値・同じ色を表示（ボックスに入った瞬間に更新される）
import { colorFor } from "./parts.js";

export class VarBar {
  constructor(host) {
    this.host = host;
    this.key = "";
  }

  /** FieldView の見た目（vis）から描く。毎フレーム呼ばれても変化がなければ何もしない */
  update(view) {
    const stage = view.stage;
    const boxes = stage.field.boxes || [];
    const arrays = stage.field.arrays || [];
    const entries = [];
    for (const b of boxes) entries.push({ name: b.var, value: view.vis.boxes[b.var]?.value, color: colorFor(stage, b.var) });
    for (const a of arrays) {
      const cv = view.vis.cells[a.name];
      entries.push({ name: a.name, value: cv ? `[${cv.values.join(", ")}]` : "", color: colorFor(stage, a.name) });
    }
    const key = JSON.stringify(entries);
    if (key === this.key) return;
    this.key = key;
    this.host.hidden = entries.length === 0;
    this.host.innerHTML = "";
    for (const e of entries) {
      const chip = document.createElement("span");
      chip.className = "var-chip";
      chip.style.setProperty("--c", e.color);
      const n = document.createElement("b");
      n.textContent = e.name;
      const v = document.createElement("span");
      v.textContent = e.value === undefined || e.value === null ? "？" : String(e.value);
      chip.append(n, v);
      this.host.append(chip);
    }
  }
}
