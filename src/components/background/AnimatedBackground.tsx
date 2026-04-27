import { useEffect } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'

/**
 * Background design goals (updated):
 * - Dark mode base (deep gray / near-black)
 * - Subtle grid + premium vignette
 * - Neon gradient orbs (purple/blue/cyan) with "breathing" drift
 * - A pointer-follow glow for interactive tech vibes (still tasteful)
 */
export function AnimatedBackground() {
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)

  // Smooth pointer follower (window-level; the background itself is pointer-events-none)
  const sx = useSpring(pointerX, { stiffness: 80, damping: 20, mass: 0.7 })
  const sy = useSpring(pointerY, { stiffness: 80, damping: 20, mass: 0.7 })

  const pointerGlow = useMotionTemplate`radial-gradient(520px circle at ${sx}px ${sy}px, rgba(34,211,238,0.12), rgba(96,165,250,0.07), rgba(167,139,250,0.05), transparent 65%)`

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointerX.set(e.clientX)
      pointerY.set(e.clientY)
    }

    // Default center (avoid a "top-left" glow before first move)
    pointerX.set(window.innerWidth * 0.55)
    pointerY.set(window.innerHeight * 0.35)

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [pointerX, pointerY])

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base */}
      <div className="absolute inset-0 bg-ink-50" />

      {/* Subtle grid */}
      <div className="absolute inset-0 bg-grid-faint bg-[size:72px_72px] opacity-[0.16]" />

      {/* Slow neon orbs */}
      <NeonOrbs />

      {/* Pointer-follow glow (interactive, but soft) */}
      <motion.div className="absolute inset-0" style={{ backgroundImage: pointerGlow }} />

      {/* Vignette (adds premium depth) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,rgba(0,0,0,0.70)_100%)]" />

      {/* A gentle animated highlight sweep */}
      <motion.div
        className="absolute -inset-[28%] opacity-[0.08]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.16) 0%, transparent 52%), radial-gradient(circle at 70% 60%, rgba(34,211,238,0.16) 0%, transparent 55%), radial-gradient(circle at 60% 90%, rgba(167,139,250,0.12) 0%, transparent 58%)',
        }}
        animate={{
          x: ['-2%', '2%', '-2%'],
          y: ['-1%', '1%', '-1%'],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

function NeonOrbs() {
  return (
    <div className="absolute inset-0">
      {/* Cyan orb */}
      <motion.div
        className="absolute -left-40 top-10 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(34,211,238,0.28), rgba(34,211,238,0.10) 28%, transparent 62%)',
        }}
        animate={{
          x: [0, 70, 0],
          y: [0, 36, 0],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Blue orb */}
      <motion.div
        className="absolute right-[-220px] top-[16%] h-[620px] w-[620px] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 40% 40%, rgba(96,165,250,0.22), rgba(96,165,250,0.08) 32%, transparent 65%)',
        }}
        animate={{
          x: [0, -60, 0],
          y: [0, 46, 0],
          opacity: [0.28, 0.50, 0.28],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
      />

      {/* Purple orb */}
      <motion.div
        className="absolute bottom-[-240px] left-[14%] h-[640px] w-[640px] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 45% 45%, rgba(167,139,250,0.22), rgba(167,139,250,0.08) 30%, transparent 66%)',
        }}
        animate={{
          x: [0, 52, 0],
          y: [0, -52, 0],
          opacity: [0.24, 0.48, 0.24],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      />
    </div>
  )
}
