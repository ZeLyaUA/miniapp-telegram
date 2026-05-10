export type BreathingPhase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut'

class BreathingAudio {
  private ctx: AudioContext | null = null

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext()
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  private playTone(freq: number, duration = 0.4, volume = 0.2, type: OscillatorType = 'sine') {
    try {
      const ctx = this.getCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = type
      osc.frequency.value = freq
      gain.gain.setValueAtTime(volume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + duration)
    } catch {}
  }

  playStart() {
    this.playTone(528, 0.25, 0.2)
    setTimeout(() => this.playTone(660, 0.35, 0.25), 280)
  }

  playPhase(phase: BreathingPhase) {
    const freqMap: Record<BreathingPhase, number> = {
      inhale: 440,
      holdIn: 528,
      exhale: 330,
      holdOut: 264,
    }
    this.playTone(freqMap[phase], 0.4, 0.2)
  }

  playComplete() {
    this.playTone(528, 0.5, 0.2)
    setTimeout(() => this.playTone(660, 0.6, 0.2), 200)
    setTimeout(() => this.playTone(792, 0.8, 0.15), 400)
  }
}

export const breathingAudio = new BreathingAudio()
