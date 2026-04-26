<template>
  <div class="game-page" @contextmenu.prevent>
    <div class="game-page__frame">
      <GameCanvas />
      <GameHud
        :hud="hud"
        :muted="muted"
        :flash-wave="flashWave"
        @toggle-mute="onToggleMute"
      />
      <LevelUpOverlay :payload="levelUpPayload" @pick="onPickUpgrade" />
      <PauseOverlay :visible="isPaused" @resume="resumeGame" @home="goHome" />
      <GameOverOverlay
        :payload="gameOverPayload"
        @restart="restartGame"
        @home="goHome"
      />

      <button
        v-if="!isPaused && !gameOverPayload && !levelUpPayload"
        class="game-page__pause-trigger"
        type="button"
        @click="pauseGame"
      >
        ⏸ 暂停
      </button>

      <div class="game-page__hint">
        <span class="game-page__hint-key">WASD</span> 移动
        <span>自动瞄准 / 射击</span>
        <span class="game-page__hint-key">SPACE</span> 冲刺
        <span class="game-page__hint-key">ESC</span> 暂停
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import GameCanvas from './game-canvas.vue'
import GameHud from './game-hud.vue'
import LevelUpOverlay from './level-up-overlay.vue'
import PauseOverlay from './pause-overlay.vue'
import GameOverOverlay from './game-over-overlay.vue'
import {
  EVENT_KEYS,
  type IHudState,
  type ILevelUpPayload,
  type IGameOverPayload,
  type UpgradeId,
  PLAYER_BASE,
} from '@/contents'
import { useEventBus } from '@/runtime'

/**
 * 游戏页面的顶层协调者。
 *
 * 单一职责：
 *   - 管理 UI 层状态（hud 缓存、暂停、升级/死亡 overlay）
 *   - 桥接 Vue 键鼠 ↔ EventBus ↔ Phaser
 *   - 不直接操控 Phaser 对象（全部通过事件）
 */

const router = useRouter()
const eventBus = useEventBus()

const hud = reactive<IHudState>({
  hp: PLAYER_BASE.MAX_HP,
  maxHp: PLAYER_BASE.MAX_HP,
  score: 0,
  wave: 0,
  level: 1,
  xp: 0,
  xpToNext: 10,
  weaponLabel: '标准',
  elapsedMs: 0,
  kills: 0,
  dashReadyAt: 0,
  now: 0,
})

const isPaused = ref(false)
const levelUpPayload = ref<ILevelUpPayload | null>(null)
const gameOverPayload = ref<IGameOverPayload | null>(null)
const flashWave = ref(0)
const muted = ref(false)

// ---- Phaser → Vue 监听器 ----

const onHudUpdate = (...args: unknown[]) => {
  const s = args[0] as IHudState
  Object.assign(hud, s)
}

const onLevelUp = (...args: unknown[]) => {
  levelUpPayload.value = args[0] as ILevelUpPayload
}

const onGameOver = (...args: unknown[]) => {
  gameOverPayload.value = args[0] as IGameOverPayload
}

const onWaveStart = (...args: unknown[]) => {
  flashWave.value = args[0] as number
}

// ---- Vue → Phaser 指令 ----

function onPickUpgrade(id: UpgradeId) {
  eventBus.emit(EVENT_KEYS.UPGRADE_SELECTED, id)
  levelUpPayload.value = null
}

function pauseGame() {
  if (gameOverPayload.value || levelUpPayload.value) return
  isPaused.value = true
  eventBus.emit(EVENT_KEYS.GAME_PAUSE)
}

function resumeGame() {
  isPaused.value = false
  eventBus.emit(EVENT_KEYS.GAME_RESUME)
}

function restartGame() {
  gameOverPayload.value = null
  levelUpPayload.value = null
  isPaused.value = false
  flashWave.value = 0
  // 重置 HUD 缓存
  Object.assign(hud, {
    hp: PLAYER_BASE.MAX_HP,
    maxHp: PLAYER_BASE.MAX_HP,
    score: 0,
    wave: 0,
    level: 1,
    xp: 0,
    xpToNext: 10,
    weaponLabel: '标准',
    elapsedMs: 0,
    kills: 0,
    dashReadyAt: 0,
    now: 0,
  })
  eventBus.emit(EVENT_KEYS.GAME_RESTART)
}

function goHome() {
  // 卸载 Phaser 的工作由 GameCanvas.onBeforeUnmount 做；这里只需切路由
  router.push({ name: 'home' })
}

function onToggleMute() {
  muted.value = !muted.value
  eventBus.emit(EVENT_KEYS.TOGGLE_MUTE)
}

// ---- ESC 暂停切换 ----

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (gameOverPayload.value || levelUpPayload.value) return
    if (isPaused.value) resumeGame()
    else pauseGame()
  }
}

onMounted(() => {
  eventBus.on(EVENT_KEYS.HUD_UPDATE, onHudUpdate)
  eventBus.on(EVENT_KEYS.LEVEL_UP, onLevelUp)
  eventBus.on(EVENT_KEYS.GAME_OVER, onGameOver)
  eventBus.on(EVENT_KEYS.WAVE_START, onWaveStart)
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  eventBus.off(EVENT_KEYS.HUD_UPDATE, onHudUpdate)
  eventBus.off(EVENT_KEYS.LEVEL_UP, onLevelUp)
  eventBus.off(EVENT_KEYS.GAME_OVER, onGameOver)
  eventBus.off(EVENT_KEYS.WAVE_START, onWaveStart)
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style lang="css" scoped>
@reference "@/style.css";

.game-page {
  @apply relative flex min-h-screen items-center justify-center bg-slate-950 p-4;
  background-image:
    radial-gradient(ellipse at top, rgba(14, 165, 233, 0.08), transparent 50%),
    radial-gradient(ellipse at bottom, rgba(232, 121, 249, 0.06), transparent 60%);
}

.game-page__frame {
  @apply relative overflow-hidden rounded-lg border border-cyan-400/20;
}

.game-page__pause-trigger {
  @apply absolute top-4 right-4 z-10 cursor-pointer rounded-lg border border-cyan-400/30 bg-slate-900/70 px-3 py-1.5 text-sm text-cyan-200/80 backdrop-blur-sm transition hover:bg-slate-800/70 hover:text-white;
  /* 避开 HUD top-right 区域，改到右上再下移一点 */
  top: 72px;
}

.game-page__hint {
  @apply pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900/60 px-4 py-1.5 text-xs text-slate-300 backdrop-blur-sm;
}

.game-page__hint-key {
  @apply ml-2 rounded border border-slate-500 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-200;
}

.game-page__hint-key:first-of-type {
  @apply ml-0;
}
</style>
