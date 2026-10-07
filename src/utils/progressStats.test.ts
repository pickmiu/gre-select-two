import { describe, it, expect } from 'vitest';
import { getGroupProgressStats } from './progressStats';
import { VocabGroup, GroupProgress } from '../types';

describe('getGroupProgressStats', () => {
  const mockGroup: VocabGroup = {
    groupId: 1,
    title: '第 1 组',
    rangeLabel: '1 - 30 词',
    pairs: new Array(30).fill(null).map((_, i) => ({
      id: `pair-${i}`,
      word1: `word1_${i}`,
      word2: `word2_${i}`,
      definition: `def_${i}`,
    })),
  };

  it('calculates 100% green when all questions are correct (wrongIndices is empty)', () => {
    const progress: GroupProgress = {
      status: 'completed',
      currentIndex: 30,
      wrongIndices: [],
      updatedAt: Date.now(),
    };

    const stats = getGroupProgressStats(mockGroup, progress);
    expect(stats.total).toBe(30);
    expect(stats.wrongCount).toBe(0);
    expect(stats.correctCount).toBe(30);
    expect(stats.correctPercent).toBe(100);
    expect(stats.wrongPercent).toBe(0);
    expect(stats.isAllCorrect).toBe(true);
  });

  it('calculates correct and wrong ratios when there are mistakes', () => {
    const progress: GroupProgress = {
      status: 'completed',
      currentIndex: 30,
      wrongIndices: [1, 5, 12, 18, 25, 29], // 6 wrong out of 30
      updatedAt: Date.now(),
    };

    const stats = getGroupProgressStats(mockGroup, progress);
    expect(stats.total).toBe(30);
    expect(stats.wrongCount).toBe(6);
    expect(stats.correctCount).toBe(24);
    expect(stats.correctPercent).toBe(80);
    expect(stats.wrongPercent).toBe(20);
    expect(stats.isAllCorrect).toBe(false);
  });

  it('calculates 100% red when all questions are wrong', () => {
    const progress: GroupProgress = {
      status: 'completed',
      currentIndex: 30,
      wrongIndices: Array.from({ length: 30 }, (_, i) => i),
      updatedAt: Date.now(),
    };

    const stats = getGroupProgressStats(mockGroup, progress);
    expect(stats.total).toBe(30);
    expect(stats.wrongCount).toBe(30);
    expect(stats.correctCount).toBe(0);
    expect(stats.correctPercent).toBe(0);
    expect(stats.wrongPercent).toBe(100);
    expect(stats.isAllCorrect).toBe(false);
  });
});
