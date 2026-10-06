import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { QuizQuestion } from '../../types';
import { AnswerOption } from './AnswerOption';
import { useGroupProgressStore } from '../../stores/useGroupProgressStore';

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
  const showChineseStem = useGroupProgressStore((s) => s.showChineseStem);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isRevealedOriginal, setIsRevealedOriginal] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Reset states on question change
  useEffect(() => {
    setShowTooltip(false);
    setIsRevealedOriginal(false);
    setIsShaking(false);
  }, [question.id]);

  // Close tooltip on click outside
  useEffect(() => {
    if (!showTooltip) return;
    const handleGlobalClick = () => setShowTooltip(false);
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [showTooltip]);

  // If showChineseStem is enabled, display Chinese definition directly
  let rawStem = showChineseStem
    ? (question.vocabPair?.definition || question.stem)
    : question.stem;

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

  const isChineseStem = /[\u4e00-\u9fa5]/.test(rawStem);

  // If Chinese stem contains combined definitions (' / '), only display the first word's definition
  if (isChineseStem && rawStem.includes(' / ')) {
    rawStem = rawStem.split(' / ')[0].trim();
  }

  // Detect if question options were not found in real question bank (i.e. synthetic / fallback)
  const isSynthetic =
    Boolean(question.isSynthetic) ||
    String(question.id).startsWith('fallback-') ||
    String(question.id).startsWith('synthetic-');

  const showQuestionMark = showChineseStem && isSynthetic;

  // Check if real original question text exists
  const hasOriginalQuestion =
    !isSynthetic &&
    Boolean(question.stem) &&
    !/^[\u4e00-\u9fa5\s；;，,、/／]+$/.test(question.stem);

  const handleStemClick = () => {
    if (hasOriginalQuestion) {
      setIsRevealedOriginal((prev) => !prev);
    } else {
      // Trigger wobble / shake animation
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 450);
    }
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
        <AnimatePresence mode="wait">
          {isChineseStem && !isRevealedOriginal ? (
            <motion.div
              key="chinese-stem"
              initial={{ opacity: 0, y: 4 }}
              animate={
                isShaking
                  ? { x: [-8, 8, -6, 6, -3, 3, 0], opacity: 1, y: 0 }
                  : { opacity: 1, y: 0, x: 0 }
              }
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: isShaking ? 0.45 : 0.2 }}
              onClick={handleStemClick}
              className="text-center py-1 cursor-pointer select-none group w-full"
              title={hasOriginalQuestion ? "点击切换为原题内容" : "未在题库中匹配到原题"}
            >
              <div className="inline-flex items-center justify-center gap-1.5 relative max-w-full">
                <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-900 transition-colors">
                  {rawStem}
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

              {hasOriginalQuestion && (
                <div className="mt-1 text-center">
                  <span className="text-[11px] text-slate-400 group-hover:text-blue-500 transition-colors">
                    点击查看原题内容
                  </span>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="original-stem"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={showChineseStem && hasOriginalQuestion ? handleStemClick : undefined}
              className={`w-full ${showChineseStem && hasOriginalQuestion ? "cursor-pointer group" : ""}`}
              title={showChineseStem && hasOriginalQuestion ? "点击切回中文释义" : undefined}
            >
              <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed tracking-tight">
                {renderStem(question.stem)}
              </p>
              {showChineseStem && hasOriginalQuestion && (
                <div className="mt-2 text-center">
                  <span className="text-[11px] font-medium text-blue-600 bg-blue-50/80 hover:bg-blue-100 border border-blue-200/60 px-2 py-0.5 rounded-full inline-flex items-center gap-1 transition-colors">
                    <span>原题内容</span>
                    <span className="text-blue-400">· 点击切回中文</span>
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
