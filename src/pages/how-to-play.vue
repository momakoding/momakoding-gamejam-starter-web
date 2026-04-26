<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GameButton from '@/components/game-button.vue'

const route = useRoute()
const router = useRouter()

const fromStart = computed(() => route.query.from === 'start')

function handleAction() {
  if (fromStart.value) {
    router.push({ name: 'game' })
  } else {
    router.push({ name: 'home' })
  }
}

const controls: { keys: string; description: string }[] = [
  { keys: 'W · A · S · D', description: '移动（也支持方向键）' },
  { keys: '自动攻击', description: '枪会自动瞄准最近的敌人并持续开火，你只管走位' },
  { keys: 'SPACE', description: '朝当前移动方向冲刺，短暂无敌' },
  { keys: 'ESC', description: '暂停 / 继续' },
]

const tips: string[] = [
  '你不需要控制射击：枪会自动锁定最近的敌人，只管专心走位。',
  '敌人会在玩家周围的环形区域生成；保持移动，不要贴墙被夹击。',
  '击杀敌人会掉落蓝色经验宝石，靠近自动吸附，收集升级。',
  '每次升级可以从 3 个强化中挑一个：连发、穿透、扩散、磁力……自由组合。',
  '每 5 波会刷出首领，它有扇形弹幕，冲刺躲开；击败后必掉血包。',
  '血量较低时，普通敌人掉落血包的概率会提升。',
]
</script>

<template>
  <div class="how-to-play">
    <h2 class="how-to-play__title">玩法介绍</h2>

    <section class="how-to-play__section">
      <h3 class="how-to-play__section-title">核心目标</h3>
      <p class="how-to-play__lead">
        在霓虹竞技场中活下去。每一波敌人都比上一波更凶，击杀敌人收集经验、选择强化、迎接下一波。
      </p>
    </section>

    <section class="how-to-play__section">
      <h3 class="how-to-play__section-title">操作</h3>
      <ul class="how-to-play__controls">
        <li
          v-for="c in controls"
          :key="c.keys"
          class="how-to-play__control"
        >
          <span class="how-to-play__keys">{{ c.keys }}</span>
          <span class="how-to-play__desc">{{ c.description }}</span>
        </li>
      </ul>
    </section>

    <section class="how-to-play__section">
      <h3 class="how-to-play__section-title">生存要点</h3>
      <ul class="how-to-play__tips">
        <li v-for="(t, i) in tips" :key="i">{{ t }}</li>
      </ul>
    </section>

    <GameButton
      :label="fromStart ? '进入竞技场' : '返回主页'"
      @click="handleAction"
    />
  </div>
</template>

<style lang="css" scoped>
@reference "@/style.css";

.how-to-play {
  @apply flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-10;
}

.how-to-play__title {
  @apply text-4xl font-bold tracking-widest text-amber-400;
  text-shadow: 0 0 16px rgba(251, 191, 36, 0.35);
}

.how-to-play__section {
  @apply w-full max-w-xl rounded-xl border border-cyan-400/20 bg-slate-900/60 p-5;
}

.how-to-play__section-title {
  @apply mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300/80;
}

.how-to-play__lead {
  @apply text-base leading-relaxed text-slate-300;
}

.how-to-play__controls {
  @apply flex flex-col gap-2;
}

.how-to-play__control {
  @apply flex items-baseline gap-4;
}

.how-to-play__keys {
  @apply min-w-32 rounded bg-slate-800 px-2 py-1 text-center font-mono text-xs tracking-wider text-cyan-200;
}

.how-to-play__desc {
  @apply text-sm text-slate-300;
}

.how-to-play__tips {
  @apply flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed text-slate-300;
}
</style>
