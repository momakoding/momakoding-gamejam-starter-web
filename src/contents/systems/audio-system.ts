/**
 * Web Audio API 合成音效系统。
 *
 * 设计：
 *   - 不加载外部音频文件；所有 SFX 在调用时即时合成。
 *   - AudioContext 因浏览器自动播放策略默认挂起，首个用户交互后 resume()。
 *   - 所有音源经 masterGain 汇总 → 便于静音/音量控制。
 *
 * 对外 API 全部是幂等的：没 init 或上下文挂起时静默返回，不抛错。
 */
export class AudioSystem {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private muted = false
  private volume = 0.35
  private unlocked = false

  /** 懒初始化：在第一次用户交互或 play 时调用 */
  init(): void {
    if (this.ctx) return
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return
    this.ctx = new Ctor()
    this.master = this.ctx.createGain()
    this.master.gain.value = this.volume
    this.master.connect(this.ctx.destination)
  }

  /** 用户首次交互后调用，解锁挂起的 AudioContext */
  unlock(): void {
    if (!this.ctx) this.init()
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }
    this.unlocked = true
  }

  setMuted(value: boolean): void {
    this.muted = value
    if (this.master) {
      this.master.gain.setTargetAtTime(
        value ? 0 : this.volume,
        this.ctx!.currentTime,
        0.02,
      )
    }
  }

  toggleMute(): boolean {
    this.setMuted(!this.muted)
    return this.muted
  }

  isMuted(): boolean {
    return this.muted
  }

  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value))
    if (this.master && !this.muted) {
      this.master.gain.setTargetAtTime(this.volume, this.ctx!.currentTime, 0.02)
    }
  }

  dispose(): void {
    if (this.ctx) {
      void this.ctx.close()
      this.ctx = null
      this.master = null
    }
  }

  // ---- 内部工具 ----

  private playable(): boolean {
    return !!this.ctx && !!this.master && this.unlocked && !this.muted
  }

  private envelope(
    gain: GainNode,
    startLevel: number,
    attack: number,
    decay: number,
    sustainLevel: number,
    release: number,
    now: number,
  ): number {
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(startLevel, now + attack)
    gain.gain.linearRampToValueAtTime(sustainLevel, now + attack + decay)
    gain.gain.linearRampToValueAtTime(0.0001, now + attack + decay + release)
    return now + attack + decay + release
  }

  private createNoiseBuffer(duration: number): AudioBuffer {
    const ctx = this.ctx!
    const sampleRate = ctx.sampleRate
    const frameCount = Math.floor(sampleRate * duration)
    const buf = ctx.createBuffer(1, frameCount, sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < frameCount; i++) {
      data[i] = Math.random() * 2 - 1
    }
    return buf
  }

  // ---- SFX ----

  /** 玩家射击：短促激光音 */
  playShoot(): void {
    if (!this.playable()) return
    const ctx = this.ctx!
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2400, now)
    osc.type = 'square'
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.09)
    const end = this.envelope(gain, 0.18, 0.002, 0.01, 0.05, 0.08, now)
    osc.connect(filter).connect(gain).connect(this.master!)
    osc.start(now)
    osc.stop(end + 0.02)
  }

  /** 敌人命中：短冲击 */
  playEnemyHit(): void {
    if (!this.playable()) return
    const ctx = this.ctx!
    const now = ctx.currentTime
    const noise = ctx.createBufferSource()
    noise.buffer = this.createNoiseBuffer(0.1)
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(2200, now)
    filter.Q.value = 2
    const gain = ctx.createGain()
    const end = this.envelope(gain, 0.35, 0.002, 0.02, 0.12, 0.05, now)
    noise.connect(filter).connect(gain).connect(this.master!)
    noise.start(now)
    noise.stop(end + 0.02)
  }

  /** 敌人死亡：低沉爆炸 */
  playEnemyDie(): void {
    if (!this.playable()) return
    const ctx = this.ctx!
    const now = ctx.currentTime

    // 低频冲击
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(240, now)
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.18)
    this.envelope(oscGain, 0.45, 0.005, 0.06, 0.2, 0.12, now)
    osc.connect(oscGain).connect(this.master!)
    osc.start(now)
    osc.stop(now + 0.3)

    // 噪声碎片
    const noise = ctx.createBufferSource()
    noise.buffer = this.createNoiseBuffer(0.22)
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1600, now)
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.22)
    const nGain = ctx.createGain()
    this.envelope(nGain, 0.3, 0.002, 0.03, 0.15, 0.18, now)
    noise.connect(filter).connect(nGain).connect(this.master!)
    noise.start(now)
    noise.stop(now + 0.3)
  }

  /** 玩家受击：低闷撞击 */
  playPlayerHit(): void {
    if (!this.playable()) return
    const ctx = this.ctx!
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(180, now)
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.2)
    this.envelope(gain, 0.5, 0.005, 0.04, 0.25, 0.18, now)
    osc.connect(gain).connect(this.master!)
    osc.start(now)
    osc.stop(now + 0.35)
  }

  /** 拾取 XP：短上升正弦 */
  playXpPickup(): void {
    if (!this.playable()) return
    const ctx = this.ctx!
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(620, now)
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1)
    this.envelope(gain, 0.18, 0.002, 0.02, 0.08, 0.08, now)
    osc.connect(gain).connect(this.master!)
    osc.start(now)
    osc.stop(now + 0.2)
  }

  /** 拾取血包：明亮和弦 */
  playHealthPickup(): void {
    if (!this.playable()) return
    const ctx = this.ctx!
    const now = ctx.currentTime
    const freqs = [523.25, 659.25, 783.99] // C major
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(f, now + i * 0.04)
      this.envelope(gain, 0.14, 0.005, 0.02, 0.08, 0.18, now + i * 0.04)
      osc.connect(gain).connect(this.master!)
      osc.start(now + i * 0.04)
      osc.stop(now + 0.5)
    })
  }

  /** 升级：上扬琶音 */
  playLevelUp(): void {
    if (!this.playable()) return
    const ctx = this.ctx!
    const now = ctx.currentTime
    const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5] // C-E-G-C-E
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(f, now + i * 0.07)
      this.envelope(gain, 0.14, 0.005, 0.02, 0.1, 0.18, now + i * 0.07)
      osc.connect(gain).connect(this.master!)
      osc.start(now + i * 0.07)
      osc.stop(now + 0.8)
    })
  }

  /** 波次开始：上行警报 */
  playWaveStart(): void {
    if (!this.playable()) return
    const ctx = this.ctx!
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(180, now)
    osc.frequency.linearRampToValueAtTime(520, now + 0.35)
    osc.frequency.linearRampToValueAtTime(440, now + 0.55)
    this.envelope(gain, 0.18, 0.02, 0.05, 0.12, 0.3, now)
    osc.connect(gain).connect(this.master!)
    osc.start(now)
    osc.stop(now + 0.9)
  }

  /** 波次清空：简短成功提示 */
  playWaveClear(): void {
    if (!this.playable()) return
    const ctx = this.ctx!
    const now = ctx.currentTime
    const freqs = [440, 554.37, 659.25]
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(f, now + i * 0.08)
      this.envelope(gain, 0.18, 0.005, 0.03, 0.1, 0.2, now + i * 0.08)
      osc.connect(gain).connect(this.master!)
      osc.start(now + i * 0.08)
      osc.stop(now + 0.6)
    })
  }

  /** 冲刺：气流声 */
  playDash(): void {
    if (!this.playable()) return
    const ctx = this.ctx!
    const now = ctx.currentTime
    const noise = ctx.createBufferSource()
    noise.buffer = this.createNoiseBuffer(0.15)
    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(800, now)
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.15)
    const gain = ctx.createGain()
    this.envelope(gain, 0.22, 0.005, 0.02, 0.1, 0.12, now)
    noise.connect(filter).connect(gain).connect(this.master!)
    noise.start(now)
    noise.stop(now + 0.25)
  }

  /** 敌人开火：闷哑射击 */
  playEnemyShoot(): void {
    if (!this.playable()) return
    const ctx = this.ctx!
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.1)
    this.envelope(gain, 0.15, 0.003, 0.015, 0.06, 0.08, now)
    osc.connect(gain).connect(this.master!)
    osc.start(now)
    osc.stop(now + 0.18)
  }

  /** 游戏结束：下降低哼 */
  playGameOver(): void {
    if (!this.playable()) return
    const ctx = this.ctx!
    const now = ctx.currentTime
    const freqs = [330, 262, 196, 147]
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(f, now + i * 0.18)
      this.envelope(gain, 0.2, 0.01, 0.04, 0.14, 0.3, now + i * 0.18)
      osc.connect(gain).connect(this.master!)
      osc.start(now + i * 0.18)
      osc.stop(now + 2)
    })
  }
}

// ---- 单例：同一场次共享，避免多个 AudioContext ----
let singleton: AudioSystem | null = null

export const getAudio = (): AudioSystem => {
  if (!singleton) singleton = new AudioSystem()
  return singleton
}
