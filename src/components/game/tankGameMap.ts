import {
  CELL_SIZE,
  GAME_HEIGHT,
  GAME_WIDTH,
  GRID_COLS,
  GRID_ROWS,
  PLAYER_SPAWN,
  type GameMap,
  type NeonSign,
  type Rect,
  type Vec2,
} from './tankGameModel'

const neonTexts = ['茶餐廳', '當鋪', '金舖', '藥房', '冰室', '麻雀館', '涼茶', '夜粥']
const neonColors = ['#22d3ee', '#a855f7', '#fb7185', '#fb923c', '#f472b6']

type RandomSource = () => number

type Cell = {
  col: number
  row: number
}

export function createGameMap(seed: number): GameMap {
  const random = mulberry32(seed)

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const walls = Array.from({ length: GRID_ROWS }, () => Array.from({ length: GRID_COLS }, () => false))

    for (let row = 0; row < GRID_ROWS; row += 1) {
      for (let col = 0; col < GRID_COLS; col += 1) {
        if (row === 0 || col === 0 || row === GRID_ROWS - 1 || col === GRID_COLS - 1) {
          walls[row][col] = true
        }
      }
    }

    stampCityBlocks(walls, random)
    stampMarketBarriers(walls, random)
    clearProtectedDistrict(walls)

    const spawnCells = collectSpawnCells(walls)
    if (spawnCells.length >= 18) {
      return {
        walls,
        spawnCells,
        signs: createNeonSigns(walls, random),
      }
    }
  }

  return createFallbackMap()
}

function stampCityBlocks(walls: boolean[][], random: RandomSource) {
  for (let row = 1; row < GRID_ROWS - 2; row += 3) {
    for (let col = 1; col < GRID_COLS - 2; col += 4) {
      if (random() < 0.18) {
        continue
      }

      const width = random() < 0.55 ? 2 : 3
      const height = random() < 0.45 ? 2 : 3
      const offsetCol = col + (random() < 0.5 ? 0 : 1)
      const offsetRow = row + (random() < 0.45 ? 0 : 1)
      fillCells(walls, offsetCol, offsetRow, width, height)
    }
  }
}

function stampMarketBarriers(walls: boolean[][], random: RandomSource) {
  const strips = 12

  for (let index = 0; index < strips; index += 1) {
    const horizontal = random() < 0.5
    const length = 2 + Math.floor(random() * 4)
    const startCol = 1 + Math.floor(random() * (GRID_COLS - (horizontal ? length + 2 : 3)))
    const startRow = 1 + Math.floor(random() * (GRID_ROWS - (horizontal ? 3 : length + 2)))

    if (isNearPlayerDistrict(startCol, startRow, length, horizontal)) {
      continue
    }

    for (let step = 0; step < length; step += 1) {
      const col = horizontal ? startCol + step : startCol
      const row = horizontal ? startRow : startRow + step
      walls[row][col] = true
    }
  }
}

function clearProtectedDistrict(walls: boolean[][]) {
  const center = worldToCell(PLAYER_SPAWN.x, PLAYER_SPAWN.y)

  for (let row = center.row - 1; row <= center.row + 1; row += 1) {
    for (let col = center.col - 1; col <= center.col + 1; col += 1) {
      if (row > 0 && row < GRID_ROWS - 1 && col > 0 && col < GRID_COLS - 1) {
        walls[row][col] = false
      }
    }
  }
}

function createFallbackMap(): GameMap {
  const walls = Array.from({ length: GRID_ROWS }, (_, row) =>
    Array.from({ length: GRID_COLS }, (_, col) => row === 0 || col === 0 || row === GRID_ROWS - 1 || col === GRID_COLS - 1),
  )

  fillCells(walls, 3, 2, 3, 3)
  fillCells(walls, 10, 2, 3, 3)
  fillCells(walls, 15, 3, 2, 4)
  fillCells(walls, 4, 8, 4, 3)
  fillCells(walls, 12, 8, 3, 4)
  fillCells(walls, 8, 11, 3, 2)
  clearProtectedDistrict(walls)

  return {
    walls,
    spawnCells: collectSpawnCells(walls),
    signs: createNeonSigns(walls, mulberry32(88)),
  }
}

function createNeonSigns(walls: boolean[][], random: RandomSource): NeonSign[] {
  const cells: Cell[] = []

  for (let row = 1; row < GRID_ROWS - 1; row += 1) {
    for (let col = 1; col < GRID_COLS - 1; col += 1) {
      if (!walls[row][col]) {
        continue
      }

      const hasRoadNeighbor = !walls[row - 1][col] || !walls[row + 1][col] || !walls[row][col - 1] || !walls[row][col + 1]
      if (hasRoadNeighbor) {
        cells.push({ col, row })
      }
    }
  }

  const signs: NeonSign[] = []
  const signCount = Math.min(16, cells.length)

  for (let index = 0; index < signCount; index += 1) {
    const cell = cells.splice(Math.floor(random() * cells.length), 1)[0]
    const x = cell.col * CELL_SIZE + 6 + random() * 6
    const y = cell.row * CELL_SIZE + 7 + random() * 8
    signs.push({
      x,
      y,
      width: 24 + Math.floor(random() * 18),
      height: 12 + Math.floor(random() * 6),
      color: neonColors[Math.floor(random() * neonColors.length)],
      text: neonTexts[Math.floor(random() * neonTexts.length)],
    })
  }

  return signs
}

function collectSpawnCells(walls: boolean[][]) {
  const spawns: Vec2[] = []
  const center = worldToCell(PLAYER_SPAWN.x, PLAYER_SPAWN.y)

  for (let row = 1; row < GRID_ROWS - 1; row += 1) {
    for (let col = 1; col < GRID_COLS - 1; col += 1) {
      if (walls[row][col]) {
        continue
      }

      const distance = Math.abs(col - center.col) + Math.abs(row - center.row)
      if (distance < 5) {
        continue
      }

      spawns.push(cellCenter(col, row))
    }
  }

  return spawns
}

function fillCells(walls: boolean[][], startCol: number, startRow: number, width: number, height: number) {
  for (let row = startRow; row < startRow + height && row < GRID_ROWS - 1; row += 1) {
    for (let col = startCol; col < startCol + width && col < GRID_COLS - 1; col += 1) {
      walls[row][col] = true
    }
  }
}

function isNearPlayerDistrict(startCol: number, startRow: number, length: number, horizontal: boolean) {
  const center = worldToCell(PLAYER_SPAWN.x, PLAYER_SPAWN.y)
  const endCol = horizontal ? startCol + length : startCol
  const endRow = horizontal ? startRow : startRow + length

  return (
    startCol <= center.col + 2 &&
    endCol >= center.col - 2 &&
    startRow <= center.row + 2 &&
    endRow >= center.row - 2
  )
}

export function moveWithCollision(position: Vec2, delta: Vec2, radius: number, map: GameMap) {
  const moved = { ...position }

  moved.x += delta.x
  if (collidesWithWalls(moved.x, moved.y, radius, map)) {
    moved.x -= delta.x
  }

  moved.y += delta.y
  if (collidesWithWalls(moved.x, moved.y, radius, map)) {
    moved.y -= delta.y
  }

  moved.x = clamp(moved.x, radius + 2, GAME_WIDTH - radius - 2)
  moved.y = clamp(moved.y, radius + 2, GAME_HEIGHT - radius - 2)

  return moved
}

export function collidesWithWalls(x: number, y: number, radius: number, map: GameMap) {
  const min = worldToCell(x - radius, y - radius)
  const max = worldToCell(x + radius, y + radius)

  for (let row = min.row; row <= max.row; row += 1) {
    for (let col = min.col; col <= max.col; col += 1) {
      if (!isWallCell(map, col, row)) {
        continue
      }

      const rect = { x: col * CELL_SIZE, y: row * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }
      if (circleIntersectsRect(x, y, radius, rect)) {
        return true
      }
    }
  }

  return false
}

export function worldToCell(x: number, y: number): Cell {
  return {
    col: clamp(Math.floor(x / CELL_SIZE), 0, GRID_COLS - 1),
    row: clamp(Math.floor(y / CELL_SIZE), 0, GRID_ROWS - 1),
  }
}

export function cellCenter(col: number, row: number): Vec2 {
  return {
    x: col * CELL_SIZE + CELL_SIZE / 2,
    y: row * CELL_SIZE + CELL_SIZE / 2,
  }
}

export function findPath(map: GameMap, start: Vec2, end: Vec2) {
  const startCell = worldToCell(start.x, start.y)
  const endCell = worldToCell(end.x, end.y)

  if (startCell.col === endCell.col && startCell.row === endCell.row) {
    return []
  }

  const queue: Cell[] = [startCell]
  const visited = Array.from({ length: GRID_ROWS }, () => Array.from({ length: GRID_COLS }, () => false))
  const parent = Array.from({ length: GRID_ROWS }, () => Array.from({ length: GRID_COLS }, () => ({ col: -1, row: -1 })))
  visited[startCell.row][startCell.col] = true

  const directions = [
    { col: 1, row: 0 },
    { col: -1, row: 0 },
    { col: 0, row: 1 },
    { col: 0, row: -1 },
  ]

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index]
    if (current.col === endCell.col && current.row === endCell.row) {
      break
    }

    for (const direction of directions) {
      const next = { col: current.col + direction.col, row: current.row + direction.row }
      if (
        next.col < 0 ||
        next.col >= GRID_COLS ||
        next.row < 0 ||
        next.row >= GRID_ROWS ||
        visited[next.row][next.col] ||
        isWallCell(map, next.col, next.row)
      ) {
        continue
      }

      visited[next.row][next.col] = true
      parent[next.row][next.col] = current
      queue.push(next)
    }
  }

  if (!visited[endCell.row][endCell.col]) {
    return []
  }

  const path: Vec2[] = []
  let cursor = endCell

  while (cursor.col !== startCell.col || cursor.row !== startCell.row) {
    path.push(cellCenter(cursor.col, cursor.row))
    cursor = parent[cursor.row][cursor.col]
  }

  path.reverse()
  return path
}

export function hasLineOfSight(map: GameMap, from: Vec2, to: Vec2) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y)
  const steps = Math.max(8, Math.ceil(distance / 12))

  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps
    const x = from.x + (to.x - from.x) * t
    const y = from.y + (to.y - from.y) * t
    const cell = worldToCell(x, y)
    if (isWallCell(map, cell.col, cell.row)) {
      return false
    }
  }

  return true
}

export function isWallCell(map: GameMap, col: number, row: number) {
  if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) {
    return true
  }

  return map.walls[row][col]
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function circleIntersectsRect(x: number, y: number, radius: number, rect: Rect) {
  const closestX = clamp(x, rect.x, rect.x + rect.width)
  const closestY = clamp(y, rect.y, rect.y + rect.height)
  return Math.hypot(x - closestX, y - closestY) < radius
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
