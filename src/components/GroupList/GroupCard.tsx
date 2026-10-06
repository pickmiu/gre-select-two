import React from 'react';
import { CheckCircle2, Clock, Award } from 'lucide-react';
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
  const lastAccuracy = progress?.lastAccuracy;

  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';

  return (
    <div
      onClick={() => onSelect(group)}
      className={`group relative rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer select-none ${
        isCompleted
          ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300 hover:shadow-md'
          : isInProgress
          ? 'bg-blue-50/40 border-blue-200 hover:border-blue-300 hover:shadow-md'
          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Top: Group Title & Status Badge */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center space-x-2">
          <span
            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-800'
                : isInProgress
                ? 'bg-blue-100 text-blue-800'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {group.groupId}
          </span>
          <h3 className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">
            {group.title}
          </h3>
        </div>

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

      {/* Range label */}
      <p className="text-xs text-slate-400 font-mono">{group.rangeLabel}</p>

      {/* In-progress mini bar */}
      {isInProgress && (
        <div className="space-y-1 pt-2.5">
          <div className="flex justify-between text-[11px] font-medium text-blue-700">
            <span>已作答 {currentIndex} / {total} 题</span>
            <span>{Math.round((currentIndex / total) * 100)}%</span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentIndex / total) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Completed accuracy badge */}
      {isCompleted && lastAccuracy !== undefined && (
        <div className="flex items-center space-x-1.5 text-xs text-emerald-900 font-medium bg-emerald-100/70 rounded-xl px-2.5 py-1.5 border border-emerald-200/80 mt-2.5">
          <Award className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>最近正确率: <strong className="font-extrabold text-emerald-700 font-mono text-sm">{lastAccuracy}%</strong></span>
        </div>
      )}
    </div>
  );
};
