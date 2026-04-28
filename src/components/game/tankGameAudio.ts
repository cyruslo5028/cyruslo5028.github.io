export class TankGameAudio {
  private context?: AudioContext
  private master?: GainNode
  private noiseBuffer?: AudioBuffer

  async resume() {
    if (typeof window === 'undefined') {
      return
    }

    if (!this.context) {
      const AudioCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioCtor) {
        return
      }

      this.context = new AudioCtor()
      this.master = this.context.createGain()
      this.master.gain.value = 0.16
      this.master.connect(this.context.destination)
      this.noiseBuffer = this.createNoiseBuffer(this.context)
    }

    if (this.context.state === 'suspended') {
      await this.context.resume()
    }
  }

  shoot() {
    if (!this.context || !this.master) {
      return
    }

    const now = this.context.currentTime
    const oscillator = this.context.createOscillator()
    const gain = this.context.createGain()
    const filter = this.context.createBiquadFilter()

    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(960, now)
    oscillator.frequency.exponentialRampToValueAtTime(420, now + 0.08)

    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1200, now)
    filter.Q.value = 0.6

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)

    oscillator.connect(filter)
    filter.connect(gain)
    gain.connect(this.master)
    oscillator.start(now)
    oscillator.stop(now + 0.1)
  }

  explosion() {
    if (!this.context || !this.master || !this.noiseBuffer) {
      return
    }

    const now = this.context.currentTime
    const noise = this.context.createBufferSource()
    const noiseFilter = this.context.createBiquadFilter()
    const noiseGain = this.context.createGain()
    const boom = this.context.createOscillator()
    const boomGain = this.context.createGain()

    noise.buffer = this.noiseBuffer
    noiseFilter.type = 'lowpass'
    noiseFilter.frequency.setValueAtTime(280, now)

    noiseGain.gain.setValueAtTime(0.001, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.24, now + 0.01)
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28)

    boom.type = 'triangle'
    boom.frequency.setValueAtTime(120, now)
    boom.frequency.exponentialRampToValueAtTime(42, now + 0.24)
    boomGain.gain.setValueAtTime(0.001, now)
    boomGain.gain.exponentialRampToValueAtTime(0.2, now + 0.02)
    boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)

    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(this.master)

    boom.connect(boomGain)
    boomGain.connect(this.master)

    noise.start(now)
    noise.stop(now + 0.3)
    boom.start(now)
    boom.stop(now + 0.32)
  }

  upgrade() {
    if (!this.context || !this.master) {
      return
    }

    const context = this.context
    const master = this.master
    const now = context.currentTime
    const notes = [392, 523.25, 659.25]

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const start = now + index * 0.06
      const end = start + 0.18

      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(frequency, start)
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.08, end)

      gain.gain.setValueAtTime(0.001, start)
      gain.gain.exponentialRampToValueAtTime(0.08, start + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, end)

      oscillator.connect(gain)
      gain.connect(master)
      oscillator.start(start)
      oscillator.stop(end + 0.02)
    })
  }

  dispose() {
    void this.context?.close()
    this.context = undefined
    this.master = undefined
    this.noiseBuffer = undefined
  }

  private createNoiseBuffer(context: AudioContext) {
    const buffer = context.createBuffer(1, context.sampleRate * 0.5, context.sampleRate)
    const channel = buffer.getChannelData(0)

    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = Math.random() * 2 - 1
    }

    return buffer
  }
}
