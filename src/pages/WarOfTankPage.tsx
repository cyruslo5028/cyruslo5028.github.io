import React from 'react'
import { Link } from 'react-router-dom'
import { TankGame } from '../components/game/TankGame'

export function WarOfTankPage() {
  void React
  return (
    <div className="space-y-8">
      <section className="glass-neon overflow-hidden rounded-3xl p-7 md:p-10">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Canvas2D Game</div>
            <h1 className="mt-3 text-3xl font-semibold text-text-primary md:text-5xl">
              WAR OF TANK <span className="text-neon">KOWLOON</span>
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-text-secondary md:text-base">
              A Rougelike arcade built in vanilla Canvas2D · Hong Kong Kowloon aesthetic
            </p>
          </div>
          <Link className="btn-ghost self-start md:self-auto" to="/projects">
            ← Back to projects
          </Link>
        </div>
      </section>

      <section className="glass-neon rounded-3xl p-4 md:p-6">
        <div className="mx-auto max-w-5xl">
          <TankGame />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass rounded-3xl p-6">
          <div className="text-sm font-semibold text-text-primary">操作说明</div>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            WASD 移动，鼠标瞄准或自动索敌，空格或按住鼠标左键持续开火。
          </p>
        </div>
        <div className="glass rounded-3xl p-6">
          <div className="text-sm font-semibold text-text-primary">战斗节奏</div>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            每波敌军数量递增，清场后从三张升级卡中选择一项强化，继续深入九龙霓虹街区。
          </p>
        </div>
        <div className="glass rounded-3xl p-6">
          <div className="text-sm font-semibold text-text-primary">设计语言</div>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            深色街道、霓虹招牌、玻璃拟态面板与程序化音效统一对齐当前 portfolio 的赛博夜景风格。
          </p>
        </div>
      </section>
    </div>
  )
}
