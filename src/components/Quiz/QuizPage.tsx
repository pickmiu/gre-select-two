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

  const { selectedWords, wordList, markWordLearned } = useWordStore();

  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questionQueue[currentQuestionIndex];

  // Auto advance on correct answer
  const handleOptionSelect = (option: string) => {
    const isCorrect = toggleOption(option);
    if (isCorrect) {
      // Mark ONLY user-selected words as learned (do not mark unselected paired equivalent words)
      if (currentQuestion) {
        const selectedSet = new Set(selectedWords.map((w) => w.toLowerCase().trim()));

        currentQuestion.answers.forEach((ansWord) => {
          const lowerAns = ansWord.toLowerCase().trim();
          if (selectedSet.has(lowerAns)) {
            markWordLearned(ansWord);
          } else {
            const entry = wordList.find((w) => w.word.toLowerCase().trim() === lowerAns);
            if (entry && selectedSet.has(entry.word.toLowerCase().trim())) {
              markWordLearned(entry.word);
            }
          }
        });
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
    <div className="h-[100dvh] max-h-[100dvh] max-w-4xl mx-auto px-3 sm:px-4 py-1.5 sm:py-2 flex flex-col justify-between overflow-hidden select-none">
      {/* Top Fixed Progress Bar */}
      <div className="shrink-0 w-full pt-0.5 pb-1.5 border-b border-slate-200/60 bg-slate-50/95 backdrop-blur-sm">
        <ProgressBar
          currentIndex={currentQuestionIndex}
          totalQuestions={questionQueue.length}
          questionQueue={questionQueue}
          completedStatus={completedQuestionStatus}
        />
      </div>

      {/* Main Quiz Card Area */}
      <div className="flex-1 flex flex-col justify-center min-h-0 py-1.5 sm:py-2 overflow-y-auto scrollbar-none">
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
      <div className="shrink-0 w-full pt-1 pb-1.5 bg-slate-50/95 backdrop-blur-sm border-t border-slate-100">
        <QuizActions
          currentIndex={currentQuestionIndex}
          answerStatus={answerStatus}
          onMarkUnknown={markUnknown}
          onPreviousQuestion={previousQuestion}
          onExit={exitPractice}
        />
      </div>
    </div>
  );
};
