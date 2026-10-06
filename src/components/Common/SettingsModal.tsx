import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, RotateCcw, Upload, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { useGroupProgressStore } from '../../stores/useGroupProgressStore';
import { useWordStore } from '../../stores/useWordStore';
import { useQuizStore } from '../../stores/useQuizStore';
import { ResetModal } from './ResetModal';
import { CSVModal } from './CSVModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const resetAllProgress = useGroupProgressStore((s) => s.resetAll);
  const resetWords = useWordStore((s) => s.resetWordsToDefault);
  const resetQuestions = useQuizStore((s) => s.resetQuestionsToDefault);

  const handleConfirmReset = () => {
    resetAllProgress();
    resetWords();
    resetQuestions();
    setIsResetConfirmOpen(false);
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 p-5 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">设置与说明</h3>
                <p className="text-xs text-slate-400">GRE 6选2等价词真题巧记</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section: Feature Guide & Instructions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>使用说明与设计机制</span>
            </h4>

            <div className="space-y-2 text-xs sm:text-sm text-slate-600 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">双词库支持：</strong>
                  默认提供 <strong>BBGRE 等价词</strong>与 <strong>张巍等价词</strong>，每 30 词/对固定分组。
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">高效沉浸刷题：</strong>
                  选中 2 个等价词后毫秒级直跳下一题，做题时不显露对错干扰，保持高频刷题节奏，并支持随时返回上一题。
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">真题优先与纯净兜底：</strong>
                  优先匹配历年填空真题；若无对应真题，直接呈现中文释义作为题干，考查精准。
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">考后集中复盘：</strong>
                  每组答完后进入结算页，集中查看错误率、做错单词清单，以及本次完整的 30 个单词对。
                </div>
              </div>
            </div>
          </div>

          {/* Section: Data Management */}
          <div className="space-y-2.5 pt-1">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              数据管理与配置
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => setIsCsvModalOpen(true)}
                className="flex items-center justify-center space-x-2 py-2.5 px-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors border border-slate-200/60"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                <span>CSV 导入 / 导出</span>
              </button>

              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="flex items-center justify-center space-x-2 py-2.5 px-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm transition-colors border border-rose-200/80"
              >
                <RotateCcw className="w-4 h-4 text-rose-500" />
                <span>重置所有练习进度</span>
              </button>
            </div>
          </div>

          {/* Bottom Close */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all"
            >
              完成
            </button>
          </div>
        </motion.div>

        {/* Reset Confirmation Modal */}
        <ResetModal
          isOpen={isResetConfirmOpen}
          onClose={() => setIsResetConfirmOpen(false)}
          onConfirm={handleConfirmReset}
        />

        {/* CSV Modal */}
        {isCsvModalOpen && <CSVModal onClose={() => setIsCsvModalOpen(false)} />}
      </div>
    </AnimatePresence>,
    document.body
  );
};
