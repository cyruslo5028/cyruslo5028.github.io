import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import '../styles/effects.css'
import { portfolioContent } from '../content/portfolio'
import { TiltCard } from '../components/showcase/TiltCard'
import { ShaderBackground } from '../components/showcase/ShaderBackground'

// Categorize skills for nicer display than a flat blob.
const SKILL_GROUPS: Array<{ label: string; match: RegExp }> = [
  { label: 'AI / ML', match: /^(LangChain|OpenAI|Anthropic|RAG|pgvector|LLM|Agent|ReAct|Embedding|Vector|Prompt|Eval|Guardrail)/i },
  { label: 'Frontend', match: /^(React|Next|Vite|Tailwind|TypeScript|JavaScript|HTML|CSS|Three|WebGL|Canvas|Framer)/i },
  { label: 'Backend', match: /^(Go|Python|Java|Node|gRPC|REST|GraphQL|FastAPI|Flask|Spring)/i },
  { label: 'Data', match: /^(Postgres|MySQL|Redis|Kafka|Elasticsearch|S3|Snowflake|Spark|Hive|ClickHouse|MongoDB)/i },
  { label: 'Infra', match: /^(Kubernetes|Docker|Terraform|AWS|GCP|Azure|Linux|Nginx|Datadog|Prometheus|Grafana|CI|GitHub Actions)/i },
]

const HIGHLIGHTS = [
  {
    stat: '99.99%',
    title: 'Payments uptime',
    body: 'Owned reliability for high-volume PCI-scoped fintech workloads. Pager rotations, observability, runbook automation.',
  },
  {
    stat: 'PB-scale',
    title: 'Pipelines on call',
    body: 'Designed and operated petabyte-scale data + observability pipelines feeding alerting, scoring, and analytics.',
  },
  {
    stat: 'LLM × Tools',
    title: 'AI agents in production',
    body: 'ReAct-style internal engineering agents, retrieval-augmented scoring, evals, and guardrails for LLM features.',
  },
]

export function AboutPage() {
  const grouped = useMemo(() => {
    const buckets: Record<string, string[]> = { Other: [] }
    for (const g of SKILL_GROUPS) buckets[g.label] = []
    for (const s of portfolioContent.skills) {
      const hit = SKILL_GROUPS.find((g) => g.match.test(s))
      if (hit) buckets[hit.label].push(s)
      else buckets.Other.push(s)
    }
    return buckets
  }, [])

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

  return (
    <div className="space-y-16">

      {/* HERO */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 fx-conic-border">
        <ShaderBackground className="absolute inset-0 h-full w-full" />
        <div className="fx-scanlines" />
        <div className="fx-vignette" />
        <div className="fx-grain" />

        <div className="relative z-10 px-6 py-14 md:px-12 md:py-20">
          <div className="mb-3 text-[11px] uppercase tracking-[0.4em] text-white/55">About</div>
          <h1 className="text-4xl font-black leading-[0.98] tracking-tight text-white md:text-7xl">
            Engineer who <span className="fx-aurora-text">ships the whole loop.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg fx-reveal">
            {portfolioContent.intro}
          </p>
          <div className="mt-6 flex flex-wrap gap-2 fx-reveal">
            {['Tech Lead', 'Reliability', 'Distributed Systems', 'AI Agents', 'Full-stack'].map((tag) => (
              <span key={tag} className="rounded-full border border-[#7e7bd9]/40 bg-[#7e7bd9]/14 px-3 py-1 text-xs text-[#b3b1e6]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="space-y-5">
        <div className="text-[11px] uppercase tracking-[0.4em] text-white/55">Highlights</div>
        <div className="grid gap-5 md:grid-cols-3">
          {HIGHLIGHTS.map((h, i) => (
            <TiltCard
              key={h.title}
              maxTilt={5}
              className="fx-reveal rounded-3xl border border-white/10 fx-glass p-6"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="fx-stat-num bg-gradient-to-br from-white to-white/55 bg-clip-text text-3xl font-black text-transparent md:text-4xl">
                {h.stat}
              </div>
              <div className="mt-2 text-base font-semibold text-white">{h.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{h.body}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* TRAJECTORY (timeline) */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.4em] text-white/55">Trajectory</div>
            <h2 className="mt-1 text-3xl font-bold text-white md:text-5xl">
              <span className="fx-aurora-text">Where I&rsquo;ve been.</span>
            </h2>
          </div>
        </div>

        <div className="relative">
          {/* Vertical rail */}
          <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-[#7e7bd9]/60 via-blue-500/30 to-transparent md:left-4" />
          <div className="space-y-5">
            {portfolioContent.timeline.map((item, idx) => (
              <div key={`${item.date}-${item.title}`} className="relative pl-10 md:pl-12 fx-reveal" style={{ transitionDelay: `${idx * 50}ms` }}>
                {/* Node */}
                <div className="absolute left-0 top-3 flex h-7 w-7 items-center justify-center md:left-1">
                  <div className="absolute inset-0 rounded-full bg-[#7e7bd9]/30 blur-md" />
                  <div className="relative h-3 w-3 rounded-full bg-[#7e7bd9] shadow-[0_0_18px_rgba(126,123,217,0.95)]" />
                </div>

                <div className="rounded-2xl border border-white/10 fx-glass p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="text-base font-semibold text-white">{item.title}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[#7e7bd9]/85">{item.date}</div>
                  </div>
                  <div className="mt-1 text-sm text-white/55">{item.org}</div>
                  {item.bullets?.length ? (
                    <ul className="mt-3 space-y-1.5 text-sm text-white/70">
                      {item.bullets.map((b) => (
                        <li key={b} className="relative pl-5">
                          <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-gradient-to-br from-[#7e7bd9] to-[#d69c2f]" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STACK */}
      <section className="space-y-5">
        <div className="text-[11px] uppercase tracking-[0.4em] text-white/55">Stack</div>
        <h2 className="text-3xl font-bold text-white md:text-5xl">
          <span className="fx-aurora-text">Tools of the trade.</span>
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(grouped).filter(([, list]) => list.length > 0).map(([group, list], i) => (
            <div
              key={group}
              className="fx-reveal rounded-2xl border border-white/10 fx-glass p-5"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <div className="text-[10px] uppercase tracking-[0.32em] text-[#7e7bd9]/85">{group}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {list.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75 transition hover:border-[#7e7bd9]/60 hover:bg-white/10 hover:text-white"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 fx-glass p-10 md:p-14 text-center fx-reveal">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50 blur-3xl"
          style={{
            background:
              'radial-gradient(420px circle at 30% 20%, rgba(126,123,217,0.25), transparent 60%), radial-gradient(420px circle at 80% 80%, rgba(126,123,217,0.25), transparent 60%)',
          }}
        />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.4em] text-white/55">Want the deep-dive?</div>
          <h3 className="mt-2 text-3xl font-bold text-white md:text-5xl">
            <span className="fx-aurora-text">Let&rsquo;s trade notes.</span>
          </h3>
          <Link
            to="/contact"
            className="mt-6 inline-block rounded-full border border-[#7e7bd9]/60 bg-gradient-to-r from-[#7e7bd9]/20 to-[#d69c2f]/22 px-7 py-3 text-sm font-bold tracking-[0.18em] text-white"
          >
            CONTACT →
          </Link>
        </div>
      </section>
    </div>
  )
}
