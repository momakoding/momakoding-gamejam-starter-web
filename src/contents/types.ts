/**
 * Scene 初始化 / EventBus 载荷的类型集合。
 *
 * 任何通过 EventBus 传递、且结构 > 1 个字段的对象都必须在这里建类型，
 * 两端都 import 同一个定义。
 */

// ---- Scene init data ----
export interface IGameSceneData {
  /** 重玩时沿用的起始分数（常见用途：死亡后保留部分分数） */
  startScore?: number
}

// ---- HUD 全量状态（Phaser → Vue） ----
export interface IHudState {
  hp: number
  maxHp: number
  score: number
  wave: number
  level: number
  xp: number
  xpToNext: number
  weaponLabel: string
  elapsedMs: number
  kills: number
  dashReadyAt: number
  now: number
}

// ---- 升级选择项 ----
export type UpgradeId =
  | 'damage-up'
  | 'fire-rate-up'
  | 'speed-up'
  | 'max-hp-up'
  | 'multi-shot'
  | 'pierce-up'
  | 'pickup-radius'
  | 'xp-mult'
  | 'bullet-speed'
  | 'heal'

export interface IUpgradeOption {
  id: UpgradeId
  title: string
  description: string
  tier: 'common' | 'rare' | 'epic'
  icon: string
}

export interface ILevelUpPayload {
  newLevel: number
  choices: IUpgradeOption[]
}

// ---- Game Over ----
export interface IGameOverPayload {
  finalScore: number
  highScore: number
  isNewHighScore: boolean
  wave: number
  level: number
  kills: number
  survivedMs: number
}
