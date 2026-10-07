import React, { useMemo, useState } from 'react';
import { BookOpen, Settings } from 'lucide-react';
import { useGroupProgressStore } from '../../stores/useGroupProgressStore';
import { parseZhangweiCSV, parseBbgreCSV, chunkVocabPairs } from '../../utils/vocabAdapters';
import { parseQuestionsCSV } from '../../utils/csvParser';
import { GroupCard } from './GroupCard';
import { SettingsModal } from '../Common/SettingsModal';
import { VocabGroup } from '../../types';
import { soundService } from '../../utils/audio';

import zhangweiCSV from '../../data/words.csv?raw';
import bbgreCSV from '../../data/bbgreword.csv?raw';
import questionsCSV from '../../data/questions.csv?raw';

export const GroupSelectionPage: React.FC = () => {
  const { currentDataset, progress, setDataset, startGroup } = useGroupProgressStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const allQuestions = useMemo(() => parseQuestionsCSV(questionsCSV), []);
  const zhangweiPairs = useMemo(() => parseZhangweiCSV(zhangweiCSV), []);
  const bbgrePairs = useMemo(() => parseBbgreCSV(bbgreCSV), []);

  const zhangweiGroups = useMemo(() => chunkVocabPairs(zhangweiPairs, 30), [zhangweiPairs]);
  const bbgreGroups = useMemo(() => chunkVocabPairs(bbgrePairs, 30), [bbgrePairs]);

  const activeGroups = currentDataset === 'zhangwei' ? zhangweiGroups : bbgreGroups;
  const activePool = currentDataset === 'zhangwei' ? zhangweiPairs : bbgrePairs;
  const currentProgress = progress[currentDataset] || {};

  const handleSelectGroup = (group: VocabGroup) => {
    soundService.unlock();
    startGroup(group, allQuestions, activePool);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Top Controls: Dataset Tabs Switcher & Settings Button */}
      <div className="flex items-center justify-center gap-2.5 sm:gap-3 max-w-xl mx-auto">
        <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center flex-1 shadow-inner border border-slate-300/50">
          <button
            onClick={() => setDataset('bbgre')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
              currentDataset === 'bbgre'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>BBGRE 等价词</span>
          </button>

          <button
            onClick={() => setDataset('zhangwei')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
              currentDataset === 'zhangwei'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>张巍等价词</span>
          </button>
        </div>

        {/* Settings button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/90 shadow-sm transition-all active:scale-95 shrink-0"
          title="设置与说明"
        >
          <Settings className="w-5 h-5" />
        </button>
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

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
