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
  onMarkUnknown: () => void;
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
    const parts = stem.split('______');
    if (parts.length <= 1) {
      return <span>{stem}</span>;
    }
    return (
      <>
        {parts[0]}
        <span className="inline-block px-3 py-0.5 mx-1 bg-blue-50 text-blue-700 font-mono font-bold rounded-lg">
          ______
        </span>
        {parts[1]}
      </>
    );
  };

  const isWrong = answerStatus === 'wrong';
  const isEvaluated = answerStatus === 'correct' || answerStatus === 'wrong' || answerStatus === 'unknown';

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
      className="w-full max-w-2xl mx-auto space-y-3 sm:space-y-4"
    >
      {/* Stem Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-card border border-slate-200/80 space-y-1.5">
        {question.stem && question.stem.trim() !== '' ? (
          <>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              GRE Equivalence Blank (6 选 2)
            </div>
            <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed tracking-tight">
              {renderStem(question.stem)}
            </p>
          </>
        ) : (
          <>
            <div className="text-[11px] font-bold tracking-wider text-blue-600 uppercase">
              ✨ 纯词汇强化训练（缺失真题）
            </div>
            <p className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
              请在下方 6 个选项中选择 2 个等价的单词
            </p>
          </>
        )}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
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

      {/* "Don't Know" Button directly under options grid */}
      {!isEvaluated && (
        <button
          onClick={onMarkUnknown}
          className="w-full py-2.5 sm:py-3 px-4 bg-slate-100/90 hover:bg-slate-200 text-slate-700 font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl transition-colors flex items-center justify-center space-x-2 shadow-xs active:scale-[0.99]"
        >
          <HelpCircle className="w-4 h-4 text-amber-500" />
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
