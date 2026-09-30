// Cross-Clinic Resource Redistribution Recommendation & Optimization Engine
const { facilities, medicineCatalog } = require("../data/mockData");

let transferOrders = [
  {
    id: "TRX-CHE-8801",
    medicineId: "MED-005",
    medicineName: "Insulin Glargine (100 IU/ml)",
    sourceFacilityId: "CHE-002",
    sourceFacilityName: "Chennai Clinic 002 (Anna Nagar)",
    targetFacilityId: "CHE-042",
    targetFacilityName: "Chennai Clinic 042 (Anna Nagar Central)",
    quantity: 40,
    unit: "Cartridges (3ml)",
    distanceKm: 3.2,
    estimatedTransitHours: 0.3,
    status: "IN_TRANSIT",
    priority: "URGENT",
    city: "Chennai",
    initiatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    eta: new Date(Date.now() + 3600000 * 1).toISOString(),
    coldChainRequired: true,
    reason: "Emergency Insulin stock replenishment for Clinic 042"
  }
];

function generateRedistributionRecommendations(filterCity = null) {
  const recommendations = [];
  const cityFilteredFacilities = filterCity 
    ? facilities.filter(f => f.city.toLowerCase() === filterCity.toLowerCase())
    : facilities;

  medicineCatalog.slice(0, 6).forEach(med => {
    const deficitNodes = [];
    const surplusNodes = [];

    cityFilteredFacilities.forEach(fac => {
      const inv = fac.inventory.find(i => i.medicineId === med.id);
      if (!inv) return;

      const daysRemaining = inv.dailyBurnRate > 0 ? (inv.currentStock / inv.dailyBurnRate) : 99;

      if (inv.currentStock <= Math.max(5, inv.minThreshold * 0.35) || daysRemaining < 3.0) {
        const unitsNeeded = Math.max(10, (inv.minThreshold * 2) - inv.currentStock);
        deficitNodes.push({
          facility: fac,
          inv,
          daysRemaining,
          unitsNeeded: Math.round(unitsNeeded)
        });
      } else if (inv.currentStock >= inv.minThreshold * 2.5 && daysRemaining > 15.0) {
        const safeSurplus = Math.max(0, inv.currentStock - (inv.minThreshold * 1.5));
        if (safeSurplus >= 15) {
          surplusNodes.push({
            facility: fac,
            inv,
            daysRemaining,
            availableSurplus: Math.round(safeSurplus)
          });
        }
      }
    });

    deficitNodes.slice(0, 6).forEach(def => {
      if (surplusNodes.length === 0) return;

      const candidates = surplusNodes
        .filter(s => s.facility.city === def.facility.city)
        .map(surp => {
          const dx = (def.facility.mapCoords?.x || 50) - (surp.facility.mapCoords?.x || 50);
          const dy = (def.facility.mapCoords?.y || 50) - (surp.facility.mapCoords?.y || 50);
          const distKm = Math.round(Math.max(1.5, Math.sqrt(dx * dx + dy * dy) * 0.4) * 10) / 10;
          const estTransitHours = Math.round((distKm / 25) * 10) / 10;
          const transferableUnits = Math.min(def.unitsNeeded, surp.availableSurplus);

          return {
            surplus: surp,
            distKm,
            estTransitHours,
            transferableUnits,
            sameZone: def.facility.zone === surp.facility.zone
          };
        })
        .filter(c => c.transferableUnits > 0);

      candidates.sort((a, b) => a.distKm - b.distKm);

      if (candidates.length > 0) {
        const best = candidates[0];
        const newStockDeficit = def.inv.currentStock + best.transferableUnits;
        const newDaysCoverage = (newStockDeficit / def.inv.dailyBurnRate).toFixed(1);

        recommendations.push({
          id: `REC-${def.facility.id}-${best.surplus.facility.id}-${med.id}`,
          medicineId: med.id,
          medicineName: med.name,
          category: med.category,
          unit: med.unit,
          city: def.facility.city,
          targetFacility: {
            id: def.facility.id,
            name: def.facility.displayName || def.facility.name,
            city: def.facility.city,
            zone: def.facility.zone,
            chiefDoctor: def.facility.chiefDoctor,
            currentStock: def.inv.currentStock,
            minThreshold: def.inv.minThreshold,
            currentCoverageDays: def.daysRemaining.toFixed(1),
            postTransferCoverageDays: newDaysCoverage
          },
          sourceFacility: {
            id: best.surplus.facility.id,
            name: best.surplus.facility.displayName || best.surplus.facility.name,
            city: best.surplus.facility.city,
            zone: best.surplus.facility.zone,
            chiefDoctor: best.surplus.facility.chiefDoctor,
            currentStock: best.surplus.inv.currentStock,
            surplusAvailable: best.surplus.availableSurplus,
            postTransferStock: best.surplus.inv.currentStock - best.transferableUnits
          },
          recommendedTransferQty: best.transferableUnits,
          distanceKm: best.distKm,
          estimatedTransitHours: best.estTransitHours,
          urgency: def.daysRemaining < 2.0 ? "CRITICAL" : "HIGH",
          aiRationale: `Target clinic has only ${def.daysRemaining.toFixed(1)} days of ${med.name} remaining. Source clinic maintains a safe excess (+${best.surplus.availableSurplus} units). Reallocating ${best.transferableUnits} ${med.unit} restores safe operations.`
        });
      }
    });
  });

  return {
    totalRecommendations: recommendations.length,
    recommendations,
    activeTransfers: filterCity ? transferOrders.filter(t => t.city.toLowerCase() === filterCity.toLowerCase()) : transferOrders
  };
}

function executeTransfer(recommendationData) {
  const { sourceFacilityId, targetFacilityId, medicineId, quantity } = recommendationData;

  const srcFac = facilities.find(f => f.id === sourceFacilityId);
  const tgtFac = facilities.find(f => f.id === targetFacilityId);
  const med = medicineCatalog.find(m => m.id === medicineId);

  if (!srcFac || !tgtFac || !med) throw new Error("Invalid facility or medicine");

  const srcInv = srcFac.inventory.find(i => i.medicineId === medicineId);
  let tgtInv = tgtFac.inventory.find(i => i.medicineId === medicineId);

  if (!srcInv || srcInv.currentStock < quantity) {
    throw new Error("Source clinic has insufficient surplus to fulfill transfer");
  }

  srcInv.currentStock -= quantity;
  if (tgtInv) {
    tgtInv.currentStock += quantity;
    tgtInv.lastRestocked = new Date().toISOString().split("T")[0];
  }

  const newOrder = {
    id: `TRX-${Date.now().toString().slice(-6)}`,
    medicineId,
    medicineName: med.name,
    sourceFacilityId: srcFac.id,
    sourceFacilityName: srcFac.displayName || srcFac.name,
    targetFacilityId: tgtFac.id,
    targetFacilityName: tgtFac.displayName || tgtFac.name,
    quantity,
    unit: med.unit,
    city: tgtFac.city,
    distanceKm: recommendationData.distanceKm || 4.2,
    estimatedTransitHours: recommendationData.estimatedTransitHours || 0.4,
    status: "DISPATCHED",
    priority: recommendationData.urgency || "HIGH",
    initiatedAt: new Date().toISOString(),
    eta: new Date(Date.now() + 3600000 * 1).toISOString(),
    coldChainRequired: med.tempControl.includes("Cold"),
    reason: "AI Automated Clinic Stock Re-balancing"
  };

  transferOrders.unshift(newOrder);

  return {
    success: true,
    message: `Transfer of ${quantity} ${med.unit} from ${srcFac.name} to ${tgtFac.name} dispatched successfully.`,
    order: newOrder,
    sourceUpdatedStock: srcInv.currentStock,
    targetUpdatedStock: tgtInv ? tgtInv.currentStock : quantity
  };
}

module.exports = {
  generateRedistributionRecommendations,
  executeTransfer,
  transferOrders
};
