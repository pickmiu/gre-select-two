import React, { useMemo, useEffect } from 'react';
import { Search, CheckSquare, Square, Play, AlertTriangle, X, Filter, Target, Zap } from 'lucide-react';
import { useWordStore } from '../../stores/useWordStore';
import { useQuizStore } from '../../stores/useQuizStore';
import { WordItem } from './WordItem';

export const WordSelectionPage: React.FC = () => {
  const {
    wordList,
    selectedWords,
    learnedWords,
    searchQuery,
    statusFilter,
    dailyQuota,
    toggleSelectWord,
    selectAllFiltered,
    clearAllSelected,
    setDailyQuota,
    selectDailyQuota,
    setSearchQuery,
    setStatusFilter,
    resetWordsToDefault,
  } = useWordStore();

  const { startPractice, forceStartPractice, missingWordError, clearMissingWordError } = useQuizStore();

  // Auto-restore default words if local cache is empty
  useEffect(() => {
    if (!wordList || wordList.length === 0) {
      resetWordsToDefault();
    }
  }, [wordList, resetWordsToDefault]);

  // 1. Sort wordList: Mastered words first (CSV relative order), Unmastered words second (CSV relative order)
  const sortedWords = useMemo(() => {
    const learnedSet = new Set(learnedWords);
    const learnedList: typeof wordList = [];
    const unlearnedList: typeof wordList = [];

    for (const entry of wordList) {
      if (learnedSet.has(entry.word)) {
        learnedList.push(entry);
      } else {
        unlearnedList.push(entry);
      }
    }

    return [...learnedList, ...unlearnedList];
  }, [wordList, learnedWords]);

  // 2. Filter sortedWords based on searchQuery & statusFilter
  const filteredWords = useMemo(() => {
    return sortedWords.filter((entry) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        entry.word.toLowerCase().includes(q) ||
        entry.definition.toLowerCase().includes(q) ||
        entry.equivalents.some((eq) => eq.toLowerCase().includes(q));

      const isLearned = learnedWords.includes(entry.word);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'learned' && isLearned) ||
        (statusFilter === 'unlearned' && !isLearned);

      return matchesSearch && matchesStatus;
    });
  }, [sortedWords, searchQuery, statusFilter, learnedWords]);

  const unlearnedCount = wordList.length - learnedWords.length;
  const isAllFilteredSelected =
    filteredWords.length > 0 &&
    filteredWords.every((w) => selectedWords.includes(w.word));

  const handleStartLearning = () => {
    if (selectedWords.length === 0) return;
    startPractice(selectedWords, wordList);
  };

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      clearAllSelected();
    } else {
      selectAllFiltered(filteredWords.map((w) => w.word));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-28 space-y-6">

      {/* Daily Quota Setting & Quick Select Panel */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5 text-slate-900 font-bold text-base">
          <Target className="w-5 h-5 text-blue-600" />
          <span>每日学习量</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
            <input
              type="number"
              min={1}
              max={wordList.length}
              value={dailyQuota}
              onChange={(e) => setDailyQuota(parseInt(e.target.value) || 1)}
              className="w-16 text-center text-sm font-bold text-slate-800 bg-transparent focus:outline-none"
            />
            <span className="text-xs text-slate-500 font-medium">词</span>
          </div>

          <button
            onClick={selectDailyQuota}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>一键勾选</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder=""
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center rounded-2xl bg-slate-100 p-1 shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              全部 ({wordList.length})
            </button>
            <button
              onClick={() => setStatusFilter('unlearned')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                statusFilter === 'unlearned'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              未掌握 ({unlearnedCount})
            </button>
            <button
              onClick={() => setStatusFilter('learned')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                statusFilter === 'learned'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              已掌握 ({learnedWords.length})
            </button>
          </div>
        </div>

        {/* Selection Actions Bar */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleToggleSelectAll}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              {isAllFilteredSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>全选</span>
            </button>
          </div>
        </div>
      </div>

      {/* Word List - 1 card per row */}
      {filteredWords.length > 0 ? (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredWords.map((entry) => (
            <WordItem
              key={entry.word}
              wordEntry={entry}
              isSelected={selectedWords.includes(entry.word)}
              isLearned={learnedWords.includes(entry.word)}
              onToggle={toggleSelectWord}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-2">
          <Filter className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-600 font-medium text-sm">未查找到匹配的单词</p>
        </div>
      )}

      {/* Sticky Floating Bottom Bar for CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-lg border-t border-slate-200/80 py-3.5 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-end gap-4">
          <button
            onClick={handleStartLearning}
            disabled={selectedWords.length === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>开始学习 ({selectedWords.length})</span>
          </button>
        </div>
      </div>

      {/* Missing Question Error Modal */}
      {missingWordError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-amber-600">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">部分单词缺失真实试题</h3>
            </div>

            <p className="text-sm text-slate-600">以下单词在题库中未找到对应 6选2 真实题目：</p>

            <div className="max-h-36 overflow-y-auto bg-slate-50 rounded-2xl p-3 border border-slate-200">
              <ul className="list-disc list-inside space-y-1 text-xs font-mono text-slate-700">
                {missingWordError.missingWords.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                onClick={clearMissingWordError}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-2xl transition-colors"
              >
                调整选择
              </button>
              <button
                onClick={() => forceStartPractice(selectedWords, wordList)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                继续练习
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
