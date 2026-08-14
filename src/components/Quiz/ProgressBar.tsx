import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { QuizQuestion } from '../../types';
import { soundService } from '../../utils/audio';

interface ProgressBarProps {
  currentIndex: number;
  totalQuestions: number;
  questionQueue: QuizQuestion[];
  completedStatus: Record<string | number, 'green' | 'yellow'>;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentIndex,
  totalQuestions,
  questionQueue,
  completedStatus,
}) => {
  const [isMuted, setIsMuted] = useState(soundService.getMuted());
  const currentQ = questionQueue[currentIndex];
  const isRetryQuestion = currentQ && completedStatus[currentQ.id] === 'yellow';

  const handleToggleSound = () => {
    const next = soundService.toggleMute();
    setIsMuted(next);
  };

  return (
    <div className="w-full space-y-2">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs font-medium text-slate-600">
        <div className="flex items-center space-x-2.5">
          {isRetryQuestion ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 leading-none shrink-0">
              错题重做
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200 leading-none shrink-0">
              练习进度
            </span>
          )}

          <div className="inline-flex items-center space-x-1 leading-none text-slate-600 text-xs font-semibold shrink-0">
            <span>第</span>
            <strong className="text-slate-900 font-bold text-sm leading-none">{currentIndex + 1}</strong>
            <span>/ {totalQuestions} 题</span>
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={handleToggleSound}
            className="inline-flex items-center justify-center p-1 rounded-lg hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 transition-colors leading-none shrink-0"
            title={isMuted ? '开启音效' : '关闭音效'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
            )}
          </button>
        </div>

        {/* Status Legend */}
        <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-medium shrink-0">
          <span className="inline-flex items-center space-x-1 leading-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
            <span>一次通过</span>
          </span>
          <span className="inline-flex items-center space-x-1 leading-none">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shrink-0" />
            <span>错题重做</span>
          </span>
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div className="flex gap-1.5 h-1.5 w-full">
        {questionQueue.map((q, idx) => {
          const status = completedStatus[q.id];
          const isCurrent = idx === currentIndex;

          let colorClass = 'bg-slate-200';
          if (idx < currentIndex) {
            // Past attempted questions
            colorClass = status === 'green' ? 'bg-emerald-500' : 'bg-rose-500';
          } else if (isCurrent) {
            // Current active question
            if (status === 'green') colorClass = 'bg-emerald-500';
            else if (status === 'yellow') colorClass = 'bg-rose-500';
            else colorClass = 'bg-blue-600 shadow-sm shadow-blue-500/50 animate-pulse';
          }

          return (
            <div
              key={`${q.id}-${idx}`}
              className={`flex-1 rounded-full transition-all duration-300 ${colorClass}`}
              title={`第 ${idx + 1} 题`}
            />
          );
        })}
      </div>
    </div>
  );
};
