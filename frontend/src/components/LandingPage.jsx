import React from 'react';

const METRIC_CARDS = [
  {
    label: 'Detection Accuracy', value: '95.6%', color: 'var(--accent)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
  {
    label: 'Precision', value: '92.3%', color: 'var(--accent)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    label: 'Recall', value: '89.1%', color: 'var(--accent)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    label: 'False Positive Rate', value: '3.2%', color: 'var(--orange)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
];

const LandingPage = ({ onNavigate }) => (
  <div>
    {/* Hero */}
    <div className="hero-section">
      <div className="hero-badge">
        <div className="hero-badge-dot" />
        Autoencoder-Based Anomaly Detection
      </div>

      <h1 className="hero-title">
        Network Intrusion
        <span className="accent">Detection System</span>
      </h1>

      <p className="hero-desc">
        Leveraging deep learning autoencoders to identify anomalous network traffic
        patterns in real-time. This project demonstrates how reconstruction error can
        serve as a powerful signal for detecting cyber threats.
      </p>

      <div className="hero-buttons">
        <button className="btn-primary" onClick={() => onNavigate('demo')}>
          Try Live Demo
        </button>
        <button className="btn-outline" onClick={() => onNavigate('explainer')}>
          Learn How It Works
        </button>
      </div>
    </div>

    {/* Metric cards */}
    <div className="metric-row">
      {METRIC_CARDS.map((m, i) => (
        <div className="metric-card" key={i}>
          <div className="metric-card-icon" style={{ color: m.color }}>{m.icon}</div>
          <div className="metric-card-value" style={{ color: m.color }}>{m.value}</div>
          <div className="metric-card-label">{m.label}</div>
        </div>
      ))}
    </div>
  </div>
);

export default LandingPage;