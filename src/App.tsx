import { HashRouter, Routes, Route } from 'react-router-dom';
import { TimeEntriesProvider } from './hooks/useTimeEntries';
import { SettingsProvider } from './hooks/useSettings';
import { ThemeProvider } from './hooks/useTheme';
import { Header } from './components/Header/Header';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Settings } from './pages/Settings';

export function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <TimeEntriesProvider>
          <HashRouter>
            <div className="app-layout">
              <Header />
              <main className="app-main">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
          </HashRouter>
        </TimeEntriesProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
