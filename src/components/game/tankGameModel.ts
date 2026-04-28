export const GAME_WIDTH = 800
export const GAME_HEIGHT = 600
export const CELL_SIZE = 40
export const GRID_COLS = GAME_WIDTH / CELL_SIZE
export const GRID_ROWS = GAME_HEIGHT / CELL_SIZE

export const PLAYER_RADIUS = 16
export const ENEMY_RADIUS = 15
export const PLAYER_SPAWN = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 }

export const BASE_PLAYER_SPEED = 208
export const BASE_BULLET_SPEED = 460
export const BASE_FIRE_COOLDOWN = 0.34
export const MIN_FIRE_COOLDOWN = 0.08
export const BASE_PLAYER_BULLET_DAMAGE = 18
export const BASE_ENEMY_HP = 34
export const BASE_ENEMY_SPEED = 104

export const NEON_SIGN_TEXTURES = [
  '/textures/hk-neon-nathan-road.jpg',
  '/textures/hk-neon-soy-street.jpg',
  '/textures/hk-neon-club-venus.jpg',
  '/textures/hk-neon-wan-chai.jpg',
  '/textures/hk-neon-koon-nam-wah.jpg',
] as const

export const DIFFICULTY_PRESETS = {
  easy: {
    label: '简单',
    hudLabel: 'EASY MODE',
    playerMaxHp: 150,
    enemyDamage: 5,
    enemySpeedMultiplier: 0.7,
    enemyExtraCount: 0,
  },
  normal: {
    label: '普通',
    hudLabel: 'NORMAL MODE',
    playerMaxHp: 100,
    enemyDamage: 15,
    enemySpeedMultiplier: 1,
    enemyExtraCount: 0,
  },
  hard: {
    label: '困难',
    hudLabel: 'HARD MODE',
    playerMaxHp: 60,
    enemyDamage: 25,
    enemySpeedMultiplier: 1.4,
    enemyExtraCount: 2,
  },
} as const

export const UPGRADE_LIBRARY = {
  damageUp: {
    title: '伤害强化',
    description: '每层让子弹基础伤害提升 20%。',
  },
  fireRateUp: {
    title: '急速冷却',
    description: '每层让开火间隔缩短 15%，并保留安全下限。',
  },
  multishot: {
    title: '多重散射',
    description: '每层追加一组对称弹道，单发逐步变成霰弹幕。',
  },
  bigBullets: {
    title: '巨型炮弹',
    description: '每层让子弹体积放大 30%，并额外提升 15% 伤害。',
  },
  piercingBullets: {
    title: '穿透弹',
    description: '每层让子弹额外穿透 1 个敌人后再消失。',
  },
  vampirism: {
    title: '吸血引擎',
    description: '每层提升击杀回复概率，并增加回复量。',
  },
  criticalHit: {
    title: '暴击模块',
    description: '每层提升 15% 暴击率，暴击时造成双倍伤害。',
  },
  armorUp: {
    title: '装甲强化',
    description: '每层最大生命值 +30，并立刻恢复 30 HP。',
  },
} as const

export type DifficultyKey = keyof typeof DIFFICULTY_PRESETS
export type UpgradeKey = keyof typeof UPGRADE_LIBRARY
export type SceneState = 'idle' | 'playing' | 'upgrading' | 'gameover'

export type Vec2 = {
  x: number
  y: number
}

export type Rect = {
  x: number
  y: number
  width: number
  height: number
}

export type NeonSign = {
  id: string
  x: number
  y: number
  width: number
  height: number
  elevation: number
  side: 'north' | 'south' | 'east' | 'west'
  floating: boolean
  tint: string
  texture: (typeof NEON_SIGN_TEXTURES)[number]
}

export type GameMap = {
  walls: boolean[][]
  spawnCells: Vec2[]
  signs: NeonSign[]
}

export type TankBody = {
  x: number
  y: number
  angle: number
  radius: number
}

export type PlayerTank = TankBody & {
  hp: number
  maxHp: number
  cooldown: number
  invulnerable: number
}

export type EnemyTank = TankBody & {
  id: number
  hp: number
  maxHp: number
  cooldown: number
  damage: number
  path: Vec2[]
  repathIn: number
  fireJitter: number
}

export type Bullet = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  damage: number
  fromEnemy: boolean
  ttl: number
  pierceRemaining: number
  hitIds: number[]
  crit: boolean
}

export type Particle = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

export type Flash = {
  id: number
  x: number
  y: number
  life: number
  maxLife: number
  radius: number
  color: string
}

export type InputState = {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  firing: boolean
}

export type UpgradeLevels = Record<UpgradeKey, number>

export type UpgradeState = {
  levels: UpgradeLevels
}

export type WorldState = {
  scene: SceneState
  time: number
  wave: number
  score: number
  difficulty: DifficultyKey
  nextEnemyId: number
  nextBulletId: number
  nextEffectId: number
  map: GameMap
  player: PlayerTank
  enemies: EnemyTank[]
  bullets: Bullet[]
  particles: Particle[]
  flashes: Flash[]
  input: InputState
  pointer: { x: number; y: number; inside: boolean }
  upgrades: UpgradeState
  upgradeOptions: UpgradeKey[]
  shake: number
}

export type UpgradeOptionView = {
  key: UpgradeKey
  title: string
  description: string
  level: number
}
