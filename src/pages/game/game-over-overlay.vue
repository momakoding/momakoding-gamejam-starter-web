<template>
  <Transition name="game-over">
    <div v-if="payload" class="game-over-overlay">
      <div class="game-over-overlay__panel">
        <h2 class="game-over-overlay__title">任务失败</h2>
        <div class="game-over-overlay__subtitle">
          你倒在了第 {{ payload.wave }} 波
        </div>

        <div class="game-over-overlay__score">
          <div class="game-over-overlay__score-label">最终分数</div>
          <div class="game-over-overlay__score-value">{{ payload.finalScore }}</div>
          <div
            v-if="payload.isNewHighScore"
            class="game-over-overlay__new-record"
          >
            ★ 新纪录
          </div>
          <div v-else class="game-over-overlay__high">
            最高：{{ payload.highScore }}
          </div>
        </div>

        <div class="game-over-overlay__stats">
          <div class="game-over-overlay__stat">
            <span class="game-over-overlay__stat-label">等级</span>
            <span class="game-over-overlay__stat-value">Lv.{{ payload.level }}</span>
          </div>
          <div class="game-over-overlay__stat">
            <span class="game-over-overlay__stat-label">击杀</span>
            <span class="game-over-overlay__stat-value">{{ payload.kills }}</span>
          </div>
          <div class="game-over-overlay__stat">
            <span class="game-over-overlay__stat-label">时间</span>
            <span class="game-over-overlay__stat-value">{{ formatTime(payload.survivedMs) }}</span>
          </div>
        </div>

        <div class="game-over-overlay__actions">
          <button
            type="button"
            class="game-over-overlay__btn game-over-overlay__btn--primary"
            @click="$emit('restart')"
          >
            再战一局
          </button>
          <button
            type="button"
            class="game-over-overlay__btn game-over-overlay__btn--secondary"
            @click="$emit('home')"
          >
            退出到主页
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { IGameOverPayload } from '@/contents'

interface Props {
  payload: IGameOverPayload | null
}

defineProps<Props>()
defineEmits<{
  (e: 'restart'): void
  (e: 'home'): void
}>()

function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
</script>

<style lang="css" scoped>
@reference "@/style.css";

.game-over-overlay {
  @apply absolute inset-0 z-40 flex items-center justify-center bg-slate-950/85 backdrop-blur-md;
}

.game-over-overlay__panel {
  @apply flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-rose-500/40 bg-slate-900/95 px-10 py-10 shadow-[0_0_80px_rgba(244,63,94,0.3)];
}

.game-over-overlay__title {
  @apply text-5xl font-black tracking-widest text-rose-400;
  text-shadow: 0 0 20px rgba(244, 63, 94, 0.6);
}

.game-over-overlay__subtitle {
  @apply text-sm uppercase tracking-widest text-slate-400;
}

.game-over-overlay__score {
  @apply flex flex-col items-center gap-1 rounded-xl border border-amber-400/30 bg-slate-950/50 px-8 py-4;
}

.game-over-overlay__score-label {
  @apply text-xs uppercase tracking-widest text-amber-300/80;
}

.game-over-overlay__score-value {
  @apply text-4xl font-black text-amber-200;
  text-shadow: 0 0 16px rgba(251, 191, 36, 0.6);
}

.game-over-overlay__new-record {
  @apply animate-pulse text-sm font-bold tracking-widest text-cyan-300;
}

.game-over-overlay__high {
  @apply text-xs text-slate-400;
}

.game-over-overlay__stats {
  @apply grid w-full grid-cols-3 gap-2;
}

.game-over-overlay__stat {
  @apply flex flex-col items-center rounded-lg bg-slate-800/60 px-2 py-2;
}

.game-over-overlay__stat-label {
  @apply text-[10px] uppercase tracking-widest text-slate-400;
}

.game-over-overlay__stat-value {
  @apply text-lg font-bold text-cyan-200;
}

.game-over-overlay__actions {
  @apply flex w-full flex-col gap-2;
}

.game-over-overlay__btn {
  @apply cursor-pointer rounded-lg px-6 py-3 text-base font-semibold tracking-wide transition;
}

.game-over-overlay__btn--primary {
  @apply bg-amber-500 text-slate-900 hover:bg-amber-400;
}

.game-over-overlay__btn--secondary {
  @apply border border-slate-500 bg-transparent text-slate-300 hover:bg-slate-800;
}

.game-over-enter-active,
.game-over-leave-active {
  transition: opacity 0.4s ease;
}

.game-over-enter-active .game-over-overlay__panel,
.game-over-leave-active .game-over-overlay__panel {
  transition: transform 0.4s cubic-bezier(0.33, 1.2, 0.5, 1);
}

.game-over-enter-from,
.game-over-leave-to {
  opacity: 0;
}

.game-over-enter-from .game-over-overlay__panel {
  transform: translateY(40px);
}
</style>
