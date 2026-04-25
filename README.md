# Momakoding Game Jam Starter

Game Jam 快速原型项目，基于 Vue 3 + Phaser 4 + Tailwind CSS 4 构建。

## 技术栈

- Vue 3 (Composition API, `<script setup lang="ts">`)
- Phaser 4 (Arcade 物理引擎)
- Vue Router 4
- Tailwind CSS 4
- Pinia (预留)
- TypeScript 严格模式
- Vite 8

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 项目结构

```
.
├── docs/                       # 项目文档
│   ├── spec-framework.md       # UI/工程框架规格说明
│   ├── game-demo.md            # Phaser Demo 使用与结构说明
│   └── phaser-study.md         # Phaser + Vue 集成学习拆解
├── public/                     # 静态资源（原样拷贝）
│   ├── favicon.svg
│   ├── icons.svg
│   └── logo.png
│
src/
├── main.ts                    # 应用入口
├── App.vue                    # 根组件
├── style.css                  # Tailwind 全局样式入口
├── assets/                    # 由 Vite 处理的图片/静态素材
│
├── pages/                     # 页面组件
│   ├── home-page.vue          # 首页：标题 + 菜单按钮
│   ├── how-to-play.vue        # 玩法介绍
│   ├── about-us.vue           # 关于我们
│   ├── game.vue               # 游戏容器（暂停/恢复/退出管理）
│   └── game-demo/             # ⭐ Phaser Demo（独立文件夹，可整体删除）
│       ├── index.vue           # Phaser 画布 + HUD
│       ├── constants.ts        # 常量定义
│       ├── event-bus.ts        # Phaser ↔ Vue 事件总线
│       └── scenes/
│           ├── boot-scene.ts   # 资源加载（占位图形）
│           └── game-scene.ts   # 主游戏逻辑
│
├── components/                # 可复用 UI 组件
│   └── game-button.vue
│
├── composables/               # 组合式函数
│   ├── index.ts                # 统一导出
│   └── runtime/                # 运行时单例封装
│       ├── event-bus.ts        # 全局事件总线 useEventBus()
│       ├── game-shell.ts       # 游戏控制门面 useGame()
│       ├── reactive.ts         # 轻量响应式参数实验封装
│       └── index.ts            # runtime 统一导出
│
├── core/                      # 与 Vue 解耦的游戏核心能力
│   ├── index.ts                # core 统一导出
│   ├── constants.ts            # 通用场景/事件/游戏配置常量
│   ├── type.ts                 # 核心类型预留
│   ├── event-bus/              # 核心事件总线实现
│   │   ├── event-bus.ts        # GameEventBus 类
│   │   ├── type.ts             # 事件回调类型
│   │   └── index.ts            # event-bus 统一导出
│   └── game-shell/             # Phaser 实例生命周期封装（进行中）
│       ├── game-shell.ts       # GameShell 类
│       └── index.ts            # game-shell 统一导出
│
└── router/                    # 路由配置
    └── index.ts

配置文件：
├── package.json                # 脚本与依赖
├── vite.config.ts              # Vite / Vue / Tailwind / 自动导入配置
├── tsconfig*.json              # TypeScript 配置
└── index.html                  # Vite HTML 入口
```

### 结构约定

- `pages/` 放路由页面；页面文件使用 kebab-case，路由由 `src/router/index.ts` 显式维护。
- `components/` 放可复用 UI 组件；Vue 组件只负责菜单、HUD、按钮等表现层。
- `pages/game-demo/` 是可替换的 Demo 模块，包含自己的场景、常量和 Demo 专用事件桥接。
- `core/` 放不依赖 Vue 组件的核心能力，例如事件总线、游戏 Shell、通用常量。
- `composables/runtime/` 放 Vue 侧运行时单例/门面，用于把 UI 操作转换为核心事件或游戏控制。
- `public/` 适合放不会经过打包处理的资源；`src/assets/` 适合放需要 import、hash 或参与构建的资源。

## 路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | `home-page.vue` | 首页菜单 |
| `/how-to-play` | `how-to-play.vue` | 玩法介绍 |
| `/about-us` | `about-us.vue` | 关于我们 |
| `/game` | `game.vue` → `game-demo/` | 游戏页面 |

## 游戏 Demo

访问 `/#/game` 进入平台跳跃收集星星的 Demo。

操作方式：

- ← → 方向键移动
- ↑ 跳跃（仅地面可跳）
- ESC 暂停/恢复
- 收集黄色星星得分，全部收集后自动刷新

架构特点：

- `game.vue` 作为全局游戏管理容器，负责暂停/恢复/退出
- `game-demo/index.vue` 负责 Phaser 实例创建和 HUD 显示
- 全部使用 `generateTexture` 生成占位图形，零外部素材依赖
- EventBus 实现 Phaser 与 Vue 的双向通信

详细学习文档见 `docs/phaser-study.md`。

## 文档

- `docs/spec-framework.md` — UI 框架规格说明
- `docs/game-demo.md` — 游戏 Demo 说明
- `docs/phaser-study.md` — Phaser + Vue 集成学习拆解

## 开发约定

- 新增 Phaser 场景时使用 Class 结构，并在 `shutdown` / `destroy` 阶段清理自定义监听器。
- 资源 Key、场景 Key、事件 Key 优先放入常量文件集中管理。
- Vue 与 Phaser 通过 EventBus / Registry 通信，避免在 Vue 组件中编写核心游戏逻辑。
- Game Jam 原型优先保证可运行闭环；缺少素材时使用 Phaser 图形或 `generateTexture` 生成占位资源。
