import type { CSSProperties, PropsWithChildren } from 'react'
import { useRef } from 'react'

/**
 * 3D-tilt card — pointer-driven rotateX/rotateY via CSS variables.
 * Adds a radial shine on hover. Accessible: doesn't trap focus.
 */
type Props = PropsWithChildren<{
  className?: string
  maxTilt?: number   // degrees
  scale?: number
  style?: CSSProperties
}>

export function TiltCard({ children, className = '', maxTilt = 10, scale = 1.02, style }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width   // 0..1
    const py = (e.clientY - r.top) / r.height
    const rx = (0.5 - py) * maxTilt * 2
    const ry = (px - 0.5) * maxTilt * 2
    el.style.setProperty('--rx', `${rx.toFixed(2)}deg`)
    el.style.setProperty('--ry', `${ry.toFixed(2)}deg`)
    el.style.setProperty('--mx', `${(px * 100).toFixed(2)}%`)
    el.style.setProperty('--my', `${(py * 100).toFixed(2)}%`)
  }
  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`fx-tilt relative ${className}`}
      style={{ ...style, ['--scale' as string]: scale }}
    >
      {children}
      <span className="fx-tilt-shine" aria-hidden />
    </div>
  )
}
