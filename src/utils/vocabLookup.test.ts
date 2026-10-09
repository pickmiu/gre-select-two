import { describe, it, expect } from 'vitest';
import { lookupWordDefinition, lookupCompletionWordDefinition } from './vocabLookup';

describe('lookupWordDefinition', () => {
  it('looks up words with leading articles', () => {
    expect(lookupWordDefinition('an innovative')).toBeTruthy();
    expect(lookupWordDefinition('an original')).toBeTruthy();
    expect(lookupWordDefinition('a serious')).toBeTruthy();
    expect(lookupWordDefinition('a compelling')).toBeTruthy();
    expect(lookupWordDefinition('a coherent')).toBeTruthy();
    expect(lookupWordDefinition('an orderly')).toBeTruthy();
  });

  it('looks up adverbs and distractor words', () => {
    expect(lookupWordDefinition('relatively')).toBeTruthy();
    expect(lookupWordDefinition('comparatively')).toBeTruthy();
    expect(lookupWordDefinition('rarely')).toBeTruthy();
    expect(lookupWordDefinition('nearly')).toBeTruthy();
    expect(lookupWordDefinition('hardly')).toBeTruthy();
    expect(lookupWordDefinition('scarcely')).toBeTruthy();
  });
});

describe('lookupCompletionWordDefinition (bbgre3600 fallback for results page)', () => {
  it('retrieves definitions for past tense and inflected options using bbgre3600', () => {
    expect(lookupCompletionWordDefinition('obscured')).toContain('模糊');
    expect(lookupCompletionWordDefinition('precluded')).toContain('排除');
    expect(lookupCompletionWordDefinition('overshadowed')).toBeTruthy();
    expect(lookupCompletionWordDefinition('mitigated')).toContain('缓解');
    expect(lookupCompletionWordDefinition('abated')).toContain('减弱');
    expect(lookupCompletionWordDefinition('redirected')).toContain('导向');
  });
});

