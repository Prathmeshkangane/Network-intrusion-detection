const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com/api' 
  : 'http://localhost:5000/api';

const api = {
  getDataset: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/dataset?${query}`);
    if (!response.ok) throw new Error('Failed to fetch dataset');
    return response.json();
  },

  getDatasetStats: async () => {
    const response = await fetch(`${API_BASE}/dataset-stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  getMetrics: async () => {
    const response = await fetch(`${API_BASE}/metrics`);
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return response.json();
  },

  predict: async (features) => {
    const response = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features })
    });
    if (!response.ok) throw new Error('Prediction failed');
    return response.json();
  },

  thresholdAnalysis: async (threshold) => {
    const response = await fetch(`${API_BASE}/threshold-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threshold })
    });
    if (!response.ok) throw new Error('Analysis failed');
    return response.json();
  },

  getComparisons: async () => {
    const response = await fetch(`${API_BASE}/comparisons`);
    if (!response.ok) throw new Error('Comparisons failed');
    return response.json();
  }
};

export { api };
