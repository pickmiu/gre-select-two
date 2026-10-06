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
  appStage: AppStage;

  // Actions
  setDataset: (dataset: DatasetKey) => void;
  startGroup: (
    group: VocabGroup,
    allQuestions: QuizQuestion[],
    allPoolPairs: VocabPair[]
  ) => void;
  answerQuestion: (isCorrect: boolean) => void;
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
      appStage: 'selection',

      setDataset: (dataset) => set({ currentDataset: dataset }),

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
          set({
            activeGroupId: group.groupId,
            activeGroupTitle: group.title,
            activeQueue: existing.sessionQuestions,
            currentIndex: existing.currentIndex,
            wrongIndices: existing.wrongIndices || [],
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

      answerQuestion: (isCorrect) => {
        const state = get();
        const { activeGroupId, currentDataset, currentIndex, activeQueue, wrongIndices } = state;
        if (!activeGroupId || activeQueue.length === 0) return;

        const nextWrongIndices = !isCorrect
          ? Array.from(new Set([...wrongIndices, currentIndex]))
          : wrongIndices;

        if (currentIndex < activeQueue.length - 1) {
          const nextIndex = currentIndex + 1;
          const currentProgress = state.progress[currentDataset]?.[activeGroupId];

          const updatedGroupProgress: GroupProgress = {
            ...(currentProgress || { status: 'in_progress', updatedAt: Date.now() }),
            status: 'in_progress',
            currentIndex: nextIndex,
            sessionQuestions: activeQueue,
            wrongIndices: nextWrongIndices,
            updatedAt: Date.now(),
          };

          set({
            currentIndex: nextIndex,
            wrongIndices: nextWrongIndices,
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
            lastAccuracy: accuracy,
            lastErrorRate: errorRate,
            updatedAt: Date.now(),
          };

          set({
            wrongIndices: nextWrongIndices,
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

      exitSession: () => {
        const state = get();
        const { activeGroupId, currentDataset, currentIndex, activeQueue, wrongIndices } = state;

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
      }),
    }
  )
);
