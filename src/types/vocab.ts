import { QuizQuestion } from './index';

export type DatasetKey = 'zhangwei' | 'bbgre';
export type GroupStatus = 'unstarted' | 'in_progress' | 'completed';

export interface VocabPair {
  id: string;
  word1: string;
  word2: string;
  allEquivalents?: string[];
  definition: string;
}

export interface VocabGroup {
  groupId: number;
  title: string;
  rangeLabel: string;
  pairs: VocabPair[];
}

export interface GroupProgress {
  status: GroupStatus;
  currentIndex: number;
  sessionQuestions?: QuizQuestion[];
  wrongIndices: number[];
  userAnswers?: Record<number, string[]>;
  lastAccuracy?: number;
  lastErrorRate?: number;
  updatedAt: number;
}
