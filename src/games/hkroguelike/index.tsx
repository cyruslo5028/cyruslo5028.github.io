import React, { useEffect, useRef, useState } from 'react'
import { ARENA_HEIGHT, ARENA_WIDTH } from './constants'
import { createInput } from './core/Input'
import { startGameLoop } from './core/GameLoop'
import { createRng, createWorld } from './core/World'
import type { World } from './core/World'
import { damagePlayer, updatePlayer } from './entities/Player'
import { updateProjectiles } from './entities/Projectile'
import { updateEnemies } from './entities/Enemy'
import { createBossEnemy, updateBoss } from './entities/Boss'
import { FLOOR_BOSS } from './content/bosses'
import { FLOORS, FLOOR_ORDER } from './content/biomes'
import { decayCamera, updateParticles } from './systems/movement'
import { buildRoom, spawnWave } from './systems/spawn'
import { renderFrame } from './render/draw'
import { preloadAllMaps } from './render/assets'
import { rollSkillChoices, SKILLS, applySkill } from './content/skills'
import type { CharacterKey, SkillKey } from './types'
import { CharacterRoster } from './ui/CharacterRoster'
import { play, resumeAudio, preloadSfx, playMusic, stopMusic } from './core/Audio'
import { MetaTree } from './ui/MetaTree'
import { loadMeta, saveMeta, type MetaNodeKey, META_NODES } from './content/metaTree'
import { loadUnlocks, saveUnlocks, unlockPrice } from './content/unlocks'
import { CHARACTERS } from './content/characters'

void React

// Kick off map asset preload as early as possible so floor pattern + boss backdrop
// are likely cached by the time the player enters their first room.
if (typeof window !== 'undefined') {
  preloadAllMaps()
  // Preload SFX mp3s if user has dropped them under public/audio/sfx/.
  // Missing files silently fall back to procedural synth — no error.
  preloadSfx()
}

const REPUTATION_KEY = 'hkr_reputation_total'
const COIN_KEY = 'hkr_coins_total'

function loadTotalReputation(): number {
  try {
    const v = Number.parseInt(localStorage.getItem(REPUTATION_KEY) ?? '0', 10)
    return Number.isFinite(v) && v > 0 ? v : 0
  } catch { return 0 }
}

function saveTotalReputation(v: number) {
  try { localStorage.setItem(REPUTATION_KEY, String(v)) } catch { /* noop */ }
}

function loadTotalCoins(): number {
  try {
    const v = Number.parseInt(localStorage.getItem(COIN_KEY) ?? '0', 10)
    return Number.isFinite(v) && v > 0 ? v : 0
  } catch { return 0 }
}

function saveTotalCoins(v: number) {
  try { localStorage.setItem(COIN_KEY, String(v)) } catch { /* noop */ }
}

export function HKRoguelikeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const worldRef = useRef<World | null>(null)
  const [, force] = useState(0)
  const [scene, setScene] = useState<World['scene']>('menu')
  const [choices, setChoices] = useState<SkillKey[] | null>(null)
  const [character, setCharacter] = useState<CharacterKey>('chan_ho_nam')
  const [totalReputation, setTotalReputation] = useState<number>(() => loadTotalReputation())
  const [coins, setCoins] = useState<number>(() => loadTotalCoins())
  const [unlockedSet, setUnlockedSet] = useState(() => loadUnlocks())
  const [metaState, setMetaState] = useState(() => loadMeta())

  useEffect(() => {
    if (scene === 'menu') return
    const canvas = canvasRef.current
    const root = rootRef.current
    if (!canvas || !root) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const world = createWorld(character, metaState)
    worldRef.current = world

    const input = createInput()
    input.attach(root, canvas, () => world.player.pos, world.arena.w, world.arena.h)

    enterRoom(world, 0, 0)
    setScene(world.scene)

    const loop = startGameLoop({
      update(dt) {
        if (input.consumePause()) {
          if (world.scene === 'playing') world.scene = 'paused'
          else if (world.scene === 'paused') world.scene = 'playing'
          setScene(world.scene)
        }

        if (world.scene !== 'playing') return
        if (world.hitStop > 0) { world.hitStop -= dt; return }

        input._update()
        world.time += dt
        if (world.roomEntryDelay > 0) world.roomEntryDelay -= dt
        updatePlayer(world, dt, input.axes)
        updateEnemies(world, dt)
        updateBoss(world, dt)
        updateProjectiles(world, dt)
        updateParticles(world, dt)
        decayCamera(world, dt)

        const room = world.currentRoom
        if (room && !room.cleared && world.enemies.length === 0 && world.roomEntryDelay <= 0) {
          if (room.spawnGroups.length > 0) {
            const next = room.spawnGroups.shift()
            if (next) spawnWave(world, next)
          } else {
            room.cleared = true
            const floorIdx = world.floorIndex
            const roomIdx = world.roomIndex
            const isBossRoom = room.kind === 'boss'
            const isCombatRoom = room.kind === 'combat' || isBossRoom
            const bonus = isBossRoom
              ? 50 + floorIdx * 25
              : 5 + Math.floor((floorIdx * 6 + roomIdx * 0.6))
            world.coins += bonus
            world.floats.push({
              pos: { x: world.player.pos.x, y: world.player.pos.y - 20 },
              text: `+$${bonus}`,
              color: '#ffce5a',
              age: 0,
              ttl: 1.2,
              vy: -38,
            })
            play('roomClear')

            if (isCombatRoom) {
              // Combat clear → reward card pick
              const rng = createRng((world.rngSeed ^ (world.roomIndex * 9301)) >>> 0)
              const picks = rollSkillChoices(world.player.skillLevels, rng, 3)
              world.pendingSkillChoices = picks
              world.scene = 'cardSelect'
              setChoices(picks)
              setScene('cardSelect')
            } else if (room.kind === 'treasure') {
              // Treasure room — DO NOT auto-advance. Player must walk to the
              // treasure box. Box-touch handler below will trigger card pick.
            } else {
              // Other reward rooms (rest / shrine / shop): pure passive — auto-advance.
              world.autoAdvanceTimer = 1.4
            }
          }
        }

        // Treasure-box interaction (only fires once per room)
        if (room && room.kind === 'treasure' && room.treasureBox && !room.treasureBox.opened) {
          const box = room.treasureBox
          const dx = world.player.pos.x - box.pos.x
          const dy = world.player.pos.y - box.pos.y
          const touchR = box.radius + 18
          if (dx * dx + dy * dy <= touchR * touchR) {
            box.opened = true
            play('pickCard')
            world.floats.push({
              pos: { x: box.pos.x, y: box.pos.y - 24 },
              text: '寶箱開啟',
              color: '#ffd16a',
              age: 0,
              ttl: 1.4,
              vy: -36,
            })
            const rng = createRng((world.rngSeed ^ ((world.roomIndex + 1) * 31337)) >>> 0)
            const picks = rollSkillChoices(world.player.skillLevels, rng, 3)
            world.pendingSkillChoices = picks
            world.scene = 'cardSelect'
            setChoices(picks)
            setScene('cardSelect')
          }
        }

        // Auto-advance handler for non-combat rooms
        if (world.autoAdvanceTimer > 0) {
          world.autoAdvanceTimer -= dt
          if (world.autoAdvanceTimer <= 0) {
            world.autoAdvanceTimer = 0
            advanceRoom(world)
            setScene(world.scene)
          }
        }

        // damagePlayer can flip world.scene mid-tick; cast to read raw value.
        const sceneNow = world.scene as World['scene']
        if (sceneNow === 'gameOver' && scene !== 'gameOver') {
          setScene('gameOver')
        }

        force((n) => (n + 1) & 0xffff)
      },
      render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        renderFrame(ctx, world)
      },
    })

    return () => {
      loop.stop()
      input.detach()
      stopMusic(400)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene === 'menu' ? '' : character])

  const onPickSkill = (key: SkillKey) => {
    const world = worldRef.current
    if (!world) return
    const have = world.player.skillLevels[key] ?? 0
    const newLevel = have + 1
    world.player.skillLevels[key] = newLevel
    play('pickCard')
    applySkill(world.player.stats, key, 1)
    world.pendingSkillChoices = null
    setChoices(null)

    advanceRoom(world)
    setScene(world.scene)
  }

  const onRestart = () => {
    const w = worldRef.current
    if (w) {
      const newTotal = totalReputation + w.reputation
      setTotalReputation(newTotal)
      saveTotalReputation(newTotal)
      const newCoins = coins + w.coins
      setCoins(newCoins)
      saveTotalCoins(newCoins)
    }
    void playMusic('menu')
    setScene('menu')
  }

  const onUnlockCharacter = (key: keyof typeof CHARACTERS) => {
    if (unlockedSet.has(key)) return
    const def = CHARACTERS[key]
    const price = unlockPrice(def)
    if (coins < price) return
    const next = new Set(unlockedSet); next.add(key)
    setUnlockedSet(next)
    saveUnlocks(next)
    const newCoins = coins - price
    setCoins(newCoins)
    saveTotalCoins(newCoins)
    play('pickCard')
  }

  const onPurchaseNode = (key: MetaNodeKey, cost: number) => {
    if (totalReputation < cost) return
    const next = { ...metaState, [key]: true }
    setMetaState(next)
    saveMeta(next)
    const newRep = totalReputation - cost
    setTotalReputation(newRep)
    saveTotalReputation(newRep)
    void META_NODES
  }

  const world = worldRef.current
  if (scene === 'menu') {
    return (
      <div className="space-y-3">
        <div className="flex justify-end">
          <button
            onClick={() => setScene('metaTree')}
            className="rounded-lg border border-[#ffd16a] bg-gradient-to-b from-[#5a2a08] to-[#3a1208] px-4 py-2 text-sm font-bold text-[#ffd16a] hover:from-[#7a3a0a] hover:to-[#5a1a0a]"
          >
            升級樹
          </button>
        </div>
        <CharacterRoster
          reputation={totalReputation}
          coins={coins}
          selected={character}
          onSelect={setCharacter}
          onStartRun={() => { void resumeAudio(); setScene('playing') }}
          unlockedSet={unlockedSet}
          onUnlock={onUnlockCharacter}
        />
      </div>
    )
  }
  if (scene === 'metaTree') {
    return (
      <MetaTree
        reputation={totalReputation}
        state={metaState}
        onPurchase={onPurchaseNode}
        onClose={() => setScene('menu')}
      />
    )
  }
  return (
    <div
      ref={rootRef}
      className="relative mx-auto flex w-full items-center justify-center select-none"
      tabIndex={0}
      style={{ touchAction: 'none' }}
    >
      <canvas
        ref={canvasRef}
        width={ARENA_WIDTH}
        height={ARENA_HEIGHT}
        className="block w-full max-w-[960px] rounded-2xl border border-white/10 bg-black"
        style={{ aspectRatio: `${ARENA_WIDTH} / ${ARENA_HEIGHT}` }}
      />

      {scene === 'cardSelect' && choices && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="pointer-events-auto w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0c0a18]/95 p-6 shadow-[0_0_60px_rgba(255,79,216,0.25)]">
            <div className="text-xs uppercase tracking-[0.32em] text-text-secondary">劈完一輪 · 揀張牌</div>
            <h2 className="mt-1 text-2xl font-bold text-white">
              <span className="text-[#ff4fd8]">江湖</span>  搵嘽上身
            </h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {choices.map((k) => {
                const def = SKILLS[k]
                const have = world?.player.skillLevels[k] ?? 0
                return (
                  <button
                    key={k}
                    onClick={() => onPickSkill(k)}
                    className="group flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-[#ff4fd8]/60 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,79,216,0.35)]"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-white">{def.name}</span>
                      <span className="text-[10px] uppercase tracking-widest text-text-secondary">
                        Lv {have + 1}/{def.maxLevel}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary">{def.english} · {def.rarity}</div>
                    <div className="mt-1 text-sm text-text-primary/90">{def.description}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}


      {scene === 'victory' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-[#ffd16a] bg-gradient-to-b from-[#1a0c0c] to-[#3a1d08] p-7 text-center shadow-[0_0_60px_rgba(255,209,106,0.45)]">
            <div className="text-[11px] uppercase tracking-[0.42em] text-[#ffd16a]/80">通關</div>
            <h2 className="mt-2 text-4xl font-black text-white" style={{ textShadow: '0 2px 0 #4a1a08, 0 0 22px rgba(255,209,106,0.55)' }}>
              你贏咗 · CHAMPION
            </h2>
            <div className="mt-2 text-sm italic text-[#ffd16a]">「江湖路遠，我哋仲有得行。」</div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                <div className="text-[10px] uppercase tracking-widest text-white/50">江湖地位</div>
                <div className="mt-1 text-xl font-bold text-[#ffd16a]">+{world?.reputation ?? 0}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                <div className="text-[10px] uppercase tracking-widest text-white/50">擊殺</div>
                <div className="mt-1 text-xl font-bold text-white">{world?.kills ?? 0}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                <div className="text-[10px] uppercase tracking-widest text-white/50">收入</div>
                <div className="mt-1 text-xl font-bold text-[#ffce5a]">${world?.coins ?? 0}</div>
              </div>
            </div>
            <button
              onClick={onRestart}
              className="mt-6 rounded-xl border border-[#ffd16a] bg-gradient-to-b from-[#c4321a] to-[#7a1a08] px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_24px_rgba(255,80,40,0.55)] hover:from-[#e84a2a]"
            >
              收工返主選單
            </button>
          </div>
        </div>
      )}

      {scene === 'gameOver' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0a18]/95 p-6 text-center">
            <div className="text-xs uppercase tracking-[0.32em] text-text-secondary">中招了</div>
            <h2 className="mt-1 text-3xl font-bold text-white">陣亡 · GAME OVER</h2>
            <div className="mt-3 text-sm text-text-secondary">
              新增江湖地位：<span className="text-[#ffd16a]">+{world?.reputation ?? 0}</span> · 擊殺 {world?.kills ?? 0}
            </div>
            <button onClick={onRestart} className="mt-5 rounded-xl border border-white/10 bg-white/10 px-5 py-2 text-sm font-medium text-white hover:bg-white/15">
              返主選單
            </button>
          </div>
        </div>
      )}

      {scene === 'paused' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="rounded-xl border border-white/10 bg-[#0c0a18]/95 px-6 py-4 text-white">
            <div className="text-sm uppercase tracking-[0.32em] text-text-secondary">Paused</div>
            <div className="mt-1 text-xs text-text-secondary">按 Esc / P 繼續</div>
          </div>
        </div>
      )}
    </div>
  )
}

function enterRoom(world: World, floorIdx: number, roomIdx: number) {
  world.enemies.length = 0
  world.projectiles.length = 0
  world.particles.length = 0
  world.floats.length = 0
  world.floorIndex = floorIdx
  world.roomIndex = roomIdx
  const room = buildRoom(world, floorIdx, roomIdx)
  world.currentRoom = room
  world.walls = room.walls
  world.boss = null
  // Switch BGM per room. Boss rooms always play the boss track; non-boss rooms
  // play their floor's ambient track. Cross-fade is 1.5s default.
  const floorKeyForBgm = FLOOR_ORDER[floorIdx]
  if (room.kind === 'boss') {
    void playMusic('boss')
  } else {
    void playMusic(floorKeyForBgm)
  }
  if (room.kind === 'boss') {
    const floorKey = FLOOR_ORDER[floorIdx]
    const bossKind = FLOOR_BOSS[floorKey] ?? FLOOR_BOSS.mong_kok
    const bossEnemy = createBossEnemy(world, bossKind, world.arena.w / 2, 140)
    world.enemies.push(bossEnemy)
    world.floats.push({
      pos: { x: world.arena.w / 2, y: world.arena.h / 2 },
      text: FLOORS[floorKey].displayName + ' BOSS',
      color: FLOORS[floorKey].accent,
      age: 0,
      ttl: 1.6,
      vy: -34,
    })
  } else if (room.kind === 'rest') {
    // Rest room: heal 50% of missing HP
    const p = world.player
    const heal = Math.floor((p.stats.maxHp - p.stats.hp) * 0.5)
    if (heal > 0) {
      p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + heal)
      world.floats.push({
        pos: { x: world.arena.w / 2, y: world.arena.h / 2 },
        text: '休息   +' + heal + ' HP',
        color: '#93ff66',
        age: 0,
        ttl: 1.6,
        vy: -34,
      })
    } else {
      world.floats.push({
        pos: { x: world.arena.w / 2, y: world.arena.h / 2 },
        text: '休息   滿血',
        color: '#93ff66',
        age: 0,
        ttl: 1.6,
        vy: -34,
      })
    }
  } else if (room.kind === 'treasure') {
    world.floats.push({
      pos: { x: world.arena.w / 2, y: world.arena.h / 2 },
      text: '寶箱房   揀張靓牌',
      color: '#ffd16a',
      age: 0,
      ttl: 1.4,
      vy: -34,
    })
  } else if (room.kind === 'shrine') {
    // Shrine: small HP cost for buff
    const p = world.player
    const cost = Math.min(15, p.stats.hp - 1)
    if (cost > 0) p.stats.hp -= cost
    world.floats.push({
      pos: { x: world.arena.w / 2, y: world.arena.h / 2 },
      text: '神壇   -' + cost + ' HP   揀張勁牌',
      color: '#a45cff',
      age: 0,
      ttl: 1.6,
      vy: -34,
    })
  } else if (room.kind === 'shop') {
    world.floats.push({
      pos: { x: world.arena.w / 2, y: world.arena.h / 2 },
      text: '雜貨舗   揀張牌',
      color: '#36d6ff',
      age: 0,
      ttl: 1.4,
      vy: -34,
    })
  }
  if (room.spawnGroups.length > 0) {
    const first = room.spawnGroups.shift()
    if (first) spawnWave(world, first)
  }
  // Brief pause so the player sees the new room before any auto card pops up.
  // Combat rooms with spawned waves naturally have enemies blocking the trigger;
  // non-combat rooms (rest/treasure/shrine/shop) need this explicit delay.
  world.roomEntryDelay = room.spawnGroups.length === 0 && world.enemies.length === 0 ? 0.6 : 0
  world.scene = 'playing'
}

function advanceRoom(world: World) {
  const next = world.roomIndex + 1
  if (next >= 15) {
    const nextFloor = world.floorIndex + 1
    if (nextFloor >= 4) {
      world.scene = 'victory'
      return
    }
    enterRoom(world, nextFloor, 0)
  } else {
    enterRoom(world, world.floorIndex, next)
  }
}

void damagePlayer
