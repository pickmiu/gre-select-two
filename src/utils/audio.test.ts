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

  it('resumes suspended context and plays sound on playSelect', async () => {
    await soundService.playSelect();
    expect(mockResume).toHaveBeenCalled();
    expect(mockCreateOscillator).toHaveBeenCalled();
    expect(mockCreateGain).toHaveBeenCalled();
  });

  it('does not play when muted', async () => {
    soundService.setMuted(true);
    await soundService.playSelect();
    expect(mockCreateOscillator).not.toHaveBeenCalled();
  });
});
