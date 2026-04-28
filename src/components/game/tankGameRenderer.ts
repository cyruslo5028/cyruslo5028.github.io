import { GAME_HEIGHT, GAME_WIDTH, type Bullet, type EnemyTank, type Flash, type Particle, type PlayerTank, type WorldState } from './tankGameModel'

export function renderTankGame(context: CanvasRenderingContext2D, world: WorldState) {
  context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
  context.save()

  if (world.shake > 0.1) {
    context.translate((Math.random() - 0.5) * world.shake, (Math.random() - 0.5) * world.shake)
  }

  drawBackdrop(context, world)
  drawRoadGrid(context)
  drawBuildings(context, world)
  drawNeonSigns(context, world)
  drawFlashes(context, world.flashes)
  drawBullets(context, world.bullets)
  drawParticles(context, world.particles)

  world.enemies.forEach((enemy) => drawTank(context, enemy, '#fb7185', '#7f1d1d', true, world.time))
  drawTank(context, world.player, '#22d3ee', '#164e63', false, world.time)

  drawOverlay(context)
  context.restore()
}

function drawBackdrop(context: CanvasRenderingContext2D, world: WorldState) {
  const background = context.createLinearGradient(0, 0, 0, GAME_HEIGHT)
  background.addColorStop(0, '#06070c')
  background.addColorStop(1, '#0d0f16')
  context.fillStyle = background
  context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

  context.fillStyle = 'rgba(34, 211, 238, 0.06)'
  context.beginPath()
  context.arc(130, 110, 160, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = 'rgba(168, 85, 247, 0.06)'
  context.beginPath()
  context.arc(620, 460, 190, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = 'rgba(255,255,255,0.02)'
  for (let index = 0; index < 22; index += 1) {
    const y = ((world.time * 18 + index * 28) % (GAME_HEIGHT + 40)) - 20
    context.fillRect(0, y, GAME_WIDTH, 1)
  }
}

function drawRoadGrid(context: CanvasRenderingContext2D) {
  context.strokeStyle = 'rgba(148, 163, 184, 0.09)'
  context.lineWidth = 1

  for (let x = 0; x <= GAME_WIDTH; x += 40) {
    context.beginPath()
    context.moveTo(x + 0.5, 0)
    context.lineTo(x + 0.5, GAME_HEIGHT)
    context.stroke()
  }

  for (let y = 0; y <= GAME_HEIGHT; y += 40) {
    context.beginPath()
    context.moveTo(0, y + 0.5)
    context.lineTo(GAME_WIDTH, y + 0.5)
    context.stroke()
  }

  context.strokeStyle = 'rgba(255, 169, 0, 0.08)'
  context.setLineDash([12, 10])
  for (let y = 60; y < GAME_HEIGHT; y += 120) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(GAME_WIDTH, y)
    context.stroke()
  }
  context.setLineDash([])
}

function drawBuildings(context: CanvasRenderingContext2D, world: WorldState) {
  world.map.walls.forEach((row, rowIndex) => {
    row.forEach((isWall, colIndex) => {
      if (!isWall) {
        return
      }

      const x = colIndex * 40
      const y = rowIndex * 40
      const wallGradient = context.createLinearGradient(x, y, x, y + 40)
      wallGradient.addColorStop(0, '#171923')
      wallGradient.addColorStop(1, '#0d1018')
      context.fillStyle = wallGradient
      context.fillRect(x, y, 40, 40)

      context.strokeStyle = 'rgba(255,255,255,0.06)'
      context.strokeRect(x + 0.5, y + 0.5, 39, 39)

      context.strokeStyle = 'rgba(255,255,255,0.04)'
      context.beginPath()
      context.moveTo(x, y + 14)
      context.lineTo(x + 40, y + 14)
      context.moveTo(x, y + 27)
      context.lineTo(x + 40, y + 27)
      context.moveTo(x + 20, y)
      context.lineTo(x + 20, y + 14)
      context.moveTo(x + 10, y + 14)
      context.lineTo(x + 10, y + 27)
      context.moveTo(x + 30, y + 27)
      context.lineTo(x + 30, y + 40)
      context.stroke()
    })
  })
}

function drawNeonSigns(context: CanvasRenderingContext2D, world: WorldState) {
  context.textBaseline = 'middle'
  context.textAlign = 'left'
  context.font = '10px "JetBrains Mono", monospace'

  world.map.signs.forEach((sign, index) => {
    const shimmer = 0.75 + Math.sin(world.time * 3 + index) * 0.12
    context.save()
    context.shadowBlur = 12
    context.shadowColor = sign.color
    context.fillStyle = hexToAlpha(sign.color, 0.18)
    context.fillRect(sign.x, sign.y, sign.width, sign.height)
    context.strokeStyle = hexToAlpha(sign.color, 0.65 * shimmer)
    context.strokeRect(sign.x + 0.5, sign.y + 0.5, sign.width - 1, sign.height - 1)
    context.fillStyle = hexToAlpha('#ffffff', 0.9)
    context.fillText(sign.text, sign.x + 4, sign.y + sign.height / 2)
    context.restore()
  })
}

function drawBullets(context: CanvasRenderingContext2D, bullets: Bullet[]) {
  bullets.forEach((bullet) => {
    context.save()
    context.shadowBlur = bullet.fromEnemy ? 12 : 18
    context.shadowColor = bullet.fromEnemy ? '#fb7185' : '#22d3ee'
    context.fillStyle = bullet.fromEnemy ? '#ffd0da' : '#d5fbff'
    context.beginPath()
    context.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2)
    context.fill()
    context.restore()
  })
}

function drawParticles(context: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach((particle) => {
    const alpha = particle.life / particle.maxLife
    context.save()
    context.globalAlpha = alpha
    context.fillStyle = particle.color
    context.beginPath()
    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    context.fill()
    context.restore()
  })
}

function drawFlashes(context: CanvasRenderingContext2D, flashes: Flash[]) {
  flashes.forEach((flash) => {
    const alpha = flash.life / flash.maxLife
    const gradient = context.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, flash.radius)
    gradient.addColorStop(0, hexToAlpha(flash.color, alpha))
    gradient.addColorStop(1, hexToAlpha(flash.color, 0))
    context.fillStyle = gradient
    context.beginPath()
    context.arc(flash.x, flash.y, flash.radius, 0, Math.PI * 2)
    context.fill()
  })
}

function drawTank(
  context: CanvasRenderingContext2D,
  tank: PlayerTank | EnemyTank,
  primary: string,
  secondary: string,
  enemy: boolean,
  time: number,
) {
  context.save()
  context.translate(tank.x, tank.y)
  context.rotate(tank.angle)
  context.shadowBlur = enemy ? 10 : 18
  context.shadowColor = primary

  context.fillStyle = '#05070b'
  roundRect(context, -18, -16, 36, 32, 11)
  context.fill()

  context.fillStyle = secondary
  roundRect(context, -18, -16, 36, 10, 9)
  context.fill()
  roundRect(context, -18, 6, 36, 10, 9)
  context.fill()

  const bob = Math.sin(time * 8 + tank.x * 0.01) * 0.9
  context.fillStyle = primary
  roundRect(context, -14, -11 + bob, 28, 22, 10)
  context.fill()

  context.fillStyle = '#dbeafe'
  context.beginPath()
  context.arc(0, 0, 8, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = primary
  roundRect(context, 2, -4, 24, 8, 5)
  context.fill()
  context.fillStyle = '#f8fafc'
  roundRect(context, 6, -2.5, 14, 5, 4)
  context.fill()

  context.fillStyle = enemy ? '#ffe4ea' : '#d8fbff'
  context.beginPath()
  context.arc(-5, -2, 2, 0, Math.PI * 2)
  context.arc(-5, 2, 2, 0, Math.PI * 2)
  context.fill()

  context.restore()
}

function drawOverlay(context: CanvasRenderingContext2D) {
  const vignette = context.createRadialGradient(GAME_WIDTH / 2, GAME_HEIGHT / 2, 160, GAME_WIDTH / 2, GAME_HEIGHT / 2, 500)
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.32)')
  context.fillStyle = vignette
  context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
}

function hexToAlpha(hex: string, alpha: number) {
  const normalized = hex.replace('#', '')
  const safe = normalized.length === 3 ? normalized.split('').map((value) => value + value).join('') : normalized
  const red = Number.parseInt(safe.slice(0, 2), 16)
  const green = Number.parseInt(safe.slice(2, 4), 16)
  const blue = Number.parseInt(safe.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}
