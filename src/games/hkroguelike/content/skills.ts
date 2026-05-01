import type { PlayerStats, SkillDef, SkillKey } from '../types'

// 古惑仔 slang skill catalog. Every classic Archero modifier mapped to HK gangster vocabulary.
export const SKILLS: Record<SkillKey, SkillDef> = {
  multishot: {
    key: 'multishot',
    name: '左右開弓',
    english: 'Multishot',
    description: '每次擲飛刀多一把，前方扇形射出',
    maxLevel: 4,
    rarity: 'epic',
    apply: (s, lv) => { s.projectileCount += lv },
  },
  pierce: {
    key: 'pierce',
    name: '過骨',
    english: 'Pierce',
    description: '飛刀穿透多一個目標',
    maxLevel: 5,
    rarity: 'rare',
    apply: (s, lv) => { s.pierceCount += lv },
  },
  bounce: {
    key: 'bounce',
    name: '彈牆',
    english: 'Wall Bounce',
    description: '飛刀彈牆多一次',
    maxLevel: 4,
    rarity: 'rare',
    apply: (s, lv) => { s.bounceCount += lv },
  },
  sideShot: {
    key: 'sideShot',
    name: '孖 shot',
    english: 'Side Shot',
    description: '兩側各加一把同步飛刀',
    maxLevel: 4,
    rarity: 'epic',
    apply: (s, lv) => { s.sideShotCount += lv },
  },
  diagonalShot: {
    key: 'diagonalShot',
    name: '四面埋伏',
    english: 'Diagonal Shot',
    description: '四個對角方向同時擲刀',
    maxLevel: 1,
    rarity: 'epic',
    apply: (s) => { s.diagonalShot = true },
  },
  attackSpeed: {
    key: 'attackSpeed',
    name: '快手',
    english: 'Attack Speed',
    description: '攻擊速度 +25%',
    maxLevel: 8,
    rarity: 'common',
    apply: (s, lv) => { s.attackRate *= Math.pow(1.25, lv) },
  },
  crit: {
    key: 'crit',
    name: '撼到正',
    english: 'Critical Hit',
    description: '暴擊率 +15%、暴擊傷害 +50%',
    maxLevel: 6,
    rarity: 'rare',
    apply: (s, lv) => {
      s.critChance += 0.15 * lv
      s.critMult = Math.max(s.critMult, 1.5 + 0.25 * lv)
    },
  },
  moveSpeed: {
    key: 'moveSpeed',
    name: '腳頭快',
    english: 'Move Speed',
    description: '移動速度 +15%',
    maxLevel: 6,
    rarity: 'common',
    apply: (s, lv) => { s.speed *= Math.pow(1.15, lv) },
  },
  shield: {
    key: 'shield',
    name: '擋格',
    english: 'Shield',
    description: '獲得護盾，受擊時抵擋一下',
    maxLevel: 5,
    rarity: 'rare',
    apply: (s, lv) => { s.shieldMaxStacks += lv },
  },
  freeze: {
    key: 'freeze',
    name: '冷處理',
    english: 'Freeze',
    description: '20% 機率冷凍敵人 1 秒',
    maxLevel: 5,
    rarity: 'rare',
    apply: (s, lv) => { s.freezeChance += 0.2 * lv },
  },
  fire: {
    key: 'fire',
    name: '火爆',
    english: 'Burn',
    description: '20% 機率點燃敵人，持續燒血',
    maxLevel: 5,
    rarity: 'rare',
    apply: (s, lv) => { s.fireChance += 0.2 * lv },
  },
  poison: {
    key: 'poison',
    name: '落毒',
    english: 'Poison',
    description: '20% 機率落毒，慢慢扣血',
    maxLevel: 5,
    rarity: 'rare',
    apply: (s, lv) => { s.poisonChance += 0.2 * lv },
  },
  lightning: {
    key: 'lightning',
    name: '過電',
    english: 'Lightning',
    description: '20% 機率過電，向附近敵人連鎖傷害',
    maxLevel: 5,
    rarity: 'rare',
    apply: (s, lv) => { s.lightningChance += 0.2 * lv },
  },
  bleed: {
    key: 'bleed',
    name: '見血',
    english: 'Bleed',
    description: '25% 機率見血，可疊層持續扣血',
    maxLevel: 5,
    rarity: 'rare',
    apply: (s, lv) => { s.bleedChance += 0.25 * lv },
  },
  summon: {
    key: 'summon',
    name: '叫人嚟撐',
    english: 'Summon Minion',
    description: '召喚一個馬仔幫你劈人',
    maxLevel: 4,
    rarity: 'epic',
    apply: (s, lv) => { s.summonCount += lv },
  },
  damageUp: {
    key: 'damageUp',
    name: '劈友',
    english: 'Damage Up',
    description: '傷害 +20%',
    maxLevel: 10,
    rarity: 'common',
    apply: (s, lv) => { s.damage *= Math.pow(1.2, lv) },
  },
  maxHpUp: {
    key: 'maxHpUp',
    name: '食得是福',
    english: 'Max HP Up',
    description: '上限 HP +25 並回滿',
    maxLevel: 10,
    rarity: 'common',
    apply: (s, lv) => {
      s.maxHp += 25 * lv
      s.hp = s.maxHp
    },
  },
  lifesteal: {
    key: 'lifesteal',
    name: '飲血',
    english: 'Lifesteal',
    description: '擊殺敵人回 3 點血',
    maxLevel: 5,
    rarity: 'rare',
    apply: (s, lv) => { s.lifesteal += 3 * lv },
  },
  rage: {
    key: 'rage',
    name: '紅雞',
    english: 'Rage',
    description: '血越少傷害越高，最多 +50%',
    maxLevel: 4,
    rarity: 'rare',
    apply: (s, lv) => { s.rageMultMax = Math.max(s.rageMultMax, 0.25 * lv + 0.25) },
  },
}

export function applySkill(stats: PlayerStats, key: SkillKey, level: number) {
  const def = SKILLS[key]
  def.apply(stats, level)
}

// Returns 3 random skill choices the player hasn't already maxed.
export function rollSkillChoices(
  current: Partial<Record<SkillKey, number>>,
  rng: () => number,
  count = 3,
): SkillKey[] {
  const pool: SkillKey[] = []
  for (const key of Object.keys(SKILLS) as SkillKey[]) {
    const def = SKILLS[key]
    const have = current[key] ?? 0
    if (have >= def.maxLevel) continue
    const weight = def.rarity === 'common' ? 5 : def.rarity === 'rare' ? 3 : 1
    for (let i = 0; i < weight; i += 1) pool.push(key)
  }

  const out: SkillKey[] = []
  while (out.length < count && pool.length > 0) {
    const idx = Math.floor(rng() * pool.length)
    const pick = pool[idx]
    if (!out.includes(pick)) out.push(pick)
    // remove all entries of this key so we don't double-pick the same skill
    for (let i = pool.length - 1; i >= 0; i -= 1) {
      if (pool[i] === pick) pool.splice(i, 1)
    }
  }
  // Late-game fallback: if everything is maxed, offer evergreen stat skills
  // so the card-select UI is never empty.
  const evergreen: SkillKey[] = ['damageUp', 'maxHpUp', 'attackSpeed', 'crit', 'moveSpeed']
  let i = 0
  while (out.length < count && i < evergreen.length) {
    if (!out.includes(evergreen[i])) out.push(evergreen[i])
    i += 1
  }
  return out
}
