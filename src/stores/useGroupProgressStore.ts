import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  DatasetKey,
  GroupProgress,
  QuizQuestion,
  VocabGroup,
  VocabPair,
  AppStage,
} from '../types';
import { generateGroupQuizQueue } from '../utils/questionGenerator';
import { getQuestionTranslation } from '../utils/csvParser';

interface GroupProgressState {
  currentDataset: DatasetKey;
  progress: {
    zhangwei: Record<number, GroupProgress>;
    bbgre: Record<number, GroupProgress>;
  };
  activeGroupId: number | null;
  activeGroupTitle: string;
  activeQueue: QuizQuestion[];
  currentIndex: number;
  wrongIndices: number[];
  userAnswers: Record<number, string[]>;
  elapsedTime: number;
  realExamMode: boolean;
  showChineseStem?: boolean;
  appStage: AppStage;

  // Actions
  setDataset: (dataset: DatasetKey) => void;
  setRealExamMode: (enabled: boolean) => void;
  setShowChineseStem?: (show: boolean) => void;
  startGroup: (
    group: VocabGroup,
    allQuestions: QuizQuestion[],
    allPoolPairs: VocabPair[]
  ) => void;
  updateElapsedTime: (seconds: number) => void;
  answerQuestion: (selectedOptions: string[] | boolean) => void;
  previousQuestion: () => void;
  exitSession: () => void;
  resetAll: () => void;
}

const initialProgress: {
  zhangwei: Record<number, GroupProgress>;
  bbgre: Record<number, GroupProgress>;
} = {
  zhangwei: {},
  bbgre: {},
};

export const useGroupProgressStore = create<GroupProgressState>()(
  persist(
    (set, get) => ({
      currentDataset: 'bbgre',
      progress: initialProgress,
      activeGroupId: null,
      activeGroupTitle: '',
      activeQueue: [],
      currentIndex: 0,
      wrongIndices: [],
      userAnswers: {},
      elapsedTime: 0,
      realExamMode: false,
      showChineseStem: false,
      appStage: 'selection',

      setDataset: (dataset) => set({ currentDataset: dataset }),
      setRealExamMode: (enabled) => set({ realExamMode: enabled }),
      setShowChineseStem: (show) => set({ realExamMode: !show }),

      startGroup: (group, allQuestions, allPoolPairs) => {
        const state = get();
        const dataset = state.currentDataset;
        const existing = state.progress[dataset]?.[group.groupId];

        // Resume if in_progress and has sessionQuestions
        if (
          existing &&
          existing.status === 'in_progress' &&
          existing.sessionQuestions &&
          existing.sessionQuestions.length > 0
        ) {
          const patchedQueue = existing.sessionQuestions.map((q) => {
            if (!q.translation) {
              const trans = getQuestionTranslation(q);
              return trans ? { ...q, translation: trans } : q;
            }
            return q;
          });
          set({
            activeGroupId: group.groupId,
            activeGroupTitle: group.title,
            activeQueue: patchedQueue,
            currentIndex: existing.currentIndex,
            wrongIndices: existing.wrongIndices || [],
            userAnswers: existing.userAnswers || {},
            elapsedTime: existing.elapsedTime || 0,
            appStage: 'quiz',
          });
          return;
        }

        // Generate fresh questions
        const queue = generateGroupQuizQueue(group.pairs, allQuestions, allPoolPairs);
        const newGroupProgress: GroupProgress = {
          status: 'in_progress',
          currentIndex: 0,
          sessionQuestions: queue,
          wrongIndices: [],
          userAnswers: {},
          elapsedTime: 0,
          lastAccuracy: existing?.lastAccuracy,
          lastErrorRate: existing?.lastErrorRate,
          updatedAt: Date.now(),
        };

        set({
          activeGroupId: group.groupId,
          activeGroupTitle: group.title,
          activeQueue: queue,
          currentIndex: 0,
          wrongIndices: [],
          userAnswers: {},
          elapsedTime: 0,
          appStage: 'quiz',
          progress: {
            ...state.progress,
            [dataset]: {
              ...state.progress[dataset],
              [group.groupId]: newGroupProgress,
            },
          },
        });
      },

      updateElapsedTime: (seconds) => {
        const state = get();
        const { activeGroupId, currentDataset } = state;
        if (!activeGroupId) return;

        const currentProgress = state.progress[currentDataset]?.[activeGroupId];
        if (currentProgress && currentProgress.status === 'in_progress') {
          set({
            elapsedTime: seconds,
            progress: {
              ...state.progress,
              [currentDataset]: {
                ...state.progress[currentDataset],
                [activeGroupId]: {
                  ...currentProgress,
                  elapsedTime: seconds,
                  updatedAt: Date.now(),
                },
              },
            },
          });
        } else {
          set({ elapsedTime: seconds });
        }
      },

      answerQuestion: (selectedOptions) => {
        const state = get();
        const { activeGroupId, currentDataset, currentIndex, activeQueue, wrongIndices, userAnswers } = state;
        if (!activeGroupId || activeQueue.length === 0) return;

        const currentQ = activeQueue[currentIndex];
        let isCorrect = false;
        let optionsRecord: string[] = [];

        if (typeof selectedOptions === 'boolean') {
          isCorrect = selectedOptions;
          optionsRecord = isCorrect ? currentQ.answers : ['__UNKNOWN__'];
        } else {
          optionsRecord = selectedOptions;
          isCorrect =
            selectedOptions.length === currentQ.answers.length &&
            selectedOptions.every((ans) =>
              currentQ.answers.some(
                (a) => a.toLowerCase().trim() === ans.toLowerCase().trim()
              )
            );
        }

        const nextWrongIndices = isCorrect
          ? wrongIndices.filter((idx) => idx !== currentIndex)
          : Array.from(new Set([...wrongIndices, currentIndex]));

        const nextUserAnswers = {
          ...userAnswers,
          [currentIndex]: optionsRecord,
        };

        if (currentIndex < activeQueue.length - 1) {
          const nextIndex = currentIndex + 1;
          const currentProgress = state.progress[currentDataset]?.[activeGroupId];

          const updatedGroupProgress: GroupProgress = {
            ...(currentProgress || { status: 'in_progress', updatedAt: Date.now() }),
            status: 'in_progress',
            currentIndex: nextIndex,
            sessionQuestions: activeQueue,
            wrongIndices: nextWrongIndices,
            userAnswers: nextUserAnswers,
            elapsedTime: state.elapsedTime,
            updatedAt: Date.now(),
          };

          set({
            currentIndex: nextIndex,
            wrongIndices: nextWrongIndices,
            userAnswers: nextUserAnswers,
            progress: {
              ...state.progress,
              [currentDataset]: {
                ...state.progress[currentDataset],
                [activeGroupId]: updatedGroupProgress,
              },
            },
          });
        } else {
          // Finished the group!
          const total = activeQueue.length;
          const wrongCount = nextWrongIndices.length;
          const correctCount = total - wrongCount;
          const accuracy = Math.round((correctCount / total) * 1000) / 10;
          const errorRate = Math.round((wrongCount / total) * 1000) / 10;

          const completedProgress: GroupProgress = {
            status: 'completed',
            currentIndex: currentIndex,
            sessionQuestions: activeQueue,
            wrongIndices: nextWrongIndices,
            userAnswers: nextUserAnswers,
            lastAccuracy: accuracy,
            lastErrorRate: errorRate,
            elapsedTime: state.elapsedTime,
            updatedAt: Date.now(),
          };

          set({
            wrongIndices: nextWrongIndices,
            userAnswers: nextUserAnswers,
            appStage: 'completion',
            progress: {
              ...state.progress,
              [currentDataset]: {
                ...state.progress[currentDataset],
                [activeGroupId]: completedProgress,
              },
            },
          });
        }
      },

      previousQuestion: () => {
        const state = get();
        const { currentIndex, activeGroupId, currentDataset, activeQueue, wrongIndices, userAnswers } = state;
        if (currentIndex <= 0 || !activeGroupId) return;

        const prevIndex = currentIndex - 1;
        const currentProgress = state.progress[currentDataset]?.[activeGroupId];

        const updatedGroupProgress: GroupProgress = {
          ...(currentProgress || { status: 'in_progress', updatedAt: Date.now() }),
          status: 'in_progress',
          currentIndex: prevIndex,
          sessionQuestions: activeQueue,
          wrongIndices,
          userAnswers,
          elapsedTime: state.elapsedTime,
          updatedAt: Date.now(),
        };

        set({
          currentIndex: prevIndex,
          progress: {
            ...state.progress,
            [currentDataset]: {
              ...state.progress[currentDataset],
              [activeGroupId]: updatedGroupProgress,
            },
          },
        });
      },

      exitSession: () => {
        const state = get();
        const { activeGroupId, currentDataset, currentIndex, activeQueue, wrongIndices, userAnswers, elapsedTime } = state;

        if (activeGroupId && activeQueue.length > 0) {
          const currentProgress = state.progress[currentDataset]?.[activeGroupId];
          const isCompleted = currentProgress?.status === 'completed';

          if (!isCompleted) {
            const pausedProgress: GroupProgress = {
              ...(currentProgress || { status: 'in_progress', updatedAt: Date.now() }),
              status: 'in_progress',
              currentIndex,
              sessionQuestions: activeQueue,
              wrongIndices,
              userAnswers,
              elapsedTime,
              updatedAt: Date.now(),
            };

            set({
              appStage: 'selection',
              progress: {
                ...state.progress,
                [currentDataset]: {
                  ...state.progress[currentDataset],
                  [activeGroupId]: pausedProgress,
                },
              },
            });
            return;
          }
        }

        set({ appStage: 'selection' });
      },

      resetAll: () => {
        set({
          currentDataset: 'bbgre',
          progress: { zhangwei: {}, bbgre: {} },
          activeGroupId: null,
          activeGroupTitle: '',
          activeQueue: [],
          currentIndex: 0,
          wrongIndices: [],
          userAnswers: {},
          elapsedTime: 0,
          appStage: 'selection',
        });
      },
    }),
    {
      name: 'gre_group_progress_v2',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      partialize: (state) => ({
        currentDataset: state.currentDataset,
        progress: state.progress,
        realExamMode: state.realExamMode,
      }),
      merge: (persistedState: any, currentState) => {
        const merged = {
          ...currentState,
          ...persistedState,
          realExamMode: persistedState?.realExamMode ?? false,
        };
        if (merged.progress) {
          for (const ds of Object.keys(merged.progress)) {
            const dsProgress = merged.progress[ds];
            if (dsProgress) {
              for (const gid of Object.keys(dsProgress)) {
                const gp = dsProgress[gid];
                if (gp && Array.isArray(gp.sessionQuestions)) {
                  gp.sessionQuestions = gp.sessionQuestions.map((q: QuizQuestion) => {
                    if (!q.translation) {
                      const trans = getQuestionTranslation(q);
                      return trans ? { ...q, translation: trans } : q;
                    }
                    return q;
                  });
                }
              }
            }
          }
        }
        return merged;
      },
    }
  )
);
