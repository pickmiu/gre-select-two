import { describe, it, expect } from 'vitest';
import { lookupWordDefinition } from './vocabLookup';

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
