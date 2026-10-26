import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, Sparkles, AlertCircle, CheckCircle, Stethoscope,
  HelpCircle, Loader2, RefreshCw, Send, FileText, Download, History
} from 'lucide-react';
import { api, getToken } from '../services/api';

export default function CNNPredictionPage({ onOpenAuth, showToast, userEmail }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [loadingGuidance, setLoadingGuidance] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [reportResult, setReportResult] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG/JPG).', 'error');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPredictionResult(null);
    setReportResult(null);
    setChatMessages([]);
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
      showToast('Please upload a cattle photo first.', 'error');
      return;
    }

    setLoadingPrediction(true);
    setPredictionResult(null);
    setReportResult(null);
    setChatMessages([]);

    try {
      const result = await api.predictCow(selectedFile);
      setPredictionResult(result);
      showToast(`Detection complete: ${result.disease}`);

      // Auto-fetch initial guidance as first chat message
      setLoadingGuidance(true);
      try {
        const guidance = await api.getHealthGuidance(result.prediction_id);
        const aiMsg = formatGuidanceMessage(guidance);
        setChatMessages([{ role: 'ai', content: aiMsg, raw: guidance }]);
      } catch (err) {
        setChatMessages([{ role: 'ai', content: 'Could not load initial guidance. Ask me anything about this disease!', raw: null }]);
      } finally {
        setLoadingGuidance(false);
      }
    } catch (err) {
      showToast(err.message || 'Error executing disease prediction', 'error');
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
      showToast('Health report generated successfully!');
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
      a.download = `cattle_health_report_${reportResult.report_id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Report downloaded!');
    } catch (err) {
      showToast(err.message || 'Failed to download PDF', 'error');
    }
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPredictionResult(null);
    setReportResult(null);
    setChatMessages([]);
    setChatInput('');
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-header-inner">
          <div className="section-kicker">AI IMAGE DIAGNOSIS</div>
          <h1 className="page-title">CNN Disease Detection</h1>
          <p className="page-subtitle">
            Upload a clear photo of your cattle to detect potential diseases using our deep learning model.
          </p>
        </div>
      </div>

      <div className="page-content">
        <div className="cnn-layout">
          {/* LEFT: Upload + Result */}
          <div className="cnn-left">
            <div className="page-card">
              <h2 className="card-title">
                <Upload size={20} />
                Upload Cattle Photo
              </h2>

              {!previewUrl ? (
                <div
                  className={`upload-box ${dragOver ? 'dragover' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('cnn-file-input').click()}
                >
                  <input
                    id="cnn-file-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  />
                  <div className="upload-icon">
                    <Upload size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', color: 'var(--primary-dark)' }}>
                    Click or drag photo to upload
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Supports JPG, PNG — cattle skin, eyes, body or posture
                  </p>
                </div>
              ) : (
                <div>
                  <div className="preview-image-container" style={{ maxWidth: '100%' }}>
                    <img src={previewUrl} alt="Selected cattle" style={{ height: '220px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                    <button className="btn-analyze" onClick={handleAnalyze} disabled={loadingPrediction}>
                      {loadingPrediction ? (
                        <><Loader2 size={18} className="spin" /><span>Analyzing...</span></>
                      ) : (
                        <><Sparkles size={18} /><span>Analyze Image</span></>
                      )}
                    </button>
                    <button className="btn-secondary" onClick={resetAll}>
                      <RefreshCw size={16} />
                      <span>Change Photo</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Result */}
              {predictionResult && (
                <div className="result-box" style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div className="section-kicker" style={{ marginBottom: '4px' }}>DETECTION RESULT</div>
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

                  {/* Report actions */}
                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {!reportResult ? (
                      <button
                        className="btn-report"
                        onClick={handleGenerateReport}
                        disabled={loadingReport}
                      >
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

                  {/* Report Preview */}
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
                  <p>Upload and analyze a cattle image to start chatting with the AI health assistant.</p>
                </div>
              ) : (
                <>
                  <div className="chat-messages">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`chat-bubble ${msg.role}`}>
                        {msg.role === 'ai' && (
                          <div className="chat-avatar">🐮</div>
                        )}
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
                        {msg.role === 'user' && (
                          <div className="chat-avatar user-avatar">👤</div>
                        )}
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
                      placeholder="Ask about this disease, treatments, precautions..."
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
