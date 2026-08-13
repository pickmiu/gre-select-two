import React, { useState } from 'react';
import { X, Upload, Download, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWordStore } from '../../stores/useWordStore';
import { useQuizStore } from '../../stores/useQuizStore';
import { parseWordsCSV, parseQuestionsCSV, exportWordsToCSV, exportQuestionsToCSV } from '../../utils/csvParser';

interface CSVModalProps {
  onClose: () => void;
}

export const CSVModal: React.FC<CSVModalProps> = ({ onClose }) => {
  const { wordList, importWords } = useWordStore();
  const { allQuestions, importQuestions } = useQuizStore();

  const [activeTab, setActiveTab] = useState<'words' | 'questions'>('words');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        if (activeTab === 'words') {
          const parsed = parseWordsCSV(text);
          if (parsed.length === 0) {
            setStatusMessage({ type: 'error', text: '未能在 CSV 文件中解析到有效单词，请检查表头是否包含 单词, 等价词, 汉语解释' });
            return;
          }
          importWords(parsed, importMode === 'replace');
          setStatusMessage({ type: 'success', text: `成功导入 ${parsed.length} 个单词！` });
        } else {
          const parsed = parseQuestionsCSV(text);
          if (parsed.length === 0) {
            setStatusMessage({ type: 'error', text: '未能在 CSV 文件中解析到有效 6选2 题目，请检查列名格式。' });
            return;
          }
          importQuestions(parsed, importMode === 'replace');
          setStatusMessage({ type: 'success', text: `成功导入 ${parsed.length} 道题目！` });
        }
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: `解析文件失败: ${err.message}` });
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    if (activeTab === 'words') {
      const csvStr = exportWordsToCSV(wordList);
      downloadBlob(csvStr, 'gre_words_export.csv', 'text/csv;charset=utf-8;');
    } else {
      const csvStr = exportQuestionsToCSV(allQuestions);
      downloadBlob(csvStr, 'gre_questions_export.csv', 'text/csv;charset=utf-8;');
    }
  };

  const downloadBlob = (content: string, filename: string, contentType: string) => {
    const blob = new Blob(['\ufeff' + content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-lg">CSV 数据管理</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => {
                setActiveTab('words');
                setStatusMessage(null);
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'words' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              词库数据 ({wordList.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('questions');
                setStatusMessage(null);
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'questions' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              题库数据 ({allQuestions.length})
            </button>
          </div>

          {/* CSV Schema Format Guidance */}
          <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-100 text-xs text-blue-800 space-y-1">
            <p className="font-semibold text-blue-900">
              {activeTab === 'words' ? '词库 CSV 格式说明：' : '题库 CSV 格式说明：'}
            </p>
            {activeTab === 'words' ? (
              <p className="font-mono text-slate-700 bg-white/70 p-1.5 rounded border border-blue-200">
                单词,等价词,汉语解释<br />
                mitigate,"abate, curtail, temper",缓和
              </p>
            ) : (
              <p className="font-mono text-slate-700 bg-white/70 p-1.5 rounded border border-blue-200 overflow-x-auto">
                id,stem,option1,option2,option3,option4,option5,option6,answer1,answer2
              </p>
            )}
          </div>

          {/* Import mode option */}
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
            <span className="font-medium text-slate-700">导入策略：</span>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="append"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>追加到已有数据</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>覆盖当前数据</span>
              </label>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl flex items-center space-x-2 text-xs font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl cursor-pointer shadow-sm transition-colors">
              <Upload className="w-4 h-4" />
              <span>导入 {activeTab === 'words' ? '词库' : '题库'} CSV</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={handleExport}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-colors"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>导出 {activeTab === 'words' ? '词库' : '题库'} CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
