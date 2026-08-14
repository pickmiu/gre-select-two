import React, { useState } from 'react';
import { BookOpen, Upload, RotateCcw, Sparkles } from 'lucide-react';
import { useWordStore } from '../../stores/useWordStore';
import { useQuizStore } from '../../stores/useQuizStore';
import { CSVModal } from './CSVModal';
import { ResetModal } from './ResetModal';

export const Header: React.FC = () => {
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const resetWords = useWordStore((s) => s.resetWordsToDefault);
  const resetQuestions = useQuizStore((s) => s.resetQuestionsToDefault);
  const appStage = useQuizStore((s) => s.appStage);
  const exitPractice = useQuizStore((s) => s.exitPractice);

  const handleConfirmReset = () => {
    resetWords();
    resetQuestions();
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
            <img
              src="/gre-logo.webp"
              alt="GRE Logo"
              className="w-10 h-10 rounded-2xl object-cover shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform border border-slate-200/50"
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="font-bold text-slate-800 text-lg tracking-tight">GRE 6选2等价词真题巧记</h1>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">800等价词结合真题记忆</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setIsCsvModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="导入/导出 CSV 词库与题库"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span className="hidden xs:inline">CSV 导入/导出</span>
            </button>

            <button
              onClick={() => setIsResetModalOpen(true)}
              className="inline-flex items-center space-x-1 px-3 py-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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

      {/* Reset Confirmation Modal */}
      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
      />
    </>
  );
};
