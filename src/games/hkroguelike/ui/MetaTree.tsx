import React, { useState } from 'react'
import {
  META_NODES,
  META_PATHS,
  type MetaNodeKey,
  type MetaPath,
  type MetaState,
  canPurchase,
} from '../content/metaTree'

void React

type Props = {
  reputation: number
  state: MetaState
  onPurchase: (key: MetaNodeKey, cost: number) => void
  onClose: () => void
}

const PATHS: MetaPath[] = ['pek_jau', 'ji_hei', 'wan_sik', 'hing_dai']

export function MetaTree({ reputation, state, onPurchase, onClose }: Props) {
  const [hovered, setHovered] = useState<MetaNodeKey | null>(null)

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#3a1d18] bg-[#0d0a14] text-white shadow-[0_0_40px_rgba(180,40,30,0.20)]">
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: 'linear-gradient(180deg,#3a1208 0%,#7a1a18 100%)', borderBottom: '1px solid #ffd16a55' }}
      >
        <h2 className="text-lg font-bold tracking-wide text-[#ffd16a]" style={{ textShadow: '0 1px 0 #4a1a08' }}>
          江湖地位 · 升級樹
        </h2>
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-[#ffd16a]/40 bg-black/40 px-3 py-1 text-sm">
            可用：<span className="font-bold text-[#ffd16a] tabular-nums">{reputation}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
          >
            返主選單
          </button>
        </div>
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-4">
        {PATHS.map((p) => (
          <PathColumn
            key={p}
            path={p}
            reputation={reputation}
            state={state}
            hovered={hovered}
            setHovered={setHovered}
            onPurchase={onPurchase}
          />
        ))}
      </div>
    </div>
  )
}

function PathColumn({
  path,
  reputation,
  state,
  hovered,
  setHovered,
  onPurchase,
}: {
  path: MetaPath
  reputation: number
  state: MetaState
  hovered: MetaNodeKey | null
  setHovered: (k: MetaNodeKey | null) => void
  onPurchase: (k: MetaNodeKey, cost: number) => void
}) {
  const meta = META_PATHS[path]
  const tiers = [1, 2, 3, 4] as const

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="text-center">
        <div className="text-xl font-extrabold" style={{ color: meta.color, textShadow: `0 0 12px ${meta.color}55` }}>
          {meta.name}
        </div>
        <div className="text-[10px] uppercase tracking-widest text-white/50">{meta.english}</div>
        <div className="mt-1 text-[11px] text-white/60">{meta.description}</div>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {tiers.map((tier) => {
          const key = `${path}_${tier}` as MetaNodeKey
          const node = META_NODES[key]
          const owned = !!state[key]
          const can = canPurchase(node, state) && reputation >= node.cost
          const blocked = !owned && !canPurchase(node, state)
          return (
            <button
              key={key}
              disabled={!can}
              onMouseEnter={() => setHovered(key)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => can && onPurchase(key, node.cost)}
              className={`relative rounded-lg border px-3 py-2 text-left transition ${
                owned
                  ? 'border-[#ffd16a] bg-[#ffd16a]/10'
                  : can
                    ? 'border-white/20 bg-white/5 hover:bg-white/10 hover:shadow-[0_0_18px_rgba(255,255,255,0.18)]'
                    : 'cursor-not-allowed border-white/10 bg-black/30 opacity-50'
              }`}
              style={owned ? { boxShadow: `0 0 18px ${meta.color}66` } : undefined}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-bold text-white">{node.name}</span>
                <span className="text-[10px] uppercase tracking-widest text-white/50">T{tier}</span>
              </div>
              <div className="mt-0.5 text-[11px] text-white/70">{node.description}</div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-white/60">
                {owned ? (
                  <span className="font-bold text-[#ffd16a]">已習得 ✓</span>
                ) : blocked ? (
                  <span>需先解鎖 T{tier - 1}</span>
                ) : (
                  <span>
                    cost <span className="font-bold text-[#ffd16a]">{node.cost}</span>
                  </span>
                )}
                {hovered === key && !owned && can && <span className="text-emerald-300">點擊購買</span>}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
