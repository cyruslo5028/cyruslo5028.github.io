import type { CSSProperties, PropsWithChildren } from 'react'
import { useRef } from 'react'

/**
 * Magnetic button — pointer pulls the element toward the cursor with a
 * cubic-eased spring approximation. Used for hero CTAs.
 */
type Props = PropsWithChildren<{
  className?: string
  strength?: number   // pixels of max pull
  onClick?: () => void
  href?: string
  style?: CSSProperties
}>

export function MagneticButton({ children, className = '', strength = 18, onClick, href, style }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = (e.clientX - cx) / r.width
    const dy = (e.clientY - cy) / r.height
    el.style.transform = `translate3d(${(dx * strength).toFixed(2)}px, ${(dy * strength).toFixed(2)}px, 0)`
  }
  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'translate3d(0,0,0)'
  }

  const inner = <span className="block">{children}</span>

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`fx-magnet inline-block ${className}`}
      style={style}
    >
      {href ? (
        <a href={href} onClick={onClick} className="block">
          {inner}
        </a>
      ) : (
        <button onClick={onClick} className="block w-full">
          {inner}
        </button>
      )}
    </div>
  )
}
