import { describe, it, expect, beforeEach } from 'vitest';
import { useGroupProgressStore } from './useGroupProgressStore';
import { VocabGroup, VocabPair } from '../types';

describe('useGroupProgressStore', () => {
  const mockPairs: VocabPair[] = [
    { id: 'zw-1', word1: 'mitigate', word2: 'abate', definition: '缓解' },
    { id: 'zw-2', word1: 'anomaly', word2: 'aberration', definition: '异常' },
  ];

  const mockGroup: VocabGroup = {
    groupId: 1,
    title: '第 1 组',
    rangeLabel: '1 - 2 词',
    pairs: mockPairs,
  };

  beforeEach(() => {
    useGroupProgressStore.getState().resetAll();
  });

  it('switches dataset correctly and maintains isolated progress', () => {
    const store = useGroupProgressStore.getState();
    expect(store.currentDataset).toBe('zhangwei');

    store.setDataset('bbgre');
    expect(useGroupProgressStore.getState().currentDataset).toBe('bbgre');
  });

  it('starts a group and transitions stage to quiz', () => {
    const store = useGroupProgressStore.getState();
    store.startGroup(mockGroup, [], mockPairs);

    const updated = useGroupProgressStore.getState();
    expect(updated.appStage).toBe('quiz');
    expect(updated.activeGroupId).toBe(1);
    expect(updated.activeQueue.length).toBe(2);
    expect(updated.currentIndex).toBe(0);
    expect(updated.wrongIndices).toEqual([]);

    const grpProgress = updated.progress.zhangwei[1];
    expect(grpProgress.status).toBe('in_progress');
  });

  it('answers questions and advances until completion', () => {
    const store = useGroupProgressStore.getState();
    store.startGroup(mockGroup, [], mockPairs);

    // Answer Q1 correct
    useGroupProgressStore.getState().answerQuestion(true);
    expect(useGroupProgressStore.getState().currentIndex).toBe(1);
    expect(useGroupProgressStore.getState().wrongIndices).toEqual([]);

    // Answer Q2 wrong
    useGroupProgressStore.getState().answerQuestion(false);
    const completed = useGroupProgressStore.getState();
    expect(completed.appStage).toBe('completion');
    expect(completed.wrongIndices).toEqual([1]);

    const grp = completed.progress.zhangwei[1];
    expect(grp.status).toBe('completed');
    expect(grp.lastAccuracy).toBe(50);
    expect(grp.lastErrorRate).toBe(50);
  });

  it('supports exiting and resuming session from saved index', () => {
    const store = useGroupProgressStore.getState();
    store.startGroup(mockGroup, [], mockPairs);

    // Answer Q1 correct, at Q2
    useGroupProgressStore.getState().answerQuestion(true);
    expect(useGroupProgressStore.getState().currentIndex).toBe(1);

    // Exit to homepage
    useGroupProgressStore.getState().exitSession();
    expect(useGroupProgressStore.getState().appStage).toBe('selection');
    expect(useGroupProgressStore.getState().progress.zhangwei[1].status).toBe('in_progress');
    expect(useGroupProgressStore.getState().progress.zhangwei[1].currentIndex).toBe(1);

    // Resume group
    useGroupProgressStore.getState().startGroup(mockGroup, [], mockPairs);
    expect(useGroupProgressStore.getState().appStage).toBe('quiz');
    expect(useGroupProgressStore.getState().currentIndex).toBe(1);
  });
});
