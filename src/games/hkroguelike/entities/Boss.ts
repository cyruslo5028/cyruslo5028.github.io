import type { Enemy, Projectile, Vec2 } from '../types'
import type { World } from '../core/World'
import { BOSSES, type BossDef, type BossKind, type BossPattern } from '../content/bosses'
import { ENEMIES } from '../content/enemies'
import { damagePlayer } from './Player'
import { resolveCircleVsWalls } from '../systems/walls'
import { play } from '../core/Audio'

// Boss is stored as an Enemy + per-instance state on world.bossState.
// We piggyback on the enemy entity for HP/render, and run a separate AI in updateBoss().

export type BossState = {
  kind: BossKind
  enemyId: number
  patternCooldowns: number[]      // one timer per pattern
  windupTimer: number              // active pattern windup
  pendingPattern: BossPattern | null
  windupOriginX: number
  windupOriginY: number
  windupTargetX: number
  windupTargetY: number
  // Charge state
  chargeTimer: number
  chargeVx: number
  chargeVy: number
}

export function createBossEnemy(world: World, kind: BossKind, x: number, y: number): Enemy {
  play('bossSpawn')
  const def = BOSSES[kind]
  // Light per-floor scaling on top of the per-boss tuning. Final floor boss
  // already huge; this adds 0/20/40/60% extra HP across floors.
  const f = world.floorIndex
  const hpMult = 1 + f * 0.35
  const dmgMult = 1 + f * 0.20
  const scaledHp = Math.round(def.hp * hpMult)
  const scaledDmg = Math.round(def.damage * dmgMult)
  const enemy: Enemy = {
    id: world.nextEntityId++,
    kind: 'tai_cheung' as Enemy['kind'],   // visual fallback; boss is drawn separately
    pos: { x, y },
    vel: { x: 0, y: 0 },
    hp: scaledHp,
    maxHp: scaledHp,
    damage: scaledDmg,
    speed: def.speed,
    radius: def.radius,
    attackCooldown: 0,
    freezeTimer: 0,
    burnTimer: 0,
    poisonTimer: 0,
    lightningTimer: 0,
    bleedTimer: 0,
    bleedStacks: 0,
    stunTimer: 0,
    thinkTimer: 0,
  }
  world.boss = {
    kind,
    enemyId: enemy.id,
    patternCooldowns: BOSSES[kind].attackPatterns.map((p) => p.cooldown * 0.5),
    windupTimer: 0,
    pendingPattern: null,
    windupOriginX: 0,
    windupOriginY: 0,
    windupTargetX: 0,
    windupTargetY: 0,
    chargeTimer: 0,
    chargeVx: 0,
    chargeVy: 0,
  }
  return enemy
}

export function updateBoss(world: World, dt: number) {
  if (!world.boss) return
  const state = world.boss
  const enemy = world.enemies.find((e) => e.id === state.enemyId)
  if (!enemy) {
    // boss died
    onBossDeath(world)
    world.boss = null
    return
  }

  const def = BOSSES[state.kind]
  const player = world.player

  // tick cooldowns
  for (let i = 0; i < state.patternCooldowns.length; i += 1) {
    state.patternCooldowns[i] = Math.max(0, state.patternCooldowns[i] - dt)
  }

  // resolve windup
  if (state.windupTimer > 0) {
    state.windupTimer -= dt
    if (state.windupTimer <= 0 && state.pendingPattern) {
      executePattern(world, def, enemy, state, state.pendingPattern)
      state.pendingPattern = null
    }
    // freeze movement during windup
    return
  }

  // resolve charge tail
  if (state.chargeTimer > 0) {
    state.chargeTimer -= dt
    let nx = enemy.pos.x + state.chargeVx * dt
    let ny = enemy.pos.y + state.chargeVy * dt
    nx = Math.max(enemy.radius, Math.min(world.arena.w - enemy.radius, nx))
    ny = Math.max(enemy.radius, Math.min(world.arena.h - enemy.radius, ny))
    const r = resolveCircleVsWalls(nx, ny, enemy.radius, world.walls)
    enemy.pos.x = r.x
    enemy.pos.y = r.y
    // touch damage during charge
    const d2 = (player.pos.x - enemy.pos.x) ** 2 + (player.pos.y - enemy.pos.y) ** 2
    const rr = (enemy.radius + 16) ** 2
    if (d2 <= rr) damagePlayer(world, def.damage * 1.5, enemy.pos.x, enemy.pos.y)
    return
  }

  // pick a ready pattern
  const readyIdx: number[] = []
  for (let i = 0; i < def.attackPatterns.length; i += 1) {
    if (state.patternCooldowns[i] <= 0) readyIdx.push(i)
  }
  if (readyIdx.length > 0) {
    const idx = readyIdx[Math.floor(Math.random() * readyIdx.length)]
    const pattern = def.attackPatterns[idx]
    state.patternCooldowns[idx] = pattern.cooldown
    if ('windup' in pattern && pattern.windup > 0) {
      state.windupTimer = pattern.windup
      state.pendingPattern = pattern
      state.windupOriginX = enemy.pos.x
      state.windupOriginY = enemy.pos.y
      state.windupTargetX = player.pos.x
      state.windupTargetY = player.pos.y
      // visual telegraph
      world.floats.push({
        pos: { x: enemy.pos.x, y: enemy.pos.y - enemy.radius - 12 },
        text: '!?',
        color: def.accent,
        age: 0,
        ttl: pattern.windup,
        vy: -10,
      })
      return
    }
    executePattern(world, def, enemy, state, pattern)
    return
  }

  // no pattern ready: drift toward player at slow speed
  const dx = player.pos.x - enemy.pos.x
  const dy = player.pos.y - enemy.pos.y
  const d = Math.max(0.001, Math.hypot(dx, dy))
  const ux = dx / d
  const uy = dy / d
  let nx = enemy.pos.x + ux * def.speed * dt
  let ny = enemy.pos.y + uy * def.speed * dt
  nx = Math.max(enemy.radius, Math.min(world.arena.w - enemy.radius, nx))
  ny = Math.max(enemy.radius, Math.min(world.arena.h - enemy.radius, ny))
  const r = resolveCircleVsWalls(nx, ny, enemy.radius, world.walls)
  enemy.pos.x = r.x
  enemy.pos.y = r.y

  // body-touch damage at slow drift
  if (enemy.attackCooldown <= 0) {
    const ed2 = (player.pos.x - enemy.pos.x) ** 2 + (player.pos.y - enemy.pos.y) ** 2
    const rr = (enemy.radius + 16) ** 2
    if (ed2 <= rr) {
      damagePlayer(world, def.damage, enemy.pos.x, enemy.pos.y)
      enemy.attackCooldown = 0.8
    }
  } else {
    enemy.attackCooldown -= dt
  }
}

function executePattern(world: World, def: BossDef, enemy: Enemy, state: BossState, pattern: BossPattern) {
  switch (pattern.kind) {
    case 'charge': {
      const target: Vec2 = { x: state.windupTargetX, y: state.windupTargetY }
      const dx = target.x - enemy.pos.x
      const dy = target.y - enemy.pos.y
      const d = Math.max(0.001, Math.hypot(dx, dy))
      state.chargeVx = (dx / d) * def.speed * pattern.speedMul
      state.chargeVy = (dy / d) * def.speed * pattern.speedMul
      state.chargeTimer = 0.55
      world.shake = Math.max(world.shake, 8)
      break
    }
    case 'dash': {
      const dx = world.player.pos.x - enemy.pos.x
      const dy = world.player.pos.y - enemy.pos.y
      const d = Math.max(0.001, Math.hypot(dx, dy))
      state.chargeVx = (dx / d) * def.speed * pattern.speedMul
      state.chargeVy = (dy / d) * def.speed * pattern.speedMul
      state.chargeTimer = 0.32
      break
    }
    case 'fanShot': {
      const dx = world.player.pos.x - enemy.pos.x
      const dy = world.player.pos.y - enemy.pos.y
      const baseAng = Math.atan2(dy, dx)
      for (let i = 0; i < pattern.bullets; i += 1) {
        const t = pattern.bullets === 1 ? 0 : (i / (pattern.bullets - 1)) - 0.5
        const ang = baseAng + t * pattern.spread
        const proj: Projectile = {
          id: world.nextEntityId++,
          pos: { x: enemy.pos.x, y: enemy.pos.y },
          vel: { x: Math.cos(ang) * pattern.speed, y: Math.sin(ang) * pattern.speed },
          damage: pattern.damage,
          lifetime: 2.0,
          pierceLeft: 0,
          bounceLeft: 0,
          isCrit: false,
          hitSet: new Set<number>(),
          fromPlayer: false,
        }
        world.projectiles.push(proj)
      }
      break
    }
    case 'aoeRing': {
      const r2 = pattern.radius * pattern.radius
      const dx = world.player.pos.x - enemy.pos.x
      const dy = world.player.pos.y - enemy.pos.y
      if (dx * dx + dy * dy <= r2) {
        damagePlayer(world, pattern.damage, enemy.pos.x, enemy.pos.y)
      }
      // big particle ring
      for (let i = 0; i < 36; i += 1) {
        const a = (i / 36) * Math.PI * 2
        const sp = pattern.radius * 1.4
        world.particles.push({
          pos: { x: enemy.pos.x, y: enemy.pos.y },
          vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp },
          age: 0,
          ttl: 0.6,
          color: def.accent,
          size: 3,
        })
      }
      world.shake = Math.max(world.shake, 14)
      break
    }
    case 'summon': {
      const arch = ENEMIES.maa_zai
      for (let i = 0; i < pattern.count; i += 1) {
        const ang = Math.random() * Math.PI * 2
        const dist = 60 + Math.random() * 40
        const x = enemy.pos.x + Math.cos(ang) * dist
        const y = enemy.pos.y + Math.sin(ang) * dist
        world.enemies.push({
          id: world.nextEntityId++,
          kind: 'maa_zai',
          pos: { x, y },
          vel: { x: 0, y: 0 },
          hp: arch.hp,
          maxHp: arch.hp,
          damage: arch.damage,
          speed: arch.speed,
          radius: arch.radius,
          attackCooldown: 0.3,
          freezeTimer: 0,
          burnTimer: 0,
          poisonTimer: 0,
          lightningTimer: 0,
          bleedTimer: 0,
          bleedStacks: 0,
          stunTimer: 0,
          thinkTimer: Math.random(),
        })
      }
      world.floats.push({
        pos: { x: enemy.pos.x, y: enemy.pos.y - enemy.radius - 14 },
        text: '叫人嚟撐!',
        color: def.accent,
        age: 0,
        ttl: 0.9,
        vy: -28,
      })
      break
    }
    case 'elementBurst': {
      // ring of element-tagged projectiles
      const count = 12
      for (let i = 0; i < count; i += 1) {
        const ang = (i / count) * Math.PI * 2
        const proj: Projectile = {
          id: world.nextEntityId++,
          pos: { x: enemy.pos.x, y: enemy.pos.y },
          vel: { x: Math.cos(ang) * 280, y: Math.sin(ang) * 280 },
          damage: pattern.damage,
          lifetime: 1.6,
          pierceLeft: 0,
          bounceLeft: 0,
          isCrit: false,
          hitSet: new Set<number>(),
          fromPlayer: false,
        }
        world.projectiles.push(proj)
      }
      world.shake = Math.max(world.shake, 10)
      break
    }
  }
}

function onBossDeath(world: World) {
  play('bossDeath')
  // big explosion + lots of rep
  const last = world.enemies.length // not used; visual only
  void last
  world.reputation += 25
  world.coins += 25
  for (let i = 0; i < 60; i += 1) {
    const ang = Math.random() * Math.PI * 2
    const sp = 100 + Math.random() * 320
    world.particles.push({
      pos: { x: world.arena.w / 2, y: world.arena.h / 2 },
      vel: { x: Math.cos(ang) * sp, y: Math.sin(ang) * sp },
      age: 0,
      ttl: 0.8 + Math.random() * 0.4,
      color: Math.random() < 0.5 ? '#ffd16a' : '#ff4fd8',
      size: 3 + Math.random() * 3,
    })
  }
  world.floats.push({
    pos: { x: world.arena.w / 2, y: world.arena.h / 2 - 20 },
    text: '收咧!',
    color: '#ffd16a',
    age: 0,
    ttl: 1.4,
    vy: -38,
  })
  world.shake = Math.max(world.shake, 26)
  world.hitStop = Math.max(world.hitStop, 0.18)
}

// Damage from boss-fired projectiles on player.
export function applyBossProjectileToPlayer(world: World, p: Projectile) {
  const player = world.player
  const dx = player.pos.x - p.pos.x
  const dy = player.pos.y - p.pos.y
  const r = 16 + 6
  if (dx * dx + dy * dy <= r * r) {
    damagePlayer(world, p.damage, p.pos.x, p.pos.y)
    return true
  }
  return false
}
