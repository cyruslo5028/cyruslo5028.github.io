import React from 'react'
import { Link } from 'react-router-dom'
import { HKRoguelikeGame } from '../games/hkroguelike'

export function HKRogueLikePage() {
  void React

  return (
    <div className="space-y-6">
      <section className="glass-neon overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="relative z-10 flex flex-col gap-4">
          <Link className="btn-ghost w-fit" to="/projects">
            ← Back to projects
          </Link>

          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.24em] text-text-secondary">香港古惑仔 Archero-style Roguelite</p>
            <h1 className="text-3xl font-semibold text-text-primary md:text-5xl">
              霓虹江湖 <span className="text-neon">NEON JIANGHU</span>
            </h1>
            <p className="text-xs text-text-secondary md:text-sm">
              WASD / 方向鍵移動 · 停低自動擲飛刀 · 清房揀牌 · 死亡保留江湖地位
            </p>
          </div>
        </div>
      </section>

      <section className="glass-neon overflow-hidden rounded-3xl p-3 md:p-4">
        <HKRoguelikeGame />
      </section>
    </div>
  )
}
