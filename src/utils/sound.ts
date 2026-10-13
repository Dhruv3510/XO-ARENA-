// Web Audio API Synthesizer for arcade sound effects
class SoundController {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  /**
   * Sound played when placing an X or O mark
   */
  playMove(player: 'X' | 'O', enabled: boolean): void {
    if (!enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = player === 'X' ? 'triangle' : 'sine'
      const freq = player === 'X' ? 880 : 540 // A5 for X, C#5 for O
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, ctx.currentTime + 0.08)

      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.1)
    } catch {
      // Audio autoplay restriction fallback
    }
  }

  /**
   * Ascending celebratory chime on victory
   */
  playWin(enabled: boolean): void {
    if (!enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const startTime = ctx.currentTime + index * 0.08

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, startTime)

        gain.gain.setValueAtTime(0.18, startTime)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(startTime)
        osc.stop(startTime + 0.25)
      })
    } catch {
      // Audio fallback
    }
  }

  /**
   * Subdued chord played on a draw
   */
  playDraw(enabled: boolean): void {
    if (!enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const notes = [440, 415.3] // A4, G#4
      notes.forEach((freq) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime)

        gain.gain.setValueAtTime(0.12, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start()
        osc.stop(ctx.currentTime + 0.3)
      })
    } catch {
      // Audio fallback
    }
  }

  /**
   * Crisp tactile click for buttons
   */
  playClick(enabled: boolean): void {
    if (!enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(1200, ctx.currentTime)
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.04)
    } catch {
      // Audio fallback
    }
  }

  /**
   * Icy crystalline sound when a cell freezes in Chaos Mode
   */
  playFreeze(enabled: boolean): void {
    if (!enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const notes = [1760, 2093, 2637] // A6, C7, E7
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const t = ctx.currentTime + i * 0.04

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, t)
        osc.frequency.exponentialRampToValueAtTime(freq * 0.8, t + 0.15)

        gain.gain.setValueAtTime(0.12, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(t)
        osc.stop(t + 0.15)
      })
    } catch {
      // Audio fallback
    }
  }

  /**
   * Electric spark / lightning surge sound in Chaos Mode
   */
  playSurge(enabled: boolean): void {
    if (!enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(180, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(840, ctx.currentTime + 0.08)
      osc.frequency.linearRampToValueAtTime(320, ctx.currentTime + 0.16)

      gain.gain.setValueAtTime(0.14, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.2)
    } catch {
      // Audio fallback
    }
  }

  /**
   * Cyber chromatic glitch burst sound in Chaos Mode
   */
  playGlitch(enabled: boolean): void {
    if (!enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'square'
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.03)
      osc.frequency.setValueAtTime(220, ctx.currentTime + 0.06)
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.09)

      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.14)
    } catch {
      // Audio fallback
    }
  }

  /**
   * Grand cinematic victory fanfare with multi-voice harmonics
   */
  playCinematicWin(enabled: boolean): void {
    if (!enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      // Harmonic arpeggio + bass chord for impact
      const chords = [
        { bass: 261.63, treble: [523.25, 659.25], time: 0 },
        { bass: 329.63, treble: [659.25, 783.99], time: 0.14 },
        { bass: 392.00, treble: [783.99, 1046.50], time: 0.28 },
        { bass: 523.25, treble: [1046.50, 1318.51, 1567.98], time: 0.44 },
      ]

      chords.forEach(({ bass, treble, time }) => {
        const t = ctx.currentTime + time
        
        // Bass tone
        const oscBass = ctx.createOscillator()
        const gainBass = ctx.createGain()
        oscBass.type = 'sawtooth'
        oscBass.frequency.setValueAtTime(bass, t)
        gainBass.gain.setValueAtTime(0.12, t)
        gainBass.gain.exponentialRampToValueAtTime(0.001, t + 0.45)
        oscBass.connect(gainBass)
        gainBass.connect(ctx.destination)
        oscBass.start(t)
        oscBass.stop(t + 0.45)

        // Treble chimes
        treble.forEach((f) => {
          const oscT = ctx.createOscillator()
          const gainT = ctx.createGain()
          oscT.type = 'triangle'
          oscT.frequency.setValueAtTime(f, t)
          gainT.gain.setValueAtTime(0.15, t)
          gainT.gain.exponentialRampToValueAtTime(0.001, t + 0.55)
          oscT.connect(gainT)
          gainT.connect(ctx.destination)
          oscT.start(t)
          oscT.stop(t + 0.55)
        })
      })
    } catch {
      // Audio fallback
    }
  }
}

export const soundFx = new SoundController()
