import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuizQuestion, WordEntry, AppStage, AnswerStatus, MissingWordError } from '../types';
import { parseQuestionsCSV } from '../utils/csvParser';
import { useWordStore } from './useWordStore';
import {
  generateQuestionQueue,
  resolveAnswerToHeadword,
  shuffleQuestionOptions,
} from '../utils/questionGenerator';
import { vibrateSuccess, vibrateError } from '../utils/vibration';
import { soundService } from '../utils/audio';
import defaultQuestionsCSV from '../data/questions.csv?raw';

interface QuizState {
  allQuestions: QuizQuestion[];
  questionQueue: QuizQuestion[];
  currentQuestionIndex: number;
  completedQuestionStatus: Record<string | number, 'green' | 'yellow'>;
  currentSelections: string[];
  answerStatus: AnswerStatus;
  missingWordError: MissingWordError | null;
  appStage: AppStage;

  // Actions
  startPractice: (selectedWords: string[], wordList?: WordEntry[]) => boolean;
  forceStartPractice: (selectedWords: string[], wordList: WordEntry[]) => boolean;
  toggleOption: (option: string) => boolean; // returns true if correct (for auto advance)
  markUnknown: () => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  clearMissingWordError: () => void;
  importQuestions: (newQuestions: QuizQuestion[], replace?: boolean) => void;
  resetQuestionsToDefault: () => void;
  exitPractice: () => void;
}

const defaultQuestions = parseQuestionsCSV(defaultQuestionsCSV);

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      allQuestions: defaultQuestions,
      questionQueue: [],
      currentQuestionIndex: 0,
      completedQuestionStatus: {},
      currentSelections: [],
      answerStatus: 'idle',
      missingWordError: null,
      appStage: 'selection',

      startPractice: (selectedWords, wordList = []) => {
        const { allQuestions } = get();
        const result = generateQuestionQueue(selectedWords, allQuestions, wordList, false);

        if (!result.success || !result.questions) {
          set({ missingWordError: result.error || null });
          return false;
        }

        set({
          missingWordError: null,
          questionQueue: result.questions,
          currentQuestionIndex: 0,
          completedQuestionStatus: {},
          currentSelections: [],
          answerStatus: 'idle',
          appStage: 'quiz',
        });

        return true;
      },

      forceStartPractice: (selectedWords, wordList) => {
        const { allQuestions } = get();
        const result = generateQuestionQueue(selectedWords, allQuestions, wordList, true);

        if (!result.questions || result.questions.length === 0) {
          return false;
        }

        set({
          missingWordError: null,
          questionQueue: result.questions,
          currentQuestionIndex: 0,
          completedQuestionStatus: {},
          currentSelections: [],
          answerStatus: 'idle',
          appStage: 'quiz',
        });

        return true;
      },

      toggleOption: (option) => {
        const state = get();
        if (state.answerStatus === 'correct' || state.answerStatus === 'wrong' || state.answerStatus === 'unknown') {
          return false;
        }

        const currentQ = state.questionQueue[state.currentQuestionIndex];
        if (!currentQ) return false;

        let nextSelections: string[];
        if (state.currentSelections.includes(option)) {
          nextSelections = state.currentSelections.filter((item) => item !== option);
        } else {
          if (state.currentSelections.length >= 2) {
            return false;
          }
          nextSelections = [...state.currentSelections, option];
        }

        soundService.playSelect();
        set({ currentSelections: nextSelections });

        // If exactly 2 options selected, evaluate answer!
        if (nextSelections.length === 2) {
          const isCorrect =
            nextSelections.length === currentQ.answers.length &&
            nextSelections.every((ans) =>
              currentQ.answers.some((a) => a.toLowerCase().trim() === ans.toLowerCase().trim())
            );

          if (isCorrect) {
            vibrateSuccess();
            soundService.playCorrect();

            // Increment mastery count for answer-base words in useWordStore
            const wordStore = useWordStore.getState();
            const targetBases =
              currentQ.answerBases && currentQ.answerBases.length > 0
                ? currentQ.answerBases
                : currentQ.answers;

            const resolvedHeadwords = new Set<string>();

            targetBases.forEach((ans, idx) => {
              const ansWord = currentQ.answers[idx] || ans;
              const headword = resolveAnswerToHeadword(ansWord, ans, wordStore.wordList);
              if (headword) {
                resolvedHeadwords.add(headword);
              }
            });

            resolvedHeadwords.forEach((hw) => {
              wordStore.incrementWordMastery(hw);
            });

            set((prev) => {
              const currentStatus = prev.completedQuestionStatus[currentQ.id];
              const newStatus: 'green' | 'yellow' = currentStatus === 'yellow' ? 'yellow' : 'green';
              return {
                answerStatus: 'correct',
                completedQuestionStatus: {
                  ...prev.completedQuestionStatus,
                  [currentQ.id]: newStatus,
                },
              };
            });
            return true; // signal correct answer to caller
          } else {
            vibrateError();
            soundService.playWrong();
            set((prev) => {
              const newStatus: 'green' | 'yellow' = 'yellow';
              return {
                answerStatus: 'wrong',
                completedQuestionStatus: {
                  ...prev.completedQuestionStatus,
                  [currentQ.id]: newStatus,
                },
                // Append currentQ to queue for retry (total questions +1) with reshuffled options
                questionQueue: [...prev.questionQueue, shuffleQuestionOptions(currentQ)],
              };
            });
            return false;
          }
        }

        return false;
      },

      markUnknown: () => {
        const state = get();
        const currentQ = state.questionQueue[state.currentQuestionIndex];
        if (!currentQ) return;

        vibrateError();
        soundService.playWrong();
        set((prev) => {
          const newStatus: 'green' | 'yellow' = 'yellow';
          return {
            answerStatus: 'unknown',
            completedQuestionStatus: {
              ...prev.completedQuestionStatus,
              [currentQ.id]: newStatus,
            },
            // Append currentQ to queue for retry (total questions +1) with reshuffled options
            questionQueue: [...prev.questionQueue, shuffleQuestionOptions(currentQ)],
          };
        });
      },

      nextQuestion: () => {
        const state = get();
        if (state.currentQuestionIndex < state.questionQueue.length - 1) {
          set({
            currentQuestionIndex: state.currentQuestionIndex + 1,
            currentSelections: [],
            answerStatus: 'idle',
          });
        } else {
          // Reached end of all questions including retries!
          soundService.playComplete();
          set({
            appStage: 'completion',
            currentSelections: [],
            answerStatus: 'idle',
          });
        }
      },

      previousQuestion: () => {
        const state = get();
        if (state.currentQuestionIndex > 0) {
          set({
            currentQuestionIndex: state.currentQuestionIndex - 1,
            currentSelections: [],
            answerStatus: 'idle',
          });
        }
      },

      clearMissingWordError: () => set({ missingWordError: null }),

      importQuestions: (newQuestions, replace = false) =>
        set((state) => ({
          allQuestions: replace ? newQuestions : [...state.allQuestions, ...newQuestions],
        })),

      resetQuestionsToDefault: () =>
        set({
          allQuestions: defaultQuestions,
          questionQueue: [],
          currentQuestionIndex: 0,
          completedQuestionStatus: {},
          currentSelections: [],
          answerStatus: 'idle',
          missingWordError: null,
          appStage: 'selection',
        }),

      exitPractice: () =>
        set({
          appStage: 'selection',
          currentSelections: [],
          answerStatus: 'idle',
        }),
    }),
    {
      name: 'gre_quiz_store_v5',
      partialize: (state) => ({
        allQuestions: state.allQuestions,
        questionQueue: state.questionQueue,
        currentQuestionIndex: state.currentQuestionIndex,
        completedQuestionStatus: state.completedQuestionStatus,
        appStage: state.appStage,
      }),
    }
  )
);
