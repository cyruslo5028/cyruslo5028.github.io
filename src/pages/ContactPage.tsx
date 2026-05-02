import { type FormEvent, useEffect, useState } from 'react'
import '../styles/effects.css'
import { ShaderBackground } from '../components/showcase/ShaderBackground'
import { MagneticButton } from '../components/showcase/MagneticButton'
import { portfolioContent } from '../content/portfolio'

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/cyruslo5028', sub: '@cyruslo5028' },
  { label: 'Email', href: 'mailto:cyruslo5028@cyruslo.co', sub: 'cyruslo5028@cyruslo.co' },
  { label: 'Website', href: 'https://cyruslo.co', sub: 'cyruslo.co' },
]

export function ContactPage() {
  const [fromName, setFromName] = useState('')
  const [replyTo, setReplyTo] = useState('')
  const [message, setMessage] = useState('')

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

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Message from ${fromName}`)
    const body = encodeURIComponent(`Name: ${fromName}\nEmail: ${replyTo}\n\nMessage:\n${message}`)
    window.location.href = `mailto:cyruslo5028@cyruslo.co?subject=${subject}&body=${body}`
  }

  return (
    <div className="space-y-14">

      {/* HERO */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 fx-conic-border">
        <ShaderBackground className="absolute inset-0 h-full w-full" />
        <div className="fx-scanlines" />
        <div className="fx-vignette" />
        <div className="fx-grain" />

        <div className="relative z-10 px-6 py-14 md:px-12 md:py-20">
          <div className="mb-3 text-[11px] uppercase tracking-[0.4em] text-white/55">Contact</div>
          <h1 className="text-4xl font-black leading-[0.98] tracking-tight text-white md:text-7xl">
            <span className="fx-aurora-text">Let&rsquo;s talk shop.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65">
            Reliability, distributed systems, AI agents, full-stack product. {portfolioContent.location}.
            Reach me at any of the channels below or send a quick note &mdash; I read everything.
          </p>
        </div>
      </section>

      {/* CHANNELS */}
      <section className="grid gap-4 md:grid-cols-3">
        {LINKS.map((link, i) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className="fx-reveal block rounded-2xl border border-white/10 fx-glass p-5 transition hover:border-[#7e7bd9]/60 hover:bg-white/10"
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <div className="text-[10px] uppercase tracking-[0.32em] text-[#7e7bd9]/85">{link.label}</div>
            <div className="mt-2 text-base font-semibold text-white">{link.sub}</div>
            <div className="mt-3 text-xs text-white/55 fx-underline-grow inline-block">Open →</div>
          </a>
        ))}
      </section>

      {/* FORM */}
      <section className="rounded-3xl border border-white/10 fx-glass p-6 md:p-10 fx-reveal">
        <div className="text-[11px] uppercase tracking-[0.4em] text-white/55">Quick note</div>
        <h2 className="mt-1 text-2xl font-bold text-white md:text-4xl">
          <span className="fx-aurora-text">Drop a message.</span>
        </h2>
        <p className="mt-2 text-sm text-white/55">
          Goes straight to my inbox via your default mail client.
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:max-w-2xl">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-xs uppercase tracking-[0.18em] text-white/60">Name</label>
            <input
              id="name"
              required
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#7e7bd9]/70 focus:bg-white/10"
              placeholder="Your name"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-xs uppercase tracking-[0.18em] text-white/60">Email</label>
            <input
              id="email"
              type="email"
              required
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#7e7bd9]/70 focus:bg-white/10"
              placeholder="you@domain.com"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="msg" className="text-xs uppercase tracking-[0.18em] text-white/60">Message</label>
            <textarea
              id="msg"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#7e7bd9]/70 focus:bg-white/10"
              placeholder="What's on your mind?"
            />
          </div>
          <div>
            <MagneticButton strength={12}>
              <button
                type="submit"
                className="rounded-full border border-[#7e7bd9]/60 bg-gradient-to-r from-[#7e7bd9]/20 to-[#d69c2f]/22 px-7 py-3 text-sm font-bold tracking-[0.18em] text-white"
              >
                SEND →
              </button>
            </MagneticButton>
          </div>
        </form>
      </section>
    </div>
  )
}
