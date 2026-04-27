import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, GitFork, Home, Layers, Mail, Phone, User } from 'lucide-react'
import { cn } from '../../utils/cn'

const linkBase =
  'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-white/10'

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: LucideIcon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          linkBase,
          isActive
            ? 'bg-white/10 text-text-primary shadow-glow'
            : 'text-text-secondary hover:bg-white/5 hover:text-text-primary',
        )
      }
    >
      <Icon size={16} />
      <span>{label}</span>
    </NavLink>
  )
}

export function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40"
    >
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div className="glass rounded-2xl">
          <div className="flex items-center justify-between gap-4 px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-line-softer bg-[linear-gradient(135deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02))]">
                <span className="text-[11px] font-semibold tracking-[0.22em] text-text-primary">
                  CL
                </span>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-text-primary">Cyrus Lo</div>
                <div className="text-xs text-text-secondary">Portfolio</div>
              </div>
            </div>

            <nav className="hidden items-center gap-1 md:flex">
              <NavItem to="/" label="Home" icon={Home} />
              <NavItem to="/about" label="About" icon={User} />
              <NavItem to="/projects" label="Projects" icon={Layers} />
              <NavItem to="/contact" label="Contact" icon={Phone} />
            </nav>

            <div className="flex items-center gap-1">
              <a
                className={cn(linkBase, 'text-text-secondary hover:bg-white/5 hover:text-text-primary')}
                href="https://github.com/cyruslo5028"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                title="GitHub"
              >
                <GitFork size={16} />
              </a>
              <a
                className={cn(linkBase, 'text-text-secondary hover:bg-white/5 hover:text-text-primary')}
                href="mailto:cyruslo5028@cyruslo.co"
                aria-label="Email"
                title="Email"
              >
                <Mail size={16} />
              </a>
              <a
                className={cn(linkBase, 'text-text-secondary hover:bg-white/5 hover:text-text-primary')}
                href="/assets/Resume.pdf"
                aria-label="Resume"
                title="Resume"
              >
                <FileText size={16} />
              </a>

              <div className="md:hidden">
                <NavLink
                  to="/"
                  className={cn(linkBase, 'bg-white/5 text-text-primary hover:bg-white/10')}
                >
                  <Layers size={16} />
                  <span className="hidden sm:inline">Menu</span>
                </NavLink>
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <div className="flex flex-wrap gap-1 px-3 pb-3">
              <NavItem to="/" label="Home" icon={Home} />
              <NavItem to="/about" label="About" icon={User} />
              <NavItem to="/projects" label="Projects" icon={Layers} />
              <NavItem to="/contact" label="Contact" icon={Phone} />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
