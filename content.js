const GITHUB_REPO_URL =
  "https://github.com/momakoding/momakoding-gamejam-starter-web";

const i18n = {
  "zh-J": {
    author_tag: "作者",
    board_tag: "出品",
    title_tag: "标题",
    time_tag: "时间",
    page_title: "Momakoding — 网页游戏快速原型脚手架",
    main_title: "[工具] Web Game Jam Starter: 快速游戏原型脚手架",
    hero_desc:
      "周末 48 小时，一个人（加几个 AI）也能做出能玩、一个 URL 就能分享、能直接上线的网页游戏。\n Vue 管菜单 UI，Phaser 管玩法物理，AI 照登记表改数值——你只管想好不好玩。",

    box_why: "WHY THIS STARTER / 为什么选它？",
    why_q1: "Q: UI、菜单、设置面板，每次都要在 Canvas 里手搓？",
    why_a1:
      "48 小时的体力账本里，最贵的从来不是玩法，是 UI。Canvas 手搓按钮、菜单、设置面板要重复造轮子，没有热更新、没有焦点管理。把 DOM 的活交回 Vue 3 + Tailwind，Phaser 专心做渲染、物理、输入循环——分工清楚，迭代速度直接翻倍。",
    why_q2: "Q: 多人或 AI 协作时，代码总被改乱怎么办？",
    why_a2:
      "三层物理隔离 + 分支约定。engine/ 是引擎层、contents/ 是游戏世界、runtime/ 是 Vue 侧粘合层，导入方向单向不可逆。具体玩法只在 games/ 或 demo/* 分支推进，main 始终保持可 fork 的纯净底座。换游戏不用重搭架子，协作者也不会互踩。",
    why_q3: "Q: 队里的策划或 AI 不会 Phaser，怎么参与？",
    why_a3:
      "AGENTS.md 把场景键、事件键、资源键、调参常量登记成一张活表。非程序员或 AI 只要改 contents/constants.ts 里的重力、初速度、关卡数值就能调手感；改 game-info/ 里的标题、说明、团队信息，主页和关于页同步刷新。完全绕开 Phaser 的类继承细节。",
    why_q4: "Q: 我完全不会写代码，也能用吗？",
    why_a4:
      "能。配合 Cursor、Claude Code、Kilo Code 这类 AI 助手，你只描述「跳起来要更轻盈」「金币减到 5 个」，它来改代码。脚手架还会把你的玩法描述沉淀进 docs/vibe/spec-game.md，作为后续所有迭代的唯一设计源——AI 不会每次都从零理解你的脑洞。",
    box_who: "WHO IT'S FOR / 它为谁而造",
    who1_t: "程序员",
    who1_d:
      "fork 之后跳过搭架子的半天，菜单、暂停、路由、构建链全配好，第一行代码就写在玩法里。",
    who2_t: "策划 / 产品 / 设计师",
    who2_d:
      "不用学 Phaser，甚至根本不需要懂代码。改占位文案、调数值、靠 AI 把「手感」翻译成代码，当天就能在浏览器里玩到自己的想法。",
    who3_t: "人 + AI 混编团队",
    who3_d:
      "spec-game.md 当设计契约，AGENTS.md 当工程契约。AI 改代码前先对账，人类负责定义体验，分工不打架。",
    box_features: "FEATURES / 特性",
    f1_t: "开箱即用",
    f1_d: "标题菜单、占位关卡、暂停/恢复/退出、Hash 路由全部就绪。pnpm i && pnpm dev 即开始迭代玩法，省下半天搭架子的成本。",
    f2_t: "分层架构",
    f2_d: "engine / contents / runtime / pages 单向依赖，main 分支永远纯净。重构不会牵一发动全身。",
    f3_t: "AI 协作友好",
    f3_d: "AGENTS.md 作为机制契约：登记表 + Read-before-write checklist + 决策日志，让 AI 在改代码前先对账，少幻觉、少返工。",
    f4_t: "占位优先",
    f4_d: "无美术也能跑：纯色矩形即占位，game-info/ 集中管理标题、说明、团队信息。先把玩法跑通，美术后补，节奏不被资源卡死。",
    f5_t: "可路演 / 可上线",
    f5_d: "pnpm build 出的是真生产物，不是 demo 残留。Hash 路由适配 GitHub Pages、itch.io、Vercel 等静态托管，无需服务端配置。路演时扔一个 URL 就行——不用打包 exe，不用现场连本地，评委点开即玩（URL 也方便现场转成二维码），作品上线即归档。",

    box_showcase: "SHOWCASE / 实例展示",
    showcase_neon_meta: "本框架官方教程 Demo",
    showcase_stars_meta: "更基础的平台跳跃收集 Demo",
    play_link_label: "→ 试玩",
    showcase_bounder_topic: "选题：边境（Border）",
    showcase_ensemble_topic: "选题：教育✖️艺术",
    showcase_ensemble_desc: "简介：倾听学生的故事，把它们弹成歌。",

    box_workflow: "WORKFLOW / 典型工作流",
    workflow_intro: "不会写代码也没关系。典型的迭代节奏是这样的：",
    workflow_loop: "① 描述想法 → ② AI 改代码 → ③ 浏览器试玩 → ④ 继续微调",
    workflow_first_t: "跑起来后，优先改这四处占位内容：",
    workflow_f1: "游戏名称 / 副标题",
    workflow_f2: "玩法介绍正文",
    workflow_f3: "团队名称 / 成员",
    workflow_f4: "整体配色",

    box_tech: "TECH STACK / 技术栈",
    box_arch: "ARCHITECTURE / 架构",
    arch_1: "UI 无关的 Phaser 包装器 (GameShell)",
    arch_2: "具体的游戏内容与关卡",
    arch_3: "Vue 构建的菜单与 UI 系统",
    quick_start: "快速开始：",
    guide_link: "上手指南 (CN)",
    guide_desc: "完整新手流程，含常见失误与 FAQ",
    footer: " 按 ← Github ⭐ Star | j/k 滚动 | MIT License",
  },
  "zh-F": {
    author_tag: "作者",
    board_tag: "出品",
    title_tag: "標題",
    time_tag: "時間",
    page_title: "Momakoding — 網頁遊戲快速原型腳手架",
    main_title: "[工具] Web Game Jam Starter: 快速遊戲原型腳手架",
    hero_desc:
      "週末 48 小時，一個人（加幾個 AI）也能做出能玩、一個 URL 就能分享、能直接上線的網頁遊戲。\n Vue 管選單 UI，Phaser 管玩法物理，AI 照登記表改數值——你只管想好不好玩。",

    box_why: "WHY THIS STARTER / 為什麼選它？",
    why_q1: "Q: UI、選單、設定面板，每次都要在 Canvas 裡手搓？",
    why_a1:
      "48 小時的體力帳本裡，最貴的從來不是玩法，是 UI。Canvas 手搓按鈕、選單、設定面板要重複造輪子，沒有熱更新、沒有焦點管理。把 DOM 的活交回 Vue 3 + Tailwind，Phaser 專心做渲染、物理、輸入迴圈——分工清楚，迭代速度直接翻倍。",
    why_q2: "Q: 多人或 AI 協作時，程式碼總被改亂怎麼辦？",
    why_a2:
      "三層物理隔離 + 分支約定。engine/ 是引擎層、contents/ 是遊戲世界、runtime/ 是 Vue 側黏合層，匯入方向單向不可逆。具體玩法只在 games/ 或 demo/* 分支推進，main 始終保持可 fork 的純淨底座。換遊戲不用重搭架子，協作者也不會互踩。",
    why_q3: "Q: 隊裡的策劃或 AI 不會 Phaser，怎麼參與？",
    why_a3:
      "AGENTS.md 把場景鍵、事件鍵、資源鍵、調參常量登記成一張活表。非程式設計師或 AI 只要改 contents/constants.ts 裡的重力、初速度、關卡數值就能調手感；改 game-info/ 裡的標題、說明、團隊資訊，主頁和關於頁同步刷新。完全繞開 Phaser 的類別繼承細節。",
    why_q4: "Q: 我完全不會寫程式碼，也能用嗎？",
    why_a4:
      "能。搭配 Cursor、Claude Code、Kilo Code 這類 AI 助手，你只描述「跳起來要更輕盈」「金幣減到 5 個」，它來改程式碼。腳手架還會把你的玩法描述沉澱進 docs/vibe/spec-game.md，作為後續所有迭代的唯一設計源——AI 不會每次都從零理解你的腦洞。",
    box_who: "WHO IT'S FOR / 它為誰而造",
    who1_t: "程式設計師",
    who1_d:
      "fork 之後跳過搭架子的半天，選單、暫停、路由、建置鏈全配好，第一行程式碼就寫在玩法裡。",
    who2_t: "策劃 / 產品 / 設計師",
    who2_d:
      "不用學 Phaser，甚至根本不需要懂程式碼。改佔位文案、調數值、靠 AI 把「手感」翻譯成程式碼，當天就能在瀏覽器裡玩到自己的想法。",
    who3_t: "人 + AI 混編團隊",
    who3_d:
      "spec-game.md 當設計契約，AGENTS.md 當工程契約。AI 改程式碼前先對帳，人類負責定義體驗，分工不打架。",
    box_features: "FEATURES / 特性",
    f1_t: "開箱即用",
    f1_d: "標題選單、佔位關卡、暫停/恢復/退出、Hash 路由全部就緒。pnpm i && pnpm dev 即開始迭代玩法，省下半天搭架子的成本。",
    f2_t: "分層架構",
    f2_d: "engine / contents / runtime / pages 單向依賴，main 分支永遠純淨。重構不會牽一髮動全身。",
    f3_t: "AI 協作友善",
    f3_d: "AGENTS.md 作為機制契約：登記表 + Read-before-write checklist + 決策日誌，讓 AI 在改程式碼前先對帳，少幻覺、少返工。",
    f4_t: "佔位優先",
    f4_d: "無美術也能跑：純色矩形即佔位，game-info/ 集中管理標題、說明、團隊資訊。先把玩法跑通，美術後補，節奏不被資源卡死。",
    f5_t: "可路演 / 可上線",
    f5_d: "pnpm build 出的是真正的生產產物，不是 demo 殘留。Hash 路由適配 GitHub Pages、itch.io、Vercel 等靜態託管，無需伺服端設定。路演時丟一個 URL 就行——不用打包 exe，不用現場連本地，評審點開即玩（URL 也方便現場轉成 QR Code），作品上線即歸檔。",

    box_showcase: "SHOWCASE / 實例展示",
    showcase_neon_meta: "本框架官方教程 Demo",
    showcase_stars_meta: "更基礎的平台跳躍收集 Demo",
    play_link_label: "→ 試玩",
    showcase_bounder_topic: "選題：邊境（Border）",
    showcase_ensemble_topic: "選題：教育✖️藝術",
    showcase_ensemble_desc: "簡介：傾聽學生的故事，把它們彈成歌。",

    box_workflow: "WORKFLOW / 典型工作流程",
    workflow_intro: "不會寫程式碼也沒關係。典型的迭代節奏是這樣的：",
    workflow_loop: "① 描述想法 → ② AI 改程式碼 → ③ 瀏覽器試玩 → ④ 繼續微調",
    workflow_first_t: "跑起來後，優先改這四處佔位內容：",
    workflow_f1: "遊戲名稱 / 副標題",
    workflow_f2: "玩法介紹正文",
    workflow_f3: "團隊名稱 / 成員",
    workflow_f4: "整體配色",

    box_tech: "TECH STACK / 技術棧",
    box_arch: "ARCHITECTURE / 架構",
    arch_1: "UI 無關的 Phaser 包裝器 (GameShell)",
    arch_2: "具體的遊戲內容與關卡",
    arch_3: "Vue 構建的菜單與 UI 系統",
    quick_start: "快速開始：",
    guide_link: "上手指南（CN）",
    guide_desc: "完整新手流程，含常見失誤與 FAQ",
    footer: " 按 ← Github ⭐ Star | j/k 滾動 | MIT License",
  },
  en: {
    author_tag: "Author",
    board_tag: "By",
    title_tag: "Title",
    time_tag: "Time",
    page_title: "Momakoding — Web Game Jam Starter",
    main_title: "[Tool] Web Game Jam Starter: Rapid Game Prototype Scaffold",
    hero_desc:
      "A weekend, one person (plus a few AI agents) — and you ship a web game that's playable, shareable by a single URL, and live. \n Vue owns the menus, Phaser owns the gameplay, AI tweaks the numbers. You just make it fun.",

    box_why: "WHY THIS STARTER",
    why_q1: "Q: Hand-rolling UI, menus, and settings panels on Canvas every single time?",
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
    why_q4: "Q: I can't code at all. Can I still use this?",
    why_a4:
      "Yes. Pair it with an AI assistant like Cursor, Claude Code, or Kilo Code. You describe the feel — 'make the jump lighter,' 'cut coins from ten to five' — the AI writes the code. The scaffold also captures your game idea into docs/vibe/spec-game.md as the single source of truth, so the AI doesn't relearn your concept on every iteration.",
    box_who: "WHO IT'S FOR",
    who1_t: "Developers",
    who1_d:
      "Skip half a day of scaffolding. Menus, pause, routing, and the build pipeline are wired up — your first line of code goes straight into gameplay.",
    who2_t: "Designers / PMs / Writers",
    who2_d:
      "No Phaser, no coding knowledge required. Edit placeholder copy, tune numbers, let the AI translate 'feel' into code. Play your idea in the browser the same day.",
    who3_t: "Human + AI Hybrid Teams",
    who3_d:
      "spec-game.md is the design contract; AGENTS.md is the engineering contract. AI reconciles before writing, humans own the experience — no turf wars.",
    box_features: "FEATURES",
    f1_t: "Ready Out of the Box",
    f1_d: "Title menu, placeholder level, pause/resume/exit, and hash routing all wired up. pnpm i && pnpm dev and you're iterating gameplay — no half-day of scaffolding lost.",
    f2_t: "Layered Architecture",
    f2_d: "engine / contents / runtime / pages with one-way deps; main always stays clean. Refactors don't ripple through the whole tree.",
    f3_t: "AI-Collaboration Friendly",
    f3_d: "AGENTS.md is the mechanical contract: registries, a read-before-write checklist, and a decision log. Agents reconcile state before writing — fewer hallucinations, fewer rollbacks.",
    f4_t: "Placeholder-First",
    f4_d: "Runs without a single art asset — colored rectangles stand in for sprites; game-info/ centralizes titles, instructions, and team info. Ship the loop first, art later. Resources never block the rhythm.",
    f5_t: "Demo-Ready & Production-Ready",
    f5_d: "pnpm build emits a real production bundle, not a dev leftover. Hash routing runs on any static host — GitHub Pages, itch.io, Vercel — with zero server config. For a pitch, share a URL: no exe to ship, no localhost to babysit. Judges open it in a browser and play; the game stays live as a portfolio piece long after the jam ends.",

    box_showcase: "SHOWCASE",
    showcase_neon_meta: "Official tutorial demo of this framework",
    showcase_stars_meta: "A simpler platformer collection demo",
    play_link_label: "→ Play",
    showcase_bounder_topic: "Theme: Border",
    showcase_ensemble_topic: "Theme: Education ✖️ Art",
    showcase_ensemble_desc: "Listen to your students' stories and play them into songs.",

    box_workflow: "WORKFLOW",
    workflow_intro: "No coding experience needed. The typical iteration loop looks like this:",
    workflow_loop: "① Describe your idea → ② AI edits the code → ③ Play in browser → ④ Keep tuning",
    workflow_first_t: "Once it's running, these four placeholders are the first things to change:",
    workflow_f1: "Game title / subtitle",
    workflow_f2: "How-to-play text",
    workflow_f3: "Team name / members",
    workflow_f4: "Color theme",

    box_tech: "TECH STACK",
    box_arch: "ARCHITECTURE",
    arch_1: "UI-agnostic Phaser wrapper (GameShell)",
    arch_2: "Specific game contents and levels",
    arch_3: "Menu and UI system built with Vue",
    quick_start: "Quick Start:",
    guide_link: "Onboarding (EN)",
    guide_desc: "Full beginner walkthrough with common mistakes & FAQ",
    footer: "Press ← GitHub ⭐ Star | j/k to scroll | MIT License",
  },
  yug: {
    author_tag: "Autor",
    board_tag: "Izdaje",
    title_tag: "Naslov",
    time_tag: "Vrijeme",
    page_title: "Momakoding — Skela za brzo prototipiranje web igara",
    main_title: "[Alat] Web Game Jam Starter: skela za brzo prototipiranje igara",
    hero_desc:
      "Jedan vikend, jedna osoba (plus nekoliko AI agenata) — i napraviš web igru koja se može igrati, podijeliti jednim URL-om i odmah objaviti. \n Vue drži menije, Phaser drži gameplay, AI mijenja brojke. Ti se baviš samo time da bude zabavno.",

    box_why: "WHY THIS STARTER / Zašto baš ova skela?",
    why_q1: "P: Svaki put iznova ručno crtaš UI, menije i panel postavki u Canvasu?",
    why_a1:
      "U budžetu od 48 sati UI pojede više vremena nego sam gameplay. Ručno crtanje dugmadi i menija u Canvasu znači iznova izmišljati raspored, fokus i stilove, bez hot reloada. Prepusti DOM Vue 3 + Tailwindu, a Phaser neka radi samo render, fiziku i input petlju — jasna podjela, dvostruko brža iteracija.",
    why_q2: "P: Kod se stalno gazi kad ga dira više ljudi ili AI agenata?",
    why_a2:
      "Tri fizički odvojena sloja plus dogovor o granama. engine/ je pokretač, contents/ je svijet igre, runtime/ je lijepak na Vue strani — importi teku samo u jednom smjeru. Konkretan gameplay živi u games/ ili demo/* granama; main ostaje čista baza spremna za fork. Mijenjaš igru bez ponovne izgradnje skele, a saradnici si ne gaze putić.",
    why_q3: "P: Dizajner ili AI u timu ne znaju Phaser. Kako da doprinesu?",
    why_a3:
      "AGENTS.md upisuje svaki ključ scene, događaja, resursa i svaku konstantu za podešavanje u jednu živu tabelu. Neprogrameri ili AI samo mijenjaju gravitaciju, početnu brzinu i vrijednosti nivoa u contents/constants.ts da naštimaju osjećaj; izmijene naslove, upute i podatke o timu u game-info/, pa se početna i „o nama“ stranica ažuriraju u istom koraku. Bez ijednog detalja Phaserove hijerarhije klasa.",
    why_q4: "P: Uopšte ne znam programirati. Mogu li i dalje ovo koristiti?",
    why_a4:
      "Možeš. Upari ga s AI asistentom poput Cursora, Claude Code ili Kilo Code. Ti opišeš osjećaj — „neka skok bude lakši“, „smanji novčiće s deset na pet“ — a AI piše kod. Skela uz to tvoju zamisao zapisuje u docs/vibe/spec-game.md kao jedini izvor istine, pa AI ne mora pri svakoj iteraciji nanovo shvatati tvoju ideju.",
    box_who: "WHO IT'S FOR / Za koga je",
    who1_t: "Programeri",
    who1_d:
      "Nakon forka preskačeš pola dana namještanja skele — meniji, pauza, rutiranje i build lanac su gotovi, prva linija koda ide pravo u gameplay.",
    who2_t: "Dizajneri / PM-ovi / scenaristi",
    who2_d:
      “Bez Phasera, čak ni poznavanje koda nije potrebno. Mijenjaš placeholder tekst, štimaš brojke, pustiš AI da „osjećaj” prevede u kod. Svoju ideju isti dan igraš u pregledniku.”,
    who3_t: "Mješoviti timovi ljudi + AI",
    who3_d:
      "spec-game.md je dizajnerski ugovor, AGENTS.md je inženjerski ugovor. AI se uskladi prije pisanja, ljudi definišu doživljaj — bez sukoba oko teritorija.",
    box_features: "FEATURES / Mogućnosti",
    f1_t: "Spremno za rad odmah",
    f1_d: "Naslovni meni, placeholder nivo, pauza/nastavak/izlaz i hash rutiranje — sve je već povezano. pnpm i && pnpm dev i već iteriraš gameplay, bez izgubljenog pola dana na skelu.",
    f2_t: "Slojevita arhitektura",
    f2_d: "engine / contents / runtime / pages s jednosmjernim zavisnostima; main uvijek ostaje čist. Refaktorisanje se ne razlije kroz cijelo stablo.",
    f3_t: "Prijateljski prema AI saradnji",
    f3_d: "AGENTS.md je mehanički ugovor: registri, „read-before-write“ checklist i dnevnik odluka. Agenti usklade stanje prije pisanja — manje halucinacija, manje vraćanja unazad.",
    f4_t: "Placeholder na prvom mjestu",
    f4_d: "Radi bez ijednog grafičkog asseta — obojeni pravougaonici stoje umjesto sprajtova; game-info/ centralizuje naslove, upute i podatke o timu. Prvo pokreni petlju, grafika kasnije. Resursi nikad ne koče ritam.",
    f5_t: "Spremno za prezentaciju i za produkciju",
    f5_d: "pnpm build pravi pravi produkcijski bundle, ne ostatak iz dev faze. Hash rutiranje radi na bilo kom statičkom hostingu — GitHub Pages, itch.io, Vercel — bez ikakve serverske konfiguracije. Za prezentaciju podijeliš URL: nema exe-a za pakovanje, nema localhosta za dadiljanje, žiri otvori i igra (URL se lako pretvori i u QR kod), a igra ostaje online kao dio portfolija i dugo nakon jama.",

    box_showcase: "SHOWCASE / Primjeri",
    showcase_neon_meta: "Zvanični tutorijal demo ovog frameworka",
    showcase_stars_meta: "Jednostavniji platformer demo sa skupljanjem",
    play_link_label: "→ Igraj",
    showcase_bounder_topic: "Tema: Granica (Border)",
    showcase_ensemble_topic: "Tema: Obrazovanje ✖️ Umjetnost",
    showcase_ensemble_desc: "Slušaj priče svojih učenika i pretvori ih u pjesme.",

    box_workflow: "WORKFLOW / Tipičan tok rada",
    workflow_intro: "Nije potrebno znati programirati. Tipičan ritam iteracije izgleda ovako:",
    workflow_loop: "① Opišeš ideju → ② AI mijenja kod → ③ Igraš u pregledniku → ④ Nastaviš dotjerivati",
    workflow_first_t: "Kad pokreneš, ovo su četiri placeholder-a koja mijenjаš prva:",
    workflow_f1: "Naziv igre / podnaslov",
    workflow_f2: "Tekst s uputama za igranje",
    workflow_f3: "Naziv tima / članovi",
    workflow_f4: "Paleta boja",

    box_tech: "TECH STACK / Tehnologije",
    box_arch: "ARCHITECTURE / Arhitektura",
    arch_1: "Phaser omotač nezavisan od UI-ja (GameShell)",
    arch_2: "Konkretan sadržaj igre i nivoi",
    arch_3: "Sistem menija i UI-ja izgrađen u Vue-u",
    quick_start: "Brzi početak:",
    guide_link: "Uputstvo (EN)",
    guide_desc: "Kompletan vodič za početnike s čestim greškama i FAQ-om",
    footer: " Pritisni ← GitHub ⭐ Star | j/k za skrolanje | MIT License",
  },
};

// ---------------------------------------------------------------------------
// BCP 47 language-tag mapping (for the HTML `lang` attribute).
// 仅为国际化技术规范 / Purely an i18n technical convention:
//   - 这些是 IETF BCP 47 标准语言代码，用于 a11y、SEO 与浏览器识别。
//   - The values below are standard IETF BCP 47 tags used for accessibility,
//     SEO and browser language detection — not a political statement of any kind.
//   - zh-J (简体) -> zh-CN ; zh-F (繁體) -> zh-TW : 沿用 Unicode CLDR / BCP 47
//     最常见的脚本-区域写法，仅表脚本与字体回退，不代表作者任何政治立场。
//   - yug (BCS, Latinica) -> sh-Latn : Serbo-Croatian 拉丁字母，语言学中性写法。
// ---------------------------------------------------------------------------
const LANG_TAG = {
  "zh-J": "zh-CN",
  "zh-F": "zh-TW",
  en: "en",
  yug: "sh-Latn",
};

function setLang(lang) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (i18n[lang] && i18n[lang][key]) {
      el.innerText = i18n[lang][key];
    }
  });
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
  });
  document.documentElement.lang = LANG_TAG[lang] || lang;
}