import React from 'react';
import { Check, X } from 'lucide-react';
import { AnswerStatus } from '../../types';

interface AnswerOptionProps {
  optionText: string;
  isSelected: boolean;
  isCorrectAnswer: boolean; // is this option in the true correct answers list
  answerStatus: AnswerStatus;
  onSelect: (option: string) => void;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  optionText,
  isSelected,
  isCorrectAnswer,
  answerStatus,
  onSelect,
}) => {
  const isEvaluated = answerStatus === 'correct' || answerStatus === 'wrong' || answerStatus === 'unknown';

  let containerStyle = 'bg-white text-slate-800 border-slate-200 hover:border-blue-400 hover:shadow-md active:scale-[0.99]';
  let icon = null;

  if (isEvaluated) {
    if (isCorrectAnswer) {
      // True correct option (whether selected or revealed on error)
      containerStyle = 'bg-emerald-500 text-white border-emerald-600 font-bold shadow-lg shadow-emerald-500/20 animate-pulse';
      icon = <Check className="w-5 h-5 text-white stroke-[3] shrink-0" />;
    } else if (isSelected) {
      // User selected this but it's incorrect
      containerStyle = 'bg-rose-500 text-white border-rose-600 font-bold shadow-lg shadow-rose-500/20';
      icon = <X className="w-5 h-5 text-white stroke-[3] shrink-0" />;
    } else {
      // Dimmed unselected incorrect options
      containerStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
    }
  } else if (isSelected) {
    // Selected but not yet evaluated
    containerStyle = 'bg-blue-600 text-white border-blue-700 font-bold shadow-md shadow-blue-500/25 ring-2 ring-blue-400/50 scale-[1.01]';
    icon = <Check className="w-4 h-4 text-white stroke-[3] shrink-0" />;
  }

  return (
    <button
      onClick={() => onSelect(optionText)}
      disabled={isEvaluated}
      className={`relative w-full py-4 px-4 sm:px-5 rounded-2xl border text-sm sm:text-base tracking-wide transition-all duration-200 flex items-center justify-between min-h-[56px] select-none text-left ${containerStyle}`}
    >
      <span className="font-semibold font-mono truncate">{optionText}</span>
      {icon}
    </button>
  );
};
