import { KNIFE_RADIUS, NEON_CYAN, NEON_GOLD, NEON_PRIMARY, PLAYER_RADIUS } from '../constants'
import { ENEMIES } from '../content/enemies'
import { FLOORS, FLOOR_ORDER } from '../content/biomes'
import { BOSSES } from '../content/bosses'
import { CHARACTERS } from '../content/characters'
import { SKILLS } from '../content/skills'
import type { World } from '../core/World'
import { getFloorPattern, getWallSprite, getBossBackdrop, getPlayerSprite, getEnemySprite, getBossSprite } from './assets'

// Render the entire frame. Pure draw — never mutates world.
export function renderFrame(ctx: CanvasRenderingContext2D, world: World) {
  const W = world.arena.w
  const H = world.arena.h

  ctx.save()

  // shake offset
  if (world.shake > 0) {
    const sx = (Math.random() - 0.5) * world.shake
    const sy = (Math.random() - 0.5) * world.shake
    ctx.translate(sx, sy)
  }

  drawBackground(ctx, world, W, H)
  drawArenaFrame(ctx, world, W, H)
  drawWalls(ctx, world)
  drawTreasureBox(ctx, world)
  drawProjectiles(ctx, world)
  drawEnemies(ctx, world)
  drawBoss(ctx, world)
  drawPlayer(ctx, world)
  drawParticles(ctx, world)
  drawFloats(ctx, world)
  drawHud(ctx, world, W, H)

  ctx.restore()
}

function drawBackground(ctx: CanvasRenderingContext2D, world: World, W: number, H: number) {
  const floorKey = FLOOR_ORDER[world.floorIndex]
  const floor = FLOORS[floorKey] ?? FLOORS.mong_kok

  // Boss room: full-bleed backdrop if loaded, else fall through to tile/gradient
  if (world.currentRoom?.kind === 'boss') {
    const backdrop = getBossBackdrop(floorKey)
    if (backdrop) {
      ctx.drawImage(backdrop, 0, 0, W, H)
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.fillRect(0, 0, W, H)
      return
    }
  }

  // Combat / shop / etc: use floor pattern if loaded
  const pattern = getFloorPattern(ctx, floorKey)
  if (pattern) {
    ctx.fillStyle = pattern
    ctx.fillRect(0, 0, W, H)
    const vg = ctx.createRadialGradient(W/2, H/2, Math.min(W,H)*0.35, W/2, H/2, Math.max(W,H)*0.7)
    vg.addColorStop(0, 'rgba(0,0,0,0)')
    vg.addColorStop(1, 'rgba(0,0,0,0.55)')
    ctx.fillStyle = vg
    ctx.fillRect(0, 0, W, H)
    return
  }

  const grad = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, Math.max(W, H))
  grad.addColorStop(0, '#11081d')
  grad.addColorStop(1, floor.bgColor)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 0; x <= W; x += 32) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
  }
  for (let y = 0; y <= H; y += 32) {
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
  }
  ctx.stroke()

  ctx.fillStyle = floor.accent + '14'
  ctx.fillRect(0, 0, W, H)
}

function drawWalls(ctx: CanvasRenderingContext2D, world: World) {
  const accent = FLOORS[FLOOR_ORDER[world.floorIndex]]?.accent ?? '#36d6ff'
  for (let i = 0; i < world.walls.length; i += 1) {
    const w = world.walls[i]
    const sprite = getWallSprite(i + world.floorIndex * 31 + world.roomIndex * 7)
    if (sprite) {
      // ground shadow follows wall rect
      ctx.fillStyle = 'rgba(0,0,0,0.45)'
      ctx.beginPath()
      ctx.ellipse(w.x + w.w / 2, w.y + w.h + 3, w.w * 0.55, 6, 0, 0, Math.PI * 2)
      ctx.fill()
      // Aspect-preserving fit: contain the sprite inside the wall rect (with a
      // small overshoot for the perched look), centered. This prevents
      // squashing on thin or wide walls (e.g. rest bench).
      const aw = sprite.naturalWidth || 1
      const ah = sprite.naturalHeight || 1
      const targetW = w.w + 12
      const targetH = w.h + 18
      const scale = Math.min(targetW / aw, targetH / ah)
      const dw = aw * scale
      const dh = ah * scale
      const cx = w.x + w.w / 2
      const cy = w.y + w.h / 2
      ctx.drawImage(sprite, cx - dw / 2, cy - dh / 2 - 3, dw, dh)
      continue
    }

    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(w.x + 4, w.y + 6, w.w, w.h)
    const grad = ctx.createLinearGradient(w.x, w.y, w.x, w.y + w.h)
    grad.addColorStop(0, '#1d2030')
    grad.addColorStop(1, '#0a0c14')
    ctx.fillStyle = grad
    ctx.fillRect(w.x, w.y, w.w, w.h)
    ctx.fillStyle = accent
    ctx.globalAlpha = 0.45
    ctx.fillRect(w.x, w.y, w.w, 2)
    ctx.globalAlpha = 1
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'
    ctx.lineWidth = 1
    ctx.strokeRect(w.x + 0.5, w.y + 0.5, w.w - 1, w.h - 1)
  }
}

function drawArenaFrame(ctx: CanvasRenderingContext2D, world: World, W: number, H: number) {
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 2
  ctx.strokeRect(8, 8, W - 16, H - 16)

  ctx.shadowBlur = 18
  ctx.shadowColor = FLOORS[FLOOR_ORDER[world.floorIndex]].accent
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'
  ctx.strokeRect(8, 8, W - 16, H - 16)
  ctx.shadowBlur = 0
}

function drawPlayer(ctx: CanvasRenderingContext2D, world: World) {
  const p = world.player
  const blink = p.invulnTimer > 0 && Math.floor(world.time * 24) % 2 === 0
  if (blink) return

  // Player ground halo — bright cyan ring at feet so player is unmistakable
  // even when their portrait visually resembles a thug enemy sprite.
  const haloPulse = 0.65 + 0.25 * Math.sin(world.time * 4)
  ctx.save()
  ctx.shadowColor = NEON_CYAN
  ctx.shadowBlur = 22
  ctx.strokeStyle = NEON_CYAN
  ctx.globalAlpha = 0.65
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(p.pos.x, p.pos.y + PLAYER_RADIUS - 2, PLAYER_RADIUS * 1.15 * haloPulse, PLAYER_RADIUS * 0.5 * haloPulse, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.restore()

  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.beginPath()
  ctx.ellipse(p.pos.x, p.pos.y + PLAYER_RADIUS, PLAYER_RADIUS * 0.9, PLAYER_RADIUS * 0.4, 0, 0, Math.PI * 2)
  ctx.fill()

  // Front-facing chibi portrait — matches selected character. NO rotation
  // (portraits are not top-down). Facing is shown by a small arrow indicator
  // drawn separately AROUND the sprite, rotating with `p.facing`.
  const playerSprite = getPlayerSprite(p.characterKey)
  const target = PLAYER_RADIUS * 3.6
  if (playerSprite) {
    // Preserve aspect ratio — sprite source can be e.g. 634x958. Fit so the
    // longer side equals `target`, anchor by the bottom (feet on player.pos.y)
    // for a natural standing pose.
    const aw = playerSprite.naturalWidth || 1
    const ah = playerSprite.naturalHeight || 1
    const scale = target / Math.max(aw, ah)
    const dw = aw * scale
    const dh = ah * scale
    ctx.save()
    ctx.shadowColor = NEON_CYAN
    ctx.shadowBlur = 12
    const faceLeft = Math.cos(p.facing) < 0
    if (faceLeft) {
      ctx.translate(p.pos.x, p.pos.y)
      ctx.scale(-1, 1)
      // anchor at center horizontally, +0.2 vertically so feet sit ON pos
      ctx.drawImage(playerSprite, -dw / 2, -dh / 2, dw, dh)
    } else {
      ctx.drawImage(playerSprite, p.pos.x - dw / 2, p.pos.y - dh / 2, dw, dh)
    }
    ctx.shadowBlur = 0
    ctx.restore()
  } else {
    ctx.save()
    ctx.translate(p.pos.x, p.pos.y)
    ctx.shadowColor = NEON_CYAN
    ctx.shadowBlur = 16
    ctx.fillStyle = '#1a1f2e'
    ctx.strokeStyle = NEON_CYAN
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 0, PLAYER_RADIUS, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.shadowBlur = 0
    ctx.restore()
  }

  // Facing indicator: a small gold arrow rotates around the sprite.
  ctx.save()
  ctx.translate(p.pos.x, p.pos.y)
  ctx.rotate(p.facing)
  ctx.fillStyle = NEON_GOLD
  ctx.shadowColor = NEON_GOLD
  ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.moveTo(PLAYER_RADIUS + 4, -4)
  ctx.lineTo(PLAYER_RADIUS + 14, 0)
  ctx.lineTo(PLAYER_RADIUS + 4, 4)
  ctx.closePath()
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.restore()

  if (p.shieldStacks > 0) {
    ctx.strokeStyle = NEON_CYAN
    ctx.lineWidth = 2
    ctx.shadowColor = NEON_CYAN
    ctx.shadowBlur = 12
    ctx.beginPath()
    ctx.arc(p.pos.x, p.pos.y, PLAYER_RADIUS + 6, 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 0
  }
}

function drawEnemies(ctx: CanvasRenderingContext2D, world: World) {
  for (const e of world.enemies) {
    const arch = ENEMIES[e.kind]
    const isFrozen = e.freezeTimer > 0
    const isBurning = e.burnTimer > 0
    const isPoisoned = e.poisonTimer > 0
    const isShocked = e.lightningTimer > 0
    const isStunned = e.stunTimer > 0
    const isBleeding = e.bleedTimer > 0

    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.beginPath()
    ctx.ellipse(e.pos.x, e.pos.y + e.radius, e.radius * 0.9, e.radius * 0.4, 0, 0, Math.PI * 2)
    ctx.fill()

    const statusTint = isFrozen
      ? '#aee7ff'
      : isStunned
        ? '#ddddff'
        : isShocked
          ? '#fff066'
          : isBurning
            ? '#ff8a3a'
            : isPoisoned
              ? '#a3ff66'
              : null
    const isBoss = !!world.boss && world.boss.enemyId === e.id
    // Boss enemy.kind is set to a fallback EnemyKind (e.g. 'tai_cheung') by
    // createBossEnemy. The actual boss key is on world.boss.kind — use that
    // to look up the sprite, otherwise we 404 and fall back to a coloured circle.
    const sprite = isBoss && world.boss
      ? getBossSprite(world.boss.kind)
      : getEnemySprite(e.kind)
    if (sprite) {
      const target = e.radius * (isBoss ? 4.6 : 3.0)
      const aw = sprite.naturalWidth || 1
      const ah = sprite.naturalHeight || 1
      const scale = target / Math.max(aw, ah)
      const dw = aw * scale
      const dh = ah * scale
      ctx.save()
      ctx.shadowColor = isShocked ? '#fff066' : arch.color
      ctx.shadowBlur = isShocked ? 14 : 6
      const faceLeft = e.vel.x < -0.05
      if (faceLeft) {
        ctx.translate(e.pos.x, e.pos.y)
        ctx.scale(-1, 1)
        ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh)
      } else {
        ctx.drawImage(sprite, e.pos.x - dw / 2, e.pos.y - dh / 2, dw, dh)
      }
      ctx.shadowBlur = 0
      ctx.restore()
      if (statusTint) {
        // Status glow ring around sprite — globalCompositeOperation 'source-atop'
        // doesn't work well over an already-opaque canvas (paints solid blocks).
        // A colored stroked ring is unambiguous and cheap.
        ctx.save()
        ctx.strokeStyle = statusTint
        ctx.shadowColor = statusTint
        ctx.shadowBlur = 14
        ctx.globalAlpha = 0.85
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(e.pos.x, e.pos.y, e.radius * 1.3, 0, Math.PI * 2)
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
        ctx.restore()
      }
    } else {
      ctx.fillStyle = statusTint ?? arch.color
      ctx.strokeStyle = '#0d0a16'
      ctx.lineWidth = 2
      ctx.shadowColor = isShocked ? '#fff066' : arch.color
      ctx.shadowBlur = isShocked ? 14 : 8
      ctx.beginPath()
      ctx.arc(e.pos.x, e.pos.y, e.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    if (isBleeding && e.bleedStacks > 0) {
      ctx.fillStyle = '#ff2050'
      for (let i = 0; i < e.bleedStacks; i += 1) {
        const a = (i / 5) * Math.PI * 2
        const dx = Math.cos(a) * (e.radius + 4)
        const dy = Math.sin(a) * (e.radius + 4)
        ctx.beginPath()
        ctx.arc(e.pos.x + dx, e.pos.y + dy, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    if (isStunned) {
      ctx.strokeStyle = '#ddddff'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(e.pos.x, e.pos.y, e.radius + 5, 0, Math.PI * 2)
      ctx.stroke()
    }

    if (e.hp < e.maxHp) {
      const w = e.radius * 2
      const x = e.pos.x - e.radius
      const y = e.pos.y - e.radius - 8
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(x, y, w, 4)
      ctx.fillStyle = '#ff5070'
      ctx.fillRect(x, y, w * (e.hp / e.maxHp), 4)
    }
  }
}

function drawProjectiles(ctx: CanvasRenderingContext2D, world: World) {
  for (const k of world.projectiles) {
    const a = Math.atan2(k.vel.y, k.vel.x)
    ctx.save()
    ctx.translate(k.pos.x, k.pos.y)
    ctx.rotate(a)
    if (!k.fromPlayer) {
      // Enemy projectile — red threat colour, slightly smaller
      const isBullet = k.enemyFlavor === 'bullet'
      ctx.shadowColor = '#ff3a4a'
      ctx.shadowBlur = 14
      ctx.fillStyle = isBullet ? '#ffd16a' : '#ff5070'
      if (isBullet) {
        // small round bullet
        ctx.beginPath()
        ctx.arc(0, 0, KNIFE_RADIUS * 0.7, 0, Math.PI * 2)
        ctx.fill()
        // streak
        ctx.fillStyle = 'rgba(255,209,106,0.55)'
        ctx.fillRect(-KNIFE_RADIUS * 1.6, -1, KNIFE_RADIUS * 1.6, 2)
      } else {
        // red throwing knife (smaller silhouette)
        ctx.beginPath()
        ctx.moveTo(KNIFE_RADIUS * 1.2, 0)
        ctx.lineTo(-KNIFE_RADIUS * 0.8, KNIFE_RADIUS * 0.45)
        ctx.lineTo(-KNIFE_RADIUS * 0.8, -KNIFE_RADIUS * 0.45)
        ctx.closePath()
        ctx.fill()
      }
      ctx.shadowBlur = 0
      ctx.restore()
      continue
    }
    ctx.shadowColor = k.isCrit ? NEON_GOLD : NEON_PRIMARY
    ctx.shadowBlur = 12
    ctx.fillStyle = k.isCrit ? NEON_GOLD : '#ffffff'
    ctx.beginPath()
    ctx.moveTo(KNIFE_RADIUS * 1.6, 0)
    ctx.lineTo(-KNIFE_RADIUS, KNIFE_RADIUS * 0.55)
    ctx.lineTo(-KNIFE_RADIUS, -KNIFE_RADIUS * 0.55)
    ctx.closePath()
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.restore()
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, world: World) {
  for (const p of world.particles) {
    const t = 1 - p.age / p.ttl
    ctx.globalAlpha = Math.max(0, Math.min(1, t))
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.pos.x, p.pos.y, p.size * t, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function drawFloats(ctx: CanvasRenderingContext2D, world: World) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const f of world.floats) {
    const t = 1 - f.age / f.ttl
    ctx.globalAlpha = Math.max(0, Math.min(1, t))
    const isBigCrit = f.text === '劈！' || f.text === 'Hit!' || f.text === 'BOOM!'
    ctx.font = isBigCrit ? 'bold 30px "Noto Sans HK", sans-serif' : 'bold 16px "Noto Sans HK", sans-serif'
    ctx.shadowColor = f.color
    ctx.shadowBlur = isBigCrit ? 18 : 8
    ctx.fillStyle = f.color
    ctx.fillText(f.text, f.pos.x, f.pos.y)
    ctx.shadowBlur = 0
  }
  ctx.globalAlpha = 1
}


function drawTreasureBox(ctx: CanvasRenderingContext2D, world: World) {
  const room = world.currentRoom
  if (!room || room.kind !== 'treasure' || !room.treasureBox) return
  const box = room.treasureBox

  // ground halo + pulsing gold ring to attract player attention
  const pulse = 0.6 + 0.35 * Math.sin(world.time * 3.5)

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  ctx.beginPath()
  ctx.ellipse(box.pos.x, box.pos.y + box.radius - 2, box.radius * 1.0, box.radius * 0.4, 0, 0, Math.PI * 2)
  ctx.fill()

  if (!box.opened) {
    // attractor halo
    ctx.save()
    ctx.shadowColor = '#ffd16a'
    ctx.shadowBlur = 24
    ctx.strokeStyle = '#ffd16a'
    ctx.globalAlpha = 0.55 + pulse * 0.25
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(box.pos.x, box.pos.y, box.radius + 8 + pulse * 6, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.restore()
  }

  // box body
  const w = box.radius * 1.7
  const h = box.radius * 1.4
  const x = box.pos.x - w / 2
  const y = box.pos.y - h / 2
  // body gradient
  const grad = ctx.createLinearGradient(x, y, x, y + h)
  grad.addColorStop(0, box.opened ? '#5a3a08' : '#a8780a')
  grad.addColorStop(1, box.opened ? '#1a0f04' : '#4a2a04')
  ctx.fillStyle = grad
  ctx.fillRect(x, y, w, h)
  // gold trim
  ctx.fillStyle = '#ffd16a'
  ctx.fillRect(x, y, w, 3)
  ctx.fillRect(x, y + h - 3, w, 3)
  // outline
  ctx.strokeStyle = '#0a0608'
  ctx.lineWidth = 2
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)

  if (box.opened) {
    // open lid + glow inside
    ctx.fillStyle = 'rgba(255,209,106,0.55)'
    ctx.fillRect(x + 4, y + 5, w - 8, h / 2 - 5)
    ctx.shadowColor = '#ffd16a'
    ctx.shadowBlur = 16
    ctx.strokeStyle = '#ffd16a'
    ctx.lineWidth = 1.5
    ctx.strokeRect(x + 4, y + 5, w - 8, h / 2 - 5)
    ctx.shadowBlur = 0
  } else {
    // gold lock
    ctx.fillStyle = '#ffce5a'
    ctx.fillRect(box.pos.x - 4, box.pos.y - 5, 8, 10)
    ctx.fillStyle = '#7a4a0a'
    ctx.fillRect(box.pos.x - 1.5, box.pos.y - 1.5, 3, 4)
  }
}

function drawHud(ctx: CanvasRenderingContext2D, world: World, W: number, _H: number) {
  const p = world.player
  const floor = FLOORS[FLOOR_ORDER[world.floorIndex]] ?? FLOORS.mong_kok

  const padX = 18
  const padY = 16
  const barW = 220
  const barH = 14
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.fillRect(padX - 4, padY - 4, barW + 8, barH + 8)
  ctx.fillStyle = '#3a0a14'
  ctx.fillRect(padX, padY, barW, barH)
  const ratio = p.stats.maxHp > 0 ? p.stats.hp / p.stats.maxHp : 0
  const grad = ctx.createLinearGradient(padX, padY, padX + barW, padY)
  grad.addColorStop(0, '#ff3a4a')
  grad.addColorStop(1, '#ffd16a')
  ctx.fillStyle = grad
  ctx.fillRect(padX, padY, barW * ratio, barH)
  ctx.fillStyle = '#fff'
  ctx.font = '12px "JetBrains Mono", monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(`HP ${Math.round(p.stats.hp)} / ${p.stats.maxHp}`, padX, padY + barH + 4)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 16px "Noto Sans HK", sans-serif'
  ctx.shadowColor = floor.accent
  ctx.shadowBlur = 14
  ctx.fillText(`${floor.displayName}  ${world.roomIndex + 1} / 15`, W - padX, padY)
  ctx.shadowBlur = 0

  ctx.fillStyle = '#aaa'
  ctx.font = '11px "JetBrains Mono", monospace'
  ctx.fillText(`江湖地位 ${world.reputation}   $${world.coins}   擊殺 ${world.kills}`, W - padX, padY + 22)

  // Bottom-left: character name + active skill levels (so player sees their build)
  const charDef = CHARACTERS[p.characterKey]
  if (charDef) {
    const baseY = _H - 16
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.fillStyle = floor.accent
    ctx.font = 'bold 13px "Noto Sans HK", sans-serif'
    ctx.shadowColor = '#000'
    ctx.shadowBlur = 4
    ctx.fillText(`${charDef.displayName}  ·  ${charDef.classType}`, padX, baseY)

    // Skill chips: render top 6 active skills with level
    const skills = Object.entries(p.skillLevels)
      .filter(([, lv]) => (lv ?? 0) > 0)
      .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
      .slice(0, 6)
    ctx.font = '11px "JetBrains Mono", monospace'
    ctx.fillStyle = '#fff'
    let cx = padX
    const chipY = baseY - 18
    for (const [key, lv] of skills) {
      const sk = SKILLS[key as keyof typeof SKILLS]
      const label = `${sk?.name ?? key} ${lv}`
      const tw = ctx.measureText(label).width + 10
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(cx, chipY - 12, tw, 16)
      ctx.fillStyle = '#ffd16a'
      ctx.fillText(label, cx + 5, chipY)
      cx += tw + 4
    }
    ctx.shadowBlur = 0
  }
}

function drawBoss(ctx: CanvasRenderingContext2D, world: World) {
  if (!world.boss) return
  const boss = world.enemies.find((e) => e.id === world.boss?.enemyId)
  if (!boss) return
  const def = BOSSES[world.boss.kind]

  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.beginPath()
  ctx.ellipse(boss.pos.x, boss.pos.y + boss.radius, boss.radius * 1.1, boss.radius * 0.45, 0, 0, Math.PI * 2)
  ctx.fill()

  if (world.boss && world.boss.windupTimer > 0) {
    const t = world.boss.windupTimer
    ctx.strokeStyle = def.accent
    ctx.lineWidth = 3
    ctx.shadowColor = def.accent
    ctx.shadowBlur = 22
    ctx.beginPath()
    ctx.arc(boss.pos.x, boss.pos.y, boss.radius + 10 + Math.sin(t * 18) * 4, 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 0
  }

  // Sprite is already drawn by drawEnemies (boss is in world.enemies). Only
  // draw the procedural circle fallback if the sprite hasn't loaded yet.
  if (!getBossSprite(world.boss.kind)) {
    ctx.shadowColor = def.color
    ctx.shadowBlur = 18
    ctx.fillStyle = def.color
    ctx.strokeStyle = '#0a0810'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(boss.pos.x, boss.pos.y, boss.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.shadowBlur = 0

    ctx.fillStyle = def.accent
    ctx.beginPath()
    ctx.moveTo(boss.pos.x - boss.radius * 0.6, boss.pos.y - boss.radius * 0.5)
    ctx.lineTo(boss.pos.x - boss.radius * 0.3, boss.pos.y - boss.radius)
    ctx.lineTo(boss.pos.x, boss.pos.y - boss.radius * 0.55)
    ctx.lineTo(boss.pos.x + boss.radius * 0.3, boss.pos.y - boss.radius)
    ctx.lineTo(boss.pos.x + boss.radius * 0.6, boss.pos.y - boss.radius * 0.5)
    ctx.closePath()
    ctx.fill()
  }

  if (boss.freezeTimer > 0) {
    ctx.fillStyle = 'rgba(174,231,255,0.35)'
    ctx.beginPath()
    ctx.arc(boss.pos.x, boss.pos.y, boss.radius, 0, Math.PI * 2)
    ctx.fill()
  }

  const W = world.arena.w
  const barX = 60
  const barY = 56
  const barW = W - 120
  const barH = 16
  ctx.fillStyle = 'rgba(0,0,0,0.65)'
  ctx.fillRect(barX - 6, barY - 22, barW + 12, barH + 28)
  ctx.fillStyle = '#1a0608'
  ctx.fillRect(barX, barY, barW, barH)
  const ratio = boss.maxHp > 0 ? Math.max(0, boss.hp / boss.maxHp) : 0
  const grad = ctx.createLinearGradient(barX, barY, barX + barW, barY)
  grad.addColorStop(0, '#ff2050')
  grad.addColorStop(1, def.accent)
  ctx.fillStyle = grad
  ctx.fillRect(barX, barY, barW * ratio, barH)
  ctx.strokeStyle = '#ffd16a'
  ctx.lineWidth = 1
  ctx.strokeRect(barX + 0.5, barY + 0.5, barW - 1, barH - 1)
  ctx.fillStyle = '#ffd16a'
  ctx.font = 'bold 14px "Noto Sans HK", sans-serif'
  ctx.textAlign = 'center'
  ctx.shadowColor = '#000'
  ctx.shadowBlur = 4
  ctx.fillText(def.displayName + '  ·  ' + def.english, barX + barW / 2, barY - 6)
  ctx.shadowBlur = 0
  ctx.textAlign = 'right'
  ctx.fillStyle = '#fff'
  ctx.font = '11px "JetBrains Mono", monospace'
  ctx.fillText(Math.round(boss.hp) + ' / ' + boss.maxHp, barX + barW - 4, barY + barH - 3)
}
