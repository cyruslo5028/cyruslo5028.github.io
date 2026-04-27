import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

export function Reveal({
  children,
  delay = 0,
  y = 20,
  scale = 0.98,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  scale?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y, scale }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
