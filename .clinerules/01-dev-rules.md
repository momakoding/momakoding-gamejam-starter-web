# 开发规范

## 命名

1. **文件命名**: 统一使用kebab-case (短横线分隔)，例如 `global-search-bar.vue`。
2. **组件引用**: 在 `<template>` 中使用时，和在 `<script>` 中引入时一样，使用PascalCase，例如 `import GlobalSearchBar from '...'`，`<GlobalSearchBar />`。
3. **页面/路由**: `pages/` 目录下的 `.vue` 文件会自动生成同名路由，使用kebab-case。例如 `pages/recent-cases.vue` -> `/recent-cases`。

## CSS (Tailwind CSS)

### 原子化优先

- **拥抱原子化**: 尽可能直接在模板中使用 Tailwind 的功能类 (utility classes)。
- **适度 `@apply`**: 当多个元素共享完全相同的复杂样式组合时，才在 `<style>` 中使用 `@apply` 提取为组件级 CSS 类，以避免过度抽象。
- **类命名**：使用BEM规范进行命名

### 颜色与主题

- **预警色**: 项目核心的红/橙/黄三级预警色，应在 `tailwind.config.ts` 中定义为主题色，方便全局调用。

  ```js
  // tailwind.config.ts
  theme: {
    extend: {
      colors: {
        'alert-red': '#...',
        'alert-orange': '#...',
        'alert-yellow': '#...',
      },
    },
  },
  ```

- **PrimeVue Pass Through**: 后台组件库 PrimeVue 的样式定制，通过其 Pass Through (PT) 机制实现，直接在组件上绑定 Tailwind 类，而不是覆盖 CSS。

### 国际化 (i18n) 与排版

- **长文本处理**: 考虑到德语、俄语等语言的文本长度，在使用定宽、截断等样式时需格外小心，多使用 `flex-wrap`, `min-w-0`, `break-words` 等弹性布局方式，确保在不同语言下布局稳定。
- **字体**: 确保所选字体能覆盖项目支持的8种语言。

## 组件开发

- **组件划分**:
  - **`components/`**: 存放全局可复用的基础组件 (如按钮、标签、折叠面板)。
  - **`pages/`**: 存放页面级组件，与路由对应。如果页面逻辑复杂，可将页面的子模块拆分到该页面同名的子目录中。
- **Props 定义**: 使用 TypeScript 为组件的 `props` 提供明确的类型定义。
- **Emits 定义**: 同样，使用 `defineEmits` 为组件的事件提供类型安全的定义。

### UI库使用范围

- **前台门户 (`2dpo-portal`)**:
  - **核心**: 使用 `@nuxt/ui` 提供的无头组件（Headless UI）。
  - **自定义**: 对于 `@nuxt/ui` 无法满足的，应自行封装可复用的基础组件。
- **后台管理 (`2dpo-admin`)**:
  - **核心**: 使用 `PrimeVue` 组件库，并通过 Pass Through (PT) 机制与 Tailwind CSS 结合进行样式定制。
