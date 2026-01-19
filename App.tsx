
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { CheckResults } from './pages/CheckResults';
import { Notifications } from './pages/Notifications';

import { SecurityWrapper } from './components/SecurityWrapper';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isResultsPage = location.pathname.startsWith('/results');

  return (
    <SecurityWrapper>
      <div className={`flex flex-col bg-slate-50 ${isResultsPage ? "h-screen" : "min-h-screen"}`}>
        {/* Global NavBar - Always visible */}
        <NavBar />

        <main className={`flex-1 ${isResultsPage ? "overflow-hidden" : ""}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<CheckResults />} />
            <Route path="/results/:htNo" element={<CheckResults />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer flows naturally at bottom of page, hidden on results view */}
        {!isResultsPage && <Footer />}
      </div>
    </SecurityWrapper>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
