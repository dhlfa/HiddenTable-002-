import { Routes, Route } from 'react-router-dom';
import { ReadingSessionProvider } from './hooks/readingSessionContext';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { MainChamber } from './pages/MainChamber';
import { ReadingRoom } from './pages/ReadingRoom';
import { CardSelection } from './pages/CardSelection';
import { ReadingResult } from './pages/ReadingResult';
import { CardArchive } from './pages/CardArchive';
import { DailyReflection } from './pages/DailyReflection';
import { ReadingJournal } from './pages/ReadingJournal';
import { SettingsPage } from './pages/SettingsPage';
import { NotFound } from './pages/NotFound';

export function App() {
  return (
    <ReadingSessionProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chamber" element={<MainChamber />} />
          <Route path="/reading" element={<ReadingRoom />} />
          <Route path="/reading/cards" element={<CardSelection />} />
          <Route path="/reading/result" element={<ReadingResult />} />
          <Route path="/archive" element={<CardArchive />} />
          <Route path="/daily" element={<DailyReflection />} />
          <Route path="/journal" element={<ReadingJournal />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ReadingSessionProvider>
  );
}
