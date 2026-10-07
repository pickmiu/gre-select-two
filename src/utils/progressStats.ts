import { VocabGroup, GroupProgress } from '../types';

export interface GroupProgressStats {
  total: number;
  wrongCount: number;
  correctCount: number;
  correctPercent: number;
  wrongPercent: number;
  isAllCorrect: boolean;
}

export function getGroupProgressStats(
  group: VocabGroup,
  progress?: GroupProgress
): GroupProgressStats {
  const total =
    progress?.sessionQuestions?.length ||
    group.pairs?.length ||
    30;

  const wrongCount = progress?.wrongIndices ? progress.wrongIndices.length : 0;
  const correctCount = Math.max(0, total - wrongCount);

  const correctPercent = total > 0 ? (correctCount / total) * 100 : 100;
  const wrongPercent = total > 0 ? (wrongCount / total) * 100 : 0;
  const isAllCorrect = wrongCount === 0;

  return {
    total,
    wrongCount,
    correctCount,
    correctPercent,
    wrongPercent,
    isAllCorrect,
  };
}
