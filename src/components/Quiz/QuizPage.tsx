import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { useGroupProgressStore } from '../../stores/useGroupProgressStore';
import { QuizCard } from './QuizCard';
import { soundService } from '../../utils/audio';

export const QuizPage: React.FC = () => {
  const {
    activeQueue,
    currentIndex,
    activeGroupTitle,
    userAnswers,
    elapsedTime,
    updateElapsedTime,
    answerQuestion,
    previousQuestion,
    exitSession,
  } = useGroupProgressStore();

  const [currentSelections, setCurrentSelections] = useState<string[]>([]);
  const [currentSeconds, setCurrentSeconds] = useState<number>(elapsedTime);
  const startTimeRef = useRef<number>(Date.now());
  const baseSecondsRef = useRef<number>(elapsedTime);

  const currentQuestion = activeQueue[currentIndex];
  const totalQuestions = activeQueue.length;

  // Initialize and run stopwatch
  useEffect(() => {
    baseSecondsRef.current = elapsedTime;
    startTimeRef.current = Date.now();
    setCurrentSeconds(elapsedTime);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const total = baseSecondsRef.current + Math.floor((now - startTimeRef.current) / 1000);
      setCurrentSeconds(total);
      updateElapsedTime(total);
    }, 1000);

    return () => {
      clearInterval(timer);
      const now = Date.now();
      const total = baseSecondsRef.current + Math.floor((now - startTimeRef.current) / 1000);
      updateElapsedTime(total);
    };
  }, [updateElapsedTime]);

  const handleExitSession = () => {
    const now = Date.now();
    const total = baseSecondsRef.current + Math.floor((now - startTimeRef.current) / 1000);
    updateElapsedTime(total);
    exitSession();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Restore saved selections when question index changes
  useEffect(() => {
    const saved = userAnswers[currentIndex] || [];
    setCurrentSelections(saved);
  }, [currentIndex, userAnswers]);

  const handleOptionSelect = (option: string) => {
    let nextSelections: string[];
    if (currentSelections.includes(option)) {
      nextSelections = currentSelections.filter((s) => s !== option);
    } else {
      if (currentSelections.length >= 2) return;
      nextSelections = [...currentSelections, option];
    }

    soundService.playSelect();

    // Advance immediately on 2nd selection without flashing intermediate state
    if (nextSelections.length === 2) {
      answerQuestion(nextSelections);
      return;
    }

    setCurrentSelections(nextSelections);
  };

  const handlePreviousQuestion = useCallback(() => {
    if (currentIndex === 0) return;
    previousQuestion();
  }, [currentIndex, previousQuestion]);

  const handleNextQuestion = useCallback(() => {
    if (currentSelections.length < 2) return;
    answerQuestion(currentSelections);
  }, [currentSelections, answerQuestion]);

  const handleMarkUnknown = useCallback(() => {
    soundService.playSelect();
    answerQuestion(false);
  }, [answerQuestion]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        handlePreviousQuestion();
      } else if (e.key === 'ArrowRight' && currentSelections.length === 2) {
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
  }, [currentIndex, currentSelections, currentQuestion, handlePreviousQuestion, handleNextQuestion]);

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
            onClick={handleExitSession}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回主页</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-800 text-sm sm:text-base">
              {activeGroupTitle || '练习模式'}
            </span>
            <div className="inline-flex items-center space-x-1 text-xs font-mono font-medium text-slate-500 bg-slate-100/90 px-2 py-0.5 rounded-md">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTime(currentSeconds)}</span>
            </div>
          </div>

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
