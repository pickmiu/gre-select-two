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

  let containerStyle = 'bg-white text-slate-800 border-slate-200 hover:shadow-sm active:scale-[0.99]';
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
    // Selected but not yet evaluated - Keep width identical to unselected options
    containerStyle = 'bg-blue-600 text-white border-blue-700 font-bold shadow-md shadow-blue-500/30 ring-1 ring-inset ring-blue-400/50';
    icon = <Check className="w-4 h-4 text-white stroke-[3] shrink-0" />;
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    onSelect(optionText);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isEvaluated}
      className={`relative w-full py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl border text-sm sm:text-base font-medium transition-all duration-200 flex items-center justify-between min-h-[44px] sm:min-h-[48px] select-none text-left outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none ${containerStyle}`}
    >
      <span className="font-mono font-semibold truncate flex-1 min-w-0 pr-2">{optionText}</span>
      <div className="w-5 h-5 flex items-center justify-end shrink-0">
        {icon}
      </div>
    </button>
  );
};
