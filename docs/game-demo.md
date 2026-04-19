# 游戏 DEMO

## 概述

一个「平台跳跃 + 收集星星」的 Phaser 4 + Vue 3 集成 Demo。

- 路由：`/#/game`（由 `game.vue` 加载，支持全局暂停/恢复/退出）
- 代码位置：`src/pages/game-demo/`（独立文件夹，删除即可移除）
- 学习文档：`docs/phaser-study.md`

## 玩法

- 方向键 ← → 移动
- 方向键 ↑ 跳跃（仅地面可跳）
- 收集黄色星星得分，全部收集后自动刷新一波
- ESC 暂停/恢复游戏
- 右上角「重新开始」按钮重置游戏

## 文件结构

```
src/pages/game-demo/
├── index.vue          # Vue 容器 + HUD
├── constants.ts       # 常量定义
├── event-bus.ts       # Phaser ↔ Vue 事件总线
└── scenes/
    ├── boot-scene.ts  # 资源加载（占位图形）
    └── game-scene.ts  # 主游戏逻辑
```

## 技术要点

- 全部使用 `generateTexture` 生成占位图形，零外部素材依赖
- EventBus 实现 Phaser 与 Vue 的双向通信
- Vue 负责 HUD（分数、按钮），Phaser 负责游戏逻辑
- 场景 shutdown 时自动清理外部事件监听
