import React, { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
  PieChart, Pie, Cell,
  AreaChart, Area,
} from 'recharts';

const genScatter = () =>
  Array.from({ length: 200 }, (_, i) => {
    const isAnomaly = Math.random() < 0.24;
    return {
      idx: i,
      error: isAnomaly
        ? Math.random() * 0.55 + 0.28
        : Math.random() * 0.22 + 0.01,
      isAnomaly,
    };
  });

const genTimeSeries = () => {
  const start = new Date('2025-01-16');
  return Array.from({ length: 60 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      error: Math.random() < 0.18
        ? Math.random() * 0.45 + 0.3
        : Math.random() * 0.18 + 0.01,
    };
  });
};

const SCATTER_DATA = genScatter();
const TIME_DATA    = genTimeSeries();

const PIE_DATA = [
  { name: 'Normal 76%',  value: 152, fill: '#00d4aa' },
  { name: 'Anomaly 24%', value: 48,  fill: '#f85149' },
];

const ttStyle = {
  background: '#111720', border: '1px solid #1e2a38',
  borderRadius: 6, fontFamily: 'JetBrains Mono', fontSize: 12,
};

const AnomalyDashboard = () => {
  const [threshold, setThreshold] = useState(0.25);

  const { tp, fp, fn, tn, precision, recall, f1 } = useMemo(() => {
    const tp = SCATTER_DATA.filter(d =>  d.isAnomaly && d.error >  threshold).length;
    const fp = SCATTER_DATA.filter(d => !d.isAnomaly && d.error >  threshold).length;
    const fn = SCATTER_DATA.filter(d =>  d.isAnomaly && d.error <= threshold).length;
    const tn = SCATTER_DATA.filter(d => !d.isAnomaly && d.error <= threshold).length;
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall    = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0
      ? 2 * precision * recall / (precision + recall) : 0;
    return { tp, fp, fn, tn, precision, recall, f1 };
  }, [threshold]);

  const scatterNormal  = SCATTER_DATA.filter(d => !d.isAnomaly);
  const scatterAnomaly = SCATTER_DATA.filter(d =>  d.isAnomaly);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <svg className="page-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18"/>
            <path d="M7 16l4-4 4 4 4-8"/>
          </svg>
          <h2>Anomaly Detection Dashboard</h2>
        </div>
        <p>Interactive visualization of detection results with adjustable threshold.</p>
      </div>

      {/* Threshold slider */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Detection Threshold</span>
          <span className="threshold-display">{threshold.toFixed(2)}</span>
        </div>
        <div className="threshold-bar-wrapper">
          <input
            type="range"
            className="threshold-slider"
            min="0.05" max="0.9" step="0.01"
            value={threshold}
            onChange={e => setThreshold(parseFloat(e.target.value))}
          />
        </div>
        <div className="threshold-metrics">
          <span>Precision: <b>{(precision * 100).toFixed(1)}%</b></span>
          <span>Recall: <b>{(recall * 100).toFixed(1)}%</b></span>
          <span>F1: <b>{(f1 * 100).toFixed(1)}%</b></span>
        </div>
      </div>

      {/* Charts grid */}
      <div className="dashboard-grid">
        {/* Scatter */}
        <div className="card">
          <div className="card-title">Reconstruction Error per Sample</div>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 8, right: 8, left: -20, bottom: 4 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis
                type="number" dataKey="idx" name="Sample"
                tick={{ fontSize: 10, fill: '#7d8590', fontFamily: 'JetBrains Mono' }}
              />
              <YAxis
                type="number" dataKey="error" name="Error" domain={[0, 1]}
                tick={{ fontSize: 10, fill: '#7d8590', fontFamily: 'JetBrains Mono' }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={ttStyle}
                formatter={v => v.toFixed(4)}
              />
              <ReferenceLine
                y={threshold} stroke="#e3b341" strokeDasharray="4 3"
                label={{ value: 'Threshold', fill: '#e3b341', fontSize: 10, fontFamily: 'JetBrains Mono', position: 'insideTopRight' }}
              />
              <Scatter data={scatterNormal}  fill="#00d4aa" opacity={0.7} name="Normal" />
              <Scatter data={scatterAnomaly} fill="#f85149" opacity={0.8} name="Anomaly" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="card">
          <div className="card-title">Traffic Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={PIE_DATA} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={85} innerRadius={40}
                label={({ name }) => name}
                labelLine={{ stroke: '#484f58' }}
              >
                {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={ttStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Area */}
        <div className="card">
          <div className="card-title">Reconstruction Error Over Time</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={TIME_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 4 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: '#7d8590', fontFamily: 'JetBrains Mono' }}
                interval={9}
              />
              <YAxis
                domain={[0, 0.9]}
                tick={{ fontSize: 10, fill: '#7d8590', fontFamily: 'JetBrains Mono' }}
              />
              <Tooltip contentStyle={ttStyle} formatter={v => v.toFixed(4)} />
              <ReferenceLine y={threshold} stroke="#e3b341" strokeDasharray="4 3" />
              <Area
                type="monotone" dataKey="error"
                stroke="#00d4aa" fill="rgba(0,212,170,0.12)" strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Confusion matrix */}
        <div className="card">
          <div className="card-title">
            Confusion Matrix (Threshold: {threshold.toFixed(2)})
          </div>
          <div className="confusion-grid">
            <div className="confusion-cell" style={{ background: 'rgba(0,212,170,0.12)', border: '1px solid rgba(0,212,170,0.25)' }}>
              <div className="c-val" style={{ color: '#00d4aa' }}>{tp}</div>
              <div className="c-label">True Positive</div>
            </div>
            <div className="confusion-cell" style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)' }}>
              <div className="c-val" style={{ color: '#f85149' }}>{fp}</div>
              <div className="c-label">False Positive</div>
            </div>
            <div className="confusion-cell" style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)' }}>
              <div className="c-val" style={{ color: '#f85149' }}>{fn}</div>
              <div className="c-label">False Negative</div>
            </div>
            <div className="confusion-cell" style={{ background: 'rgba(88,166,255,0.1)', border: '1px solid rgba(88,166,255,0.2)' }}>
              <div className="c-val" style={{ color: '#58a6ff' }}>{tn}</div>
              <div className="c-label">True Negative</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyDashboard;