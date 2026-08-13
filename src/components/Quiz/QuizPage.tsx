import React, { useEffect, useRef } from 'react';
import { useQuizStore } from '../../stores/useQuizStore';
import { useWordStore } from '../../stores/useWordStore';
import { ProgressBar } from './ProgressBar';
import { QuizCard } from './QuizCard';
import { QuizActions } from './QuizActions';

export const QuizPage: React.FC = () => {
  const {
    questionQueue,
    currentQuestionIndex,
    completedQuestionStatus,
    currentSelections,
    answerStatus,
    toggleOption,
    markUnknown,
    nextQuestion,
    previousQuestion,
    exitPractice,
  } = useQuizStore();

  const { markWordLearned } = useWordStore();

  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questionQueue[currentQuestionIndex];

  // Auto advance on correct answer
  const handleOptionSelect = (option: string) => {
    const isCorrect = toggleOption(option);
    if (isCorrect) {
      // Mark words as learned
      if (currentQuestion) {
        currentQuestion.answers.forEach((word) => markWordLearned(word));
      }

      // Schedule auto advance after green animation (~850ms)
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
      autoAdvanceTimerRef.current = setTimeout(() => {
        nextQuestion();
      }, 850);
    }
  };

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-20">
      {/* Top Fixed Progress Bar */}
      <div className="sticky top-16 z-20 bg-slate-50/90 backdrop-blur-md pt-2 pb-4 border-b border-slate-200/50">
        <ProgressBar
          currentIndex={currentQuestionIndex}
          totalQuestions={questionQueue.length}
          questionQueue={questionQueue}
          completedStatus={completedQuestionStatus}
        />
      </div>

      {/* Main Quiz Card */}
      <QuizCard
        question={currentQuestion}
        currentSelections={currentSelections}
        answerStatus={answerStatus}
        onOptionSelect={handleOptionSelect}
        onNextQuestion={nextQuestion}
      />

      {/* Bottom Actions */}
      <QuizActions
        currentIndex={currentQuestionIndex}
        answerStatus={answerStatus}
        onMarkUnknown={markUnknown}
        onPreviousQuestion={previousQuestion}
        onExit={exitPractice}
      />
    </div>
  );
};
