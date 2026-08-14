import React, { useMemo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, CheckSquare, Square, Play, AlertTriangle, X, Filter, Target, Zap, Loader2 } from 'lucide-react';
import { useWordStore } from '../../stores/useWordStore';
import { useQuizStore } from '../../stores/useQuizStore';
import { WordItem } from './WordItem';

export const WordSelectionPage: React.FC = () => {
  const {
    wordList,
    selectedWords,
    learnedWords,
    wordMastery,
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

  const [quotaInput, setQuotaInput] = useState<string>(String(dailyQuota));
  const [isGenerating, setIsGenerating] = useState(false);
  const [isForceGenerating, setIsForceGenerating] = useState(false);

  // Sync quotaInput when dailyQuota in store changes externally
  useEffect(() => {
    setQuotaInput(String(dailyQuota));
  }, [dailyQuota]);

  const handleQuotaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuotaInput(val);
    if (val !== '') {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num > 0) {
        setDailyQuota(num);
      }
    }
  };

  const handleQuotaBlur = () => {
    const num = parseInt(quotaInput, 10);
    if (isNaN(num) || num < 1) {
      setDailyQuota(1);
      setQuotaInput('1');
    } else {
      const clamped = Math.min(num, wordList.length || 9999);
      setDailyQuota(clamped);
      setQuotaInput(String(clamped));
    }
  };

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
    if (selectedWords.length === 0 || isGenerating) return;
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const ok = startPractice(selectedWords, wordList);
        if (!ok) {
          setIsGenerating(false);
        }
      } catch (e) {
        console.error(e);
        setIsGenerating(false);
      }
    }, 40);
  };

  const handleForceStartLearning = () => {
    if (isForceGenerating) return;
    setIsForceGenerating(true);
    setTimeout(() => {
      try {
        const ok = forceStartPractice(selectedWords, wordList);
        if (!ok) {
          setIsForceGenerating(false);
        }
      } catch (e) {
        console.error(e);
        setIsForceGenerating(false);
      }
    }, 40);
  };

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      clearAllSelected();
    } else {
      selectAllFiltered(filteredWords.map((w) => w.word));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-12 space-y-6">

      {/* Consolidated Compact Control Toolbar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-slate-200/80 space-y-3">
        {/* Top Controls: Search + Quota + Status Tabs */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索单词、等价词或释义..."
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Group: Status Filter Tabs + Daily Quota + Select All */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            {/* Status Filter Tabs */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 shrink-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                全部 ({wordList.length})
              </button>
              <button
                onClick={() => setStatusFilter('unlearned')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === 'unlearned'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                未掌握 ({unlearnedCount})
              </button>
              <button
                onClick={() => setStatusFilter('learned')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === 'learned'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                已掌握 ({learnedWords.length})
              </button>
            </div>

            {/* Daily Quota Setting Input */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 shrink-0">
              <span className="text-xs text-slate-500 font-semibold shrink-0">每日学习量:</span>
              <div className="flex items-center space-x-0.5">
                <input
                  type="number"
                  min={1}
                  max={wordList.length}
                  value={quotaInput}
                  onChange={handleQuotaChange}
                  onBlur={handleQuotaBlur}
                  className="w-10 text-right text-xs font-bold text-slate-800 bg-transparent focus:outline-none p-0"
                />
                <span className="text-xs text-slate-500 font-medium shrink-0">词</span>
              </div>
            </div>

            {/* Quick Select Standalone Button */}
            <button
              onClick={selectDailyQuota}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0"
              title="一键自动勾选"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>一键勾选</span>
            </button>

            {/* Select All Checkbox Button */}
            <button
              onClick={handleToggleSelectAll}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors shrink-0"
            >
              {isAllFilteredSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>全选</span>
            </button>

            {/* Start Test CTA Button */}
            <button
              onClick={handleStartLearning}
              disabled={selectedWords.length === 0 || isGenerating}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all shrink-0 ml-1 min-w-[96px] justify-center"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>开始测试 ({selectedWords.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Word List - 1 card per row */}
      {filteredWords.length > 0 ? (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredWords.map((entry) => {
            const count = wordMastery[entry.word] || (learnedWords.includes(entry.word) ? 1 : 0);
            return (
              <WordItem
                key={entry.word}
                wordEntry={entry}
                isSelected={selectedWords.includes(entry.word)}
                isLearned={learnedWords.includes(entry.word) || count > 0}
                masteryCount={count}
                onToggle={toggleSelectWord}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-2">
          <Filter className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-600 font-medium text-sm">未查找到匹配的单词</p>
        </div>
      )}

      {/* Missing Question Error Modal */}
      {missingWordError &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 animate-fade-in">
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
                  disabled={isForceGenerating}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-2xl transition-colors"
                >
                  调整选择
                </button>
                <button
                  onClick={handleForceStartLearning}
                  disabled={isForceGenerating}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-500/20 active:scale-95 transition-all inline-flex items-center space-x-1.5 min-w-[96px] justify-center"
                >
                  {isForceGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>生成中...</span>
                    </>
                  ) : (
                    <span>继续练习</span>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
