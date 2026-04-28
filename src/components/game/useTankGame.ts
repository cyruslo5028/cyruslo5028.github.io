import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { TankGameAudio } from './tankGameAudio'
import { clamp, createGameMap, findPath, hasLineOfSight, moveWithCollision } from './tankGameMap'
import {
  BASE_BULLET_SPEED,
  BASE_FIRE_COOLDOWN,
  BASE_PLAYER_SPEED,
  GAME_HEIGHT,
  GAME_WIDTH,
  MAX_PLAYER_HP,
  PLAYER_SPAWN,
  UPGRADE_LIBRARY,
  type Bullet,
  type EnemyTank,
  type Flash,
  type TankGameView,
  type UpgradeKey,
  type UpgradeState,
  type Vec2,
  type WorldState,
} from './tankGameModel'
import { renderTankGame } from './tankGameRenderer'

const SNAPSHOT_INTERVAL = 0.08

function createUpgradeState(): UpgradeState {
  return {
    scatter: false,
    pierce: false,
    shieldCharges: 0,
    speedMultiplier: 1,
    damageMultiplier: 1,
    fireRateMultiplier: 1,
    picks: [],
  }
}

function createWorld(seed: number): WorldState {
  return {
    scene: 'idle',
    time: 0,
    wave: 1,
    score: 0,
    nextEnemyId: 1,
    nextBulletId: 1,
    map: createGameMap(seed),
    player: {
      x: PLAYER_SPAWN.x,
      y: PLAYER_SPAWN.y,
      angle: -Math.PI / 2,
      radius: 16,
      hp: MAX_PLAYER_HP,
      maxHp: MAX_PLAYER_HP,
      cooldown: 0,
      invulnerable: 0,
    },
    enemies: [],
    bullets: [],
    particles: [],
    flashes: [],
    input: {
      up: false,
      down: false,
      left: false,
      right: false,
      firing: false,
    },
    pointer: {
      x: GAME_WIDTH / 2,
      y: 120,
      inside: false,
    },
    upgrades: createUpgradeState(),
    upgradeOptions: [],
    shake: 0,
  }
}

function createView(world: WorldState): TankGameView {
  return {
    scene: world.scene,
    wave: world.wave,
    score: world.score,
    hp: world.player.hp,
    maxHp: world.player.maxHp,
    shieldCharges: world.upgrades.shieldCharges,
    upgrades: [...world.upgrades.picks],
    upgradeOptions: world.upgradeOptions.map((key) => ({
      key,
      title: UPGRADE_LIBRARY[key].title,
      description: UPGRADE_LIBRARY[key].description,
    })),
  }
}

function shuffle<T>(items: T[]) {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next
}

function pickUpgradeOptions(upgrades: UpgradeState) {
  const candidates = (Object.keys(UPGRADE_LIBRARY) as UpgradeKey[]).filter((key) => {
    if (key === 'scatter') {
      return !upgrades.scatter
    }
    if (key === 'pierce') {
      return !upgrades.pierce
    }
    return true
  })

  return shuffle(candidates).slice(0, Math.min(3, candidates.length))
}

function applyUpgrade(world: WorldState, upgrade: UpgradeKey) {
  world.upgrades.picks.push(upgrade)

  switch (upgrade) {
    case 'scatter':
      world.upgrades.scatter = true
      break
    case 'pierce':
      world.upgrades.pierce = true
      break
    case 'shield':
      world.upgrades.shieldCharges += 1
      break
    case 'speed':
      world.upgrades.speedMultiplier *= 1.2
      break
    case 'damage':
      world.upgrades.damageMultiplier *= 1.5
      break
    case 'fireRate':
      world.upgrades.fireRateMultiplier *= 1.3
      break
  }
}

function spawnWave(world: WorldState) {
  world.scene = 'playing'
  world.map = createGameMap(Date.now() + world.wave * 97)
  world.bullets = []
  world.flashes = []
  world.particles = []
  world.player.x = PLAYER_SPAWN.x
  world.player.y = PLAYER_SPAWN.y
  world.player.invulnerable = 1
  world.player.cooldown = 0
  world.pointer.inside = false
  world.shake = 0

  const enemyCount = 3 + (world.wave - 1) * 2
  const slots = shuffle(world.map.spawnCells).slice(0, enemyCount)
  world.enemies = slots.map((spawn) => createEnemy(world, spawn))
}

function createEnemy(world: WorldState, spawn: Vec2): EnemyTank {
  const hp = 2 + Math.floor((world.wave - 1) / 2)
  return {
    id: world.nextEnemyId++,
    x: spawn.x,
    y: spawn.y,
    angle: Math.PI,
    radius: 15,
    hp,
    maxHp: hp,
    cooldown: 0.9 + Math.random() * 0.5,
    path: [],
    repathIn: Math.random() * 0.2,
    fireJitter: 0.2 + Math.random() * 0.55,
  }
}

function spawnFlash(world: WorldState, x: number, y: number, radius: number, color: string) {
  world.flashes.push({
    x,
    y,
    radius,
    color,
    life: 0.14,
    maxLife: 0.14,
  })
}

function spawnExplosion(world: WorldState, x: number, y: number, color: string, size = 24) {
  const count = 20 + Math.floor(Math.random() * 11)
  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count + Math.random() * 0.6
    const speed = 50 + Math.random() * 180
    world.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.35 + Math.random() * 0.35,
      maxLife: 0.35 + Math.random() * 0.35,
      size: 2 + Math.random() * 4,
      color: Math.random() < 0.6 ? color : '#f8fafc',
    })
  }

  spawnFlash(world, x, y, size, color)
}

function movePlayer(world: WorldState, delta: number) {
  const move = { x: 0, y: 0 }
  if (world.input.up) {
    move.y -= 1
  }
  if (world.input.down) {
    move.y += 1
  }
  if (world.input.left) {
    move.x -= 1
  }
  if (world.input.right) {
    move.x += 1
  }

  if (move.x !== 0 || move.y !== 0) {
    const length = Math.hypot(move.x, move.y)
    const speed = BASE_PLAYER_SPEED * world.upgrades.speedMultiplier
    const offset = {
      x: (move.x / length) * speed * delta,
      y: (move.y / length) * speed * delta,
    }
    const next = moveWithCollision(world.player, offset, world.player.radius, world.map)
    world.player.x = next.x
    world.player.y = next.y
  }

  const target = world.pointer.inside
    ? { x: world.pointer.x, y: world.pointer.y }
    : world.enemies[0]
      ? nearestEnemyPosition(world)
      : { x: world.player.x, y: world.player.y - 30 }

  world.player.angle = Math.atan2(target.y - world.player.y, target.x - world.player.x)
}

function nearestEnemyPosition(world: WorldState) {
  let best = world.enemies[0] ?? { x: world.player.x, y: world.player.y - 1 }
  let bestDistance = Number.POSITIVE_INFINITY

  world.enemies.forEach((enemy) => {
    const distance = Math.hypot(enemy.x - world.player.x, enemy.y - world.player.y)
    if (distance < bestDistance) {
      bestDistance = distance
      best = enemy
    }
  })

  return { x: best.x, y: best.y }
}

function shootPlayer(world: WorldState, audio: TankGameAudio) {
  if (world.player.cooldown > 0) {
    return
  }

  const angles = world.upgrades.scatter ? [-0.22, 0, 0.22] : [0]
  angles.forEach((offset) => {
    const angle = world.player.angle + offset
    const speed = BASE_BULLET_SPEED
    const muzzleDistance = 24
    world.bullets.push({
      id: world.nextBulletId++,
      x: world.player.x + Math.cos(angle) * muzzleDistance,
      y: world.player.y + Math.sin(angle) * muzzleDistance,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 4,
      damage: world.upgrades.damageMultiplier,
      fromEnemy: false,
      ttl: 1.6,
      pierce: world.upgrades.pierce,
      hitIds: [],
    })
  })

  world.player.cooldown = BASE_FIRE_COOLDOWN / world.upgrades.fireRateMultiplier
  world.shake = Math.max(world.shake, 4)
  spawnFlash(world, world.player.x + Math.cos(world.player.angle) * 24, world.player.y + Math.sin(world.player.angle) * 24, 18, '#22d3ee')
  audio.shoot()
}

function updateEnemies(world: WorldState, delta: number, audio: TankGameAudio) {
  world.enemies.forEach((enemy) => {
    enemy.cooldown -= delta
    enemy.repathIn -= delta

    if (enemy.repathIn <= 0) {
      enemy.path = findPath(world.map, enemy, world.player)
      enemy.repathIn = 0.45 + Math.random() * 0.25
    }

    let target = { x: world.player.x, y: world.player.y }
    if (enemy.path.length > 0) {
      const next = enemy.path[0]
      if (Math.hypot(next.x - enemy.x, next.y - enemy.y) < 10) {
        enemy.path.shift()
      }
      if (enemy.path[0]) {
        target = enemy.path[0]
      }
    }

    const desiredAngle = Math.atan2(target.y - enemy.y, target.x - enemy.x)
    enemy.angle = lerpAngle(enemy.angle, desiredAngle, delta * 6)

    const speed = (96 + world.wave * 7) * Math.min(1.4, 1 + world.wave * 0.03)
    const offset = {
      x: Math.cos(desiredAngle) * speed * delta,
      y: Math.sin(desiredAngle) * speed * delta,
    }
    const next = moveWithCollision(enemy, offset, enemy.radius, world.map)
    enemy.x = next.x
    enemy.y = next.y

    const distanceToPlayer = Math.hypot(world.player.x - enemy.x, world.player.y - enemy.y)
    if (distanceToPlayer < 340 && enemy.cooldown <= 0 && hasLineOfSight(world.map, enemy, world.player)) {
      const angle = Math.atan2(world.player.y - enemy.y, world.player.x - enemy.x)
      world.bullets.push({
        id: world.nextBulletId++,
        x: enemy.x + Math.cos(angle) * 22,
        y: enemy.y + Math.sin(angle) * 22,
        vx: Math.cos(angle) * 280,
        vy: Math.sin(angle) * 280,
        radius: 4,
        damage: 1,
        fromEnemy: true,
        ttl: 1.7,
        pierce: false,
        hitIds: [],
      })
      enemy.cooldown = 1.1 + enemy.fireJitter
      spawnFlash(world, enemy.x + Math.cos(angle) * 20, enemy.y + Math.sin(angle) * 20, 16, '#fb7185')
      audio.shoot()
    }
  })
}

function updateBullets(world: WorldState, delta: number, audio: TankGameAudio) {
  const survivors: Bullet[] = []
  const destroyedEnemyIds = new Set<number>()

  world.bullets.forEach((bullet) => {
    bullet.ttl -= delta
    bullet.x += bullet.vx * delta
    bullet.y += bullet.vy * delta

    if (bullet.ttl <= 0 || bullet.x < -20 || bullet.x > GAME_WIDTH + 20 || bullet.y < -20 || bullet.y > GAME_HEIGHT + 20) {
      return
    }

    const hitWall = world.map.walls[clamp(Math.floor(bullet.y / 40), 0, world.map.walls.length - 1)][
      clamp(Math.floor(bullet.x / 40), 0, world.map.walls[0].length - 1)
    ]
    if (hitWall) {
      spawnFlash(world, bullet.x, bullet.y, bullet.fromEnemy ? 14 : 18, bullet.fromEnemy ? '#fb7185' : '#22d3ee')
      return
    }

    if (bullet.fromEnemy) {
      const hitPlayer = Math.hypot(bullet.x - world.player.x, bullet.y - world.player.y) < bullet.radius + world.player.radius
      if (hitPlayer && world.player.invulnerable <= 0) {
        handlePlayerDamage(world, bullet.damage, audio)
        return
      }

      survivors.push(bullet)
      return
    }

    let bulletRemoved = false
    world.enemies.forEach((enemy) => {
      if (bulletRemoved || destroyedEnemyIds.has(enemy.id) || bullet.hitIds.includes(enemy.id)) {
        return
      }

      const hitEnemy = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) < bullet.radius + enemy.radius
      if (!hitEnemy) {
        return
      }

      enemy.hp -= bullet.damage
      bullet.hitIds.push(enemy.id)
      spawnFlash(world, bullet.x, bullet.y, 18, '#fb923c')
      world.score += 25

      if (enemy.hp <= 0) {
        destroyedEnemyIds.add(enemy.id)
        world.score += 100
        world.shake = Math.max(world.shake, 8)
        spawnExplosion(world, enemy.x, enemy.y, '#fb7185', 30)
        audio.explosion()
      }

      if (!bullet.pierce) {
        bulletRemoved = true
      }
    })

    if (!bulletRemoved) {
      survivors.push(bullet)
    }
  })

  world.bullets = survivors
  if (destroyedEnemyIds.size > 0) {
    world.enemies = world.enemies.filter((enemy) => !destroyedEnemyIds.has(enemy.id))
  }
}

function handlePlayerDamage(world: WorldState, damage: number, audio: TankGameAudio) {
  if (world.upgrades.shieldCharges > 0) {
    world.upgrades.shieldCharges -= 1
    spawnFlash(world, world.player.x, world.player.y, 26, '#22d3ee')
    world.player.invulnerable = 0.5
    return
  }

  world.player.hp = Math.max(0, world.player.hp - damage)
  world.player.invulnerable = 1
  world.shake = Math.max(world.shake, 10)
  spawnExplosion(world, world.player.x, world.player.y, '#fb923c', 28)
  audio.explosion()

  if (world.player.hp <= 0) {
    world.scene = 'gameover'
    world.input.firing = false
  }
}

function updateEffects(world: WorldState, delta: number) {
  world.player.cooldown = Math.max(0, world.player.cooldown - delta)
  world.player.invulnerable = Math.max(0, world.player.invulnerable - delta)
  world.shake = Math.max(0, world.shake - delta * 18)

  world.particles = world.particles.filter((particle) => {
    particle.life -= delta
    particle.x += particle.vx * delta
    particle.y += particle.vy * delta
    particle.vx *= 0.97
    particle.vy *= 0.97
    return particle.life > 0
  })

  world.flashes = world.flashes.filter((flash: Flash) => {
    flash.life -= delta
    return flash.life > 0
  })
}

function updateWorld(world: WorldState, delta: number, audio: TankGameAudio) {
  world.time += delta
  updateEffects(world, delta)

  if (world.scene !== 'playing') {
    return
  }

  movePlayer(world, delta)
  if (world.input.firing) {
    shootPlayer(world, audio)
  }
  updateEnemies(world, delta, audio)
  updateBullets(world, delta, audio)

  if (world.scene === 'playing' && world.enemies.length === 0) {
    world.scene = 'upgrading'
    world.upgradeOptions = pickUpgradeOptions(world.upgrades)
    world.input.firing = false
  }
}

function lerpAngle(from: number, to: number, amount: number) {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  return from + delta * Math.min(1, amount)
}

function translatePointer(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
  const rect = canvas.getBoundingClientRect()
  const scaleX = GAME_WIDTH / rect.width
  const scaleY = GAME_HEIGHT / rect.height
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  }
}

export function useTankGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const audioRef = useRef(new TankGameAudio())
  const worldRef = useRef(createWorld(Date.now()))
  const [view, setView] = useState(() => createView(worldRef.current))

  const syncView = useCallback(() => {
    setView(createView(worldRef.current))
  }, [])

  const ensureAudio = useCallback(async () => {
    await audioRef.current.resume()
  }, [])

  const startGame = useCallback(async () => {
    await ensureAudio()
    worldRef.current = createWorld(Date.now())
    spawnWave(worldRef.current)
    syncView()
  }, [ensureAudio, syncView])

  const selectUpgrade = useCallback(
    async (upgrade: UpgradeKey) => {
      await ensureAudio()
      const world = worldRef.current
      if (world.scene !== 'upgrading') {
        return
      }

      applyUpgrade(world, upgrade)
      audioRef.current.upgrade()
      world.wave += 1
      spawnWave(world)
      syncView()
    },
    [ensureAudio, syncView],
  )

  useEffect(() => {
    const onKeyChange = (pressed: boolean) => (event: KeyboardEvent) => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].includes(event.code)) {
        event.preventDefault()
      }

      const input = worldRef.current.input
      switch (event.code) {
        case 'KeyW':
          input.up = pressed
          break
        case 'KeyS':
          input.down = pressed
          break
        case 'KeyA':
          input.left = pressed
          break
        case 'KeyD':
          input.right = pressed
          break
        case 'Space':
          input.firing = pressed
          break
      }
    }

    const onVisibility = () => {
      if (document.hidden) {
        worldRef.current.input.firing = false
      }
    }

    const down = onKeyChange(true)
    const up = onKeyChange(false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) {
      return
    }

    let frameId = 0
    let lastTime = performance.now()
    let snapshotClock = 0

    const tick = (now: number) => {
      const delta = Math.min(0.033, (now - lastTime) / 1000)
      lastTime = now
      snapshotClock += delta

      updateWorld(worldRef.current, delta, audioRef.current)
      renderTankGame(context, worldRef.current)

      if (snapshotClock >= SNAPSHOT_INTERVAL) {
        snapshotClock = 0
        setView(createView(worldRef.current))
      }

      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [])

  useEffect(() => {
    return () => {
      audioRef.current.dispose()
    }
  }, [])

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const point = translatePointer(canvas, event.clientX, event.clientY)
    worldRef.current.pointer = {
      x: point.x,
      y: point.y,
      inside: true,
    }
  }, [])

  const handlePointerLeave = useCallback(() => {
    worldRef.current.pointer.inside = false
    worldRef.current.input.firing = false
  }, [])

  const handlePointerDown = useCallback(async () => {
    await ensureAudio()
    if (worldRef.current.scene === 'playing') {
      worldRef.current.input.firing = true
    }
  }, [ensureAudio])

  const handlePointerUp = useCallback(() => {
    worldRef.current.input.firing = false
  }, [])

  return {
    canvasRef,
    view,
    startGame,
    selectUpgrade,
    handlePointerMove,
    handlePointerLeave,
    handlePointerDown,
    handlePointerUp,
  }
}
