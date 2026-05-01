import { PLAYER_INVULN_AFTER_HIT, PLAYER_RADIUS, PLAYER_STILL_BEFORE_FIRE } from '../constants'
import type { Enemy, Player } from '../types'
import type { World } from '../core/World'
import { fireKnives, nearestEnemyInRange } from '../systems/combat'
import { resolveCircleVsWalls } from '../systems/walls'
import { play } from '../core/Audio'

// Player update: WASD-equivalent axes drive velocity; auto-fire on standstill (Archero rule).
export function updatePlayer(world: World, dt: number, axes: { x: number; y: number }) {
  const p = world.player
  p.vel.x = axes.x * p.stats.speed
  p.vel.y = axes.y * p.stats.speed

  let nx = p.pos.x + p.vel.x * dt
  let ny = p.pos.y + p.vel.y * dt
  nx = Math.max(PLAYER_RADIUS, Math.min(world.arena.w - PLAYER_RADIUS, nx))
  ny = Math.max(PLAYER_RADIUS, Math.min(world.arena.h - PLAYER_RADIUS, ny))
  const resolved = resolveCircleVsWalls(nx, ny, PLAYER_RADIUS, world.walls)
  p.pos.x = resolved.x
  p.pos.y = resolved.y

  const moving = Math.hypot(p.vel.x, p.vel.y) > 1
  if (moving) {
    p.stillTime = 0
    p.facing = Math.atan2(p.vel.y, p.vel.x)
  } else {
    p.stillTime += dt
  }

  if (p.invulnTimer > 0) p.invulnTimer = Math.max(0, p.invulnTimer - dt)
  if (p.fireCooldown > 0) p.fireCooldown = Math.max(0, p.fireCooldown - dt)

  if (!moving && p.stillTime >= PLAYER_STILL_BEFORE_FIRE && p.fireCooldown <= 0) {
    const target = nearestEnemyInRange(p, world.enemies, p.stats.range)
    if (target) {
      tryAutoFire(world, p, target)
    }
  }
}

function tryAutoFire(world: World, p: Player, target: Enemy) {
  p.facing = Math.atan2(target.pos.y - p.pos.y, target.pos.x - p.pos.x)
  fireKnives(world, p)
  p.fireCooldown = 1 / Math.max(0.1, p.stats.attackRate)
}

export function rageMultiplier(p: Player) {
  if (p.stats.rageMultMax <= 0) return 1
  const ratio = p.stats.maxHp > 0 ? p.stats.hp / p.stats.maxHp : 1
  return 1 + p.stats.rageMultMax * (1 - ratio)
}

export function damagePlayer(world: World, amount: number, fromX: number, fromY: number) {
  const p = world.player
  if (p.invulnTimer > 0) return

  if (p.shieldStacks > 0) {
    play('shield')
    p.shieldStacks -= 1
    p.invulnTimer = PLAYER_INVULN_AFTER_HIT
    spawnFloat(world, p.pos.x, p.pos.y - 24, '擋!', '#36d6ff')
    world.shake = Math.max(world.shake, 6)
    return
  }

  play('playerHurt')
  p.stats.hp = Math.max(0, p.stats.hp - amount)
  p.invulnTimer = PLAYER_INVULN_AFTER_HIT
  world.shake = Math.max(world.shake, 10)
  world.hitStop = Math.max(world.hitStop, 0.04)

  for (let i = 0; i < 8; i += 1) {
    const ang = Math.random() * Math.PI * 2
    const sp = 60 + Math.random() * 120
    world.particles.push({
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: Math.cos(ang) * sp, y: Math.sin(ang) * sp },
      age: 0,
      ttl: 0.35 + Math.random() * 0.25,
      color: '#ff2050',
      size: 2 + Math.random() * 2,
    })
  }
  spawnFloat(world, p.pos.x, p.pos.y - 18, `-${Math.round(amount)}`, '#ff5577')

  if (p.stats.hp <= 0) {
    world.scene = 'gameOver'
  }
  void fromX; void fromY
}

function spawnFloat(world: World, x: number, y: number, text: string, color: string) {
  world.floats.push({
    pos: { x, y },
    text,
    color,
    age: 0,
    ttl: 0.8,
    vy: -34,
  })
}
