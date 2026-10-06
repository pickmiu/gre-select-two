import React, { useMemo } from 'react';
import { BookOpen, Layers, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { useGroupProgressStore } from '../../stores/useGroupProgressStore';
import { parseZhangweiCSV, parseBbgreCSV, chunkVocabPairs } from '../../utils/vocabAdapters';
import { parseQuestionsCSV } from '../../utils/csvParser';
import { GroupCard } from './GroupCard';
import { VocabGroup, DatasetKey } from '../../types';

import zhangweiCSV from '../../data/words.csv?raw';
import bbgreCSV from '../../data/bbgreword.csv?raw';
import questionsCSV from '../../data/questions.csv?raw';

export const GroupSelectionPage: React.FC = () => {
  const { currentDataset, progress, setDataset, startGroup } = useGroupProgressStore();

  const allQuestions = useMemo(() => parseQuestionsCSV(questionsCSV), []);
  const zhangweiPairs = useMemo(() => parseZhangweiCSV(zhangweiCSV), []);
  const bbgrePairs = useMemo(() => parseBbgreCSV(bbgreCSV), []);

  const zhangweiGroups = useMemo(() => chunkVocabPairs(zhangweiPairs, 30), [zhangweiPairs]);
  const bbgreGroups = useMemo(() => chunkVocabPairs(bbgrePairs, 30), [bbgrePairs]);

  const activeGroups = currentDataset === 'zhangwei' ? zhangweiGroups : bbgreGroups;
  const activePool = currentDataset === 'zhangwei' ? zhangweiPairs : bbgrePairs;
  const currentProgress = progress[currentDataset] || {};

  const completedCount = activeGroups.filter(
    (g) => currentProgress[g.groupId]?.status === 'completed'
  ).length;

  const inProgressCount = activeGroups.filter(
    (g) => currentProgress[g.groupId]?.status === 'in_progress'
  ).length;

  const totalGroups = activeGroups.length;
  const completionPercentage = totalGroups > 0 ? Math.round((completedCount / totalGroups) * 100) : 0;

  const handleSelectGroup = (group: VocabGroup) => {
    startGroup(group, allQuestions, activePool);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Dataset Tabs Switcher */}
      <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center max-w-xl mx-auto shadow-inner border border-slate-300/50">
        <button
          onClick={() => setDataset('zhangwei')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
            currentDataset === 'zhangwei'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>张巍等价词 (31 组 · 903 词)</span>
        </button>

        <button
          onClick={() => setDataset('bbgre')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
            currentDataset === 'bbgre'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>BBGRE 词对 (36 组 · 1079 对)</span>
        </button>
      </div>

      {/* Overview Progress Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-slate-800">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
              {currentDataset === 'zhangwei' ? '张巍等价词题库' : 'BBGRE 核心词对题库'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            默认每 30 词一组，循序渐进高效通关。错题免重试，答完集中复盘。
          </p>
        </div>

        {/* Metric Badges */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">已完成</span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-600 font-mono">
              {completedCount} <span className="text-xs text-slate-400 font-normal">/ {totalGroups} 组</span>
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">练习中</span>
            <span className="text-base sm:text-lg font-extrabold text-blue-600 font-mono">
              {inProgressCount} <span className="text-xs text-slate-400 font-normal">组</span>
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200/80 text-left">
            <span className="text-[10px] text-emerald-600 font-semibold block uppercase">总进度</span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-700 font-mono">
              {completionPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Group Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {activeGroups.map((group) => {
          const grpProgress = currentProgress[group.groupId];
          return (
            <GroupCard
              key={`${currentDataset}-${group.groupId}`}
              group={group}
              progress={grpProgress}
              onSelect={handleSelectGroup}
            />
          );
        })}
      </div>
    </div>
  );
};
