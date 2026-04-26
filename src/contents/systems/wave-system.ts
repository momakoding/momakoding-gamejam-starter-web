import * as Phaser from 'phaser'
import { DIFFICULTY, WAVE_UNLOCKS, type EnemyKind } from '../constants'

/**
 * 波次系统：决定每波生成什么、什么时候生成、什么时候结束。
 *
 * 设计：
 *   - 每波有一个"预算"（总敌人数），波内按 spawn interval 分批刷。
 *   - 波内当前存活敌人超过 maxAlive 时暂停生成，避免雪崩。
 *   - 剩余预算 = 0 且场上全空 → 本波结束 → 冷却期 → 下一波。
 *   - boss 波（每 N 波）：预算 = 1 boss + 少量 minion。
 *
 * 本类不创建敌人实体，只通过 `requestSpawn(kind)` 回调把生成请求抛给 GameScene。
 */
export interface IWaveCallbacks {
  spawnEnemy: (kind: EnemyKind) => void
  onWaveStart: (wave: number) => void
  onWaveCleared: (wave: number) => void
}

export class WaveSystem {
  private currentWave = 0
  private budget = 0 // 还要生成多少敌人
  private aliveInWave = 0
  private inCooldown = true // 起始在冷却，等 start() 后开始第 1 波
  private cooldownUntil = 0
  private lastSpawnAt = 0
  private nextSpawnDelay = DIFFICULTY.SPAWN_INTERVAL_MAX_MS
  private maxAlive = 0

  constructor(private scene: Phaser.Scene, private cb: IWaveCallbacks) {}

  /** 启动第一波（从冷却期立刻切入） */
  start(): void {
    this.inCooldown = true
    this.cooldownUntil = this.scene.time.now + 1200
  }

  /** 由 GameScene 在敌人死亡时调用 */
  notifyEnemyKilled(): void {
    this.aliveInWave = Math.max(0, this.aliveInWave - 1)
  }

  /** 供 HUD 读取 */
  getWave(): number {
    return this.currentWave
  }

  /** 每帧 tick */
  update(time: number): void {
    if (this.inCooldown) {
      if (time >= this.cooldownUntil) {
        this.startNextWave(time)
      }
      return
    }

    // 本波还有预算 → 按节奏生成
    if (this.budget > 0 && this.aliveInWave < this.maxAlive) {
      if (time - this.lastSpawnAt >= this.nextSpawnDelay) {
        const kind = this.pickEnemyKind()
        this.cb.spawnEnemy(kind)
        this.budget -= 1
        this.aliveInWave += 1
        this.lastSpawnAt = time
        this.nextSpawnDelay = this.rollSpawnDelay()
      }
    }

    // 预算耗尽且场上清空 → 本波结束
    if (this.budget === 0 && this.aliveInWave === 0) {
      this.cb.onWaveCleared(this.currentWave)
      this.inCooldown = true
      this.cooldownUntil = time + DIFFICULTY.WAVE_COOLDOWN_MS
    }
  }

  private startNextWave(time: number): void {
    this.currentWave += 1
    this.inCooldown = false
    const isBoss = this.currentWave % DIFFICULTY.BOSS_EVERY_N_WAVES === 0

    if (isBoss) {
      // Boss 波：1 boss + 若干杂兵
      this.budget = 1 + Math.min(6, Math.floor(this.currentWave / 2))
      this.maxAlive = 8
      this.cb.onWaveStart(this.currentWave)
      // boss 立即刷
      this.cb.spawnEnemy('BOSS')
      this.budget -= 1
      this.aliveInWave = 1
      this.lastSpawnAt = time
      this.nextSpawnDelay = 800
    } else {
      const growth =
        DIFFICULTY.BASE_ENEMIES_PER_WAVE +
        (this.currentWave - 1) * DIFFICULTY.ENEMIES_PER_WAVE_GROWTH
      this.budget = growth
      this.maxAlive = Math.min(24, 6 + Math.floor(this.currentWave * 0.8))
      this.aliveInWave = 0
      this.cb.onWaveStart(this.currentWave)
      this.lastSpawnAt = time
      this.nextSpawnDelay = 400
    }
  }

  private rollSpawnDelay(): number {
    const t = Math.min(1, this.currentWave / 20)
    const min = DIFFICULTY.SPAWN_INTERVAL_MIN_MS
    const max = Phaser.Math.Linear(
      DIFFICULTY.SPAWN_INTERVAL_MAX_MS,
      DIFFICULTY.SPAWN_INTERVAL_MIN_MS + 200,
      t,
    )
    return Phaser.Math.Between(min, Math.floor(max))
  }

  private pickEnemyKind(): EnemyKind {
    const unlocked = this.getUnlockedKinds()
    // 权重：低阶怪多、高阶怪少
    const pool: EnemyKind[] = []
    for (const k of unlocked) {
      const count = {
        GRUNT: 5,
        RUNNER: 3,
        SHOOTER: 2,
        TANK: 1,
        BOSS: 0,
      }[k]
      for (let i = 0; i < count; i++) pool.push(k)
    }
    return pool[Phaser.Math.Between(0, pool.length - 1)] ?? 'GRUNT'
  }

  private getUnlockedKinds(): EnemyKind[] {
    let result: EnemyKind[] = ['GRUNT']
    for (const u of WAVE_UNLOCKS) {
      if (this.currentWave >= u.wave) result = [...u.kinds]
    }
    return result
  }
}
