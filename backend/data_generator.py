import numpy as np
import pandas as pd

def generate_dataset(n_samples=10000):
    np.random.seed(42)
    
    # EXACTLY 32 features - matches all numpy arrays below
    features = [
        'duration', 'protocol_tcp', 'protocol_udp', 'protocol_icmp',       # 4
        'service_http', 'service_telnet', 'service_smtp', 'service_ssh',    # 8
        'flag_SF', 'flag_S0', 'flag_REJ', 'flag_RST',                       # 12
        'count', 'srv_count', 'serror_rate', 'srv_serror_rate',             # 16
        'rerror_rate', 'srv_rerror_rate', 'same_srv_rate', 'diff_srv_rate', # 20
        'dst_host_count', 'dst_host_srv_count', 'dst_host_same_srv_rate',   # 23
        'dst_host_diff_srv_rate', 'dst_host_same_src_port_rate',            # 25
        'dst_host_srv_diff_host_rate', 'dst_host_serror_rate',              # 27
        'dst_host_srv_serror_rate', 'dst_host_rerror_rate',                 # 29
        'dst_host_srv_rerror_rate', 'src_bytes', 'dst_bytes'                # 32
    ]
    
    assert len(features) == 32, f"Expected 32 features, got {len(features)}"

    # EXACTLY 32 values for normal traffic
    normal_mu = np.array([
        0.1, 0.70, 0.20, 0.10, 0.60, 0.10, 0.05, 0.05,
        0.80, 0.10, 0.03, 0.02, 100.0, 50.0, 0.01, 0.01,
        0.01, 0.01, 0.90, 0.05, 100.0, 50.0, 0.90, 0.05,
        0.90, 0.01, 0.01, 0.01, 0.01, 0.01, 200.0, 150.0
    ])
    
    assert len(normal_mu) == 32, f"normal_mu has {len(normal_mu)} values, expected 32"

    # Generate normal traffic (90%)
    normal_sigma = np.abs(normal_mu) * 0.2 + 0.01
    normal_data = np.random.normal(normal_mu, normal_sigma, (9000, 32))
    normal_data = np.clip(normal_data, 0, None)
    
    # DoS attack (250 samples)
    dos_mu = np.array([
        10.0, 0.90, 0.05, 0.05, 0.10, 0.05, 0.01, 0.01,
        0.95, 0.02, 0.01, 0.01, 200.0, 10.0, 0.90, 0.80,
        0.05, 0.05, 0.10, 0.80, 200.0, 10.0, 0.10, 0.80,
        0.10, 0.90, 0.80, 0.90, 0.80, 0.90, 50000.0, 100.0
    ])
    dos_data = np.random.normal(dos_mu, np.abs(dos_mu) * 0.3 + 0.1, (250, 32))
    dos_data = np.clip(dos_data, 0, None)
    
    # Probe attack (250 samples)
    probe_mu = np.array([
        0.50, 0.30, 0.40, 0.30, 0.20, 0.30, 0.02, 0.08,
        0.10, 0.70, 0.80, 0.20, 300.0, 200.0, 0.30, 0.20,
        0.60, 0.40, 0.60, 0.30, 300.0, 200.0, 0.30, 0.60,
        0.30, 0.60, 0.30, 0.20, 0.30, 0.20, 1000.0, 500.0
    ])
    probe_data = np.random.normal(probe_mu, np.abs(probe_mu) * 0.25 + 0.05, (250, 32))
    probe_data = np.clip(probe_data, 0, None)
    
    # R2L attack (250 samples)
    r2l_mu = np.array([
        1.00, 0.40, 0.30, 0.30, 0.10, 0.20, 0.80, 0.10,
        0.20, 0.60, 0.10, 0.05, 50.0, 150.0, 0.10, 0.20,
        0.30, 0.40, 0.40, 0.50, 50.0, 150.0, 0.40, 0.50,
        0.40, 0.30, 0.40, 0.30, 0.40, 0.30, 800.0, 2000.0
    ])
    r2l_data = np.random.normal(r2l_mu, np.abs(r2l_mu) * 0.2 + 0.02, (250, 32))
    r2l_data = np.clip(r2l_data, 0, None)
    
    # Combine anomalous data
    anomalous_data = np.vstack([dos_data, probe_data, r2l_data])
    
    # Final dataset
    X = np.vstack([normal_data, anomalous_data])
    y = np.hstack([np.zeros(9000), np.ones(len(anomalous_data))])
    
    df = pd.DataFrame(X, columns=features)
    df['label'] = y.astype(int)
    df['is_anomaly'] = ['Normal' if l == 0 else 'Anomaly' for l in y]
    
    print(f"✅ Dataset generated: {len(df):,} samples, {len(features)} features")
    print(f"   Normal: {len(df[df.label==0]):,}, Anomalies: {len(df[df.label==1]):,}")
    
    return df