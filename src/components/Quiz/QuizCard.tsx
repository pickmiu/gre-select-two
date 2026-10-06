import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { QuizQuestion } from '../../types';
import { AnswerOption } from './AnswerOption';

interface QuizCardProps {
  question: QuizQuestion;
  currentSelections: string[];
  isAdvancing: boolean;
  canPrevious: boolean;
  canNext: boolean;
  onOptionSelect: (option: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onMarkUnknown: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  currentSelections,
  isAdvancing,
  canPrevious,
  canNext,
  onOptionSelect,
  onPrevious,
  onNext,
  onMarkUnknown,
}) => {
  // Format stem with styled fill-in-the-blank highlight
  const renderStem = (stem: string) => {
    const parts = stem.split(/_{2,}/);
    if (parts.length <= 1) {
      return <span>{stem}</span>;
    }

    const hasSelection = currentSelections.length > 0;
    const selectionText = currentSelections.join(' / ');

    return (
      <>
        {parts[0]}
        {hasSelection ? (
          <span className="inline-flex items-baseline justify-center px-2 py-0.5 mx-1 text-base sm:text-lg font-bold text-blue-600 bg-blue-50/90 rounded-lg border border-blue-200/80 align-baseline">
            {selectionText}
          </span>
        ) : (
          <span className="inline-block w-12 sm:w-16 mx-1 border-b-2 border-slate-700 align-baseline" />
        )}
        {parts[1]}
      </>
    );
  };

  const isChineseStem = /[\u4e00-\u9fa5]/.test(question.stem);

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="w-full max-w-2xl mx-auto space-y-3 sm:space-y-4"
    >
      {/* Stem Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-card border border-slate-200/80">
        {isChineseStem ? (
          <div className="text-center space-y-1">
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              GRE 填空 6 选 2
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-1">
              {question.stem}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              GRE 填空 6 选 2 真题
            </div>
            <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed tracking-tight">
              {renderStem(question.stem)}
            </p>
          </div>
        )}
      </div>

      {/* Options Grid - 1 column on mobile, 2 columns on tablet/desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
        {question.options.map((option) => {
          const isSelected = currentSelections.includes(option);

          return (
            <AnswerOption
              key={option}
              optionText={option}
              isSelected={isSelected}
              disabled={isAdvancing}
              onSelect={onOptionSelect}
            />
          );
        })}
      </div>

      {/* Navigation & Action Bar: [上一题] [不认识] [下一题] */}
      <div className="flex items-center gap-2 sm:gap-3 pt-1">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canPrevious || isAdvancing}
          className={`flex-1 py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-1 border ${
            !canPrevious || isAdvancing
              ? 'bg-slate-100/40 text-slate-300 border-slate-200/40 cursor-not-allowed'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200/90 shadow-sm active:scale-[0.99]'
          }`}
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <span>上一题</span>
        </button>

        <button
          type="button"
          onClick={onMarkUnknown}
          disabled={isAdvancing}
          className={`flex-1 py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-1 border ${
            isAdvancing
              ? 'bg-slate-100/40 text-slate-300 border-slate-200/40 cursor-not-allowed'
              : 'bg-slate-100/90 hover:bg-slate-200 text-slate-700 border-slate-200/70 shadow-xs active:scale-[0.99]'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>不认识</span>
        </button>

        {canNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={isAdvancing}
            className="flex-1 py-2.5 sm:py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl transition-all flex items-center justify-center space-x-1 shadow-sm active:scale-[0.99]"
          >
            <span>下一题</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
