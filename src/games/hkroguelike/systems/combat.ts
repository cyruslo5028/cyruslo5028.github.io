import { KNIFE_LIFETIME, KNIFE_SPEED } from '../constants'
import { rageMultiplier } from '../entities/Player'
import type { Enemy, Player, Projectile } from '../types'
import type { World } from '../core/World'
import { applyLightningChain, checkAndApplyReactions } from './reactions'
import { play } from '../core/Audio'

export function nearestEnemyInRange(p: Player, enemies: Enemy[], range: number): Enemy | null {
  const r2 = range * range
  let best: Enemy | null = null
  let bestSq = r2
  for (const e of enemies) {
    const dx = e.pos.x - p.pos.x
    const dy = e.pos.y - p.pos.y
    const sq = dx * dx + dy * dy
    if (sq < bestSq) {
      bestSq = sq
      best = e
    }
  }
  return best
}

// Spawn one volley of knives respecting all stat modifiers.
export function fireKnives(world: World, p: Player) {
  const baseAng = p.facing
  const damage = p.stats.damage * rageMultiplier(p)

  const angles: number[] = []

  // forward "fan" — projectileCount knives spread in a small arc
  const count = Math.max(1, p.stats.projectileCount)
  const spread = count > 1 ? (count - 1) * 0.12 : 0  // ~7° per extra knife
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0 : (i / (count - 1)) - 0.5
    angles.push(baseAng + t * spread)
  }

  // 孖 shot: each level adds another pair offset by ±90°
  for (let i = 1; i <= p.stats.sideShotCount; i += 1) {
    angles.push(baseAng + Math.PI / 2)
    angles.push(baseAng - Math.PI / 2)
  }

  // 四面埋伏: 4 corners
  if (p.stats.diagonalShot) {
    angles.push(baseAng + Math.PI / 4)
    angles.push(baseAng - Math.PI / 4)
    angles.push(baseAng + (3 * Math.PI) / 4)
    angles.push(baseAng - (3 * Math.PI) / 4)
  }

  play('shoot')
  for (const a of angles) {
    const id = world.nextEntityId++
    const proj: Projectile = {
      id,
      pos: { x: p.pos.x, y: p.pos.y },
      vel: { x: Math.cos(a) * KNIFE_SPEED, y: Math.sin(a) * KNIFE_SPEED },
      damage,
      lifetime: KNIFE_LIFETIME,
      pierceLeft: p.stats.pierceCount,
      bounceLeft: p.stats.bounceCount,
      isCrit: Math.random() < p.stats.critChance,
      hitSet: new Set<number>(),
      fromPlayer: true,
    }
    world.projectiles.push(proj)
  }
}

// Apply damage from a knife to an enemy, including crits, status rolls, juice (numbers + comic crit text).
export function applyDamageToEnemy(world: World, enemy: Enemy, proj: Projectile) {
  const p = world.player
  let dmg = proj.damage
  if (proj.isCrit) dmg *= p.stats.critMult

  enemy.hp -= dmg

  // status rolls
  if (p.stats.freezeChance > 0 && Math.random() < p.stats.freezeChance) {
    enemy.freezeTimer = Math.max(enemy.freezeTimer, 1.0)
  }
  if (p.stats.fireChance > 0 && Math.random() < p.stats.fireChance) {
    enemy.burnTimer = Math.max(enemy.burnTimer, 2.5)
  }
  if (p.stats.poisonChance > 0 && Math.random() < p.stats.poisonChance) {
    enemy.poisonTimer = Math.max(enemy.poisonTimer, 3.0)
  }
  if (p.stats.lightningChance > 0 && Math.random() < p.stats.lightningChance) {
    enemy.lightningTimer = Math.max(enemy.lightningTimer, 0.35)
    applyLightningChain(world, enemy, dmg)
  }
  if (p.stats.bleedChance > 0 && Math.random() < p.stats.bleedChance) {
    enemy.bleedTimer = Math.max(enemy.bleedTimer, 4.0)
    enemy.bleedStacks = Math.min(5, enemy.bleedStacks + 1)
  }

  // 元素 reaction matrix（冰+火、火+電、冰+電、毒+電、火+毒、冰+毒、流血 amplify）
  checkAndApplyReactions(world, enemy)

  // floating damage number (大字 on crit)
  if (proj.isCrit) play('crit'); else play('hit')
  if (proj.isCrit) {
    world.floats.push({
      pos: { x: enemy.pos.x, y: enemy.pos.y - 10 },
      text: '劈！',
      color: '#ffd16a',
      age: 0,
      ttl: 0.7,
      vy: -56,
    })
    world.floats.push({
      pos: { x: enemy.pos.x + 6, y: enemy.pos.y + 10 },
      text: `-${Math.round(dmg)}`,
      color: '#ffd16a',
      age: 0,
      ttl: 0.55,
      vy: -34,
    })
    world.shake = Math.max(world.shake, 8)
    world.hitStop = Math.max(world.hitStop, 0.05)
  } else {
    world.floats.push({
      pos: { x: enemy.pos.x, y: enemy.pos.y },
      text: `${Math.round(dmg)}`,
      color: '#ffffff',
      age: 0,
      ttl: 0.45,
      vy: -34,
    })
  }

  // hit spark particles
  for (let i = 0; i < 5; i += 1) {
    const ang = Math.random() * Math.PI * 2
    const sp = 60 + Math.random() * 140
    world.particles.push({
      pos: { x: enemy.pos.x, y: enemy.pos.y },
      vel: { x: Math.cos(ang) * sp, y: Math.sin(ang) * sp },
      age: 0,
      ttl: 0.25 + Math.random() * 0.15,
      color: proj.isCrit ? '#ffe070' : '#ff3060',
      size: 2 + Math.random() * 2,
    })
  }
}
