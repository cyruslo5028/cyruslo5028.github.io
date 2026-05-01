// Audio system: WebAudio synth SFX (procedural fallback) + optional file-based
// SFX loaded from /audio/sfx/{name}.mp3, plus BGM cross-fade.
//
// Design:
//  - Procedural synth always works (no asset deps). If the corresponding mp3
//    file is missing on first load, we silently fall back to synth.
//  - SFX files (when present) are decoded into AudioBuffer once and reused
//    via BufferSource for low-latency replay.
//  - BGM uses a separate HTMLAudioElement pair so it survives suspend/resume
//    cleanly and supports linear cross-fade between tracks.

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let sfxGain: GainNode | null = null
let muted = false
let volume = 0.16
let bgmVolume = 0.32
let bgmMuted = false

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (ctx) return ctx
  const w = window as typeof window & { webkitAudioContext?: typeof AudioContext }
  const Ctor = window.AudioContext ?? w.webkitAudioContext
  if (!Ctor) return null
  ctx = new Ctor()
  masterGain = ctx.createGain()
  masterGain.gain.value = muted ? 0 : volume
  masterGain.connect(ctx.destination)
  sfxGain = ctx.createGain()
  sfxGain.gain.value = 1
  sfxGain.connect(masterGain)
  return ctx
}

export function setMuted(m: boolean) {
  muted = m
  if (masterGain) masterGain.gain.value = muted ? 0 : volume
}
export function isMuted() { return muted }

export function setVolume(v: number) {
  volume = Math.max(0, Math.min(1, v))
  if (masterGain && !muted) masterGain.gain.value = volume
}

export async function resumeAudio() {
  const c = ensureCtx()
  if (!c) return
  if (c.state === 'suspended') await c.resume()
}

// ===== Procedural synth helpers =====

function tone(freq: number, dur: number, type: OscillatorType = 'square', startGain = 0.5) {
  const c = ensureCtx()
  if (!c || !sfxGain) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime)
  g.gain.setValueAtTime(startGain, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
  osc.connect(g)
  g.connect(sfxGain)
  osc.start()
  osc.stop(c.currentTime + dur)
}

function noise(dur: number, startGain = 0.4, filterFreq = 1200) {
  const c = ensureCtx()
  if (!c || !sfxGain) return
  const buffer = c.createBuffer(1, c.sampleRate * dur, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buffer
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = filterFreq
  const g = c.createGain()
  g.gain.setValueAtTime(startGain, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
  src.connect(filter)
  filter.connect(g)
  g.connect(sfxGain)
  src.start()
  src.stop(c.currentTime + dur)
}

function pitched(start: number, end: number, dur: number, type: OscillatorType = 'sawtooth', startGain = 0.4) {
  const c = ensureCtx()
  if (!c || !sfxGain) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(start, c.currentTime)
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, end), c.currentTime + dur)
  g.gain.setValueAtTime(startGain, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
  osc.connect(g)
  g.connect(sfxGain)
  osc.start()
  osc.stop(c.currentTime + dur)
}

// ===== Synth SFX bank =====

const SYNTH_SFX = {
  shoot() { pitched(720, 360, 0.07, 'square', 0.18) },
  hit() { tone(420, 0.09, 'square', 0.15); noise(0.08, 0.12, 1800) },
  crit() { tone(1100, 0.10, 'square', 0.20); pitched(1400, 700, 0.18, 'sawtooth', 0.22) },
  enemyDeath() { pitched(540, 90, 0.22, 'sawtooth', 0.18); noise(0.18, 0.18, 900) },
  playerHurt() { pitched(280, 140, 0.18, 'sawtooth', 0.32); noise(0.10, 0.18, 600) },
  shield() { tone(880, 0.08, 'sine', 0.20); tone(1320, 0.10, 'sine', 0.16) },
  pickCard() { tone(660, 0.06, 'sine', 0.20); tone(990, 0.08, 'sine', 0.18) },
  roomClear() { pitched(440, 880, 0.30, 'sine', 0.18); pitched(660, 1320, 0.28, 'sine', 0.14) },
  bossSpawn() { pitched(110, 220, 0.35, 'sawtooth', 0.30); noise(0.4, 0.25, 400) },
  bossDeath() { pitched(220, 80, 0.6, 'sawtooth', 0.30); noise(0.6, 0.32, 600) },
  explode() { pitched(160, 60, 0.35, 'sawtooth', 0.32); noise(0.32, 0.28, 700) },
  freeze() { tone(2200, 0.18, 'sine', 0.12); tone(1700, 0.20, 'sine', 0.08) },
  thunder() { noise(0.05, 0.30, 4200); pitched(2400, 800, 0.10, 'square', 0.16) },
}

export type SfxName = keyof typeof SYNTH_SFX

// ===== File-based SFX cache =====

const sfxBuffers: Partial<Record<SfxName, AudioBuffer>> = {}
const sfxLoadAttempted: Partial<Record<SfxName, boolean>> = {}

const SFX_FILE_MAP: Record<SfxName, string> = {
  shoot: '/audio/sfx/shoot.mp3',
  hit: '/audio/sfx/hit.mp3',
  crit: '/audio/sfx/crit.mp3',
  enemyDeath: '/audio/sfx/enemy_death.mp3',
  playerHurt: '/audio/sfx/player_hurt.mp3',
  shield: '/audio/sfx/shield.mp3',
  pickCard: '/audio/sfx/pick_card.mp3',
  roomClear: '/audio/sfx/room_clear.mp3',
  bossSpawn: '/audio/sfx/boss_spawn.mp3',
  bossDeath: '/audio/sfx/boss_death.mp3',
  explode: '/audio/sfx/explode.mp3',
  freeze: '/audio/sfx/freeze.mp3',
  thunder: '/audio/sfx/thunder.mp3',
}

async function tryLoadSfx(name: SfxName): Promise<void> {
  if (sfxLoadAttempted[name]) return
  sfxLoadAttempted[name] = true
  const c = ensureCtx()
  if (!c) return
  try {
    const url = SFX_FILE_MAP[name]
    const resp = await fetch(url)
    if (!resp.ok) return
    const ab = await resp.arrayBuffer()
    const buf = await c.decodeAudioData(ab)
    sfxBuffers[name] = buf
  } catch {
    // Silent fallback: synth still works.
  }
}

export function preloadSfx(): void {
  ;(Object.keys(SFX_FILE_MAP) as SfxName[]).forEach((k) => { void tryLoadSfx(k) })
}

function playBuffer(buf: AudioBuffer, gainScale = 1): void {
  const c = ensureCtx()
  if (!c || !sfxGain) return
  const src = c.createBufferSource()
  src.buffer = buf
  const g = c.createGain()
  g.gain.value = gainScale
  src.connect(g)
  g.connect(sfxGain)
  src.start()
}

export function play(name: SfxName): void {
  try {
    const buf = sfxBuffers[name]
    if (buf) {
      playBuffer(buf)
      return
    }
    SYNTH_SFX[name]()
  } catch {
    /* noop */
  }
}

export const SFX = SYNTH_SFX

// ===== BGM (HTMLAudioElement cross-fade) =====

export type BgmTrack =
  | 'menu'
  | 'mong_kok'
  | 'causeway_bay'
  | 'yau_ma_tei'
  | 'temple_street'
  | 'boss'

const BGM_FILE_MAP: Record<BgmTrack, string> = {
  menu: '/audio/bgm/menu.mp3',
  mong_kok: '/audio/bgm/mong_kok.mp3',
  causeway_bay: '/audio/bgm/causeway_bay.mp3',
  yau_ma_tei: '/audio/bgm/yau_ma_tei.mp3',
  temple_street: '/audio/bgm/temple_street.mp3',
  boss: '/audio/bgm/boss.mp3',
}

let currentBgm: { track: BgmTrack; el: HTMLAudioElement } | null = null
let fadingOut: HTMLAudioElement | null = null
const bgmExistChecked: Partial<Record<BgmTrack, boolean>> = {}

function fadeAudio(el: HTMLAudioElement, from: number, to: number, ms: number, onDone?: () => void) {
  const start = performance.now()
  const tick = () => {
    const t = Math.min(1, (performance.now() - start) / ms)
    const v = from + (to - from) * t
    try { el.volume = Math.max(0, Math.min(1, v)) } catch { /* */ }
    if (t < 1) requestAnimationFrame(tick)
    else onDone?.()
  }
  tick()
}

export async function playMusic(track: BgmTrack, fadeMs = 1500): Promise<void> {
  if (typeof window === 'undefined') return
  if (currentBgm && currentBgm.track === track) return

  if (!bgmExistChecked[track]) {
    bgmExistChecked[track] = true
    try {
      const head = await fetch(BGM_FILE_MAP[track], { method: 'HEAD' })
      if (!head.ok) return
    } catch {
      return
    }
  }

  const next = new Audio(BGM_FILE_MAP[track])
  next.loop = true
  next.preload = 'auto'
  next.volume = 0
  try {
    await next.play()
  } catch {
    return
  }
  fadeAudio(next, 0, bgmMuted ? 0 : bgmVolume, fadeMs)

  if (currentBgm) {
    const old = currentBgm.el
    if (fadingOut) { try { fadingOut.pause() } catch { /* */ } }
    fadingOut = old
    fadeAudio(old, old.volume, 0, fadeMs, () => {
      try { old.pause() } catch { /* */ }
      if (fadingOut === old) fadingOut = null
    })
  }

  currentBgm = { track, el: next }
}

export function stopMusic(fadeMs = 800): void {
  if (!currentBgm) return
  const old = currentBgm.el
  currentBgm = null
  fadeAudio(old, old.volume, 0, fadeMs, () => {
    try { old.pause() } catch { /* */ }
  })
}

export function setBgmMuted(m: boolean): void {
  bgmMuted = m
  if (currentBgm) {
    fadeAudio(currentBgm.el, currentBgm.el.volume, m ? 0 : bgmVolume, 200)
  }
}
export function isBgmMuted(): boolean { return bgmMuted }

export function setBgmVolume(v: number): void {
  bgmVolume = Math.max(0, Math.min(1, v))
  if (currentBgm && !bgmMuted) {
    fadeAudio(currentBgm.el, currentBgm.el.volume, bgmVolume, 120)
  }
}
