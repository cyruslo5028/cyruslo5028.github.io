// === Shared game types ===

export type Vec2 = { x: number; y: number }

export type Scene = 'menu' | 'metaTree' | 'playing' | 'cardSelect' | 'gameOver' | 'victory' | 'paused'

export type EnemyKind = 'maa_zai' | 'tai_cheung' | 'wu_ngaa' | 'dau_hou' | 'ging_caat'

export type SkillKey =
  | 'multishot'      // 左右開弓
  | 'pierce'         // 過骨
  | 'bounce'         // 彈牆
  | 'sideShot'       // 孖 shot
  | 'diagonalShot'   // 四面埋伏
  | 'attackSpeed'    // 快手
  | 'crit'           // 撼到正
  | 'moveSpeed'      // 腳頭快
  | 'shield'         // 擋格
  | 'freeze'         // 冷處理
  | 'fire'           // 火爆
  | 'poison'         // 落毒
  | 'lightning'      // 過電
  | 'bleed'          // 見血
  | 'summon'         // 叫人嚟撐
  | 'damageUp'       // 劈友
  | 'maxHpUp'        // 食得是福
  | 'lifesteal'      // 飲血
  | 'rage'           // 紅雞

export type SkillDef = {
  key: SkillKey
  name: string          // 古惑仔 slang
  english: string       // english helper
  description: string
  maxLevel: number
  rarity: 'common' | 'rare' | 'epic'
  apply: (s: PlayerStats, level: number) => void
}

export type PlayerStats = {
  hp: number
  maxHp: number
  speed: number
  damage: number
  attackRate: number      // shots per second
  range: number
  // shot modifiers
  projectileCount: number // multishot adds bullets
  pierceCount: number     // pierce: how many enemies a knife passes through
  bounceCount: number     // bounce: how many wall bounces
  sideShotCount: number   // 0 / 1 / 2 (90° each side per level)
  diagonalShot: boolean
  // crit
  critChance: number
  critMult: number
  // elemental
  freezeChance: number
  fireChance: number
  poisonChance: number
  lightningChance: number
  bleedChance: number
  // defense
  shieldMaxStacks: number
  lifesteal: number       // hp gained per kill
  // pets
  summonCount: number
  // rage: damage scales as hp drops
  rageMultMax: number
}

export type CharacterKey =
  | 'chan_ho_nam'
  | 'shan_gai'
  | 'wu_ngaa_player'
  | 'liang_kun'
  | 'tai_tin_yi'
  | 'wong_mou_fu'
  | 'siu_min_fu'
  | 'taai_zi'
  | 'daai_lou_b'
  | 'fung_wan'

export type Rarity = 'R' | 'SR' | 'SSR' | 'XR'
export type ClassType = 'attack' | 'defense' | 'wisdom' | 'medic' | 'support'

export type CharacterDef = {
  key: CharacterKey
  displayName: string         // 中文 e.g. 陳浩南
  english: string
  rarity: Rarity              // 影響卡牌底色 (red/gold/purple/blue)
  classType: ClassType        // 攻/防/智/醫/輔
  stars: number               // 1..5
  battlePower: number         // 戰力數值（顯示用）
  unlockReq: number           // 江湖地位 needed
  description: string
  tagline: string             // 短 quote / catchphrase
  baseStats: Partial<PlayerStats>
  startingSkills?: SkillKey[]
  // Visual: gradient theme for the card portrait area + silhouette descriptor
  portraitColor: string       // accent color
  silhouette: 'lean' | 'bulky' | 'punk' | 'cool' | 'wild' | 'thug' | 'kid' | 'fighter' | 'oldschool'
  portraitUrl?: string        // optional override (drop real art later)
}

export type Player = {
  pos: Vec2
  vel: Vec2
  facing: number          // radians
  stats: PlayerStats
  stillTime: number       // seconds since stopped moving
  fireCooldown: number    // seconds until next auto-shot allowed
  invulnTimer: number
  shieldStacks: number
  characterKey: CharacterKey
  skillLevels: Partial<Record<SkillKey, number>>
}

export type Enemy = {
  id: number
  kind: EnemyKind
  pos: Vec2
  vel: Vec2
  hp: number
  maxHp: number
  damage: number
  speed: number
  radius: number
  attackCooldown: number
  // status effects
  freezeTimer: number
  burnTimer: number
  poisonTimer: number
  lightningTimer: number   // brief charged window — chains to nearby on tick
  bleedTimer: number
  bleedStacks: number      // bleed scales with stacks
  stunTimer: number        // 麻痺 / 痙攣 — like freeze but visually distinct
  // ai
  thinkTimer: number
}

export type Projectile = {
  id: number
  pos: Vec2
  vel: Vec2
  damage: number
  lifetime: number
  pierceLeft: number
  bounceLeft: number
  isCrit: boolean
  hitSet: Set<number>     // enemy ids already hit (pierce)
  fromPlayer: boolean
  enemyFlavor?: 'knife' | 'bullet'  // for enemy projectile rendering
}

export type Wall = {
  x: number
  y: number
  w: number
  h: number
}

export type RoomKind = 'combat' | 'shop' | 'rest' | 'shrine' | 'treasure' | 'boss'

export type TreasureBox = {
  pos: Vec2
  opened: boolean
  radius: number
}

export type Room = {
  index: number           // 0-based within floor
  floor: number           // 0..3
  kind: RoomKind
  walls: Wall[]
  spawnGroups: EnemyKind[][] // waves of enemies inside the room
  cleared: boolean
  treasureBox?: TreasureBox  // present iff kind === 'treasure'
}

export type FloorKey = 'mong_kok' | 'causeway_bay' | 'yau_ma_tei' | 'temple_street'

export type FloorDef = {
  key: FloorKey
  displayName: string
  english: string
  bgColor: string
  accent: string
  enemyPool: EnemyKind[]
  bossKey: EnemyKind | string
}

export type FloatText = {
  pos: Vec2
  text: string
  color: string
  age: number
  ttl: number
  vy: number
}

export type Particle = {
  pos: Vec2
  vel: Vec2
  age: number
  ttl: number
  color: string
  size: number
}
