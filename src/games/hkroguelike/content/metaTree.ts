import type { PlayerStats } from '../types'

// === 江湖地位永久升級樹 ===
// 4 條路（劈友 / 義氣 / 搵食 / 兄弟），每條 4 個節點。
// 每個節點 cost reputation points，永久 apply 到 player stats 開局。
// 排前面嘅節點解鎖排後面嘅。

export type MetaPath = 'pek_jau' | 'ji_hei' | 'wan_sik' | 'hing_dai'
export type MetaNodeKey =
  | 'pek_jau_1' | 'pek_jau_2' | 'pek_jau_3' | 'pek_jau_4'
  | 'ji_hei_1' | 'ji_hei_2' | 'ji_hei_3' | 'ji_hei_4'
  | 'wan_sik_1' | 'wan_sik_2' | 'wan_sik_3' | 'wan_sik_4'
  | 'hing_dai_1' | 'hing_dai_2' | 'hing_dai_3' | 'hing_dai_4'

export type MetaNode = {
  key: MetaNodeKey
  path: MetaPath
  tier: 1 | 2 | 3 | 4
  name: string
  description: string
  cost: number
  apply: (s: PlayerStats) => void
}

export const META_PATHS: Record<MetaPath, { name: string; english: string; color: string; description: string }> = {
  pek_jau: { name: '劈友', english: 'Brawler', color: '#ff4a4a', description: '攻擊路 — 加傷害、攻速、暴擊' },
  ji_hei: { name: '義氣', english: 'Loyalty', color: '#36d6ff', description: '防禦路 — 加血、護盾、減傷' },
  wan_sik: { name: '搵食', english: 'Hustle', color: '#ffd16a', description: '掉落路 — 加錢、加技能選項、加 reputation' },
  hing_dai: { name: '兄弟', english: 'Brotherhood', color: '#a45cff', description: '召喚路 — 加馬仔、飲血、回血' },
}

export const META_NODES: Record<MetaNodeKey, MetaNode> = {
  // 劈友 ——
  pek_jau_1: {
    key: 'pek_jau_1', path: 'pek_jau', tier: 1, cost: 5,
    name: '劈得郁',
    description: '開局 +10% 傷害',
    apply: (s) => { s.damage *= 1.10 },
  },
  pek_jau_2: {
    key: 'pek_jau_2', path: 'pek_jau', tier: 2, cost: 12,
    name: '快出手',
    description: '開局 +15% 攻速',
    apply: (s) => { s.attackRate *= 1.15 },
  },
  pek_jau_3: {
    key: 'pek_jau_3', path: 'pek_jau', tier: 3, cost: 22,
    name: '撼到實',
    description: '開局 +10% 暴擊率',
    apply: (s) => { s.critChance += 0.10 },
  },
  pek_jau_4: {
    key: 'pek_jau_4', path: 'pek_jau', tier: 4, cost: 40,
    name: '一刀劈',
    description: '開局 +30% 暴擊傷害',
    apply: (s) => { s.critMult += 0.30 },
  },
  // 義氣 ——
  ji_hei_1: {
    key: 'ji_hei_1', path: 'ji_hei', tier: 1, cost: 5,
    name: '夠頂',
    description: '開局 +20 max HP',
    apply: (s) => { s.maxHp += 20; s.hp += 20 },
  },
  ji_hei_2: {
    key: 'ji_hei_2', path: 'ji_hei', tier: 2, cost: 12,
    name: '擋格',
    description: '開局 +1 護盾 stack',
    apply: (s) => { s.shieldMaxStacks += 1 },
  },
  ji_hei_3: {
    key: 'ji_hei_3', path: 'ji_hei', tier: 3, cost: 22,
    name: '頂頭過',
    description: '開局 +30 max HP',
    apply: (s) => { s.maxHp += 30; s.hp += 30 },
  },
  ji_hei_4: {
    key: 'ji_hei_4', path: 'ji_hei', tier: 4, cost: 40,
    name: '硬係要',
    description: '開局再 +1 護盾 stack',
    apply: (s) => { s.shieldMaxStacks += 1 },
  },
  // 搵食 ——
  wan_sik_1: {
    key: 'wan_sik_1', path: 'wan_sik', tier: 1, cost: 5,
    name: '快手快腳',
    description: '開局 +10% 移速',
    apply: (s) => { s.speed *= 1.10 },
  },
  wan_sik_2: {
    key: 'wan_sik_2', path: 'wan_sik', tier: 2, cost: 12,
    name: '射遠啲',
    description: '開局 +20% 攻擊範圍',
    apply: (s) => { s.range *= 1.20 },
  },
  wan_sik_3: {
    key: 'wan_sik_3', path: 'wan_sik', tier: 3, cost: 22,
    name: '見到就執',
    description: '開局 +10% 移速',
    apply: (s) => { s.speed *= 1.10 },
  },
  wan_sik_4: {
    key: 'wan_sik_4', path: 'wan_sik', tier: 4, cost: 40,
    name: '日日有得撈',
    description: '開局再 +20% 攻擊範圍',
    apply: (s) => { s.range *= 1.20 },
  },
  // 兄弟 ——
  hing_dai_1: {
    key: 'hing_dai_1', path: 'hing_dai', tier: 1, cost: 5,
    name: '飲啖茶',
    description: '開局擊殺回 1 血',
    apply: (s) => { s.lifesteal += 1 },
  },
  hing_dai_2: {
    key: 'hing_dai_2', path: 'hing_dai', tier: 2, cost: 12,
    name: '紅雞',
    description: '開局 +15% rage damage',
    apply: (s) => { s.rageMultMax = Math.max(s.rageMultMax, 0.15) },
  },
  hing_dai_3: {
    key: 'hing_dai_3', path: 'hing_dai', tier: 3, cost: 22,
    name: '叫人',
    description: '開局召喚 1 個馬仔',
    apply: (s) => { s.summonCount += 1 },
  },
  hing_dai_4: {
    key: 'hing_dai_4', path: 'hing_dai', tier: 4, cost: 40,
    name: '扎職',
    description: '開局擊殺再回 2 血',
    apply: (s) => { s.lifesteal += 2 },
  },
}

export type MetaState = Partial<Record<MetaNodeKey, boolean>>

const META_KEY = 'hkr_meta_tree_v1'

export function loadMeta(): MetaState {
  try {
    const raw = localStorage.getItem(META_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch { return {} }
}

export function saveMeta(state: MetaState) {
  try { localStorage.setItem(META_KEY, JSON.stringify(state)) } catch { /* noop */ }
}

export function applyMetaToStats(stats: PlayerStats, state: MetaState) {
  for (const key of Object.keys(state) as MetaNodeKey[]) {
    if (state[key]) META_NODES[key].apply(stats)
  }
}

// Can the user buy this node? Tier N requires the previous tier on same path.
export function canPurchase(node: MetaNode, state: MetaState): boolean {
  if (state[node.key]) return false  // already owned
  if (node.tier === 1) return true
  const prevTier = (node.tier - 1) as 1 | 2 | 3
  const prevKey = `${node.path}_${prevTier}` as MetaNodeKey
  return !!state[prevKey]
}
