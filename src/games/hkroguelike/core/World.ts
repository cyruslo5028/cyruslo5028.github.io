import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  PLAYER_BASE_ATTACK_DAMAGE,
  PLAYER_BASE_ATTACK_RANGE,
  PLAYER_BASE_ATTACK_RATE,
  PLAYER_BASE_HP,
  PLAYER_BASE_SPEED,
} from '../constants'
import { CHARACTERS } from '../content/characters'
import { applySkill } from '../content/skills'
import { applyMetaToStats, type MetaState } from '../content/metaTree'
import type {
  CharacterKey,
  Enemy,
  FloatText,
  Particle,
  Player,
  PlayerStats,
  Projectile,
  Room,
  Scene,
  SkillKey,
  Wall,
} from '../types'
import type { BossState } from '../entities/Boss'

// World holds all mutable game state. Systems mutate it in place each tick.
export type World = {
  scene: Scene
  time: number
  rngSeed: number

  player: Player

  enemies: Enemy[]
  projectiles: Projectile[]
  particles: Particle[]
  floats: FloatText[]

  walls: Wall[]
  arena: { w: number; h: number }

  floorIndex: number
  roomIndex: number
  currentRoom: Room | null

  // pending skill choices to present in the UI
  pendingSkillChoices: SkillKey[] | null

  // run summary
  kills: number
  coins: number
  reputation: number      // 江湖地位 earned this run

  // camera shake (in pixels)
  shake: number
  hitStop: number         // time-stop in seconds

  // boss state
  boss: BossState | null

  // Non-combat rooms set this on clear so update loop auto-advances after
  // a short delay (no card prompt). 0 means inactive.
  autoAdvanceTimer: number

  // delay (s) after entering a room before auto-card-select can trigger.
  // Prevents back-to-back picks when teleporting from combat → reward room.
  roomEntryDelay: number

  // entity id counter
  nextEntityId: number
}

function defaultStats(): PlayerStats {
  return {
    hp: PLAYER_BASE_HP,
    maxHp: PLAYER_BASE_HP,
    speed: PLAYER_BASE_SPEED,
    damage: PLAYER_BASE_ATTACK_DAMAGE,
    attackRate: PLAYER_BASE_ATTACK_RATE,
    range: PLAYER_BASE_ATTACK_RANGE,
    projectileCount: 1,
    pierceCount: 0,
    bounceCount: 0,
    sideShotCount: 0,
    diagonalShot: false,
    critChance: 0.05,
    critMult: 1.5,
    freezeChance: 0,
    fireChance: 0,
    poisonChance: 0,
    lightningChance: 0,
    bleedChance: 0,
    shieldMaxStacks: 0,
    lifesteal: 0,
    summonCount: 0,
    rageMultMax: 0,
  }
}

export function createWorld(characterKey: CharacterKey = 'chan_ho_nam', meta?: MetaState): World {
  const stats = defaultStats()
  const charDef = CHARACTERS[characterKey]
  Object.assign(stats, charDef.baseStats ?? {})
  if (stats.hp > stats.maxHp) stats.hp = stats.maxHp
  if (meta) applyMetaToStats(stats, meta)

  const skillLevels: Partial<Record<SkillKey, number>> = {}
  for (const skill of charDef.startingSkills ?? []) {
    skillLevels[skill] = (skillLevels[skill] ?? 0) + 1
    applySkill(stats, skill, 1)
  }

  const player: Player = {
    pos: { x: ARENA_WIDTH / 2, y: ARENA_HEIGHT / 2 },
    vel: { x: 0, y: 0 },
    facing: 0,
    stats,
    stillTime: 0,
    fireCooldown: 0,
    invulnTimer: 0,
    shieldStacks: stats.shieldMaxStacks,
    characterKey,
    skillLevels,
  }

  return {
    scene: 'menu',
    time: 0,
    rngSeed: (Math.random() * 0xffffffff) >>> 0,
    player,
    enemies: [],
    projectiles: [],
    particles: [],
    floats: [],
    walls: [],
    arena: { w: ARENA_WIDTH, h: ARENA_HEIGHT },
    floorIndex: 0,
    roomIndex: 0,
    currentRoom: null,
    pendingSkillChoices: null,
    kills: 0,
    coins: 0,
    reputation: 0,
    shake: 0,
    hitStop: 0,
    boss: null,
    roomEntryDelay: 0,
    autoAdvanceTimer: 0,
    nextEntityId: 1,
  }
}

// mulberry32 — small deterministic RNG so rooms can be reproducible.
export function createRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
