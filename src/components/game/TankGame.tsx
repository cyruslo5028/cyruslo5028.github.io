import { motion } from 'framer-motion'
import React, { type ReactNode } from 'react'
import { Shield, Sparkles } from 'lucide-react'
import { UPGRADE_LIBRARY } from './tankGameModel'
import { useTankGame } from './useTankGame'

export function TankGame() {
  const {
    canvasRef,
    view,
    startGame,
    selectUpgrade,
    handlePointerMove,
    handlePointerLeave,
    handlePointerDown,
    handlePointerUp,
  } = useTankGame()

  const overlay = React.useMemo(() => {
    if (view.scene === 'idle') {
      return (
        <PanelOverlay
          title="WAR OF TANK: KOWLOON"
          description="霓虹巷战、逐波升级与迷宫街区交织的赛博街机战场。"
          primaryAction={{ label: 'Start', onClick: startGame }}
        />
      )
    }

    if (view.scene === 'gameover') {
      return (
        <PanelOverlay
          title="Mission Failed"
          description={`Final Score · ${view.score} ｜ Wave · ${view.wave}`}
          primaryAction={{ label: 'Play Again', onClick: startGame }}
        />
      )
    }

    if (view.scene === 'upgrading') {
      return <UpgradeOverlay wave={view.wave} options={view.upgradeOptions} onSelect={selectUpgrade} />
    }

    return null
  }, [selectUpgrade, startGame, view.scene, view.score, view.upgradeOptions, view.wave])

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-line-subtle bg-[#05070d]/80 shadow-neon">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_16%,transparent_84%,rgba(255,255,255,0.04))]" />

      <div className="pointer-events-none absolute left-4 top-4 z-20 flex flex-wrap items-center gap-3 text-xs text-text-primary md:text-sm">
        <HudChip label="HP" value={renderHearts(view.hp, view.maxHp)} />
        <HudChip label="Wave" value={String(view.wave)} />
        <HudChip label="Score" value={String(view.score)} />
        <HudChip
          label="Shield"
          value={
            <span className="inline-flex items-center gap-1 text-cyan-200">
              <Shield size={12} />
              {view.shieldCharges}
            </span>
          }
        />
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-20 hidden max-w-[70%] flex-wrap gap-2 md:flex">
        {view.upgrades.map((upgradeKey, index) => {
          const occurrence = view.upgrades.slice(0, index).filter((value) => value === upgradeKey).length

          return (
            <span
              key={`${upgradeKey}-${occurrence}`}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] text-text-primary"
            >
              <span className="text-neon">{UPGRADE_LIBRARY[upgradeKey].title}</span>
            </span>
          )
        })}
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="relative z-10 block aspect-[4/3] w-full bg-transparent"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      />

      {overlay}
    </div>
  )
}

function HudChip({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 backdrop-blur">
      <span className="mr-2 text-[10px] uppercase tracking-[0.22em] text-text-secondary">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  )
}

function PanelOverlay({
  title,
  description,
  primaryAction,
}: {
  title: string
  description: string
  primaryAction: { label: string; onClick: () => void | Promise<void> }
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass-neon relative w-full max-w-md rounded-[28px] p-7 text-center"
      >
        <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 p-3 text-cyan-200 shadow-neon">
          <Sparkles size={20} className="text-cyan-200" />
        </div>
        <h3 className="text-2xl font-semibold text-text-primary md:text-3xl">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">{description}</p>
        <button className="btn-neon mt-6 min-w-36" onClick={primaryAction.onClick} type="button">
          {primaryAction.label}
        </button>
      </motion.div>
    </div>
  )
}

function UpgradeOverlay({
  wave,
  options,
  onSelect,
}: {
  wave: number
  options: Array<{ key: keyof typeof UPGRADE_LIBRARY; title: string; description: string }>
  onSelect: (upgrade: keyof typeof UPGRADE_LIBRARY) => void | Promise<void>
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 p-5 backdrop-blur-sm">
      <div className="w-full max-w-5xl">
        <div className="mb-4 text-center">
          <div className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">Wave {wave} cleared</div>
          <h3 className="mt-2 text-2xl font-semibold text-text-primary">选择一张升级卡牌</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {options.map((option, index) => (
            <motion.button
              key={option.key}
              type="button"
              className="glass-neon rounded-[24px] p-6 text-left transition hover:-translate-y-1 hover:shadow-neon"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => onSelect(option.key)}
            >
              <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Upgrade</div>
              <div className="mt-3 text-xl font-semibold text-text-primary">{option.title}</div>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{option.description}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

function renderHearts(current: number, max: number) {
  return Array.from({ length: max }, (_, index) => (index < current ? '♥' : '♡')).join(' ')
}
