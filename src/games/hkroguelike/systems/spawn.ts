import { ENEMIES } from '../content/enemies'
import { FLOORS, FLOOR_ORDER } from '../content/biomes'
import type { Enemy, EnemyKind, Room, RoomKind } from '../types'
import type { World } from '../core/World'
import { generateRoomWalls } from './walls'

export function buildRoom(world: World, floorIdx: number, roomIdx: number): Room {
  const floor = FLOORS[FLOOR_ORDER[floorIdx]]
  const isBoss = roomIdx >= 14
  const isShop = !isBoss && roomIdx === 7
  const isRest = !isBoss && roomIdx === 12
  const isShrine = !isBoss && roomIdx === 4
  const isTreasure = !isBoss && roomIdx === 10

  const kind: RoomKind = isBoss
    ? 'boss'
    : isShop ? 'shop'
    : isRest ? 'rest'
    : isShrine ? 'shrine'
    : isTreasure ? 'treasure'
    : 'combat'

  const seed = (world.rngSeed ^ ((floorIdx + 1) * 7919) ^ ((roomIdx + 1) * 104729)) >>> 0
  const walls = generateRoomWalls(kind, seed, floorIdx)

  const spawnGroups: EnemyKind[][] = []
  if (kind === 'combat') {
    const baseCount = 5 + Math.floor(roomIdx * 0.4) + floorIdx * 2
    const waves = roomIdx % 3 === 0 ? 2 : (roomIdx >= 8 ? 2 : 1)
    for (let w = 0; w < waves; w += 1) {
      const wave: EnemyKind[] = []
      for (let i = 0; i < baseCount; i += 1) {
        const pool = floor.enemyPool
        wave.push(pool[Math.floor(Math.random() * pool.length)])
      }
      spawnGroups.push(wave)
    }
  } else if (kind === 'boss') {
    // boss spawn handled separately by spawnBoss in index.tsx
    spawnGroups.push([])
  }

  const room: Room = {
    index: roomIdx,
    floor: floorIdx,
    kind,
    walls,
    spawnGroups,
    // All rooms start uncleared. Non-combat rooms have no spawn groups so the
    // update loop immediately marks them cleared and presents a skill pick,
    // advancing the player. Specific reward semantics (heal/free pick/etc.)
    // are applied in index.tsx enterRoom based on room.kind.
    cleared: false,
  }
  if (kind === 'treasure') {
    room.treasureBox = {
      pos: { x: world.arena.w / 2, y: world.arena.h / 2 },
      opened: false,
      radius: 26,
    }
  }
  return room
}

export function spawnWave(world: World, kinds: EnemyKind[]) {
  const margin = 80
  // Difficulty scaling: each floor adds a big chunk, each room adds a little.
  // By the end of run (floor 3, room 14), enemies are ~4× HP / 2× damage of baseline.
  const f = world.floorIndex
  const r = world.roomIndex
  const hpMult = 1 + f * 0.65 + r * 0.06
  const dmgMult = 1 + f * 0.40 + r * 0.03
  const spdMult = 1 + f * 0.12 + r * 0.012
  for (const kind of kinds) {
    const arch = ENEMIES[kind] ?? ENEMIES.maa_zai
    const side = Math.floor(Math.random() * 4)
    let x = 0, y = 0
    switch (side) {
      case 0: x = margin + Math.random() * (world.arena.w - 2 * margin); y = margin; break
      case 1: x = world.arena.w - margin; y = margin + Math.random() * (world.arena.h - 2 * margin); break
      case 2: x = margin + Math.random() * (world.arena.w - 2 * margin); y = world.arena.h - margin; break
      default: x = margin; y = margin + Math.random() * (world.arena.h - 2 * margin)
    }

    const scaledHp = Math.round(arch.hp * hpMult)
    const scaledDmg = Math.round(arch.damage * dmgMult)
    const scaledSpd = arch.speed * spdMult
    const enemy: Enemy = {
      id: world.nextEntityId++,
      kind,
      pos: { x, y },
      vel: { x: 0, y: 0 },
      hp: scaledHp,
      maxHp: scaledHp,
      damage: scaledDmg,
      speed: scaledSpd,
      radius: arch.radius,
      attackCooldown: 0,
      freezeTimer: 0,
      burnTimer: 0,
      poisonTimer: 0,
      lightningTimer: 0,
      bleedTimer: 0,
      bleedStacks: 0,
      stunTimer: 0,
      thinkTimer: Math.random(),
    }
    world.enemies.push(enemy)
  }
}
