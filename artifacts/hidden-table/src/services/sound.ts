type SoundType = 'flip' | 'click' | 'shuffle' | 'success' | 'error';

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)(); }
    catch { return null; }
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.1) {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export const soundManager = {
  enabled: false,
  volume: 0.5,
  setEnabled(enabled: boolean) { this.enabled = enabled; },
  setVolume(vol: number) { this.volume = vol; },
  play(type: SoundType) {
    if (!this.enabled) return;
    switch (type) {
      case 'flip': playTone(600, 0.15, 'sine', this.volume * 0.08); break;
      case 'click': playTone(800, 0.05, 'sine', this.volume * 0.05); break;
      case 'shuffle': playTone(300, 0.3, 'sawtooth', this.volume * 0.03); break;
      case 'success':
        playTone(523, 0.2, 'sine', this.volume * 0.1);
        setTimeout(() => playTone(659, 0.2, 'sine', this.volume * 0.1), 150);
        setTimeout(() => playTone(784, 0.3, 'sine', this.volume * 0.1), 300);
        break;
      case 'error': playTone(200, 0.4, 'sawtooth', this.volume * 0.06); break;
    }
  },
};
