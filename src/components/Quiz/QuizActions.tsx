import React from 'react';
import { ChevronLeft, LogOut } from 'lucide-react';
import { AnswerStatus } from '../../types';

interface QuizActionsProps {
  currentIndex: number;
  answerStatus: AnswerStatus;
  onPreviousQuestion: () => void;
  onExit: () => void;
}

export const QuizActions: React.FC<QuizActionsProps> = ({
  currentIndex,
  answerStatus,
  onPreviousQuestion,
  onExit,
}) => {
  const isEvaluated = answerStatus === 'correct' || answerStatus === 'wrong' || answerStatus === 'unknown';

  return (
    <div className="w-full max-w-2xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
      <button
        onClick={onPreviousQuestion}
        disabled={currentIndex <= 0 || isEvaluated}
        className="flex items-center space-x-1 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-medium transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>上一个题目</span>
      </button>

      <button
        onClick={onExit}
        className="flex items-center space-x-1 px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-medium transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>退出练习</span>
      </button>
    </div>
  );
};
