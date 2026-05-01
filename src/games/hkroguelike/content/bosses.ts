import type { FloorKey } from '../types'

// Boss archetypes — each floor has one boss with unique attack patterns + look.
export type BossKind =
  | 'mong_kok_boss'      // 旺角大飛 — 西瓜刀衝鋒 + 召喚馬仔
  | 'causeway_bay_boss'  // 銅鑼灣老闆 — 雙鎗扇形彈幕 + dash
  | 'yau_ma_tei_boss'    // 油麻地廟祝 — 召喚 + AoE 圈
  | 'tai_tin_yi_final'   // 廟街最終 — 多階段全元素

export type BossDef = {
  kind: BossKind
  displayName: string
  english: string
  hp: number
  damage: number
  speed: number
  radius: number
  color: string
  accent: string
  // Movement / attack tuning
  attackPatterns: BossPattern[]
}

export type BossPattern =
  | { kind: 'charge'; cooldown: number; speedMul: number; windup: number }
  | { kind: 'fanShot'; cooldown: number; bullets: number; spread: number; speed: number; damage: number }
  | { kind: 'aoeRing'; cooldown: number; radius: number; damage: number; windup: number }
  | { kind: 'summon'; cooldown: number; count: number }
  | { kind: 'dash'; cooldown: number; speedMul: number }
  | { kind: 'elementBurst'; cooldown: number; damage: number; element: 'fire' | 'freeze' | 'lightning' | 'poison' }

export const BOSSES: Record<BossKind, BossDef> = {
  mong_kok_boss: {
    kind: 'mong_kok_boss',
    displayName: '旺角大飛',
    english: 'Mong Kok Big Bro',
    hp: 900,
    damage: 24,
    speed: 110,
    radius: 30,
    color: '#e84a52',
    accent: '#ff4fd8',
    attackPatterns: [
      { kind: 'charge', cooldown: 4.5, speedMul: 3.2, windup: 0.55 },
      { kind: 'summon', cooldown: 7, count: 3 },
    ],
  },
  causeway_bay_boss: {
    kind: 'causeway_bay_boss',
    displayName: '銅鑼灣老闆',
    english: 'Causeway Boss',
    hp: 1400,
    damage: 20,
    speed: 95,
    radius: 32,
    color: '#36d6ff',
    accent: '#3a82d8',
    attackPatterns: [
      { kind: 'fanShot', cooldown: 2.8, bullets: 7, spread: 0.9, speed: 320, damage: 14 },
      { kind: 'dash', cooldown: 5.5, speedMul: 2.6 },
    ],
  },
  yau_ma_tei_boss: {
    kind: 'yau_ma_tei_boss',
    displayName: '油麻地廟祝',
    english: 'Yau Ma Tei Priest',
    hp: 1700,
    damage: 24,
    speed: 70,
    radius: 32,
    color: '#ffd16a',
    accent: '#ffd16a',
    attackPatterns: [
      { kind: 'aoeRing', cooldown: 5.0, radius: 200, damage: 22, windup: 1.0 },
      { kind: 'summon', cooldown: 8, count: 4 },
      { kind: 'fanShot', cooldown: 3.6, bullets: 5, spread: 0.6, speed: 260, damage: 12 },
    ],
  },
  tai_tin_yi_final: {
    kind: 'tai_tin_yi_final',
    displayName: '大天二',
    english: 'Tai Tin-yi',
    hp: 2800,
    damage: 32,
    speed: 130,
    radius: 36,
    color: '#ff2050',
    accent: '#ffd16a',
    attackPatterns: [
      { kind: 'charge', cooldown: 4.2, speedMul: 3.5, windup: 0.45 },
      { kind: 'fanShot', cooldown: 3.0, bullets: 9, spread: 1.1, speed: 360, damage: 16 },
      { kind: 'aoeRing', cooldown: 6.5, radius: 240, damage: 28, windup: 0.8 },
      { kind: 'elementBurst', cooldown: 5.0, damage: 20, element: 'fire' },
      { kind: 'elementBurst', cooldown: 6.0, damage: 18, element: 'lightning' },
    ],
  },
}

export const FLOOR_BOSS: Record<FloorKey, BossKind> = {
  mong_kok: 'mong_kok_boss',
  causeway_bay: 'causeway_bay_boss',
  yau_ma_tei: 'yau_ma_tei_boss',
  temple_street: 'tai_tin_yi_final',
}
