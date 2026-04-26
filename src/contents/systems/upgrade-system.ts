import type { IUpgradeOption, UpgradeId } from '../types'

/**
 * 升级池定义 + 随机抽取逻辑。
 *
 * 每次 level-up 从池中权重抽取 N 个不重复选项。
 * 实际数值增量在 player 侧消费 apply 时决定，这里只描述语义。
 */

export interface IUpgradeDef extends IUpgradeOption {
  /** 权重：数字越大，抽到概率越高 */
  weight: number
  /** 同一升级的最大叠加次数（undefined = 无上限） */
  maxStacks?: number
}

export const UPGRADE_POOL: IUpgradeDef[] = [
  {
    id: 'damage-up',
    title: '高热弹头',
    description: '子弹伤害 +6',
    tier: 'common',
    icon: 'sword',
    weight: 10,
  },
  {
    id: 'fire-rate-up',
    title: '连发改装',
    description: '射击间隔 -15%',
    tier: 'common',
    icon: 'zap',
    weight: 10,
    maxStacks: 8,
  },
  {
    id: 'speed-up',
    title: '轻量战靴',
    description: '移动速度 +20',
    tier: 'common',
    icon: 'fast-forward',
    weight: 8,
    maxStacks: 6,
  },
  {
    id: 'max-hp-up',
    title: '强化护甲',
    description: '生命上限 +20 并即时回满',
    tier: 'rare',
    icon: 'shield',
    weight: 7,
  },
  {
    id: 'multi-shot',
    title: '多重弹道',
    description: '每次射击多一发（扩散）',
    tier: 'rare',
    icon: 'scatter',
    weight: 5,
    maxStacks: 4,
  },
  {
    id: 'pierce-up',
    title: '穿甲弹',
    description: '子弹额外穿透 1 个敌人',
    tier: 'rare',
    icon: 'arrow',
    weight: 5,
    maxStacks: 3,
  },
  {
    id: 'pickup-radius',
    title: '磁力核心',
    description: '拾取范围 +40%',
    tier: 'common',
    icon: 'magnet',
    weight: 6,
    maxStacks: 4,
  },
  {
    id: 'xp-mult',
    title: '经验浓缩',
    description: '经验收益 +25%',
    tier: 'rare',
    icon: 'star',
    weight: 6,
    maxStacks: 4,
  },
  {
    id: 'bullet-speed',
    title: '高速弹匣',
    description: '子弹速度 +20%',
    tier: 'common',
    icon: 'wind',
    weight: 5,
    maxStacks: 4,
  },
  {
    id: 'heal',
    title: '能量注射',
    description: '立即回复 40 生命',
    tier: 'common',
    icon: 'heart',
    weight: 6,
  },
]

/**
 * 抽取 n 个不重复的升级选项。
 *
 * @param n           抽取数量
 * @param stacks      每个升级的当前堆叠数（用于剔除已达上限的）
 * @param currentHp   当前 HP（满血时 heal 降权）
 * @param maxHp       最大 HP
 */
export const pickUpgrades = (
  n: number,
  stacks: Record<UpgradeId, number>,
  currentHp: number,
  maxHp: number,
): IUpgradeOption[] => {
  const available = UPGRADE_POOL.filter((u) => {
    const cur = stacks[u.id] ?? 0
    if (u.maxStacks !== undefined && cur >= u.maxStacks) return false
    return true
  })

  if (available.length === 0) return []

  // 动态权重：满血时 heal 权重减半
  const dynWeights = available.map((u) => {
    let w = u.weight
    if (u.id === 'heal' && currentHp >= maxHp) w *= 0.3
    if (u.id === 'heal' && currentHp / maxHp >= 0.8) w *= 0.6
    return w
  })

  const chosen: IUpgradeOption[] = []
  const poolCopy = [...available]
  const weightsCopy = [...dynWeights]

  for (let i = 0; i < n && poolCopy.length > 0; i++) {
    const total = weightsCopy.reduce((a, b) => a + b, 0)
    let r = Math.random() * total
    let idx = 0
    for (; idx < weightsCopy.length; idx++) {
      r -= weightsCopy[idx]
      if (r <= 0) break
    }
    idx = Math.min(idx, poolCopy.length - 1)
    const pick = poolCopy[idx]
    chosen.push({
      id: pick.id,
      title: pick.title,
      description: pick.description,
      tier: pick.tier,
      icon: pick.icon,
    })
    poolCopy.splice(idx, 1)
    weightsCopy.splice(idx, 1)
  }

  return chosen
}
