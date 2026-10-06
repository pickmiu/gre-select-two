import React from 'react';
import { Check } from 'lucide-react';

interface AnswerOptionProps {
  optionText: string;
  isSelected: boolean;
  disabled?: boolean;
  onSelect: (option: string) => void;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  optionText,
  isSelected,
  disabled = false,
  onSelect,
}) => {
  let containerStyle =
    'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-slate-50/70 active:scale-[0.99]';
  let icon = null;

  if (isSelected) {
    containerStyle =
      'bg-blue-600 text-white border-blue-600 font-bold shadow-md shadow-blue-500/20';
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
      disabled={disabled}
      className={`relative w-full py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl border text-sm sm:text-base font-medium transition-all duration-200 flex items-center justify-between min-h-[44px] sm:min-h-[48px] select-none text-left outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none ${containerStyle}`}
    >
      <span className="font-mono font-semibold truncate flex-1 min-w-0 pr-2">{optionText}</span>
      <div className="w-5 h-5 flex items-center justify-end shrink-0">
        {icon}
      </div>
    </button>
  );
};
