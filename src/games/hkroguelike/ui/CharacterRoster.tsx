import React, { useMemo, useState } from 'react'
import type { CharacterDef, CharacterKey, ClassType } from '../types'
import { CHARACTERS, ROSTER_ORDER } from '../content/characters'
import { SKILLS } from '../content/skills'
import { CharacterCard } from './CharacterCard'

void React


// Baseline stats — should match defaultStats() in core/World.ts.
const BASELINE_STATS: Record<string, number> = {
  maxHp: 100,
  speed: 230,
  damage: 14,
  attackRate: 2.4,
  critChance: 0.05,
  critMult: 1.5,
  range: 360,
  shieldMaxStacks: 0,
  lifesteal: 0,
  summonCount: 0,
  freezeChance: 0,
  fireChance: 0,
  poisonChance: 0,
  lightningChance: 0,
  bleedChance: 0,
  rageMultMax: 0,
}

const STAT_DISPLAY: Array<{ key: string; label: string; suffix?: string; isPercent?: boolean }> = [
  { key: 'maxHp', label: '血' },
  { key: 'speed', label: '速' },
  { key: 'damage', label: '攻' },
  { key: 'attackRate', label: '攻速', suffix: '/s' },
  { key: 'critChance', label: '暴擊', isPercent: true },
  { key: 'critMult', label: '暴擊倍' },
  { key: 'shieldMaxStacks', label: '盾' },
  { key: 'lifesteal', label: '飲血' },
  { key: 'summonCount', label: '召喚' },
  { key: 'freezeChance', label: '冰', isPercent: true },
  { key: 'fireChance', label: '火', isPercent: true },
  { key: 'lightningChance', label: '電', isPercent: true },
  { key: 'bleedChance', label: '血', isPercent: true },
  { key: 'rageMultMax', label: '紅雞', isPercent: true },
]

type FilterTab = 'all' | ClassType

const TABS: Array<{ key: FilterTab; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'attack', label: '攻擊型' },
  { key: 'defense', label: '防禦型' },
  { key: 'wisdom', label: '智力型' },
  { key: 'medic', label: '醫療型' },
  { key: 'support', label: '輔助型' },
]

type Props = {
  reputation: number
  coins: number
  selected: CharacterKey
  onSelect: (key: CharacterKey) => void
  onStartRun: () => void
  unlockedSet: Set<CharacterKey>
  onUnlock: (key: CharacterKey) => void
}

export function CharacterRoster({ reputation, coins, selected, onSelect, onStartRun, unlockedSet, onUnlock }: Props) {
  const [tab, setTab] = useState<FilterTab>('all')

  const characters = useMemo<CharacterDef[]>(() => {
    const all = ROSTER_ORDER.map((key) => CHARACTERS[key])
    if (tab === 'all') return all
    return all.filter((c) => c.classType === tab)
  }, [tab])

  const selectedDef = CHARACTERS[selected]

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#3a1d18] bg-[#1a0c0c] text-white shadow-[0_0_40px_rgba(180,40,30,0.20)]">
      {/* Header bar */}
      <div className="relative flex items-center justify-between px-4 py-2.5"
           style={{ background: 'linear-gradient(180deg,#3a1208 0%,#7a1a18 100%)', borderBottom: '1px solid #ffd16a55' }}>
        <div className="flex items-center gap-2.5">
          <DragonOrnament />
          <h2 className="text-lg font-bold tracking-wide text-[#ffd16a]" style={{ textShadow: '0 1px 0 #4a1a08' }}>
            角色清單
          </h2>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Resource icon="coin" value={coins} />
          <Resource icon="gem" value={reputation} />
          <Resource icon="energy" value="∞" />
        </div>
      </div>

      <div className="flex">
        {/* Side filter tabs */}
        <div className="flex w-16 flex-col border-r border-[#2a0e0e] bg-[#10080a] py-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`mx-1 my-0.5 rounded-md py-2 text-[12px] font-bold tracking-wide transition ${
                tab === t.key
                  ? 'bg-[#7a1a18] text-[#ffd16a] shadow-[inset_0_-2px_0_rgba(0,0,0,0.4)]'
                  : 'text-white/55 hover:bg-white/5 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Card grid */}
        <div className="flex-1 p-3">
          {characters.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/50">
              冇人喺呢個類別 ｡ 揀過第二個 tab 啦
            </div>
          ) : null}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {characters.map((c) => (
              <CharacterCard
                key={c.key}
                character={c}
                unlocked={unlockedSet.has(c.key)}
                selected={selected === c.key}
                reputation={reputation}
                coins={coins}
                onSelect={() => {
                  if (unlockedSet.has(c.key)) onSelect(c.key)
                }}
                onUnlock={() => onUnlock(c.key)}
              />
            ))}
          </div>

          {/* Selected character detail strip */}
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#3a1d18] bg-gradient-to-r from-[#1a0c0c] via-[#22100c] to-[#1a0c0c] p-3">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <h3 className="text-base font-bold text-white">{selectedDef.displayName}</h3>
                <span className="text-[11px] uppercase tracking-widest text-white/60">{selectedDef.english}</span>
              </div>
              <div className="mt-0.5 text-xs italic text-[#ffd16a]">「{selectedDef.tagline}」</div>
              <div className="mt-1.5 text-xs text-white/70">{selectedDef.description}</div>
              {/* Stat deltas vs baseline (chan_ho_nam-with-empty-baseStats baseline) */}
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {STAT_DISPLAY.filter(({ key }) => (selectedDef.baseStats as Record<string, number | undefined>)?.[key] !== undefined).map(({ key, label, suffix, isPercent }) => {
                  const v = (selectedDef.baseStats as Record<string, number | undefined>)[key]
                  if (v === undefined) return null
                  const base = BASELINE_STATS[key]
                  const delta = v - base
                  const sign = delta > 0 ? '+' : ''
                  const display = isPercent ? `${Math.round(v * 100)}%` : `${(Math.round(v * 100) / 100).toString()}${suffix ?? ''}`
                  const deltaDisplay = delta === 0 ? '' : isPercent ? ` (${sign}${Math.round(delta * 100)}%)` : ` (${sign}${(Math.round(delta * 100) / 100).toString()})`
                  return (
                    <span key={key} className={`rounded-md px-2 py-0.5 text-[10px] font-mono ${delta > 0 ? 'bg-emerald-900/40 text-emerald-300' : delta < 0 ? 'bg-rose-900/40 text-rose-300' : 'bg-white/5 text-white/70'}`}>
                      {label} {display}{deltaDisplay}
                    </span>
                  )
                })}
              </div>
              {selectedDef.startingSkills && selectedDef.startingSkills.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedDef.startingSkills.map((s) => {
                    const def = SKILLS[s]
                    return (
                      <span key={s} className="rounded-full border border-[#ffd16a]/40 bg-gradient-to-r from-[#3a1408]/70 to-[#5a2208]/70 px-2 py-0.5 text-[10px] text-[#ffd16a]">
                        開局技 · {def?.name ?? s}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
            <button
              onClick={onStartRun}
              className="rounded-lg border border-[#ffd16a] bg-gradient-to-b from-[#c4321a] to-[#7a1a08] px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,80,40,0.45)] transition hover:from-[#e84a2a] hover:to-[#9a2a14]"
            >
              出嚟行
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Resource({ icon, value }: { icon: 'coin' | 'gem' | 'energy'; value: number | string }) {
  const conf = icon === 'coin'
    ? { bg: '#ffce5a', glyph: '$', shadow: '#a87208' }
    : icon === 'gem'
      ? { bg: '#7be1ff', glyph: '◆', shadow: '#1a4f6a' }
      : { bg: '#ffe070', glyph: '⚡', shadow: '#9a6a08' }
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-[#3a1d18] bg-black/40 pl-1 pr-2.5 py-0.5">
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
        style={{ background: conf.bg, color: '#3a1a08', boxShadow: `inset 0 -1px 0 ${conf.shadow}` }}
      >
        {conf.glyph}
      </span>
      <span className="text-xs font-semibold text-white tabular-nums">{value}</span>
    </div>
  )
}

function DragonOrnament() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" aria-hidden>
      <defs>
        <linearGradient id="dragon" x1="0" x2="1">
          <stop offset="0%" stopColor="#ffd16a" />
          <stop offset="100%" stopColor="#e84a52" />
        </linearGradient>
      </defs>
      <path
        d="M3 12 Q6 6 11 8 Q14 4 18 8 Q21 7 21 12 Q18 14 18 12 Q15 16 11 13 Q8 17 5 14 Q3 14 3 12 Z"
        fill="url(#dragon)"
        stroke="#7a1a08"
        strokeWidth="0.8"
      />
      <circle cx="9" cy="10" r="0.8" fill="#1a0808" />
    </svg>
  )
}
