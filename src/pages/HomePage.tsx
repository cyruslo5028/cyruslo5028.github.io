import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { useTypewriter } from '../hooks/useTypewriter'
import profileImg from '../assets/IMG_3536.JPG'
import { portfolioContent } from '../content/portfolio'
import { ProjectGrid } from '../components/sections/ProjectGrid'
import { SkillsCloud } from '../components/sections/SkillsCloud'
import { TimelinePreview } from '../components/sections/TimelinePreview'

export function HomePage() {
  const heroText = "Hi, I'm Cyrus Lo"
  const { value, done } = useTypewriter(heroText, { speedMs: 38, startDelayMs: 170 })

  return (
    <div className="space-y-10">
      <section className="glass-neon relative overflow-hidden rounded-3xl p-7 md:min-h-[72vh] md:p-10">
        {/* neon-ish scanline overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_6px)]" />
        </div>

        {/* corner & edge highlights */}
        <div className="pointer-events-none absolute -right-52 -top-52 h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.18),transparent_60%)]" />
        <div className="pointer-events-none absolute -bottom-64 -left-64 h-[760px] w-[760px] rounded-full bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.16),transparent_62%)]" />
        <div className="pointer-events-none absolute left-[18%] top-[-180px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.14),transparent_62%)]" />

        <div className="relative grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-center">
          <div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-text-primary md:text-6xl">
              <span className="relative inline-block">
                {/* main neon gradient */}
                <span className="text-neon">{value}</span>

                {/* soft glow behind */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-10 blur-2xl opacity-30"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(34,211,238,0.22), rgba(96,165,250,0.16), rgba(167,139,250,0.20))',
                  }}
                />
              </span>

              {/* cursor */}
              <span className="ml-2 inline-block h-[1.02em] w-[10px] translate-y-[2px] rounded-sm bg-[linear-gradient(180deg,rgba(34,211,238,0.85),rgba(167,139,250,0.55))] shadow-neon align-middle animate-blink" />
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-text-secondary md:text-base">
              <span className="text-text-primary">{portfolioContent.headline}</span> · {portfolioContent.location}
            </p>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-text-secondary md:text-base">
              {portfolioContent.intro}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
              <span className="rounded-full border border-line-softer bg-white/5 px-3 py-1">Payments</span>
              <span className="rounded-full border border-line-softer bg-white/5 px-3 py-1">Reliability</span>
              <span className="rounded-full border border-line-softer bg-white/5 px-3 py-1">Backend / Infra</span>
              <span className="rounded-full border border-line-softer bg-white/5 px-3 py-1">Applied AI</span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a className="btn-neon" href="/assets/Resume.pdf">
                Resume
              </a>
              <a className="btn-ghost" href="mailto:cyruslo5028@cyruslo.co">
                Email
              </a>
              <a
                className="btn-ghost"
                href="https://github.com/cyruslo5028"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <MapPin size={14} />
                <span>{portfolioContent.location}</span>
              </div>
            </div>

            {done ? <div className="mt-6 text-xs text-text-secondary">Scroll to explore.</div> : null}
          </div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-sm"
            >
              <div className="absolute -inset-8 rounded-[40px] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.22),rgba(96,165,250,0.12),transparent_60%)] opacity-[0.70] blur-3xl" />
              <div className="relative overflow-hidden rounded-[28px] border border-line-softer bg-ink-150/60 p-4 backdrop-blur">
                <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.55),rgba(167,139,250,0.40),transparent)] opacity-70" />
                <div className="overflow-hidden rounded-[22px] border border-line-softer">
                  <img
                    src={profileImg}
                    alt="Cyrus Lo"
                    className="h-[420px] w-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{portfolioContent.name}</div>
                    <div className="text-xs text-text-secondary">Payments Tech Lead · SRE</div>
                  </div>
                  <div className="text-xs text-text-secondary">Los Angeles</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <TimelinePreview />

      <SkillsCloud />

      <ProjectGrid />

      <section className="glass-neon rounded-3xl p-7 md:p-10">
        <h2 className="text-xl font-semibold text-text-primary">Quick Links</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Legacy demos and side projects are preserved under <span className="text-text-primary">/waroftank</span>,
          <span className="text-text-primary"> /VenmoSplit</span>, and
          <span className="text-text-primary"> /webGLshading</span>.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a className="btn-primary" href="/waroftank/index.html" target="_blank" rel="noreferrer">
            War of Tank
          </a>
          <a className="btn-primary" href="/webGLshading/index.html" target="_blank" rel="noreferrer">
            WebGL Shading Demo
          </a>
          <a className="btn-primary" href="/VenmoSplit/index.html" target="_blank" rel="noreferrer">
            VenmoSplit
          </a>
        </div>
      </section>
    </div>
  )
}
