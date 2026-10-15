// ステージ一覧（§4.2）
import * as state from "../state.js";
import { show } from "../router.js";
import { h, coinBadge, toast, starsText } from "../ui.js";
import { GENRES, LEVELS } from "../data/genres.js";
import { stageFor } from "../data/stages/index.js";

let badge = null;

function shake(card) {
  card.classList.remove("shake");
  void card.offsetWidth;
  card.classList.add("shake");
}

export default {
  el: "screen-stages",
  mount(el, params = {}) {
    badge = coinBadge();
    el.append(
      h(
        "header.topbar",
        {},
        h("button.btn.small", { type: "button", onclick: () => show("title"), "aria-label": "タイトルへ もどる" }, "← もどる"),
        h("h1.topbar-title", {}, "ステージ いちらん"),
        h("div.topbar-right", {}, badge, h("button.btn.small", { type: "button", onclick: () => show("settings", { back: "stages" }) }, "⚙ せってい"))
      )
    );
    const list = h("main.genre-list");
    for (const g of GENRES) {
      let starSum = 0;
      const cards = LEVELS.map(({ level, name, color }) => {
        const stage = stageFor(g.key, level);
        const rec = state.stageRec(`${g.key}-${level}`);
        starSum += rec.stars || 0;
        const unlocked = state.isUnlocked(g.key, level);
        const ready = !!stage;
        let status;
        let icon;
        if (!ready) {
          status = "じゅんびちゅう";
          icon = "🚧";
        } else if (!unlocked) {
          status = "ロック中";
          icon = "🔒";
        } else if (rec.cleared) {
          status = "クリア済";
          icon = "✔";
        } else {
          status = "挑戦できる";
          icon = "▶";
        }
        const card = h(
          `button.stage-card${!ready ? ".not-ready" : ""}${ready && !unlocked ? ".locked" : ""}${rec.cleared ? ".cleared" : ""}`,
          {
            type: "button",
            style: { "--lv": color },
            "aria-label": `${g.name} レベル${level} ${name} ${stage ? stage.title : ""} ${status} ${rec.stars ? "星" + rec.stars : ""}`,
            "aria-disabled": !ready || !unlocked ? "true" : "false",
          },
          h("span.lv-badge", {}, `Lv${level}`),
          h("span.lv-name", {}, `${"★".repeat(level)}${"☆".repeat(5 - level)} ${name}`),
          h("span.card-title", {}, stage ? stage.title : "じゅんびちゅう"),
          h("span.card-stars", { "aria-hidden": "true" }, ready ? starsText(rec.stars || 0) : ""),
          h("span.card-status", {}, h("span.icon", { "aria-hidden": "true" }, icon), status)
        );
        card.addEventListener("click", () => {
          if (!ready) {
            shake(card);
            toast("このステージは じゅんびちゅう です");
            return;
          }
          if (!unlocked) {
            shake(card);
            return;
          }
          show("quiz", { id: stage.id });
        });
        if (params.focus === `${g.key}-${level}`) setTimeout(() => card.focus(), 0);
        return card;
      });
      list.append(
        h(
          "section.genre",
          { "aria-label": g.name },
          h(
            "h2.genre-head",
            {},
            h("span.genre-num", {}, g.num),
            h("span.genre-name", {}, g.name),
            h("span.genre-stars", { title: "ジャンル内の星合計" }, `★ ${starSum} / 15`)
          ),
          h("p.genre-desc", {}, g.desc),
          h("div.card-row", {}, ...cards)
        )
      );
    }
    el.append(list);
  },
  unmount() {
    if (badge && badge._off) badge._off();
    badge = null;
  },
  onKey(e) {
    if (e.key === "Escape") show("title");
  },
};
