import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  Tooltip, CartesianGrid,
} from 'recharts';

const PROTOCOLS = ['TCP', 'UDP', 'ICMP'];

const generateMockData = (n = 200) =>
  Array.from({ length: n }, (_, i) => {
    const isAnomaly = Math.random() < 0.24;
    return {
      id: i + 1,
      protocol: PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)],
      duration: (Math.random() * (isAnomaly ? 400 : 60)).toFixed(2) + 's',
      pkt_size: Math.floor(Math.random() * (isAnomaly ? 2000 : 800) + 10),
      bytes_sent: Math.floor(Math.random() * (isAnomaly ? 140000 : 8000) + 10),
      err_rate: (Math.random() * (isAnomaly ? 0.9 : 0.12)).toFixed(3),
      conn: Math.floor(Math.random() * (isAnomaly ? 600 : 20) + 1),
      recon_err: (Math.random() * (isAnomaly ? 0.8 : 0.18)).toFixed(3),
      label: isAnomaly ? 'anomaly' : 'normal',
    };
  });

const MOCK_DATA = generateMockData(200);

const FEATURE_CHART = [
  { name: 'Pkt Size',   normal: 420,  anomaly: 4200  },
  { name: 'Bytes Sent', normal: 980,  anomaly: 9800  },
  { name: 'Err Rate',   normal: 0.04, anomaly: 0.55  },
  { name: 'Conn Count', normal: 5,    anomaly: 320   },
];

const ttStyle = {
  background: '#111720', border: '1px solid #1e2a38',
  borderRadius: 6, fontFamily: 'JetBrains Mono', fontSize: 12,
};

const DatasetExplorer = () => {
  const [search, setSearch] = useState('');
  const [labelFilter, setLabelFilter] = useState('all');
  const [protocolFilter, setProtocolFilter] = useState('all');

  const filtered = useMemo(() => MOCK_DATA.filter(r => {
    const matchSearch =
      search === '' ||
      String(r.id).includes(search) ||
      r.protocol.toLowerCase().includes(search.toLowerCase());
    const matchLabel = labelFilter === 'all' || r.label === labelFilter;
    const matchProto = protocolFilter === 'all' || r.protocol === protocolFilter;
    return matchSearch && matchLabel && matchProto;
  }), [search, labelFilter, protocolFilter]);

  const normalCount  = MOCK_DATA.filter(r => r.label === 'normal').length;
  const anomalyCount = MOCK_DATA.filter(r => r.label === 'anomaly').length;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <svg className="page-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18M9 21V9"/>
          </svg>
          <h2>Dataset Explorer</h2>
        </div>
        <p>
          Explore {MOCK_DATA.length} simulated network traffic records —{' '}
          {normalCount} normal, {anomalyCount} anomalous.
        </p>
      </div>

      {/* Feature average chart */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Feature Averages: Normal vs. Anomaly</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={FEATURE_CHART} margin={{ top: 8, right: 16, left: 0, bottom: 4 }} barGap={4}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#7d8590', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            />
            <YAxis tick={{ fill: '#7d8590', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
            <Tooltip contentStyle={ttStyle} />
            <Bar dataKey="normal"  name="Normal"  fill="#00d4aa" radius={[3,3,0,0]} barSize={28} />
            <Bar dataKey="anomaly" name="Anomaly" fill="#f85149" radius={[3,3,0,0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
        <div className="feat-legend">
          <div className="feat-legend-item">
            <span className="feat-legend-dot" style={{ background: '#00d4aa' }} /> Normal
          </div>
          <div className="feat-legend-item">
            <span className="feat-legend-dot" style={{ background: '#f85149' }} /> Anomaly
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="explorer-controls">
        <div className="search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7d8590" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search records..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={labelFilter}
          onChange={e => setLabelFilter(e.target.value)}
        >
          <option value="all">All Labels</option>
          <option value="normal">Normal</option>
          <option value="anomaly">Anomaly</option>
        </select>
        <select
          className="filter-select"
          value={protocolFilter}
          onChange={e => setProtocolFilter(e.target.value)}
        >
          <option value="all">All Protocols</option>
          <option value="TCP">TCP</option>
          <option value="UDP">UDP</option>
          <option value="ICMP">ICMP</option>
        </select>
        <span className="record-count">{filtered.length} records</span>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Protocol</th>
              <th>Duration</th>
              <th>Pkt Size</th>
              <th>Bytes Sent</th>
              <th>Err Rate</th>
              <th>Conn</th>
              <th>Recon Err</th>
              <th>Label</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map(row => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.protocol}</td>
                <td>{row.duration}</td>
                <td>{row.pkt_size}</td>
                <td>{row.bytes_sent}</td>
                <td>{row.err_rate}</td>
                <td>{row.conn}</td>
                <td>{row.recon_err}</td>
                <td>
                  <span className={`badge ${row.label}`}>{row.label}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DatasetExplorer;