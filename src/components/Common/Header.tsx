import React, { useState } from 'react';
import { BookOpen, Upload, RotateCcw, Sparkles } from 'lucide-react';
import { useWordStore } from '../../stores/useWordStore';
import { useQuizStore } from '../../stores/useQuizStore';
import { CSVModal } from './CSVModal';

export const Header: React.FC = () => {
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const resetWords = useWordStore((s) => s.resetWordsToDefault);
  const resetQuestions = useQuizStore((s) => s.resetQuestionsToDefault);
  const appStage = useQuizStore((s) => s.appStage);
  const exitPractice = useQuizStore((s) => s.exitPractice);

  const handleResetAll = () => {
    if (window.confirm('确定要重置所有词库、题库及学习记录恢复为默认状态吗？')) {
      resetWords();
      resetQuestions();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div
            onClick={() => appStage !== 'selection' && exitPractice()}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="font-bold text-slate-800 text-lg tracking-tight">GRE 等价词练习</h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 rounded-full border border-blue-200">
                  6选2
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block"> 800 等价词成组记忆</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setIsCsvModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="导入/导出 CSV 词库与题库"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span className="hidden xs:inline">CSV 导入/导出</span>
            </button>

            <button
              onClick={handleResetAll}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="重置数据"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">重置</span>
            </button>
          </div>
        </div>
      </header>

      {/* CSV Import/Export Modal */}
      {isCsvModalOpen && <CSVModal onClose={() => setIsCsvModalOpen(false)} />}
    </>
  );
};
