import { KNIFE_RADIUS } from '../constants'
import type { Enemy, Projectile } from '../types'
import type { World } from '../core/World'
import { applyDamageToEnemy } from '../systems/combat'
import { projectileCollideWall } from '../systems/walls'
import { damagePlayer } from './Player'

export function updateProjectiles(world: World, dt: number) {
  const arenaW = world.arena.w
  const arenaH = world.arena.h
  const list = world.projectiles
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const k = list[i]
    k.lifetime -= dt
    if (k.lifetime <= 0) { list.splice(i, 1); continue }

    k.pos.x += k.vel.x * dt
    k.pos.y += k.vel.y * dt

    // arena bounds bounce / despawn
    if (k.pos.x < KNIFE_RADIUS || k.pos.x > arenaW - KNIFE_RADIUS) {
      if (k.bounceLeft > 0) {
        k.vel.x = -k.vel.x
        k.pos.x = Math.max(KNIFE_RADIUS, Math.min(arenaW - KNIFE_RADIUS, k.pos.x))
        k.bounceLeft -= 1
      } else {
        list.splice(i, 1); continue
      }
    }
    if (k.pos.y < KNIFE_RADIUS || k.pos.y > arenaH - KNIFE_RADIUS) {
      if (k.bounceLeft > 0) {
        k.vel.y = -k.vel.y
        k.pos.y = Math.max(KNIFE_RADIUS, Math.min(arenaH - KNIFE_RADIUS, k.pos.y))
        k.bounceLeft -= 1
      } else {
        list.splice(i, 1); continue
      }
    }

    // wall bounce / absorb
    const hit = projectileCollideWall(k.pos.x, k.pos.y, KNIFE_RADIUS, world.walls)
    if (hit) {
      if (k.bounceLeft > 0) {
        // reflect velocity around normal
        const dot = k.vel.x * hit.nx + k.vel.y * hit.ny
        k.vel.x -= 2 * dot * hit.nx
        k.vel.y -= 2 * dot * hit.ny
        k.pos.x = hit.ix
        k.pos.y = hit.iy
        k.bounceLeft -= 1
      } else {
        list.splice(i, 1); continue
      }
    }

    if (k.fromPlayer) {
      const hitEnemy = pickFirstEnemyHit(k, world.enemies)
      if (hitEnemy) {
        applyDamageToEnemy(world, hitEnemy, k)
        k.hitSet.add(hitEnemy.id)
        if (k.pierceLeft > 0) {
          k.pierceLeft -= 1
        } else {
          list.splice(i, 1); continue
        }
      }
    } else {
      // enemy/boss projectile: hit player
      const player = world.player
      const dx = player.pos.x - k.pos.x
      const dy = player.pos.y - k.pos.y
      const r = 16 + KNIFE_RADIUS
      if (dx * dx + dy * dy <= r * r) {
        damagePlayer(world, k.damage, k.pos.x, k.pos.y)
        list.splice(i, 1); continue
      }
    }
  }
}

function pickFirstEnemyHit(k: Projectile, enemies: Enemy[]): Enemy | null {
  for (const e of enemies) {
    if (k.hitSet.has(e.id)) continue
    const r = e.radius + KNIFE_RADIUS
    const dx = e.pos.x - k.pos.x
    const dy = e.pos.y - k.pos.y
    if (dx * dx + dy * dy <= r * r) return e
  }
  return null
}
