# 问题排查指南

## 1. Tailwind CSS v4 @reference 路径问题

### 问题描述

使用 `@reference "@/styles/main.css"` 时报错：

```
ENOENT: no such file or directory, open 'D:\src\styles\main.css'
```

### 原因

Tailwind CSS v4 的 `@reference` 指令不完全支持 Vite 的 `@` 路径别名。

### 解决方案

**确保 vite.config.ts 正确配置 path**

```ts
// vite.config.ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 注意事项

- `@reference` 用于引用其他 CSS 文件的样式
- 组件中可以使用全局定义的类（如 `.faction-ally`、`.system-msg`）

## 2. @utility 指令使用

如果需要在组件中使用 `@apply` 引用自定义类，可以使用 `@utility` 指令：

```css
/* main.css */
@utility faction-ally {
  background-color: var(--color-faction-ally);
  border-left: 4px solid var(--color-faction-ally-border);
  color: var(--color-faction-ally-text);
}
```

然后组件中可以使用：

```css
.my-bubble {
  @apply faction-ally;
}
```

## 3. 水墨动画性能问题

### 问题描述

首页 Hero 区的水墨动画在低端设备或移动端可能出现卡顿、掉帧。

### 排查方向

1. **Canvas vs. CSS**: 检查实现方式。如果是 Canvas，是否可以优化绘制调用？是否可以降低分辨率？
2. **GPU 加速**: 确认动画相关的元素是否已触发 GPU 加速 (如使用 `transform: translateZ(0);` 或 `will-change: transform;`)。
3. **节流/防抖**: 动画的 resize 或 scroll 事件监听是否已做节流处理。

### 降级预案

如果优化后效果仍不理想，应准备优雅降级方案：

- **纯 CSS 渐变**: 使用纯 CSS 的 `opacity` 和 `background` 渐变动画替代，性能开销小。
- **静态图片**: 在检测到性能瓶颈时 (如通过 `navigator.hardwareConcurrency` 或屏幕尺寸判断)，直接显示一张预渲染的水墨风格静态图片。

## 4. 多语言文本溢出/布局错乱

### 问题描述

切换到德语、俄语等长单词或字母较多的语言时，按钮、标签或菜单项的文本溢出容器，导致布局破坏。

### 排查方向

1. **Flexbox/Grid 限制**: 检查父容器是否使用了 `overflow-hidden` 或 `whitespace-nowrap` 等强限制。
2. **定宽元素**: 避免给包含文字的元素设置固定宽度 `w-`。应使用 `min-w-` 配合 `padding` 来控制最小尺寸，让其可以自由伸展。
3. **单词换行**: 检查是否缺少 `break-words` 或 `break-all` 类来处理长单词的强制换行。

### 解决方案

- **弹性布局**: 多使用 `flex` 和 `flex-wrap`，让元素在空间不足时能自动换行。
- **空间预留**: 在设计时就要考虑到最长语言的可能情况，为文本元素预留足够的空间或设计成可变高度。
- **CSS 截断**: 对于确实需要单行显示的，使用 Tailwind 的 `truncate` 类，它会智能地在末尾添加省略号 `...`。

## 5. PrimeVue 样式不生效

### 问题描述

使用了 PrimeVue 组件，但在 Pass Through (PT) 中设置的 Tailwind 类没有按预期生效。

### 排查方向

1. **`unstyled` 模式**: 确认是否在 Nuxt 插件中正确设置了 `primevue.config.pt = {}` 和 `primevue.config.unstyled = true`。
2. **选择器路径**: 检查 PT 对象的嵌套路径是否正确。例如，要修改 `InputText` 的根元素，路径是 `root`；但要修改 `Panel` 的头部，路径可能是 `header`。需要查阅 PrimeVue 对应组件的文档。
3. **Tailwind `content` 配置**: 确保 `tailwind.config.ts` 的 `content` 数组包含了 PrimeVue 组件的路径，这样 Tailwind 的 JIT 编译器才能扫描到这些文件中使用的类。

    ```js
    // tailwind.config.ts
    content: [
      './components/**/*.{js,vue,ts}',
      './layouts/**/*.vue',
      './pages/**/*.vue',
      './plugins/**/*.{js,ts}',
      './nuxt.config.{js,ts}',
      './node_modules/primevue/**/*.{vue,js,ts,jsx,tsx}' // <-- 加上这行
    ],
    ```

## 6. Nuxt 4 常见问题

### 6.1 组件自动导入

Nuxt 4 会自动导入 `components/` 目录下的组件，直接在模板中使用即可，无需手动 `import`。

### 6.2 页面路由

Nuxt 4 使用 `app/pages/` 目录下的文件结构自动生成路由。例如：

- `app/pages/index.vue` -> `/`
- `app/pages/about.vue` -> `/about`
- `app/pages/risk-profile/[id].vue` -> `/risk-profile/:id`

### 6.3 布局使用

使用 `app/layouts/` 目录创建布局，在页面中通过 `definePageMeta({ layout: 'default' })` 指定布局。

## 7. Tailwind CSS v4 与 v3 写法差异

### 7.1 透明度写法变化

**问题**：使用 v3 写法 `bg-opacity-*` 或 `text-opacity-*` 时不生效。

**原因**：Tailwind CSS v4 废弃了单独的 `bg-opacity-*` 和 `text-opacity-*` 类，改用新的透明色语法。

**v3 写法 (已废弃)**：

```tsx
bg-opacity-50
text-opacity-80
bg-opacity-90
```

**v4 写法 (推荐)**：

```css
// 使用透明色语法 (推荐)
bg-white/50        // 白色背景 50% 透明度
text-gray-500/80   // 灰色文字 80% 透明度
bg-blue-900/20    // 蓝色背景 20% 透明度

// 或使用通用透明度类
opacity-50   // 任何元素 50% 透明度
opacity-80   // 任何元素 80% 透明度
```

### 7.2 动画类需要插件

**问题**：使用 `animate-in`, `fade-in`, `slide-in-from-bottom-4` 等类时报错。

**原因**：这些动画类不是 Tailwind 内置的，需要 `tailwindcss-animate` 插件。

**解决方案**：

```bash
npm add -D tailwindcss-animate
```

在 `main.css` 中启用：

```css
@plugin "tailwindcss-animate";
```

### 7.3 文章排版类需要插件

**问题**：使用 `prose`, `prose-lg` 等类时报错。

**原因**：`prose` 类来自 `@tailwindcss/typography` 插件。

**解决方案**：

```bash
npm add -D @tailwindcss/typography
```

在 `main.css` 中启用：

```css
@plugin "@tailwindcss/typography";
```
