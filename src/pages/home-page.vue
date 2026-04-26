<script setup lang="ts">
import { useRouter } from 'vue-router'
import GameButton from '@/components/game-button.vue'

interface MenuItem {
  label: string
  variant: 'primary' | 'secondary'
  onClick: () => void
}

const router = useRouter()

const menuItems: MenuItem[] = [
  {
    label: '开始游戏',
    variant: 'primary',
    onClick: () => router.push({ name: 'how-to-play', query: { from: 'start' } }),
  },
  {
    label: '玩法介绍',
    variant: 'secondary',
    onClick: () => router.push({ name: 'how-to-play', query: { from: 'menu' } }),
  },
  {
    label: '关于我们',
    variant: 'secondary',
    onClick: () => router.push({ name: 'about-us' }),
  },
  {
    label: '退出游戏',
    variant: 'secondary',
    onClick: () => {
      window.close()
      window.location.href = 'about:blank'
    },
  },
]
</script>

<template>
  <div class="home-page">
    <div class="home-page__backdrop" />

    <div class="home-page__hero">
      <div class="home-page__eyebrow">生存射击 · Survival Shooter</div>
      <h1 class="home-page__title">NEON HUNTER</h1>
      <p class="home-page__tagline">
        霓虹竞技场里，没有终点。只有下一波。
      </p>
    </div>

    <nav class="home-page__nav">
      <GameButton
        v-for="item in menuItems"
        :key="item.label"
        :label="item.label"
        :variant="item.variant"
        @click="item.onClick"
      />
    </nav>

    <footer class="home-page__footer">
      v0.1 · WASD 移动 · 自动射击 · SPACE 冲刺
    </footer>
  </div>
</template>

<style lang="css" scoped>
@reference "@/style.css";

.home-page {
  @apply relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden px-6;
}

.home-page__backdrop {
  @apply pointer-events-none absolute inset-0 -z-10;
  background-image:
    radial-gradient(circle at 30% 20%, rgba(34, 211, 238, 0.18), transparent 55%),
    radial-gradient(circle at 70% 80%, rgba(232, 121, 249, 0.18), transparent 55%),
    repeating-linear-gradient(
      0deg,
      rgba(15, 23, 42, 0),
      rgba(15, 23, 42, 0) 6px,
      rgba(34, 211, 238, 0.04) 7px,
      rgba(15, 23, 42, 0) 8px
    );
}

.home-page__hero {
  @apply flex flex-col items-center gap-2;
}

.home-page__eyebrow {
  @apply text-xs uppercase tracking-[0.6em] text-cyan-300/80;
}

.home-page__title {
  @apply text-7xl font-black tracking-[0.25em] text-amber-300;
  text-shadow:
    0 0 24px rgba(251, 191, 36, 0.55),
    0 0 2px rgba(34, 211, 238, 0.6);
}

.home-page__tagline {
  @apply mt-2 max-w-md text-center text-base tracking-wide text-slate-300;
}

.home-page__nav {
  @apply flex flex-col items-center gap-3;
}

.home-page__footer {
  @apply text-xs tracking-widest text-slate-500;
}
</style>
