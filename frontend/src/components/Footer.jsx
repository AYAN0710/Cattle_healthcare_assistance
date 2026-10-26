import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Footer() {
  return (
    <>
      {/* Disclaimer Banner */}
      <div className="disclaimer-banner">
        <div className="disclaimer-inner">
          <AlertTriangle size={18} className="disclaimer-icon" />
          <p>
            <strong>Medical Disclaimer:</strong> Bovicare AI is intended for educational and research purposes only.
            It is <strong>NOT</strong> a substitute for professional veterinary diagnosis or treatment.
            Always consult a qualified veterinary doctor or certified cattle specialist before making any health decisions for your livestock.
          </p>
        </div>
      </div>

      <footer className="site-footer" id="contact">
        <div className="footer-wave-top" />
        <div className="footer-container">
          <div>
            <div className="footer-logo">
              <span>🐮</span>
              <span>Bovicare AI</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '360px', color: 'rgba(255,255,255,0.7)' }}>
              Empowering farmers and livestock health managers with cutting-edge computer vision disease detection and automated RAG veterinary guidance.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 800, marginBottom: '16px' }}>Solutions</h4>
            <ul style={{ listStyle: 'none', display: 'grid', gap: '10px', fontSize: '0.88rem' }}>
              <li><a href="#diagnosis" style={{ color: 'inherit', textDecoration: 'none' }}>AI Disease Diagnosis</a></li>
              <li><a href="#how-it-works" style={{ color: 'inherit', textDecoration: 'none' }}>Health Guidance RAG</a></li>
              <li><a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Herd Monitoring</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 800, marginBottom: '16px' }}>Company</h4>
            <ul style={{ listStyle: 'none', display: 'grid', gap: '10px', fontSize: '0.88rem' }}>
              <li><a href="#hero" style={{ color: 'inherit', textDecoration: 'none' }}>About Bovicare</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 800, marginBottom: '16px' }}>Support</h4>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
              Questions or farm inquiries?<br />
              Email: support@bovicare.ai<br />
              Emergency vet helpline available 24/7.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Bovicare AI Systems. All rights reserved.</span>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
            ⚠️ For research &amp; educational use only — not for real-world clinical decisions.
          </span>
        </div>
      </footer>
    </>
  );
}
