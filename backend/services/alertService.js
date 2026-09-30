// Early Warning & Stock-out Alert Intelligence Service
const { facilities, medicineCatalog } = require("../data/mockData");

/**
 * Scan all clinics to compute real-time early warning alerts
 */
function getSystemAlerts(filterCity = null, filterZone = null) {
  const alerts = [];

  facilities.forEach(fac => {
    if (filterCity && fac.city.toLowerCase() !== filterCity.toLowerCase()) return;
    if (filterZone && fac.zone !== filterZone) return;

    // 1. Inventory Alerts
    fac.inventory.forEach(inv => {
      const med = medicineCatalog.find(m => m.id === inv.medicineId) || { name: inv.medicineName || inv.medicineId, unit: inv.unit || "units" };
      const daysRemaining = inv.dailyBurnRate > 0 ? (inv.currentStock / inv.dailyBurnRate) : 999;

      if (inv.currentStock <= Math.max(3, inv.minThreshold * 0.35) || daysRemaining <= 2.5) {
        alerts.push({
          id: `ALT-CRIT-${fac.id}-${inv.medicineId}`,
          facilityId: fac.id,
          facilityName: fac.name,
          displayName: fac.displayName,
          facilityType: fac.type,
          city: fac.city,
          zone: fac.zone,
          area: fac.area,
          chiefDoctor: fac.chiefDoctor,
          category: "CRITICAL_STOCKOUT",
          severity: "CRITICAL",
          priority: 1,
          title: `Critical Shortage: ${med.name}`,
          message: `${fac.displayName} has only ${inv.currentStock} ${med.unit} remaining (${daysRemaining.toFixed(1)} days runway vs ${inv.minThreshold} min threshold). Immediate replenishment order required.`,
          metric: `${inv.currentStock} units left (${daysRemaining.toFixed(1)}d)`,
          stock: inv.currentStock,
          minThreshold: inv.minThreshold,
          burnRate: inv.dailyBurnRate,
          medicineId: inv.medicineId,
          medicineName: med.name,
          actionRequired: "Chief Doctor Stock Request / Supplier Dispatch",
          timestamp: new Date().toISOString()
        });
      } else if (inv.currentStock <= inv.minThreshold || daysRemaining <= 6.0) {
        alerts.push({
          id: `ALT-HIGH-${fac.id}-${inv.medicineId}`,
          facilityId: fac.id,
          facilityName: fac.name,
          displayName: fac.displayName,
          facilityType: fac.type,
          city: fac.city,
          zone: fac.zone,
          area: fac.area,
          chiefDoctor: fac.chiefDoctor,
          category: "LOW_STOCK_WARNING",
          severity: "WARNING",
          priority: 2,
          title: `Low Safety Buffer: ${med.name}`,
          message: `${fac.displayName} stock (${inv.currentStock} ${med.unit}) has breached the minimum safety threshold (${inv.minThreshold} units). Stockout expected within ${daysRemaining.toFixed(1)} days.`,
          metric: `${inv.currentStock} units left (${daysRemaining.toFixed(1)}d)`,
          stock: inv.currentStock,
          minThreshold: inv.minThreshold,
          burnRate: inv.dailyBurnRate,
          medicineId: inv.medicineId,
          medicineName: med.name,
          actionRequired: "Scheduled Warehouse Replenishment",
          timestamp: new Date().toISOString()
        });
      }
    });

    // 2. Bed Occupancy Alerts
    const icuOccPercent = fac.beds.icu.total > 0 ? (fac.beds.icu.occupied / fac.beds.icu.total) * 100 : 0;
    if (icuOccPercent >= 90) {
      alerts.push({
        id: `ALT-BED-ICU-${fac.id}`,
        facilityId: fac.id,
        facilityName: fac.name,
        displayName: fac.displayName,
        city: fac.city,
        zone: fac.zone,
        area: fac.area,
        chiefDoctor: fac.chiefDoctor,
        category: "BED_CAPACITY_CRITICAL",
        severity: "CRITICAL",
        priority: 1,
        title: `Critical ICU Bed Saturation (${icuOccPercent.toFixed(0)}%)`,
        message: `${fac.displayName} ICU is at maximum capacity (${fac.beds.icu.occupied}/${fac.beds.icu.total} beds in use).`,
        metric: `${fac.beds.icu.occupied}/${fac.beds.icu.total} ICU in use`,
        actionRequired: "Activate Step-Down Protocol",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Sort by priority (1 = CRITICAL first)
  alerts.sort((a, b) => a.priority - b.priority);

  return {
    totalAlerts: alerts.length,
    criticalCount: alerts.filter(a => a.severity === "CRITICAL").length,
    warningCount: alerts.filter(a => a.severity === "WARNING").length,
    alerts
  };
}

module.exports = {
  getSystemAlerts
};
