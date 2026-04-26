import * as Phaser from 'phaser'
import { ENEMY_STATS, TEXTURE_KEYS, type EnemyKind, DIFFICULTY } from '../constants'
import type { Bullet } from './bullet'

export interface IEnemyDeps {
  enemyBullets: Phaser.Physics.Arcade.Group
  getPlayer: () => { x: number; y: number; alive: boolean }
  onShoot: () => void
}

/**
 * 敌人基类：所有 kind 共用的状态机框架。
 *
 * 分工：
 *   - Grunt：直冲玩家
 *   - Runner：直冲但更快
 *   - Shooter：保持距离 + 定时开火
 *   - Tank：缓慢直冲，高血量高伤害
 *   - Boss：血量、伤害巨大，间歇扇形弹幕
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  kind: EnemyKind = 'GRUNT'
  maxHp = 1
  hp = 1
  damage = 10
  scoreValue = 10
  xpValue = 1
  contactCooldownUntil = 0
  isBoss = false

  private moveSpeed = 80
  private nextFireAt = 0
  private fireIntervalMs = 0
  private bulletSpeed = 0
  private prefRange = 0
  private burstCount = 0

  constructor(scene: Phaser.Scene, x: number, y: number, texKey: string) {
    super(scene, x, y, texKey)
  }

  /** 由 Group.get() 后调用，激活并配置为指定 kind */
  spawn(x: number, y: number, kind: EnemyKind, wave: number): void {
    this.kind = kind
    const stats = ENEMY_STATS[kind]
    const scale =
      1 + (wave - 1) * DIFFICULTY.HP_PER_WAVE
    const spdScale = 1 + (wave - 1) * DIFFICULTY.SPEED_PER_WAVE
    const dmgScale = 1 + (wave - 1) * DIFFICULTY.DAMAGE_PER_WAVE

    this.maxHp = Math.ceil(stats.hp * scale)
    this.hp = this.maxHp
    this.damage = Math.ceil(stats.damage * dmgScale)
    this.scoreValue = stats.score
    this.xpValue = stats.xp
    this.moveSpeed = Math.floor(stats.speed * spdScale)
    this.isBoss = kind === 'BOSS'

    this.setTexture(
      kind === 'GRUNT'
        ? TEXTURE_KEYS.ENEMY_GRUNT
        : kind === 'RUNNER'
          ? TEXTURE_KEYS.ENEMY_RUNNER
          : kind === 'SHOOTER'
            ? TEXTURE_KEYS.ENEMY_SHOOTER
            : kind === 'TANK'
              ? TEXTURE_KEYS.ENEMY_TANK
              : TEXTURE_KEYS.ENEMY_BOSS,
    )

    this.enableBody(true, x, y, true, true)
    this.setActive(true).setVisible(true)
    this.clearTint()
    this.setAlpha(1)
    this.setScale(1)
    this.setDepth(this.isBoss ? 800 : 700)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setCircle(stats.radius, this.width / 2 - stats.radius, this.height / 2 - stats.radius)
    body.setCollideWorldBounds(true)

    // Shooter/Boss 特有
    if (kind === 'SHOOTER') {
      this.fireIntervalMs = ENEMY_STATS.SHOOTER.fireIntervalMs
      this.bulletSpeed = ENEMY_STATS.SHOOTER.bulletSpeed
      this.prefRange = ENEMY_STATS.SHOOTER.prefRange
      this.nextFireAt = this.scene.time.now + Phaser.Math.Between(400, 1200)
    } else if (kind === 'BOSS') {
      this.fireIntervalMs = ENEMY_STATS.BOSS.fireIntervalMs
      this.bulletSpeed = ENEMY_STATS.BOSS.bulletSpeed
      this.burstCount = ENEMY_STATS.BOSS.burstCount
      this.nextFireAt = this.scene.time.now + 1200
    } else {
      this.fireIntervalMs = 0
    }

    // 登场效果
    this.setScale(0.2)
    this.scene.tweens.add({
      targets: this,
      scale: 1,
      duration: 260,
      ease: 'Back.easeOut',
    })
  }

  tick(time: number, deps: IEnemyDeps): void {
    if (!this.active) return
    const p = deps.getPlayer()
    const body = this.body as Phaser.Physics.Arcade.Body

    const dx = p.x - this.x
    const dy = p.y - this.y
    const dist = Math.hypot(dx, dy) || 1
    const nx = dx / dist
    const ny = dy / dist

    if (this.kind === 'SHOOTER') {
      // 保持范围：近则后退，远则前进
      const range = this.prefRange
      let desiredVx = 0
      let desiredVy = 0
      if (dist > range + 30) {
        desiredVx = nx * this.moveSpeed
        desiredVy = ny * this.moveSpeed
      } else if (dist < range - 30) {
        desiredVx = -nx * this.moveSpeed * 0.8
        desiredVy = -ny * this.moveSpeed * 0.8
      } else {
        // 在范围里侧移
        desiredVx = -ny * this.moveSpeed * 0.6
        desiredVy = nx * this.moveSpeed * 0.6
      }
      body.setVelocity(desiredVx, desiredVy)
      this.maybeFire(time, deps, Math.atan2(dy, dx))
    } else if (this.kind === 'BOSS') {
      // Boss：稳定接近 + 周期弹幕
      body.setVelocity(nx * this.moveSpeed, ny * this.moveSpeed)
      this.maybeFire(time, deps, Math.atan2(dy, dx))
    } else {
      // Grunt / Runner / Tank：直冲
      body.setVelocity(nx * this.moveSpeed, ny * this.moveSpeed)
    }

    // 朝向玩家水平翻转（让精灵正视玩家）
    this.setFlipX(dx < 0)
  }

  private maybeFire(time: number, deps: IEnemyDeps, angToPlayer: number): void {
    if (time < this.nextFireAt) return
    this.nextFireAt = time + this.fireIntervalMs

    if (this.kind === 'BOSS') {
      // 扇形弹幕
      const count = this.burstCount
      for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * Phaser.Math.DegToRad(18)
        const ang = angToPlayer + offset
        const b = deps.enemyBullets.get(this.x, this.y) as Bullet | null
        if (!b) continue
        b.fire(this.x, this.y, ang, this.bulletSpeed, this.damage, 0, 2200, false)
      }
    } else {
      const b = deps.enemyBullets.get(this.x, this.y) as Bullet | null
      if (!b) return
      b.fire(this.x, this.y, angToPlayer, this.bulletSpeed, this.damage, 0, 1800, false)
    }
    deps.onShoot()
  }

  /** 返回 true = 死亡 */
  takeDamage(dmg: number, time: number): boolean {
    this.hp -= dmg
    if (this.hp > 0) {
      this.setTint(0xffffff)
      this.setTintMode(Phaser.TintModes.ADD)
      this.scene.time.delayedCall(60, () => {
        if (this.active) this.clearTint()
      })
      // 微小击退
      const body = this.body as Phaser.Physics.Arcade.Body
      body.velocity.scale(0.6)
      return false
    }
    return true
  }

  kill(): void {
    this.disableBody(true, true)
    this.setActive(false).setVisible(false)
    this.clearTint()
    this.setAlpha(1)
    this.setScale(1)
  }
}

export const createEnemyGroup = (scene: Phaser.Scene): Phaser.Physics.Arcade.Group => {
  return scene.physics.add.group({
    classType: Enemy,
    defaultKey: TEXTURE_KEYS.ENEMY_GRUNT,
    maxSize: 80,
    runChildUpdate: false,
  })
}
