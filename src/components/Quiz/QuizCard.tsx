import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { QuizQuestion } from '../../types';
import { AnswerOption } from './AnswerOption';
import { useGroupProgressStore } from '../../stores/useGroupProgressStore';
import { getQuestionTranslation } from '../../utils/csvParser';

interface QuizCardProps {
  question: QuizQuestion;
  currentSelections: string[];
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
  canPrevious,
  canNext,
  onOptionSelect,
  onPrevious,
  onNext,
  onMarkUnknown,
}) => {
  const realExamMode = useGroupProgressStore((s) => s.realExamMode);
  const [showTooltip, setShowTooltip] = useState(false);
  const [overrideMode, setOverrideMode] = useState<'english' | 'translation' | 'definition' | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Reset states on question change
  useEffect(() => {
    setShowTooltip(false);
    setOverrideMode(null);
    setIsShaking(false);
  }, [question.id]);

  // Close tooltip on click outside
  useEffect(() => {
    if (!showTooltip) return;
    const handleGlobalClick = () => setShowTooltip(false);
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [showTooltip]);

  // Format stem with styled fill-in-the-blank underline
  const renderStem = (stem: string) => {
    const parts = stem.split(/_{2,}/);
    if (parts.length <= 1) {
      return <span>{stem}</span>;
    }

    return (
      <>
        {parts[0]}
        <span className="inline-block w-14 sm:w-16 mx-1 border-b-2 border-slate-700 align-baseline" />
        {parts[1]}
      </>
    );
  };

  // Detect if question options were not found in real question bank (i.e. synthetic / fallback)
  const isSynthetic =
    Boolean(question.isSynthetic) ||
    String(question.id).startsWith('fallback-') ||
    String(question.id).startsWith('synthetic-');

  // Check if real original question text exists
  const hasOriginalQuestion =
    !isSynthetic &&
    Boolean(question.stem) &&
    !/^[\u4e00-\u9fa5\s；;，,、/／]+$/.test(question.stem);

  // Extract pure Chinese definition stem
  let chineseStem = question.vocabPair?.definition || question.stem;
  if (/[\u4e00-\u9fa5]/.test(chineseStem) && chineseStem.includes(' / ')) {
    chineseStem = chineseStem.split(' / ')[0].trim();
  }

  const translation = question.translation || getQuestionTranslation(question);

  // Initial display mode: Chinese definition unless realExamMode is ON and real question exists
  const defaultStemMode: 'english' | 'translation' | 'definition' =
    !realExamMode || !hasOriginalQuestion ? 'definition' : 'english';
  const currentMode = overrideMode ?? defaultStemMode;

  const showQuestionMark = currentMode === 'definition' && isSynthetic;

  const handleStemClick = () => {
    if (!hasOriginalQuestion) {
      // Trigger wobble / shake animation when clicking with no real question available
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 450);
      return;
    }

    setOverrideMode((prev) => {
      const cur = prev ?? defaultStemMode;
      if (cur === 'english') {
        return translation ? 'translation' : 'definition';
      } else if (cur === 'translation') {
        return 'definition';
      } else {
        return 'english';
      }
    });
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="w-full max-w-2xl mx-auto space-y-3 sm:space-y-4"
    >
      {/* Stem Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-card border border-slate-200/80 min-h-[90px] flex items-center justify-center">
        {currentMode === 'definition' ? (
          <div
            onClick={handleStemClick}
            className={`text-center py-1 cursor-pointer select-none w-full ${
              isShaking ? 'animate-shake' : ''
            }`}
            title={hasOriginalQuestion ? '点击切换为英文真题' : undefined}
          >
            <div className="inline-flex items-center justify-center gap-1.5 relative max-w-full">
              <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {chineseStem}
              </p>

              {showQuestionMark && (
                <div
                  className="relative inline-flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTooltip((prev) => !prev);
                    }}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
                    title="题目来源说明"
                    aria-label="题目来源说明"
                  >
                    <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <AnimatePresence>
                    {showTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-30 w-64 sm:w-72 p-3.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/90 text-left pointer-events-auto"
                      >
                        <div className="flex items-center space-x-1.5 pb-1.5 border-b border-slate-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span className="font-bold text-xs text-slate-800">题库未收录原题</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed pt-1.5 font-normal">
                          本词对未在 GRE 真题库中匹配到原题，选项为系统自动生成的词汇干扰项。
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        ) : currentMode === 'translation' ? (
          <div
            onClick={handleStemClick}
            className="w-full cursor-pointer select-none py-1 text-center"
            title="点击切换为单词释义"
          >
            <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed tracking-tight">
              {translation}
            </p>
          </div>
        ) : (
          <div
            onClick={handleStemClick}
            className="w-full cursor-pointer select-none py-1"
            title={translation ? '点击切换为题目翻译' : '点击切换为单词释义'}
          >
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
          disabled={!canPrevious}
          className={`flex-1 py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-1 border ${
            !canPrevious
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
          className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-1 border bg-slate-100/90 hover:bg-slate-200 text-slate-700 border-slate-200/70 shadow-xs active:scale-[0.99]"
        >
          <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>不认识</span>
        </button>

        {canNext && (
          <button
            type="button"
            onClick={onNext}
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
