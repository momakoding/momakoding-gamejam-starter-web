/**
 * 游戏内容常量 —— 全项目唯一源。
 *
 * 归属原则：
 *   - UI 无关、引擎无关的游戏世界数值/标识。
 *   - engine/ 不应 import 本文件（engine 若需要 fallback，走自己的 SHELL_DEFAULTS）。
 *   - runtime/ 不直接 import 具体事件 Key，业务层（scenes / pages）才用。
 */

// ---- 场景 Key ----
export const SCENE_KEYS = {
  BOOT: 'BootScene',
  GAME: 'GameScene',
} as const

// ---- 事件 Key (Phaser <-> Vue 通信) ----
export const EVENT_KEYS = {
  /** Phaser → Vue：HUD 全量状态，参见 IHudState */
  HUD_UPDATE: 'hud:update',
  /** Phaser → Vue：升级，参见 ILevelUpPayload（UI 应弹出选择面板） */
  LEVEL_UP: 'level:up',
  /** Phaser → Vue：本波开始，payload = wave number */
  WAVE_START: 'wave:start',
  /** Phaser → Vue：本波清空，payload = wave number */
  WAVE_CLEARED: 'wave:cleared',
  /** Phaser → Vue：游戏结束，参见 IGameOverPayload */
  GAME_OVER: 'game:over',

  /** Vue → Phaser：选择升级，payload = upgradeId (string) */
  UPGRADE_SELECTED: 'upgrade:selected',
  /** Vue → Phaser：重开 */
  GAME_RESTART: 'game:restart',
  /** Vue → Phaser：暂停 */
  GAME_PAUSE: 'game:pause',
  /** Vue → Phaser：继续 */
  GAME_RESUME: 'game:resume',
  /** Vue → Phaser：静音切换 */
  TOGGLE_MUTE: 'audio:toggle-mute',
} as const

// ---- 纹理 Key ----
export const TEXTURE_KEYS = {
  PLAYER: 'player',
  BULLET_PLAYER: 'bullet-player',
  BULLET_ENEMY: 'bullet-enemy',
  ENEMY_GRUNT: 'enemy-grunt',
  ENEMY_RUNNER: 'enemy-runner',
  ENEMY_SHOOTER: 'enemy-shooter',
  ENEMY_TANK: 'enemy-tank',
  ENEMY_BOSS: 'enemy-boss',
  XP_GEM: 'xp-gem',
  HEALTH_PICKUP: 'health-pickup',
  PARTICLE: 'particle',
  MUZZLE_FLASH: 'muzzle-flash',
  GROUND_TILE: 'ground-tile',
} as const

// ---- 世界/画幅 ----
export const WORLD = {
  WIDTH: 1280,
  HEIGHT: 720,
  ARENA_WIDTH: 2400,
  ARENA_HEIGHT: 1600,
} as const

// ---- 玩家基础数值 ----
export const PLAYER_BASE = {
  MAX_HP: 100,
  SPEED: 220,
  ACCELERATION: 1800,
  FRICTION: 0.85,
  FIRE_INTERVAL_MS: 320,
  BULLET_DAMAGE: 12,
  BULLET_SPEED: 620,
  BULLET_LIFE_MS: 900,
  PROJECTILE_COUNT: 1,
  PROJECTILE_SPREAD_DEG: 0,
  PIERCE: 0,
  PICKUP_RADIUS: 80,
  MAGNET_PULL: 600,
  XP_MULTIPLIER: 1,
  DASH_SPEED: 700,
  DASH_DURATION_MS: 180,
  DASH_COOLDOWN_MS: 900,
  DASH_IFRAME_MS: 260,
  HIT_IFRAME_MS: 600,
  BODY_RADIUS: 14,
} as const

// ---- XP / 升级 ----
export const PROGRESSION = {
  /** 第 N 级所需累计 XP（超出索引用指数外推） */
  XP_CURVE: [0, 10, 25, 45, 75, 115, 165, 225, 300, 400, 520],
  /** 每次升级提供的可选升级数 */
  UPGRADE_CHOICES: 3,
} as const

// ---- 敌人基础数值 ----
export const ENEMY_STATS = {
  GRUNT: {
    hp: 18,
    speed: 80,
    damage: 10,
    xp: 1,
    score: 10,
    radius: 12,
    color: 0x4ade80,
  },
  RUNNER: {
    hp: 12,
    speed: 160,
    damage: 8,
    xp: 2,
    score: 15,
    radius: 10,
    color: 0xf87171,
  },
  SHOOTER: {
    hp: 22,
    speed: 60,
    damage: 14,
    xp: 3,
    score: 25,
    radius: 12,
    color: 0xa78bfa,
    fireIntervalMs: 1800,
    bulletSpeed: 260,
    prefRange: 320,
  },
  TANK: {
    hp: 80,
    speed: 45,
    damage: 20,
    xp: 6,
    score: 60,
    radius: 22,
    color: 0xfb923c,
  },
  BOSS: {
    hp: 480,
    speed: 55,
    damage: 28,
    xp: 30,
    score: 500,
    radius: 42,
    color: 0xec4899,
    fireIntervalMs: 900,
    bulletSpeed: 340,
    burstCount: 8,
  },
} as const

// ---- 敌人随波次缩放（每波 hp *= 1+ scaling） ----
export const DIFFICULTY = {
  HP_PER_WAVE: 0.12,
  SPEED_PER_WAVE: 0.03,
  DAMAGE_PER_WAVE: 0.06,
  BASE_ENEMIES_PER_WAVE: 6,
  ENEMIES_PER_WAVE_GROWTH: 3,
  WAVE_COOLDOWN_MS: 4000,
  BOSS_EVERY_N_WAVES: 5,
  SPAWN_INTERVAL_MIN_MS: 180,
  SPAWN_INTERVAL_MAX_MS: 900,
  SPAWN_RING_MIN: 420,
  SPAWN_RING_MAX: 620,
  HEALTH_DROP_CHANCE: 0.06,
} as const

export type EnemyKind = 'GRUNT' | 'RUNNER' | 'SHOOTER' | 'TANK' | 'BOSS'

/** 波次可用敌种解锁：key 为最小波次 */
export const WAVE_UNLOCKS: { wave: number; kinds: EnemyKind[] }[] = [
  { wave: 1, kinds: ['GRUNT'] },
  { wave: 2, kinds: ['GRUNT', 'RUNNER'] },
  { wave: 4, kinds: ['GRUNT', 'RUNNER', 'SHOOTER'] },
  { wave: 6, kinds: ['GRUNT', 'RUNNER', 'SHOOTER', 'TANK'] },
]
