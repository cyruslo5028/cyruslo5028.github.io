import { portfolioContent } from '../../content/portfolio'
import { motion } from 'framer-motion'

export function SkillsCloud() {
  const skills = portfolioContent.skills

  return (
    <section className="glass rounded-3xl p-7 md:p-10">
      <h2 className="text-xl font-semibold text-text-primary">Skills</h2>
      <p className="mt-2 text-sm text-text-secondary">
        Core technologies across backend, reliability, and applied AI systems.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {skills.map((s, i) => (
          <motion.span
            key={s}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.012, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center rounded-full border border-line-softer bg-white/5 px-3 py-1 text-xs text-text-secondary transition hover:border-white/15 hover:bg-white/10 hover:text-text-primary hover:shadow-neon"
          >
            {s}
          </motion.span>
        ))}
      </div>
    </section>
  )
}
