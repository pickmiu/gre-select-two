import React from 'react';
import { ArrowRight, AlertCircle, HelpCircle, BookOpen } from 'lucide-react';
import { useWordStore } from '../../stores/useWordStore';
import { QuizQuestion, AnswerStatus } from '../../types';
import { isWordMatchOption } from '../../utils/questionGenerator';

interface WordExplanationProps {
  question: QuizQuestion;
  answerStatus: AnswerStatus;
  onNext: () => void;
}

export const WordExplanation: React.FC<WordExplanationProps> = ({
  question,
  answerStatus,
  onNext,
}) => {
  const { wordList } = useWordStore();

  React.useEffect(() => {
    if (answerStatus !== 'wrong' && answerStatus !== 'unknown') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [answerStatus, onNext]);

  if (answerStatus !== 'wrong' && answerStatus !== 'unknown') {
    return null;
  }

  const findEntryForWord = (ansWord: string, ansBase?: string) => {
    const targets = [ansBase, ansWord].filter(Boolean) as string[];

    for (const target of targets) {
      const targetLower = target.toLowerCase().trim();

      // 1. Direct exact match on headword
      let entry = wordList.find((w) => w.word.toLowerCase().trim() === targetLower);
      if (entry) return entry;

      // 2. Direct exact match on equivalents
      entry = wordList.find((w) =>
        w.equivalents.some((eq) => eq.toLowerCase().trim() === targetLower)
      );
      if (entry) return entry;

      // 3. Stem / normalized match on headword or equivalents using isWordMatchOption
      entry = wordList.find(
        (w) =>
          isWordMatchOption(w.word, target) ||
          w.equivalents.some((eq) => isWordMatchOption(eq, target))
      );
      if (entry) return entry;
    }

    return null;
  };

  // Lookup CSV word entries and deduplicate by primary headword
  const rawEntries = question.answers.map((ansWord, idx) => {
    const ansBase =
      question.answerBases && question.answerBases[idx]
        ? question.answerBases[idx]
        : undefined;

    const entry = findEntryForWord(ansWord, ansBase);

    if (entry) {
      return {
        key: entry.word.toLowerCase().trim(),
        headword: entry.word,
        equivalents: entry.equivalents,
        definition: entry.definition || '暂无释义',
      };
    }

    return {
      key: (ansBase || ansWord).toLowerCase().trim(),
      headword: ansBase || ansWord,
      equivalents: [],
      definition: '暂无释义',
    };
  });

  // Deduplicate entries so same group is shown once
  const uniqueEntries = Array.from(
    new Map(rawEntries.map((e) => [e.key, e])).values()
  );

  const title = answerStatus === 'wrong' ? '✕ 回答错误' : '不认识';
  const isWrong = answerStatus === 'wrong';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onNext}
    >
      <div
        className="bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl max-w-md w-full border border-slate-800 space-y-3 animate-scale-up max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Status & Title Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm sm:text-base">
            {isWrong ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <HelpCircle className="w-4 h-4 shrink-0 text-amber-400" />
            )}
            <span className={isWrong ? 'text-rose-400' : 'text-amber-400'}>{title}</span>
          </div>

          <span className="text-[11px] text-slate-400 flex items-center space-x-1 font-medium">
            <BookOpen className="w-3 h-3 text-blue-400" />
            <span>等价词背诵记忆</span>
          </span>
        </div>

        {/* Correct Answers Bar */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-400 uppercase tracking-wider shrink-0 text-[11px]">正确答案:</span>
          <div className="flex flex-wrap gap-1.5">
            {question.answers.map((ans) => (
              <span
                key={ans}
                className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md font-mono font-bold text-xs"
              >
                {ans}
              </span>
            ))}
          </div>
        </div>

        {/* Clean 1-Line per Word Entry Equivalence List */}
        <div className="space-y-1.5 pt-1.5 border-t border-slate-800">
          {uniqueEntries.map((entry, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 p-2 bg-slate-800/90 rounded-xl border border-slate-700/80"
            >
              {/* Left: Equivalence Equation (headword = eq1, eq2...) */}
              <div className="flex flex-wrap items-center gap-1.5 min-w-0 font-mono">
                <span className="font-extrabold text-blue-300 text-xs sm:text-sm">
                  {entry.headword}
                </span>

                {entry.equivalents.length > 0 && (
                  <>
                    <span className="text-slate-400 font-bold text-[10px]">=</span>
                    {entry.equivalents.map((eq, eqIdx) => (
                      <span
                        key={eqIdx}
                        className="px-1.5 py-0.5 text-[11px] bg-slate-700/80 text-slate-200 rounded-md font-medium"
                      >
                        {eq}
                      </span>
                    ))}
                  </>
                )}
              </div>

              {/* Right: Chinese Definition Tag */}
              <span className="px-2 py-0.5 text-[11px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 rounded-lg shrink-0">
                {entry.definition}
              </span>
            </div>
          ))}
        </div>

        {/* Next Question CTA Button */}
        <div className="pt-1">
          <button
            onClick={onNext}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-blue-500/30 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
          >
            <span>下一题 (Enter)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
