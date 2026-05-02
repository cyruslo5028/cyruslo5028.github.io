// Image asset loader + Canvas2D pattern cache.
// All assets are optional — if a file 404s, render functions fall back
// to procedural drawing so the game never breaks on missing art.

import { FLOOR_ORDER } from '../content/biomes'
import type { CharacterKey, FloorKey } from '../types'

type AssetState = 'pending' | 'ready' | 'failed'

type ImageAsset = {
  state: AssetState
  img: HTMLImageElement
  pattern?: CanvasPattern | null
}

const cache = new Map<string, ImageAsset>()

function load(url: string): ImageAsset {
  const existing = cache.get(url)
  if (existing) return existing
  const img = new Image()
  const asset: ImageAsset = { state: 'pending', img }
  img.onload = () => { asset.state = 'ready' }
  img.onerror = () => { asset.state = 'failed' }
  img.src = url
  cache.set(url, asset)
  return asset
}

// === Floor textures ===
export function getFloorPattern(ctx: CanvasRenderingContext2D, floor: FloorKey): CanvasPattern | null {
  const url = `/maps/floors/${floor}.webp`
  const asset = load(url)
  if (asset.state !== 'ready') return null
  if (asset.pattern) return asset.pattern
  const p = ctx.createPattern(asset.img, 'repeat')
  asset.pattern = p
  return p
}

export function getFloorImageReady(floor: FloorKey): boolean {
  return load(`/maps/floors/${floor}.webp`).state === 'ready'
}

export function preloadAllFloors(): void {
  for (const k of FLOOR_ORDER) load(`/maps/floors/${k}.webp`)
}

// === Wall sprites ===
const WALL_KEYS = ['crates', 'bin', 'stall', 'mahjong', 'vending'] as const
type WallKey = typeof WALL_KEYS[number]

export function getWallSprite(seed: number): HTMLImageElement | null {
  const idx = ((seed * 2654435761) >>> 0) % WALL_KEYS.length
  const k: WallKey = WALL_KEYS[idx]
  const asset = load(`/maps/walls/${k}.webp`)
  return asset.state === 'ready' ? asset.img : null
}

export function preloadAllWalls(): void {
  for (const k of WALL_KEYS) load(`/maps/walls/${k}.webp`)
}

// === Boss arena backdrops ===
export function getBossBackdrop(floor: FloorKey): HTMLImageElement | null {
  const asset = load(`/maps/bosses/${floor}_boss.webp`)
  return asset.state === 'ready' ? asset.img : null
}

export function preloadAllBosses(): void {
  for (const k of FLOOR_ORDER) load(`/maps/bosses/${k}_boss.webp`)
}

// === Character / enemy / boss sprites (front-facing chibi, matches portraits) ===
// Player uses the existing /portraits/{character}.png images directly so the
// in-game body matches whichever character the player picked in the roster.

const ENEMY_KEYS = ['maa_zai', 'tai_cheung', 'wu_ngaa', 'dau_hou', 'ging_caat'] as const
const BOSS_KEYS = ['mong_kok_boss', 'causeway_bay_boss', 'yau_ma_tei_boss', 'tai_tin_yi_final'] as const

const PORTRAIT_CHARS: CharacterKey[] = [
  'chan_ho_nam', 'shan_gai', 'wu_ngaa_player', 'liang_kun', 'tai_tin_yi',
  'wong_mou_fu', 'siu_min_fu', 'taai_zi', 'daai_lou_b', 'fung_wan',
]

// Map CharacterKey → portrait filename slug. Defaults to the key itself
// except for `wu_ngaa_player` whose file lives at /portraits/wu_ngaa.png.
const PORTRAIT_FILE_SLUG: Partial<Record<CharacterKey, string>> = {
  wu_ngaa_player: 'wu_ngaa',
}

function portraitSlug(key: CharacterKey): string {
  return PORTRAIT_FILE_SLUG[key] ?? key
}

export function getPlayerSprite(characterKey: CharacterKey): HTMLImageElement | null {
  const a = load(`/portraits/${portraitSlug(characterKey)}.webp`)
  return a.state === 'ready' ? a.img : null
}

export function getEnemySprite(kind: string): HTMLImageElement | null {
  const a = load(`/sprites/enemy_${kind}.webp`)
  return a.state === 'ready' ? a.img : null
}

export function getBossSprite(kind: string): HTMLImageElement | null {
  const a = load(`/sprites/boss_${kind}.webp`)
  return a.state === 'ready' ? a.img : null
}

export function preloadAllSprites(): void {
  for (const k of PORTRAIT_CHARS) load(`/portraits/${portraitSlug(k)}.webp`)
  for (const k of ENEMY_KEYS) load(`/sprites/enemy_${k}.webp`)
  for (const k of BOSS_KEYS) load(`/sprites/boss_${k}.webp`)
}

// === Bulk preload — call once on game start ===
export function preloadAllMaps(): void {
  preloadAllFloors()
  preloadAllWalls()
  preloadAllBosses()
  preloadAllSprites()
}
