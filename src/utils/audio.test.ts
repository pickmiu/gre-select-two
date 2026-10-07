import { describe, it, expect, vi, beforeEach } from 'vitest';
import { soundService } from './audio';

describe('SoundService', () => {
  let mockResume: ReturnType<typeof vi.fn>;
  let mockCreateOscillator: ReturnType<typeof vi.fn>;
  let mockCreateGain: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    soundService.setMuted(false);
    (soundService as unknown as { ctx: unknown }).ctx = null;
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

    function MockAudioContext(this: unknown) {
      return {
        state: 'suspended',
        currentTime: 1.5,
        resume: mockResume,
        createOscillator: mockCreateOscillator,
        createGain: mockCreateGain,
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

  it('resumes suspended context and plays sound on playSelect fallback', async () => {
    await soundService.playSelect();
    expect(mockResume).toHaveBeenCalled();
    expect(mockCreateOscillator).toHaveBeenCalled();
    expect(mockCreateGain).toHaveBeenCalled();
  });

  it('uses HTMLAudioElement pool when available', async () => {
    const mockPlay = vi.fn().mockResolvedValue(undefined);
    const mockLoad = vi.fn();
    class MockAudio {
      src: string;
      preload: string = '';
      volume: number = 1;
      currentTime: number = 0;
      constructor(src: string) {
        this.src = src;
      }
      play = mockPlay;
      load = mockLoad;
    }

    (soundService as unknown as { audioPool: unknown[] }).audioPool = [
      new MockAudio('data:audio/wav;base64,test'),
      new MockAudio('data:audio/wav;base64,test'),
    ];
    (soundService as unknown as { poolIndex: number }).poolIndex = 0;

    await soundService.playSelect();
    expect(mockPlay).toHaveBeenCalledTimes(1);
    expect(mockCreateOscillator).not.toHaveBeenCalled();
  });

  it('plays correct chime', async () => {
    await soundService.playCorrect();
    expect(mockResume).toHaveBeenCalled();
    expect(mockCreateOscillator).toHaveBeenCalled();
  });

  it('plays wrong sound', async () => {
    await soundService.playWrong();
    expect(mockResume).toHaveBeenCalled();
    expect(mockCreateOscillator).toHaveBeenCalled();
  });

  it('plays complete victory sound', async () => {
    await soundService.playComplete();
    expect(mockResume).toHaveBeenCalled();
    expect(mockCreateOscillator).toHaveBeenCalled();
  });

  it('does not play when muted', async () => {
    soundService.setMuted(true);
    await soundService.playSelect();
    expect(mockCreateOscillator).not.toHaveBeenCalled();
  });
});
