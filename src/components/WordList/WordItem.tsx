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
      <div className="flex items-start justify-between space-x-3">
        {/* Checkbox & Word Title */}
        <div className="flex items-center space-x-3 min-w-0">
          <div
            className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border-2 ${
              isSelected
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-slate-300 bg-white'
            }`}
          >
            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-white" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-800 text-base tracking-tight truncate">
                {word}
              </h3>
              {isLearned && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0"
                  title="已掌握该单词"
                >
                  <BookCheck className="w-3 h-3 mr-0.5" />
                  已掌握
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Definition Preview */}
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-xl shrink-0 ${
            isSelected
              ? 'bg-white text-blue-900 border border-blue-200/80 shadow-xs'
              : 'bg-slate-100 text-slate-700 border border-transparent'
          }`}
        >
          {definition}
        </span>
      </div>

      {/* Equivalent Words Tags */}
      {equivalents.length > 0 && (
        <div
          className={`mt-3 flex items-start space-x-2 pt-2.5 border-t ${
            isSelected ? 'border-blue-200/60' : 'border-slate-100'
          }`}
        >
          <span
            className={`text-[11px] font-medium pt-0.5 shrink-0 ${
              isSelected ? 'text-blue-600 font-semibold' : 'text-slate-400'
            }`}
          >
            等价词:
          </span>
          <div className="flex flex-wrap gap-1.5 min-w-0 flex-1">
            {equivalents.map((eq, idx) => (
              <span
                key={idx}
                className={`inline-block px-2.5 py-0.5 text-xs font-mono font-medium rounded-lg ${
                  isSelected
                    ? 'bg-white text-blue-900 border border-blue-200/80 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border border-transparent'
                }`}
              >
                {eq}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
