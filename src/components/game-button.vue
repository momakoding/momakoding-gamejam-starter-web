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
  <button class="game-button" :class="[variant === 'primary' ? 'game-button--primary' : 'game-button--secondary']">
    {{ label }}
  </button>
</template>

<style lang="css" scoped>
@reference "@/style.css";

.game-button {
  @apply min-w-48 cursor-pointer rounded-lg px-8 py-3 text-lg font-semibold tracking-wide transition-all duration-200;
}

.game-button--primary {
  @apply bg-accent text-text-dark hover:bg-accent-light active:bg-accent-dim;
}

.game-button--secondary {
  @apply border border-text-muted bg-transparent text-text-secondary hover:border-text-secondary hover:text-text-primary active:bg-bg-surface;
}
</style>
