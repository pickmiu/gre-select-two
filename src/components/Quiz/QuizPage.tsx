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
    <div className="h-screen max-h-screen max-w-4xl mx-auto px-4 py-2 sm:py-3 flex flex-col justify-between overflow-hidden select-none">
      {/* Top Fixed Progress Bar */}
      <div className="shrink-0 w-full pt-1 pb-2 border-b border-slate-200/60 bg-slate-50/95 backdrop-blur-sm">
        <ProgressBar
          currentIndex={currentQuestionIndex}
          totalQuestions={questionQueue.length}
          questionQueue={questionQueue}
          completedStatus={completedQuestionStatus}
        />
      </div>

      {/* Main Quiz Card Area */}
      <div className="flex-1 flex flex-col justify-center min-h-0 py-2 sm:py-3 overflow-y-auto scrollbar-none">
        <QuizCard
          question={currentQuestion}
          currentSelections={currentSelections}
          answerStatus={answerStatus}
          onOptionSelect={handleOptionSelect}
          onNextQuestion={nextQuestion}
          onMarkUnknown={markUnknown}
        />
      </div>

      {/* Bottom Fixed Actions */}
      <div className="shrink-0 w-full pt-1.5 pb-2 bg-slate-50/95 backdrop-blur-sm border-t border-slate-100">
        <QuizActions
          currentIndex={currentQuestionIndex}
          answerStatus={answerStatus}
          onPreviousQuestion={previousQuestion}
          onExit={exitPractice}
        />
      </div>
    </div>
  );
};
