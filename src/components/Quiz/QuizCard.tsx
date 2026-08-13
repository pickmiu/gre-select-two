import React from 'react';
import { motion } from 'framer-motion';
import { QuizQuestion, AnswerStatus } from '../../types';
import { AnswerOption } from './AnswerOption';
import { WordExplanation } from './WordExplanation';

interface QuizCardProps {
  question: QuizQuestion;
  currentSelections: string[];
  answerStatus: AnswerStatus;
  onOptionSelect: (option: string) => void;
  onNextQuestion: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  currentSelections,
  answerStatus,
  onOptionSelect,
  onNextQuestion,
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
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Stem Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-4">
        <div className="text-xs font-bold tracking-wider text-slate-400 uppercase">
          GRE Equivalence Blank (6 选 2)
        </div>
        <p className="text-lg sm:text-xl font-medium text-slate-800 leading-relaxed sm:leading-loose tracking-tight">
          {renderStem(question.stem)}
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

      {/* Explanation Feedback Card */}
      <WordExplanation
        question={question}
        answerStatus={answerStatus}
        onNext={onNextQuestion}
      />
    </motion.div>
  );
};
