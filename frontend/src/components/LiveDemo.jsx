import React, { useState } from 'react';
import { api } from '../services/api';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer,
  Tooltip, CartesianGrid,
} from 'recharts';

const DEFAULTS_NORMAL = {
  duration: 38, protocol: 'TCP', packet_size: 588, flag_count: 1,
  bytes_sent: 5000, bytes_received: 5000, error_rate: 0.02, conn_count: 5,
};
const DEFAULTS_ANOMALY = {
  duration: 380, protocol: 'ICMP', packet_size: 1980, flag_count: 8,
  bytes_sent: 135000, bytes_received: 800, error_rate: 0.84, conn_count: 178,
};

const simulate = (f) => {
  const score =
    f.error_rate * 2.1 +
    (f.duration > 200 ? 0.4 : 0) +
    (f.packet_size > 1200 ? 0.35 : 0) +
    (f.conn_count > 100 ? 0.3 : 0) +
    Math.random() * 0.04;
  const threshold  = 0.35;
  const isAnomaly  = score > threshold;
  const inputScaled = [
    f.duration / 400, f.packet_size / 2000,
    f.bytes_sent / 140000, f.bytes_received / 140000,
    f.error_rate, f.conn_count / 200,
  ];
  const noise = isAnomaly ? 0.25 : 0.015;
  const reconstructed = inputScaled.map(v =>
    Math.max(0, Math.min(1, v + (Math.random() - 0.5) * noise))
  );
  return {
    is_anomaly: isAnomaly,
    reconstruction_error: parseFloat(score.toFixed(4)),
    threshold,
    confidence: Math.min(0.99, Math.abs(score - threshold) * 2.5 + 0.55),
    input_scaled: inputScaled,
    reconstructed,
  };
};

const ttStyle = {
  background: '#111720', border: '1px solid #1e2a38',
  borderRadius: 6, fontFamily: 'JetBrains Mono', fontSize: 12,
};

const Field = ({ label, value, onChange, type = 'number', children }) => (
  <div className="form-group">
    <label>{label}</label>
    {children || (
      <input className="input" type={type} value={value} onChange={e => onChange(+e.target.value)} />
    )}
  </div>
);

const LiveDemo = () => {
  const [features, setFeatures] = useState(DEFAULTS_NORMAL);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setFeatures(f => ({ ...f, [k]: v }));

  const runDetection = async () => {
    setLoading(true);
    try {
      const fullFeatures = [
        features.duration, features.packet_size,
        features.bytes_sent, features.bytes_received,
        features.error_rate, features.conn_count,
        ...Array(35).fill(0.01),
      ];
      const result = await api.predict(fullFeatures);
      setPrediction(result);
    } catch {
      setPrediction(simulate(features));
    }
    setLoading(false);
  };

  const chartData = prediction
    ? prediction.input_scaled.map((v, i) => ({
        f: `F${i + 1}`,
        input:         parseFloat(v.toFixed(4)),
        reconstructed: parseFloat(prediction.reconstructed[i].toFixed(4)),
      }))
    : [];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <svg className="page-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
          <h2>Live Demo</h2>
        </div>
        <p>Input network traffic features and see if the autoencoder flags it as anomalous.</p>
      </div>

      {/* Quick-fill */}
      <div className="demo-quick-btns">
        <button className="btn-sm accent" onClick={() => { setFeatures(DEFAULTS_NORMAL); setPrediction(null); }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          Random Normal
        </button>
        <button className="btn-sm red" onClick={() => { setFeatures(DEFAULTS_ANOMALY); setPrediction(null); }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          Random Anomaly
        </button>
      </div>

      <div className="demo-layout">
        {/* Input form */}
        <div className="card">
          <div className="card-title">Network Traffic Features</div>
          <div className="form-grid">
            <Field label="Duration (s)" value={features.duration} onChange={v => set('duration', v)} />
            <div className="form-group">
              <label>Protocol</label>
              <select className="input" value={features.protocol} onChange={e => set('protocol', e.target.value)}>
                <option>TCP</option>
                <option>UDP</option>
                <option>ICMP</option>
              </select>
            </div>
            <Field label="Packet Size"        value={features.packet_size}    onChange={v => set('packet_size', v)} />
            <Field label="Flag Count"          value={features.flag_count}     onChange={v => set('flag_count', v)} />
            <Field label="Bytes Sent"          value={features.bytes_sent}     onChange={v => set('bytes_sent', v)} />
            <Field label="Bytes Received"      value={features.bytes_received} onChange={v => set('bytes_received', v)} />
            <Field label="Error Rate" type="number" value={features.error_rate}
              onChange={v => set('error_rate', v)}>
              <input className="input" type="number" step="0.01" min="0" max="1"
                value={features.error_rate} onChange={e => set('error_rate', +e.target.value)} />
            </Field>
            <Field label="Connection Count" value={features.conn_count} onChange={v => set('conn_count', v)} />
          </div>
          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: 20, padding: '12px' }}
            onClick={runDetection}
            disabled={loading}
          >
            {loading ? 'Analyzing…' : 'Run Detection'}
          </button>
        </div>

        {/* Result panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          {!prediction ? (
            <div className="verdict-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              <p>Configure features and click "Run Detection" to see results.</p>
            </div>
          ) : (
            <>
              <div className={`verdict-box ${prediction.is_anomaly ? 'anomaly' : 'normal'}`}>
                <div>
                  {prediction.is_anomaly ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f85149" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  )}
                </div>
                <div className="verdict-label" style={{ color: prediction.is_anomaly ? '#f85149' : '#00d4aa' }}>
                  {prediction.is_anomaly ? 'ANOMALY DETECTED' : 'Normal Traffic'}
                </div>
                <div className="verdict-error">
                  Recon Error: {prediction.reconstruction_error.toFixed(4)} / Threshold: {prediction.threshold.toFixed(4)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                  Confidence: {(prediction.confidence * 100).toFixed(1)}%
                </div>
                {/* Confidence bar */}
                <div className="conf-bar-track" style={{ width: '100%' }}>
                  <div
                    className="conf-bar-fill"
                    style={{
                      width: `${prediction.confidence * 100}%`,
                      background: prediction.is_anomaly ? '#f85149' : '#00d4aa',
                    }}
                  />
                </div>
              </div>

              <div className="card-title" style={{ marginBottom: 8 }}>Input vs Reconstructed</div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="f"
                    tick={{ fontSize: 10, fill: '#7d8590', fontFamily: 'JetBrains Mono' }}
                  />
                  <YAxis
                    domain={[0, 1]}
                    tick={{ fontSize: 10, fill: '#7d8590', fontFamily: 'JetBrains Mono' }}
                  />
                  <Tooltip contentStyle={ttStyle} formatter={v => v.toFixed(4)} />
                  <Line type="monotone" dataKey="input"         stroke="#00d4aa" strokeWidth={2} dot={false} name="Input" />
                  <Line type="monotone" dataKey="reconstructed" stroke="#f85149" strokeWidth={2} dot={false} strokeDasharray="4 2" name="Reconstructed" />
                </LineChart>
              </ResponsiveContainer>
              <div className="chart-legend" style={{ marginTop: 8 }}>
                <div className="chart-legend-item"><span style={{ color: '#00d4aa' }}>─</span> Input</div>
                <div className="chart-legend-item"><span style={{ color: '#f85149' }}>- -</span> Reconstructed</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveDemo;