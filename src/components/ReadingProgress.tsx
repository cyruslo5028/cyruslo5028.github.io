import { useEffect, useMemo, useState } from 'react'
import { cn } from '../utils/cn'

export function ReadingProgress({ className }: { className?: string }) {
  const [p, setP] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const scrollTop = h.scrollTop
      const scrollHeight = h.scrollHeight - h.clientHeight
      const next = scrollHeight <= 0 ? 0 : scrollTop / scrollHeight
      setP(next)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const width = useMemo(() => `${Math.min(100, Math.max(0, p * 100))}%`, [p])

  return (
    <div className={cn('fixed left-0 top-0 z-50 h-[2px] w-full', className)}>
      <div
        className="h-full bg-white/20"
        style={{ boxShadow: '0 0 24px rgba(255,255,255,0.14)' }}
      >
        <div className="h-full bg-white/50" style={{ width }} />
      </div>
    </div>
  )
}
