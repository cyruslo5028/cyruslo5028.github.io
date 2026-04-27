import { useEffect, useRef, useState } from 'react'

export function useInViewOnce<T extends HTMLElement>(
  options?: IntersectionObserverInit & { once?: boolean },
) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const once = options?.once ?? true

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        }
      },
      {
        root: options?.root ?? null,
        rootMargin: options?.rootMargin ?? '0px 0px -10% 0px',
        threshold: options?.threshold ?? 0.18,
      },
    )

    observer.observe(el)

    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { ref, inView }
}
