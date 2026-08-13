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
  currentPage: number;
  pageSize: number;

  // Actions
  toggleSelectWord: (word: string) => void;
  selectAllOnPage: (wordsOnPage: string[]) => void;
  deselectAllOnPage: (wordsOnPage: string[]) => void;
  selectAllFiltered: (filteredWords: string[]) => void;
  clearAllSelected: () => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: 'all' | 'unlearned' | 'learned') => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
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
      currentPage: 1,
      pageSize: 20,

      toggleSelectWord: (word) =>
        set((state) => {
          const exists = state.selectedWords.includes(word);
          return {
            selectedWords: exists
              ? state.selectedWords.filter((w) => w !== word)
              : [...state.selectedWords, word],
          };
        }),

      selectAllOnPage: (wordsOnPage) =>
        set((state) => {
          const newSelected = new Set([...state.selectedWords, ...wordsOnPage]);
          return { selectedWords: Array.from(newSelected) };
        }),

      deselectAllOnPage: (wordsOnPage) =>
        set((state) => ({
          selectedWords: state.selectedWords.filter((w) => !wordsOnPage.includes(w)),
        })),

      selectAllFiltered: (filteredWords) =>
        set((state) => {
          const newSelected = new Set([...state.selectedWords, ...filteredWords]);
          return { selectedWords: Array.from(newSelected) };
        }),

      clearAllSelected: () => set({ selectedWords: [] }),

      setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),

      setStatusFilter: (filter) => set({ statusFilter: filter, currentPage: 1 }),

      setCurrentPage: (page) => set({ currentPage: page }),

      setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),

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
          currentPage: 1,
        }),
    }),
    {
      name: 'gre_word_store_v1',
      partialize: (state) => ({
        wordList: state.wordList,
        selectedWords: state.selectedWords,
        learnedWords: state.learnedWords,
        pageSize: state.pageSize,
      }),
    }
  )
);
