export interface WordEntry {
  word: string;
  equivalents: string[];
  definition: string;
}

export interface QuizQuestion {
  id: number | string;
  stem: string;
  options: string[];
  answers: string[];
}

export type AppStage = 'selection' | 'quiz' | 'completion';

export type AnswerStatus = 'idle' | 'checking' | 'correct' | 'wrong' | 'unknown';

export interface MissingWordError {
  missingWords: string[];
  reason: string;
}

export interface SessionStats {
  totalSelected: number;
  totalQuestions: number;
  firstTimeCorrect: number;
  wrongAttempts: number;
  startTime: number;
  endTime?: number;
}
