<script setup lang="ts">
import { useRouter } from 'vue-router'
import GameButton from '@/components/game-button.vue'

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
	<div class="flex min-h-screen flex-col items-center justify-center gap-12">
		<h1 class="text-5xl font-bold tracking-widest text-amber-400">
			[请输入文本]
		</h1>

		<nav class="flex flex-col items-center gap-4">
			<GameButton v-for="item in menuItems" :key="item.label" :label="item.label" :variant="item.variant"
				@click="item.onClick" />
		</nav>
	</div>
</template>
