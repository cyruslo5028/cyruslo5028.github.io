import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { TankGame3D } from '../components/game/TankGame3D'

void React

export function WarOfTankPage() {
  const [godMode, setGodMode] = useState(false)

  return (
    <div className="space-y-6">
      <section className="glass-neon overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3">
            <Link className="btn-ghost w-fit" to="/projects">
              ← Back to projects
            </Link>
            <h1 className="text-3xl font-semibold text-text-primary md:text-5xl">
              WAR OF TANK <span className="text-neon">3D</span>
            </h1>
          </div>

          <label className="glass inline-flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm text-text-primary">
            <input
              checked={godMode}
              className="h-4 w-4 accent-cyan-300"
              type="checkbox"
              onChange={(event) => setGodMode(event.target.checked)}
            />
            <span>🛡️ 无敌模式（锁血不死）</span>
          </label>
        </div>
      </section>

      <section className="glass-neon overflow-hidden rounded-3xl p-0">
        <TankGame3D godMode={godMode} />
      </section>
    </div>
  )
}
