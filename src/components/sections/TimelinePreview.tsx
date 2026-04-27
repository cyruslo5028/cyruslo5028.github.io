import { portfolioContent } from '../../content/portfolio'
import { Reveal } from '../Reveal'

export function TimelinePreview() {
  const items = portfolioContent.timeline.slice(0, 3)

  return (
    <section className="glass rounded-3xl p-7 md:p-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">About</h2>
          <p className="mt-2 text-sm text-text-secondary">
            A quick view of recent roles. Full details are on the About page.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {items.map((it, idx) => (
          <Reveal key={`${it.date}-${it.title}`} delay={idx * 0.05}>
            <div className="rounded-2xl border border-line-softer bg-white/5 p-5 transition hover:border-white/15 hover:bg-white/10 hover:shadow-neon">
              <div className="text-xs text-text-secondary">{it.date}</div>
              <div className="mt-1 text-sm font-semibold text-text-primary">{it.title}</div>
              <div className="mt-1 text-sm text-text-secondary">{it.org}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
