# Changelog

One line per change that touches `src/` or project structure. Newest at the top.

- **2026-04-28** — 重构 `pages/about-us.vue`：新增 Hero 标题区、团队卡片成员列表、游戏信息卡片（`needShowingIntro` 控制显隐）、全宽开源技术区（`MmkdStarterCredit` + 其他依赖列表）；升级 `components/mmkd-starter-credit.vue`（横排 header、GitHub 图标、amber 主题边框）。
- **2026-04-28** — Decision Log 和 Change Log 从 AGENTS.md 拆出为独立文件（`DECISION_LOG.md` / `CHANGELOG.md`）；更新 AGENTS.md §13.10 引用指向。
- **2026-04-28** — 新增 `src/components/mmkd-starter-credit.vue`（Momakoding 署名卡片）；重构 `pages/about-us.vue`（双列卡片布局，开源技术区独立卡片，引用 MmkdStarterCredit）；同步 AGENTS.md §13.1 / §13.7。
- **2026-04-26;01:35** — 修正 `contents/` 分层描述（"UI 无关 + 与 Phaser 耦合"，不是"引擎无关"）；确认 scenes 留在 `contents/scenes/` 不外拎；新增"runtime → contents 必须走深路径"规则到 §11；同步 §13.10 决策日志（三条新决策）。
- **2026-04-26;01:20** — 分层重构：`core` → `engine`；新增 `contents` 作为游戏内容层（场景/常量/类型的唯一源）；`composables/runtime` → `runtime`（提升到顶级）；`game-demo` 只保留 Vue 挂载示范。同步 §11 / §13.1 / §13.3 / §13.10；engine 不再依赖 `GAME_CONFIG`，改用内部 `SHELL_DEFAULTS`。
- **2026-04-25;00:01** — Initial AGENTS.md rewrite: removed Nuxt / PrimeVue / portal sections irrelevant to this project; added §13 Codebase State registries (routes, scenes, entities, events, assets, types, stores, WIP, decisions) and §0 multi-agent protocol.
