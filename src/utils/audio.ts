// Web Audio API Synthesizer for Duolingo-style Sound Effects

class SoundService {
  private ctx: AudioContext | null = null;
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
      }
    }
    return this.ctx;
  }

  /**
   * Ensure AudioContext is created and resumed before playing any sound.
   */
  public async ensureContext(): Promise<AudioContext | null> {
    const ctx = this.getContext();
    if (!ctx) return null;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // Silently catch if user interaction has not yet unlocked audio
      }
    }
    return ctx;
  }

  /**
   * Unlock AudioContext on the first user interaction.
   */
  public async unlock(): Promise<void> {
    if (this.isUnlocked) return;
    const ctx = await this.ensureContext();
    if (ctx && ctx.state === 'running') {
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

  // 1. Duolingo Option Select Pop/Bloop
  public async playSelect() {
    if (this.isMuted) return;
    const ctx = await this.ensureContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      // Crisp Duolingo-style pop: 520Hz down to 220Hz over 60ms
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Audio playback fails silently if restricted
    }
  }

  // 2. Duolingo Correct Chime (Bright 2-note Ding-Dong)
  public async playCorrect() {
    if (this.isMuted) return;
    const ctx = await this.ensureContext();
    if (!ctx) return;

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
  }

  // 3. Duolingo Wrong Sound (Low dull dual-tone)
  public async playWrong() {
    if (this.isMuted) return;
    const ctx = await this.ensureContext();
    if (!ctx) return;

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
  }

  // 4. Duolingo Level Complete Victory Fanfare
  public async playComplete() {
    if (this.isMuted) return;
    const ctx = await this.ensureContext();
    if (!ctx) return;

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
  }
}

export const soundService = new SoundService();

// Pre-warm / unlock Web Audio API on first user interaction anywhere in window
if (typeof window !== 'undefined') {
  const events = ['click', 'touchstart', 'keydown', 'pointerdown'];
  const unlockAudio = () => {
    soundService.unlock();
    events.forEach((ev) => window.removeEventListener(ev, unlockAudio));
  };
  events.forEach((ev) => window.addEventListener(ev, unlockAudio, { passive: true }));
}
