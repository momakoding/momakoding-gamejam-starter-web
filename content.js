const GITHUB_REPO_URL =
  "https://github.com/momakoding/momakoding-gamejam-starter-web";

const i18n = {
  "zh-J": {
    author_tag: "作者",
    board_tag: "看板",
    title_tag: "标题",
    time_tag: "时间",
    main_title: "[工具] Web Game Jam Starter: 快速游戏原型脚手架",
    hero_desc: "Game Jam 快速原型脚手架，开箱即用，专为 Web 开发者设计。",

    box_why: "WHY THIS STARTER / 为什么选它？",
    why_q1: "Q: 为什么不用 Phaser 一把梭？",
    why_a1:
      "48 小时的体力账本里，最贵的从来不是玩法，是 UI。Canvas 手搓按钮、菜单、设置面板要重复造轮子，没有热更新、没有焦点管理。把 DOM 的活交回 Vue 3 + Tailwind，Phaser 专心做渲染、物理、输入循环——分工清楚，迭代速度直接翻倍。",
    why_q2: "Q: 多人或 AI 协作时，代码总被改乱怎么办？",
    why_a2:
      "三层物理隔离 + 分支约定。engine/ 是引擎层、contents/ 是游戏世界、runtime/ 是 Vue 侧粘合层，导入方向单向不可逆。具体玩法只在 games/ 或 demo/* 分支推进，main 始终保持可 fork 的纯净底座。换游戏不用重搭架子，协作者也不会互踩。",
    why_q3: "Q: 队里的策划或 AI 不会 Phaser，怎么参与？",
    why_a3:
      "AGENTS.md 把场景键、事件键、资源键、调参常量登记成一张活表。非程序员或 AI 只要改 contents/constants.ts 里的重力、初速度、关卡数值就能调手感；改 game-info/ 里的标题、说明、团队信息，主页和关于页同步刷新。完全绕开 Phaser 的类继承细节。",

    box_features: "FEATURES / 特性",
    f1_t: "开箱即用",
    f1_d: "标题菜单、占位关卡、暂停/恢复/退出、Hash 路由全部就绪。pnpm i && pnpm dev 即开始迭代玩法，省下半天搭架子的成本。",
    f2_t: "分层架构",
    f2_d: "engine / contents / runtime / pages 单向依赖，main 分支永远纯净。重构不会牵一发动全身。",
    f3_t: "AI 协作友好",
    f3_d: "AGENTS.md 作为机制契约：登记表 + Read-before-write checklist + 决策日志，让 AI 在改代码前先对账，少幻觉、少返工。",
    f4_t: "双语文档",
    f4_d: "README、上手指南、AGENTS.md 中英双轨，海外评委看 EN，本地队友看 ZH，无需翻译往返。",

    box_showcase: "SHOWCASE / 实例展示",
    showcase_neon_meta: "本框架官方教程 Demo",
    showcase_stars_meta: "更基础的平台跳跃收集 Demo",

    box_tech: "TECH STACK / 技术栈",
    box_arch: "ARCHITECTURE / 架构",
    arch_1: "UI 无关的 Phaser 包装器 (GameShell)",
    arch_2: "具体的游戏内容与关卡",
    arch_3: "Vue 构建的菜单与 UI 系统",
    quick_start: "快速开始：",
    guide_link: "上手指南 (CN)",
    footer: " 按 ← Github ⭐ Star | j/k 滚动 | MIT License",
  },
  "zh-F": {
    author_tag: "作者",
    board_tag: "看板",
    title_tag: "標題",
    time_tag: "時間",
    main_title: "[工具] Web Game Jam Starter: 快速遊戲原型腳手架",
    hero_desc: "Game Jam 快速原型腳手架，開箱即用，專為 Web 開發者設計。",

    box_why: "WHY THIS STARTER / 為什麼選它？",
    why_q1: "Q: 為什麼不用 Phaser 一把梭？",
    why_a1:
      "48 小時的體力帳本裡，最貴的從來不是玩法，是 UI。Canvas 手搓按鈕、選單、設定面板要重複造輪子，沒有熱更新、沒有焦點管理。把 DOM 的活交回 Vue 3 + Tailwind，Phaser 專心做渲染、物理、輸入迴圈——分工清楚，迭代速度直接翻倍。",
    why_q2: "Q: 多人或 AI 協作時，程式碼總被改亂怎麼辦？",
    why_a2:
      "三層物理隔離 + 分支約定。engine/ 是引擎層、contents/ 是遊戲世界、runtime/ 是 Vue 側黏合層，匯入方向單向不可逆。具體玩法只在 games/ 或 demo/* 分支推進，main 始終保持可 fork 的純淨底座。換遊戲不用重搭架子，協作者也不會互踩。",
    why_q3: "Q: 隊裡的策劃或 AI 不會 Phaser，怎麼參與？",
    why_a3:
      "AGENTS.md 把場景鍵、事件鍵、資源鍵、調參常量登記成一張活表。非程式設計師或 AI 只要改 contents/constants.ts 裡的重力、初速度、關卡數值就能調手感；改 game-info/ 裡的標題、說明、團隊資訊，主頁和關於頁同步刷新。完全繞開 Phaser 的類別繼承細節。",

    box_features: "FEATURES / 特性",
    f1_t: "開箱即用",
    f1_d: "標題選單、佔位關卡、暫停/恢復/退出、Hash 路由全部就緒。pnpm i && pnpm dev 即開始迭代玩法，省下半天搭架子的成本。",
    f2_t: "分層架構",
    f2_d: "engine / contents / runtime / pages 單向依賴，main 分支永遠純淨。重構不會牽一髮動全身。",
    f3_t: "AI 協作友善",
    f3_d: "AGENTS.md 作為機制契約：登記表 + Read-before-write checklist + 決策日誌，讓 AI 在改程式碼前先對帳，少幻覺、少返工。",
    f4_t: "雙語文件",
    f4_d: "README、上手指南、AGENTS.md 中英雙軌，海外評審看 EN，本地隊友看 ZH，無需翻譯往返。",

    box_showcase: "SHOWCASE / 實例展示",
    showcase_neon_meta: "本框架官方教程 Demo",
    showcase_stars_meta: "更基礎的平台跳躍收集 Demo",

    box_tech: "TECH STACK / 技術棧",
    box_arch: "ARCHITECTURE / 架構",
    arch_1: "UI 無關的 Phaser 包裝器 (GameShell)",
    arch_2: "具體的遊戲內容與關卡",
    arch_3: "Vue 構建的菜單與 UI 系統",
    quick_start: "快速開始：",
    guide_link: "上手指南（CN）",
    footer: " 按 ← Github ⭐ Star | j/k 滾動 | MIT License",
  },
  en: {
    author_tag: "Author",
    board_tag: "Board",
    title_tag: "Title",
    time_tag: "Time",
    main_title: "[Tool] Web Game Jam Starter: Rapid Game Prototype Scaffold",
    hero_desc: "Ready-to-use scaffold for Game Jams, designed for Web developers.",

    box_why: "WHY THIS STARTER / 为什么选它？",
    why_q1: "Q: Why not just go all-in on Phaser?",
    why_a1:
      "In a 48-hour budget, UI eats more time than gameplay. Hand-rolling buttons and menus on Canvas means reinventing layout, focus, and styling with no HMR. Let Vue 3 + Tailwind own the DOM; let Phaser own the render, physics, and input loop. Clear split, doubled iteration speed.",
    why_q2:
      "Q: Code keeps getting trampled when multiple devs or AI agents touch it?",
    why_a2:
      "Three layers, physically isolated, plus a branch convention. engine/ is the runtime, contents/ is the game world, runtime/ is the Vue-side glue — imports flow one way only. Actual gameplay lives in games/ or demo/* branches; main stays a clean, forkable base. Swap games without rebuilding scaffolding; collaborators stop stepping on each other.",
    why_q3:
      "Q: Designers or AI on the team don't know Phaser. How do they contribute?",
    why_a3:
      "AGENTS.md registers every scene key, event key, asset key, and tuning constant in a single living table. Non-coders or AI assistants tweak gravity, initial velocity, and level values in contents/constants.ts to dial in feel; edit titles, instructions, and team info in game-info/, and the home and about pages update in lockstep. Zero Phaser class hierarchy required.",

    box_features: "FEATURES / 特性",
    f1_t: "Ready Out of the Box",
    f1_d: "Title menu, placeholder level, pause/resume/exit, and hash routing all wired up. pnpm i && pnpm dev and you're iterating gameplay — no half-day of scaffolding lost.",
    f2_t: "Layered Architecture",
    f2_d: "engine / contents / runtime / pages with one-way deps; main always stays clean. Refactors don't ripple through the whole tree.",
    f3_t: "AI-Collaboration Friendly",
    f3_d: "AGENTS.md is the mechanical contract: registries, a read-before-write checklist, and a decision log. Agents reconcile state before writing — fewer hallucinations, fewer rollbacks.",
    f4_t: "Bilingual Docs",
    f4_d: "README, onboarding guide, and AGENTS.md ship in both EN and ZH. International judges read EN, local teammates read ZH, no translation round-trips.",

    box_showcase: "SHOWCASE",
    showcase_neon_meta: "Official tutorial demo of this framework",
    showcase_stars_meta: "A simpler platformer collection demo",

    box_tech: "TECH STACK",
    box_arch: "ARCHITECTURE",
    arch_1: "UI-agnostic Phaser wrapper (GameShell)",
    arch_2: "Specific game contents and levels",
    arch_3: "Menu and UI system built with Vue",
    quick_start: "Quick Start:",
    guide_link: "Onboarding (EN)",
    footer: "Press ← GitHub ⭐ Star | j/k to scroll | MIT License",
  },
};

function setLang(lang) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (i18n[lang] && i18n[lang][key]) {
      el.innerText = i18n[lang][key];
    }
  });
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.innerText.toLowerCase().includes(lang.split("-")[1] || lang)) {
      btn.classList.add("active");
    }
  });
  document.documentElement.lang = lang;
}