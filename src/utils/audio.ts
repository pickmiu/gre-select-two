// Audio Service with inlined audio data, preloaded Audio Element Pool & Web Audio API
const SELECT_SOUND_BASE64 =
  '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';

const SELECT_SOUND_DATA_URI = `data:audio/wav;base64,${SELECT_SOUND_BASE64}`;

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

class SoundService {
  private ctx: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private audioPool: HTMLAudioElement[] = [];
  private poolIndex: number = 0;
  private isMuted: boolean = false;
  private isUnlocked: boolean = false;
  private isPreloaded: boolean = false;

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
   * Preload audio assets immediately on homepage entry.
   * Creates an HTMLAudioElement pool and pre-decodes the audio buffer into memory.
   */
  public preload() {
    if (typeof window === 'undefined' || this.isPreloaded) return;
    this.isPreloaded = true;

    // 1. Create a pool of 4 HTML5 Audio instances with inlined data URI for zero network delay
    if (typeof Audio !== 'undefined') {
      try {
        for (let i = 0; i < 4; i++) {
          const audio = new Audio(SELECT_SOUND_DATA_URI);
          audio.preload = 'auto';
          audio.volume = 0.5;
          audio.load();
          this.audioPool.push(audio);
        }
      } catch {
        // Ignore audio element creation errors in restricted environments
      }
    }

    // 2. Pre-decode into Web Audio API AudioBuffer for sub-millisecond playback
    try {
      const ctx = this.getContext();
      if (ctx && typeof ctx.decodeAudioData === 'function' && typeof atob === 'function') {
        const u8 = base64ToUint8Array(SELECT_SOUND_BASE64);
        ctx.decodeAudioData(
          u8.buffer.slice(0),
          (buffer) => {
            this.audioBuffer = buffer;
          },
          () => {
            // Ignore decode errors
          }
        );
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Ensure AudioContext is created and resumed before playing any Web Audio.
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
    this.preload();

    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // Silently catch
      }
    }

    // Play a zero-volume silent pulse on the first user gesture to unlock HTMLAudioElement
    if (this.audioPool.length > 0) {
      const audio = this.audioPool[0];
      const prevVol = audio.volume;
      audio.volume = 0;
      try {
        const p = audio.play();
        if (p && typeof p.then === 'function') {
          p.then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = prevVol;
          }).catch(() => {
            audio.volume = prevVol;
          });
        }
      } catch {
        audio.volume = prevVol;
      }
    }

    this.isUnlocked = true;
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
   * Priority 1: Fast-path native HTMLAudioElement from preloaded in-memory pool
   * Priority 2: Web Audio (BufferSource or Synthesizer)
   */
  public async playSelect() {
    if (this.isMuted) return;

    // 1. Preloaded in-memory HTMLAudioElement pool (sub-millisecond, zero network)
    if (this.audioPool.length > 0) {
      try {
        const audio = this.audioPool[this.poolIndex];
        this.poolIndex = (this.poolIndex + 1) % this.audioPool.length;
        audio.currentTime = 0;
        audio.volume = 0.5;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            this.playWebAudioSelect();
          });
        }
        return;
      } catch {
        // Fall back to Web Audio
      }
    }

    // 2. Web Audio fallback
    this.playWebAudioSelect();
  }

  private playWebAudioSelect() {
    const ctx = this.getContext();
    if (!ctx) return;

    const play = () => {
      try {
        if (this.audioBuffer) {
          const source = ctx.createBufferSource();
          const gainNode = ctx.createGain();
          gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
          source.buffer = this.audioBuffer;
          source.connect(gainNode);
          gainNode.connect(ctx.destination);
          source.start(0);
          return;
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;

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
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(play).catch(() => {});
    } else {
      play();
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

// Preload immediately on page load
if (typeof window !== 'undefined') {
  soundService.preload();

  const events = ['click', 'touchstart', 'keydown', 'pointerdown'];
  const unlockAudio = () => {
    soundService.unlock();
    events.forEach((ev) => window.removeEventListener(ev, unlockAudio));
  };
  events.forEach((ev) => window.addEventListener(ev, unlockAudio, { passive: true }));
}
