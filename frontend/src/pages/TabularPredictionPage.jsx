import React, { useState, useRef, useEffect } from 'react';
import {
  ChartBar, Sparkles, AlertCircle, CheckCircle, Stethoscope,
  HelpCircle, Loader2, FileText, Download, Send, RefreshCw
} from 'lucide-react';
import { api, getToken } from '../services/api';

// Symptom options from the training dataset
const SYMPTOM_OPTIONS = [
  'None',
  'loss of appetite',
  'depression',
  'painless lumps',
  'difficulty walking',
  'lameness',
  'crackling sound',
  'shortness of breath',
  'fatigue',
  'chest discomfort',
  'sweats',
  'chills',
  'swelling in limb',
  'swelling in muscle',
  'swelling in extremities',
  'swelling in abdomen',
  'swelling in neck',
  'blisters on gums',
  'sores on hooves',
  'blisters on hooves',
  'blisters on tongue',
  'sores on gums',
  'sores on tongue',
  'sores on mouth',
  'blisters on mouth',
];

export default function TabularPredictionPage({ onOpenAuth, showToast, userEmail }) {
  const [formData, setFormData] = useState({
    age: '',
    temperature: '',
    symptom_1: 'None',
    symptom_2: 'None',
    symptom_3: 'None',
  });
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [loadingGuidance, setLoadingGuidance] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [reportResult, setReportResult] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!getToken()) {
      showToast('Please login to run disease prediction.', 'info');
      onOpenAuth();
      return;
    }

    const { age, temperature, symptom_1, symptom_2, symptom_3 } = formData;
    if (!age || !temperature) {
      showToast('Please enter age and temperature.', 'error');
      return;
    }

    setLoadingPrediction(true);
    setPredictionResult(null);
    setReportResult(null);
    setChatMessages([]);

    try {
      const result = await api.predictTabular({
        age: parseFloat(age),
        temperature: parseFloat(temperature),
        symptom_1,
        symptom_2,
        symptom_3,
      });
      setPredictionResult(result);
      showToast(`Prediction complete: ${result.disease}`);

      // Auto-fetch initial guidance
      setLoadingGuidance(true);
      try {
        const guidance = await api.getHealthGuidance(result.prediction_id);
        const aiMsg = formatGuidanceMessage(guidance);
        setChatMessages([{ role: 'ai', content: aiMsg, raw: guidance }]);
      } catch {
        setChatMessages([{ role: 'ai', content: 'Could not load initial guidance. Ask me anything about this disease!', raw: null }]);
      } finally {
        setLoadingGuidance(false);
      }
    } catch (err) {
      showToast(err.message || 'Prediction failed', 'error');
    } finally {
      setLoadingPrediction(false);
    }
  };

  const formatGuidanceMessage = (guidance) => {
    let msg = '';
    if (guidance.guidance) msg += guidance.guidance + '\n\n';
    if (guidance.precautions && guidance.precautions.length > 0) {
      msg += '**Recommended Precautions:**\n' + guidance.precautions.map(p => `• ${p}`).join('\n') + '\n\n';
    }
    if (guidance.veterinarian_advice) {
      msg += '**Veterinarian Advice:**\n' + guidance.veterinarian_advice;
    }
    return msg.trim();
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !predictionResult?.prediction_id) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setLoadingGuidance(true);

    try {
      const guidance = await api.getHealthGuidance(predictionResult.prediction_id, userMsg);
      const aiMsg = formatGuidanceMessage(guidance);
      setChatMessages(prev => [...prev, { role: 'ai', content: aiMsg, raw: guidance }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I could not answer that. Please try again.' }]);
      showToast(err.message || 'Failed to get AI guidance', 'error');
    } finally {
      setLoadingGuidance(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!predictionResult?.prediction_id) return;
    setLoadingReport(true);
    try {
      const report = await api.generateReport(predictionResult.prediction_id);
      setReportResult(report);
      showToast('Health report generated!');
    } catch (err) {
      showToast(err.message || 'Failed to generate report', 'error');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!reportResult?.report_id) return;
    try {
      const blob = await api.downloadReportPdf(reportResult.report_id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cattle_report_${reportResult.report_id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Report downloaded!');
    } catch (err) {
      showToast(err.message || 'Failed to download PDF', 'error');
    }
  };

  const resetAll = () => {
    setFormData({ age: '', temperature: '', symptom_1: 'None', symptom_2: 'None', symptom_3: 'None' });
    setPredictionResult(null);
    setReportResult(null);
    setChatMessages([]);
    setChatInput('');
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-header-inner">
          <div className="section-kicker">SYMPTOM-BASED DIAGNOSIS</div>
          <h1 className="page-title">ML Tabular Prediction</h1>
          <p className="page-subtitle">
            Enter your cattle's vitals and symptoms to predict diseases using our machine learning model.
          </p>
        </div>
      </div>

      <div className="page-content">
        <div className="cnn-layout">
          {/* LEFT: Form + Result */}
          <div className="cnn-left">
            <div className="page-card">
              <h2 className="card-title">
                <ChartBar size={20} />
                Enter Cattle Vitals & Symptoms
              </h2>

              <form onSubmit={handleSubmit} className="tabular-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="tab-age">Age (years)</label>
                    <input
                      id="tab-age"
                      type="number"
                      min="0.1"
                      step="0.1"
                      className="form-input"
                      placeholder="e.g. 3.5"
                      value={formData.age}
                      onChange={(e) => handleChange('age', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="tab-temp">Body Temperature (°F)</label>
                    <input
                      id="tab-temp"
                      type="number"
                      min="90"
                      max="115"
                      step="0.1"
                      className="form-input"
                      placeholder="e.g. 102.5"
                      value={formData.temperature}
                      onChange={(e) => handleChange('temperature', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="tab-s1">Primary Symptom</label>
                  <select
                    id="tab-s1"
                    className="form-input form-select"
                    value={formData.symptom_1}
                    onChange={(e) => handleChange('symptom_1', e.target.value)}
                  >
                    {SYMPTOM_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="tab-s2">Secondary Symptom</label>
                  <select
                    id="tab-s2"
                    className="form-input form-select"
                    value={formData.symptom_2}
                    onChange={(e) => handleChange('symptom_2', e.target.value)}
                  >
                    {SYMPTOM_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="tab-s3">Additional Symptom</label>
                  <select
                    id="tab-s3"
                    className="form-input form-select"
                    value={formData.symptom_3}
                    onChange={(e) => handleChange('symptom_3', e.target.value)}
                  >
                    {SYMPTOM_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <button type="submit" className="btn-analyze" disabled={loadingPrediction}>
                    {loadingPrediction ? (
                      <><Loader2 size={18} className="spin" /><span>Predicting...</span></>
                    ) : (
                      <><Sparkles size={18} /><span>Run Prediction</span></>
                    )}
                  </button>
                  {predictionResult && (
                    <button type="button" className="btn-secondary" onClick={resetAll}>
                      <RefreshCw size={16} />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </form>

              {/* Result */}
              {predictionResult && (
                <div className="result-box" style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div className="section-kicker" style={{ marginBottom: '4px' }}>PREDICTED DISEASE</div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>
                        {predictionResult.disease}
                      </h3>
                    </div>
                    <span className={`result-badge ${predictionResult.disease.toLowerCase().includes('healthy') ? 'healthy' : ''}`}>
                      {predictionResult.disease.toLowerCase().includes('healthy')
                        ? <CheckCircle size={15} />
                        : <AlertCircle size={15} />}
                      {(predictionResult.confidence * 100).toFixed(1)}% confidence
                    </span>
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {!reportResult ? (
                      <button className="btn-report" onClick={handleGenerateReport} disabled={loadingReport}>
                        {loadingReport ? (
                          <><Loader2 size={16} className="spin" /><span>Generating...</span></>
                        ) : (
                          <><FileText size={16} /><span>Generate Report</span></>
                        )}
                      </button>
                    ) : (
                      <button className="btn-download" onClick={handleDownloadPdf}>
                        <Download size={16} />
                        <span>Download PDF Report</span>
                      </button>
                    )}
                  </div>

                  {reportResult && (
                    <div className="report-preview">
                      <div className="report-section">
                        <div className="guidance-section-title"><Stethoscope size={16} /> Health Guidance</div>
                        <p>{reportResult.guidance || 'No guidance provided.'}</p>
                      </div>
                      {reportResult.precautions && reportResult.precautions.length > 0 && (
                        <div className="report-section">
                          <div className="guidance-section-title"><CheckCircle size={16} /> Precautions</div>
                          <ul>{reportResult.precautions.map((p, i) => <li key={i}>{p}</li>)}</ul>
                        </div>
                      )}
                      {reportResult.veterinarian_advice && (
                        <div className="report-section vet-advice">
                          <div className="guidance-section-title" style={{ color: '#166534' }}><Stethoscope size={16} /> Veterinarian Advice</div>
                          <p>{reportResult.veterinarian_advice}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Chat */}
          <div className="cnn-right">
            <div className="page-card chat-card">
              <h2 className="card-title">
                <HelpCircle size={20} />
                AI Health Assistant
                {userEmail && <span className="chat-user-tag">{userEmail}</span>}
              </h2>

              {!predictionResult ? (
                <div className="chat-empty">
                  <Stethoscope size={40} style={{ color: 'var(--accent-emerald)', marginBottom: '12px' }} />
                  <p>Submit the symptom form above to activate the AI health assistant chat.</p>
                </div>
              ) : (
                <>
                  <div className="chat-messages">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`chat-bubble ${msg.role}`}>
                        {msg.role === 'ai' && <div className="chat-avatar">🐮</div>}
                        <div className="chat-text">
                          {msg.content.split('\n').map((line, li) => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return <strong key={li} style={{ display: 'block', marginTop: '8px', marginBottom: '4px' }}>{line.replace(/\*\*/g, '')}</strong>;
                            }
                            if (line.startsWith('•')) {
                              return <span key={li} style={{ display: 'block', paddingLeft: '8px', marginBottom: '2px' }}>{line}</span>;
                            }
                            return line ? <span key={li} style={{ display: 'block', marginBottom: '4px' }}>{line}</span> : <br key={li} />;
                          })}
                        </div>
                        {msg.role === 'user' && <div className="chat-avatar user-avatar">👤</div>}
                      </div>
                    ))}
                    {loadingGuidance && (
                      <div className="chat-bubble ai">
                        <div className="chat-avatar">🐮</div>
                        <div className="chat-text chat-typing">
                          <Loader2 size={16} className="spin" />
                          <span>Thinking...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form className="chat-input-form" onSubmit={handleSendChat}>
                    <input
                      type="text"
                      className="form-input chat-input"
                      placeholder="Ask about treatments, causes, prevention..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={loadingGuidance}
                    />
                    <button type="submit" className="btn-send" disabled={loadingGuidance || !chatInput.trim()}>
                      <Send size={18} />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
