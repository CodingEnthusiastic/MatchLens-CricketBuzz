import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { MatchCentrePage } from './pages/MatchCentrePage';
import { StoriesPage } from './pages/StoriesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<MatchCentrePage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
