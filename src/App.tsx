import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { MatchesLandingPage } from './pages/MatchesLandingPage';
import { MatchCentrePage } from './pages/MatchCentrePage';
import { StoriesPage } from './pages/StoriesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<MatchesLandingPage />} />
        <Route path="/matches" element={<MatchesLandingPage />} />
        <Route path="/match/:matchId" element={<MatchCentrePage />} />
        <Route path="/match" element={<MatchCentrePage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="*" element={<Navigate to="/matches" replace />} />
      </Routes>
    </AppShell>
  );
}

export default App;
