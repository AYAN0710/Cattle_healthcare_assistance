import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, History, LogOut, Camera, BarChart2, Home } from 'lucide-react';

export default function Navbar({ onOpenAuth, onOpenHistory, userEmail, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className="nav-pill-wrapper">
        <nav className="nav-pill">
          {/* Brand */}
          <Link to="/" className="logo-brand" onClick={() => setMobileMenuOpen(false)}>
            <div className="logo-badge">🐮</div>
            <span>Bovicare</span>
          </Link>

          {/* Nav links */}
          <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <li>
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={15} />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link
                to="/cnn-prediction"
                className={`nav-link ${isActive('/cnn-prediction') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Camera size={15} />
                <span>Image Diagnosis</span>
              </Link>
            </li>
            <li>
              <Link
                to="/tabular-prediction"
                className={`nav-link ${isActive('/tabular-prediction') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <BarChart2 size={15} />
                <span>Symptom Checker</span>
              </Link>
            </li>
          </ul>

          {/* Actions */}
          <div className="nav-actions">
            {userEmail ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="nav-user-email" title={userEmail}>
                  <span>👤</span>
                  <span className="nav-email-text">{userEmail}</span>
                </div>
                <button
                  className="btn-pill-login"
                  style={{ background: '#165349' }}
                  onClick={onOpenHistory}
                  title="View History"
                >
                  <History size={16} />
                  <span>History</span>
                </button>
                <button
                  className="btn-pill-login"
                  style={{ background: '#7F1D1D', padding: '10px 14px' }}
                  onClick={onLogout}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button className="btn-pill-login" onClick={onOpenAuth}>
                <span>Login</span>
              </button>
            )}

            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
