import React, { useEffect } from 'react';
import { GroupSelectionPage } from './components/GroupList/GroupSelectionPage';
import { QuizPage } from './components/Quiz/QuizPage';
import { CompletionPage } from './components/Completion/CompletionPage';
import { useGroupProgressStore } from './stores/useGroupProgressStore';
import { soundService } from './utils/audio';

export const App: React.FC = () => {
  const appStage = useGroupProgressStore((s) => s.appStage);

  // Preload UI sound assets immediately on homepage entry
  useEffect(() => {
    soundService.preload();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <main className="flex-1">
        {appStage === 'selection' && <GroupSelectionPage />}
        {appStage === 'quiz' && <QuizPage />}
        {appStage === 'completion' && <CompletionPage />}
      </main>
    </div>
  );
};

export default App;
