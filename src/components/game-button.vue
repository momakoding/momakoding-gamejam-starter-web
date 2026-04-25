<script setup lang="ts">
interface Props {
  label: string
  variant?: 'primary' | 'secondary'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
})
</script>

<template>
  <button
    class="game-button"
    :class="[variant === 'primary' ? 'game-button--primary' : 'game-button--secondary']"
  >
    {{ label }}
  </button>
</template>

<style lang="css" scoped>
@reference "@/style.css";

.game-button {
  @apply min-w-48 cursor-pointer rounded-lg px-8 py-3 text-lg font-semibold tracking-wide transition-all duration-200;
}

.game-button--primary {
  @apply bg-amber-500 text-slate-900 hover:bg-amber-400 active:bg-amber-600;
}

.game-button--secondary {
  @apply border border-slate-500 bg-transparent text-slate-300 hover:border-slate-400 hover:text-white active:bg-slate-800;
}
</style>
