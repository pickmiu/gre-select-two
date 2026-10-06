import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  ArrowLeft,
  BookOpen,
  AlertTriangle,
  Sparkles,
  Clock,
  X,
  XCircle,
  FileQuestion,
} from 'lucide-react';
import { useGroupProgressStore } from '../../stores/useGroupProgressStore';
import { getPairDefinitions, lookupWordDefinition } from '../../utils/vocabLookup';
import { QuizQuestion } from '../../types';

interface DisplayReviewItem {
  originalIndex: number;
  index: number;
  question: QuizQuestion;
  isWrong: boolean;
  word1: string;
  word2: string;
  def1: string;
  def2: string;
  userAnswers: string[];
}

export const CompletionPage: React.FC = () => {
  const {
    activeGroupTitle,
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

  const wrongIndicesSet = new Set(wrongIndices);

  const displayedItems: DisplayReviewItem[] = activeQueue
    .map((q, idx) => {
      const pair = q.vocabPair;
      const defs = getPairDefinitions(pair, q);
      const userAns = userAnswers[idx] || [];

      return {
        originalIndex: idx + 1,
        index: idx,
        question: q,
        isWrong: wrongIndicesSet.has(idx),
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
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="relative inline-block">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-emerald-400 to-blue-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
            <Award className="w-12 h-12" />
          </div>
          <Sparkles className="w-7 h-7 text-amber-400 absolute -top-2 -right-2 animate-bounce" />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            🎉 {activeGroupTitle || '本组'} 练习完成！
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            本次 {totalQuestions} 题已全部完成，快来复盘本次练习的单词对吧。
          </p>
        </div>
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

          {/* Time Elapsed: Clean compact format that never wraps */}
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
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-start space-x-2.5 text-amber-900 text-xs sm:text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-amber-800">
                ⏱ 已超出 GRE 考试建议用时（建议 ≤ {Math.floor(targetSeconds / 60)} 分钟）
              </div>
              <p className="text-xs text-amber-700/90 leading-relaxed">
                本次平均每题用时 <strong className="font-mono font-bold text-amber-900">{avgSecondsPerQuestion} 秒</strong>（GRE 填空 6 选 2 建议平均用时在 45~60 秒内）。建议后续练习时加快词对识别速度。
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 flex items-center space-x-2 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              答题节奏优秀！总用时在考试建议范围以内（平均每题 <strong className="font-mono font-bold text-emerald-900">{avgSecondsPerQuestion} 秒</strong> ≤ 60 秒）。
            </span>
          </div>
        )}
      </div>

      {/* Word Pairs Review Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-slate-800 text-base">词对复盘回顾</h3>
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
            <p className="font-bold text-slate-700 text-sm">零做错！本组所有题目全部答对 🌟</p>
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
                    ? 'bg-rose-50/40 border-rose-200/80 hover:bg-rose-50/80 hover:border-rose-300'
                    : 'bg-emerald-50/30 border-emerald-200/70 hover:bg-emerald-50/60'
                }`}
              >
                {/* Left: Index badge + Word Pair with respective definitions */}
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      item.isWrong
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

                {/* Right: Status badge & Click prompt */}
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                  {item.isWrong ? (
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200/90 inline-flex items-center gap-1 group-hover:bg-rose-200 transition-colors">
                      <span>答错</span>
                      <span className="text-[10px] text-rose-500 font-normal">· 看题</span>
                    </span>
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
      {snapshotItem && (
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
                  className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                    snapshotItem.isWrong
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {snapshotItem.originalIndex}
                </span>
                <h3 className="font-extrabold text-slate-800 text-base">
                  {snapshotItem.isWrong ? '错题快照复盘' : '题目快照'}
                </h3>
              </div>
              <button
                onClick={() => setSnapshotItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Question Stem Snapshot */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileQuestion className="w-3.5 h-3.5 text-blue-500" />
                <span>题目题干</span>
              </div>
              <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
                {renderStem(snapshotItem.question.stem)}
              </p>
              {snapshotItem.question.vocabPair?.definition && (
                <div className="text-xs text-slate-500 pt-1 border-t border-slate-200/60 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-600">释义:</span>
                  <span>{snapshotItem.question.vocabPair.definition}</span>
                </div>
              )}
            </div>

            {/* Comparison: User Selection vs Correct Answers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* User Selection */}
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-800">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>你的选择</span>
                </div>
                {snapshotItem.userAnswers.length === 0 ? (
                  <p className="text-xs text-rose-600 font-medium py-1">未作答 / 标记不认识</p>
                ) : (
                  <div className="space-y-1.5">
                    {snapshotItem.userAnswers.map((ans) => {
                      const def = lookupWordDefinition(ans);
                      return (
                        <div
                          key={ans}
                          className="text-xs font-mono bg-white/90 p-2 rounded-xl border border-rose-200/70"
                        >
                          <span className="font-bold text-rose-900">{ans}</span>
                          {def && (
                            <span className="text-rose-700/80 font-sans block text-[11px] mt-0.5">
                              {def}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Correct Answers */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>正确词对答案</span>
                </div>
                <div className="space-y-1.5">
                  {snapshotItem.question.answers.map((ans, idx) => {
                    const def = idx === 0 ? snapshotItem.def1 : snapshotItem.def2;
                    return (
                      <div
                        key={ans}
                        className="text-xs font-mono bg-white/90 p-2 rounded-xl border border-emerald-200/70"
                      >
                        <span className="font-bold text-emerald-900">{ans}</span>
                        {def && (
                          <span className="text-emerald-700/80 font-sans block text-[11px] mt-0.5">
                            {def}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Complete 6 Options Snapshot */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                全部选项快照（含单词释义）
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {snapshotItem.question.options.map((opt) => {
                  const isCorrect = snapshotItem.question.answers.some(
                    (a) => a.toLowerCase().trim() === opt.toLowerCase().trim()
                  );
                  const isSelected = snapshotItem.userAnswers.some(
                    (u) => u.toLowerCase().trim() === opt.toLowerCase().trim()
                  );
                  const isSelectedWrong = isSelected && !isCorrect;
                  const def = lookupWordDefinition(opt);

                  return (
                    <div
                      key={opt}
                      className={`p-2.5 rounded-xl border text-xs font-mono transition-all flex flex-col justify-center ${
                        isCorrect
                          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-semibold'
                          : isSelectedWrong
                          ? 'bg-rose-50/90 border-rose-300 text-rose-950 font-semibold'
                          : 'bg-slate-50/80 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-bold">{opt}</span>
                        {isCorrect && (
                          <span className="text-[10px] font-sans font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            正确答案
                          </span>
                        )}
                        {isSelectedWrong && (
                          <span className="text-[10px] font-sans font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                            你的选择
                          </span>
                        )}
                      </div>
                      {def && (
                        <span className="text-[11px] font-sans opacity-85 mt-1 leading-tight">
                          {def}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
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
