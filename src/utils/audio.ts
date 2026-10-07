// High-performance, zero-latency Web Audio Synthesizer & Buffer Player

class SoundService {
  private ctx: AudioContext | null = null;
  private selectBuffer: AudioBuffer | null = null;
  private isMuted: boolean = false;
  private isUnlocked: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initBuffers(this.ctx);
      }
    }
    return this.ctx;
  }

  /**
   * Synthesize pristine Float32 audio waveform directly into native AudioBuffer.
   * Zero HTTP network requests, zero decode overhead, instant sub-millisecond memory ready.
   */
  private initBuffers(ctx: AudioContext) {
    if (this.selectBuffer || typeof ctx.createBuffer !== 'function') return;
    try {
      const sampleRate = ctx.sampleRate || 44100;
      const duration = 0.085;
      const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const progress = t / duration;
        // Pitch envelope: 650Hz down to 280Hz
        const freq = 650 * Math.pow(280 / 650, progress);
        const phase =
          2 * Math.PI * (650 * (Math.pow(280 / 650, progress) - 1) / Math.log(280 / 650)) * duration;
        // Crisp 3ms attack, followed by smooth exponential decay
        const amp = t < 0.003 ? t / 0.003 : Math.exp(-(t - 0.003) * 38);
        data[i] = amp * (0.82 * Math.sin(phase) + 0.18 * Math.sin(phase * 2)) * 0.55;
      }
      this.selectBuffer = buffer;
    } catch {
      // Ignore in environments where createBuffer isn't supported
    }
  }

  /**
   * Preload audio immediately on app launch / homepage entry.
   * Ensures AudioContext and memory buffer are created as early as possible.
   */
  public preload() {
    if (typeof window === 'undefined') return;
    const ctx = this.getContext();
    if (ctx) {
      this.initBuffers(ctx);
    }
  }

  /**
   * Ensure AudioContext is running before playing audio.
   */
  public async ensureContext(): Promise<AudioContext | null> {
    const ctx = this.getContext();
    if (!ctx) return null;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // Silently catch
      }
    }
    return ctx;
  }

  /**
   * Pre-warm audio hardware and unlock browser autoplay restrictions on first user interaction.
   */
  public async unlock(): Promise<void> {
    if (this.isUnlocked) return;
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
        this.isUnlocked = true;
      } catch {
        // Silently catch
      }
    } else if (ctx && ctx.state === 'running') {
      this.isUnlocked = true;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  /**
   * Play option selection pop sound.
   * Pure native Web Audio buffer playback with guaranteed instant execution from click 1.
   */
  public playSelect() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const play = () => {
      try {
        if (this.selectBuffer) {
          const src = ctx.createBufferSource();
          src.buffer = this.selectBuffer;
          src.connect(ctx.destination);
          src.start(0);
          return;
        }

        // Direct oscillator synthesis fallback
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.07);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } catch {
        // Audio playback fails silently if restricted
      }
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(play).catch(() => {});
    } else {
      play();
    }
  }

  // 2. Duolingo Correct Chime (Bright 2-note Ding-Dong)
  public playCorrect() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const play = () => {
      try {
        const now = ctx.currentTime;
        // Note 1: G5 (784Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(784, now);
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.22);

        // Note 2: C6 (1046.5Hz) - Chime higher note
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1046.5, now + 0.1);
        gain2.gain.setValueAtTime(0.25, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.5);
      } catch {
        // Audio fails silently
      }
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(play).catch(() => {});
    } else {
      play();
    }
  }

  // 3. Duolingo Wrong Sound (Low dull dual-tone)
  public playWrong() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const play = () => {
      try {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(220, now);
        osc1.frequency.linearRampToValueAtTime(150, now + 0.3);

        gain1.gain.setValueAtTime(0.18, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);
      } catch {
        // Audio fails silently
      }
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(play).catch(() => {});
    } else {
      play();
    }
  }

  // 4. Duolingo Level Complete Victory Fanfare
  public playComplete() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const play = () => {
      try {
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        const times = [0, 0.12, 0.24, 0.36];

        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = now + times[idx];

          osc.type = idx === notes.length - 1 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.22, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(noteTime);
          osc.stop(noteTime + 0.6);
        });
      } catch {
        // Audio fails silently
      }
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(play).catch(() => {});
    } else {
      play();
    }
  }
}

export const soundService = new SoundService();

// Preload and attach universal one-shot user gesture listener
if (typeof window !== 'undefined') {
  soundService.preload();

  const events = ['click', 'touchstart', 'keydown', 'pointerdown'];
  const unlockAudio = () => {
    soundService.unlock();
    events.forEach((ev) => window.removeEventListener(ev, unlockAudio));
  };
  events.forEach((ev) => window.addEventListener(ev, unlockAudio, { passive: true }));
}
