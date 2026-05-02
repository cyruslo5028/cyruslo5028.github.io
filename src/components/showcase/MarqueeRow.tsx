import type { ReactNode } from 'react'

/**
 * Endless marquee — duplicates children once internally so the CSS
 * `translateX(-50%)` keyframe loops seamlessly.
 */
type Props = {
  items: ReactNode[]
  durationMs?: number
  className?: string
}

export function MarqueeRow({ items, durationMs = 38000, className = '' }: Props) {
  const stream = (
    <div className="fx-marquee__track" aria-hidden>
      {items.map((it, i) => (
        <span key={`a-${i}`} className="shrink-0">{it}</span>
      ))}
      {items.map((it, i) => (
        <span key={`b-${i}`} className="shrink-0">{it}</span>
      ))}
    </div>
  )

  return (
    <div
      className={`fx-marquee ${className}`}
      style={{ ['--duration' as string]: `${durationMs}ms` }}
      role="presentation"
    >
      {stream}
    </div>
  )
}
