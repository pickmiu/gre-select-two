import React from 'react';
import { Header } from './components/Common/Header';
import { WordSelectionPage } from './components/WordList/WordSelectionPage';
import { QuizPage } from './components/Quiz/QuizPage';
import { CompletionPage } from './components/Completion/CompletionPage';
import { useQuizStore } from './stores/useQuizStore';

export const App: React.FC = () => {
  const appStage = useQuizStore((s) => s.appStage);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {appStage === 'selection' && <Header />}
      <main className="flex-1">
        {appStage === 'selection' && <WordSelectionPage />}
        {appStage === 'quiz' && <QuizPage />}
        {appStage === 'completion' && <CompletionPage />}
      </main>
    </div>
  );
};

export default App;
