import type { CharacterDef, CharacterKey, Rarity } from '../types'
import { CHARACTERS } from './characters'

// Price by rarity. chan_ho_nam (default starter) is free.
export const RARITY_PRICE: Record<Rarity, number> = {
  R: 200,
  SR: 800,
  SSR: 2500,
  XR: 8000,
}

const STORAGE_KEY = 'hkr_unlocks_v1'
const STARTER_KEYS: CharacterKey[] = ['chan_ho_nam']

export type UnlockSet = Set<CharacterKey>

export function unlockPrice(def: CharacterDef): number {
  if (STARTER_KEYS.includes(def.key)) return 0
  return RARITY_PRICE[def.rarity] ?? 1000
}

export function loadUnlocks(): UnlockSet {
  const set = new Set<CharacterKey>(STARTER_KEYS)
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const arr = JSON.parse(raw) as unknown
      if (Array.isArray(arr)) {
        for (const k of arr) {
          if (typeof k === 'string' && CHARACTERS[k as CharacterKey]) {
            set.add(k as CharacterKey)
          }
        }
      }
    }
  } catch { /* noop */ }
  return set
}

export function saveUnlocks(set: UnlockSet): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)))
  } catch { /* noop */ }
}

export function isUnlocked(set: UnlockSet, key: CharacterKey): boolean {
  return set.has(key)
}
