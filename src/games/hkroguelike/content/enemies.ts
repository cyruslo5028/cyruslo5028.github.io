import type { EnemyKind } from '../types'

// Enemy archetypes — extend later with unique AI/visuals per kind.
export type EnemyArchetype = {
  kind: EnemyKind
  displayName: string
  english: string
  hp: number
  damage: number
  speed: number
  radius: number
  color: string
  // AI tag describing dominant behaviour (used by AI dispatch later).
  ai: 'chase' | 'kite' | 'ranged' | 'rusher' | 'patrol'
  reward: number  // 江湖地位 / 錢 drop weight
}

export const ENEMIES: Record<EnemyKind, EnemyArchetype> = {
  maa_zai: {
    kind: 'maa_zai',
    displayName: '馬仔',
    english: 'Foot soldier',
    hp: 34,
    damage: 12,
    speed: 90,
    radius: 16,
    color: '#9aa0b4',
    ai: 'chase',
    reward: 1,
  },
  tai_cheung: {
    kind: 'tai_cheung',
    displayName: '睇場',
    english: 'Bouncer',
    hp: 78,
    damage: 20,
    speed: 70,
    radius: 22,
    color: '#ffb066',
    ai: 'rusher',
    reward: 2,
  },
  wu_ngaa: {
    kind: 'wu_ngaa',
    displayName: '烏鴉刀手',
    english: 'Knife thrower',
    hp: 44,
    damage: 15,
    speed: 80,
    radius: 16,
    color: '#7c5cff',
    ai: 'kite',
    reward: 2,
  },
  dau_hou: {
    kind: 'dau_hou',
    displayName: '鬥犬',
    english: 'Attack dog',
    hp: 28,
    damage: 17,
    speed: 160,
    radius: 14,
    color: '#ff5c5c',
    ai: 'rusher',
    reward: 1,
  },
  ging_caat: {
    kind: 'ging_caat',
    displayName: '差人',
    english: 'Cop',
    hp: 92,
    damage: 22,
    speed: 95,
    radius: 18,
    color: '#3aa0ff',
    ai: 'ranged',
    reward: 3,
  },
}
