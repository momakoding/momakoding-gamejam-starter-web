<template>
  <Transition name="level-up">
    <div v-if="payload" class="level-up-overlay" @contextmenu.prevent>
      <div class="level-up-overlay__panel">
        <div class="level-up-overlay__banner">
          <span class="level-up-overlay__banner-flare">⚡</span>
          <span>升级 · Lv.{{ payload.newLevel }}</span>
          <span class="level-up-overlay__banner-flare">⚡</span>
        </div>
        <div class="level-up-overlay__subtitle">选择一项强化</div>

        <div class="level-up-overlay__choices">
          <button
            v-for="choice in payload.choices"
            :key="choice.id"
            type="button"
            class="level-up-overlay__choice"
            :class="`level-up-overlay__choice--${choice.tier}`"
            @click="$emit('pick', choice.id)"
          >
            <span class="level-up-overlay__choice-icon">
              {{ iconOf(choice.icon) }}
            </span>
            <span class="level-up-overlay__choice-title">{{ choice.title }}</span>
            <span class="level-up-overlay__choice-tier">
              {{ tierLabel(choice.tier) }}
            </span>
            <span class="level-up-overlay__choice-desc">{{ choice.description }}</span>
          </button>
        </div>

        <div class="level-up-overlay__hint">点击一项来继续战斗</div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { ILevelUpPayload, IUpgradeOption, UpgradeId } from '@/contents'

interface Props {
  payload: ILevelUpPayload | null
}

defineProps<Props>()
defineEmits<{ (e: 'pick', id: UpgradeId): void }>()

function iconOf(icon: string): string {
  const map: Record<string, string> = {
    sword: '⚔️',
    zap: '⚡',
    'fast-forward': '💨',
    shield: '🛡️',
    scatter: '✳️',
    arrow: '➤',
    magnet: '🧲',
    star: '⭐',
    wind: '💫',
    heart: '❤️',
  }
  return map[icon] ?? '✦'
}

function tierLabel(tier: IUpgradeOption['tier']): string {
  if (tier === 'rare') return '稀有'
  if (tier === 'epic') return '史诗'
  return '普通'
}
</script>

<style lang="css" scoped>
@reference "@/style.css";

.level-up-overlay {
  @apply absolute inset-0 z-30 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm;
}

.level-up-overlay__panel {
  @apply flex w-full max-w-3xl flex-col items-center gap-4 rounded-2xl border border-cyan-400/40 bg-slate-900/90 px-10 py-8 shadow-[0_0_60px_rgba(34,211,238,0.25)];
}

.level-up-overlay__banner {
  @apply flex items-center gap-3 text-4xl font-black tracking-widest text-amber-300;
  text-shadow: 0 0 16px rgba(251, 191, 36, 0.6);
}

.level-up-overlay__banner-flare {
  @apply text-3xl text-cyan-300;
  animation: pulse-flare 1.2s ease-in-out infinite;
}

@keyframes pulse-flare {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.25); opacity: 0.6; }
}

.level-up-overlay__subtitle {
  @apply text-sm uppercase tracking-[0.4em] text-slate-400;
}

.level-up-overlay__choices {
  @apply grid w-full gap-4;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.level-up-overlay__choice {
  @apply flex flex-col items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-5 text-center transition hover:-translate-y-1 hover:border-cyan-300 hover:bg-slate-800 hover:shadow-[0_0_24px_rgba(34,211,238,0.35)] focus:outline-none focus:ring-2 focus:ring-cyan-400;
}

.level-up-overlay__choice--rare {
  @apply border-fuchsia-400/60 shadow-[0_0_16px_rgba(217,70,239,0.2)];
}

.level-up-overlay__choice--epic {
  @apply border-amber-400/70 shadow-[0_0_20px_rgba(251,191,36,0.25)];
}

.level-up-overlay__choice-icon {
  @apply text-4xl;
}

.level-up-overlay__choice-title {
  @apply text-lg font-bold text-cyan-100;
}

.level-up-overlay__choice-tier {
  @apply rounded-full bg-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-widest text-slate-300;
}

.level-up-overlay__choice--rare .level-up-overlay__choice-tier {
  @apply bg-fuchsia-600/40 text-fuchsia-100;
}

.level-up-overlay__choice--epic .level-up-overlay__choice-tier {
  @apply bg-amber-500/30 text-amber-100;
}

.level-up-overlay__choice-desc {
  @apply text-sm text-slate-300;
}

.level-up-overlay__hint {
  @apply text-xs tracking-widest text-slate-500;
}

.level-up-enter-active,
.level-up-leave-active {
  transition: opacity 0.25s ease;
}

.level-up-enter-active .level-up-overlay__panel,
.level-up-leave-active .level-up-overlay__panel {
  transition: transform 0.3s cubic-bezier(0.33, 1.4, 0.5, 1);
}

.level-up-enter-from,
.level-up-leave-to {
  opacity: 0;
}

.level-up-enter-from .level-up-overlay__panel {
  transform: scale(0.8);
}

.level-up-leave-to .level-up-overlay__panel {
  transform: scale(1.05);
}
</style>
