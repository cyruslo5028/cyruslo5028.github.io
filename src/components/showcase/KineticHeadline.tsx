import { motion } from 'framer-motion'

/**
 * Kinetic headline — letters lift in with stagger spring + glitch hover.
 * Pair with `.fx-aurora-text` or `.fx-glitch` for richer effect.
 */
type Props = {
  text: string
  className?: string
  letterClassName?: string
  startDelayMs?: number
}

export function KineticHeadline({ text, className = '', letterClassName = '', startDelayMs = 0 }: Props) {
  const letters = Array.from(text)

  return (
    <motion.h1
      aria-label={text}
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04, delayChildren: startDelayMs / 1000 } },
      }}
    >
      {letters.map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className={`inline-block ${letterClassName}`}
          variants={{
            hidden: { y: '100%', opacity: 0, rotateX: -45, filter: 'blur(8px)' },
            visible: {
              y: 0,
              opacity: 1,
              rotateX: 0,
              filter: 'blur(0px)',
              transition: { type: 'spring', damping: 14, stiffness: 220 },
            },
          }}
          style={{ transformOrigin: 'bottom' }}
        >
          {ch === ' ' ? ' ' : ch}
        </motion.span>
      ))}
    </motion.h1>
  )
}
