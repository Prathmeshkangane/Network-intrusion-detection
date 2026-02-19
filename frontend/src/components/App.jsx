import React, { useState } from 'react';
import '../styles/globals.css';
import '../styles/components.css';
import LandingPage from './LandingPage';
import AutoencoderExplainer from './AutoencoderExplainer';
import DatasetExplorer from './DatasetExplorer';
import AnomalyDashboard from './AnomalyDashboard';
import LiveDemo from './LiveDemo';
import ResultsMetrics from './ResultsMetrics';
import { api } from '../services/api';

const NAV = [
  {
    id: 'landing', label: 'Overview',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 2.5"/></svg>,
  },
  {
    id: 'explainer', label: 'How It Works',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>,
  },
  {
    id: 'dataset', label: 'Dataset Explorer',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  },
  {
    id: 'dashboard', label: 'Detection Dashboard',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-8"/></svg>,
  },
  {
    id: 'demo', label: 'Live Demo',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="5,3 19,12 5,21"/></svg>,
  },
  {
    id: 'results', label: 'Results & Metrics',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  },
];

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [metrics, setMetrics] = useState(null);

  const navigate = (page) => {
    setCurrentPage(page);
    if (page === 'results' && !metrics) {
      api.getMetrics().then(setMetrics).catch(() => {});
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'explainer':  return <AutoencoderExplainer />;
      case 'dataset':    return <DatasetExplorer />;
      case 'dashboard':  return <AnomalyDashboard />;
      case 'demo':       return <LiveDemo />;
      case 'results':    return <ResultsMetrics metrics={metrics} />;
      default:           return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="app">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <nav className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="sidebar-logo-text">
            <h2>NetGuard AI</h2>
            <p>Intrusion Detection</p>
          </div>
        </div>

        <div className="sidebar-nav-label">Navigation</div>

        <ul className="nav-menu">
          {NAV.map(({ id, label, icon }) => (
            <li key={id} className={currentPage === id ? 'active' : ''} onClick={() => navigate(id)}>
              {icon}{label}
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Topbar ──────────────────────────────────────────── */}
      <div className="topbar">
        <svg className="topbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
        </svg>
        <span className="topbar-title">Network Anomaly Detection System</span>
      </div>

      {/* ── Page ────────────────────────────────────────────── */}
      <main className="main-content">{renderPage()}</main>
    </div>
  );
};

export default App;