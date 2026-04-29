<template>
  <div class="game-page">
    <!-- 游戏主体，到时候需要改成GameContainer或者是别的 -->
    <GameDemo ref="gameDemoRef" />

    <!-- 暂停遮罩 -->
    <Transition name="fade">
      <div v-if="isPaused" class="game-page__overlay">
        <div class="game-page__pause-panel">
          <h2 class="game-page__pause-title">⏸ 游戏暂停</h2>
          <button class="game-page__resume-btn" @click="resumeGame">
            继续游戏
          </button>
          <RouterLink to="/" class="game-page__exit-btn">
            退出到主页
          </RouterLink>
        </div>
      </div>
    </Transition>

    <!-- 暂停按钮（游戏进行中显示） -->
    <button v-if="!isPaused" class="game-page__pause-trigger" @click="pauseGame">
      ⏸ 暂停
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import GameDemo from './game-demo/index.vue'
import { useEventBus } from '@/runtime'
import { EVENT_KEYS } from '@/contents'

const eventBus = useEventBus()
const isPaused = ref(false)

const pauseGame = () => {
  isPaused.value = true
  eventBus.emit(EVENT_KEYS.GAME_PAUSE)
}

const resumeGame = () => {
  isPaused.value = false
  eventBus.emit(EVENT_KEYS.GAME_RESUME)
}

/** ESC 键切换暂停 */
const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (isPaused.value) resumeGame()
    else pauseGame()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style lang="css" scoped>
@reference "@/style.css";

.game-page {
  @apply relative min-h-screen bg-bg-overlay;
}

.game-page__overlay {
  @apply absolute inset-0 z-20 flex items-center justify-center bg-overlay-scrim/60 backdrop-blur-sm;
}

.game-page__pause-panel {
  @apply flex flex-col items-center gap-4 rounded-xl bg-bg-surface/90 p-8 text-text-primary;
}

.game-page__pause-title {
  @apply text-2xl font-bold;
}

.game-page__resume-btn {
  @apply rounded-lg bg-success px-6 py-2 text-lg transition hover:bg-success-light;
}

.game-page__exit-btn {
  @apply rounded-lg bg-game-border px-6 py-2 text-sm transition hover:bg-text-muted;
}

.game-page__pause-trigger {
  @apply absolute top-4 right-4 z-10 rounded-lg bg-glass/10 px-3 py-1.5 text-sm text-text-primary/70 transition hover:bg-glass/20 hover:text-text-bright;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
