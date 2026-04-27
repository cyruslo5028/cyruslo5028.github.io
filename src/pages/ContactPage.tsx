import { type FormEvent, useState } from 'react'
import { motion } from 'framer-motion'

export function ContactPage() {
  const [fromName, setFromName] = useState('')
  const [replyTo, setReplyTo] = useState('')
  const [message, setMessage] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()

    // Construct a mailto link and open the user's default email client
    const subject = encodeURIComponent(`Message from ${fromName}`)
    let body = `Name: ${fromName}\nEmail: ${replyTo}\n\nMessage:\n${message}`
    body = encodeURIComponent(body)

    window.location.href = `mailto:cyrus.lo@bytedance.com?subject=${subject}&body=${body}`
  }

  return (
    <div className="space-y-6">
      <section className="glass rounded-3xl p-7 md:p-10">
        <h1 className="text-3xl font-semibold text-text-primary">Contact</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base">
          If you want to collaborate or discuss payments reliability, distributed systems, platform engineering, or
          applied AI systems, send a message.
        </p>
      </section>

      <section className="glass rounded-3xl p-7 md:p-10">
        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <label className="text-sm text-text-secondary">Name</label>
            <input
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              className="rounded-2xl border border-line-softer bg-white/5 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-secondary/60 focus:border-line-stronger"
              placeholder="Your name"
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-text-secondary">Email</label>
            <input
              type="email"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              className="rounded-2xl border border-line-softer bg-white/5 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-secondary/60 focus:border-line-stronger"
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-text-secondary">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[140px] resize-y rounded-2xl border border-line-softer bg-white/5 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-secondary/60 focus:border-line-stronger"
              placeholder="What would you like to discuss?"
              required
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-primary">
              Open email client
            </button>
            <a className="btn-ghost" href="mailto:cyrus.lo@bytedance.com">
              Email directly
            </a>
          </div>
        </motion.form>
      </section>
    </div>
  )
}
