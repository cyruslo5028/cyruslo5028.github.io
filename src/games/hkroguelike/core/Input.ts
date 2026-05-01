// Input handling: WASD / arrow keys + mouse follow + touch.
// `axes` is computed each frame from whichever input source is active.
// Mouse follow: when cursor is over the canvas, character moves toward cursor.
// Keyboard wins if any movement key is pressed.

export type InputState = {
  axes: { x: number; y: number }
  pause: boolean
  consumePause: () => boolean
  attach: (root: HTMLElement, canvas: HTMLCanvasElement, getPlayerPos: () => { x: number; y: number }, arenaW: number, arenaH: number) => void
  detach: () => void
  _update: () => void
}

export function createInput(): InputState {
  const keys = new Set<string>()
  let pauseToggled = false

  // Mouse: client-space position
  let mouseClient = { x: 0, y: 0 }
  let mouseHover = false

  // Touch
  let touchActive = false
  let touchStart = { x: 0, y: 0 }
  let touchAxes = { x: 0, y: 0 }

  let attachedRoot: HTMLElement | null = null
  let attachedCanvas: HTMLCanvasElement | null = null
  let getPlayer: (() => { x: number; y: number }) | null = null
  let arenaW = 960
  let arenaH = 640

  const onKeyDown = (e: KeyboardEvent) => {
    keys.add(e.key.toLowerCase())
    if (e.key === 'Escape' || e.key.toLowerCase() === 'p') pauseToggled = true
  }
  const onKeyUp = (e: KeyboardEvent) => { keys.delete(e.key.toLowerCase()) }

  const onMouseMove = (e: MouseEvent) => {
    mouseClient.x = e.clientX
    mouseClient.y = e.clientY
    mouseHover = true
  }
  const onMouseEnter = () => { mouseHover = true }
  const onMouseLeave = () => { mouseHover = false }

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0]
    if (!t) return
    touchActive = true
    touchStart = { x: t.clientX, y: t.clientY }
    touchAxes = { x: 0, y: 0 }
  }
  const onTouchMove = (e: TouchEvent) => {
    if (!touchActive) return
    const t = e.touches[0]
    if (!t) return
    const dx = t.clientX - touchStart.x
    const dy = t.clientY - touchStart.y
    const max = 64
    touchAxes.x = Math.max(-1, Math.min(1, dx / max))
    touchAxes.y = Math.max(-1, Math.min(1, dy / max))
  }
  const onTouchEnd = () => {
    touchActive = false
    touchAxes = { x: 0, y: 0 }
  }

  const state: InputState = {
    axes: { x: 0, y: 0 },
    pause: false,
    consumePause() {
      const v = pauseToggled
      pauseToggled = false
      return v
    },
    attach(root, canvas, getPos, aw, ah) {
      attachedRoot = root
      attachedCanvas = canvas
      getPlayer = getPos
      arenaW = aw
      arenaH = ah
      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)
      canvas.addEventListener('mousemove', onMouseMove)
      canvas.addEventListener('mouseenter', onMouseEnter)
      canvas.addEventListener('mouseleave', onMouseLeave)
      root.addEventListener('touchstart', onTouchStart, { passive: true })
      root.addEventListener('touchmove', onTouchMove, { passive: true })
      root.addEventListener('touchend', onTouchEnd, { passive: true })
      root.addEventListener('touchcancel', onTouchEnd, { passive: true })
    },
    detach() {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      if (attachedCanvas) {
        attachedCanvas.removeEventListener('mousemove', onMouseMove)
        attachedCanvas.removeEventListener('mouseenter', onMouseEnter)
        attachedCanvas.removeEventListener('mouseleave', onMouseLeave)
      }
      if (attachedRoot) {
        attachedRoot.removeEventListener('touchstart', onTouchStart)
        attachedRoot.removeEventListener('touchmove', onTouchMove)
        attachedRoot.removeEventListener('touchend', onTouchEnd)
        attachedRoot.removeEventListener('touchcancel', onTouchEnd)
      }
      attachedRoot = null
      attachedCanvas = null
      getPlayer = null
    },
    _update() {
      // Touch wins
      if (touchActive) {
        state.axes.x = touchAxes.x
        state.axes.y = touchAxes.y
        return
      }
      // Keyboard
      let kx = 0, ky = 0
      if (keys.has('a') || keys.has('arrowleft')) kx -= 1
      if (keys.has('d') || keys.has('arrowright')) kx += 1
      if (keys.has('w') || keys.has('arrowup')) ky -= 1
      if (keys.has('s') || keys.has('arrowdown')) ky += 1
      if (kx !== 0 || ky !== 0) {
        const m = Math.hypot(kx, ky) || 1
        state.axes.x = kx / m
        state.axes.y = ky / m
        return
      }
      // Mouse follow
      if (mouseHover && attachedCanvas && getPlayer) {
        const rect = attachedCanvas.getBoundingClientRect()
        const player = getPlayer()
        const playerScreenX = rect.left + (player.x / arenaW) * rect.width
        const playerScreenY = rect.top + (player.y / arenaH) * rect.height
        const dx = mouseClient.x - playerScreenX
        const dy = mouseClient.y - playerScreenY
        const mag = Math.hypot(dx, dy)
        const deadzone = 22
        if (mag < deadzone) {
          state.axes.x = 0
          state.axes.y = 0
        } else {
          state.axes.x = dx / mag
          state.axes.y = dy / mag
        }
        return
      }
      // Idle
      state.axes.x = 0
      state.axes.y = 0
    },
  }

  return state
}
