import React from 'react';
import { Header } from './components/Common/Header';
import { GroupSelectionPage } from './components/GroupList/GroupSelectionPage';
import { QuizPage } from './components/Quiz/QuizPage';
import { CompletionPage } from './components/Completion/CompletionPage';
import { useGroupProgressStore } from './stores/useGroupProgressStore';

export const App: React.FC = () => {
  const appStage = useGroupProgressStore((s) => s.appStage);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {appStage === 'selection' && <Header />}
      <main className="flex-1">
        {appStage === 'selection' && <GroupSelectionPage />}
        {appStage === 'quiz' && <QuizPage />}
        {appStage === 'completion' && <CompletionPage />}
      </main>
    </div>
  );
};

export default App;
