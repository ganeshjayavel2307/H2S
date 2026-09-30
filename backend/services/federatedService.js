// Federated Learning Simulation Engine (FedAvg + Differential Privacy)
// Privacy-Preserving Collaborative AI for National Healthcare Supply & Demand

let federatedState = {
  currentRound: 18,
  targetRounds: 25,
  aggregationStrategy: "FedAvg (Federated Averaging with Normalized Sample Weights)",
  privacyBudget: {
    epsilon: 1.25, // Differential privacy epsilon
    delta: 1e-5,
    mechanism: "Gaussian Mechanism with Adaptive Gradient Clipping (C=1.0)"
  },
  globalModelMetrics: {
    globalLoss: 0.142,
    globalMape: 4.82,
    validationAccuracy: 94.6,
    totalParameters: 124500,
    convergenceStatus: "CONVERGING_STABLE"
  },
  roundsHistory: [
    { round: 1, loss: 0.890, accuracy: 68.2, participatingNodes: 6, epsilonUsed: 0.08 },
    { round: 4, loss: 0.540, accuracy: 78.5, participatingNodes: 6, epsilonUsed: 0.32 },
    { round: 8, loss: 0.320, accuracy: 85.1, participatingNodes: 6, epsilonUsed: 0.64 },
    { round: 12, loss: 0.215, accuracy: 89.8, participatingNodes: 6, epsilonUsed: 0.96 },
    { round: 15, loss: 0.168, accuracy: 92.4, participatingNodes: 6, epsilonUsed: 1.10 },
    { round: 18, loss: 0.142, accuracy: 94.6, participatingNodes: 6, epsilonUsed: 1.25 }
  ],
  clientNodes: [
    {
      nodeId: "NODE-MH-01",
      nodeName: "Maharashtra State Edge Node",
      region: "Western Region (Mumbai / Pune)",
      dataCustodian: "Dept of Public Health & Family Welfare, MH",
      localSamplesCount: 248000,
      weightPercentage: 26.5,
      localLoss: 0.138,
      localAccuracy: 95.1,
      lastSyncStatus: "SUCCESS",
      gradientNorm: 0.84,
      privacyNoiseAdded: "σ = 0.042 (Laplace/Gaussian)",
      rawPatientDataShared: false, // 100% Privacy Preserved!
      payloadTransferred: "Model Weights ΔW (14.2 MB encrypted float32 array)",
      status: "ONLINE_READY"
    },
    {
      nodeId: "NODE-DL-02",
      nodeName: "Delhi NCR Federal Edge Node",
      region: "Northern Region (Delhi NCT)",
      dataCustodian: "Directorate General of Health Services (DGHS)",
      localSamplesCount: 195000,
      weightPercentage: 20.8,
      localLoss: 0.151,
      localAccuracy: 93.8,
      lastSyncStatus: "SUCCESS",
      gradientNorm: 0.91,
      privacyNoiseAdded: "σ = 0.042 (Laplace/Gaussian)",
      rawPatientDataShared: false,
      payloadTransferred: "Model Weights ΔW (14.2 MB encrypted float32 array)",
      status: "ONLINE_READY"
    },
    {
      nodeId: "NODE-KA-03",
      nodeName: "Karnataka State Edge Node",
      region: "Southern Region (Bengaluru)",
      dataCustodian: "Karnataka State Health & Family Welfare",
      localSamplesCount: 172000,
      weightPercentage: 18.4,
      localLoss: 0.132,
      localAccuracy: 95.4,
      lastSyncStatus: "SUCCESS",
      gradientNorm: 0.79,
      privacyNoiseAdded: "σ = 0.042 (Laplace/Gaussian)",
      rawPatientDataShared: false,
      payloadTransferred: "Model Weights ΔW (14.2 MB encrypted float32 array)",
      status: "ONLINE_READY"
    },
    {
      nodeId: "NODE-TN-04",
      nodeName: "Tamil Nadu Edge Node",
      region: "Southern Region (Chennai)",
      dataCustodian: "Tamil Nadu Medical Services Corporation (TNMSC)",
      localSamplesCount: 188000,
      weightPercentage: 20.1,
      localLoss: 0.140,
      localAccuracy: 94.7,
      lastSyncStatus: "SUCCESS",
      gradientNorm: 0.82,
      privacyNoiseAdded: "σ = 0.042 (Laplace/Gaussian)",
      rawPatientDataShared: false,
      payloadTransferred: "Model Weights ΔW (14.2 MB encrypted float32 array)",
      status: "ONLINE_READY"
    },
    {
      nodeId: "NODE-UP-05",
      nodeName: "Uttar Pradesh Edge Node",
      region: "Northern Region (Lucknow)",
      dataCustodian: "UP State Health Systems Resource Centre",
      localSamplesCount: 132000,
      weightPercentage: 14.2,
      localLoss: 0.162,
      localAccuracy: 93.0,
      lastSyncStatus: "SUCCESS",
      gradientNorm: 0.95,
      privacyNoiseAdded: "σ = 0.042 (Laplace/Gaussian)",
      rawPatientDataShared: false,
      payloadTransferred: "Model Weights ΔW (14.2 MB encrypted float32 array)",
      status: "ONLINE_READY"
    }
  ]
};

/**
 * Trigger an interactive federated learning training round
 */
function runFederatedRound(customEpsilon = null) {
  if (customEpsilon) {
    federatedState.privacyBudget.epsilon = parseFloat(customEpsilon);
  }

  federatedState.currentRound += 1;
  const r = federatedState.currentRound;

  // Simulate loss reduction and accuracy improvement with Diminishing Returns
  const newLoss = Math.max(0.065, parseFloat((federatedState.globalModelMetrics.globalLoss * (0.95 - (Math.random() * 0.02))).toFixed(3)));
  const newAcc = Math.min(98.8, parseFloat((federatedState.globalModelMetrics.validationAccuracy + (0.4 + Math.random() * 0.3)).toFixed(1)));
  const newMape = Math.max(2.8, parseFloat((federatedState.globalModelMetrics.globalMape * 0.96).toFixed(2)));

  federatedState.globalModelMetrics.globalLoss = newLoss;
  federatedState.globalModelMetrics.validationAccuracy = newAcc;
  federatedState.globalModelMetrics.globalMape = newMape;

  const roundEpsilon = parseFloat((federatedState.privacyBudget.epsilon + 0.08).toFixed(2));
  federatedState.privacyBudget.epsilon = roundEpsilon;

  // Update client nodes
  federatedState.clientNodes.forEach(node => {
    node.localLoss = Math.max(0.06, parseFloat((node.localLoss * 0.96).toFixed(3)));
    node.localAccuracy = Math.min(99.0, parseFloat((node.localAccuracy + (0.3 + Math.random() * 0.4)).toFixed(1)));
    node.gradientNorm = parseFloat((0.6 + Math.random() * 0.3).toFixed(2));
    node.lastSyncStatus = "SUCCESS";
  });

  const roundRecord = {
    round: r,
    loss: newLoss,
    accuracy: newAcc,
    participatingNodes: federatedState.clientNodes.length,
    epsilonUsed: roundEpsilon,
    timestamp: new Date().toISOString()
  };

  federatedState.roundsHistory.push(roundRecord);

  return {
    success: true,
    message: `Federated Training Round #${r} completed across ${federatedState.clientNodes.length} State AI Nodes. FedAvg aggregation successfully updated global model weights.`,
    roundRecord,
    federatedState
  };
}

function getFederatedStatus() {
  return federatedState;
}

module.exports = {
  getFederatedStatus,
  runFederatedRound
};
