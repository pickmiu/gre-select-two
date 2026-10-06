import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useGroupProgressStore } from '../../stores/useGroupProgressStore';
import { QuizCard } from './QuizCard';
import { soundService } from '../../utils/audio';

export const QuizPage: React.FC = () => {
  const {
    activeQueue,
    currentIndex,
    activeGroupTitle,
    userAnswers,
    answerQuestion,
    previousQuestion,
    exitSession,
  } = useGroupProgressStore();

  const [currentSelections, setCurrentSelections] = useState<string[]>([]);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = activeQueue[currentIndex];
  const totalQuestions = activeQueue.length;

  // Restore saved selections when question index changes
  useEffect(() => {
    const saved = userAnswers[currentIndex] || [];
    setCurrentSelections(saved);
    setIsAdvancing(false);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentIndex, userAnswers]);

  const handleOptionSelect = (option: string) => {
    if (isAdvancing) return;

    let nextSelections: string[];
    if (currentSelections.includes(option)) {
      nextSelections = currentSelections.filter((s) => s !== option);
    } else {
      if (currentSelections.length >= 2) return;
      nextSelections = [...currentSelections, option];
    }

    soundService.playSelect();
    setCurrentSelections(nextSelections);

    // Auto-advance with snappy ~190ms delay on 2nd selection
    if (nextSelections.length === 2) {
      setIsAdvancing(true);
      timerRef.current = setTimeout(() => {
        answerQuestion(nextSelections);
      }, 190);
    }
  };

  const handlePreviousQuestion = useCallback(() => {
    if (isAdvancing || currentIndex === 0) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    previousQuestion();
  }, [currentIndex, isAdvancing, previousQuestion]);

  const handleNextQuestion = useCallback(() => {
    if (isAdvancing || currentSelections.length < 2) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    answerQuestion(currentSelections);
  }, [isAdvancing, currentSelections, answerQuestion]);

  const handleMarkUnknown = useCallback(() => {
    if (isAdvancing) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    soundService.playSelect();
    answerQuestion(false);
  }, [isAdvancing, answerQuestion]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft' && currentIndex > 0 && !isAdvancing) {
        handlePreviousQuestion();
      } else if (e.key === 'ArrowRight' && currentSelections.length === 2 && !isAdvancing) {
        handleNextQuestion();
      } else if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const optionIndex = parseInt(e.key, 10) - 1;
        if (currentQuestion && currentQuestion.options[optionIndex]) {
          handleOptionSelect(currentQuestion.options[optionIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentSelections, isAdvancing, currentQuestion, handlePreviousQuestion, handleNextQuestion]);

  if (!currentQuestion) {
    return null;
  }

  const progressPercent = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const canPrevious = currentIndex > 0;
  const canNext = currentSelections.length === 2 && currentIndex < totalQuestions - 1;

  return (
    <div className="h-[100dvh] max-h-[100dvh] max-w-4xl mx-auto px-4 py-2 sm:py-3 flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="shrink-0 w-full pt-1 pb-3 border-b border-slate-200/60 bg-slate-50/95 backdrop-blur-sm space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={exitSession}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回主页</span>
          </button>

          <span className="font-extrabold text-slate-800 text-sm sm:text-base">
            {activeGroupTitle || '练习模式'}
          </span>

          <span className="text-xs font-mono font-semibold text-slate-400">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Quiz Card Area */}
      <div className="flex-1 flex flex-col justify-center min-h-0 py-2 sm:py-4 overflow-y-auto scrollbar-none">
        <QuizCard
          question={currentQuestion}
          currentSelections={currentSelections}
          isAdvancing={isAdvancing}
          canPrevious={canPrevious}
          canNext={canNext}
          onOptionSelect={handleOptionSelect}
          onPrevious={handlePreviousQuestion}
          onNext={handleNextQuestion}
          onMarkUnknown={handleMarkUnknown}
        />
      </div>
    </div>
  );
};
