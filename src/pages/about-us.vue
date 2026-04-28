<script setup lang="ts">
import { useRouter } from 'vue-router'
import GameButton from '@/components/game-button.vue'
import MmkdStarterCredit from '@/components/mmkd-starter-credit.vue'
import { ref } from 'vue'

const router = useRouter()
const needShowingIntro = ref<boolean>(false) // Experimental
function goHome() {
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="about-us">

    <!-- ① 页面标题区 -->
    <header class="about-us__hero">
      <p class="about-us__hero-eyebrow">CREDITS</p>
      <h2 class="about-us__title">关于我们</h2>
    </header>

    <!-- ② 主体内容 -->
    <div class="about-us__body">

      <!-- 团队介绍卡片 -->
      <section class="about-us__card about-us__card--team" :class="{ 'col-span-2': !needShowingIntro }">
        <span class="about-us__card-eyebrow">团队</span>
        <h3 class="about-us__card-heading">[团队名称]</h3>
        <p class="about-us__card-text">
          [这里是团队介绍和项目信息的占位文本。]
        </p>
        <!-- 成员列表占位 -->
        <ul class="about-us__member-list">
          <li class="about-us__member">
            <span class="about-us__member-avatar">👤</span>
            <span class="about-us__member-name">[成员 A]</span>
            <span class="about-us__member-role">策划 / 程序</span>
          </li>
          <li class="about-us__member">
            <span class="about-us__member-avatar">👤</span>
            <span class="about-us__member-name">[成员 B]</span>
            <span class="about-us__member-role">美术 / 音效</span>
          </li>
        </ul>
      </section>

      <!-- 游戏信息卡片 -->
      <section v-if="needShowingIntro" class="about-us__card about-us__card--game">
        <span class="about-us__card-eyebrow">游戏</span>
        <h3 class="about-us__card-heading">[游戏名称]</h3>
        <p class="about-us__card-text">
          [游戏简介占位文本。描述游戏的核心玩法、主题或创作背景。]
        </p>
        <div class="about-us__tags">
          <span class="about-us__tag">[类型]</span>
          <span class="about-us__tag">[主题]</span>
          <span class="about-us__tag">Game Jam</span>
        </div>
      </section>

    </div>

    <!-- ③ 开源技术区（全宽，独立层级） -->
    <section class="about-us__oss-section">
      <div class="about-us__oss-header">
        <span class="about-us__card-eyebrow">开源技术</span>
        <h3 class="about-us__oss-title">站在巨人的肩膀上</h3>
        <p class="about-us__oss-desc">本游戏使用以下开源技术构建，感谢所有贡献者。</p>
      </div>

      <div class="about-us__oss-grid">
        <!-- Momakoding 脚手架（独立组件，占主位） -->
        <div class="about-us__oss-featured">
          <p class="about-us__oss-featured-label">脚手架</p>
          <MmkdStarterCredit />
        </div>

        <!-- 其他开源项目列表 -->
        <div class="about-us__oss-others">
          <p class="about-us__oss-featured-label">其他依赖</p>
          <ul class="about-us__oss-list">
            <li class="about-us__oss-item">
              <span class="about-us__oss-dot" />
              <span class="about-us__oss-item-name">Pinia</span>
              <span class="about-us__oss-item-desc">状态管理</span>
            </li>
            <li class="about-us__oss-item">
              <span class="about-us__oss-dot" />
              <span class="about-us__oss-item-name">Vue Router</span>
              <span class="about-us__oss-item-desc">路由</span>
            </li>
            <li class="about-us__oss-item">
              <span class="about-us__oss-dot" />
              <span class="about-us__oss-item-name">VueUse</span>
              <span class="about-us__oss-item-desc">组合式工具集</span>
            </li>
            <li class="about-us__oss-item">
              <span class="about-us__oss-dot" />
              <span class="about-us__oss-item-name">Lucide Icons</span>
              <span class="about-us__oss-item-desc">图标库</span>
            </li>
            <li class="about-us__oss-item about-us__oss-item--placeholder">
              <span class="about-us__oss-dot" />
              <span class="about-us__oss-item-name italic">[可在此补充其他开源项目]</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ④ Footer -->
    <footer class="about-us__footer">
      <hr class="about-us__divider" />
      <p class="about-us__quote">使用 Momakoding GameJam Starter Web 构建</p>
      <GameButton label="返回主页" @click="goHome" />
    </footer>

  </div>
</template>

<style scoped>
@reference "@/style.css";

/* ── 页面容器 ── */
.about-us {
  @apply flex min-h-screen flex-col items-center gap-12 px-6 py-14 pb-0;
}

/* ── ① Hero 标题区 ── */
.about-us__hero {
  @apply flex flex-col items-center gap-2 text-center;
}

.about-us__hero-eyebrow {
  @apply text-xs font-bold tracking-[0.25em] text-amber-500/70 uppercase;
}

.about-us__title {
  @apply text-4xl font-bold tracking-wide text-amber-400;
}

.about-us__subtitle {
  @apply text-sm text-slate-400;
}

/* ── ② 双列卡片区 ── */
.about-us__body {
  @apply grid w-full max-w-3xl grid-cols-1 gap-5 md:grid-cols-2;
}

/* 通用卡片 */
.about-us__card {
  @apply flex flex-col gap-3 rounded-2xl border border-slate-700/60 bg-slate-800/40 px-6 py-5 backdrop-blur-sm;
}

.about-us__card--team {
  @apply border-l-4 border-l-amber-500;
}

.about-us__card--game {
  @apply border-l-4 border-l-sky-500;
}

/* 卡片内部 */
.about-us__card-eyebrow {
  @apply text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500;
}

.about-us__card-heading {
  @apply text-base font-bold text-slate-100;
}

.about-us__card-text {
  @apply text-sm leading-relaxed text-slate-400;
}

/* 成员列表 */
.about-us__member-list {
  @apply mt-1 flex flex-col gap-2;
}

.about-us__member {
  @apply flex items-center gap-2 text-sm;
}

.about-us__member-avatar {
  @apply text-base;
}

.about-us__member-name {
  @apply font-medium text-slate-200;
}

.about-us__member-role {
  @apply ml-auto text-xs text-slate-500;
}

/* 游戏标签 */
.about-us__tags {
  @apply mt-1 flex flex-wrap gap-2;
}

.about-us__tag {
  @apply rounded-md border border-slate-600/50 bg-slate-700/40 px-2 py-0.5 text-xs text-slate-400;
}

/* ── ③ 开源技术区 ── */
.about-us__oss-section {
  @apply flex w-full max-w-3xl flex-col gap-5 rounded-2xl border border-sky-900/40 bg-sky-950/10 px-6 py-6;
}

.about-us__oss-header {
  @apply flex flex-col gap-1;
}

.about-us__oss-title {
  @apply text-base font-bold text-slate-100;
}

.about-us__oss-desc {
  @apply text-sm text-slate-400;
}

/* 内部两列：featured + others */
.about-us__oss-grid {
  @apply grid grid-cols-1 gap-5 sm:grid-cols-2;
}

.about-us__oss-featured-label {
  @apply mb-2 text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500;
}

/* 其他依赖列表 */
.about-us__oss-list {
  @apply flex flex-col gap-2;
}

.about-us__oss-item {
  @apply flex items-baseline gap-2 text-sm;
}

.about-us__oss-dot {
  @apply mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500/60;
}

.about-us__oss-item-name {
  @apply font-medium text-slate-300;
}

.about-us__oss-item-desc {
  @apply text-xs text-slate-500;
}

.about-us__oss-item--placeholder .about-us__oss-item-name {
  @apply text-slate-600;
}

/* ── ④ Footer ── */
.about-us__footer {
  @apply sticky bottom-0 mt-auto flex w-full flex-col items-center gap-4 px-6 py-6
         bg-slate-950/80 backdrop-blur-sm shadow-[0_-8px_24px_rgba(0,0,0,0.4)];
}

.about-us__divider {
  @apply hidden;
}

.about-us__quote {
  @apply text-xs text-slate-600;
}
</style>
