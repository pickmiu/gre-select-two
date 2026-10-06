import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, XCircle, ArrowLeft, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { useGroupProgressStore } from '../../stores/useGroupProgressStore';

export const CompletionPage: React.FC = () => {
  const { activeGroupTitle, activeQueue, wrongIndices, exitSession } = useGroupProgressStore();

  const totalQuestions = activeQueue.length;
  const wrongCount = wrongIndices.length;
  const correctCount = totalQuestions - wrongCount;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 1000) / 10 : 100;
  const errorRate = totalQuestions > 0 ? Math.round((wrongCount / totalQuestions) * 1000) / 10 : 0;

  // If all correct, default to 'all' view; else default to 'wrong'
  const [viewMode, setViewMode] = useState<'wrong' | 'all'>(wrongCount > 0 ? 'wrong' : 'all');

  useEffect(() => {
    // Launch celebratory confetti
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const wrongIndicesSet = new Set(wrongIndices);

  const displayedItems = activeQueue.map((q, idx) => ({
    originalIndex: idx + 1,
    question: q,
    isWrong: wrongIndicesSet.has(idx),
    word1: q.vocabPair?.word1 || q.answers[0] || '',
    word2: q.vocabPair?.word2 || q.answers[1] || '',
    definition:
      q.vocabPair?.definition ||
      (q.stem && /[\u4e00-\u9fa5]/.test(q.stem) ? q.stem : '暂无释义'),
  })).filter((item) => (viewMode === 'wrong' ? item.isWrong : true));

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
            本次 30 题已全部完成，快来复盘本次练习的单词对吧。
          </p>
        </div>
      </div>

      {/* Metrics Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200/80 grid grid-cols-2 gap-3 sm:gap-4">
        {/* Accuracy */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-left">
          <div className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">本次正确率</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 font-mono mt-1">
            {accuracy}%
          </div>
          <div className="text-xs text-emerald-600 mt-0.5">答对 {correctCount} / {totalQuestions} 题</div>
        </div>

        {/* Error Rate */}
        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 text-left">
          <div className="text-xs text-rose-800 font-semibold uppercase tracking-wider">错误率</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-rose-700 font-mono mt-1">
            {errorRate}%
          </div>
          <div className="text-xs text-rose-600 mt-0.5">做错 {wrongCount} 题</div>
        </div>
      </div>

      {/* Word Pairs Review Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-slate-800 text-base">词对复盘回顾</h3>
          </div>

          {/* Toggle View Tabs */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold">
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
              查看本次全部 30 个完整词对
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {displayedItems.map((item) => (
              <div
                key={item.originalIndex}
                className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                  item.isWrong
                    ? 'bg-rose-50/40 border-rose-200/80'
                    : 'bg-emerald-50/30 border-emerald-200/70'
                }`}
              >
                {/* Left: Index badge + Word Pair */}
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      item.isWrong
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {item.originalIndex}
                  </span>

                  <div className="flex items-center flex-wrap gap-1.5 font-mono text-sm">
                    <span className="font-extrabold text-slate-900">{item.word1}</span>
                    <span className="text-slate-400 font-bold">=</span>
                    <span className="font-extrabold text-blue-600">{item.word2}</span>
                  </div>
                </div>

                {/* Right: Definition + Status Badge */}
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                  <span className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white/90 border border-slate-200/80 rounded-xl">
                    {item.definition}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                      item.isWrong
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {item.isWrong ? '答错' : '答对'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary CTA */}
      <div className="pt-2">
        <button
          onClick={exitSession}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.99]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回分组列表</span>
        </button>
      </div>
    </div>
  );
};
