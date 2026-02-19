import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  Tooltip, Cell, CartesianGrid,
} from 'recharts';

const ARCH_DATA = [
  { layer: 'Input',      size: 18, phase: 'encoder' },
  { layer: '',           size: 8,  phase: 'encoder' },
  { layer: '',           size: 5,  phase: 'encoder' },
  { layer: '',           size: 3,  phase: 'encoder' },
  { layer: 'Bottleneck', size: 2,  phase: 'latent'  },
  { layer: '',           size: 3,  phase: 'decoder' },
  { layer: '',           size: 5,  phase: 'decoder' },
  { layer: '',           size: 8,  phase: 'decoder' },
  { layer: 'Output',     size: 16, phase: 'decoder' },
];

const PHASE_COLORS = { encoder: '#00d4aa', latent: '#58a6ff', decoder: '#e3b341' };

const STEPS = [
  {
    title: '1. Data Collection',
    desc: 'Network traffic is captured as feature vectors: packet size, duration, protocol type, flag counts, byte volumes, error rates, and connection frequency.',
  },
  {
    title: '2. Feature Normalization',
    desc: 'Raw features are normalized to [0, 1] range so no single feature dominates during training. Min-max scaling is applied per feature.',
  },
  {
    title: '3. Autoencoder Training',
    desc: 'The model is trained on NORMAL traffic only. It learns to compress and reconstruct typical network patterns. The bottleneck forces it to learn the essential structure of normal behavior.',
  },
  {
    title: '4. Reconstruction & Error',
    desc: 'For each data point, the autoencoder produces a reconstruction. The Mean Squared Error (MSE) between input and output is the reconstruction error — the anomaly signal.',
  },
  {
    title: '5. Threshold Decision',
    desc: 'A threshold is set on reconstruction error. Points above the threshold are flagged as anomalies. The threshold controls the trade-off between precision and recall.',
  },
];

const ttStyle = {
  background: '#111720', border: '1px solid #1e2a38',
  borderRadius: 6, fontFamily: 'JetBrains Mono', fontSize: 12,
};

const AutoencoderExplainer = () => {
  const [activeStep, setActiveStep] = useState(null);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <svg className="page-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
          <h2>How It Works</h2>
        </div>
        <p>Understanding the autoencoder-based anomaly detection pipeline.</p>
      </div>

      {/* Architecture */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Neural Network Architecture</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={ARCH_DATA} barSize={38} margin={{ top: 16, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="layer"
              tick={{ fill: '#7d8590', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            />
            <YAxis hide />
            <Tooltip
              formatter={(v) => [`${v} neurons`]}
              contentStyle={ttStyle}
            />
            <Bar dataKey="size" radius={[3, 3, 0, 0]}>
              {ARCH_DATA.map((entry, i) => (
                <Cell key={i} fill={PHASE_COLORS[entry.phase]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="arch-legend">
          {[['Encoder', 'encoder'], ['Latent Space', 'latent'], ['Decoder', 'decoder']].map(([label, phase]) => (
            <div className="arch-legend-item" key={phase}>
              <div className="arch-legend-dot" style={{ background: PHASE_COLORS[phase] }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="steps-list" style={{ marginBottom: 16 }}>
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`step-item${activeStep === i ? ' active' : ''}`}
            onClick={() => setActiveStep(activeStep === i ? null : i)}
          >
            <div className="step-item-title">
              {s.title}
              <span className="step-arrow">{activeStep === i ? '▲' : '▼'}</span>
            </div>
            <div className="step-item-desc">
              {activeStep === i ? s.desc : s.desc.slice(0, 85) + '…'}
            </div>
          </div>
        ))}
      </div>

      {/* Anomaly logic */}
      <div className="card">
        <div className="card-title">Anomaly Detection Logic</div>
        <div className="detection-logic">
          <div className="logic-box normal">
            <div className="logic-box-title" style={{ color: 'var(--accent)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Normal Traffic
            </div>
            <div className="logic-box-desc">
              Low reconstruction error — the autoencoder successfully learned these patterns during training.
            </div>
          </div>
          <div className="logic-box anomaly">
            <div className="logic-box-title" style={{ color: 'var(--red)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              Anomalous Traffic
            </div>
            <div className="logic-box-desc">
              High reconstruction error — these patterns deviate from what the model learned, signaling potential intrusion.
            </div>
          </div>
        </div>
        <div className="code-line">
          <span className="kw">if</span> reconstruction_error{' '}
          <span className="op">&gt;</span> threshold{' '}
          <span className="op">=&gt;</span>{' '}
          <span className="val">ANOMALY</span>{' '}
          <span className="kw">else</span>{' '}
          <span className="op">=&gt;</span>{' '}
          <span className="str">NORMAL</span>
        </div>
      </div>
    </div>
  );
};

export default AutoencoderExplainer;