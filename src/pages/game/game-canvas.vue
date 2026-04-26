<template>
  <div ref="gameContainer" class="game-canvas" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { BootScene, GameScene } from '@/contents'
import { useGame } from '@/runtime'

/**
 * Phaser 画布的挂载点。
 *
 * 单一职责：
 *   - 挂载：initGame(container, BootScene) + addScene(GameScene)
 *   - 卸载：destroyGame(removeCanvas=true)
 *
 * HUD / overlays 都是同级兄弟组件，不往这里塞。
 */

const gameContainer = ref<HTMLDivElement | null>(null)
const game = useGame()

onMounted(() => {
  if (!gameContainer.value) return
  game.initGame(gameContainer.value, BootScene)
  game.addScene(GameScene)
})

onBeforeUnmount(() => {
  game.destroyGame(true)
})
</script>

<style lang="css" scoped>
@reference "@/style.css";

.game-canvas {
  @apply relative flex items-center justify-center;
}

.game-canvas :deep(canvas) {
  @apply block rounded-lg shadow-[0_0_60px_rgba(34,211,238,0.15)];
}
</style>
