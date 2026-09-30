import React, { useState } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Lock, 
  Server, 
  Database, 
  Play, 
  RefreshCw, 
  Zap, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { runFederatedTrainingRound } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function FederatedLearningSimulator({ federatedStatus, onRefreshStatus }) {
  const [trainingInProgress, setTrainingInProgress] = useState(false);
  const [customEpsilon, setCustomEpsilon] = useState(1.25);
  const [lastRoundResult, setLastRoundResult] = useState(null);

  if (!federatedStatus) {
    return <div className="animate-fade" style={{ padding: '2rem', textAlign: 'center' }}>Connecting to National Federated Aggregator...</div>;
  }

  const { currentRound, targetRounds, privacyBudget, globalModelMetrics, clientNodes, roundsHistory } = federatedStatus;

  async function handleTrainRound() {
    try {
      setTrainingInProgress(true);
      const res = await runFederatedTrainingRound(customEpsilon);
      if (res.success) {
        setLastRoundResult(res);
        if (onRefreshStatus) onRefreshStatus();
      }
    } catch (err) {
      alert(`Error triggering federated round: ${err.message}`);
    } finally {
      setTrainingInProgress(false);
    }
  }

  // Convergence Chart Data
  const labels = roundsHistory.map(r => `Round #${r.round}`);
  const lossData = roundsHistory.map(r => r.loss);
  const accuracyData = roundsHistory.map(r => r.accuracy);

  const convergenceChartData = {
    labels,
    datasets: [
      {
        label: 'Global Validation Accuracy (%)',
        data: accuracyData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        yAxisID: 'y1',
        tension: 0.3,
        pointRadius: 5
      },
      {
        label: 'Global Model Loss (MSE)',
        data: lossData,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        yAxisID: 'y',
        tension: 0.3,
        pointRadius: 5
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#e5e7eb', font: { family: 'Plus Jakarta Sans', size: 12 } }
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#fff',
        bodyColor: '#d1d5db'
      }
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Loss (MSE)', color: '#f59e0b' },
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Accuracy (%)', color: '#10b981' },
        ticks: { color: '#9ca3af' },
        grid: { drawOnChartArea: false }
      }
    }
  };

  return (
    <div className="animate-fade">
      {/* Privacy Architecture Banner */}
      <div className="content-card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(6, 182, 212, 0.06))', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-icon-box" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
              <Cpu size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f9fafb' }}>
                Federated Edge Intelligence & Privacy-Preserving Aggregation
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={13} /> Zero Patient Data Egress • ABDM & HIPAA Compliant Architecture
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn-primary" 
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #2563eb)' }}
              disabled={trainingInProgress}
              onClick={handleTrainRound}
            >
              {trainingInProgress ? (
                <>
                  <RefreshCw className="pulse-dot" size={16} /> Synchronizing Node Gradients...
                </>
              ) : (
                <>
                  <Play size={16} /> Run Federated Round #{currentRound + 1}
                </>
              )}
            </button>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Rather than pooling sensitive EHR / prescription records into a central database, each State Health Edge Node trains a local time-series regression model on its hospital admissions. Only differential-privacy perturbed weight tensors (ΔW) are sent to the National Aggregation Server, which executes the <strong>FedAvg (Federated Averaging)</strong> algorithm to synthesize a collective high-accuracy national model.
        </p>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div>
            <div className="kpi-label">Current FedAvg Round</div>
            <div className="kpi-value" style={{ color: '#c084fc' }}>#{currentRound}</div>
            <div className="kpi-subtext">Convergence Target: {targetRounds} Rounds</div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill fill-violet" style={{ width: `${(currentRound / targetRounds) * 100}%` }}></div>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-violet"><Layers size={22} /></div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Global Validation Accuracy</div>
            <div className="kpi-value" style={{ color: '#34d399' }}>{globalModelMetrics.validationAccuracy}%</div>
            <div className="kpi-subtext">Across {clientNodes.length} State Health Nodes</div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill fill-emerald" style={{ width: `${globalModelMetrics.validationAccuracy}%` }}></div>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-emerald"><CheckCircle2 size={22} /></div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Global Loss (MSE)</div>
            <div className="kpi-value" style={{ color: '#67e8f9' }}>{globalModelMetrics.globalLoss}</div>
            <div className="kpi-subtext">Forecast MAPE: {globalModelMetrics.globalMape}%</div>
          </div>
          <div className="kpi-icon-box kpi-icon-cyan"><TrendingDown size={22} /></div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Differential Privacy (ε)</div>
            <div className="kpi-value" style={{ color: '#fbbf24' }}>ε = {privacyBudget.epsilon}</div>
            <div className="kpi-subtext">Gaussian Mechanism (δ = 1e-5)</div>
          </div>
          <div className="kpi-icon-box kpi-icon-amber"><ShieldCheck size={22} /></div>
        </div>
      </div>

      {/* Grid: Client Nodes Telemetry & Convergence Chart */}
      <div className="grid-2">
        {/* Client Nodes List */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title">
              <Server size={20} color="#8b5cf6" />
              Decentralized State Edge Nodes ({clientNodes.length} Online)
            </div>
            <span className="badge badge-success">Edge Training Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {clientNodes.map(node => (
              <div 
                key={node.nodeId}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.9rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, color: '#f3f4f6', fontSize: '0.92rem' }}>{node.nodeName}</span>
                  <span className="badge badge-info">{node.nodeId}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Custodian: {node.dataCustodian} • {node.region}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: 'rgba(0, 0, 0, 0.25)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Local Samples</div>
                    <div style={{ fontWeight: 700, color: '#f9fafb' }}>{node.localSamplesCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Local Loss</div>
                    <div style={{ fontWeight: 700, color: '#67e8f9' }}>{node.localLoss}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Local Accuracy</div>
                    <div style={{ fontWeight: 700, color: '#34d399' }}>{node.localAccuracy}%</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>Payload: <strong style={{ color: '#c084fc' }}>{node.payloadTransferred}</strong></span>
                  <span style={{ color: '#34d399' }}>🔒 Raw Patient Records: 0 (Preserved)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Model Convergence Chart */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={20} color="#10b981" />
              FedAvg Global Convergence & Loss Curve
            </div>
            <span className="badge badge-violet">Round Telemetry</span>
          </div>

          <div style={{ height: '320px', width: '100%', marginBottom: '1rem' }}>
            <Line data={convergenceChartData} options={chartOptions} />
          </div>

          {/* Differential Privacy Budget Controller */}
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e5e7eb' }}>
                Differential Privacy Epsilon Budget (ε)
              </span>
              <span className="font-mono" style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700 }}>
                ε = {customEpsilon}
              </span>
            </div>
            <input 
              type="range"
              min="0.5"
              max="3.0"
              step="0.05"
              value={customEpsilon}
              onChange={(e) => setCustomEpsilon(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              <span>High Privacy (Low ε, More Noise)</span>
              <span>High Utility (High ε, Less Noise)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
