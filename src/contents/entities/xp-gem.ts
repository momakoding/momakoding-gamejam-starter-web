import * as Phaser from 'phaser'
import { TEXTURE_KEYS } from '../constants'

/**
 * 经验宝石：敌人死亡时掉落，玩家靠近会被吸附。
 *
 * magnet 阶段：先按抛物线飞溅落地 → 静置 → 玩家进入 pickup radius → 被拉向玩家。
 */
export class XpGem extends Phaser.Physics.Arcade.Sprite {
  xpValue = 1
  private settledAt = 0
  private magnetized = false

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURE_KEYS.XP_GEM)
  }

  drop(x: number, y: number, xpValue: number): void {
    this.enableBody(true, x, y, true, true)
    this.setActive(true).setVisible(true)
    this.xpValue = xpValue
    this.magnetized = false
    this.settledAt = this.scene.time.now + 200
    this.setDepth(100)

    // 初速度：随机小抛散
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setCircle(6, -2, -2)
    body.setDrag(600, 600)
    const angle = Math.random() * Math.PI * 2
    const speed = Phaser.Math.Between(60, 140)
    body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)

    // 轻微浮动 tween
    this.scene.tweens.add({
      targets: this,
      y: y - 3,
      yoyo: true,
      repeat: -1,
      duration: 900,
      ease: 'Sine.easeInOut',
    })
  }

  kill(): void {
    this.scene.tweens.killTweensOf(this)
    this.disableBody(true, true)
    this.setActive(false).setVisible(false)
  }

  updateMagnet(
    time: number,
    playerX: number,
    playerY: number,
    radius: number,
    pullSpeed: number,
  ): void {
    if (!this.active) return
    const body = this.body as Phaser.Physics.Arcade.Body
    const dist = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY)

    if (!this.magnetized && time > this.settledAt && dist <= radius) {
      this.magnetized = true
      body.setDrag(0, 0)
    }

    if (this.magnetized) {
      const ang = Phaser.Math.Angle.Between(this.x, this.y, playerX, playerY)
      const t = Phaser.Math.Clamp(1 - dist / Math.max(radius, 1), 0.3, 1)
      body.setVelocity(Math.cos(ang) * pullSpeed * t * 1.6, Math.sin(ang) * pullSpeed * t * 1.6)
    }
  }
}

export class HealthPickup extends Phaser.Physics.Arcade.Sprite {
  healAmount = 25

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURE_KEYS.HEALTH_PICKUP)
  }

  drop(x: number, y: number, heal: number): void {
    this.enableBody(true, x, y, true, true)
    this.setActive(true).setVisible(true)
    this.healAmount = heal
    this.setDepth(100)
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setCircle(10)
    body.setDrag(400, 400)
    const ang = Math.random() * Math.PI * 2
    body.setVelocity(Math.cos(ang) * 80, Math.sin(ang) * 80)

    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 1600,
      repeat: -1,
    })
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.08,
      scaleY: 1.08,
      yoyo: true,
      repeat: -1,
      duration: 700,
      ease: 'Sine.easeInOut',
    })
  }

  kill(): void {
    this.scene.tweens.killTweensOf(this)
    this.disableBody(true, true)
    this.setActive(false).setVisible(false)
  }
}
