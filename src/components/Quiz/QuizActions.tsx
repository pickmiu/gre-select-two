import React from 'react';
import { HelpCircle, ChevronLeft, LogOut } from 'lucide-react';
import { AnswerStatus } from '../../types';

interface QuizActionsProps {
  currentIndex: number;
  answerStatus: AnswerStatus;
  onMarkUnknown: () => void;
  onPreviousQuestion: () => void;
  onExit: () => void;
}

export const QuizActions: React.FC<QuizActionsProps> = ({
  currentIndex,
  answerStatus,
  onMarkUnknown,
  onPreviousQuestion,
  onExit,
}) => {
  const isEvaluated = answerStatus === 'correct' || answerStatus === 'wrong' || answerStatus === 'unknown';

  return (
    <div className="w-full max-w-2xl mx-auto pt-2 pb-1 space-y-5 sm:space-y-6">
      {/* "Don't Know" Button */}
      {!isEvaluated && (
        <button
          onClick={onMarkUnknown}
          className="w-full py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm sm:text-base rounded-2xl transition-colors flex items-center justify-center space-x-2 shadow-sm active:scale-[0.99]"
        >
          <HelpCircle className="w-5 h-5 text-amber-500" />
          <span>不认识</span>
        </button>
      )}

      {/* Navigation & Exit Row */}
      <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
        <button
          onClick={onPreviousQuestion}
          disabled={currentIndex <= 0 || isEvaluated}
          className="flex items-center space-x-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>上一个题目</span>
        </button>

        <button
          onClick={onExit}
          className="flex items-center space-x-1 px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>退出练习</span>
        </button>
      </div>
    </div>
  );
};
