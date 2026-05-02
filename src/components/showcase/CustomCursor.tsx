import { useEffect, useRef } from 'react'

/**
 * Custom cursor — ring + dot follow with mix-blend-mode difference so it
 * inverts whatever it's over. Auto-hides on touch devices.
 */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement | null>(null)
  const dotRef = useRef<HTMLDivElement | null>(null)
  const rxRef = useRef(0)
  const ryRef = useRef(0)
  const dxRef = useRef(0)
  const dyRef = useRef(0)
  const targetX = useRef(0)
  const targetY = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (matchMedia('(pointer: coarse)').matches) return // skip on touch

    let raf = 0
    const move = (e: PointerEvent) => {
      targetX.current = e.clientX
      targetY.current = e.clientY
      // Active state on hovering buttons / links
      const t = e.target as HTMLElement | null
      const interactive = t?.closest('a, button, [role="button"], .fx-tilt') != null
      ringRef.current?.classList.toggle('fx-cursor-ring--active', interactive)
    }
    window.addEventListener('pointermove', move)

    const tick = () => {
      // Spring follow ring (slow), instant dot
      rxRef.current += (targetX.current - rxRef.current) * 0.18
      ryRef.current += (targetY.current - ryRef.current) * 0.18
      dxRef.current = targetX.current
      dyRef.current = targetY.current
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rxRef.current}px, ${ryRef.current}px, 0) translate(-50%, -50%)`
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dxRef.current}px, ${dyRef.current}px, 0) translate(-50%, -50%)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="fx-cursor-ring" aria-hidden />
      <div ref={dotRef} className="fx-cursor-dot" aria-hidden />
    </>
  )
}
