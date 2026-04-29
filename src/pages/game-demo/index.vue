<template>
  <div class="game-demo">
    <!-- Phaser 画布挂载点 -->
    <div ref="gameContainer" class="game-demo__canvas">
      <!-- Vue HUD 层：叠在 Phaser 画布上方 -->
      <div class="game-demo__hud">
        <span class="game-demo__score">⭐ 分数: {{ score }}</span>
        <button class="game-demo__restart-btn" @click="restartGame">
          重新开始
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { EVENT_KEYS, BootScene, GameScene } from '@/contents'
import { useEventBus, useGame } from '@/runtime'

const gameContainer = ref<HTMLDivElement>()
const score = ref(0)
const eventBus = useEventBus()
const game = useGame()

/** 监听 Phaser 发来的分数更新 */
const onScoreUpdate = (newScore: unknown) => {
  score.value = newScore as number
}

/** Vue 侧触发重启 */
const restartGame = () => {
  score.value = 0
  eventBus.emit(EVENT_KEYS.GAME_RESTART)
}

onMounted(() => {
  if (!gameContainer.value) return

  // 监听事件
  eventBus.on(EVENT_KEYS.SCORE_UPDATE, onScoreUpdate)

  // 创建 Phaser 实例：BootScene 作为初始场景，GameScene 后续动态加入
  game.initGame(gameContainer.value, BootScene)
  game.addScene(GameScene)
})

onUnmounted(() => {
  // 精确 off，而非 clear()：避免误清 pages/game.vue 挂的 pause/resume 监听
  eventBus.off(EVENT_KEYS.SCORE_UPDATE, onScoreUpdate)

  game.destroyGame(true)
})
</script>

<style lang="css" scoped>
@reference "@/style.css";

.game-demo {
  @apply relative flex min-h-screen items-center justify-center bg-bg-overlay;
}

.game-demo__canvas {
  @apply relative;
}

.game-demo__hud {
  @apply pointer-events-none absolute top-0 right-0 left-0 z-10 flex items-center justify-between px-4 py-2;
}

.game-demo__score {
  @apply text-lg font-bold text-accent-light;
}

.game-demo__restart-btn {
  @apply pointer-events-auto rounded bg-danger px-3 py-1 text-sm text-text-primary transition hover:bg-danger-light;
}
</style>
