import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { VocabGroup, GroupProgress } from '../../types';

interface GroupCardProps {
  group: VocabGroup;
  progress?: GroupProgress;
  onSelect: (group: VocabGroup) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, progress, onSelect }) => {
  const status = progress?.status || 'unstarted';
  const total = group.pairs.length;
  const currentIndex = progress?.currentIndex || 0;

  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';

  return (
    <div
      onClick={() => onSelect(group)}
      className={`group relative rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between ${
        isCompleted
          ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300 hover:shadow-md'
          : isInProgress
          ? 'bg-blue-50/40 border-blue-200 hover:border-blue-300 hover:shadow-md'
          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div>
        {/* Top: Group Title & Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">
            {group.title}
          </h3>

          {/* Status Badge */}
          {isCompleted && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/90 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>已完成</span>
            </span>
          )}

          {isInProgress && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100/90 text-blue-800 border border-blue-200">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>练习中</span>
            </span>
          )}

          {status === 'unstarted' && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200/70">
              <span>未练习</span>
            </span>
          )}
        </div>

        {/* Minimal Progress Bar (single line, no numbers/text) */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isCompleted ? 'bg-emerald-500 w-full' : isInProgress ? 'bg-blue-600' : 'w-0'
            }`}
            style={isInProgress ? { width: `${Math.min(100, (currentIndex / total) * 100)}%` } : undefined}
          />
        </div>
      </div>

      {/* Bottom Action Row: Range Label on Left, Action on Right */}
      <div className="pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-xs font-medium">
        <span className="text-slate-400 font-mono group-hover:text-slate-500 transition-colors">
          {group.rangeLabel}
        </span>
        <span
          className={`font-bold transition-colors ${
            isCompleted
              ? 'text-emerald-700 group-hover:text-emerald-800'
              : isInProgress
              ? 'text-blue-700 group-hover:text-blue-800'
              : 'text-slate-700 group-hover:text-blue-600'
          }`}
        >
          {isCompleted ? '重新挑战' : isInProgress ? '继续练习' : '开始练习'}
        </span>
      </div>
    </div>
  );
};
