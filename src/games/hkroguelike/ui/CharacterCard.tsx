import React from 'react'
import type { CharacterDef, ClassType, Rarity } from '../types'
import { Portrait } from './Portrait'
import { unlockPrice } from '../content/unlocks'

void React

// === Card chrome theming ===
const RARITY_GRADIENT: Record<Rarity, { bg: string; border: string; glow: string; label: string; labelColor: string }> = {
  XR: {
    bg: 'linear-gradient(180deg,#7c0a18 0%,#c41a2a 45%,#e84a52 100%)',
    border: 'linear-gradient(180deg,#ffd66e,#a8530f)',
    glow: 'rgba(255,80,40,0.55)',
    label: 'XR',
    labelColor: '#fff5d0',
  },
  SSR: {
    bg: 'linear-gradient(180deg,#5a2f06 0%,#b97208 45%,#f0a82e 100%)',
    border: 'linear-gradient(180deg,#ffe89a,#9a5e07)',
    glow: 'rgba(240,180,40,0.50)',
    label: 'SSR',
    labelColor: '#fff5d0',
  },
  SR: {
    bg: 'linear-gradient(180deg,#2a1148 0%,#552a8e 45%,#8a4ed0 100%)',
    border: 'linear-gradient(180deg,#d8b4ff,#3a1d63)',
    glow: 'rgba(170,90,240,0.50)',
    label: 'SR',
    labelColor: '#f0e0ff',
  },
  R: {
    bg: 'linear-gradient(180deg,#0e2347 0%,#1f4d8e 45%,#3a82d8 100%)',
    border: 'linear-gradient(180deg,#aed4ff,#1c3a63)',
    glow: 'rgba(70,140,240,0.50)',
    label: 'R',
    labelColor: '#e0eeff',
  },
}

const CLASS_LABEL: Record<ClassType, { zh: string; color: string }> = {
  attack: { zh: '攻', color: '#e63a4a' },
  defense: { zh: '防', color: '#3a82d8' },
  wisdom: { zh: '智', color: '#48c66a' },
  medic: { zh: '醫', color: '#ff8a3a' },
  support: { zh: '輔', color: '#a45cff' },
}

type Props = {
  character: CharacterDef
  unlocked: boolean
  selected: boolean
  reputation: number
  coins: number
  onSelect: () => void
  onUnlock: () => void
}

export function CharacterCard({ character, unlocked, selected, coins, onSelect, onUnlock }: Props) {
  void 0  // reputation kept in Props for back-compat but unused now
  const theme = RARITY_GRADIENT[character.rarity]
  const cls = CLASS_LABEL[character.classType]
  const stars = Math.max(0, Math.min(5, character.stars))

  return (
    <button
      onClick={onSelect}
      className={`group relative aspect-[3/4] w-full overflow-hidden rounded-xl text-left transition focus:outline-none ${
        selected ? 'scale-[1.02]' : 'hover:scale-[1.015]'
      }`}
      style={{ background: theme.border, padding: 2, boxShadow: `0 0 22px ${selected ? theme.glow : 'transparent'}` }}
      title={character.displayName}
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-[10px]"
        style={{ background: theme.bg }}
      >
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-center px-2 pt-1.5">
          <NameBanner name={character.displayName} />
        </div>

        <div
          className="absolute left-1.5 top-7 z-10 flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold text-white shadow-md"
          style={{ background: cls.color, transform: 'rotate(-6deg)' }}
        >
          {cls.zh}
        </div>

        <div className="absolute left-1.5 top-[60px] z-10 select-none">
          <span
            className="font-black italic"
            style={{ color: theme.labelColor, fontSize: 22, textShadow: '0 1px 0 #2a0606, 0 0 8px rgba(255,255,255,0.25)' }}
          >
            {theme.label}
          </span>
        </div>

        <div className="absolute right-1 top-9 z-10 flex flex-col gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} active={i < stars} />
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-10 top-10 flex items-end justify-center">
          <Portrait characterKey={character.key} locked={!unlocked} />
        </div>

        {selected && (
          <div className="absolute right-1 bottom-12 z-10 -rotate-[8deg] rounded-md bg-[#e63a4a] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md">
            已上陣
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-2 pb-1.5">
          <div className="flex flex-col">
            <div className="text-[10px] font-medium leading-none text-white/70">
              <span className="mr-1 inline-block rounded-sm bg-black/40 px-1 py-0.5 text-[9px] tracking-widest">戰</span>
              <span className="font-bold text-white" style={{ textShadow: '0 1px 0 #4a1a1a' }}>
                {character.battlePower.toLocaleString()}
              </span>
            </div>
            <div className="mt-0.5 text-[14px] font-black italic leading-none text-white" style={{ textShadow: '0 1px 0 #4a1a1a' }}>
              Lv1
            </div>
          </div>
        </div>

        {!unlocked && (() => {
          const price = unlockPrice(character)
          const canAfford = coins >= price
          return (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-1.5 bg-black/70 text-center px-2">
              <div className="text-[20px] tracking-widest text-white/80">未解鎖</div>
              <div className="text-[12px] text-white/70">
                價錢 <span className={canAfford ? 'font-bold text-[#ffce5a]' : 'font-bold text-[#ff9a9a]'}>${price.toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-white/55">
                你有 ${coins.toLocaleString()}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); if (canAfford) onUnlock() }}
                disabled={!canAfford}
                className={`mt-1 rounded-md border px-3 py-1 text-[11px] font-bold transition ${
                  canAfford
                    ? 'border-[#ffce5a] bg-gradient-to-b from-[#7a4a08] to-[#3a1d04] text-[#ffe89a] hover:from-[#9a6a18]'
                    : 'border-white/15 bg-white/5 text-white/40 cursor-not-allowed'
                }`}
              >
                {canAfford ? '解鎖' : '錢唔夠'}
              </button>
            </div>
          )
        })()}

        <div
          className="pointer-events-none absolute inset-0 rounded-[10px]"
          style={{ boxShadow: 'inset 0 0 32px rgba(0,0,0,0.45)' }}
        />
      </div>
    </button>
  )
}

function NameBanner({ name }: { name: string }) {
  return (
    <div
      className="relative inline-flex items-center justify-center rounded px-2.5 py-0.5 text-[12px] font-extrabold tracking-wide text-[#fff8d0] shadow"
      style={{
        background: 'linear-gradient(180deg,#9b1320 0%,#d62a3a 50%,#7a0e1a 100%)',
        border: '1px solid #ffd16a',
        textShadow: '0 1px 0 #2a0a0a',
      }}
    >
      {name}
    </div>
  )
}

function Star({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={11} height={11}>
      <path
        d="M12 2 L14.6 8.6 L21.6 9.2 L16.3 13.8 L17.9 20.6 L12 17 L6.1 20.6 L7.7 13.8 L2.4 9.2 L9.4 8.6 Z"
        fill={active ? '#ffd66e' : '#3a2a1a'}
        stroke={active ? '#7a4a0a' : '#1a0e08'}
        strokeWidth="1"
      />
    </svg>
  )
}
