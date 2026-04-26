<template>
  <div class="game-hud" aria-hidden="false">
    <!-- 顶部左：HP + 等级 -->
    <div class="game-hud__top-left">
      <div class="game-hud__stat-card game-hud__hp-card">
        <div class="game-hud__label">生命</div>
        <div class="game-hud__hp-bar">
          <div
            class="game-hud__hp-fill"
            :class="{
              'game-hud__hp-fill--low': hpRatio < 0.35,
              'game-hud__hp-fill--crit': hpRatio < 0.15,
            }"
            :style="{ width: `${hpRatio * 100}%` }"
          />
          <span class="game-hud__hp-text">{{ Math.ceil(hud.hp) }} / {{ hud.maxHp }}</span>
        </div>
      </div>

      <div class="game-hud__stat-card game-hud__level-card">
        <div class="game-hud__label">等级</div>
        <div class="game-hud__level-value">Lv.{{ hud.level }}</div>
        <div class="game-hud__xp-bar">
          <div class="game-hud__xp-fill" :style="{ width: `${xpRatio * 100}%` }" />
        </div>
        <div class="game-hud__xp-text">
          {{ Math.floor(hud.xp) }} / {{ hud.xpToNext }} XP
        </div>
      </div>
    </div>

    <!-- 顶部中：波次 -->
    <div class="game-hud__top-center">
      <div class="game-hud__wave-card">
        <div class="game-hud__wave-label">波次</div>
        <div class="game-hud__wave-value">{{ hud.wave }}</div>
      </div>
    </div>

    <!-- 顶部右：分数 + 击杀 + 时间 -->
    <div class="game-hud__top-right">
      <div class="game-hud__stat-card">
        <div class="game-hud__label">分数</div>
        <div class="game-hud__score">{{ hud.score }}</div>
      </div>
      <div class="game-hud__stat-row">
        <div class="game-hud__mini-stat">
          <span class="game-hud__mini-label">击杀</span>
          <span class="game-hud__mini-value">{{ hud.kills }}</span>
        </div>
        <div class="game-hud__mini-stat">
          <span class="game-hud__mini-label">时间</span>
          <span class="game-hud__mini-value">{{ formatTime(hud.elapsedMs) }}</span>
        </div>
      </div>
    </div>

    <!-- 底部：武器状态 + 冲刺 CD + 静音 -->
    <div class="game-hud__bottom">
      <div class="game-hud__weapon">
        <span class="game-hud__weapon-label">武器</span>
        <span class="game-hud__weapon-value">{{ hud.weaponLabel }}</span>
      </div>

      <div class="game-hud__dash" :class="{ 'game-hud__dash--ready': dashReady }">
        <span class="game-hud__dash-key">SPACE</span>
        <span class="game-hud__dash-label">冲刺</span>
        <span class="game-hud__dash-status">
          {{ dashReady ? '就绪' : `${dashCooldownLeft.toFixed(1)}s` }}
        </span>
      </div>

      <button class="game-hud__mute" type="button" @click="$emit('toggleMute')">
        {{ muted ? '🔇' : '🔊' }}
      </button>
    </div>

    <!-- 波次开始 flash -->
    <Transition name="wave-flash">
      <div v-if="waveFlashVisible" class="game-hud__wave-flash">
        <div class="game-hud__wave-flash-title">第 {{ flashWave }} 波</div>
        <div class="game-hud__wave-flash-sub">
          {{ flashWave % 5 === 0 ? '⚠ 首领出现！' : '准备战斗' }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { IHudState } from '@/contents'

interface Props {
  hud: IHudState
  muted: boolean
  /** 最近一次 wave:start 的波次号，用于触发闪屏（父组件设置） */
  flashWave: number
}

const props = defineProps<Props>()
defineEmits<{ (e: 'toggleMute'): void }>()

const hpRatio = computed(() =>
  Math.max(0, Math.min(1, props.hud.hp / Math.max(1, props.hud.maxHp))),
)
const xpRatio = computed(() =>
  Math.max(0, Math.min(1, props.hud.xp / Math.max(1, props.hud.xpToNext))),
)

const dashCooldownLeft = computed(() =>
  Math.max(0, (props.hud.dashReadyAt - props.hud.now) / 1000),
)
const dashReady = computed(() => dashCooldownLeft.value <= 0.01)

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// wave flash —— 监听 flashWave 变化自动显示 1.4s
const waveFlashVisible = ref(false)
let flashTimer: ReturnType<typeof setTimeout> | null = null
watch(
  () => props.flashWave,
  (v) => {
    if (v <= 0) return
    waveFlashVisible.value = true
    if (flashTimer) clearTimeout(flashTimer)
    flashTimer = setTimeout(() => {
      waveFlashVisible.value = false
    }, 1400)
  },
)
</script>

<style lang="css" scoped>
@reference "@/style.css";

.game-hud {
  @apply pointer-events-none absolute inset-0 z-10 select-none text-white;
  font-family: 'Orbitron', 'Inter', system-ui, sans-serif;
}

.game-hud__top-left {
  @apply absolute top-4 left-4 flex flex-col gap-2;
}

.game-hud__top-center {
  @apply absolute top-4 left-1/2 -translate-x-1/2;
}

.game-hud__top-right {
  @apply absolute top-4 right-4 flex flex-col items-end gap-2;
}

.game-hud__stat-card {
  @apply rounded-lg border border-cyan-400/30 bg-slate-900/70 px-3 py-2 shadow-lg backdrop-blur-sm;
}

.game-hud__hp-card {
  min-width: 240px;
}

.game-hud__label {
  @apply text-[10px] uppercase tracking-widest text-cyan-300/80;
}

.game-hud__hp-bar {
  @apply relative mt-1 h-5 w-56 overflow-hidden rounded-full bg-slate-800 ring-1 ring-cyan-400/20;
}

.game-hud__hp-fill {
  @apply h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300 transition-[width,background] duration-150;
}

.game-hud__hp-fill--low {
  @apply bg-gradient-to-r from-amber-400 to-yellow-300;
}

.game-hud__hp-fill--crit {
  @apply animate-pulse bg-gradient-to-r from-rose-500 to-red-400;
}

.game-hud__hp-text {
  @apply absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-900/90;
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.4);
}

.game-hud__level-card {
  min-width: 200px;
}

.game-hud__level-value {
  @apply text-lg font-bold text-amber-300;
}

.game-hud__xp-bar {
  @apply mt-1 h-2 w-48 overflow-hidden rounded-full bg-slate-800;
}

.game-hud__xp-fill {
  @apply h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-[width] duration-150;
}

.game-hud__xp-text {
  @apply mt-0.5 text-[10px] text-slate-300/80;
}

.game-hud__wave-card {
  @apply rounded-xl border border-fuchsia-400/40 bg-slate-900/70 px-6 py-2 text-center shadow-[0_0_20px_rgba(217,70,239,0.35)] backdrop-blur-sm;
}

.game-hud__wave-label {
  @apply text-[10px] uppercase tracking-[0.3em] text-fuchsia-300/80;
}

.game-hud__wave-value {
  @apply text-2xl font-bold text-fuchsia-200;
  text-shadow: 0 0 12px rgba(232, 121, 249, 0.6);
}

.game-hud__score {
  @apply text-2xl font-bold text-amber-300;
  text-shadow: 0 0 8px rgba(251, 191, 36, 0.5);
}

.game-hud__stat-row {
  @apply flex gap-2 rounded-lg bg-slate-900/60 px-3 py-1 text-xs backdrop-blur-sm;
}

.game-hud__mini-label {
  @apply mr-1 text-slate-400;
}

.game-hud__mini-value {
  @apply font-bold text-slate-100;
}

.game-hud__bottom {
  @apply pointer-events-auto absolute right-4 bottom-4 left-4 flex items-center justify-between;
}

.game-hud__weapon,
.game-hud__dash {
  @apply flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-slate-900/70 px-3 py-1.5 text-xs backdrop-blur-sm;
}

.game-hud__weapon-label,
.game-hud__dash-label {
  @apply uppercase tracking-widest text-cyan-300/70;
}

.game-hud__weapon-value {
  @apply font-bold text-cyan-200;
}

.game-hud__dash-key {
  @apply rounded border border-slate-500 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-200;
}

.game-hud__dash-status {
  @apply font-bold text-slate-300;
}

.game-hud__dash--ready .game-hud__dash-status {
  @apply text-emerald-300;
}

.game-hud__mute {
  @apply cursor-pointer rounded-full border border-cyan-400/30 bg-slate-900/70 px-3 py-1.5 text-lg transition hover:bg-slate-800/70;
}

.game-hud__wave-flash {
  @apply pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 text-center;
  text-shadow: 0 0 18px rgba(34, 211, 238, 0.8);
}

.game-hud__wave-flash-title {
  @apply text-6xl font-black tracking-widest text-cyan-200;
}

.game-hud__wave-flash-sub {
  @apply text-xl font-semibold tracking-widest text-fuchsia-300;
}

.wave-flash-enter-active,
.wave-flash-leave-active {
  transition: all 0.4s ease;
}

.wave-flash-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.6);
}

.wave-flash-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(1.2);
}
</style>
