<template>
  <Transition name="pause-fade">
    <div v-if="visible" class="pause-overlay">
      <div class="pause-overlay__panel">
        <h2 class="pause-overlay__title">游戏暂停</h2>
        <div class="pause-overlay__hint">按 ESC 键可快速继续</div>

        <div class="pause-overlay__actions">
          <button
            type="button"
            class="pause-overlay__btn pause-overlay__btn--primary"
            @click="$emit('resume')"
          >
            继续游戏
          </button>
          <button
            type="button"
            class="pause-overlay__btn pause-overlay__btn--secondary"
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
interface Props {
  visible: boolean
}

defineProps<Props>()
defineEmits<{
  (e: 'resume'): void
  (e: 'home'): void
}>()
</script>

<style lang="css" scoped>
@reference "@/style.css";

.pause-overlay {
  @apply absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm;
}

.pause-overlay__panel {
  @apply flex flex-col items-center gap-4 rounded-xl border border-cyan-400/30 bg-slate-900/90 px-10 py-8 text-white;
}

.pause-overlay__title {
  @apply text-3xl font-bold tracking-widest text-cyan-200;
}

.pause-overlay__hint {
  @apply text-xs tracking-widest text-slate-400;
}

.pause-overlay__actions {
  @apply flex flex-col gap-2;
}

.pause-overlay__btn {
  @apply min-w-48 cursor-pointer rounded-lg px-6 py-2 text-base transition;
}

.pause-overlay__btn--primary {
  @apply bg-emerald-500 text-slate-900 hover:bg-emerald-400;
}

.pause-overlay__btn--secondary {
  @apply border border-slate-500 bg-transparent text-slate-300 hover:bg-slate-800;
}

.pause-fade-enter-active,
.pause-fade-leave-active {
  transition: opacity 0.2s ease;
}

.pause-fade-enter-from,
.pause-fade-leave-to {
  opacity: 0;
}
</style>
