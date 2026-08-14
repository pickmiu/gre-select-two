import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WordEntry } from '../types';
import { parseWordsCSV } from '../utils/csvParser';
import defaultWordsCSV from '../data/words.csv?raw';

interface WordState {
  wordList: WordEntry[];
  selectedWords: string[];
  learnedWords: string[];
  searchQuery: string;
  statusFilter: 'all' | 'unlearned' | 'learned';
  dailyQuota: number;

  // Actions
  toggleSelectWord: (word: string) => void;
  selectAllFiltered: (filteredWords: string[]) => void;
  clearAllSelected: () => void;
  setDailyQuota: (quota: number) => void;
  selectDailyQuota: () => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: 'all' | 'unlearned' | 'learned') => void;
  importWords: (newWords: WordEntry[], replace?: boolean) => void;
  markWordLearned: (word: string) => void;
  resetWordsToDefault: () => void;
}

const defaultWords = parseWordsCSV(defaultWordsCSV);

export const useWordStore = create<WordState>()(
  persist(
    (set, get) => ({
      wordList: defaultWords,
      selectedWords: [],
      learnedWords: [],
      searchQuery: '',
      statusFilter: 'all',
      dailyQuota: 50,

      toggleSelectWord: (word) =>
        set((state) => {
          const exists = state.selectedWords.includes(word);
          return {
            selectedWords: exists
              ? state.selectedWords.filter((w) => w !== word)
              : [...state.selectedWords, word],
          };
        }),

      selectAllFiltered: (filteredWords) =>
        set((state) => {
          const newSelected = new Set([...state.selectedWords, ...filteredWords]);
          return { selectedWords: Array.from(newSelected) };
        }),

      clearAllSelected: () => set({ selectedWords: [] }),

      setDailyQuota: (quota) =>
        set({
          dailyQuota: Math.max(1, quota),
        }),

      selectDailyQuota: () =>
        set((state) => {
          const unlearned = state.wordList.filter((w) => !state.learnedWords.includes(w.word));
          const targetWords = unlearned.slice(0, state.dailyQuota).map((w) => w.word);
          return { selectedWords: targetWords };
        }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setStatusFilter: (filter) => set({ statusFilter: filter }),

      importWords: (newWords, replace = false) =>
        set((state) => ({
          wordList: replace ? newWords : [...state.wordList, ...newWords],
        })),

      markWordLearned: (word) =>
        set((state) => {
          if (state.learnedWords.includes(word)) return state;
          return { learnedWords: [...state.learnedWords, word] };
        }),

      resetWordsToDefault: () =>
        set({
          wordList: defaultWords,
          selectedWords: [],
          learnedWords: [],
          searchQuery: '',
          statusFilter: 'all',
          dailyQuota: 50,
        }),
    }),
    {
      name: 'gre_word_store_v4',
      onRehydrateStorage: () => (state) => {
        if (state && (!state.wordList || state.wordList.length === 0)) {
          state.wordList = defaultWords;
        }
      },
      partialize: (state) => ({
        wordList: state.wordList && state.wordList.length > 0 ? state.wordList : defaultWords,
        selectedWords: state.selectedWords,
        learnedWords: state.learnedWords,
        dailyQuota: state.dailyQuota,
      }),
    }
  )
);
