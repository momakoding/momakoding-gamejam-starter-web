import * as Phaser from 'phaser'
import { PLAYER_BASE, TEXTURE_KEYS } from '../constants'
import type { UpgradeId } from '../types'
import type { Bullet } from './bullet'

/**
 * 玩家角色。
 *
 * 负责：
 *   - WASD/方向键 + 冲刺（空格）+ 鼠标瞄准
 *   - 自动开火（按住鼠标左键也会持续射击）
 *   - 受击逻辑（i-frame + 屏幕震动 + 闪红）
 *   - 升级应用（applyUpgrade）
 *
 * 不负责：
 *   - 碰撞检测注册（GameScene 做）
 *   - 弹丸组管理（bullets 组作为依赖注入）
 */
export interface IPlayerDeps {
  playerBullets: Phaser.Physics.Arcade.Group
  /** 返回场上离玩家最近的敌人坐标；无敌人返回 null */
  getNearestEnemy: (x: number, y: number) => { x: number; y: number } | null
  onShoot: () => void
  onDamaged: (hp: number, maxHp: number) => void
  onDie: () => void
  onDash: () => void
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  // ---- 状态 ----
  maxHp = PLAYER_BASE.MAX_HP
  hp = PLAYER_BASE.MAX_HP
  speed = PLAYER_BASE.SPEED
  fireIntervalMs = PLAYER_BASE.FIRE_INTERVAL_MS
  bulletDamage = PLAYER_BASE.BULLET_DAMAGE
  bulletSpeed = PLAYER_BASE.BULLET_SPEED
  projectileCount = PLAYER_BASE.PROJECTILE_COUNT
  projectileSpreadDeg = PLAYER_BASE.PROJECTILE_SPREAD_DEG
  pierce = PLAYER_BASE.PIERCE
  pickupRadius = PLAYER_BASE.PICKUP_RADIUS
  xpMultiplier = PLAYER_BASE.XP_MULTIPLIER
  alive = true

  dashReadyAt = 0

  // ---- 输入 ----
  private keys!: {
    W: Phaser.Input.Keyboard.Key
    A: Phaser.Input.Keyboard.Key
    S: Phaser.Input.Keyboard.Key
    D: Phaser.Input.Keyboard.Key
    up: Phaser.Input.Keyboard.Key
    down: Phaser.Input.Keyboard.Key
    left: Phaser.Input.Keyboard.Key
    right: Phaser.Input.Keyboard.Key
    space: Phaser.Input.Keyboard.Key
  }

  private lastFireAt = 0
  private hitImmuneUntil = 0
  private dashingUntil = 0
  /** 自动瞄准：持有最后一次有效瞄准角度，无敌人时保持该方向 */
  private aimAngle = 0
  /** 自动瞄准：当前锁定目标坐标（每帧更新） */
  private currentTarget: { x: number; y: number } | null = null

  // ---- 视觉 ----
  private gunSprite!: Phaser.GameObjects.Image
  private shadow!: Phaser.GameObjects.Ellipse
  private muzzleFlash!: Phaser.GameObjects.Image

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private deps: IPlayerDeps,
  ) {
    super(scene, x, y, TEXTURE_KEYS.PLAYER)
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setDepth(1000)
    this.setOrigin(0.5, 0.55)
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setCircle(PLAYER_BASE.BODY_RADIUS, -PLAYER_BASE.BODY_RADIUS + this.width / 2, -PLAYER_BASE.BODY_RADIUS + this.height / 2)
    body.setCollideWorldBounds(true)
    body.setDrag(PLAYER_BASE.ACCELERATION * 0.6, PLAYER_BASE.ACCELERATION * 0.6)
    body.setMaxSpeed(PLAYER_BASE.DASH_SPEED)

    // 阴影 & 武器 & 枪口
    this.shadow = scene.add.ellipse(x, y + 18, 28, 10, 0x000000, 0.35).setDepth(900)
    this.gunSprite = scene.add.image(x, y, TEXTURE_KEYS.PLAYER + '-gun').setDepth(1001).setOrigin(0.1, 0.5)
    this.muzzleFlash = scene.add
      .image(x, y, TEXTURE_KEYS.MUZZLE_FLASH)
      .setDepth(1002)
      .setVisible(false)
      .setOrigin(0, 0.5)

    this.setupInput()
  }

  private setupInput(): void {
    const kb = this.scene.input.keyboard!
    this.keys = {
      W: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      space: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    }
  }

  // ---- Update ----

  tick(time: number): void {
    if (!this.alive) return

    // 先锁定目标，aim/fire 复用同一目标，避免一帧内取两次导致不一致
    this.currentTarget = this.deps.getNearestEnemy(this.x, this.y)

    this.updateMovement(time)
    this.updateAim()
    this.updateFire(time)
    this.updateVisuals()
  }

  private updateMovement(time: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    let vx = 0
    let vy = 0
    if (this.keys.A.isDown || this.keys.left.isDown) vx -= 1
    if (this.keys.D.isDown || this.keys.right.isDown) vx += 1
    if (this.keys.W.isDown || this.keys.up.isDown) vy -= 1
    if (this.keys.S.isDown || this.keys.down.isDown) vy += 1

    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy)
      vx /= len
      vy /= len
    }

    // 冲刺
    if (time < this.dashingUntil) {
      // 冲刺期间速度已设置，不覆盖
      return
    }

    const targetVx = vx * this.speed
    const targetVy = vy * this.speed
    body.setVelocity(targetVx, targetVy)

    if (this.keys.space.isDown && time >= this.dashReadyAt && (vx !== 0 || vy !== 0)) {
      this.startDash(time, vx, vy)
    }
  }

  private startDash(time: number, vx: number, vy: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setVelocity(vx * PLAYER_BASE.DASH_SPEED, vy * PLAYER_BASE.DASH_SPEED)
    this.dashingUntil = time + PLAYER_BASE.DASH_DURATION_MS
    this.dashReadyAt = time + PLAYER_BASE.DASH_COOLDOWN_MS
    this.hitImmuneUntil = Math.max(this.hitImmuneUntil, time + PLAYER_BASE.DASH_IFRAME_MS)
    this.setAlpha(0.6)
    this.scene.tweens.add({ targets: this, alpha: 1, duration: 220 })
    this.deps.onDash()
  }

  private updateAim(): void {
    // 目标存在 → 更新瞄准角；不存在 → 保持上一帧方向（避免枪"归零"抖动）
    if (this.currentTarget) {
      this.aimAngle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        this.currentTarget.x,
        this.currentTarget.y,
      )
    }
    this.gunSprite.setPosition(this.x, this.y + 2)
    this.gunSprite.setRotation(this.aimAngle)
    this.setFlipX(Math.abs(this.aimAngle) > Math.PI / 2)
  }

  private updateFire(time: number): void {
    // 自动开火：有目标 + 冷却就绪就打
    if (!this.currentTarget) return
    if (time - this.lastFireAt < this.fireIntervalMs) return
    this.lastFireAt = time

    const baseAng = this.aimAngle
    const count = this.projectileCount
    const spreadTotal = Phaser.Math.DegToRad(
      this.projectileSpreadDeg + (count - 1) * 10,
    )
    const step = count > 1 ? spreadTotal / (count - 1) : 0
    const startAng = baseAng - spreadTotal / 2

    // 枪口位置
    const muzzleDist = 22
    const mx = this.x + Math.cos(baseAng) * muzzleDist
    const my = this.y + Math.sin(baseAng) * muzzleDist + 2

    for (let i = 0; i < count; i++) {
      const ang = count > 1 ? startAng + step * i : baseAng
      const b = this.deps.playerBullets.get(mx, my) as Bullet | null
      if (!b) continue
      b.fire(
        mx,
        my,
        ang,
        this.bulletSpeed,
        this.bulletDamage,
        this.pierce,
        PLAYER_BASE.BULLET_LIFE_MS,
        true,
      )
    }

    this.flashMuzzle(baseAng, mx, my)
    this.deps.onShoot()
  }

  private flashMuzzle(ang: number, mx: number, my: number): void {
    this.muzzleFlash.setPosition(mx, my)
    this.muzzleFlash.setRotation(ang)
    this.muzzleFlash.setVisible(true)
    this.muzzleFlash.setAlpha(1)
    this.scene.tweens.add({
      targets: this.muzzleFlash,
      alpha: 0,
      duration: 80,
      onComplete: () => this.muzzleFlash.setVisible(false),
    })
  }

  private updateVisuals(): void {
    this.shadow.setPosition(this.x, this.y + 20)
    // 轻微 bobbing
    if ((this.body as Phaser.Physics.Arcade.Body).velocity.lengthSq() > 10) {
      this.y += Math.sin(this.scene.time.now / 80) * 0.15
    }
  }

  // ---- Damage ----

  takeDamage(dmg: number, time: number): void {
    if (!this.alive) return
    if (time < this.hitImmuneUntil) return
    this.hp = Math.max(0, this.hp - dmg)
    this.hitImmuneUntil = time + PLAYER_BASE.HIT_IFRAME_MS

    this.setTint(0xff4444)
    this.setTintMode(Phaser.TintModes.FILL)
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      yoyo: true,
      repeat: 3,
      duration: 80,
      onComplete: () => {
        this.clearTint()
        this.setAlpha(1)
      },
    })
    this.scene.cameras.main.shake(160, 0.006)

    this.deps.onDamaged(this.hp, this.maxHp)
    if (this.hp <= 0) {
      this.die()
    }
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount)
    this.deps.onDamaged(this.hp, this.maxHp)
  }

  private die(): void {
    this.alive = false
    this.firing = false
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setVelocity(0, 0)
    this.setTint(0x660000)
    this.setTintMode(Phaser.TintModes.FILL)
    this.scene.tweens.add({
      targets: [this, this.gunSprite, this.shadow],
      alpha: 0,
      duration: 600,
    })
    this.deps.onDie()
  }

  // ---- Upgrades ----

  applyUpgrade(id: UpgradeId): void {
    switch (id) {
      case 'damage-up':
        this.bulletDamage += 6
        break
      case 'fire-rate-up':
        this.fireIntervalMs = Math.max(80, Math.floor(this.fireIntervalMs * 0.85))
        break
      case 'speed-up':
        this.speed += 20
        break
      case 'max-hp-up':
        this.maxHp += 20
        this.hp = this.maxHp
        break
      case 'multi-shot':
        this.projectileCount += 1
        this.projectileSpreadDeg = Math.max(this.projectileSpreadDeg, 6)
        break
      case 'pierce-up':
        this.pierce += 1
        break
      case 'pickup-radius':
        this.pickupRadius = Math.floor(this.pickupRadius * 1.4)
        break
      case 'xp-mult':
        this.xpMultiplier *= 1.25
        break
      case 'bullet-speed':
        this.bulletSpeed = Math.floor(this.bulletSpeed * 1.2)
        break
      case 'heal':
        this.heal(40)
        break
    }
  }

  destroyPlayer(): void {
    this.shadow.destroy()
    this.gunSprite.destroy()
    this.muzzleFlash.destroy()
    this.destroy()
  }
}
