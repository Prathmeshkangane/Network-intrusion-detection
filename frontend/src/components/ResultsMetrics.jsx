import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer,
  Tooltip, CartesianGrid, BarChart, Bar, Cell,
} from 'recharts';

const COMPARISONS = [
  { name: 'Autoencoder (Ours)', accuracy: 95.6, precision: 92.3, recall: 89.1, f1: 90.7, highlight: true },
  { name: 'Random Forest',      accuracy: 92.1, precision: 88.5, recall: 84.3, f1: 86.3 },
  { name: 'Rule-Based IDS',     accuracy: 78.4, precision: 72.1, recall: 68.9, f1: 70.5 },
  { name: 'SVM',                accuracy: 89.7, precision: 86.2, recall: 82.1, f1: 84.1 },
  { name: 'Isolation Forest',   accuracy: 91.3, precision: 87.8, recall: 85.6, f1: 86.7 },
];

const ROC_DATA = [
  { fpr: 0,    tpr: 0    },
  { fpr: 0.01, tpr: 0.55 },
  { fpr: 0.02, tpr: 0.75 },
  { fpr: 0.05, tpr: 0.87 },
  { fpr: 0.1,  tpr: 0.92 },
  { fpr: 0.2,  tpr: 0.96 },
  { fpr: 0.5,  tpr: 0.985},
  { fpr: 1,    tpr: 1    },
];

// Diagonal baseline
const DIAGONAL = [{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }];

const STAT_CARDS = [
  { label: 'Accuracy', value: '95.6%', color: 'var(--accent)'  },
  { label: 'Precision',value: '92.3%', color: 'var(--accent)'  },
  { label: 'Recall',   value: '89.1%', color: 'var(--accent)'  },
  { label: 'F1-Score', value: '90.7%', color: 'var(--accent)'  },
  { label: 'AUC',      value: '97.1%', color: 'var(--accent)'  },
  { label: 'FPR',      value: '3.2%',  color: 'var(--orange)'  },
];

const ttStyle = {
  background: '#111720', border: '1px solid #1e2a38',
  borderRadius: 6, fontFamily: 'JetBrains Mono', fontSize: 12,
};

const ResultsMetrics = ({ metrics: propMetrics }) => {
  const [metrics, setMetrics] = useState(propMetrics || {});

  useEffect(() => {
    if (!propMetrics) {
      api.getMetrics().then(setMetrics).catch(() => {});
    }
  }, [propMetrics]);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <svg className="page-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <h2>Results & Metrics</h2>
        </div>
        <p>Pre-computed model performance evaluation and method comparison.</p>
      </div>

      {/* Stat strip — 6 tiles matching screenshot */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(6,1fr)',
        gap: 12, marginBottom: 20,
      }}>
        {STAT_CARDS.map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 14px', textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700,
              color: s.color, letterSpacing: '-0.02em', marginBottom: 4,
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ROC + Method Comparison */}
      <div className="results-grid" style={{ marginBottom: 16 }}>
        {/* ROC Curve */}
        <div className="card">
          <div className="card-title">ROC Curve (AUC = 0.971)</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart margin={{ top: 8, right: 12, left: -20, bottom: 16 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis
                type="number" dataKey="fpr" domain={[0,1]}
                tick={{ fontSize: 10, fill: '#7d8590', fontFamily: 'JetBrains Mono' }}
                label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -10, fill: '#7d8590', fontSize: 10 }}
              />
              <YAxis
                type="number" dataKey="tpr" domain={[0,1]}
                tick={{ fontSize: 10, fill: '#7d8590', fontFamily: 'JetBrains Mono' }}
                label={{ value: 'TPR', angle: -90, position: 'insideLeft', fill: '#7d8590', fontSize: 10 }}
              />
              <Tooltip contentStyle={ttStyle} formatter={v => v.toFixed(3)} />
              {/* Diagonal baseline */}
              <Line
                data={DIAGONAL} type="linear" dataKey="tpr"
                stroke="#484f58" strokeWidth={1} dot={false}
                strokeDasharray="4 3" name="Random"
              />
              {/* ROC curve */}
              <Line
                data={ROC_DATA} type="monotone" dataKey="tpr"
                stroke="#00d4aa" strokeWidth={2.5} dot={false} name="ROC"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Method Comparison table */}
        <div className="card">
          <div className="card-title">Method Comparison</div>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISONS.map((m, i) => (
                <tr key={i} className={m.highlight ? 'highlight' : ''}>
                  <td>
                    {m.name}
                    {m.highlight && <span className="highlight-badge">Best</span>}
                  </td>
                  <td>{m.accuracy.toFixed(1)}%</td>
                  <td>{m.precision.toFixed(1)}%</td>
                  <td>{m.recall.toFixed(1)}%</td>
                  <td>{m.f1.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsMetrics;