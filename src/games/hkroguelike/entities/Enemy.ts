import type { Enemy, Projectile } from '../types'
import type { World } from '../core/World'
import { ENEMIES } from '../content/enemies'
import { damagePlayer } from './Player'
import { resolveCircleVsWalls } from '../systems/walls'
import { play } from '../core/Audio'

const TOUCH_DAMAGE_COOLDOWN = 0.7

export function updateEnemies(world: World, dt: number) {
  const player = world.player
  const list = world.enemies
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const e = list[i]

    if (e.freezeTimer > 0) {
      e.freezeTimer -= dt
    } else if (e.stunTimer > 0) {
      e.stunTimer -= dt
    } else {
      runEnemyAi(world, e, dt)
    }
    if (e.burnTimer > 0) {
      e.hp -= 6 * dt
      e.burnTimer -= dt
    }
    if (e.poisonTimer > 0) {
      e.hp -= 4 * dt
      e.poisonTimer -= dt
    }
    if (e.lightningTimer > 0) {
      e.lightningTimer -= dt
    }
    if (e.bleedTimer > 0) {
      e.hp -= 2 * Math.max(1, e.bleedStacks) * dt
      e.bleedTimer -= dt
      if (e.bleedTimer <= 0) e.bleedStacks = 0
    }

    if (e.hp <= 0) {
      onEnemyDeath(world, e)
      list.splice(i, 1)
      continue
    }

    const dx = player.pos.x - e.pos.x
    const dy = player.pos.y - e.pos.y
    const r = e.radius + 16
    const sq = dx * dx + dy * dy
    if (sq <= r * r && e.attackCooldown <= 0) {
      damagePlayer(world, e.damage, e.pos.x, e.pos.y)
      e.attackCooldown = TOUCH_DAMAGE_COOLDOWN
    } else if (e.attackCooldown > 0) {
      e.attackCooldown -= dt
    }
  }
}

function runEnemyAi(world: World, e: Enemy, dt: number) {
  const player = world.player
  const dx = player.pos.x - e.pos.x
  const dy = player.pos.y - e.pos.y
  const dist = Math.max(0.001, Math.hypot(dx, dy))
  const ux = dx / dist
  const uy = dy / dist

  const arch = ENEMIES[e.kind]

  switch (arch.ai) {
    case 'chase':
    case 'rusher':
      e.vel.x = ux * e.speed
      e.vel.y = uy * e.speed
      break
    case 'kite': {
      const desired = 220
      const sign = dist < desired ? -1 : 1
      e.vel.x = ux * e.speed * sign
      e.vel.y = uy * e.speed * sign
      // Throwing knives: every ~1.6s lob a small projectile at the player.
      e.attackCooldown -= dt
      if (e.attackCooldown <= 0 && dist < 480) {
        e.attackCooldown = 1.6
        fireEnemyProjectile(world, e, ux, uy, 320, Math.max(4, Math.round(e.damage * 0.7)), 'knife')
      }
      break
    }
    case 'ranged': {
      const desired = 260
      const sign = dist < desired ? -1 : (dist > desired + 60 ? 1 : 0)
      e.vel.x = ux * e.speed * sign
      e.vel.y = uy * e.speed * sign
      // Cop pistol: stand at desired range, fire every ~1.1s.
      e.attackCooldown -= dt
      if (e.attackCooldown <= 0 && dist < 540) {
        e.attackCooldown = 1.1
        fireEnemyProjectile(world, e, ux, uy, 380, Math.max(6, Math.round(e.damage * 0.85)), 'bullet')
      }
      break
    }
    case 'patrol':
      e.thinkTimer -= dt
      if (e.thinkTimer <= 0) {
        const a = Math.random() * Math.PI * 2
        e.vel.x = Math.cos(a) * e.speed * 0.6
        e.vel.y = Math.sin(a) * e.speed * 0.6
        e.thinkTimer = 1.5 + Math.random()
      }
      break
  }

  let nx = e.pos.x + e.vel.x * dt
  let ny = e.pos.y + e.vel.y * dt
  nx = Math.max(e.radius, Math.min(world.arena.w - e.radius, nx))
  ny = Math.max(e.radius, Math.min(world.arena.h - e.radius, ny))
  const resolved = resolveCircleVsWalls(nx, ny, e.radius, world.walls)
  e.pos.x = resolved.x
  e.pos.y = resolved.y
}

function onEnemyDeath(world: World, e: Enemy) {
  play('enemyDeath')
  world.kills += 1
  const arch = ENEMIES[e.kind]
  world.coins += arch.reward
  world.reputation += arch.reward

  for (let i = 0; i < 14; i += 1) {
    const ang = Math.random() * Math.PI * 2
    const sp = 80 + Math.random() * 220
    const isNeon = Math.random() < 0.4
    world.particles.push({
      pos: { x: e.pos.x, y: e.pos.y },
      vel: { x: Math.cos(ang) * sp, y: Math.sin(ang) * sp },
      age: 0,
      ttl: 0.45 + Math.random() * 0.25,
      color: isNeon ? '#36d6ff' : '#ff3060',
      size: 2 + Math.random() * 3,
    })
  }

  const p = world.player
  if (p.stats.lifesteal > 0) {
    p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + p.stats.lifesteal)
  }
}

function fireEnemyProjectile(
  world: World,
  e: Enemy,
  ux: number,
  uy: number,
  speed: number,
  damage: number,
  flavor: 'knife' | 'bullet',
) {
  const offset = e.radius + 6
  world.projectiles.push({
    id: world.nextEntityId++,
    pos: { x: e.pos.x + ux * offset, y: e.pos.y + uy * offset },
    vel: { x: ux * speed, y: uy * speed },
    damage,
    lifetime: 2.4,
    pierceLeft: 0,
    bounceLeft: 0,
    isCrit: false,
    hitSet: new Set(),
    fromPlayer: false,
    enemyFlavor: flavor,
  } as Projectile & { enemyFlavor: 'knife' | 'bullet' })
}
