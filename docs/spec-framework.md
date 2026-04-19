# Momakoding Game UI Framework Spec

## 概述

基于 Vue 3 + Vue Router + Tailwind CSS 4 的游戏 UI 脚手架，提供首页菜单、玩法介绍、关于我们等页面框架。

## 技术栈

- Vue 3 (Composition API, `<script setup lang="ts">`)
- Vue Router 4 (基于文件的页面组织)
- Tailwind CSS 4
- Phaser 4 (游戏引擎)
- Pinia (状态管理，预留)
- TypeScript 严格模式

## 目录结构

```
src/
├── main.ts                    # 应用入口，挂载 Vue + Router + Pinia
├── App.vue                    # 根组件，<RouterView /> 容器
├── style.css                  # 全局样式 (Tailwind 入口)
│
├── core/                      # 游戏核心逻辑
│   └── index.ts               # 统一导出
│
├── pages/                     # 页面组件 (路由页面)
│   ├── home-page.vue          # 首页：游戏标题 + 功能按钮
│   ├── how-to-play.vue        # 玩法介绍页
│   ├── about-us.vue           # 关于我们页
│   ├── game.vue               # 游戏容器页面
│   └── game-demo/             # ⭐ Phaser Demo (独立文件夹，可整体删除)
│       ├── index.vue           # Vue 容器页面 + HUD
│       ├── event-bus.ts        # 跨框架事件总线
│       ├── scenes/
│       │   ├── boot-scene.ts   # 资源加载场景
│       │   └── game-scene.ts   # 主游戏场景
│       └── constants.ts        # 资源 Key / 配置常量 (文件少，无需统一导出，按需 import)
│
├── components/                # 可复用 UI 组件
│   └── game-button.vue        # 统一风格的游戏按钮
│
├── composables/               # 组合式函数 (单例响应式)
│   └── index.ts               # 统一导出
│
└── router/                    # 路由配置
    └── index.ts               # 路由定义与创建
```

## 页面规格

### 1. 首页 (`/`)

- 全屏容器，内容垂直 + 水平居中
- 游戏名称：大号标题，占位符文本 `[请输入文本]`
- 功能按钮纵向排列，间距适中：
  1. **开始游戏** → 导航到 `/how-to-play?from=start`
  2. **玩法介绍** → 导航到 `/how-to-play?from=menu`
  3. **关于我们** → 导航到 `/about-us`
  4. **退出游戏** → 执行 `window.close()` 失败后跳转 `about:blank`
- 背景：纯色深色调（后期可替换为视觉特效）

### 2. 玩法介绍页 (`/how-to-play`)

- 全屏容器，内容居中
- 标题 "玩法介绍"
- 正文区域：占位文本说明
- 底部按钮根据来源切换：
  - `from=start` → 显示 "开始游戏"（预留，暂导航到 `/`）
  - `from=menu` → 显示 "返回主页"（导航到 `/`）

### 3. 关于我们页 (`/about-us`)

- 全屏容器，内容居中
- 标题 "关于我们"
- 团队/项目信息占位
- 底部 "返回主页" 按钮

## 组件规格

### GameButton

- Props: `label: string`, `variant?: 'primary' | 'secondary'`
- 统一的游戏风格按钮，hover/active 状态反馈
- 使用 Tailwind 原子类实现样式

## 路由配置

| 路径 | 页面组件 | 说明 |
|------|---------|------|
| `/` | `home-page.vue` | 首页 |
| `/how-to-play` | `how-to-play.vue` | 玩法介绍 |
| `/about-us` | `about-us.vue` | 关于我们 |
| `/game` | `game.vue` → `game-demo/` | 游戏容器（加载 Demo + 暂停管理） |

## 全局样式

- Tailwind CSS 4 作为基础
- 自定义游戏主题色通过 CSS 变量 / Tailwind `@theme` 扩展
- 全屏布局：`min-h-screen`，禁止页面滚动条（游戏场景）
