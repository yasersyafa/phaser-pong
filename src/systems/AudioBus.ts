type SfxName = 'paddleHit' | 'wallBounce' | 'score' | 'win';

interface ToneSpec {
  freq: number;
  duration: number;
  type: OscillatorType;
  gain: number;
  glide?: number;
}

const SFX: Record<SfxName, ToneSpec> = {
  paddleHit: { freq: 480, duration: 0.05, type: 'square', gain: 0.25 },
  wallBounce: { freq: 240, duration: 0.05, type: 'square', gain: 0.22 },
  score: { freq: 140, duration: 0.35, type: 'sawtooth', gain: 0.28, glide: 80 },
  win: { freq: 660, duration: 0.6, type: 'triangle', gain: 0.3, glide: 1000 },
};

export class AudioBus {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;
  private volume = 0.7;

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) this.masterGain.gain.value = this.muted ? 0 : this.volume;
  }

  setMuted(m: boolean): void {
    this.muted = m;
    if (this.masterGain) this.masterGain.gain.value = this.muted ? 0 : this.volume;
  }

  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  private ensureCtx(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor = (globalThis as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
      ?? (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : this.volume;
    this.masterGain.connect(this.ctx.destination);
    return this.ctx;
  }

  play(name: SfxName): void {
    if (this.muted) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const spec = SFX[name];
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = spec.type;
    osc.frequency.value = spec.freq;
    if (spec.glide) {
      osc.frequency.linearRampToValueAtTime(spec.glide, ctx.currentTime + spec.duration);
    }
    env.gain.value = 0;
    env.gain.linearRampToValueAtTime(spec.gain, ctx.currentTime + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + spec.duration);
    osc.connect(env);
    env.connect(this.masterGain);
    osc.start();
    osc.stop(ctx.currentTime + spec.duration + 0.02);
  }
}

export const audioBus = new AudioBus();
