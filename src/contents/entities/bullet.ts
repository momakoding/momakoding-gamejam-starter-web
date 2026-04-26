import * as Phaser from 'phaser'
import { TEXTURE_KEYS } from '../constants'

/**
 * 通用弹丸：玩家 / 敌人共用。
 *
 * 属性：
 *   - damage：命中伤害
 *   - pierceLeft：剩余穿透次数（仅玩家弹）。0 = 命中即销毁
 *   - isPlayerBullet：碰撞组区分
 *   - dieAt：超过此时间戳自动回收
 */
export class Bullet extends Phaser.Physics.Arcade.Sprite {
  damage = 10
  pierceLeft = 0
  isPlayerBullet = true
  dieAt = 0
  hitEnemyIds = new Set<number>()

  constructor(scene: Phaser.Scene, x: number, y: number, texKey: string) {
    super(scene, x, y, texKey)
  }

  fire(
    x: number,
    y: number,
    angleRad: number,
    speed: number,
    damage: number,
    pierce: number,
    lifeMs: number,
    isPlayer: boolean,
  ): void {
    this.enableBody(true, x, y, true, true)
    this.setActive(true).setVisible(true)
    this.setRotation(angleRad)
    this.damage = damage
    this.pierceLeft = pierce
    this.isPlayerBullet = isPlayer
    this.dieAt = this.scene.time.now + lifeMs
    this.hitEnemyIds.clear()
    this.setDepth(500)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setVelocity(Math.cos(angleRad) * speed, Math.sin(angleRad) * speed)
    body.setSize(8, 8, true)
  }

  kill(): void {
    this.disableBody(true, true)
    this.setActive(false).setVisible(false)
    this.hitEnemyIds.clear()
  }

  tick(time: number): void {
    if (time >= this.dieAt) this.kill()
  }
}

/**
 * 为场景创建两个弹丸组：玩家弹 / 敌人弹。
 *
 * 使用 `classType: Bullet` 会让组里 get()/创建 出来的对象天生带上 Bullet 方法，
 * 不用手动 new。
 */
export const createBulletGroups = (
  scene: Phaser.Scene,
): { playerBullets: Phaser.Physics.Arcade.Group; enemyBullets: Phaser.Physics.Arcade.Group } => {
  const playerBullets = scene.physics.add.group({
    classType: Bullet,
    defaultKey: TEXTURE_KEYS.BULLET_PLAYER,
    maxSize: 120,
    runChildUpdate: false,
  })
  const enemyBullets = scene.physics.add.group({
    classType: Bullet,
    defaultKey: TEXTURE_KEYS.BULLET_ENEMY,
    maxSize: 80,
    runChildUpdate: false,
  })
  return { playerBullets, enemyBullets }
}
