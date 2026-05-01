import { MAX_TICKS_PER_FRAME, TICK_DT } from '../constants'

export type LoopHandle = {
  stop: () => void
}

// Fixed-timestep wrapper so physics stays deterministic at any FPS.
export function startGameLoop(opts: {
  update: (dt: number) => void
  render: (alpha: number) => void
}): LoopHandle {
  let last = performance.now() / 1000
  let acc = 0
  let stopped = false

  const frame = (now: number) => {
    if (stopped) return
    const t = now / 1000
    let frameDt = t - last
    last = t
    if (frameDt > 0.25) frameDt = 0.25  // clamp big stalls (tab switch)
    acc += frameDt

    let ticks = 0
    while (acc >= TICK_DT && ticks < MAX_TICKS_PER_FRAME) {
      opts.update(TICK_DT)
      acc -= TICK_DT
      ticks += 1
    }
    if (ticks === MAX_TICKS_PER_FRAME) {
      acc = 0  // give up backlog if we can't keep up
    }

    opts.render(acc / TICK_DT)
    requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)

  return {
    stop() { stopped = true },
  }
}
