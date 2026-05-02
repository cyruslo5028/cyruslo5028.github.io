import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/effects.css'
import { ShaderBackground } from '../components/showcase/ShaderBackground'
import { KineticHeadline } from '../components/showcase/KineticHeadline'
import { TiltCard } from '../components/showcase/TiltCard'
import { MagneticButton } from '../components/showcase/MagneticButton'
import { MarqueeRow } from '../components/showcase/MarqueeRow'
import { portfolioContent } from '../content/portfolio'

const STACK = [
  'TypeScript', 'Python', 'Go', 'React 19', 'Next.js',
  'LangChain', 'OpenAI', 'Anthropic', 'RAG', 'pgvector',
  'Postgres', 'Redis', 'Kafka', 'Kubernetes', 'gRPC', 'Terraform',
  'AWS', 'Datadog',
]

const CAPABILITIES = [
  {
    k: 'AI Agents',
    h: 'Production agent systems',
    p: 'Tool-calling workflows, retrieval-augmented generation, evals, guardrails. LLM features that hold up at scale.',
  },
  {
    k: 'Full-stack',
    h: 'End-to-end product engineering',
    p: 'TypeScript / React on the front, Go / Python services on the back, Postgres + queues in between. Ship the whole loop.',
  },
  {
    k: 'Reliability',
    h: 'Payments-grade infrastructure',
    p: 'Distributed systems, observability, incident response. Tech Lead for payments reliability at TikTok USDS.',
  },
]

export function ShowcaseHomePage() {
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

  const projects = portfolioContent.projects.slice(0, 6)

  return (
    <div className="space-y-20">

      {/* HERO */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 fx-conic-border">
        <ShaderBackground className="absolute inset-0 h-full w-full" />
        <div className="fx-scanlines" />
        <div className="fx-vignette" />
        <div className="fx-grain" />

        <div className="relative z-10 px-6 py-20 md:px-12 md:py-28">
          <div className="mb-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-white/55">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#7e7bd9] shadow-[0_0_18px_rgba(126,123,217,0.95)]" />
            <span>{portfolioContent.location}</span>
            <span className="opacity-40">·</span>
            <span>Available for staff-level roles</span>
          </div>

          <KineticHeadline
            text="CYRUS LO"
            className="font-black leading-[0.92] tracking-tight text-[18vw] md:text-[12vw] lg:text-[10rem]"
            letterClassName="fx-aurora-text"
          />

          <h2 className="mt-5 max-w-3xl text-xl font-medium tracking-tight text-white md:text-3xl fx-reveal">
            Full-stack & <span className="fx-aurora-text font-bold">AI Agent</span> engineer
            <span className="text-white/40"> — building reliable systems that talk, think, and ship.</span>
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base fx-reveal">
            Tech Lead for Payments Reliability at TikTok USDS. I design distributed systems,
            ship LLM-powered agents end-to-end, and keep production calm at scale.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <MagneticButton href="#work" className="rounded-full">
              <span className="flex items-center gap-2 rounded-full border border-[#7e7bd9]/60 bg-gradient-to-r from-[#7e7bd9]/20 via-[#d69c2f]/14 to-[#d69c2f]/22 px-7 py-3 text-sm font-bold tracking-[0.18em] text-white shadow-[0_0_44px_rgba(126,123,217,0.35)] backdrop-blur-md transition hover:border-[#7e7bd9] hover:shadow-[0_0_64px_rgba(126,123,217,0.55)]">
                <span className="fx-glitch" data-text="VIEW WORK">VIEW WORK</span>
                <span aria-hidden>→</span>
              </span>
            </MagneticButton>

            <MagneticButton href="/#/contact" strength={10}>
              <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm tracking-[0.18em] text-white/80 backdrop-blur-md hover:bg-white/10">
                CONTACT
              </span>
            </MagneticButton>
          </div>

          <div className="mt-16 grid max-w-3xl grid-cols-3 gap-3 fx-reveal">
            <div className="fx-glass rounded-2xl p-4">
              <div className="fx-stat-num bg-gradient-to-br from-white to-white/60 bg-clip-text text-3xl font-black text-transparent md:text-5xl">7+</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-white/50">Years SWE / SRE</div>
            </div>
            <div className="fx-glass rounded-2xl p-4">
              <div className="fx-stat-num bg-gradient-to-br from-white to-white/60 bg-clip-text text-3xl font-black text-transparent md:text-5xl">99.99%</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-white/50">Payments uptime owned</div>
            </div>
            <div className="fx-glass rounded-2xl p-4">
              <div className="fx-stat-num bg-gradient-to-br from-white to-white/60 bg-clip-text text-3xl font-black text-transparent md:text-5xl">PB-scale</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-white/50">Pipelines on call</div>
            </div>
          </div>
        </div>
      </section>

      {/* STACK MARQUEE */}
      <section className="relative">
        <div className="mb-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-white/55">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <span>Stack</span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
        <MarqueeRow
          items={STACK.map((s, i) => (
            <span
              key={i}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white/75 backdrop-blur-sm transition hover:border-[#7e7bd9]/60 hover:text-white"
            >
              {s}
            </span>
          ))}
        />
      </section>

      {/* CAPABILITIES */}
      <section className="space-y-6">
        <div>
          <div className="text-[11px] uppercase tracking-[0.4em] text-white/55">What I do</div>
          <h2 className="mt-1 text-3xl font-bold text-white md:text-5xl">
            <span className="fx-aurora-text">Three pillars.</span>
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {CAPABILITIES.map((c, i) => (
            <TiltCard
              key={c.k}
              maxTilt={6}
              className="fx-reveal rounded-3xl border border-white/10 fx-glass p-6"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="text-[10px] uppercase tracking-[0.32em] text-[#7e7bd9]/85">{c.k}</div>
              <div className="mt-3 text-xl font-semibold text-white">{c.h}</div>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{c.p}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* FEATURED WORK */}
      <section id="work" className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.4em] text-white/55">Featured</div>
            <h2 className="mt-1 text-3xl font-bold text-white md:text-5xl">
              <span className="fx-aurora-text">Selected work</span>
            </h2>
          </div>
          <Link to="/projects" className="fx-underline-grow text-sm text-white/70 hover:text-white">
            See all →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => {
            const external = /^https?:|^mailto:/.test(p.href)
            const staticFile = /\.html?$/.test(p.href)
            const innerClassName = "group relative block aspect-[4/3] overflow-hidden p-6"
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
              className="fx-reveal rounded-3xl border border-white/10 fx-glass overflow-hidden"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <Wrapper>
                <div className="absolute inset-x-6 top-4 flex flex-wrap gap-1.5">
                  {p.tags?.slice(0, 4).map((t) => (
                    <span key={t} className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] uppercase tracking-widest text-white/65">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="absolute inset-x-6 bottom-5">
                  <h3 className="text-xl font-bold text-white md:text-2xl fx-glitch" data-text={p.title}>
                    {p.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-white/65">{p.description}</p>
                </div>

                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-72 w-72 rounded-full opacity-50 blur-3xl transition group-hover:opacity-90"
                  style={{
                    background:
                      i % 3 === 0
                        ? 'radial-gradient(circle,rgba(126,123,217,0.55),transparent 60%)'
                        : i % 3 === 1
                        ? 'radial-gradient(circle,rgba(126,123,217,0.45),transparent 60%)'
                        : 'radial-gradient(circle,rgba(214,156,47,0.45),transparent 60%)',
                  }}
                />
              </Wrapper>
            </TiltCard>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 fx-glass p-10 md:p-14 text-center fx-reveal">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50 blur-3xl"
          style={{
            background:
              'radial-gradient(420px circle at 30% 20%, rgba(126,123,217,0.35), transparent 60%), radial-gradient(420px circle at 80% 80%, rgba(126,123,217,0.25), transparent 60%)',
          }}
        />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.4em] text-white/55">Let&rsquo;s talk</div>
          <h3 className="mt-2 text-3xl font-bold text-white md:text-5xl">
            <span className="fx-aurora-text">Building agents. Shipping infra. Scaling teams.</span>
          </h3>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/65">
            Open to staff-level full-stack / AI agent roles, advisory, or technical co-founder.
          </p>
          <MagneticButton href="/#/contact" strength={14} className="mt-6">
            <span className="rounded-full border border-[#7e7bd9]/60 bg-gradient-to-r from-[#7e7bd9]/20 to-[#d69c2f]/22 px-7 py-3 text-sm font-bold tracking-[0.18em] text-white">
              GET IN TOUCH →
            </span>
          </MagneticButton>
        </div>
      </section>
    </div>
  )
}
