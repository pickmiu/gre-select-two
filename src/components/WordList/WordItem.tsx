import React from 'react';
import { Check, BookCheck } from 'lucide-react';
import { WordEntry } from '../../types';

interface WordItemProps {
  wordEntry: WordEntry;
  isSelected: boolean;
  isLearned: boolean;
  onToggle: (word: string) => void;
}

export const WordItem: React.FC<WordItemProps> = React.memo(({
  wordEntry,
  isSelected,
  isLearned,
  onToggle,
}) => {
  const { word, equivalents, definition } = wordEntry;

  return (
    <div
      onClick={() => onToggle(word)}
      className={`group relative p-4 sm:p-5 rounded-2xl cursor-pointer select-none border-2 transition-colors duration-150 hover:shadow-md ${
        isSelected
          ? 'bg-blue-50/80 border-blue-600 shadow-sm shadow-blue-500/10'
          : 'bg-white border-slate-200/80 hover:border-slate-300'
      }`}
    >
      {/* Top Row: Checkbox + Headword = Equivalent 1 = Equivalent 2 ... */}
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <div
          className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border-2 mt-0.5 ${
            isSelected
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-slate-300 bg-white'
          }`}
        >
          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-white" />}
        </div>

        {/* Word + Equivalents Equation */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 font-mono">
            {/* Primary Headword */}
            <h3 className="font-extrabold text-slate-800 text-base sm:text-lg tracking-tight">
              {word}
            </h3>

            {/* Equivalent Words connected by '=' */}
            {equivalents.map((eq, idx) => (
              <React.Fragment key={idx}>
                <span className="text-slate-400 font-bold text-xs sm:text-sm select-none">=</span>
                <span
                  className={`inline-block px-2.5 py-0.5 text-xs sm:text-sm font-mono font-semibold rounded-lg ${
                    isSelected
                      ? 'bg-white text-blue-900 border border-blue-200/80 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border border-slate-200/50'
                  }`}
                >
                  {eq}
                </span>
              </React.Fragment>
            ))}

            {/* Learned Badge */}
            {isLearned && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0 ml-1 font-sans"
                title="已掌握该单词"
              >
                <BookCheck className="w-3 h-3 mr-0.5" />
                已掌握
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Chinese Definition */}
      <div
        className={`mt-2.5 pt-2 flex items-center justify-between border-t ${
          isSelected ? 'border-blue-200/60' : 'border-slate-100'
        }`}
      >
        <span
          className={`text-xs sm:text-sm font-medium ${
            isSelected ? 'text-blue-900 font-semibold' : 'text-slate-600'
          }`}
        >
          {definition}
        </span>
      </div>
    </div>
  );
});
