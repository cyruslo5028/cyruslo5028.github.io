import { useCallback, useEffect, useRef, useState } from 'react'
import { TankGameAudio } from './tankGameAudio'
import { clamp, collidesWithWalls, createGameMap, findPath, findSafeSpawnPosition, hasLineOfSight, moveWithCollision } from './tankGameMap'
import {
  BASE_BULLET_SPEED,
  BASE_ENEMY_HP,
  BASE_ENEMY_SPEED,
  BASE_FIRE_COOLDOWN,
  BASE_PLAYER_BULLET_DAMAGE,
  BASE_PLAYER_SPEED,
  DIFFICULTY_PRESETS,
  ENEMY_RADIUS,
  GAME_HEIGHT,
  GAME_WIDTH,
  MIN_FIRE_COOLDOWN,
  PLAYER_RADIUS,
  PLAYER_SPAWN,
  UPGRADE_LIBRARY,
  type Bullet,
  type DifficultyKey,
  type EnemyTank,
  type Flash,
  type UpgradeKey,
  type UpgradeLevels,
  type UpgradeOptionView,
  type UpgradeState,
  type Vec2,
  type WorldState,
} from './tankGameModel'

const BULLET_TTL = 1.75
const PLAYER_INVULNERABLE_WINDOW = 0.55

function createUpgradeLevels(): UpgradeLevels {
  return {
    damageUp: 0,
    fireRateUp: 0,
    multishot: 0,
    bigBullets: 0,
    piercingBullets: 0,
    vampirism: 0,
    criticalHit: 0,
    armorUp: 0,
  }
}

function createUpgradeState(): UpgradeState {
  return {
    levels: createUpgradeLevels(),
  }
}

function createWorld(seed: number, difficulty: DifficultyKey): WorldState {
  const map = createGameMap(seed)
  const safeSpawn = findSafeSpawnPosition(map, PLAYER_SPAWN, PLAYER_RADIUS)
  const difficultyConfig = DIFFICULTY_PRESETS[difficulty]

  return {
    scene: 'idle',
    time: 0,
    wave: 1,
    score: 0,
    difficulty,
    nextEnemyId: 1,
    nextBulletId: 1,
    nextEffectId: 1,
    map,
    player: {
      x: safeSpawn.x,
      y: safeSpawn.y,
      angle: -Math.PI / 2,
      radius: PLAYER_RADIUS,
      hp: difficultyConfig.playerMaxHp,
      maxHp: difficultyConfig.playerMaxHp,
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
      x: safeSpawn.x,
      y: safeSpawn.y - 120,
      inside: false,
    },
    upgrades: createUpgradeState(),
    upgradeOptions: [],
    shake: 0,
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

function pickUpgradeOptions() {
  return shuffle(Object.keys(UPGRADE_LIBRARY) as UpgradeKey[]).slice(0, 3)
}

function getUpgradeLevel(world: WorldState, key: UpgradeKey) {
  return world.upgrades.levels[key]
}

function getBulletRadius(world: WorldState) {
  return 4 * (1 + getUpgradeLevel(world, 'bigBullets') * 0.3)
}

function getPlayerDamage(world: WorldState) {
  const damageLevel = getUpgradeLevel(world, 'damageUp')
  const bigBulletLevel = getUpgradeLevel(world, 'bigBullets')
  return BASE_PLAYER_BULLET_DAMAGE * (1 + damageLevel * 0.2) * (1 + bigBulletLevel * 0.15)
}

function getPlayerCooldown(world: WorldState) {
  const level = getUpgradeLevel(world, 'fireRateUp')
  return Math.max(MIN_FIRE_COOLDOWN, BASE_FIRE_COOLDOWN * 0.85 ** level)
}

function getPlayerBulletCount(world: WorldState) {
  return 1 + getUpgradeLevel(world, 'multishot') * 2
}

function getCriticalMultiplier(world: WorldState) {
  const level = getUpgradeLevel(world, 'criticalHit')
  const chance = Math.min(0.15 * level, 0.9)
  return Math.random() < chance ? 2 : 1
}

function applyUpgrade(world: WorldState, upgrade: UpgradeKey) {
  world.upgrades.levels[upgrade] += 1

  if (upgrade === 'armorUp') {
    world.player.maxHp += 30
    world.player.hp = Math.min(world.player.maxHp, world.player.hp + 30)
  }
}

function getUpgradeOptions(world: WorldState): UpgradeOptionView[] {
  return world.upgradeOptions.map((key) => ({
    key,
    title: UPGRADE_LIBRARY[key].title,
    description: UPGRADE_LIBRARY[key].description,
    level: world.upgrades.levels[key],
  }))
}

function spawnWave(world: WorldState) {
  world.scene = 'playing'
  world.map = createGameMap(Date.now() + world.wave * 97)
  world.bullets = []
  world.flashes = []
  world.particles = []
  world.upgradeOptions = []
  world.player.cooldown = 0
  world.player.invulnerable = 1
  world.pointer.inside = false
  world.shake = 0

  const safeSpawn = findSafeSpawnPosition(world.map, PLAYER_SPAWN, world.player.radius)
  world.player.x = safeSpawn.x
  world.player.y = safeSpawn.y

  const enemyCount = 4 + (world.wave - 1) * 2 + DIFFICULTY_PRESETS[world.difficulty].enemyExtraCount
  const slots = shuffle(world.map.spawnCells)
    .filter((spawn) => Math.hypot(spawn.x - safeSpawn.x, spawn.y - safeSpawn.y) > 180)
    .slice(0, enemyCount)

  world.enemies = slots.map((spawn) => createEnemy(world, spawn))
}

function createEnemy(world: WorldState, spawn: Vec2): EnemyTank {
  const hp = BASE_ENEMY_HP + (world.wave - 1) * 11
  const safeSpawn = findSafeSpawnPosition(world.map, spawn, ENEMY_RADIUS)

  return {
    id: world.nextEnemyId++,
    x: safeSpawn.x,
    y: safeSpawn.y,
    angle: Math.PI,
    radius: ENEMY_RADIUS,
    hp,
    maxHp: hp,
    damage: DIFFICULTY_PRESETS[world.difficulty].enemyDamage,
    cooldown: 0.85 + Math.random() * 0.45,
    path: [],
    repathIn: Math.random() * 0.25,
    fireJitter: 0.22 + Math.random() * 0.55,
  }
}

function spawnFlash(world: WorldState, x: number, y: number, radius: number, color: string) {
  world.flashes.push({
    id: world.nextEffectId++,
    x,
    y,
    radius,
    color,
    life: 0.16,
    maxLife: 0.16,
  })
}

function spawnExplosion(world: WorldState, x: number, y: number, color: string, size = 24) {
  const count = 18 + Math.floor(Math.random() * 12)

  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count + Math.random() * 0.45
    const speed = 75 + Math.random() * 170
    const life = 0.35 + Math.random() * 0.35

    world.particles.push({
      id: world.nextEffectId++,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      maxLife: life,
      size: 3 + Math.random() * 5,
      color: Math.random() < 0.65 ? color : '#f8fafc',
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
    const offset = {
      x: (move.x / length) * BASE_PLAYER_SPEED * delta,
      y: (move.y / length) * BASE_PLAYER_SPEED * delta,
    }
    const next = moveWithCollision(world.player, offset, world.player.radius, world.map)
    world.player.x = next.x
    world.player.y = next.y
  }

  const target = world.pointer.inside
    ? { x: world.pointer.x, y: world.pointer.y }
    : world.enemies[0]
      ? nearestEnemyPosition(world)
      : { x: world.player.x, y: world.player.y - 40 }

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

  const bulletCount = getPlayerBulletCount(world)
  const spread = bulletCount > 1 ? Math.min(0.18, 0.09 + bulletCount * 0.014) : 0
  const middle = (bulletCount - 1) / 2
  const baseDamage = getPlayerDamage(world)
  const bulletRadius = getBulletRadius(world)
  const pierceLevel = getUpgradeLevel(world, 'piercingBullets')

  for (let index = 0; index < bulletCount; index += 1) {
    const offset = (index - middle) * spread
    const angle = world.player.angle + offset
    const critMultiplier = getCriticalMultiplier(world)
    const damage = baseDamage * critMultiplier
    const muzzleDistance = 28

    world.bullets.push({
      id: world.nextBulletId++,
      x: world.player.x + Math.cos(angle) * muzzleDistance,
      y: world.player.y + Math.sin(angle) * muzzleDistance,
      vx: Math.cos(angle) * BASE_BULLET_SPEED,
      vy: Math.sin(angle) * BASE_BULLET_SPEED,
      radius: bulletRadius,
      damage,
      fromEnemy: false,
      ttl: BULLET_TTL,
      pierceRemaining: pierceLevel,
      hitIds: [],
      crit: critMultiplier > 1,
    })
  }

  world.player.cooldown = getPlayerCooldown(world)
  world.shake = Math.max(world.shake, 4)
  spawnFlash(world, world.player.x + Math.cos(world.player.angle) * 24, world.player.y + Math.sin(world.player.angle) * 24, 18, '#22d3ee')
  audio.shoot()
}

function updateEnemies(world: WorldState, delta: number, audio: TankGameAudio) {
  const speedMultiplier = DIFFICULTY_PRESETS[world.difficulty].enemySpeedMultiplier

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

    const speed = (BASE_ENEMY_SPEED + world.wave * 8) * speedMultiplier
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
        vx: Math.cos(angle) * 290,
        vy: Math.sin(angle) * 290,
        radius: 5,
        damage: enemy.damage,
        fromEnemy: true,
        ttl: 1.85,
        pierceRemaining: 0,
        hitIds: [],
        crit: false,
      })
      enemy.cooldown = 1.05 + enemy.fireJitter
      spawnFlash(world, enemy.x + Math.cos(angle) * 20, enemy.y + Math.sin(angle) * 20, 16, '#fb7185')
      audio.shoot()
    }
  })
}

function updateBullets(world: WorldState, delta: number, audio: TankGameAudio, godMode: boolean) {
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
      spawnFlash(world, bullet.x, bullet.y, bullet.fromEnemy ? 16 : 20, bullet.fromEnemy ? '#fb7185' : '#22d3ee')
      return
    }

    if (bullet.fromEnemy) {
      const hitPlayer = Math.hypot(bullet.x - world.player.x, bullet.y - world.player.y) < bullet.radius + world.player.radius
      if (hitPlayer && world.player.invulnerable <= 0) {
        handlePlayerDamage(world, bullet.damage, audio, godMode)
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
      spawnFlash(world, bullet.x, bullet.y, bullet.crit ? 22 : 18, bullet.crit ? '#f59e0b' : '#fb923c')
      world.score += 25

      if (enemy.hp <= 0) {
        destroyedEnemyIds.add(enemy.id)
        world.score += 100
        world.shake = Math.max(world.shake, 8)
        spawnExplosion(world, enemy.x, enemy.y, '#f43f5e', 34)
        audio.explosion()
        tryApplyVampirism(world)
      }

      if (bullet.pierceRemaining > 0) {
        bullet.pierceRemaining -= 1
      } else {
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

function tryApplyVampirism(world: WorldState) {
  const level = getUpgradeLevel(world, 'vampirism')
  if (level <= 0) {
    return
  }

  const chance = Math.min(0.2 * level, 0.9)
  if (Math.random() > chance) {
    return
  }

  const heal = 5 * level
  world.player.hp = Math.min(world.player.maxHp, world.player.hp + heal)
  spawnFlash(world, world.player.x, world.player.y, 24, '#34d399')
}

function handlePlayerDamage(world: WorldState, damage: number, audio: TankGameAudio, godMode: boolean) {
  if (godMode) {
    world.player.invulnerable = 0.12
    spawnFlash(world, world.player.x, world.player.y, 28, '#22d3ee')
    return
  }

  world.player.hp = Math.max(0, world.player.hp - damage)
  world.player.invulnerable = PLAYER_INVULNERABLE_WINDOW
  world.shake = Math.max(world.shake, 10)
  spawnExplosion(world, world.player.x, world.player.y, '#fb923c', 30)
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

function resolveEntityCollisions(world: WorldState) {
  const player = world.player
  const map = world.map

  // Enemy vs enemy
  for (let i = 0; i < world.enemies.length; i++) {
    for (let j = i + 1; j < world.enemies.length; j++) {
      const e1 = world.enemies[i]
      const e2 = world.enemies[j]
      const dx = e2.x - e1.x
      const dy = e2.y - e1.y
      const dist = Math.hypot(dx, dy)
      const minDist = e1.radius + e2.radius

      if (dist < minDist && dist > 0.001) {
        const overlap = minDist - dist
        const pushX = (dx / dist) * (overlap / 2)
        const pushY = (dy / dist) * (overlap / 2)

        const e1x = e1.x - pushX
        const e1y = e1.y - pushY
        const e2x = e2.x + pushX
        const e2y = e2.y + pushY

        // Only apply push if it doesn't move into a wall
        if (!collidesWithWalls(e1x, e1y, e1.radius, map)) {
          e1.x = e1x
          e1.y = e1y
        }
        if (!collidesWithWalls(e2x, e2y, e2.radius, map)) {
          e2.x = e2x
          e2.y = e2y
        }
      }
    }
  }

  // Enemy vs player
  for (let i = 0; i < world.enemies.length; i++) {
    const e = world.enemies[i]
    const dx = e.x - player.x
    const dy = e.y - player.y
    const dist = Math.hypot(dx, dy)
    const minDist = e.radius + player.radius

    if (dist < minDist && dist > 0.001) {
      const overlap = minDist - dist
      const pushX = (dx / dist) * (overlap / 2)
      const pushY = (dy / dist) * (overlap / 2)

      const px = player.x - pushX
      const py = player.y - pushY
      const ex = e.x + pushX
      const ey = e.y + pushY

      if (!collidesWithWalls(px, py, player.radius, map)) {
        player.x = px
        player.y = py
      }
      if (!collidesWithWalls(ex, ey, e.radius, map)) {
        e.x = ex
        e.y = ey
      }
    }
  }
}

function updateWorld(world: WorldState, delta: number, audio: TankGameAudio, godMode: boolean) {
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
  resolveEntityCollisions(world)
  updateBullets(world, delta, audio, godMode)

  if (world.scene === 'playing' && world.enemies.length === 0) {
    world.scene = 'upgrading'
    world.upgradeOptions = pickUpgradeOptions()
    world.input.firing = false
  }
}

function lerpAngle(from: number, to: number, amount: number) {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  return from + delta * Math.min(1, amount)
}

function cloneWorld(world: WorldState): WorldState {
  return {
    ...world,
    player: { ...world.player },
    enemies: world.enemies.map((enemy) => ({ ...enemy, path: [...enemy.path] })),
    bullets: world.bullets.map((bullet) => ({ ...bullet, hitIds: [...bullet.hitIds] })),
    particles: world.particles.map((particle) => ({ ...particle })),
    flashes: world.flashes.map((flash) => ({ ...flash })),
    input: { ...world.input },
    pointer: { ...world.pointer },
    upgrades: {
      levels: { ...world.upgrades.levels },
    },
    upgradeOptions: [...world.upgradeOptions],
  }
}

type UseTankGameOptions = {
  godMode: boolean
}

export function useTankGame({ godMode }: UseTankGameOptions) {
  const audioRef = useRef(new TankGameAudio())
  const [world, setWorld] = useState(() => createWorld(1, 'normal'))
  const worldRef = useRef(world)
  const godModeRef = useRef(godMode)

  useEffect(() => {
    godModeRef.current = godMode
  }, [godMode])

  const ensureAudio = useCallback(async () => {
    await audioRef.current.resume()
  }, [])

  const syncWorld = useCallback(() => {
    setWorld(cloneWorld(worldRef.current))
  }, [])

  const startGame = useCallback(
    async (difficulty: DifficultyKey) => {
      await ensureAudio()
      const nextWorld = createWorld(Date.now(), difficulty)
      spawnWave(nextWorld)
      worldRef.current = nextWorld
      syncWorld()
    },
    [ensureAudio, syncWorld],
  )

  const selectUpgrade = useCallback(
    async (upgrade: UpgradeKey) => {
      await ensureAudio()
      const activeWorld = worldRef.current
      if (activeWorld.scene !== 'upgrading') {
        return
      }

      applyUpgrade(activeWorld, upgrade)
      audioRef.current.upgrade()
      activeWorld.wave += 1
      spawnWave(activeWorld)
      syncWorld()
    },
    [ensureAudio, syncWorld],
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
    let frameId = 0
    let lastTime = performance.now()

    const tick = (now: number) => {
      const delta = Math.min(0.033, (now - lastTime) / 1000)
      lastTime = now
      updateWorld(worldRef.current, delta, audioRef.current, godModeRef.current)
      setWorld(cloneWorld(worldRef.current))
      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    return () => {
      audio.dispose()
    }
  }, [])

  const handleAim = useCallback((point: Vec2) => {
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
    world,
    upgradeOptions: getUpgradeOptions(world),
    startGame,
    selectUpgrade,
    handleAim,
    handlePointerLeave,
    handlePointerDown,
    handlePointerUp,
  }
}
