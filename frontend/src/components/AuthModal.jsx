import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, showToast }) {
  // Modes: 'login', 'register', 'verify'
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear inputs when modal opens fresh
  useEffect(() => {
    if (isOpen && mode === 'login') {
      setPassword('');
      setOtp('');
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const data = await api.login(email, password);
        showToast('Successfully logged in!');
        onAuthSuccess(email);
        onClose();
      } else if (mode === 'register') {
        const data = await api.register(name, email, password);
        showToast('Registration submitted! Please verify the OTP sent to your console/email.');
        setMode('verify');
      } else if (mode === 'verify') {
        await api.verifyEmail(email, otp);
        showToast('Email verified successfully! Logging you in...');
        // Auto login after verification
        const data = await api.login(email, password);
        onAuthSuccess(email);
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await api.resendOtp(email);
      showToast('New OTP generated!');
    } catch (err) {
      showToast(err.message || 'Failed to resend OTP', 'error');
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-card-split" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="close-modal-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Left Side: Cream Form Area matching Image 2 */}
        <div className="auth-left">
          <div>
            {/* Top Logo Header matching image 2 */}
            <div className="auth-logo-header">
              <div className="auth-badge">CH</div>
              <div className="auth-brand-name">
                <span>bovicare</span>
                <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.6, fontWeight: 700 }}>
                  CATTLE HEALTH AI
                </span>
              </div>
            </div>

            {/* Dynamic Headlines */}
            {mode === 'login' && (
              <>
                <h2 className="auth-title">Good care starts with a clear signal.</h2>
                <p className="auth-subtitle">Sign in to see what your herd is telling you today.</p>
              </>
            )}

            {mode === 'register' && (
              <>
                <h2 className="auth-title">Create your farm account.</h2>
                <p className="auth-subtitle">Start monitoring livestock health with AI guidance.</p>
              </>
            )}

            {mode === 'verify' && (
              <>
                <h2 className="auth-title">Verify your email address.</h2>
                <p className="auth-subtitle">Enter the 6-digit OTP code sent to verify {email}.</p>
              </>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="form-group">
                  <label className="form-label">FULL NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              {mode !== 'verify' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      required
                      placeholder="you@farmmail.com"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">PASSWORD</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter your password"
                      className="form-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label className="form-label">ENTER 6-DIGIT OTP</label>
                  <input
                    type="text"
                    required
                    placeholder="123456"
                    maxLength={6}
                    className="form-input"
                    style={{ letterSpacing: '0.3em', fontSize: '1.2rem', textAlign: 'center' }}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      marginTop: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    Didn't get code? Resend OTP
                  </button>
                </div>
              )}

              <button type="submit" className="btn-auth-submit" disabled={loading}>
                {loading ? (
                  <Loader2 size={20} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Log in securely'}
                      {mode === 'register' && 'Create farm account'}
                      {mode === 'verify' && 'Verify OTP & Sign in'}
                    </span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer toggle link */}
          <div className="auth-footer-link">
            {mode === 'login' ? (
              <span>
                New to Bovicare?{' '}
                <button type="button" onClick={() => setMode('register')}>
                  Create your farm account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')}>
                  Sign in here
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Cattle Photo Panel matching Image 2 */}
        <div className="auth-right">
          <img src="/images/cattle1.png" alt="Cattle portrait" className="auth-right-bg" />
          <div className="auth-right-content">
            <div className="auth-right-kicker">BOVICARE / HERD INTELLIGENCE</div>
            <h3 className="auth-right-title">A quieter way to keep every animal seen.</h3>
            <p className="auth-right-subtitle">
              Proactive health assistance turns everyday observations into next-best actions for your herd.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
