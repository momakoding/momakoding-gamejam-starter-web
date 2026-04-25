<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GameButton from '@/components/game-button.vue'

const route = useRoute()
const router = useRouter()

const fromStart = computed(() => route.query.from === 'start')

function handleAction() {
  if (fromStart.value) {
    router.push({ name: 'game' })
  } else {
    router.push({ name: 'home' })
  }
}
</script>

<template>
  <div class="how-to-play">
    <h2 class="how-to-play__title">玩法介绍</h2>

    <div class="how-to-play__content">
      <p>这里是玩法介绍的占位文本。</p>
      <p class="how-to-play__placeholder-text">游戏的核心玩法、操作方式和目标将在此处说明。</p>
    </div>

    <GameButton
      :label="fromStart ? '开始游戏' : '返回主页'"
      @click="handleAction"
    />
  </div>
</template>

<style lang="css" scoped>
@reference "@/style.css";

.how-to-play {
  @apply flex min-h-screen flex-col items-center justify-center gap-10 px-6;
}

.how-to-play__title {
  @apply text-4xl font-bold text-amber-400;
}

.how-to-play__content {
  @apply max-w-lg text-center leading-relaxed text-slate-300;
}

.how-to-play__placeholder-text {
  @apply mt-4;
}
</style>
