import { useEffect, useState } from 'react'

export function useTypewriter(
  text: string,
  options?: {
    speedMs?: number
    startDelayMs?: number
  },
) {
  const speedMs = options?.speedMs ?? 45
  const startDelayMs = options?.startDelayMs ?? 250

  const [value, setValue] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let mounted = true
    let t: number | undefined

    // Reset the animation whenever the target text changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue('')
    setDone(false)

    const start = () => {
      let i = 0
      const tick = () => {
        if (!mounted) return
        i += 1
        setValue(text.slice(0, i))
        if (i >= text.length) {
          setDone(true)
          return
        }
        t = window.setTimeout(tick, speedMs)
      }
      t = window.setTimeout(tick, speedMs)
    }

    const starter = window.setTimeout(start, startDelayMs)

    return () => {
      mounted = false
      window.clearTimeout(starter)
      if (t) window.clearTimeout(t)
    }
  }, [text, speedMs, startDelayMs])

  return { value, done }
}
