import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/effects.css'
import { portfolioContent } from '../content/portfolio'
import { TiltCard } from '../components/showcase/TiltCard'
import { ShaderBackground } from '../components/showcase/ShaderBackground'

export function ProjectsPage() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.fx-reveal')
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
          io.unobserve(e.target)
        }
      }
    }, { threshold: 0.18 })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const projects = portfolioContent.projects

  return (
    <div className="space-y-14">

      {/* HERO */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 fx-conic-border">
        <ShaderBackground className="absolute inset-0 h-full w-full" />
        <div className="fx-scanlines" />
        <div className="fx-vignette" />
        <div className="fx-grain" />

        <div className="relative z-10 px-6 py-12 md:px-12 md:py-16">
          <div className="mb-3 text-[11px] uppercase tracking-[0.4em] text-white/55">Projects</div>
          <h1 className="text-4xl font-black leading-[0.98] tracking-tight text-white md:text-7xl">
            <span className="fx-aurora-text">Selected work.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65">
            Production systems, side-quests, and demos. Each one is a small lesson — distributed systems, AI agents, real-time graphics, or just a puzzle that wouldn&rsquo;t leave my head.
          </p>
        </div>
      </section>

      {/* GRID */}
      <section className="grid gap-5 md:grid-cols-2">
        {projects.map((p, i) => {
          const external = /^https?:|^mailto:/.test(p.href)
          const staticFile = /\.html?$/.test(p.href)
          const innerClassName = "group relative block min-h-[14rem] p-6 md:p-7"
          const Wrapper = ({ children }: { children: React.ReactNode }) =>
            external || staticFile ? (
              <a
                href={p.href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                className={innerClassName}
              >
                {children}
              </a>
            ) : (
              <Link to={p.href} className={innerClassName}>
                {children}
              </Link>
            )
          return (
          <TiltCard
            key={p.title}
            maxTilt={6}
            className="fx-reveal rounded-3xl border border-white/10 fx-glass overflow-hidden"
            style={{ transitionDelay: `${i * 50}ms` }}
          >
            <Wrapper>
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full opacity-50 blur-3xl transition group-hover:opacity-90"
                style={{
                  background:
                    i % 3 === 0
                      ? 'radial-gradient(circle,rgba(126,123,217,0.55),transparent 60%)'
                      : i % 3 === 1
                      ? 'radial-gradient(circle,rgba(126,123,217,0.45),transparent 60%)'
                      : 'radial-gradient(circle,rgba(214,156,47,0.45),transparent 60%)',
                }}
              />

              <div className="relative">
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {p.tags?.map((t) => (
                    <span key={t} className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] uppercase tracking-widest text-white/65">
                      {t}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl font-bold text-white md:text-3xl fx-glitch" data-text={p.title}>
                  {p.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{p.description}</p>
                {p.note ? (
                  <p className="mt-3 text-xs italic text-white/50 border-l-2 border-[#7e7bd9]/40 pl-3">{p.note}</p>
                ) : null}

                <div className="mt-5 inline-flex items-center gap-1 text-sm text-[#7e7bd9] fx-underline-grow">
                  Open project →
                </div>
              </div>
            </Wrapper>
          </TiltCard>
          )
        })}
      </section>

      {/* CTA back to home */}
      <section className="text-center">
        <Link to="/" className="text-sm uppercase tracking-[0.32em] text-white/55 hover:text-white">
          ← back to home
        </Link>
      </section>
    </div>
  )
}
