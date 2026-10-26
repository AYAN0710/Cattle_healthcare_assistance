import React, { useState } from 'react';
import { Upload, Sparkles, AlertCircle, CheckCircle, Stethoscope, HelpCircle, Loader2, RefreshCw } from 'lucide-react';
import { api, getToken } from '../services/api';

const SAMPLES = [
  { name: 'Sample Cattle 1', url: '/images/cattle1.png' },
  { name: 'Sample Cattle 2', url: '/images/cattle2.png' },
  { name: 'Sample Cattle 3', url: '/images/cattle3.png' },
];

export default function DiagnosisTool({ onOpenAuth, showToast }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [loadingGuidance, setLoadingGuidance] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [guidanceResult, setGuidanceResult] = useState(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG/JPG).', 'error');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPredictionResult(null);
    setGuidanceResult(null);
  };

  // Convert sample image URL to File object for testing ease
  const handleSelectSample = async (sampleUrl) => {
    try {
      const res = await fetch(sampleUrl);
      const blob = await res.blob();
      const file = new File([blob], 'sample_cattle.png', { type: 'image/png' });
      handleFileSelect(file);
      showToast('Sample image loaded! Click Analyze to test prediction.');
    } catch (err) {
      showToast('Failed to load sample image.', 'error');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!getToken()) {
      showToast('Please login to run AI disease prediction.', 'info');
      onOpenAuth();
      return;
    }

    if (!selectedFile) {
      showToast('Please upload or select a cattle photo first.', 'error');
      return;
    }

    setLoadingPrediction(true);
    setPredictionResult(null);
    setGuidanceResult(null);

    try {
      // 1. Call POST /predict/cow
      const result = await api.predictCow(selectedFile);
      setPredictionResult(result);
      showToast(`Analysis complete: ${result.disease}`);

      // 2. Automatically fetch health guidance from POST /health/guidance
      if (result.prediction_id) {
        setLoadingGuidance(true);
        try {
          const guidance = await api.getHealthGuidance(result.prediction_id);
          setGuidanceResult(guidance);
        } catch (guidanceErr) {
          console.error(guidanceErr);
          showToast('Could not fetch AI health guidance automatically.', 'error');
        } finally {
          setLoadingGuidance(false);
        }
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error executing disease prediction', 'error');
    } finally {
      setLoadingPrediction(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!predictionResult?.prediction_id) return;
    if (!customQuestion.trim()) return;

    setLoadingGuidance(true);
    try {
      const guidance = await api.getHealthGuidance(predictionResult.prediction_id, customQuestion);
      setGuidanceResult(guidance);
      showToast('AI Guidance updated for your question!');
    } catch (err) {
      showToast(err.message || 'Failed to query health guidance', 'error');
    } finally {
      setLoadingGuidance(false);
    }
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPredictionResult(null);
    setGuidanceResult(null);
    setCustomQuestion('');
  };

  return (
    <section className="section diagnosis-section" id="diagnosis">
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="section-kicker">AI DIAGNOSIS SYSTEM</div>
          <h2 className="how-title" style={{ margin: '0 auto', maxWidth: '600px' }}>
            Instant Cattle Health Detection
          </h2>
          <p className="how-subtitle" style={{ margin: '10px auto', maxWidth: '500px' }}>
            Upload a clear photo of your cattle to detect potential diseases and receive instant AI agent advice.
          </p>
        </div>

        <div className="diagnosis-card">
          {!previewUrl ? (
            <div>
              <div
                className={`upload-box ${dragOver ? 'dragover' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('cattle-file-input').click()}
              >
                <input
                  id="cattle-file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                />
                <div className="upload-icon">
                  <Upload size={32} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px', color: '#0D3B34' }}>
                  Click or drag photo to upload
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B' }}>
                  Supports JPG, PNG images of cattle skin, eyes, body or posture.
                </p>
              </div>

              {/* Sample Images Picker */}
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', marginBottom: '12px' }}>
                  OR TRY A DEMO SAMPLE PHOTO:
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  {SAMPLES.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSample(s.url)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--border-light)',
                        borderRadius: '12px',
                        padding: '8px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--primary-dark)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <img src={s.url} alt={s.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span>{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="preview-image-container">
                <img src={previewUrl} alt="Selected cattle" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button
                  className="btn-analyze"
                  onClick={handleAnalyze}
                  disabled={loadingPrediction}
                >
                  {loadingPrediction ? (
                    <>
                      <Loader2 size={20} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Analyzing Photo...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      <span>Analyze Livestock Health</span>
                    </>
                  )}
                </button>

                <button
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-full)',
                    padding: '12px 24px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onClick={resetAll}
                >
                  <RefreshCw size={18} />
                  <span>Choose Another Photo</span>
                </button>
              </div>
            </div>
          )}

          {/* Prediction Results Display */}
          {predictionResult && (
            <div className="result-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span className="section-kicker">DETECTION RESULT</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '4px 0' }}>
                    {predictionResult.disease}
                  </h3>
                </div>
                <div
                  className={`result-badge ${
                    predictionResult.disease.toLowerCase().includes('healthy') ? 'healthy' : ''
                  }`}
                >
                  {predictionResult.disease.toLowerCase().includes('healthy') ? (
                    <CheckCircle size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  <span>Confidence: {(predictionResult.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* Health Guidance Display */}
              {loadingGuidance ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--primary)' }}>
                  <Loader2 size={28} className="spin-animation" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
                  <p style={{ fontWeight: 600 }}>Retrieving AI Veterinary Guidance & Precautions...</p>
                </div>
              ) : guidanceResult ? (
                <div className="guidance-box">
                  <div className="guidance-section-title">
                    <Stethoscope size={18} />
                    <span>AI Health Guidance & Overview</span>
                  </div>
                  <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, marginBottom: '20px' }}>
                    {guidanceResult.guidance || 'No specific guidance provided.'}
                  </p>

                  {guidanceResult.precautions && guidanceResult.precautions.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <div className="guidance-section-title">
                        <CheckCircle size={18} />
                        <span>Recommended Precautions & Steps</span>
                      </div>
                      <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: '#475569', lineHeight: 1.7 }}>
                        {guidanceResult.precautions.map((prec, i) => (
                          <li key={i}>{prec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {guidanceResult.veterinarian_advice && (
                    <div style={{ background: '#F0FDF4', padding: '16px', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                      <div className="guidance-section-title" style={{ color: '#166534' }}>
                        <Stethoscope size={18} />
                        <span>Veterinarian Recommendation</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#14532D', lineHeight: 1.5 }}>
                        {guidanceResult.veterinarian_advice}
                      </p>
                    </div>
                  )}

                  {/* Ask Follow-up Question Form */}
                  <form onSubmit={handleAskQuestion} style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
                    <div className="guidance-section-title">
                      <HelpCircle size={18} />
                      <span>Ask AI Assistant Follow-Up Question</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <input
                        type="text"
                        placeholder="e.g. What precautions should I take for calves?"
                        className="form-input"
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                      />
                      <button type="submit" className="btn-analyze" style={{ padding: '10px 24px', whiteSpace: 'nowrap' }}>
                        Ask AI
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
