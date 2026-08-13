import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { useQuizStore } from '../../stores/useQuizStore';
import { useWordStore } from '../../stores/useWordStore';

export const CompletionPage: React.FC = () => {
  const { questionQueue, completedQuestionStatus, exitPractice } = useQuizStore();
  const { selectedWords } = useWordStore();

  useEffect(() => {
    // Launch confetti bursts
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 4,
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

  const totalQuestions = questionQueue.length;
  const firstTryCorrectCount = Object.values(completedQuestionStatus).filter(
    (s) => s === 'green'
  ).length;

  return (
    <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-8 animate-scale-up">
      {/* Celebration Icon */}
      <div className="relative inline-block">
        <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-emerald-400 to-blue-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30">
          <Award className="w-14 h-14" />
        </div>
        <Sparkles className="w-8 h-8 text-amber-400 absolute -top-2 -right-2 animate-bounce" />
      </div>

      {/* Main Title */}
      <div className="space-y-2">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          🎉 练习完成！
        </h2>
        <p className="text-slate-500 text-sm sm:text-base">
          恭喜你，本次练习的所有 GRE 等价词题目已全部掌握！
        </p>
      </div>

      {/* Stats Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 grid grid-cols-2 gap-4 text-left">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <div className="text-xs text-slate-400 font-semibold uppercase">学习单词</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            {selectedWords.length} <span className="text-sm font-sans text-slate-500 font-normal">个</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <div className="text-xs text-slate-400 font-semibold uppercase">完成题目</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            {totalQuestions} <span className="text-sm font-sans text-slate-500 font-normal">道</span>
          </div>
        </div>

        <div className="col-span-2 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between text-emerald-900">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold text-sm sm:text-base">全部掌握 ✓</span>
          </div>
          <div className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
            一次通过率: {totalQuestions > 0 ? Math.round((firstTryCorrectCount / totalQuestions) * 100) : 100}%
          </div>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="pt-4">
        <button
          onClick={exitPractice}
          className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2.5 mx-auto transition-all active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
          <span>继续选词练习</span>
        </button>
      </div>
    </div>
  );
};
