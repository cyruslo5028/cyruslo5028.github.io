import { motion } from 'framer-motion'
import { Shield, Sparkles, Zap } from 'lucide-react'
import React, { type ReactNode, useState } from 'react'
import { TankGame3DScene } from './TankGame3DScene'
import { DIFFICULTY_PRESETS, UPGRADE_LIBRARY, type DifficultyKey } from './tankGameModel'
import { useTankGame } from './useTankGame'

void React

type TankGame3DProps = {
  godMode: boolean
}

export function TankGame3D({ godMode }: TankGame3DProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyKey>('normal')
  const [cameraZoom, setCameraZoom] = useState<number>(1.0)
  const { world, upgradeOptions, startGame, selectUpgrade, handleAim, handlePointerDown, handlePointerLeave, handlePointerUp } = useTankGame({ godMode })

  const hpRatio = world.player.maxHp > 0 ? world.player.hp / world.player.maxHp : 0
  const hpBarColor = hpRatio > 0.6 ? 'from-emerald-400 to-lime-300' : hpRatio >= 0.3 ? 'from-amber-400 to-yellow-300' : 'from-rose-500 to-red-400'
  const ownedUpgrades = Object.entries(world.upgrades.levels).filter(([, level]) => level > 0) as Array<[
    keyof typeof UPGRADE_LIBRARY,
    number,
  ]>

  return (
    <div className="relative h-[78vh] min-h-[620px] overflow-hidden rounded-[28px] border border-line-subtle bg-[#04070d] shadow-neon">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_40%)]" />
      <TankGame3DScene
        world={world}
        cameraZoom={cameraZoom}
        onAim={handleAim}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-3 p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="glass-neon min-w-[250px] rounded-2xl px-4 py-3">
            <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-text-secondary">
              <span>Hull Integrity</span>
              <span>{DIFFICULTY_PRESETS[world.difficulty].hudLabel}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full bg-gradient-to-r ${hpBarColor} transition-[width] duration-200`} style={{ width: `${Math.max(hpRatio * 100, 0)}%` }} />
            </div>
            <div className="mt-2 text-sm font-medium text-text-primary">HP: {Math.round(world.player.hp)} / {world.player.maxHp}</div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs md:text-sm">
            <HudChip label="Wave" value={String(world.wave)} />
            <HudChip label="Score" value={String(world.score)} />
            <HudChip label="Enemies" value={String(world.enemies.length)} />
            <HudChip
              label="Mode"
              value={
                <span className={`inline-flex items-center gap-1 ${godMode ? 'text-cyan-200' : 'text-text-secondary'}`}>
                  <Shield size={12} />
                  {godMode ? 'Godmode On' : 'Standard'}
                </span>
              }
            />
            <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 backdrop-blur">
              <span className="text-[10px] uppercase tracking-[0.22em] text-text-secondary">Zoom</span>
              <input 
                type="range" 
                min="0.5" 
                max="1.5" 
                step="0.05" 
                value={cameraZoom} 
                onChange={(e) => setCameraZoom(Number.parseFloat(e.target.value))}
                className="w-16 md:w-20 accent-cyan-400"
              />
            </div>
          </div>
        </div>
      </div>

      {ownedUpgrades.length > 0 ? (
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-20 hidden flex-wrap gap-2 md:flex">
          {ownedUpgrades.map(([key, level]) => (
            <span key={key} className="rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[11px] text-text-primary backdrop-blur">
              <span className="text-neon">{UPGRADE_LIBRARY[key].title}</span> · Lv.{level}
            </span>
          ))}
        </div>
      ) : null}

      {world.scene === 'idle' ? (
        <StartOverlay
          selectedDifficulty={selectedDifficulty}
          onSelectDifficulty={setSelectedDifficulty}
          onStart={() => startGame(selectedDifficulty)}
        />
      ) : null}

      {world.scene === 'gameover' ? (
        <PanelOverlay
          title="Mission Failed"
          description={`最终得分 ${world.score} · 成功推进到第 ${world.wave} 波`}
          actionLabel="重新开战"
          onAction={() => startGame(selectedDifficulty)}
        >
          <DifficultyPills selectedDifficulty={selectedDifficulty} onSelectDifficulty={setSelectedDifficulty} />
        </PanelOverlay>
      ) : null}

      {world.scene === 'upgrading' ? <UpgradeOverlay wave={world.wave} options={upgradeOptions} onSelect={selectUpgrade} /> : null}
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

function StartOverlay({
  selectedDifficulty,
  onSelectDifficulty,
  onStart,
}: {
  selectedDifficulty: DifficultyKey
  onSelectDifficulty: (difficulty: DifficultyKey) => void
  onStart: () => void | Promise<void>
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/46 p-4 backdrop-blur-[2px]">
      <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="glass-neon relative w-full max-w-5xl rounded-[28px] p-6 md:p-7">
        <div className="mb-5 text-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-3 text-cyan-200 shadow-neon">
            <Sparkles size={20} />
          </div>
          <h2 className="mt-4 text-3xl font-semibold text-text-primary md:text-4xl">WAR OF TANK · 3D KOWLOON</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary md:text-base">
            固定 45° 俯视视角、霓虹贴图迷宫与无限叠层卡牌，准备进入九龙赛博夜战。
          </p>
        </div>

        <DifficultyPills selectedDifficulty={selectedDifficulty} onSelectDifficulty={onSelectDifficulty} />

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {Object.entries(DIFFICULTY_PRESETS).map(([key, config]) => {
            const active = key === selectedDifficulty
            return (
              <button
                key={key}
                type="button"
                className={`rounded-[24px] border p-5 text-left transition ${
                  active
                    ? 'border-cyan-300/60 bg-cyan-400/10 shadow-neon'
                    : 'border-white/10 bg-black/25 hover:border-white/20 hover:bg-white/5'
                }`}
                onClick={() => onSelectDifficulty(key as DifficultyKey)}
              >
                <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">{config.hudLabel}</div>
                <div className="mt-3 text-2xl font-semibold text-text-primary">{config.label}</div>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  HP {config.playerMaxHp} · 敌人伤害 {config.enemyDamage} · 敌人移速 × {config.enemySpeedMultiplier.toFixed(1)}
                </p>
                <p className="mt-2 text-sm text-text-secondary">{config.enemyExtraCount > 0 ? `每波额外 +${config.enemyExtraCount} 敌军` : '标准波次数量'}</p>
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-text-secondary">WASD 移动 · 鼠标瞄准 · 点击或空格开火 · 清空本波后从三张卡中选择升级</div>
          <button className="btn-neon min-w-40" type="button" onClick={onStart}>
            开始游戏
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function DifficultyPills({
  selectedDifficulty,
  onSelectDifficulty,
}: {
  selectedDifficulty: DifficultyKey
  onSelectDifficulty: (difficulty: DifficultyKey) => void
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {(Object.keys(DIFFICULTY_PRESETS) as DifficultyKey[]).map((difficulty) => {
        const active = difficulty === selectedDifficulty
        return (
          <button
            key={difficulty}
            type="button"
            className={`pointer-events-auto rounded-full border px-3 py-1.5 text-xs transition ${
              active ? 'border-cyan-300/60 bg-cyan-400/10 text-cyan-100' : 'border-white/10 bg-black/30 text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => onSelectDifficulty(difficulty)}
          >
            {DIFFICULTY_PRESETS[difficulty].label}
          </button>
        )
      })}
    </div>
  )
}

function PanelOverlay({
  title,
  description,
  actionLabel,
  onAction,
  children,
}: {
  title: string
  description: string
  actionLabel: string
  onAction: () => void | Promise<void>
  children?: ReactNode
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 p-5 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-neon w-full max-w-xl rounded-[28px] p-7 text-center">
        <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 p-3 text-cyan-200 shadow-neon">
          <Zap size={20} />
        </div>
        <h3 className="text-2xl font-semibold text-text-primary md:text-3xl">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">{description}</p>
        {children ? <div className="mt-5">{children}</div> : null}
        <button className="btn-neon mt-6 min-w-36" onClick={onAction} type="button">
          {actionLabel}
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
  options: Array<{ key: keyof typeof UPGRADE_LIBRARY; title: string; description: string; level: number }>
  onSelect: (upgrade: keyof typeof UPGRADE_LIBRARY) => void | Promise<void>
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/58 p-5 backdrop-blur-sm">
      <div className="w-full max-w-6xl">
        <div className="mb-4 text-center">
          <div className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">Wave {wave} cleared</div>
          <h3 className="mt-2 text-2xl font-semibold text-text-primary">选择一张可无限叠层的升级卡</h3>
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
              <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">{option.level > 0 ? `Level Up · 当前 Lv.${option.level}` : 'New Tech'}</div>
              <div className="mt-3 text-xl font-semibold text-text-primary">{option.title}</div>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{option.description}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
