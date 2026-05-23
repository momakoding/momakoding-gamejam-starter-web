<script setup lang="ts">
import { useRouter } from 'vue-router'
import GameButton from '@/components/game-button.vue'
import { useSettings, type Language } from '@/composables'

const router = useRouter()
const settings = useSettings()

const languages: { value: Language; label: string }[] = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en', label: 'English' },
]
</script>

<template>
  <div class="settings">
    <h2 class="settings__title">设置</h2>

    <div class="settings__panel">
      <!-- Audio -->
      <section class="settings__section">
        <h3 class="settings__section-title">音频</h3>

        <div class="settings__row">
          <label class="settings__label">静音</label>
          <button
            class="settings__toggle"
            :class="{ 'settings__toggle--on': settings.muted }"
            @click="settings.muted = !settings.muted"
          >
            <span class="settings__toggle-knob" />
          </button>
        </div>

        <div class="settings__row" :class="{ 'settings__row--disabled': settings.muted }">
          <label class="settings__label">背景音乐</label>
          <div class="settings__slider-wrap">
            <input
              v-model.number="settings.bgmVolume"
              type="range"
              min="0"
              max="100"
              step="1"
              class="settings__slider"
              :disabled="settings.muted"
            />
            <span class="settings__slider-value">{{ settings.bgmVolume }}</span>
          </div>
        </div>

        <div class="settings__row" :class="{ 'settings__row--disabled': settings.muted }">
          <label class="settings__label">音效</label>
          <div class="settings__slider-wrap">
            <input
              v-model.number="settings.sfxVolume"
              type="range"
              min="0"
              max="100"
              step="1"
              class="settings__slider"
              :disabled="settings.muted"
            />
            <span class="settings__slider-value">{{ settings.sfxVolume }}</span>
          </div>
        </div>
      </section>

      <!-- Language -->
      <section class="settings__section">
        <h3 class="settings__section-title">语言 / Language</h3>
        <div class="settings__row">
          <label class="settings__label">界面语言</label>
          <div class="settings__lang-group">
            <button
              v-for="lang in languages"
              :key="lang.value"
              class="settings__lang-btn"
              :class="{ 'settings__lang-btn--active': settings.language === lang.value }"
              @click="settings.language = lang.value"
            >
              {{ lang.label }}
            </button>
          </div>
        </div>
        <p class="settings__hint">* 语言切换功能尚未完全实现</p>
      </section>
    </div>

    <GameButton label="返回主页" variant="secondary" @click="router.push({ name: 'home' })" />
  </div>
</template>

<style lang="css" scoped>
@reference "@/style.css";

.settings {
  @apply flex h-screen flex-col items-center justify-center gap-10 px-6 py-14 overflow-y-auto;
}

.settings__title {
  @apply text-4xl font-bold text-accent-light;
}

.settings__panel {
  @apply w-full max-w-md flex flex-col gap-8;
}

/* ── section ── */
.settings__section {
  @apply flex flex-col gap-4;
}

.settings__section-title {
  @apply text-sm font-semibold uppercase tracking-widest text-text-muted border-b border-border-subtle pb-2;
}

/* ── row ── */
.settings__row {
  @apply flex items-center justify-between gap-4 transition-opacity duration-200;
}

.settings__row--disabled {
  @apply opacity-40 pointer-events-none;
}

.settings__label {
  @apply text-sm text-text-secondary shrink-0 w-24;
}

/* ── toggle ── */
.settings__toggle {
  @apply relative w-11 h-6 rounded-full bg-border-subtle transition-colors duration-200 cursor-pointer;
}

.settings__toggle--on {
  @apply bg-accent;
}

.settings__toggle-knob {
  @apply absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-text-primary transition-transform duration-200;
}

.settings__toggle--on .settings__toggle-knob {
  @apply translate-x-5;
}

/* ── slider ── */
.settings__slider-wrap {
  @apply flex items-center gap-3 flex-1;
}

.settings__slider {
  @apply flex-1 h-1 rounded-full appearance-none cursor-pointer bg-border-subtle accent-accent;
}

.settings__slider-value {
  @apply text-xs text-text-muted w-8 text-right tabular-nums;
}

/* ── lang buttons ── */
.settings__lang-group {
  @apply flex gap-2;
}

.settings__lang-btn {
  @apply px-3 py-1 rounded-md text-sm border border-border-subtle text-text-secondary
         transition-colors duration-150 cursor-pointer
         hover:border-text-secondary hover:text-text-primary;
}

.settings__lang-btn--active {
  @apply border-accent text-accent bg-accent/10;
}

/* ── hint ── */
.settings__hint {
  @apply text-xs text-text-muted;
}
</style>
