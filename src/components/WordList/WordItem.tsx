import React from 'react';
import { Check, BookCheck } from 'lucide-react';
import { WordEntry } from '../../types';

interface WordItemProps {
  wordEntry: WordEntry;
  isSelected: boolean;
  isLearned: boolean;
  onToggle: (word: string) => void;
}

export const WordItem: React.FC<WordItemProps> = ({
  wordEntry,
  isSelected,
  isLearned,
  onToggle,
}) => {
  const { word, equivalents, definition } = wordEntry;

  return (
    <div
      onClick={() => onToggle(word)}
      className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
        isSelected
          ? 'bg-blue-50/70 border-blue-500/80 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
          : 'bg-white border-slate-200/80 hover:border-blue-300 hover:shadow-md hover:bg-slate-50/50'
      }`}
    >
      <div className="flex items-start justify-between space-x-3">
        {/* Checkbox & Word Title */}
        <div className="flex items-center space-x-3 min-w-0">
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
              isSelected
                ? 'bg-blue-600 text-white'
                : 'border border-slate-300 group-hover:border-blue-400 bg-white'
            }`}
          >
            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-800 text-base tracking-tight truncate group-hover:text-blue-600 transition-colors">
                {word}
              </h3>
              {isLearned && (
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0"
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
        <span className="text-xs font-medium text-slate-500 bg-slate-100/80 px-2 py-1 rounded-md shrink-0">
          {definition}
        </span>
      </div>

      {/* Equivalent Words Tags */}
      {equivalents.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-medium self-center">等价词:</span>
          {equivalents.map((eq, idx) => (
            <span
              key={idx}
              className="inline-block px-2 py-0.5 text-xs font-mono text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              {eq}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
