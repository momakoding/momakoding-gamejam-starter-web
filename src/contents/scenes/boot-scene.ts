import * as Phaser from 'phaser'
import { SCENE_KEYS, TEXTURE_KEYS, WORLD, ENEMY_STATS } from '../constants'
import { useGame } from '@/runtime'
import { getAudio } from '../systems'

const game = useGame()

/**
 * 启动场景：
 *   1. 画面尺寸由 WORLD.WIDTH/HEIGHT 覆盖 shell 默认。
 *   2. 用 Graphics 绘制全部精灵并 generateTexture — 无外部素材依赖。
 *   3. 加载进度条（生成纹理是同步的，这里只是结构示意）。
 *   4. 初始化 AudioSystem（首个用户交互时 unlock）。
 *   5. 跳到 GameScene。
 *
 * 精灵风格：像素描边 + 主色 + 亮部 + 阴影点，让占位图看起来有"人味"。
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BOOT })
  }

  preload(): void {
    this.scale.resize(WORLD.WIDTH, WORLD.HEIGHT)

    // 进度条（给未来外部资源加载留位）
    const { WIDTH, HEIGHT } = WORLD
    const progressBar = this.add.graphics()
    const progressBox = this.add.graphics()
    progressBox.fillStyle(0x111827, 0.9)
    progressBox.fillRect(WIDTH / 2 - 180, HEIGHT / 2 - 15, 360, 30)
    this.load.on('progress', (value: number) => {
      progressBar.clear()
      progressBar.fillStyle(0x22d3ee, 1)
      progressBar.fillRect(WIDTH / 2 - 170, HEIGHT / 2 - 10, 340 * value, 20)
    })
    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
    })

    this.add
      .text(WIDTH / 2, HEIGHT / 2 - 60, 'NEON HUNTER', {
        fontFamily: 'monospace',
        fontSize: '48px',
        color: '#22d3ee',
      })
      .setOrigin(0.5)
  }

  create(): void {
    this.generateAllTextures()

    // AudioContext unlock：第一个 pointerdown 后激活
    const audio = getAudio()
    audio.init()
    this.input.once('pointerdown', () => audio.unlock())
    // 键盘按键也能解锁
    this.input.keyboard?.once('keydown', () => audio.unlock())

    // 小延迟让界面有"加载感"
    this.time.delayedCall(250, () => {
      game.switchToScene(SCENE_KEYS.GAME)
    })
  }

  // ---- 纹理生成 ----

  private generateAllTextures(): void {
    this.generatePlayerTextures()
    this.generateBulletTextures()
    this.generateEnemyTextures()
    this.generateXpGemTexture()
    this.generateHealthPickupTexture()
    this.generateParticleTexture()
    this.generateMuzzleFlashTexture()
    this.generateGroundTileTexture()
  }

  /** 玩家：深蓝夹克 + 青色护甲 + 头盔 + 分离式枪 */
  private generatePlayerTextures(): void {
    const w = 28
    const h = 36
    const g = this.make.graphics({ x: 0, y: 0 })
    // 阴影底边
    g.fillStyle(0x000000, 0)
    g.fillRect(0, 0, w, h)
    // 腿
    g.fillStyle(0x1e293b, 1)
    g.fillRect(8, 26, 4, 8)
    g.fillRect(16, 26, 4, 8)
    g.fillStyle(0x475569, 1)
    g.fillRect(8, 32, 4, 2)
    g.fillRect(16, 32, 4, 2)
    // 身体 (夹克)
    g.fillStyle(0x0ea5e9, 1)
    g.fillRect(6, 14, 16, 14)
    g.fillStyle(0x0369a1, 1)
    g.fillRect(6, 26, 16, 2)
    // 胸甲高光
    g.fillStyle(0x67e8f9, 1)
    g.fillRect(10, 16, 2, 6)
    // 肩甲
    g.fillStyle(0x164e63, 1)
    g.fillRect(4, 14, 4, 6)
    g.fillRect(20, 14, 4, 6)
    // 头
    g.fillStyle(0xf4d9b5, 1)
    g.fillRect(10, 6, 8, 8)
    // 头盔
    g.fillStyle(0x22d3ee, 1)
    g.fillRect(9, 4, 10, 5)
    g.fillStyle(0x0891b2, 1)
    g.fillRect(9, 9, 10, 1)
    // 面罩
    g.fillStyle(0x0b132b, 1)
    g.fillRect(11, 10, 6, 2)
    // 头盔高光
    g.fillStyle(0xcffafe, 1)
    g.fillRect(11, 5, 2, 1)
    // 描边
    g.lineStyle(1, 0x0b132b, 1)
    g.strokeRect(6, 14, 16, 14)
    g.strokeRect(10, 6, 8, 8)
    g.generateTexture(TEXTURE_KEYS.PLAYER, w, h)
    g.destroy()

    // 武器：独立的贴图，便于跟随鼠标旋转
    const gw = 22
    const gh = 8
    const gun = this.make.graphics({ x: 0, y: 0 })
    gun.fillStyle(0x334155, 1)
    gun.fillRect(0, 3, 14, 3)
    gun.fillStyle(0x64748b, 1)
    gun.fillRect(14, 2, 8, 4)
    gun.fillStyle(0x94a3b8, 1)
    gun.fillRect(20, 3, 2, 2)
    gun.fillStyle(0x0ea5e9, 1)
    gun.fillRect(3, 2, 3, 1)
    gun.lineStyle(1, 0x0b132b, 1)
    gun.strokeRect(0, 3, 14, 3)
    gun.strokeRect(14, 2, 8, 4)
    gun.generateTexture(TEXTURE_KEYS.PLAYER + '-gun', gw, gh)
    gun.destroy()
  }

  /** 玩家弹 = 蓝色流线；敌人弹 = 红色流线 */
  private generateBulletTextures(): void {
    const mkBullet = (key: string, core: number, glow: number) => {
      const g = this.make.graphics({ x: 0, y: 0 })
      // 外发光
      g.fillStyle(glow, 0.35)
      g.fillCircle(7, 4, 4)
      // 中段
      g.fillStyle(glow, 1)
      g.fillRect(2, 3, 10, 2)
      // 亮心
      g.fillStyle(core, 1)
      g.fillRect(3, 3, 8, 2)
      g.fillStyle(0xffffff, 1)
      g.fillRect(4, 3, 4, 1)
      g.generateTexture(key, 14, 8)
      g.destroy()
    }
    mkBullet(TEXTURE_KEYS.BULLET_PLAYER, 0xffffff, 0x22d3ee)
    mkBullet(TEXTURE_KEYS.BULLET_ENEMY, 0xffd166, 0xef4444)
  }

  /** 敌人：每种形态不同轮廓，都带主色 + 亮部 + 眼睛 */
  private generateEnemyTextures(): void {
    // --- GRUNT：矮胖绿色僵尸 ---
    {
      const c = ENEMY_STATS.GRUNT.color
      const w = 30,
        h = 30
      const g = this.make.graphics({ x: 0, y: 0 })
      g.fillStyle(c, 1)
      g.fillRect(6, 8, 18, 18)
      g.fillStyle(0x166534, 1)
      g.fillRect(6, 24, 18, 2)
      g.fillStyle(0x86efac, 1)
      g.fillRect(9, 10, 3, 6)
      // 眼
      g.fillStyle(0xfef08a, 1)
      g.fillRect(10, 14, 3, 3)
      g.fillRect(17, 14, 3, 3)
      g.fillStyle(0x0b132b, 1)
      g.fillRect(11, 15, 1, 1)
      g.fillRect(18, 15, 1, 1)
      // 腿
      g.fillStyle(0x14532d, 1)
      g.fillRect(8, 26, 4, 4)
      g.fillRect(18, 26, 4, 4)
      // 獠牙
      g.fillStyle(0xffffff, 1)
      g.fillRect(13, 20, 1, 2)
      g.fillRect(16, 20, 1, 2)
      g.lineStyle(1, 0x0b132b, 1)
      g.strokeRect(6, 8, 18, 18)
      g.generateTexture(TEXTURE_KEYS.ENEMY_GRUNT, w, h)
      g.destroy()
    }

    // --- RUNNER：瘦长红色 ---
    {
      const c = ENEMY_STATS.RUNNER.color
      const w = 26,
        h = 32
      const g = this.make.graphics({ x: 0, y: 0 })
      g.fillStyle(c, 1)
      g.fillRect(8, 6, 10, 18)
      g.fillStyle(0x7f1d1d, 1)
      g.fillRect(8, 22, 10, 2)
      g.fillStyle(0xfecaca, 1)
      g.fillRect(10, 8, 2, 6)
      // 眼
      g.fillStyle(0xfef08a, 1)
      g.fillRect(9, 10, 3, 2)
      g.fillRect(14, 10, 3, 2)
      g.fillStyle(0x0b132b, 1)
      g.fillRect(10, 10, 1, 1)
      g.fillRect(15, 10, 1, 1)
      // 爪
      g.fillStyle(0x7f1d1d, 1)
      g.fillRect(5, 14, 3, 6)
      g.fillRect(18, 14, 3, 6)
      g.fillStyle(0xffffff, 1)
      g.fillRect(5, 18, 3, 1)
      g.fillRect(18, 18, 3, 1)
      // 腿
      g.fillStyle(0x991b1b, 1)
      g.fillRect(9, 24, 3, 8)
      g.fillRect(14, 24, 3, 8)
      g.lineStyle(1, 0x0b132b, 1)
      g.strokeRect(8, 6, 10, 18)
      g.generateTexture(TEXTURE_KEYS.ENEMY_RUNNER, w, h)
      g.destroy()
    }

    // --- SHOOTER：紫袍法师持杖 ---
    {
      const c = ENEMY_STATS.SHOOTER.color
      const w = 28,
        h = 34
      const g = this.make.graphics({ x: 0, y: 0 })
      // 袍
      g.fillStyle(c, 1)
      g.fillRect(6, 12, 16, 20)
      g.fillStyle(0x6d28d9, 1)
      g.fillRect(6, 30, 16, 2)
      g.fillStyle(0xddd6fe, 1)
      g.fillRect(8, 14, 2, 10)
      // 头（兜帽）
      g.fillStyle(0x4c1d95, 1)
      g.fillRect(8, 4, 12, 10)
      // 眼（红光）
      g.fillStyle(0xef4444, 1)
      g.fillRect(10, 8, 3, 2)
      g.fillRect(15, 8, 3, 2)
      g.fillStyle(0xfecaca, 1)
      g.fillRect(11, 8, 1, 1)
      g.fillRect(16, 8, 1, 1)
      // 法杖
      g.fillStyle(0x92400e, 1)
      g.fillRect(22, 6, 2, 20)
      g.fillStyle(0xfbbf24, 1)
      g.fillRect(21, 4, 4, 4)
      g.fillStyle(0xfef3c7, 1)
      g.fillRect(22, 5, 1, 1)
      g.lineStyle(1, 0x0b132b, 1)
      g.strokeRect(6, 12, 16, 20)
      g.strokeRect(8, 4, 12, 10)
      g.generateTexture(TEXTURE_KEYS.ENEMY_SHOOTER, w, h)
      g.destroy()
    }

    // --- TANK：橙色巨型 ---
    {
      const c = ENEMY_STATS.TANK.color
      const w = 48,
        h = 46
      const g = this.make.graphics({ x: 0, y: 0 })
      g.fillStyle(c, 1)
      g.fillRect(6, 10, 36, 30)
      g.fillStyle(0x9a3412, 1)
      g.fillRect(6, 38, 36, 2)
      g.fillStyle(0xfed7aa, 1)
      g.fillRect(10, 14, 4, 20)
      // 眼
      g.fillStyle(0xfef08a, 1)
      g.fillRect(14, 18, 5, 5)
      g.fillRect(29, 18, 5, 5)
      g.fillStyle(0x0b132b, 1)
      g.fillRect(16, 20, 2, 2)
      g.fillRect(31, 20, 2, 2)
      // 尖刺（背）
      g.fillStyle(0x78350f, 1)
      g.fillRect(10, 6, 4, 4)
      g.fillRect(22, 4, 4, 6)
      g.fillRect(34, 6, 4, 4)
      g.fillStyle(0xffedd5, 1)
      g.fillRect(23, 5, 1, 3)
      // 手臂
      g.fillStyle(0xea580c, 1)
      g.fillRect(2, 16, 6, 14)
      g.fillRect(40, 16, 6, 14)
      g.fillStyle(0x7c2d12, 1)
      g.fillRect(2, 28, 6, 2)
      g.fillRect(40, 28, 6, 2)
      g.lineStyle(1, 0x0b132b, 1)
      g.strokeRect(6, 10, 36, 30)
      g.generateTexture(TEXTURE_KEYS.ENEMY_TANK, w, h)
      g.destroy()
    }

    // --- BOSS：粉色六臂 ---
    {
      const c = ENEMY_STATS.BOSS.color
      const w = 90,
        h = 90
      const g = this.make.graphics({ x: 0, y: 0 })
      // 外圈光晕
      g.fillStyle(c, 0.25)
      g.fillCircle(45, 45, 42)
      // 主体
      g.fillStyle(c, 1)
      g.fillCircle(45, 45, 30)
      g.fillStyle(0x831843, 1)
      g.fillCircle(45, 50, 28)
      g.fillStyle(0xfbcfe8, 1)
      g.fillCircle(36, 40, 4)
      // 眼
      g.fillStyle(0xfef9c3, 1)
      g.fillRect(32, 38, 8, 8)
      g.fillRect(52, 38, 8, 8)
      g.fillStyle(0x0b132b, 1)
      g.fillRect(35, 40, 3, 4)
      g.fillRect(55, 40, 3, 4)
      g.fillStyle(0xffffff, 1)
      g.fillRect(34, 40, 1, 1)
      g.fillRect(54, 40, 1, 1)
      // 嘴
      g.fillStyle(0x4c0519, 1)
      g.fillRect(35, 56, 20, 6)
      g.fillStyle(0xffffff, 1)
      for (let i = 0; i < 5; i++) {
        g.fillRect(36 + i * 4, 56, 2, 2)
        g.fillRect(36 + i * 4, 60, 2, 2)
      }
      // 尖角
      g.fillStyle(0xec4899, 1)
      g.fillTriangle(30, 15, 34, 5, 38, 15)
      g.fillTriangle(52, 15, 56, 5, 60, 15)
      // 手臂（左右各三）
      g.fillStyle(0xdb2777, 1)
      g.fillRect(4, 40, 10, 10)
      g.fillRect(4, 55, 10, 10)
      g.fillRect(76, 40, 10, 10)
      g.fillRect(76, 55, 10, 10)
      g.fillStyle(0xfbcfe8, 1)
      g.fillRect(6, 42, 2, 2)
      g.fillRect(78, 42, 2, 2)
      g.lineStyle(2, 0x0b132b, 1)
      g.strokeCircle(45, 45, 30)
      g.generateTexture(TEXTURE_KEYS.ENEMY_BOSS, w, h)
      g.destroy()
    }
  }

  private generateXpGemTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 })
    // 钻石型
    g.fillStyle(0x0ea5e9, 1)
    g.fillTriangle(6, 0, 12, 6, 6, 12)
    g.fillTriangle(6, 0, 0, 6, 6, 12)
    g.fillStyle(0x7dd3fc, 1)
    g.fillTriangle(6, 2, 10, 6, 6, 10)
    g.fillStyle(0xffffff, 1)
    g.fillRect(5, 4, 2, 2)
    g.lineStyle(1, 0x0b132b, 1)
    g.strokeTriangle(6, 0, 12, 6, 6, 12)
    g.strokeTriangle(6, 0, 0, 6, 6, 12)
    g.generateTexture(TEXTURE_KEYS.XP_GEM, 12, 12)
    g.destroy()
  }

  private generateHealthPickupTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 })
    // 红十字胶囊
    g.fillStyle(0xffffff, 1)
    g.fillRoundedRect(0, 0, 18, 18, 4)
    g.fillStyle(0xef4444, 1)
    g.fillRect(7, 3, 4, 12)
    g.fillRect(3, 7, 12, 4)
    g.fillStyle(0xfecaca, 1)
    g.fillRect(7, 3, 2, 2)
    g.lineStyle(1, 0x0b132b, 1)
    g.strokeRoundedRect(0, 0, 18, 18, 4)
    g.generateTexture(TEXTURE_KEYS.HEALTH_PICKUP, 18, 18)
    g.destroy()
  }

  /** 通用粒子：发光圆点 */
  private generateParticleTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 })
    g.fillStyle(0xffffff, 0.4)
    g.fillCircle(4, 4, 4)
    g.fillStyle(0xffffff, 1)
    g.fillCircle(4, 4, 2)
    g.generateTexture(TEXTURE_KEYS.PARTICLE, 8, 8)
    g.destroy()
  }

  /** 枪口焰：横向扇形闪光 */
  private generateMuzzleFlashTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 })
    g.fillStyle(0xfbbf24, 0.9)
    g.fillTriangle(0, 6, 16, 2, 16, 10)
    g.fillStyle(0xffffff, 1)
    g.fillTriangle(0, 6, 10, 4, 10, 8)
    g.generateTexture(TEXTURE_KEYS.MUZZLE_FLASH, 16, 12)
    g.destroy()
  }

  /** 地砖：带网格的深蓝 */
  private generateGroundTileTexture(): void {
    const size = 64
    const g = this.make.graphics({ x: 0, y: 0 })
    g.fillStyle(0x0b132b, 1)
    g.fillRect(0, 0, size, size)
    g.fillStyle(0x1e293b, 1)
    g.fillRect(0, 0, size, 1)
    g.fillRect(0, 0, 1, size)
    g.fillStyle(0x1e3a8a, 0.6)
    g.fillRect(1, 1, 2, 2)
    g.fillRect(size - 4, size - 4, 2, 2)
    g.generateTexture(TEXTURE_KEYS.GROUND_TILE, size, size)
    g.destroy()
  }
}
