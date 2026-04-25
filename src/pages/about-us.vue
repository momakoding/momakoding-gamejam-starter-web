<script setup lang="ts">
import { useRouter } from 'vue-router'
import GameButton from '@/components/game-button.vue'

const router = useRouter()

function goHome() {
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="about-us">
    <h2 class="about-us__title">关于我们</h2>

    <div class="about-us__content">
      <p>Momakoding</p>
      <p class="about-us__placeholder-text">这里是团队介绍和项目信息的占位文本。</p>
    </div>

    <footer class="about-us__footer">
      <blockquote>使用Momakoding GameJam Starter Web构建</blockquote>
      <GameButton label="返回主页" @click="goHome" />
    </footer>
  </div>
</template>

<style lang="css" scoped>
@reference "@/style.css";

.about-us {
  @apply flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-10;
}

.about-us__title {
  @apply text-4xl font-bold text-amber-400;
}

.about-us__content {
  @apply max-w-lg flex-1 text-center leading-relaxed text-slate-300;
}

.about-us__placeholder-text {
  @apply mt-4;
}

.about-us__footer {
  @apply flex flex-col items-center;
}
</style>
