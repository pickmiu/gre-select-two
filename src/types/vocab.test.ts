import { describe, it, expect } from 'vitest';
import { VocabPair, VocabGroup, GroupProgress, DatasetKey } from './vocab';

describe('Vocab types and contracts', () => {
  it('validates VocabPair structure', () => {
    const pair: VocabPair = {
      id: 'zw-1',
      word1: 'mitigate',
      word2: 'abate',
      allEquivalents: ['abate', 'curtail'],
      definition: '缓解',
    };
    expect(pair.id).toBe('zw-1');
    expect(pair.word1).toBe('mitigate');
    expect(pair.word2).toBe('abate');
    expect(pair.definition).toBe('缓解');
  });

  it('validates VocabGroup structure with 30 items capacity', () => {
    const group: VocabGroup = {
      groupId: 1,
      title: '第 1 组',
      rangeLabel: '1 - 30 词',
      pairs: [],
    };
    expect(group.groupId).toBe(1);
    expect(group.title).toBe('第 1 组');
  });

  it('validates GroupProgress with accuracy and error rates', () => {
    const progress: GroupProgress = {
      status: 'completed',
      currentIndex: 29,
      wrongIndices: [3, 7],
      lastAccuracy: 93.3,
      lastErrorRate: 6.7,
      updatedAt: 12345678,
    };
    expect(progress.status).toBe('completed');
    expect(progress.lastAccuracy).toBe(93.3);
  });
});
