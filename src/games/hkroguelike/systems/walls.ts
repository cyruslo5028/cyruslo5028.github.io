import { ARENA_HEIGHT, ARENA_WIDTH, ROOM_PADDING } from '../constants'
import type { RoomKind, Wall } from '../types'

// Generate cover/wall layouts per room kind. Each layout returns a list of axis-aligned rectangles.
// Rectangles are world-space (same coord system as entities).
export function generateRoomWalls(kind: RoomKind, seed: number, floorIdx: number): Wall[] {
  const rng = mulberry32(seed)
  const walls: Wall[] = []

  switch (kind) {
    case 'combat': {
      // 3-5 cover blocks scattered, avoiding the center spawn zone
      const count = 3 + Math.floor(rng() * 3) + (floorIdx >= 2 ? 1 : 0)
      const placed: Wall[] = []
      let attempts = 0
      while (placed.length < count && attempts < 60) {
        attempts += 1
        const w = 60 + rng() * 80
        const h = 36 + rng() * 60
        const x = ROOM_PADDING + 80 + rng() * (ARENA_WIDTH - 2 * ROOM_PADDING - 160 - w)
        const y = ROOM_PADDING + 80 + rng() * (ARENA_HEIGHT - 2 * ROOM_PADDING - 160 - h)
        // keep center clear (player spawn)
        const cx = ARENA_WIDTH / 2
        const cy = ARENA_HEIGHT / 2
        const dx = Math.max(x, Math.min(cx, x + w)) - cx
        const dy = Math.max(y, Math.min(cy, y + h)) - cy
        if (dx * dx + dy * dy < 90 * 90) continue
        const cand: Wall = { x, y, w, h }
        if (placed.some((p) => overlap(cand, p, 12))) continue
        placed.push(cand)
      }
      walls.push(...placed)
      break
    }
    case 'shrine': {
      // 4 pillars near corners
      const margin = 120
      const size = 44
      walls.push(
        { x: margin, y: margin, w: size, h: size },
        { x: ARENA_WIDTH - margin - size, y: margin, w: size, h: size },
        { x: margin, y: ARENA_HEIGHT - margin - size, w: size, h: size },
        { x: ARENA_WIDTH - margin - size, y: ARENA_HEIGHT - margin - size, w: size, h: size },
      )
      break
    }
    case 'shop': {
      // shop counter — break into 3 chunks so each wall sprite renders square.
      walls.push({ x: 280, y: 140, w: 96, h: 80 })
      walls.push({ x: 432, y: 140, w: 96, h: 80 })
      walls.push({ x: 584, y: 140, w: 96, h: 80 })
      break
    }
    case 'rest': {
      // central rest spot — use a square-ish footprint so the wall sprite
      // (mahjong table / vending machine / etc) renders without being squashed.
      walls.push({ x: ARENA_WIDTH / 2 - 50, y: ARENA_HEIGHT / 2 - 40, w: 100, h: 80 })
      break
    }
    case 'treasure': {
      // a chest-block in middle (just decorative since cleared on entry)
      walls.push({ x: ARENA_WIDTH / 2 - 28, y: ARENA_HEIGHT / 2 - 22, w: 56, h: 44 })
      break
    }
    case 'boss': {
      // open arena, just two corner pillars to block runaway corners
      walls.push(
        { x: 80, y: 80, w: 36, h: 36 },
        { x: ARENA_WIDTH - 80 - 36, y: 80, w: 36, h: 36 },
        { x: 80, y: ARENA_HEIGHT - 80 - 36, w: 36, h: 36 },
        { x: ARENA_WIDTH - 80 - 36, y: ARENA_HEIGHT - 80 - 36, w: 36, h: 36 },
      )
      break
    }
  }

  return walls
}

function overlap(a: Wall, b: Wall, pad: number) {
  return !(
    a.x + a.w + pad < b.x ||
    b.x + b.w + pad < a.x ||
    a.y + a.h + pad < b.y ||
    b.y + b.h + pad < a.y
  )
}

function mulberry32(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Circle-vs-AABB collision: push a circle out of a rect along the shallowest axis.
// Returns the resolved position. If no overlap, returns the input position unchanged.
export function resolveCircleVsWalls(px: number, py: number, r: number, walls: Wall[]) {
  let x = px
  let y = py
  for (const w of walls) {
    const cx = clamp(x, w.x, w.x + w.w)
    const cy = clamp(y, w.y, w.y + w.h)
    const dx = x - cx
    const dy = y - cy
    const d2 = dx * dx + dy * dy
    if (d2 < r * r) {
      const d = Math.max(0.0001, Math.sqrt(d2))
      x = cx + (dx / d) * r
      y = cy + (dy / d) * r
    }
  }
  return { x, y }
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

// Return surface normal if the circle just collided with a wall in the given motion direction,
// else null. Used for projectile bounces.
export function projectileCollideWall(px: number, py: number, r: number, walls: Wall[]): { nx: number; ny: number; ix: number; iy: number } | null {
  for (const w of walls) {
    const cx = clamp(px, w.x, w.x + w.w)
    const cy = clamp(py, w.y, w.y + w.h)
    const dx = px - cx
    const dy = py - cy
    const d2 = dx * dx + dy * dy
    if (d2 < r * r) {
      const d = Math.max(0.0001, Math.sqrt(d2))
      const nx = dx / d
      const ny = dy / d
      const ix = cx + nx * r
      const iy = cy + ny * r
      return { nx, ny, ix, iy }
    }
  }
  return null
}
