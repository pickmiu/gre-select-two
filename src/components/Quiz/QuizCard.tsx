import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { QuizQuestion, AnswerStatus } from '../../types';
import { AnswerOption } from './AnswerOption';
import { WordExplanation } from './WordExplanation';

interface QuizCardProps {
  question: QuizQuestion;
  currentSelections: string[];
  answerStatus: AnswerStatus;
  onOptionSelect: (option: string) => void;
  onNextQuestion: () => void;
  onMarkUnknown?: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  currentSelections,
  answerStatus,
  onOptionSelect,
  onNextQuestion,
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
          <span className="inline-flex items-center justify-center min-w-[3.5rem] px-2.5 py-0.5 mx-1 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200/80 shadow-2xs align-middle">
            {selectionText}
          </span>
        ) : (
          <span className="inline-flex items-center justify-center mx-1 px-0.5 align-baseline">
            <span className="inline-block w-12 sm:w-14 border-b-2 border-slate-700 align-middle -translate-y-0.5"></span>
          </span>
        )}
        {parts[1]}
      </>
    );
  };

  const isWrong = answerStatus === 'wrong';

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: 1,
        y: 0,
        x: isWrong ? [0, -10, 10, -10, 10, 0] : 0,
      }}
      transition={{ duration: isWrong ? 0.4 : 0.25 }}
      className="w-full max-w-2xl mx-auto space-y-2 sm:space-y-3"
    >
      {/* Stem Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-card border border-slate-200/80 space-y-1">
        {question.stem && question.stem.trim() !== '' ? (
          <>
            <div className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              GRE 填空 6 选 2
            </div>
            <p className="text-sm sm:text-base md:text-lg font-medium text-slate-800 leading-snug sm:leading-relaxed tracking-tight">
              {renderStem(question.stem)}
            </p>
          </>
        ) : (
          <>
            <div className="text-[10px] sm:text-[11px] font-bold tracking-wider text-blue-600 uppercase">
              （缺失对应真题）
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
              请在下方 6 个选项中选择 2 个等价的单词
            </p>
          </>
        )}
      </div>

      {/* Options Grid - 2 columns on all devices for single-screen fit */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        {question.options.map((option) => {
          const isSelected = currentSelections.includes(option);
          const isCorrectAnswer = question.answers.some(
            (ans) => ans.toLowerCase().trim() === option.toLowerCase().trim()
          );

          return (
            <AnswerOption
              key={option}
              optionText={option}
              isSelected={isSelected}
              isCorrectAnswer={isCorrectAnswer}
              answerStatus={answerStatus}
              onSelect={onOptionSelect}
            />
          );
        })}
      </div>

      {/* "Don't Know" Button - Placed right below options */}
      {answerStatus !== 'correct' && answerStatus !== 'wrong' && answerStatus !== 'unknown' && onMarkUnknown && (
        <button
          onClick={onMarkUnknown}
          className="w-full py-2 sm:py-2.5 px-4 bg-slate-100/90 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl transition-all flex items-center justify-center space-x-1.5 shadow-xs active:scale-[0.99] border border-slate-200/60"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>不认识</span>
        </button>
      )}

      {/* Explanation Feedback Card */}
      <WordExplanation
        question={question}
        answerStatus={answerStatus}
        onNext={onNextQuestion}
      />
    </motion.div>
  );
};
