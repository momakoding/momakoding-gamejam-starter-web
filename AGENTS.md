# AGENTS.md

Project conventions **and shared codebase state** for AI coding agents working on
`momakoding-jam-starter-web` — a Vue 3 + Phaser 4 + TypeScript Game Jam starter.

> **Multi-agent source of truth.** Sections 1–12 are the *rules*. Section **13 (Codebase State)** is the *living map* of everything that currently exists in `src/`. Any agent that adds, moves, renames, or deletes code **must** update §13 in the same turn, and append one line to §14 (Change Log). Stale registries silently break collaboration; outdated entries are worse than none.

---

## 0. Multi-agent collaboration protocol

### The contract

1. **Before coding**, skim §1–§12 once per session, then read the §13 subsection(s) relevant to your task.
2. **While coding**, treat §13 tables as the authoritative list. If you need a new scene key / event / asset key / route / store, register it in §13 **before** wiring it up so other agents don't collide.
3. **After coding**, do all of:
   - Update the affected §13 table(s).
   - Bump `Last updated` in each touched subsection to today's date.
   - Append a single-line entry to §14 (Change Log) with date, area, summary.
   - If you introduced a non-obvious trade-off (physics engine swap, asset pipeline change, etc.), add a row to §13.10 (Decision Log). Never silently re-decide past choices.

### Conflict-avoidance rules

- **Namespaces are unique.** Scene keys, event keys, asset keys, and route paths must be unique globally. Check §13.3 / §13.5 / §13.6 / §13.2 before adding.
- **One owner per feature.** When you start a multi-turn feature, add a `WIP` row to §13.9 with owner = your session id / agent name / date. When done, remove or mark `DONE`.
- **No silent deletes.** If you delete code, move the registry row to a `~~strikethrough~~` line at the end of the table rather than removing it, so reviewers see history.
- **No duplication of source-of-truth values.** Registries point to files; actual values (magic numbers, event names) live in TypeScript `as const` objects. If you find a mismatch, the code wins and §13 must be corrected.
- **Atomic updates.** One feature → one coherent §13 + §14 edit. Don't batch unrelated refactors into the same doc patch.

### Read-before-write checklist (copy into your plan)

- [ ] Read §13.1 (directory map) to locate the right folder.
- [ ] Read the registry table(s) for the layer I'm touching (scenes? events? assets?).
- [ ] Confirm my new keys don't already exist.
- [ ] Confirm nothing in §13.9 (WIP) is already claiming this area.

---

## 1. Role & Context

You are an smart AI developer proficient in **Phaser 4**, **Vue 3 (Composition API)**, and **TypeScript**. Refer to the Phaser.js skill when needed. The mission is rapid prototyping for a Game Jam ("Vibe Coding"): prioritize **development velocity and instant feedback** while keeping code readable and type-safe.

The current `src/pages/game-demo/` is a **reference implementation** (platformer with stars) intentionally kept small and well-commented. It **will be deleted and replaced** by the actual game once the jam starts. Use it as a pattern library; do not treat its gameplay as permanent.

---

## 2. Tech Stack (hard constraints)

| Layer | Choice | Notes |
|---|---|---|
| UI framework | Vue 3 SFC, `<script setup lang="ts">` | No Options API |
| Game engine | Phaser **4** (Arcade physics by default) | `phaser@^4.0.0` in `package.json` |
| Language | Strict TypeScript | `any` is forbidden |
| Bundler | Vite 8 | `@` alias → `./src` (see `vite.config.ts`) |
| Styling | Tailwind CSS **v4** (`@tailwindcss/vite`) + `tw-animate-css` | Atomic-first; see §10 |
| Routing | `vue-router@4` with `createWebHashHistory` | Routes in `src/router/index.ts` |
| State | `ref` / `reactive` for UI; Pinia (+ persisted-state plugin) for cross-page state; Phaser `Registry` or EventBus for Game ↔ UI | See §13.8 |
| Icons | `lucide-vue-next` | Already installed |
| Utilities | `@vueuse/core`, `tailwind-merge`, `animate.css` | Already installed |

**Do not add new top-level dependencies without appending a §13.10 decision log row.**

---

## 3. Architecture overview

```
┌──────────────── Vue SPA (router + HUD) ────────────────┐
│  Pages: home, how-to-play, about-us, game              │
│                                                        │
│  /game ─► game.vue   (pause overlay / ESC / exit)      │
│           └─ <GameHost/>   (mounts Phaser.Game)        │
│                └─ Phaser.Game                          │
│                    ├─ BootScene   (load assets)        │
│                    └─ GameScene   (actual gameplay)    │
└────────────────────────────────────────────────────────┘
           ▲                                    │
           └──────── eventBus (emit/on) ────────┘
```

- **Vue owns**: routing, menus, HUDs, overlays (pause, game-over, settings), DOM events outside the canvas.
- **Phaser owns**: render loop, physics, collisions, keyboard/gamepad input for gameplay, timers inside a scene, scene transitions.
- **EventBus** (`src/pages/game-demo/event-bus.ts` → will move to `src/core/event-bus.ts` once the real game lands; see §13.10) is the *only* channel between the two worlds.

---

## 4. Phaser + TS integration rules

- Scenes are **classes** extending `Phaser.Scene`, one class per file, filename `kebab-case`.
- Every scene member is **typed**. Use `!` (definite assignment) only for fields initialized in `create()`.
- Every scene with non-trivial init data defines an interface: `init(data: ISceneData): void`.
- Every scene ships with a `private debug = false` flag that, when true, calls `this.physics.world.createDebugGraphic()` and/or logs state.
- Lifecycle hygiene:
  - Register EventBus listeners in `create()`.
  - Unregister them in a `this.events.on('shutdown', …)` handler.
  - Never rely on garbage collection to detach listeners.
- Prefer **Arcade physics** unless a feature genuinely needs Matter; swapping engines mid-project requires a §13.10 decision log entry.
- Use `Phaser.Types.Physics.Arcade.ArcadePhysicsCallback` for collider/overlap handlers to keep them typed.

---

## 5. Vibe-coding execution strategy

- **Iterate on feel, not on architecture.** When the human says "make the jump lighter", tweak `GRAVITY` / `PLAYER_JUMP` in `constants.ts` — don't refactor (unless they say so).
- **Function composition over deep class hierarchies** for game entities. Small helpers in `src/core/` are preferred to a `BaseEntity` abstract class.
- **Placeholder graphics are a feature, not a stopgap.** If art is missing, use `Phaser.GameObjects.Graphics.generateTexture()` (see `boot-scene.ts`). Ship logic first.
- **Debuggable by default.** Every new scene exposes the `debug` flag. Every new entity logs its key state when `debug` is on.
- **Ship runnable modules.** Prefer one working slice end-to-end over multiple half-wired subsystems.

---

## 6. Code standards

- **Strict UI separation.** Vue components render HUD / menus / overlays **only**. No gameplay decisions inside `.vue`.
- **EventBus is canonical.** All Vue ↔ Phaser messaging goes through the singleton. Raw `window` events are forbidden for game state.
- **Asset keys are constants.** String literals for textures / audio / scenes must not appear outside the `as const` objects in `constants.ts`.
- **Loop hygiene.** Avoid heavy logic in `Scene.update()`. Delegate to each entity's own `update(time, delta)` method and iterate a group.
- **Object pools** for anything spawned repeatedly (bullets, particles, enemies waves). Reuse via `group.get()` / `setActive(false).setVisible(false)`.
- **Typed events.** When an EventBus payload becomes non-trivial, add a type to §13.7 and use it at both ends.
- **No `var`.** Always `const`, `let` only when reassignment is real.

---

## 7. Forbidden

- `var`.
- `any`. Use `unknown` + narrowing, or define a real type.
- Direct DOM manipulation outside the Vue / Phaser boundary.
- Creating or destroying Phaser objects inside tight loops without an object pool.
- Dumping long low-level implementation details unless the human explicitly asks — ship a runnable module first.
- **Running the project yourself after finishing a task — the user runs it.** (Exception: the user may explicitly ask you to start the dev server; when they do, run it in the background so the tool call doesn't block.)
- Adding new dependencies without a §13.10 decision entry.
- Silent renames of exported symbols, scene keys, event keys, asset keys, or routes.

---

## 8. Interaction protocol

- Before adding a feature, check whether it conflicts with the currently active physics engine (Arcade vs Matter) and with anything listed in §13.9 (WIP).
- When the human describes a **feel / vibe** (e.g. "jump feels floaty", "feel more desperate"), translate it directly into tunable numbers — gravity, velocity, damping, easing curve, camera lerp, screen-shake amplitude — don't over-engineer.
- When asked to research or explain, do not edit code.
- When asked to implement, follow the Read-before-write checklist in §0.

---

## 9. Naming

- **Files**: `kebab-case` (e.g. `player-entity.ts`, `game-hud.vue`).
- **Component references** in `<template>` / `<script>`: `PascalCase` (e.g. `import GameHud from './game-hud.vue'` → `<GameHud />`).
- **Scene classes**: `PascalCase` + `Scene` suffix (e.g. `GameScene`, `BootScene`, `GameOverScene`).
- **Scene keys**: `PascalCase` string matching the class name (`'GameScene'`).
- **Event keys**: `snake:colon` (e.g. `'score:update'`, `'player:died'`) — namespace:verb.
- **Asset keys**: `kebab-case` noun (e.g. `'player'`, `'enemy-goblin'`, `'bgm-level-1'`).
- **Routes**: `kebab-case` (`/how-to-play`).
- **Constants**: `UPPER_SNAKE_CASE` inside `as const` objects.

---

## 10. CSS (Tailwind CSS v4)

### Atomic-first

- Write utilities directly in templates.
- Reach for `@apply` inside `<style scoped>` only when the **same** complex combination repeats across multiple elements within the same component. Avoid premature abstraction.
- In scoped blocks that use `@apply`, start with `@reference "@/style.css";` so v4 can resolve theme tokens. See `App.vue` and `components/game-button.vue`.

### Theme tokens

- Shared colors and tokens live in `src/style.css` under `@theme { … }` (v4 idiom). Examples: `--color-game-border`, `--color-scrollbar-thumb`.
- Component-level color roles (player, enemy, danger) should be added to `@theme` when reused across ≥ 2 components.

### Custom classes

- Custom class names follow **BEM** (`game-button`, `game-button--primary`, `game-button--secondary`).
- Declare reusable custom utilities with `@utility` in `style.css` before `@apply`-ing them elsewhere (v4 rule).

---

## 11. Component organization

The project is split into four non-overlapping layers. **Import direction is one-way: `pages → runtime/contents → engine`.**

分层的判据是**"另一个 Phaser jam 游戏能不能复用"**，而不是"是否引用 Phaser"：engine/ 和 contents/ 都允许 import Phaser，只是抽象层级不同。

- `src/engine/` — **引擎层**。UI 无关、**具体游戏**无关的 Phaser 薄封装（`GameShell`、`GameEventBus`、`SHELL_DEFAULTS`、`EventCallback`）。换游戏不改。**不 import 任何项目内模块**。
- `src/contents/` — **游戏内容层**。UI 无关、**与 Phaser 耦合**（scenes 继承 `Phaser.Scene`、用 physics/input）但与 Vue/DOM 解耦的游戏世界：`constants.ts` 场景/事件/数值、`types.ts`、`scenes/`、未来的 `entities/`、`systems/`、`data/`。全项目**唯一**的 SCENE_KEYS / EVENT_KEYS / GAME_CONFIG 源头。
- `src/runtime/` — **运行时胶水层**。Vue 侧模块级单例（`useGame()` / `useEventBus()`），把 engine 的类实例包装成应用生命周期内的全局服务。不持有游戏数据。
- `src/composables/` — **真·Vue composables**。`useXxx()` 返回 `Ref` / `Reactive` 或依赖组件生命周期的 hook；不是 `useXxx()` 的单例服务请放到 `runtime/`。
- `src/components/` — 全局可复用的 UI 原语（按钮、标签、面板、HUD widget）。
- `src/pages/` — 路由级组件。page 变复杂时，按 page 名建子目录（`pages/game-demo/` 即示例）。
- All `props` typed with TypeScript; all events typed with `defineEmits<...>()`.

**依赖方向禁忌：**
- `engine/` 不能 import `contents/` / `runtime/` / `pages/`。
- `contents/` 不能 import `pages/`（但可以 import `engine/` 和 `runtime/`）。
- 出现反向依赖说明分层错了。

**`runtime/` → `contents/` 必须走深路径。** runtime 文件只能写 `import ... from "@/contents/constants"` / `"@/contents/types"`，**禁止走 `@/contents` 桶导出**。原因：`contents/scenes/*` 顶层有 `const eventBus = useEventBus()` / `const game = useGame()` 这类模块副作用，经 `@/contents` 桶会把 scenes 顺带加载进来；而 scenes 又反向 import `@/runtime`，于是 runtime 尚未初始化完成时 scenes 已经在调 `useGame()`，触发 ES 模块循环启动。现用范例：`src/runtime/game.ts`。

---

## 12. Tailwind v4 gotchas (quick reference)

1. **Opacity syntax changed.** `bg-opacity-*` / `text-opacity-*` are gone. Use `bg-white/50`, `text-gray-500/80`, or generic `opacity-*`.
2. **`@reference` + `@` alias.** Ensure `vite.config.ts` defines the `@` alias (already configured). Inside scoped styles that `@apply` project utilities, add `@reference "@/style.css";` at the top.
3. **`@apply` on custom classes.** Declare the class with `@utility` in `style.css` first.
4. **`tailwindcss-animate`** is not installed; `tw-animate-css` (already imported in `style.css`) covers most animation needs. If you need `animate-in` / `fade-in` v4-style classes, add `@plugin "tailwindcss-animate";` to `style.css` and install the package (document it in §13.10).
5. **`@tailwindcss/typography`** (`prose` classes) is not installed. Add it the same way if needed.
6. **Long words / i18n** (only if the game ships multiple languages): prefer `flex-wrap`, `min-w-0`, `break-words`; use `truncate` only when a single line is truly required.

Full troubleshooting catalog: `.clinerules/02-trouble-shoot.md`.

---

# 13. Codebase State (living registry)

> Update discipline: every row below must point to a real file/symbol in `src/`. If you rename or delete it, update the row *in the same turn*. Do not remove rows — mark them `~~deprecated~~` at the bottom of the table.

**Current scaffold status:** *"Neon Hunter" — top-down arena survival shooter. Playable end-to-end: waves, XP / level-up with upgrade picks, 4 enemy types + boss, procedural sprites, Web Audio SFX, game-over & high score.*
**Scaffold last updated:** 2026-04-26;11:08

---

## 13.1 Directory map

*Last updated: 2026-04-26;10:47*

```
momakoding-gamejam-starter-web/
├── .clinerules/               # Original Chinese project rules (source of AGENTS.md)
├── docs/
│   ├── game-demo.md           # Demo walkthrough (legacy; demo removed)
│   ├── phaser-study.md        # Phaser + Vue integration study (中文)
│   └── spec-framework.md      # UI framework spec
├── public/                    # Static assets served as-is
├── src/
│   ├── main.ts                # App entry: Pinia + persisted-state + Router
│   ├── App.vue                # Root shell (<RouterView/>)
│   ├── style.css              # Tailwind v4 entry + @theme tokens + scrollbar utilities
│   ├── router/
│   │   └── index.ts           # Hash-history routes
│   │
│   ├── engine/                # ① 引擎层 (UI 无关 + 游戏无关，不 import 任何项目模块)
│   │   ├── game-shell/
│   │   │   ├── game-shell.ts  # Phaser.Game 生命周期薄封装
│   │   │   ├── defaults.ts    # SHELL_DEFAULTS (engine 内部 fallback，不是游戏常量)
│   │   │   └── index.ts
│   │   ├── event-bus/
│   │   │   ├── event-bus.ts   # GameEventBus (Map+Set 实现)
│   │   │   └── index.ts
│   │   ├── types.ts           # EventCallback 等引擎级类型
│   │   └── index.ts
│   │
│   ├── contents/              # ② 游戏内容层 (UI 无关，与 Phaser 耦合，但换 UI 不改)
│   │   ├── constants.ts       # ★ SCENE_KEYS / EVENT_KEYS / TEXTURE_KEYS / WORLD / PLAYER_BASE / ENEMY_STATS / PROGRESSION / DIFFICULTY / WAVE_UNLOCKS
│   │   ├── types.ts           # IGameSceneData / IHudState / ILevelUpPayload / IUpgradeOption / IGameOverPayload / UpgradeId / EnemyKind
│   │   ├── scenes/
│   │   │   ├── boot-scene.ts  # 程序化生成全部纹理 + 进度条 → GameScene
│   │   │   ├── game-scene.ts  # 主游戏场景：波次 / 升级 / 碰撞 / HUD 广播
│   │   │   └── index.ts
│   │   ├── entities/
│   │   │   ├── player.ts      # Player (WASD + 鼠标瞄准 + 冲刺 + 射击 + 升级应用)
│   │   │   ├── enemy.ts       # Enemy (GRUNT/RUNNER/SHOOTER/TANK/BOSS 五合一 kind)
│   │   │   ├── bullet.ts      # Bullet (玩家/敌人共用，支持穿透)
│   │   │   ├── xp-gem.ts      # XpGem + HealthPickup (掉落 + 磁吸)
│   │   │   └── index.ts
│   │   ├── systems/
│   │   │   ├── audio-system.ts    # AudioSystem (Web Audio 合成 SFX，无文件)
│   │   │   ├── wave-system.ts     # WaveSystem (难度曲线 + 刷怪节奏 + boss 波)
│   │   │   ├── upgrade-system.ts  # UPGRADE_POOL + pickUpgrades (加权随机)
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── runtime/               # ③ 运行时胶水层 (Vue 侧模块级单例)
│   │   ├── event-bus.ts       # useEventBus() 单例
│   │   ├── game.ts            # useGame() 单例 (包装 GameShell)
│   │   └── index.ts
│   │
│   ├── composables/           # ④ 真·Vue composables (暂空)
│   │   └── index.ts
│   │
│   ├── components/
│   │   └── game-button.vue    # BEM-styled button, primary/secondary variants
│   │
│   └── pages/
│       ├── home-page.vue          # Title + menu (NEON HUNTER 品牌化)
│       ├── how-to-play.vue        # 操作说明 + 生存要点
│       ├── about-us.vue           # Credits
│       └── game/
│           ├── index.vue              # 顶层：协调 HUD / overlay / 键鼠 ↔ EventBus
│           ├── game-canvas.vue        # Phaser 画布挂载点（唯一调 initGame/destroyGame）
│           ├── game-hud.vue           # HP / 波次 / 等级+XP / 分数 / 击杀 / 冲刺 CD / 静音
│           ├── level-up-overlay.vue   # 升级时的三选一卡片
│           ├── pause-overlay.vue      # ESC 暂停面板
│           └── game-over-overlay.vue  # 死亡结算 + 高分 + 重来/回主页
├── AGENTS.md                  # ← this file
├── README.md
├── index.html
├── package.json
├── vite.config.ts             # @ alias → ./src ; vue + tailwind plugins
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
└── pnpm-lock.yaml
```

`composables/` 目前是空 stub；新的 `useXxx()` hook（返回 `Ref` 或依赖组件生命周期）放这里，全局单例服务放 `runtime/`。

---

## 13.2 Routes

*Last updated: 2026-04-26;10:47. Source of truth: `src/router/index.ts`.*

| Path | Name | Component | Purpose |
|---|---|---|---|
| `/` | `home` | `pages/home-page.vue` | NEON HUNTER 主菜单 |
| `/how-to-play` | `how-to-play` | `pages/how-to-play.vue` | 操作 + 生存要点 |
| `/about-us` | `about-us` | `pages/about-us.vue` | Credits |
| `/game` | `game` | `pages/game/index.vue` | Game host：Phaser 画布 + HUD + 升级/暂停/结算 overlay |

History mode: **hash** (`createWebHashHistory`).

---

## 13.3 Phaser scenes

*Last updated: 2026-04-26;10:47. Source of truth: `src/contents/scenes/` and `src/contents/constants.ts` → `SCENE_KEYS`.*

| Key (string) | Class | File | Role | Init data |
|---|---|---|---|---|
| `BootScene` | `BootScene` | `src/contents/scenes/boot-scene.ts` | `scale.resize(WORLD)` + 程序化生成所有纹理 + 初始化 AudioSystem → 延迟 250ms 切到 `GameScene` | none |
| `GameScene` | `GameScene` | `src/contents/scenes/game-scene.ts` | 竞技场生存：玩家 / 敌人组 / 弹丸组 / XP / 波次 / 升级 / HUD 广播 / 死亡结算 | `IGameSceneData = { startScore?: number }` |

场景装载顺序在 `src/pages/game/game-canvas.vue` → `useGame().initGame(container, BootScene)` + `addScene(GameScene)`。`GameScene` 不是路由的一级，而是 `BootScene.create()` 里 `game.switchToScene(SCENE_KEYS.GAME)` 触发。

---

## 13.4 Game entities

*Last updated: 2026-04-26;10:47. Source of truth: `src/contents/entities/` + `src/contents/scenes/game-scene.ts`.*

| Entity | Class / Type | Texture key(s) | Defined in | Notes |
|---|---|---|---|---|
| Player | `Player extends Phaser.Physics.Arcade.Sprite` | `player` + `player-gun` + `muzzle-flash` | `entities/player.ts` | WASD + 方向键；**自动瞄准最近敌人 + 自动开火**（`IPlayerDeps.getNearestEnemy` 由 `GameScene.findNearestEnemy` 注入）；SPACE 冲刺（带 i-frame + 冷却）；`applyUpgrade(id)` 消费 `UpgradeId`；body = 圆 `PLAYER_BASE.BODY_RADIUS`；相机 `startFollow` + deadzone |
| Enemies (group) | `Phaser.Physics.Arcade.Group { classType: Enemy, maxSize: 80 }` | `enemy-grunt` / `enemy-runner` / `enemy-shooter` / `enemy-tank` / `enemy-boss` | `entities/enemy.ts` | 五合一 `kind: EnemyKind`；`spawn(x,y,kind,wave)` 应用随波次缩放（HP/SPEED/DAMAGE）；Shooter 保持距离 + 周期射；Boss 扇形弹幕 |
| Player bullets | `Phaser.Physics.Arcade.Group { classType: Bullet, maxSize: 120 }` | `bullet-player` | `entities/bullet.ts` | `Bullet.fire(...)`；`pierceLeft` 计数；用 `hitEnemyIds: Set<number>` 防止单发反复命中同一敌人（euid 标记） |
| Enemy bullets | `Phaser.Physics.Arcade.Group { classType: Bullet, maxSize: 80 }` | `bullet-enemy` | `entities/bullet.ts` | 与玩家弹共用 `Bullet` 类，`isPlayerBullet=false` 区分碰撞 |
| XP gems | `Phaser.Physics.Arcade.Group { classType: XpGem, maxSize: 300 }` | `xp-gem` | `entities/xp-gem.ts` | 落地→静置→进入 `pickupRadius` 被磁吸向玩家；吸附时解除 drag，速度随距离缩放 |
| Health pickups | `Phaser.Physics.Arcade.Group { classType: HealthPickup, maxSize: 20 }` | `health-pickup` | `entities/xp-gem.ts` | 低概率掉落（`HEALTH_DROP_CHANCE`）；Boss 必掉 |
| Ground tile | `Phaser.GameObjects.TileSprite` | `ground-tile` | `GameScene.create` | 铺满 `ARENA` 的网格深蓝底；随相机 `scrollX/Y * 0.2` 视差 |
| Arena border | `Phaser.GameObjects.Graphics` | — | `GameScene.create` | 双层青光描边 |
| Particles | `this.add.particles(...)` ad-hoc | `particle` | `GameScene.spawnExplosion` / `spawnHitSparks` | 一次性 `explode()`，800ms 后 destroy；Boss 死亡粒子更大更多 |
| Vignette | `Phaser.GameObjects.Graphics` | — | `GameScene.drawVignette` | 固定于相机 (`setScrollFactor(0)`)，多层透明描边模拟暗角 |

Collisions wired (via `this.physics.add.overlap`):
- `playerBullets ↔ enemies` → `onBulletHitEnemy` (伤害 + 粒子 + 穿透计数)
- `enemyBullets ↔ player` → `onEnemyBulletHitPlayer`
- `player ↔ enemies` → `onPlayerHitEnemy` (接触伤害 + 回弹)
- `player ↔ xpGems` → `onCollectXp` (升级循环)
- `player ↔ healthPickups` → `onCollectHealth`

---

## 13.5 EventBus events

*Last updated: 2026-04-26;10:47. Source of truth: `src/contents/constants.ts` → `EVENT_KEYS`. Bus implementation: `src/engine/event-bus/event-bus.ts` (runtime singleton at `src/runtime/event-bus.ts`).*

| Key constant | String | Direction | Payload | Emitted by | Listened by |
|---|---|---|---|---|---|
| `HUD_UPDATE` | `hud:update` | Phaser → Vue | `IHudState` (hp/maxHp/score/wave/level/xp/xpToNext/weaponLabel/elapsedMs/kills/dashReadyAt/now) | `GameScene.broadcastHud` (节流 120ms + 关键事件 force) | `pages/game/index.vue` `onHudUpdate` |
| `LEVEL_UP` | `level:up` | Phaser → Vue | `ILevelUpPayload` ({ newLevel, choices: IUpgradeOption[] }) | `GameScene.triggerLevelUp` | `pages/game/index.vue` → `LevelUpOverlay` |
| `WAVE_START` | `wave:start` | Phaser → Vue | `number` (wave) | `WaveSystem.onWaveStart` → `GameScene` | `pages/game/index.vue`（触发 `GameHud` flash） |
| `WAVE_CLEARED` | `wave:cleared` | Phaser → Vue | `number` (wave) | `WaveSystem.onWaveCleared` → `GameScene` | *(reserved — 现仅用于 audio `playWaveClear`)* |
| `GAME_OVER` | `game:over` | Phaser → Vue | `IGameOverPayload` | `GameScene.handlePlayerDeath` (900ms 延迟发) | `pages/game/index.vue` → `GameOverOverlay` |
| `UPGRADE_SELECTED` | `upgrade:selected` | Vue → Phaser | `UpgradeId` | `pages/game/index.vue` `onPickUpgrade` | `GameScene.handleUpgradeSelected` (应用升级 + `physics.world.resume`) |
| `GAME_RESTART` | `game:restart` | Vue → Phaser | *(none)* | `pages/game/index.vue` `restartGame` | `GameScene.handleRestart` (`scene.restart`) |
| `GAME_PAUSE` | `game:pause` | Vue → Phaser | *(none)* | `pages/game/index.vue` `pauseGame` / ESC | `GameScene.handlePause` (`scene.pause`) |
| `GAME_RESUME` | `game:resume` | Vue → Phaser | *(none)* | `pages/game/index.vue` `resumeGame` / ESC | `GameScene.handleResume` (`scene.resume`) |
| `TOGGLE_MUTE` | `audio:toggle-mute` | Vue → Phaser | *(none)* | `pages/game/index.vue` `onToggleMute`（右下静音按钮） | `GameScene.handleToggleMute` → `AudioSystem.toggleMute` |

**Rule:** new events are added to `EVENT_KEYS` first, then to the table above, then wired. Non-trivial payloads MUST have a named interface in `contents/types.ts`.

---

## 13.6 Asset keys

*Last updated: 2026-04-26;10:47. Source of truth: `src/contents/constants.ts` → `TEXTURE_KEYS` + `src/contents/scenes/boot-scene.ts` (all generators).*

All textures are generated at runtime via `graphics.generateTexture` — no files in `public/`. When real art lands, move the loader calls into `BootScene.preload()`, keep the same `TEXTURE_KEYS.*` values, and drop the generator code.

| Constant | String | Size | Generated by | Used by |
|---|---|---|---|---|
| `PLAYER` | `player` | 28×36 | `BootScene.generatePlayerTextures` (主角 + 头盔 + 面罩) | `Player` 主体 |
| — (枪) | `player-gun` | 22×8 | 同上（独立贴图便于跟鼠标旋转） | `Player.gunSprite` |
| `BULLET_PLAYER` | `bullet-player` | 14×8 | `generateBulletTextures`（青色流线） | `Bullet` 玩家弹 |
| `BULLET_ENEMY` | `bullet-enemy` | 14×8 | `generateBulletTextures`（橙红色） | `Bullet` 敌方弹 |
| `ENEMY_GRUNT` | `enemy-grunt` | 30×30 | `generateEnemyTextures`（矮胖绿僵尸） | `Enemy` kind=GRUNT |
| `ENEMY_RUNNER` | `enemy-runner` | 26×32 | 同上（瘦长红） | `Enemy` kind=RUNNER |
| `ENEMY_SHOOTER` | `enemy-shooter` | 28×34 | 同上（紫袍 + 法杖） | `Enemy` kind=SHOOTER |
| `ENEMY_TANK` | `enemy-tank` | 48×46 | 同上（橙巨型 + 尖刺） | `Enemy` kind=TANK |
| `ENEMY_BOSS` | `enemy-boss` | 90×90 | 同上（粉色六臂 + 外光晕） | `Enemy` kind=BOSS |
| `XP_GEM` | `xp-gem` | 12×12 | `generateXpGemTexture`（蓝钻石） | `XpGem` |
| `HEALTH_PICKUP` | `health-pickup` | 18×18 | `generateHealthPickupTexture`（红十字胶囊） | `HealthPickup` |
| `PARTICLE` | `particle` | 8×8 | `generateParticleTexture`（发光圆点） | `spawnExplosion` / `spawnHitSparks` 的 particle emitter |
| `MUZZLE_FLASH` | `muzzle-flash` | 16×12 | `generateMuzzleFlashTexture`（黄色扇形） | `Player.muzzleFlash` |
| `GROUND_TILE` | `ground-tile` | 64×64 | `generateGroundTileTexture`（网格深蓝） | `GameScene.ground` tileSprite |

No audio keys — SFX are synthesized at call-time via Web Audio in `systems/audio-system.ts`, no `this.load.audio` at all.

---

## 13.7 Shared TypeScript types / interfaces

*Last updated: 2026-04-26;10:47. All content-layer types live in `src/contents/types.ts` (unless noted).*

| Symbol | Defined in | Used by | Purpose |
|---|---|---|---|
| `IGameSceneData` | `contents/types.ts` | `GameScene.init` | Scene startup params (`startScore?`) |
| `IHudState` | `contents/types.ts` | `GameScene.broadcastHud` → `pages/game/game-hud.vue` | HUD 全量状态（hp/maxHp/score/wave/level/xp/xpToNext/weaponLabel/elapsedMs/kills/dashReadyAt/now） |
| `UpgradeId` | `contents/types.ts` | `Player.applyUpgrade` / `upgrade-system.ts` / `LevelUpOverlay` | 10 种升级的联合字符串字面量 |
| `IUpgradeOption` | `contents/types.ts` | `ILevelUpPayload.choices` + `LevelUpOverlay` | 单个升级卡片（id/title/description/tier/icon） |
| `ILevelUpPayload` | `contents/types.ts` | `EVENT_KEYS.LEVEL_UP` | `{ newLevel, choices: IUpgradeOption[] }` |
| `IGameOverPayload` | `contents/types.ts` | `EVENT_KEYS.GAME_OVER` | `{ finalScore, highScore, isNewHighScore, wave, level, kills, survivedMs }` |
| `EnemyKind` | `contents/constants.ts` | `Enemy.spawn` / `WaveSystem.pickEnemyKind` | `'GRUNT' \| 'RUNNER' \| 'SHOOTER' \| 'TANK' \| 'BOSS'` |
| `IUpgradeDef` | `contents/systems/upgrade-system.ts` | `UPGRADE_POOL` 内部 | `IUpgradeOption` + `weight` + `maxStacks` |
| `IPlayerDeps` | `contents/entities/player.ts` | `new Player(scene, x, y, deps)` | 注入 bullets 组 + `getNearestEnemy(x,y)` 目标查询 + 音效回调 |
| `IEnemyDeps` | `contents/entities/enemy.ts` | `Enemy.tick` | 注入 bullets 组 + player 位置 getter |
| `IWaveCallbacks` | `contents/systems/wave-system.ts` | `new WaveSystem(scene, cb)` | spawnEnemy / onWaveStart / onWaveCleared |
| `Props` (game-button) | `components/game-button.vue` | `<GameButton>` usage | `{ label, variant?: 'primary' \| 'secondary' }` |

When an EventBus payload becomes non-trivial, define a named type here and import it at both ends.

---

## 13.8 State stores

*Last updated: 2026-04-26;10:47.*

- **Pinia**: installed and mounted (`src/main.ts`), persisted-state plugin enabled. **No stores defined yet.** When you add one, create `src/stores/<name>-store.ts` and register it here.
- **Phaser Registry**: unused.
- **Vue reactive**: in-component `ref` / `reactive` only.
- **localStorage (direct)**: `GameScene` reads / writes high score under key `neon-hunter:high-score`. Decision to keep this direct (not through Pinia) — it's scene-owned persistence and survives restarts without coupling the Vue tree. If cross-page access is ever needed, promote to a Pinia store.

| Store / key | Location | Kind | Persisted? | Purpose |
|---|---|---|---|---|
| `neon-hunter:high-score` | `contents/scenes/game-scene.ts` (`loadHighScore` / `saveHighScore`) | `localStorage` (number string) | yes | 累计最高分；game-over 时读写 |

---

## 13.9 Work in progress (WIP)

*Claim an area before starting a multi-turn feature. Clear your row when done.*

| Owner | Area / files | Started | Notes |
|---|---|---|---|
| *(none)* | — | — | — |

---

## 13.10 Decision log (append-only)

Record non-obvious architectural choices so future agents don't re-litigate them.

| Date | Decision | Rationale |
|---|---|---|
| 2026-04-25;00:01 | Use Arcade physics (not Matter) as default | Simpler API, enough for 2D jam games; swap only if a feature requires it |
| 2026-04-25;00:01 | EventBus built on `EventTarget` (not mitt/EventEmitter) | Zero-dependency, browser-native, simple typing |
| 2026-04-25;00:01 | Placeholder textures generated via `graphics.generateTexture` | Lets gameplay ship before art; keys stay stable when real art replaces them |
| 2026-04-25;00:01 | Router uses hash history | Works for `file://` and static hosting without server config |
| 2026-04-25;00:01 | Pinia + persisted-state installed but unused | Reserved for real-game save data; no stub stores until needed |
| 2026-04-25;00:01 | `game-demo/` is reference-only and will be deleted | New game code should live at `src/pages/game/` (or similar) and import from `src/core/` — not extend the demo in place |
| 2026-04-26;01:20 | 分层重构：`core/` → `engine/`（引擎基建） + 新增 `contents/`（游戏内容层）+ `composables/runtime/` → `runtime/`（Vue 单例胶水） | `core` 名字暧昧、常量跟 shell 混在同一目录；现在四层职责正交：engine 换游戏不改、contents 换 UI 不改、runtime 仅做 Vue 胶水、pages 仅 UI。`GAME_CONFIG.WIDTH/HEIGHT` 从 shell 里拿掉，改为 `SHELL_DEFAULTS` 引擎内部兜底，彻底切断 engine → contents 的反向依赖 |
| 2026-04-26;01:20 | `createGameShell(container, initialScene)` 签名不接受 config 对象 | 避免 Java-style 构造参数爆炸；游戏要覆盖画幅/物理就在 `BootScene.init()` 里用 Phaser 原生 API（`this.scale.resize(...)`），shell 永远只管生命周期 |
| 2026-04-26;01:20 | `src/pages/game-demo/` 只保留 `index.vue`，场景/常量/event-bus 的副本全部清除 | Vue 侧"如何挂载一个 Phaser 游戏"是 page 层的职责；场景本身是游戏内容，住 `contents/`。单一事实源 |
| 2026-04-26;01:35 | `contents/` 的定位改成"UI 无关 + 与 Phaser 耦合"（原先误标为"引擎无关"） | scenes 继承 `Phaser.Scene`、用 physics/input，天然跟 Phaser 耦合。分层判据是"另一个 Phaser jam 游戏能不能复用"而不是"是否碰 Phaser"；engine 能复用、contents 不能复用，两边都可用 Phaser |
| 2026-04-26;01:35 | scenes 留在 `contents/scenes/`，不单拎为顶层 `src/scenes/` | scenes 高度依赖 `contents/constants` / `types` / 未来的 `entities`，拆开只会增加跨目录 import；jam 节奏下内容层向内生长（contents/entities, contents/systems）而不是向外膨胀 |
| 2026-04-26;01:35 | `runtime/` 引用 `contents/` 一律走深路径（`@/contents/constants` / `@/contents/types`），禁止走桶 | `contents/scenes/*` 顶层有 `useGame()` / `useEventBus()` 的模块级副作用；桶导出 `@/contents` 会把 scenes 拖进来，而 scenes 反向 import `@/runtime`，造成 runtime 初始化未完成时 scenes 已经在调 runtime → 循环启动死锁 |
| 2026-04-26;10:47 | 实际游戏 "Neon Hunter" 落地：`contents/` 扩展出 `entities/` + `systems/`；原 demo 级 `GAME_CONFIG` 被拆成 `WORLD` / `PLAYER_BASE` / `ENEMY_STATS` / `PROGRESSION` / `DIFFICULTY` / `WAVE_UNLOCKS` 等领域对象 | jam 节奏下把数字按"领域"聚类比按"平铺"好调；`ENEMY_STATS.GRUNT.speed` 这种读法一眼知道影响什么，"vibe coding" 调手感更快 |
| 2026-04-26;10:47 | SFX 全部用 Web Audio API 在运行时合成（`systems/audio-system.ts`），不走 `this.load.audio` | jam 起步阶段没有美术/音效素材；合成音既保证零资源依赖，又可以用单纯代码参数（envelope / freq ramp）即时迭代；首个 pointerdown 解锁 `AudioContext` 绕过浏览器 autoplay 策略 |
| 2026-04-26;10:47 | `Player` / `Enemy` 不用抽象基类，直接 `extends Phaser.Physics.Arcade.Sprite` + 依赖注入（`IPlayerDeps` / `IEnemyDeps`） | 避免"实体基类 → 中间层 → 具体类"的深继承；jam 下把构造依赖显式传入（bullets 组 / 音效回调）比继承更易改 |
| 2026-04-26;10:47 | 敌人五种形态共用一个 `Enemy` 类 + `kind: EnemyKind` 分支，不做 `class Grunt extends Enemy` | 差异主要在数值和 AI 片段（`maybeFire` / 保持距离 / 扇形弹幕）；一个类内 switch 在 100 行量级比 5 个子类更易对照调整，尤其是调手感时 |
| 2026-04-26;10:47 | 高分持久化用 `localStorage` 直写（`GameScene.loadHighScore/saveHighScore`），不建 Pinia store | 只有一个 number、只在 game-over 读写、不需要跨页面响应式共享；建 store 是过度工程。真要共享时再提升到 Pinia |
| 2026-04-26;10:47 | 页面结构：`pages/game/` 作为目录，拆成 `index.vue`（协调器）+ `game-canvas.vue`（唯一 Phaser 挂载点）+ HUD + 3 个 overlay | `game.vue` 单文件会塞下 HUD + 暂停 + 升级选择 + 死亡结算，500 行起步；拆成组件后每个文件 <200 行，overlay 之间互斥逻辑统一在协调器里用 `if` 挡 |
| 2026-04-26;10:47 | 升级时 `physics.world.pause()` 而不是 `scene.pause()` | `scene.pause()` 会冻结 `update` 循环，暂停 overlay 动画和事件循环都不跑；`physics.world.pause()` 只冻结物理积分，`update` 仍能响应"玩家点了选择"的事件并 resume |
| 2026-04-26;11:08 | 改为"survivor-style"自动射击：玩家只走位，枪自动锁定最近敌人并按冷却开火 | 降低操作门槛、单手手柄 / 触屏也能玩；更符合"在霓虹竞技场里活下去"的节奏——策略重心从"瞄准操作"转移到"走位 + 升级构筑"。实现用 `IPlayerDeps.getNearestEnemy` 注入查询回调，Player 自身不感知 enemies group，保持实体与场景解耦 |

---

## 14. Change log

One line per change that touches §13. Newest at the top. Keep it short.

- **2026-04-26;11:08** — 输入模型改为 survivor-style 自动射击：`IPlayerDeps` 新增 `getNearestEnemy(x,y)`，`GameScene` 注入 `findNearestEnemy`；Player 去掉 pointer 监听与 `firing` 状态，保留上一帧 `aimAngle` 以避免无敌人时枪口归零；how-to-play / home-page / in-game hint 移除鼠标操作字样。同步 §13.4 / §13.7 / §13.10。
- **2026-04-26;10:47** — "Neon Hunter" 生存射击落地：`contents/` 增 `entities/` + `systems/`；`constants` 拆分成 `WORLD` / `PLAYER_BASE` / `ENEMY_STATS` / `PROGRESSION` / `DIFFICULTY` / `WAVE_UNLOCKS` + `TEXTURE_KEYS`；`EVENT_KEYS` 扩展（HUD_UPDATE / LEVEL_UP / WAVE_START / WAVE_CLEARED / UPGRADE_SELECTED / TOGGLE_MUTE）；删除 `pages/game-demo/` + `pages/game.vue`，以 `pages/game/` 目录替代（index + canvas + HUD + 3 overlays）。高分走 `localStorage`（`neon-hunter:high-score`）。同步 §13.1–§13.8 / §13.10（6 条新决策）。
- **2026-04-26;01:35** — 修正 `contents/` 分层描述（"UI 无关 + 与 Phaser 耦合"，不是"引擎无关"）；确认 scenes 留在 `contents/scenes/` 不外拎；新增"runtime → contents 必须走深路径"规则到 §11；同步 §13.10 决策日志（三条新决策）。
- **2026-04-26;01:20** — 分层重构：`core` → `engine`；新增 `contents` 作为游戏内容层（场景/常量/类型的唯一源）；`composables/runtime` → `runtime`（提升到顶级）；`game-demo` 只保留 Vue 挂载示范。同步 §11 / §13.1 / §13.3 / §13.10；engine 不再依赖 `GAME_CONFIG`，改用内部 `SHELL_DEFAULTS`。
- **2026-04-25;00:01** — Initial AGENTS.md rewrite: removed Nuxt / PrimeVue / portal sections irrelevant to this project; added §13 Codebase State registries (routes, scenes, entities, events, assets, types, stores, WIP, decisions) and §0 multi-agent protocol.
