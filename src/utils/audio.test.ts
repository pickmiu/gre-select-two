import { describe, it, expect, vi, beforeEach } from 'vitest';
import { soundService } from './audio';

describe('SoundService', () => {
  let mockResume: ReturnType<typeof vi.fn>;
  let mockCreateOscillator: ReturnType<typeof vi.fn>;
  let mockCreateGain: ReturnType<typeof vi.fn>;
  let mockCreateBuffer: ReturnType<typeof vi.fn>;
  let mockCreateBufferSource: ReturnType<typeof vi.fn>;
  let mockBufferSourceStart: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    soundService.setMuted(false);
    (soundService as unknown as { ctx: unknown }).ctx = null;
    (soundService as unknown as { selectBuffer: unknown }).selectBuffer = null;
    (soundService as unknown as { isUnlocked: boolean }).isUnlocked = false;

    mockResume = vi.fn().mockResolvedValue(undefined);
    mockCreateOscillator = vi.fn().mockReturnValue({
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    });
    mockCreateGain = vi.fn().mockReturnValue({
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    });
    mockBufferSourceStart = vi.fn();
    mockCreateBufferSource = vi.fn().mockReturnValue({
      buffer: null,
      connect: vi.fn(),
      start: mockBufferSourceStart,
    });
    mockCreateBuffer = vi.fn().mockReturnValue({
      length: 3748,
      sampleRate: 44100,
      getChannelData: vi.fn().mockReturnValue(new Float32Array(3748)),
    });

    function MockAudioContext(this: unknown) {
      return {
        state: 'suspended',
        sampleRate: 44100,
        currentTime: 1.5,
        resume: mockResume,
        createOscillator: mockCreateOscillator,
        createGain: mockCreateGain,
        createBuffer: mockCreateBuffer,
        createBufferSource: mockCreateBufferSource,
        destination: {},
      };
    }

    (globalThis as unknown as { window: unknown }).window = {
      AudioContext: MockAudioContext,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
  });

  it('toggles mute correctly', () => {
    expect(soundService.getMuted()).toBe(false);
    expect(soundService.toggleMute()).toBe(true);
    expect(soundService.getMuted()).toBe(true);
    expect(soundService.toggleMute()).toBe(false);
  });

  it('resumes suspended context when unlocking audio', async () => {
    await soundService.unlock();
    expect(mockResume).toHaveBeenCalled();
  });

  it('preloads and initializes AudioBuffer directly in memory', () => {
    soundService.preload();
    expect(mockCreateBuffer).toHaveBeenCalled();
  });

  it('plays select sound via AudioBufferSourceNode', async () => {
    soundService.preload();
    soundService.playSelect();
    expect(mockResume).toHaveBeenCalled();
    // Await promise microtask
    await Promise.resolve();
    expect(mockCreateBufferSource).toHaveBeenCalled();
    expect(mockBufferSourceStart).toHaveBeenCalledWith(0);
  });

  it('falls back to oscillator if buffer is unavailable', async () => {
    (soundService as unknown as { selectBuffer: unknown }).selectBuffer = null;
    mockCreateBuffer.mockImplementation(() => {
      throw new Error('Not supported');
    });
    soundService.playSelect();
    await Promise.resolve();
    expect(mockResume).toHaveBeenCalled();
    expect(mockCreateOscillator).toHaveBeenCalled();
  });

  it('plays correct chime', async () => {
    soundService.playCorrect();
    await Promise.resolve();
    expect(mockResume).toHaveBeenCalled();
    expect(mockCreateOscillator).toHaveBeenCalled();
  });

  it('plays wrong sound', async () => {
    soundService.playWrong();
    await Promise.resolve();
    expect(mockResume).toHaveBeenCalled();
    expect(mockCreateOscillator).toHaveBeenCalled();
  });

  it('plays complete victory sound', async () => {
    soundService.playComplete();
    await Promise.resolve();
    expect(mockResume).toHaveBeenCalled();
    expect(mockCreateOscillator).toHaveBeenCalled();
  });

  it('does not play when muted', async () => {
    soundService.setMuted(true);
    soundService.playSelect();
    await Promise.resolve();
    expect(mockCreateBufferSource).not.toHaveBeenCalled();
    expect(mockCreateOscillator).not.toHaveBeenCalled();
  });
});
