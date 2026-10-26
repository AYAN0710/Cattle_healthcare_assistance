import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import PredictionHistory from './components/PredictionHistory';
import HomePage from './pages/HomePage';
import CNNPredictionPage from './pages/CNNPredictionPage';
import TabularPredictionPage from './pages/TabularPredictionPage';
import { api, getUserEmail, getToken } from './services/api';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(getUserEmail());
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Auto-logout on every page refresh — clear any persisted token
    api.logout();
    setUserEmail(null);
  }, []);

  const showToast = (text, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleAuthSuccess = (email) => {
    setUserEmail(email);
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    api.logout();
    setUserEmail(null);
    showToast('Logged out successfully.');
  };

  const sharedProps = { onOpenAuth: () => setAuthModalOpen(true), showToast, userEmail };

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar
          onOpenAuth={() => setAuthModalOpen(true)}
          onOpenHistory={() => setHistoryDrawerOpen(true)}
          userEmail={userEmail}
          onLogout={handleLogout}
        />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cnn-prediction" element={<CNNPredictionPage {...sharedProps} />} />
            <Route path="/tabular-prediction" element={<TabularPredictionPage {...sharedProps} />} />
          </Routes>
        </main>

        <Footer />

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          showToast={showToast}
        />

        <PredictionHistory
          isOpen={historyDrawerOpen}
          onClose={() => setHistoryDrawerOpen(false)}
          userEmail={userEmail}
          showToast={showToast}
        />

        {/* Toast Notifications */}
        <div className="toast-container">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="toast"
              style={{
                background:
                  t.type === 'error' ? '#991B1B' : t.type === 'info' ? '#1E3A8A' : '#0A3029',
              }}
            >
              {t.type === 'error' ? (
                <AlertTriangle size={18} />
              ) : t.type === 'info' ? (
                <Info size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
              <span>{t.text}</span>
            </div>
          ))}
        </div>
      </div>
    </BrowserRouter>
  );
}
