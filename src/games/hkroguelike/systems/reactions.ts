import type { Enemy } from '../types'
import type { World } from '../core/World'
import { play } from '../core/Audio'

// === 元素 reaction matrix ===
// 元素：冰 freeze / 火 burn / 毒 poison / 電 lightning / 流血 bleed
//
// 兩兩組合：
//   冰 + 火  = 爆炸    BOOM!  AoE 40 dmg, 清除兩個 debuff
//   火 + 毒  = 劇毒散播 spreads poison to ≤2 nearby enemies
//   冰 + 毒  = 寒毒    凍結延長 + 毒 tick 加快
//   火 + 電  = 過載    big BOOM 70 dmg AoE
//   冰 + 電  = 麻痺    長 stun 2 秒
//   毒 + 電  = 化學煙  附近 DoT 雲 (簡化為瞬時 AoE 25 dmg)
//   流血 + 火/冰/毒/電 = 加倍流血層數 + 視覺血濺
//
// 設計原則：消耗一個 debuff 觸發即 reset；避免無限 chain。

const SMALL_BOOM_RADIUS = 80
const SMALL_BOOM_DAMAGE = 40

const BIG_BOOM_RADIUS = 110
const BIG_BOOM_DAMAGE = 70

const SMOKE_RADIUS = 90
const SMOKE_DAMAGE = 25

const POISON_SPREAD_RANGE = 130
const POISON_SPREAD_TARGETS = 2

export function checkAndApplyReactions(world: World, enemy: Enemy) {
  // 流血 amplifier — 任何其他元素同 bleed 共存就 +1 stack
  if (enemy.bleedTimer > 0 && (enemy.burnTimer > 0 || enemy.freezeTimer > 0 || enemy.poisonTimer > 0 || enemy.lightningTimer > 0)) {
    enemy.bleedStacks = Math.min(5, enemy.bleedStacks + 1)
    enemy.bleedTimer = Math.max(enemy.bleedTimer, 4.0)
    spawnFloat(world, enemy.pos.x, enemy.pos.y - 14, '見血!', '#ff2050')
    burst(world, enemy, 6, '#ff2050')
    // 唔 return — 流血唔消耗其他元素，可繼續 trigger 主反應
  }

  // 冰 + 火 = BOOM
  if (enemy.freezeTimer > 0 && enemy.burnTimer > 0) {
    triggerBoom(world, enemy, SMALL_BOOM_RADIUS, SMALL_BOOM_DAMAGE, 'BOOM！', '#ff8a3a')
    enemy.freezeTimer = 0
    enemy.burnTimer = 0
    return 'explode'
  }

  // 火 + 電 = 過載 (big BOOM)
  if (enemy.burnTimer > 0 && enemy.lightningTimer > 0) {
    triggerBoom(world, enemy, BIG_BOOM_RADIUS, BIG_BOOM_DAMAGE, '過載！', '#fff066')
    enemy.burnTimer = 0
    enemy.lightningTimer = 0
    return 'overload'
  }

  // 冰 + 電 = 麻痺 (long stun)
  if (enemy.freezeTimer > 0 && enemy.lightningTimer > 0) {
    enemy.stunTimer = Math.max(enemy.stunTimer, 2.0)
    enemy.freezeTimer = 0
    enemy.lightningTimer = 0
    spawnFloat(world, enemy.pos.x, enemy.pos.y - 14, '麻痺!', '#aee7ff')
    burst(world, enemy, 12, '#aee7ff')
    return 'paralyze'
  }

  // 毒 + 電 = 化學煙 (AoE poison damage)
  if (enemy.poisonTimer > 0 && enemy.lightningTimer > 0) {
    triggerSmoke(world, enemy, SMOKE_RADIUS, SMOKE_DAMAGE)
    enemy.poisonTimer = 0
    enemy.lightningTimer = 0
    return 'smoke'
  }

  // 火 + 毒 = 劇毒散播
  if (enemy.burnTimer > 0 && enemy.poisonTimer > 0) {
    spreadPoison(world, enemy)
    enemy.burnTimer = 0
    spawnFloat(world, enemy.pos.x, enemy.pos.y - 14, '劇毒!', '#a3ff66')
    return 'venom'
  }

  // 冰 + 毒 = 寒毒
  if (enemy.freezeTimer > 0 && enemy.poisonTimer > 0) {
    enemy.freezeTimer = Math.max(enemy.freezeTimer, 2.0)
    enemy.poisonTimer = Math.max(enemy.poisonTimer, 4.0)
    spawnFloat(world, enemy.pos.x, enemy.pos.y - 14, '寒毒!', '#aee7ff')
    burst(world, enemy, 8, '#a3ff66')
    return 'frostbite'
  }

  return null
}

function triggerBoom(world: World, source: Enemy, radius: number, damage: number, label: string, color: string) {
  play('explode')
  spawnFloat(world, source.pos.x, source.pos.y - 14, label, color)
  world.shake = Math.max(world.shake, radius >= BIG_BOOM_RADIUS ? 22 : 16)
  world.hitStop = Math.max(world.hitStop, radius >= BIG_BOOM_RADIUS ? 0.08 : 0.06)

  // particles
  const ringCount = radius >= BIG_BOOM_RADIUS ? 48 : 32
  for (let i = 0; i < ringCount; i += 1) {
    const ang = Math.random() * Math.PI * 2
    const sp = 140 + Math.random() * 360
    world.particles.push({
      pos: { x: source.pos.x, y: source.pos.y },
      vel: { x: Math.cos(ang) * sp, y: Math.sin(ang) * sp },
      age: 0,
      ttl: 0.5 + Math.random() * 0.5,
      color: Math.random() < 0.5 ? color : '#ffffff',
      size: 3 + Math.random() * 3,
    })
  }

  // damage every nearby enemy (other than source)
  for (const e of world.enemies) {
    if (e.id === source.id) continue
    const dx = e.pos.x - source.pos.x
    const dy = e.pos.y - source.pos.y
    if (dx * dx + dy * dy <= radius * radius) {
      e.hp -= damage
      world.floats.push({ pos: { x: e.pos.x, y: e.pos.y }, text: `-${damage}`, color, age: 0, ttl: 0.55, vy: -34 })
    }
  }
}

function triggerSmoke(world: World, source: Enemy, radius: number, damage: number) {
  spawnFloat(world, source.pos.x, source.pos.y - 14, '化學煙!', '#a3ff66')
  burst(world, source, 28, '#a3ff66')
  for (const e of world.enemies) {
    if (e.id === source.id) continue
    const dx = e.pos.x - source.pos.x
    const dy = e.pos.y - source.pos.y
    if (dx * dx + dy * dy <= radius * radius) {
      e.hp -= damage
      e.poisonTimer = Math.max(e.poisonTimer, 2.5)  // smoke lingers
      world.floats.push({ pos: { x: e.pos.x, y: e.pos.y }, text: `-${damage}`, color: '#a3ff66', age: 0, ttl: 0.55, vy: -34 })
    }
  }
}

function spreadPoison(world: World, source: Enemy) {
  burst(world, source, 14, '#a3ff66')
  let spread = 0
  for (const e of world.enemies) {
    if (spread >= POISON_SPREAD_TARGETS) break
    if (e.id === source.id) continue
    const dx = e.pos.x - source.pos.x
    const dy = e.pos.y - source.pos.y
    if (dx * dx + dy * dy <= POISON_SPREAD_RANGE * POISON_SPREAD_RANGE) {
      e.poisonTimer = Math.max(e.poisonTimer, 3.0)
      spread += 1
    }
  }
}

function burst(world: World, source: Enemy, count: number, color: string) {
  for (let i = 0; i < count; i += 1) {
    const ang = Math.random() * Math.PI * 2
    const sp = 70 + Math.random() * 200
    world.particles.push({
      pos: { x: source.pos.x, y: source.pos.y },
      vel: { x: Math.cos(ang) * sp, y: Math.sin(ang) * sp },
      age: 0,
      ttl: 0.35 + Math.random() * 0.25,
      color,
      size: 2 + Math.random() * 2,
    })
  }
}

function spawnFloat(world: World, x: number, y: number, text: string, color: string) {
  world.floats.push({ pos: { x, y }, text, color, age: 0, ttl: 0.7, vy: -34 })
}

// Used by combat.ts when player has lightning skill: chain damage to ≤2 nearby enemies on hit.
const LIGHTNING_CHAIN_RANGE = 160
const LIGHTNING_CHAIN_DAMAGE_RATIO = 0.5
const LIGHTNING_CHAIN_TARGETS = 2

export function applyLightningChain(world: World, source: Enemy, baseDamage: number) {
  let chained = 0
  for (const e of world.enemies) {
    if (chained >= LIGHTNING_CHAIN_TARGETS) break
    if (e.id === source.id) continue
    const dx = e.pos.x - source.pos.x
    const dy = e.pos.y - source.pos.y
    if (dx * dx + dy * dy <= LIGHTNING_CHAIN_RANGE * LIGHTNING_CHAIN_RANGE) {
      const dmg = baseDamage * LIGHTNING_CHAIN_DAMAGE_RATIO
      e.hp -= dmg
      e.lightningTimer = Math.max(e.lightningTimer, 0.35)
      world.floats.push({ pos: { x: e.pos.x, y: e.pos.y }, text: `⚡${Math.round(dmg)}`, color: '#fff066', age: 0, ttl: 0.5, vy: -34 })
      // arc particles
      burst(world, e, 6, '#fff066')
      chained += 1
    }
  }
}
