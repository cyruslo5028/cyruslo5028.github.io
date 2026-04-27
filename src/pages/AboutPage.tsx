import { portfolioContent } from '../content/portfolio'
import { Reveal } from '../components/Reveal'

export function AboutPage() {
  return (
    <div className="space-y-6">
      <section className="glass rounded-3xl p-7 md:p-10">
        <h1 className="text-3xl font-semibold text-text-primary">About</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base">
          {portfolioContent.intro}
        </p>
      </section>

      <section className="glass rounded-3xl p-7 md:p-10">
        <h2 className="text-xl font-semibold text-text-primary">Experience</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Selected roles across payments reliability, backend systems, and platform engineering.
        </p>

        <div className="mt-6 grid gap-4">
          {portfolioContent.timeline.map((item, idx) => (
            <Reveal key={`${item.date}-${item.title}`} delay={idx * 0.04}>
              <div className="rounded-2xl border border-line-softer bg-white/5 p-6">
                <div className="text-xs text-text-secondary">{item.date}</div>
                <div className="mt-1 text-base font-semibold text-text-primary">{item.title}</div>
                <div className="mt-1 text-sm text-text-secondary">{item.org}</div>
                {item.bullets?.length ? (
                  <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-text-secondary">
                    {item.bullets.map((b) => (
                      <li key={`${item.date}-${item.title}-${b}`}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="glass rounded-3xl p-7 md:p-10">
        <h2 className="text-xl font-semibold text-text-primary">Skills</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Core technologies across backend engineering, reliability, and applied AI systems.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {portfolioContent.skills.map((s, i) => (
            <Reveal key={s} delay={i * 0.008}>
              <span className="inline-flex items-center rounded-full border border-line-softer bg-white/5 px-3 py-1 text-xs text-text-secondary hover:bg-white/10 hover:text-text-primary">
                {s}
              </span>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  )
}
