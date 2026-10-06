import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { useGroupProgressStore } from '../../stores/useGroupProgressStore';
import { QuizCard } from './QuizCard';
import { vibrateSuccess, vibrateError } from '../../utils/vibration';
import { soundService } from '../../utils/audio';
import { AnswerStatus } from '../../types';

export const QuizPage: React.FC = () => {
  const {
    activeQueue,
    currentIndex,
    activeGroupTitle,
    answerQuestion,
    exitSession,
  } = useGroupProgressStore();

  const [currentSelections, setCurrentSelections] = useState<string[]>([]);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = activeQueue[currentIndex];
  const totalQuestions = activeQueue.length;

  useEffect(() => {
    // Clear timer and reset selections when question changes
    setCurrentSelections([]);
    setAnswerStatus('idle');
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex]);

  if (!currentQuestion) {
    return null;
  }

  const handleOptionSelect = (option: string) => {
    if (answerStatus !== 'idle') return;

    let nextSelections: string[];
    if (currentSelections.includes(option)) {
      nextSelections = currentSelections.filter((s) => s !== option);
    } else {
      if (currentSelections.length >= 2) return;
      nextSelections = [...currentSelections, option];
    }

    soundService.playSelect();
    setCurrentSelections(nextSelections);

    // Auto evaluate when 2 options selected
    if (nextSelections.length === 2) {
      const isCorrect =
        nextSelections.length === currentQuestion.answers.length &&
        nextSelections.every((ans) =>
          currentQuestion.answers.some(
            (a) => a.toLowerCase().trim() === ans.toLowerCase().trim()
          )
        );

      if (isCorrect) {
        vibrateSuccess();
        soundService.playCorrect();
        setAnswerStatus('correct');

        timerRef.current = setTimeout(() => {
          answerQuestion(true);
        }, 600);
      } else {
        vibrateError();
        soundService.playWrong();
        setAnswerStatus('wrong');

        // Non-blocking: skip to next question after 600ms, NO loop retry
        timerRef.current = setTimeout(() => {
          answerQuestion(false);
        }, 600);
      }
    }
  };

  const handleMarkUnknown = () => {
    if (answerStatus !== 'idle') return;
    vibrateError();
    soundService.playWrong();
    setAnswerStatus('wrong');

    timerRef.current = setTimeout(() => {
      answerQuestion(false);
    }, 600);
  };

  const progressPercent = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

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

          <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/80">
            第 {currentIndex + 1} / {totalQuestions} 题
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
          answerStatus={answerStatus}
          onOptionSelect={handleOptionSelect}
          onMarkUnknown={handleMarkUnknown}
        />
      </div>

      {/* Bottom Hint */}
      <div className="shrink-0 w-full py-2 text-center text-xs text-slate-400">
        <span>在上方选择 2 个等价词，系统将自动判定</span>
      </div>
    </div>
  );
};
