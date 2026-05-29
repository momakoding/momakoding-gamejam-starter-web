# GitHub Pages Landing Page Spec

## 目标 / Goal

独立于脚手架本体的项目介绍落地页，托管于 GitHub Pages。  
A standalone project landing page hosted on GitHub Pages, separate from the scaffold itself.

---

## 分支策略 / Branch Strategy

| 项                | 值                                       |
| ----------------- | ---------------------------------------- |
| 分支              | `gh-pages`（orphan，不含脚手架源码）     |
| GitHub Pages 配置 | Branch = `gh-pages`，Folder = `/ (root)` |
| 页面入口          | `index.html`                             |

`gh-pages` 是 orphan 分支，无共同历史，与 `main` 完全隔离。  
`main` 分支不包含任何与 `gh-pages` 相关的文件或信息。

---

## 维护方式 / Maintenance

直接在 `gh-pages` 分支修改 `index.html`，commit 后 push 即生效。

```bash
git checkout gh-pages
# 编辑 index.html
git add index.html
git commit -m "chore: update landing page"
git push origin gh-pages
```

---

## 内容结构 / Content Structure

| 区块        | 内容                                                      |
| ----------- | --------------------------------------------------------- |
| Hero        | 项目名 + 双语一句话介绍 + "Use this template" CTA         |
| Tech Stack  | Vue 3 / Phaser 4 / TypeScript / Vite / Tailwind CSS badge |
| Features    | 4 条亮点：开箱即用、分层架构、AI 协作友好、双语文档       |
| Showcase    | The Bounder / Neon Hunter / Picking Stars，带链接         |
| Quick Start | clone + pnpm install + pnpm dev 代码块                    |
| Footer      | Momakoding 链接                                           |

---

## 技术选型 / Tech

- 纯静态 HTML + Tailwind CSS CDN
- 无构建步骤，无 `node_modules`，无依赖
- 双语：中文为主，英文副标题
- 深色主题
