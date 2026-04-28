export const GAME_WIDTH = 800
export const GAME_HEIGHT = 600
export const CELL_SIZE = 40
export const GRID_COLS = GAME_WIDTH / CELL_SIZE
export const GRID_ROWS = GAME_HEIGHT / CELL_SIZE

export const PLAYER_SPAWN = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 }
export const MAX_PLAYER_HP = 3
export const BASE_PLAYER_SPEED = 196
export const BASE_FIRE_COOLDOWN = 0.32
export const BASE_BULLET_SPEED = 420

export const UPGRADE_LIBRARY = {
  scatter: {
    title: '散射炮',
    description: '同时发射 3 颗子弹，适合狭窄街区清图。',
  },
  pierce: {
    title: '穿透弹',
    description: '子弹会穿透敌人，但仍会被墙体阻挡。',
  },
  shield: {
    title: '护盾',
    description: '获得 1 层护盾，抵挡下一次伤害。',
  },
  speed: {
    title: '移速 +20%',
    description: '在霓虹巷道中更快穿梭与拉扯。',
  },
  damage: {
    title: '伤害 +50%',
    description: '每发炮弹造成更高伤害。',
  },
  fireRate: {
    title: '射速 +30%',
    description: '缩短装填间隔，提升持续压制能力。',
  },
} as const

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
  x: number
  y: number
  width: number
  height: number
  color: string
  text: string
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
  pierce: boolean
  hitIds: number[]
}

export type Particle = {
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

export type UpgradeState = {
  scatter: boolean
  pierce: boolean
  shieldCharges: number
  speedMultiplier: number
  damageMultiplier: number
  fireRateMultiplier: number
  picks: UpgradeKey[]
}

export type WorldState = {
  scene: SceneState
  time: number
  wave: number
  score: number
  nextEnemyId: number
  nextBulletId: number
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

export type TankGameView = {
  scene: SceneState
  wave: number
  score: number
  hp: number
  maxHp: number
  shieldCharges: number
  upgrades: UpgradeKey[]
  upgradeOptions: Array<{ key: UpgradeKey; title: string; description: string }>
}
