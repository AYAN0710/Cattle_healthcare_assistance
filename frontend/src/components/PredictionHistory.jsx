import React, { useState, useEffect } from 'react';
import {
  X, Calendar, Activity, ChevronRight, ChevronLeft, Loader2, History,
  Stethoscope, FileText, Download, CheckCircle, AlertCircle, BarChart2, Camera
} from 'lucide-react';
import { api } from '../services/api';

export default function PredictionHistory({ isOpen, onClose, userEmail, showToast }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingGuidance, setLoadingGuidance] = useState(false);
  const [guidance, setGuidance] = useState(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    setHistory([]);
    setSelectedItem(null);
    setGuidance(null);
    setReport(null);
    if (isOpen && userEmail) {
      fetchHistory();
    }
  }, [isOpen, userEmail]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory();
      setHistory(data.predictions || []);
    } catch (err) {
      showToast(err.message || 'Failed to load history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = async (item) => {
    setSelectedItem(item);
    setGuidance(null);
    setReport(null);

    // Auto-load guidance for the selected prediction
    setLoadingGuidance(true);
    try {
      const g = await api.getHealthGuidance(item.prediction_id);
      setGuidance(g);
    } catch (err) {
      // guidance not required, just skip
    } finally {
      setLoadingGuidance(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedItem) return;
    setLoadingReport(true);
    try {
      const r = await api.generateReport(selectedItem.prediction_id);
      setReport(r);
      showToast('Report generated!');
    } catch (err) {
      showToast(err.message || 'Failed to generate report', 'error');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!report?.report_id) return;
    try {
      const blob = await api.downloadReportPdf(report.report_id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cattle_report_${report.report_id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Report downloaded!');
    } catch (err) {
      showToast(err.message || 'Failed to download', 'error');
    }
  };

  const handleBack = () => {
    setSelectedItem(null);
    setGuidance(null);
    setReport(null);
  };

  if (!isOpen) return null;

  const isHealthy = (disease) => disease?.toLowerCase().includes('healthy');

  return (
    <div className="history-drawer-overlay" onClick={onClose}>
      <div className="history-drawer" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {selectedItem && (
              <button
                onClick={handleBack}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, fontSize: '0.85rem', padding: '4px 0' }}
              >
                <ChevronLeft size={18} /> Back
              </button>
            )}
            {!selectedItem && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="logo-badge" style={{ width: '36px', height: '36px', fontSize: '1rem' }}>
                  <History size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-dark)', lineHeight: 1.2 }}>
                    Prediction History
                  </h2>
                  {userEmail && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
                      {userEmail}
                    </p>
                  )}
                </div>
              </div>
            )}
            {selectedItem && (
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                {selectedItem.disease}
              </h2>
            )}
          </div>
          <button className="close-modal-btn" style={{ background: '#e2e8f0', color: '#334155' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* List View */}
        {!selectedItem && (
          <>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary)' }}>
                <Loader2 size={32} className="spin" style={{ margin: '0 auto 10px', display: 'block' }} />
                <p>Loading your diagnosis history...</p>
              </div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <History size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                <p style={{ fontWeight: 600 }}>No past predictions found.</p>
                <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Upload a cattle photo or enter symptoms to run your first diagnosis!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {history.map((item) => (
                  <div
                    key={item.prediction_id}
                    className="history-item-card"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSelectItem(item)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.prediction_module === 'cnn' ? (
                          <Camera size={16} style={{ color: 'var(--primary)' }} />
                        ) : (
                          <BarChart2 size={16} style={{ color: 'var(--primary)' }} />
                        )}
                        <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-dark)' }}>
                          {item.disease}
                        </h4>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          className={`result-badge ${isHealthy(item.disease) ? 'healthy' : ''}`}
                          style={{ fontSize: '0.72rem', padding: '3px 9px' }}
                        >
                          {isHealthy(item.disease) ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                          {(item.confidence * 100).toFixed(1)}%
                        </span>
                        <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} />
                        <span>{new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Activity size={13} />
                        <span>{item.animal_type || 'Cattle'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', fontWeight: 700, fontSize: '0.72rem', color: 'var(--primary)' }}>
                        {item.prediction_module === 'cnn' ? 'CNN Image' : 'Symptom ML'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Detail View */}
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Disease header card */}
            <div style={{ background: 'var(--bg-cream)', borderRadius: 'var(--radius-md)', padding: '18px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div className="section-kicker" style={{ marginBottom: '4px' }}>
                    {selectedItem.prediction_module === 'cnn' ? 'CNN IMAGE ANALYSIS' : 'SYMPTOM ML PREDICTION'}
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>
                    {selectedItem.disease}
                  </h3>
                </div>
                <span className={`result-badge ${isHealthy(selectedItem.disease) ? 'healthy' : ''}`}>
                  {isHealthy(selectedItem.disease) ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  {(selectedItem.confidence * 100).toFixed(1)}% confidence
                </span>
              </div>
              <div style={{ marginTop: '10px', display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} />
                  {new Date(selectedItem.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Activity size={13} />
                  {selectedItem.animal_type || 'Cattle'}
                </span>
              </div>
            </div>

            {/* Input data if available */}
            {selectedItem.input_data && Object.keys(selectedItem.input_data).length > 0 && (
              <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-light)' }}>
                <div className="guidance-section-title" style={{ marginBottom: '10px' }}>
                  <BarChart2 size={15} /> Input Data
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.83rem' }}>
                  {Object.entries(selectedItem.input_data).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.replace(/_/g, ' ')}</span>
                      <span style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Guidance */}
            {loadingGuidance ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--primary)' }}>
                <Loader2 size={24} className="spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                <p style={{ fontSize: '0.88rem' }}>Loading AI health guidance...</p>
              </div>
            ) : guidance && (
              <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-light)' }}>
                {guidance.guidance && (
                  <div className="report-section" style={{ marginBottom: '14px' }}>
                    <div className="guidance-section-title"><Stethoscope size={15} /> Health Guidance</div>
                    <p style={{ marginTop: '8px', fontSize: '0.86rem', color: 'var(--text-dark)', lineHeight: 1.6 }}>{guidance.guidance}</p>
                  </div>
                )}
                {guidance.precautions && guidance.precautions.length > 0 && (
                  <div className="report-section" style={{ marginBottom: '14px' }}>
                    <div className="guidance-section-title"><CheckCircle size={15} /> Precautions</div>
                    <ul style={{ paddingLeft: '18px', marginTop: '8px', fontSize: '0.86rem', lineHeight: 1.7 }}>
                      {guidance.precautions.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}
                {guidance.veterinarian_advice && (
                  <div className="vet-advice">
                    <div className="guidance-section-title" style={{ color: '#166534' }}><Stethoscope size={15} /> Veterinarian Advice</div>
                    <p style={{ marginTop: '8px', fontSize: '0.86rem', lineHeight: 1.6 }}>{guidance.veterinarian_advice}</p>
                  </div>
                )}
              </div>
            )}

            {/* Report actions */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {!report ? (
                <button className="btn-report" onClick={handleGenerateReport} disabled={loadingReport}>
                  {loadingReport ? (
                    <><Loader2 size={15} className="spin" /><span>Generating...</span></>
                  ) : (
                    <><FileText size={15} /><span>Generate Full Report</span></>
                  )}
                </button>
              ) : (
                <button className="btn-download" onClick={handleDownloadPdf}>
                  <Download size={15} />
                  <span>Download PDF Report</span>
                </button>
              )}
            </div>

            {/* Report preview */}
            {report && (
              <div className="report-preview">
                <div className="report-section">
                  <div className="guidance-section-title"><Stethoscope size={15} /> Report — Health Guidance</div>
                  <p>{report.guidance}</p>
                </div>
                {report.precautions?.length > 0 && (
                  <div className="report-section">
                    <div className="guidance-section-title"><CheckCircle size={15} /> Precautions</div>
                    <ul>{report.precautions.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  </div>
                )}
                {report.veterinarian_advice && (
                  <div className="report-section vet-advice">
                    <div className="guidance-section-title" style={{ color: '#166534' }}><Stethoscope size={15} /> Veterinarian Advice</div>
                    <p>{report.veterinarian_advice}</p>
                  </div>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontSize: '0.8rem', color: '#92400E', lineHeight: 1.5 }}>
              ⚠️ <strong>Disclaimer:</strong> This AI prediction is for educational purposes only. Always consult a qualified veterinary doctor before making any health decisions for your cattle.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
