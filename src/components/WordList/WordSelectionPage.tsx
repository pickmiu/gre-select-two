import React, { useMemo } from 'react';
import { Search, CheckSquare, Square, Play, AlertTriangle, X, Sparkles, Filter } from 'lucide-react';
import { useWordStore } from '../../stores/useWordStore';
import { useQuizStore } from '../../stores/useQuizStore';
import { WordItem } from './WordItem';
import { Pagination } from './Pagination';

export const WordSelectionPage: React.FC = () => {
  const {
    wordList,
    selectedWords,
    learnedWords,
    searchQuery,
    statusFilter,
    currentPage,
    pageSize,
    toggleSelectWord,
    selectAllOnPage,
    deselectAllOnPage,
    selectAllFiltered,
    clearAllSelected,
    setSearchQuery,
    setStatusFilter,
    setCurrentPage,
    setPageSize,
  } = useWordStore();

  const { startPractice, missingWordError, clearMissingWordError } = useQuizStore();

  // Filtered words
  const filteredWords = useMemo(() => {
    return wordList.filter((entry) => {
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
  }, [wordList, searchQuery, statusFilter, learnedWords]);

  // Paginated words
  const totalPages = Math.max(1, Math.ceil(filteredWords.length / pageSize));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const wordsOnCurrentPage = useMemo(() => {
    const start = (currentPageClamped - 1) * pageSize;
    return filteredWords.slice(start, start + pageSize);
  }, [filteredWords, currentPageClamped, pageSize]);

  const wordsOnPageNames = wordsOnCurrentPage.map((w) => w.word);
  const isAllOnPageSelected =
    wordsOnPageNames.length > 0 &&
    wordsOnPageNames.every((w) => selectedWords.includes(w));

  const handleStartLearning = () => {
    if (selectedWords.length === 0) return;
    startPractice(selectedWords);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
            <span>✨ 800 等价词精炼</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            选择需要学习的 GRE 单词
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
            从下方列表中勾选单词，点击「开始学习」系统将自动提取相对应的 6选2 试题并打乱顺序进行强化训练。
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-card border border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索单词、等价词或中文释义..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              全部 ({wordList.length})
            </button>
            <button
              onClick={() => setStatusFilter('unlearned')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'unlearned'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              未掌握 ({wordList.length - learnedWords.length})
            </button>
            <button
              onClick={() => setStatusFilter('learned')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'learned'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              已掌握 ({learnedWords.length})
            </button>
          </div>
        </div>

        {/* Quick Selection Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                isAllOnPageSelected
                  ? deselectAllOnPage(wordsOnPageNames)
                  : selectAllOnPage(wordsOnPageNames)
              }
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              {isAllOnPageSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{isAllOnPageSelected ? '取消全选整页' : '全选整页'}</span>
            </button>

            <button
              onClick={() => selectAllFiltered(filteredWords.map((w) => w.word))}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              全选当前搜索结果 ({filteredWords.length})
            </button>

            {selectedWords.length > 0 && (
              <button
                onClick={clearAllSelected}
                className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-medium transition-colors"
              >
                清空勾选
              </button>
            )}
          </div>

          <div className="text-slate-500 font-medium">
            已选中 <strong className="text-blue-600 font-bold">{selectedWords.length}</strong> 个单词
          </div>
        </div>
      </div>

      {/* Word Grid */}
      {wordsOnCurrentPage.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {wordsOnCurrentPage.map((entry) => (
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
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 space-y-3">
          <Filter className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-600 font-medium text-sm">未查找到匹配的单词</p>
          <p className="text-xs text-slate-400">请尝试清除搜索条件或修改过滤条件</p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPageClamped}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={filteredWords.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* Sticky Floating Bottom Bar for CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-lg border-t border-slate-200/80 py-3.5 px-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-slate-600">
            已选 <strong className="text-blue-600 font-bold text-base sm:text-lg">{selectedWords.length}</strong> 个单词
            <span className="text-slate-400 ml-1 hidden sm:inline">(建议一次练习 5-20 个)</span>
          </div>

          <button
            onClick={handleStartLearning}
            disabled={selectedWords.length === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>开始学习 ({selectedWords.length})</span>
          </button>
        </div>
      </div>

      {/* Missing Question Error Modal */}
      {missingWordError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">无法开始练习</h3>
            </div>

            <p className="text-sm text-slate-600">以下单词在题库中未找到对应 6选2 题目：</p>

            <div className="max-h-36 overflow-y-auto bg-slate-50 rounded-xl p-3 border border-slate-200">
              <ul className="list-disc list-inside space-y-1 text-xs font-mono text-slate-700">
                {missingWordError.missingWords.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-slate-500">{missingWordError.reason}</p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={clearMissingWordError}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-colors"
              >
                调整选择
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
