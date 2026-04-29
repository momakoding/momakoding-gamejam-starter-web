<script setup lang="ts">
import { useRouter } from 'vue-router'
import GameButton from '@/components/game-button.vue'
import { GAME_META } from '@/contents/game-info'

interface MenuItem {
	label: string
	variant: 'primary' | 'secondary'
	onClick: () => void
}

const router = useRouter()

const menuItems: MenuItem[] = [
	{
		label: '开始游戏',
		variant: 'primary',
		onClick: () => router.push({ name: 'how-to-play', query: { from: 'start' } }),
	},
	{
		label: '玩法介绍',
		variant: 'secondary',
		onClick: () => router.push({ name: 'how-to-play', query: { from: 'menu' } }),
	}, {
		label: '设置',
		variant: 'secondary',
		onClick: () => router.push({ name: 'settings' }),
	},
	{
		label: '关于我们',
		variant: 'secondary',
		onClick: () => router.push({ name: 'about-us' }),
	},
	{
		label: '退出游戏',
		variant: 'secondary',
		onClick: () => {
			window.close()
			window.location.href = 'about:blank'
		},
	},
]
</script>

<template>
	<div class="home-page">
		<h1 class="home-page__title">{{ GAME_META.title }}</h1>
		<p v-if="GAME_META.subtitle && GAME_META.subtitle !== ''" class="home-page__subtitle">
			{{ GAME_META.subtitle }}
		</p>

		<nav class="home-page__nav">
			<GameButton v-for="item in menuItems" :key="item.label" :label="item.label" :variant="item.variant"
				@click="item.onClick" />
		</nav>
	</div>
</template>

<style lang="css" scoped>
@reference "@/style.css";

.home-page {
	@apply flex h-screen flex-col items-center justify-center gap-12;
}

.home-page__title {
	@apply text-5xl font-bold tracking-widest text-accent-light;
}

.home-page__nav {
	@apply flex flex-col items-center gap-4;
}
</style>
