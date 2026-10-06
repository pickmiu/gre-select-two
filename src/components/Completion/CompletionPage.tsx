import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  ArrowLeft,
  BookOpen,
  AlertTriangle,
  HelpCircle,
  X,
} from 'lucide-react';
import { useGroupProgressStore } from '../../stores/useGroupProgressStore';
import { getPairDefinitions, lookupWordDefinition } from '../../utils/vocabLookup';
import { QuizQuestion } from '../../types';

interface DisplayReviewItem {
  originalIndex: number;
  index: number;
  question: QuizQuestion;
  isWrong: boolean;
  isUnknown: boolean;
  word1: string;
  word2: string;
  def1: string;
  def2: string;
  userAnswers: string[];
}

export const CompletionPage: React.FC = () => {
  const {
    activeQueue,
    wrongIndices,
    userAnswers,
    elapsedTime,
    exitSession,
  } = useGroupProgressStore();

  const totalQuestions = activeQueue.length;
  const wrongCount = wrongIndices.length;
  const correctCount = totalQuestions - wrongCount;
  const accuracy =
    totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 1000) / 10
      : 100;

  // Time metrics (GRE target: 60s per question, 30 questions = 1800s = 30 mins)
  const totalSeconds = elapsedTime || 0;
  const targetSeconds = totalQuestions * 60;
  const isOvertime = totalSeconds > targetSeconds;
  const avgSecondsPerQuestion =
    totalQuestions > 0 ? Math.round(totalSeconds / totalQuestions) : 0;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // View tabs mode: default to wrong if there are wrong questions
  const [viewMode, setViewMode] = useState<'wrong' | 'all'>(
    wrongCount > 0 ? 'wrong' : 'all'
  );

  // Selected question for snapshot modal
  const [snapshotItem, setSnapshotItem] = useState<DisplayReviewItem | null>(null);

  // Lock body scroll when snapshot modal is open
  useEffect(() => {
    if (snapshotItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [snapshotItem]);

  const wrongIndicesSet = new Set(wrongIndices);

  const displayedItems: DisplayReviewItem[] = activeQueue
    .map((q, idx) => {
      const pair = q.vocabPair;
      const defs = getPairDefinitions(pair, q);
      const userAns = userAnswers[idx] || [];
      const isWrong = wrongIndicesSet.has(idx);
      const isUnknown =
        userAns.includes('__UNKNOWN__') ||
        (isWrong && userAns.length === 0);

      return {
        originalIndex: idx + 1,
        index: idx,
        question: q,
        isWrong,
        isUnknown,
        word1: pair?.word1 || q.answers[0] || '',
        word2: pair?.word2 || q.answers[1] || '',
        def1: defs.def1,
        def2: defs.def2,
        userAnswers: userAns,
      };
    })
    .filter((item) => (viewMode === 'wrong' ? item.isWrong : true));

  // Render stem with fill-in-the-blank line
  const renderStem = (stem: string) => {
    if (!stem) return null;
    const parts = stem.split(/_{2,}/);
    if (parts.length <= 1) {
      return <span>{stem}</span>;
    }
    return (
      <>
        {parts[0]}
        <span className="inline-block w-14 sm:w-16 mx-1 border-b-2 border-slate-700 align-baseline" />
        {parts[1]}
      </>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-6 sm:space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="text-center space-y-1.5 pt-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          练习完成
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm">
          共完成 {totalQuestions} 道题
        </p>
      </div>

      {/* Metrics Section: 3-column Grid + Overtime/Pace Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200/80 space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Accuracy */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-left">
            <div className="text-xs text-emerald-800 font-bold uppercase tracking-wider">正确率</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-1">
              {accuracy}%
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5">答对 {correctCount} / {totalQuestions} 题</div>
          </div>

          {/* Time Elapsed: Clean compact format */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-left">
            <div className="text-xs text-blue-800 font-bold uppercase tracking-wider">练习总用时</div>
            <div className="text-xl sm:text-2xl font-black text-blue-700 font-mono mt-1 whitespace-nowrap flex items-baseline">
              {minutes > 0 && (
                <>
                  <span>{minutes}</span>
                  <span className="text-xs text-blue-600 font-bold mx-0.5">分</span>
                </>
              )}
              <span>{seconds}</span>
              <span className="text-xs text-blue-600 font-bold ml-0.5">秒</span>
            </div>
            <div className="text-[11px] text-blue-600 mt-0.5">平均 {avgSecondsPerQuestion} 秒/题</div>
          </div>

          {/* Wrong Count */}
          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 text-left">
            <div className="text-xs text-rose-800 font-bold uppercase tracking-wider">做错题目</div>
            <div className="text-xl sm:text-2xl font-black text-rose-700 font-mono mt-1">
              {wrongCount}
            </div>
            <div className="text-[11px] text-rose-600 mt-0.5">{wrongCount > 0 ? '需巩固复习' : '全对通关'}</div>
          </div>
        </div>

        {/* Overtime Alert or On-Time Encouragement */}
        {isOvertime ? (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center space-x-2 text-amber-900 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>平均用时 <strong className="font-mono font-bold">{avgSecondsPerQuestion} 秒/题</strong>（超出建议用时，建议 ≤ 60 秒/题）</span>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 flex items-center space-x-2 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>答题节奏良好（平均每题 <strong className="font-mono font-bold text-emerald-900">{avgSecondsPerQuestion} 秒</strong> ≤ 60 秒）</span>
          </div>
        )}
      </div>

      {/* Word Pairs Review Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-base">词对复盘回顾</h3>
          </div>

          {/* Toggle View Tabs */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setViewMode('wrong')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'wrong'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              做错的单词 ({wrongCount})
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'all'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              本次完整词对 ({totalQuestions})
            </button>
          </div>
        </div>

        {/* List of Words */}
        {displayedItems.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">全对通关！本组所有题目全部答对 🌟</p>
            <button
              onClick={() => setViewMode('all')}
              className="text-xs text-blue-600 underline font-medium pt-1"
            >
              查看本次全部 {totalQuestions} 个完整词对
            </button>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {displayedItems.map((item) => (
              <div
                key={item.originalIndex}
                onClick={() => setSnapshotItem(item)}
                className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all group cursor-pointer ${
                  item.isWrong
                    ? item.isUnknown
                      ? 'bg-amber-50/40 border-amber-200/80 hover:bg-amber-50/80 hover:border-amber-300'
                      : 'bg-rose-50/40 border-rose-200/80 hover:bg-rose-50/80 hover:border-rose-300'
                    : 'bg-emerald-50/30 border-emerald-200/70 hover:bg-emerald-50/60'
                }`}
              >
                {/* Left: Index badge + Word Pair with respective definitions */}
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      item.isUnknown
                        ? 'bg-amber-100 text-amber-800'
                        : item.isWrong
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {item.originalIndex}
                  </span>

                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 font-mono text-sm leading-relaxed">
                    <div className="inline-flex items-baseline flex-wrap gap-1">
                      <span className="font-extrabold text-slate-900">{item.word1}</span>
                      <span className="text-xs font-sans text-slate-500 font-medium">
                        ({item.def1})
                      </span>
                    </div>

                    <span className="text-slate-400 font-bold">=</span>

                    <div className="inline-flex items-baseline flex-wrap gap-1">
                      <span className="font-extrabold text-blue-600">{item.word2}</span>
                      <span className="text-xs font-sans text-blue-600/90 font-medium">
                        ({item.def2})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Status badge */}
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                  {item.isWrong ? (
                    item.isUnknown ? (
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200/90 inline-flex items-center group-hover:bg-amber-200 transition-colors">
                        不认识
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200/90 inline-flex items-center group-hover:bg-rose-200 transition-colors">
                        答错
                      </span>
                    )
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200/90 inline-flex items-center">
                      答对
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Snapshot Modal for Reviewing Mistake */}
      {snapshotItem &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setSnapshotItem(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200/80 space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                      snapshotItem.isUnknown
                        ? 'bg-amber-100 text-amber-800'
                        : snapshotItem.isWrong
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {snapshotItem.originalIndex}
                  </span>
                  <h3 className="font-bold text-slate-800 text-base">
                    {snapshotItem.isUnknown
                      ? '错题快照 · 标记不认识'
                      : snapshotItem.isWrong
                      ? '错题快照'
                      : '题目快照'}
                  </h3>
                </div>
                <button
                  onClick={() => setSnapshotItem(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Question Stem Snapshot (Clean sentence without redundant definition) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
                  {renderStem(snapshotItem.question.stem)}
                </p>
              </div>

              {/* Unknown marker banner if user marked unknown */}
              {snapshotItem.isUnknown && (
                <div className="px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-medium flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>你的选择：本题已标记为「不认识」</span>
                </div>
              )}

              {/* Complete 6 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {snapshotItem.question.options.map((opt) => {
                  const isCorrect = snapshotItem.question.answers.some(
                    (a) => a.toLowerCase().trim() === opt.toLowerCase().trim()
                  );
                  const isSelected = snapshotItem.userAnswers.some(
                    (u) => u.toLowerCase().trim() === opt.toLowerCase().trim()
                  );
                  const isSelectedWrong = isSelected && !isCorrect;
                  const isSelectedCorrect = isSelected && isCorrect;

                  // Resilient definition retrieval
                  let def = lookupWordDefinition(opt);
                  if (!def && isCorrect) {
                    const ansIdx = snapshotItem.question.answers.findIndex(
                      (a) => a.toLowerCase().trim() === opt.toLowerCase().trim()
                    );
                    def = ansIdx === 0 ? snapshotItem.def1 : snapshotItem.def2;
                    if (!def || def === '暂无释义') {
                      def = snapshotItem.question.vocabPair?.definition || '';
                    }
                  }
                  if (!def) {
                    def = lookupWordDefinition(opt.replace(/^(a|an|the)\s+/i, '').trim());
                  }

                  return (
                    <div
                      key={opt}
                      className={`p-3 rounded-2xl border text-xs font-mono transition-all flex flex-col justify-center ${
                        isCorrect
                          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-semibold'
                          : isSelectedWrong
                          ? 'bg-rose-50/90 border-rose-300 text-rose-950 font-semibold'
                          : 'bg-slate-50/70 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-bold text-sm">{opt}</span>
                        {isSelectedCorrect && (
                          <span className="text-[10px] font-sans font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                            正确答案 · 你已选
                          </span>
                        )}
                        {isCorrect && !isSelected && (
                          <span className="text-[10px] font-sans font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                            正确答案
                          </span>
                        )}
                        {isSelectedWrong && (
                          <span className="text-[10px] font-sans font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded-md">
                            你的选择
                          </span>
                        )}
                      </div>
                      {def && (
                        <span
                          className={`text-[11px] font-sans font-normal mt-1 leading-snug ${
                            isCorrect
                              ? 'text-emerald-800/80'
                              : isSelectedWrong
                              ? 'text-rose-800/80'
                              : 'text-slate-500'
                          }`}
                        >
                          {def}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Primary CTA */}
      <div className="pt-2">
        <button
          onClick={exitSession}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.99] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回分组列表</span>
        </button>
      </div>
    </div>
  );
};
