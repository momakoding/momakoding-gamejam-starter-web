import * as Phaser from 'phaser'
import {
  SCENE_KEYS,
  EVENT_KEYS,
  WORLD,
  PLAYER_BASE,
  PROGRESSION,
  DIFFICULTY,
  TEXTURE_KEYS,
  type EnemyKind,
} from '../constants'
import type {
  IGameSceneData,
  IHudState,
  ILevelUpPayload,
  IGameOverPayload,
  UpgradeId,
} from '../types'
import { useEventBus } from '@/runtime'
import { Player, Enemy, Bullet, XpGem, HealthPickup, createBulletGroups, createEnemyGroup } from '../entities'
import { WaveSystem, getAudio, pickUpgrades } from '../systems'

const eventBus = useEventBus()

/**
 * 主游戏场景 —— "Neon Hunter" 生存射击。
 *
 * 职责：
 *   - 创建玩家、敌人组、弹丸组、经验宝石组、血包组
 *   - 每帧驱动玩家输入、敌人 AI、弹丸回收
 *   - 管理波次系统（WaveSystem）
 *   - 分数、HP、XP、等级同步到 HUD
 *   - 监听 Vue 指令：暂停、恢复、重开、升级选择、静音
 *   - 玩家死亡时广播 GAME_OVER
 *
 * 性能：
 *   - 所有弹丸、敌人、XP、血包用 Phaser group + get()/killAndHide 循环复用，避免 GC。
 *   - 粒子爆炸使用 Phaser.GameObjects.Particles，一次性 explode。
 */
export class GameScene extends Phaser.Scene {
  // ---- 核心对象 ----
  private player!: Player
  private enemies!: Phaser.Physics.Arcade.Group
  private playerBullets!: Phaser.Physics.Arcade.Group
  private enemyBullets!: Phaser.Physics.Arcade.Group
  private xpGems!: Phaser.Physics.Arcade.Group
  private healthPickups!: Phaser.Physics.Arcade.Group
  private waves!: WaveSystem
  private audio = getAudio()

  // ---- 游戏状态 ----
  private score = 0
  private level = 1
  private xp = 0
  private kills = 0
  private waveStartedAt = 0
  private runStartedAt = 0
  private gameEnded = false
  private levelUpPending = false
  private upgradeStacks: Record<UpgradeId, number> = {
    'damage-up': 0,
    'fire-rate-up': 0,
    'speed-up': 0,
    'max-hp-up': 0,
    'multi-shot': 0,
    'pierce-up': 0,
    'pickup-radius': 0,
    'xp-mult': 0,
    'bullet-speed': 0,
    heal: 0,
  }
  private highScore = 0
  private hudLastSentAt = 0

  // ---- HUD 节流发送 ----
  private readonly HUD_BROADCAST_INTERVAL_MS = 120

  // ---- Debug ----
  private debug = false

  // ---- 背景 ----
  private ground!: Phaser.GameObjects.TileSprite
  private vignette!: Phaser.GameObjects.Graphics

  constructor() {
    super({ key: SCENE_KEYS.GAME })
  }

  init(data: IGameSceneData): void {
    this.score = data.startScore ?? 0
    this.level = 1
    this.xp = 0
    this.kills = 0
    this.gameEnded = false
    this.levelUpPending = false
    this.upgradeStacks = {
      'damage-up': 0,
      'fire-rate-up': 0,
      'speed-up': 0,
      'max-hp-up': 0,
      'multi-shot': 0,
      'pierce-up': 0,
      'pickup-radius': 0,
      'xp-mult': 0,
      'bullet-speed': 0,
      heal: 0,
    }
  }

  create(): void {
    const { ARENA_WIDTH, ARENA_HEIGHT, WIDTH, HEIGHT } = WORLD

    this.cameras.main.setBackgroundColor('#050816')
    this.physics.world.setBounds(0, 0, ARENA_WIDTH, ARENA_HEIGHT)

    // 读取 high score（持久化）
    this.highScore = this.loadHighScore()

    // ---- 地面砖贴图 ----
    this.ground = this.add
      .tileSprite(0, 0, ARENA_WIDTH, ARENA_HEIGHT, TEXTURE_KEYS.GROUND_TILE)
      .setOrigin(0)
      .setDepth(-1000)

    // 竞技场边框光
    const border = this.add.graphics().setDepth(-900)
    border.lineStyle(4, 0x22d3ee, 0.6)
    border.strokeRect(2, 2, ARENA_WIDTH - 4, ARENA_HEIGHT - 4)
    border.lineStyle(8, 0x22d3ee, 0.12)
    border.strokeRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)

    // ---- 对象组 ----
    const { playerBullets, enemyBullets } = createBulletGroups(this)
    this.playerBullets = playerBullets
    this.enemyBullets = enemyBullets
    this.enemies = createEnemyGroup(this)
    this.xpGems = this.physics.add.group({
      classType: XpGem,
      defaultKey: TEXTURE_KEYS.XP_GEM,
      maxSize: 300,
      runChildUpdate: false,
    })
    this.healthPickups = this.physics.add.group({
      classType: HealthPickup,
      defaultKey: TEXTURE_KEYS.HEALTH_PICKUP,
      maxSize: 20,
      runChildUpdate: false,
    })

    // ---- 玩家 ----
    this.player = new Player(this, ARENA_WIDTH / 2, ARENA_HEIGHT / 2, {
      playerBullets: this.playerBullets,
      getNearestEnemy: (x, y) => this.findNearestEnemy(x, y),
      onShoot: () => this.audio.playShoot(),
      onDamaged: (hp) => {
        this.audio.playPlayerHit()
        this.broadcastHud(true)
        if (hp <= 0) this.flashGameEnd()
      },
      onDie: () => this.handlePlayerDeath(),
      onDash: () => this.audio.playDash(),
    })

    // ---- 相机 ----
    const cam = this.cameras.main
    cam.setBounds(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
    cam.setSize(WIDTH, HEIGHT)
    cam.startFollow(this.player, true, 0.12, 0.12)
    cam.setDeadzone(120, 80)

    // Vignette：固定在相机
    this.vignette = this.add.graphics()
    this.vignette.setScrollFactor(0)
    this.drawVignette()
    this.vignette.setDepth(2000)

    // ---- 碰撞 ----
    this.physics.add.overlap(
      this.playerBullets,
      this.enemies,
      this.onBulletHitEnemy,
      undefined,
      this,
    )
    this.physics.add.overlap(
      this.enemyBullets,
      this.player,
      this.onEnemyBulletHitPlayer,
      undefined,
      this,
    )
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.onPlayerHitEnemy,
      undefined,
      this,
    )
    this.physics.add.overlap(this.player, this.xpGems, this.onCollectXp, undefined, this)
    this.physics.add.overlap(
      this.player,
      this.healthPickups,
      this.onCollectHealth,
      undefined,
      this,
    )

    // ---- Wave system ----
    this.waves = new WaveSystem(this, {
      spawnEnemy: (kind) => this.spawnEnemy(kind),
      onWaveStart: (w) => {
        this.waveStartedAt = this.time.now
        this.audio.playWaveStart()
        eventBus.emit(EVENT_KEYS.WAVE_START, w)
        this.broadcastHud(true)
      },
      onWaveCleared: (w) => {
        this.audio.playWaveClear()
        eventBus.emit(EVENT_KEYS.WAVE_CLEARED, w)
      },
    })
    this.waves.start()

    // ---- EventBus 监听 ----
    eventBus.on(EVENT_KEYS.GAME_RESTART, this.handleRestart)
    eventBus.on(EVENT_KEYS.GAME_PAUSE, this.handlePause)
    eventBus.on(EVENT_KEYS.GAME_RESUME, this.handleResume)
    eventBus.on(EVENT_KEYS.UPGRADE_SELECTED, this.handleUpgradeSelected)
    eventBus.on(EVENT_KEYS.TOGGLE_MUTE, this.handleToggleMute)

    // 场景关闭时清理
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventBus.off(EVENT_KEYS.GAME_RESTART, this.handleRestart)
      eventBus.off(EVENT_KEYS.GAME_PAUSE, this.handlePause)
      eventBus.off(EVENT_KEYS.GAME_RESUME, this.handleResume)
      eventBus.off(EVENT_KEYS.UPGRADE_SELECTED, this.handleUpgradeSelected)
      eventBus.off(EVENT_KEYS.TOGGLE_MUTE, this.handleToggleMute)
    })

    this.runStartedAt = this.time.now
    this.broadcastHud(true)

    if (this.debug) this.physics.world.createDebugGraphic()
  }

  update(time: number): void {
    if (this.gameEnded) return
    if (this.levelUpPending) return // 暂停中

    this.player.tick(time)

    // 更新敌人
    const p = { x: this.player.x, y: this.player.y, alive: this.player.alive }
    const enemyDeps = {
      enemyBullets: this.enemyBullets,
      getPlayer: () => p,
      onShoot: () => this.audio.playEnemyShoot(),
    }
    const children = this.enemies.getChildren()
    for (const go of children) {
      const e = go as Enemy
      if (e.active) e.tick(time, enemyDeps)
    }

    // 子弹生命周期
    const recyclePlayerBullets = this.playerBullets.getChildren()
    for (const go of recyclePlayerBullets) {
      const b = go as Bullet
      if (b.active) b.tick(time)
    }
    const recycleEnemyBullets = this.enemyBullets.getChildren()
    for (const go of recycleEnemyBullets) {
      const b = go as Bullet
      if (b.active) b.tick(time)
    }

    // XP 磁吸
    const gemChildren = this.xpGems.getChildren()
    for (const go of gemChildren) {
      const gem = go as XpGem
      gem.updateMagnet(
        time,
        this.player.x,
        this.player.y,
        this.player.pickupRadius,
        PLAYER_BASE.MAGNET_PULL,
      )
    }

    this.waves.update(time)

    // 背景缓慢滚动
    this.ground.tilePositionX = this.cameras.main.scrollX * 0.2
    this.ground.tilePositionY = this.cameras.main.scrollY * 0.2

    // 节流 HUD 广播
    if (time - this.hudLastSentAt > this.HUD_BROADCAST_INTERVAL_MS) {
      this.broadcastHud(false)
    }
  }

  // ---- 碰撞处理 ----

  private onBulletHitEnemy: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    bulletGo,
    enemyGo,
  ) => {
    const bullet = bulletGo as Bullet
    const enemy = enemyGo as Enemy
    if (!bullet.active || !enemy.active) return
    if (!bullet.isPlayerBullet) return

    // 同一敌人不会被同一发弹反复命中（穿透弹在帧间多次 overlap 也只算一次）
    const euid = (enemy.getData('euid') as number | undefined) ?? -1
    if (euid !== -1 && bullet.hitEnemyIds.has(euid)) return
    if (euid !== -1) bullet.hitEnemyIds.add(euid)

    const killed = enemy.takeDamage(bullet.damage, this.time.now)
    this.audio.playEnemyHit()
    this.spawnHitSparks(enemy.x, enemy.y)

    if (killed) {
      this.handleEnemyKilled(enemy)
    }

    if (bullet.pierceLeft > 0) {
      bullet.pierceLeft -= 1
    } else {
      bullet.kill()
    }
  }

  private onEnemyBulletHitPlayer: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    _playerGo,
    bulletGo,
  ) => {
    const bullet = bulletGo as Bullet
    if (!bullet.active) return
    this.player.takeDamage(bullet.damage, this.time.now)
    bullet.kill()
  }

  private onPlayerHitEnemy: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    _playerGo,
    enemyGo,
  ) => {
    const enemy = enemyGo as Enemy
    if (!enemy.active) return
    this.player.takeDamage(enemy.damage, this.time.now)

    // 敌人碰撞后轻微回弹
    const body = enemy.body as Phaser.Physics.Arcade.Body
    const dx = enemy.x - this.player.x
    const dy = enemy.y - this.player.y
    const len = Math.hypot(dx, dy) || 1
    body.velocity.x += (dx / len) * 180
    body.velocity.y += (dy / len) * 180
  }

  private onCollectXp: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    _playerGo,
    gemGo,
  ) => {
    const gem = gemGo as XpGem
    if (!gem.active) return
    const gained = gem.xpValue * this.player.xpMultiplier
    this.xp += gained
    gem.kill()
    this.audio.playXpPickup()

    // 只触发一次升级面板；玩家选完后 handleUpgradeSelected 里会链式检查下一次
    this.tryTriggerLevelUp()
    this.broadcastHud(true)
  }

  /** 若满足条件且当前没有升级待决，则扣 XP、加级、弹升级选择 */
  private tryTriggerLevelUp(): void {
    if (this.levelUpPending || this.gameEnded) return
    if (this.xp < this.xpToNext(this.level)) return
    this.xp -= this.xpToNext(this.level)
    this.level += 1
    this.triggerLevelUp()
  }

  private onCollectHealth: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    _playerGo,
    pickupGo,
  ) => {
    const p = pickupGo as HealthPickup
    if (!p.active) return
    this.player.heal(p.healAmount)
    p.kill()
    this.audio.playHealthPickup()
    this.broadcastHud(true)
  }

  // ---- 敌人生成 / 死亡 ----

  private enemyUidSeq = 0

  private spawnEnemy(kind: EnemyKind): void {
    const pos = this.pickSpawnPosition()
    const enemy = this.enemies.get(pos.x, pos.y) as Enemy | null
    if (!enemy) return
    this.enemyUidSeq += 1
    enemy.setData('euid', this.enemyUidSeq)
    enemy.spawn(pos.x, pos.y, kind, this.waves.getWave())
  }

  /**
   * 找到离 (x,y) 最近的活敌人。O(n) 扫描；n 受 enemies.maxSize=80 约束，每帧可接受。
   * 比较用距离平方避免开方。
   */
  private findNearestEnemy(x: number, y: number): { x: number; y: number } | null {
    let best: Enemy | null = null
    let bestDSq = Infinity
    const children = this.enemies.getChildren()
    for (const go of children) {
      const e = go as Enemy
      if (!e.active) continue
      const dx = e.x - x
      const dy = e.y - y
      const d = dx * dx + dy * dy
      if (d < bestDSq) {
        bestDSq = d
        best = e
      }
    }
    return best ? { x: best.x, y: best.y } : null
  }

  private pickSpawnPosition(): { x: number; y: number } {
    const { ARENA_WIDTH, ARENA_HEIGHT } = WORLD
    // 从以玩家为中心的圆环上取点，避开超出场地
    for (let tries = 0; tries < 20; tries++) {
      const ang = Math.random() * Math.PI * 2
      const r = Phaser.Math.Between(DIFFICULTY.SPAWN_RING_MIN, DIFFICULTY.SPAWN_RING_MAX)
      const x = this.player.x + Math.cos(ang) * r
      const y = this.player.y + Math.sin(ang) * r
      if (x > 40 && x < ARENA_WIDTH - 40 && y > 40 && y < ARENA_HEIGHT - 40) {
        return { x, y }
      }
    }
    return {
      x: Phaser.Math.Clamp(this.player.x, 80, ARENA_WIDTH - 80),
      y: Phaser.Math.Clamp(this.player.y, 80, ARENA_HEIGHT - 80),
    }
  }

  private handleEnemyKilled(enemy: Enemy): void {
    this.score += enemy.scoreValue
    this.kills += 1
    this.audio.playEnemyDie()

    // 粒子爆炸
    this.spawnExplosion(enemy.x, enemy.y, enemy.isBoss)
    if (enemy.isBoss) {
      this.cameras.main.shake(500, 0.014)
      this.cameras.main.flash(240, 255, 180, 220)
    }

    // 掉落 XP 宝石
    for (let i = 0; i < enemy.xpValue; i++) {
      const gem = this.xpGems.get(enemy.x, enemy.y) as XpGem | null
      if (gem) gem.drop(enemy.x, enemy.y, 1)
    }

    // 偶尔掉血包
    const hpChance = enemy.isBoss
      ? 1
      : DIFFICULTY.HEALTH_DROP_CHANCE * (this.player.hp / this.player.maxHp < 0.5 ? 2 : 1)
    if (Math.random() < hpChance) {
      const hp = this.healthPickups.get(enemy.x, enemy.y) as HealthPickup | null
      if (hp) hp.drop(enemy.x, enemy.y, 30)
    }

    enemy.kill()
    this.waves.notifyEnemyKilled()
    this.broadcastHud(true)
  }

  private spawnExplosion(x: number, y: number, big: boolean): void {
    const emitter = this.add.particles(x, y, TEXTURE_KEYS.PARTICLE, {
      speed: { min: big ? 200 : 80, max: big ? 500 : 240 },
      scale: { start: big ? 2 : 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: big ? 700 : 380,
      quantity: big ? 40 : 14,
      blendMode: 'ADD',
      tint: big ? [0xec4899, 0xfbbf24, 0xffffff] : [0xfbbf24, 0xf97316, 0xfef3c7],
      emitting: false,
    })
    emitter.explode(big ? 40 : 14)
    this.time.delayedCall(800, () => emitter.destroy())
  }

  private spawnHitSparks(x: number, y: number): void {
    const emitter = this.add.particles(x, y, TEXTURE_KEYS.PARTICLE, {
      speed: { min: 60, max: 180 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 200,
      quantity: 5,
      blendMode: 'ADD',
      tint: [0x22d3ee, 0xffffff],
      emitting: false,
    })
    emitter.explode(5)
    this.time.delayedCall(300, () => emitter.destroy())
  }

  // ---- 升级流 ----

  private xpToNext(level: number): number {
    const curve = PROGRESSION.XP_CURVE
    if (level < curve.length) return curve[level]
    const last = curve[curve.length - 1]
    return Math.floor(last * Math.pow(1.25, level - curve.length + 1))
  }

  private triggerLevelUp(): void {
    this.levelUpPending = true
    this.audio.playLevelUp()
    const choices = pickUpgrades(
      PROGRESSION.UPGRADE_CHOICES,
      this.upgradeStacks,
      this.player.hp,
      this.player.maxHp,
    )
    const payload: ILevelUpPayload = {
      newLevel: this.level,
      choices,
    }
    // 暂停物理，允许 UI overlay；动画/粒子留着让玩家感受"停顿"
    this.physics.world.pause()
    eventBus.emit(EVENT_KEYS.LEVEL_UP, payload)
    this.broadcastHud(true)
  }

  private handleUpgradeSelected = (...args: unknown[]): void => {
    const id = args[0] as UpgradeId
    if (!this.levelUpPending) return
    this.player.applyUpgrade(id)
    this.upgradeStacks[id] = (this.upgradeStacks[id] ?? 0) + 1
    this.levelUpPending = false
    this.physics.world.resume()
    this.broadcastHud(true)
    // 如果一次收集到的 XP 能连升多级，选完后立刻弹下一个
    this.tryTriggerLevelUp()
  }

  // ---- 死亡 ----

  private flashGameEnd(): void {
    this.cameras.main.flash(260, 255, 80, 80)
  }

  private handlePlayerDeath(): void {
    if (this.gameEnded) return
    this.gameEnded = true
    this.audio.playGameOver()
    this.cameras.main.shake(700, 0.02)

    // 给死亡一点延迟，让视觉收尾
    this.time.delayedCall(900, () => {
      const isNew = this.score > this.highScore
      if (isNew) {
        this.highScore = this.score
        this.saveHighScore(this.highScore)
      }
      const payload: IGameOverPayload = {
        finalScore: this.score,
        highScore: this.highScore,
        isNewHighScore: isNew,
        wave: this.waves.getWave(),
        level: this.level,
        kills: this.kills,
        survivedMs: this.time.now - this.runStartedAt,
      }
      eventBus.emit(EVENT_KEYS.GAME_OVER, payload)
    })
  }

  // ---- HUD ----

  private broadcastHud(force: boolean): void {
    const now = this.time.now
    if (!force && now - this.hudLastSentAt < this.HUD_BROADCAST_INTERVAL_MS) return
    this.hudLastSentAt = now
    const state: IHudState = {
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      score: this.score,
      wave: this.waves.getWave(),
      level: this.level,
      xp: this.xp,
      xpToNext: this.xpToNext(this.level),
      weaponLabel: this.getWeaponLabel(),
      elapsedMs: now - this.runStartedAt,
      kills: this.kills,
      dashReadyAt: this.player.dashReadyAt,
      now,
    }
    eventBus.emit(EVENT_KEYS.HUD_UPDATE, state)
  }

  private getWeaponLabel(): string {
    const parts: string[] = []
    if (this.player.projectileCount > 1) parts.push(`x${this.player.projectileCount}`)
    if (this.player.pierce > 0) parts.push(`穿${this.player.pierce}`)
    return parts.length > 0 ? parts.join(' ') : '标准'
  }

  // ---- Vue 指令 ----

  private handlePause = (): void => {
    this.scene.pause()
  }

  private handleResume = (): void => {
    this.scene.resume()
  }

  private handleRestart = (): void => {
    this.scene.restart({ startScore: 0 })
  }

  private handleToggleMute = (): void => {
    this.audio.toggleMute()
  }

  // ---- 持久化（简单 localStorage） ----

  private static readonly HIGH_SCORE_KEY = 'neon-hunter:high-score'

  private loadHighScore(): number {
    try {
      const raw = localStorage.getItem(GameScene.HIGH_SCORE_KEY)
      return raw ? Math.max(0, Number.parseInt(raw, 10)) : 0
    } catch {
      return 0
    }
  }

  private saveHighScore(score: number): void {
    try {
      localStorage.setItem(GameScene.HIGH_SCORE_KEY, String(score))
    } catch {
      // ignore quota / private mode
    }
  }

  // ---- 画面装饰 ----

  private drawVignette(): void {
    const { WIDTH, HEIGHT } = WORLD
    const g = this.vignette
    g.clear()
    // 四角黑 gradient：先画四层透明方框
    for (let i = 0; i < 6; i++) {
      const alpha = 0.08 - i * 0.01
      if (alpha <= 0) break
      g.lineStyle(14 + i * 14, 0x000000, alpha)
      g.strokeRect(-14, -14, WIDTH + 28, HEIGHT + 28)
    }
  }
}
