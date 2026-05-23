import { reactive, watch } from 'vue'

export type Language = 'zh-CN' | 'en'

interface Settings {
  bgmVolume: number
  sfxVolume: number
  muted: boolean
  language: Language
}

const STORAGE_KEY = 'game-settings'

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaults(), ...JSON.parse(raw) }
  } catch {}
  return defaults()
}

function defaults(): Settings {
  return { bgmVolume: 80, sfxVolume: 80, muted: false, language: 'zh-CN' }
}

const state = reactive<Settings>(loadSettings())

watch(state, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
})

export function useSettings() {
  return state
}
