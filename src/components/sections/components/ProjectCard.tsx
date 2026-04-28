import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import React, { type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '../../../content/types'

function isExternal(href: string) {
  return href.startsWith('http://') || href.startsWith('https://') || href.endsWith('.html') || href.startsWith('/VenmoSplit') || href.startsWith('/webGLshading')
}

const cardClassName =
  'group relative block overflow-hidden rounded-3xl border border-line-softer bg-white/5 p-6 backdrop-blur transition duration-300 hover:scale-[1.01] hover:border-white/15 hover:bg-white/10 hover:shadow-neon'

export function ProjectCard({ project, delay = 0 }: { project: Project; delay?: number }) {
  const [hovered, setHovered] = React.useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const px = useMotionValue(0)
  const py = useMotionValue(0)

  const sx = useSpring(x, { stiffness: 160, damping: 18 })
  const sy = useSpring(y, { stiffness: 160, damping: 18 })
  const spx = useSpring(px, { stiffness: 180, damping: 22 })
  const spy = useSpring(py, { stiffness: 180, damping: 22 })

  const rotateX = useTransform(sy, [-0.5, 0.5], [10, -10])
  const rotateY = useTransform(sx, [-0.5, 0.5], [-12, 12])
  const glow = useMotionTemplate`radial-gradient(260px circle at ${spx}px ${spy}px, rgba(34,211,238,0.24), rgba(96,165,250,0.12), rgba(167,139,250,0.10), transparent 70%)`

  const onMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const nx = (event.clientX - rect.left) / rect.width - 0.5
    const ny = (event.clientY - rect.top) / rect.height - 0.5
    x.set(nx)
    y.set(ny)
    px.set(event.clientX - rect.left)
    py.set(event.clientY - rect.top)
  }

  const onLeave = () => {
    x.set(0)
    y.set(0)
    setHovered(false)
  }

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      className="flex h-full flex-col"
      style={{ perspective: 900, transformStyle: 'preserve-3d' }}
    >
      <motion.div className="relative flex h-full flex-col" style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} transition={{ duration: 0.12 }}>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-6 opacity-0 transition duration-300 group-hover:opacity-100"
          style={{ backgroundImage: glow }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-6 -top-6 h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.55),rgba(96,165,250,0.35),rgba(167,139,250,0.45),transparent)] opacity-0 transition duration-300 group-hover:opacity-100"
        />

        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-4" style={{ transform: 'translateZ(26px)' }}>
            <div>
              <div className="text-sm font-semibold text-text-primary">
                <span className={hovered ? 'text-neon' : undefined}>{project.title}</span>
              </div>
              <div className="mt-1 text-xs text-text-secondary">{project.description}</div>
            </div>
            <div className="rounded-xl border border-line-softer bg-white/5 p-2 text-text-secondary transition group-hover:border-white/15 group-hover:text-text-primary">
              <ExternalLink size={16} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2" style={{ transform: 'translateZ(20px)' }}>
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line-softer bg-black/10 px-3 py-1 text-[11px] text-text-secondary transition group-hover:border-white/12 group-hover:text-text-primary"
              >
                {tag}
              </span>
            ))}
          </div>

          {project.note ? (
            <div className="mt-auto pt-4 text-[11px] text-text-secondary" style={{ transform: 'translateZ(16px)' }}>
              {project.note}
            </div>
          ) : null}
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute -inset-6 rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        >
          <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_30%_16%,rgba(255,255,255,0.16),transparent_55%)]" />
        </div>
      </motion.div>
    </motion.div>
  )

  if (isExternal(project.href)) {
    return (
      <a
        href={project.href}
        target="_blank"
        rel="noreferrer"
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onLeave}
        className={cardClassName}
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      to={project.href}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      className={cardClassName}
    >
      {content}
    </Link>
  )
}
