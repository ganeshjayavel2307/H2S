const express = require("express");
const router = express.Router();

const { 
  medicineCatalog, 
  facilities, 
  supplyRequests, 
  getFacilityStatus, 
  updateSupplyRequestStatus, 
  createSupplyRequest 
} = require("../data/mockData");

const { generateDemandForecast } = require("../services/forecastService");
const { getSystemAlerts } = require("../services/alertService");
const { generateRedistributionRecommendations, executeTransfer } = require("../services/redistributionService");

// 1. Cities Summary & Network Comparison (Chennai ~180 PHCs & Coimbatore ~45 PHCs)
router.get("/cities", (req, res) => {
  try {
    const chennaiClinics = facilities.filter(f => f.city === "Chennai");
    const coimbatoreClinics = facilities.filter(f => f.city === "Coimbatore");

    const getCitySummary = (clinics, cityName) => {
      let critical = 0, warning = 0, normal = 0, totalCurrentPatients = 0, totalExpectedPatients = 0, totalAdditionalStock = 0;
      clinics.forEach(c => {
        const st = getFacilityStatus(c);
        if (st.status === "CRITICAL") critical++;
        else if (st.status === "WARNING") warning++;
        else normal++;

        totalCurrentPatients += c.currentPatients || 0;
        totalExpectedPatients += c.expectedPatients?.tomorrow || 0;
        totalAdditionalStock += st.totalAdditionalNeeded || 0;
      });

      return {
        city: cityName,
        totalClinics: clinics.length,
        critical,
        warning,
        normal,
        totalCurrentPatients,
        totalExpectedPatients,
        totalAdditionalStock,
        criticalPercent: ((critical / clinics.length) * 100).toFixed(1)
      };
    };

    res.json({
      success: true,
      data: [
        getCitySummary(chennaiClinics, "Chennai"),
        getCitySummary(coimbatoreClinics, "Coimbatore")
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Citywide Dashboard Statistics
router.get("/dashboard/stats", (req, res) => {
  try {
    const { city } = req.query;
    let targetClinics = facilities;
    if (city && city !== "ALL" && city !== "All Cities") {
      targetClinics = targetClinics.filter(f => f.city.toLowerCase() === city.toLowerCase());
    }

    let criticalClinics = 0;
    let warningClinics = 0;
    let normalClinics = 0;
    let criticalMedicineShortages = 0;
    let totalCurrentPatients = 0;
    let totalExpectedPatientsTomorrow = 0;
    let totalExpectedPatients7Days = 0;
    let totalAdditionalStockNeeded = 0;
    let totalBeds = 0;
    let occupiedBeds = 0;

    targetClinics.forEach(c => {
      const st = getFacilityStatus(c);
      if (st.status === "CRITICAL") {
        criticalClinics++;
        criticalMedicineShortages += st.criticalItems.length;
      } else if (st.status === "WARNING") {
        warningClinics++;
      } else {
        normalClinics++;
      }

      totalCurrentPatients += c.currentPatients || 0;
      totalExpectedPatientsTomorrow += c.expectedPatients?.tomorrow || 0;
      totalExpectedPatients7Days += c.expectedPatients?.next7Days || 0;
      totalAdditionalStockNeeded += st.totalAdditionalNeeded || 0;

      totalBeds += c.beds.total;
      occupiedBeds += c.beds.occupied;
    });

    const pendingRequests = supplyRequests.filter(r => 
      (!city || city === "ALL" || city === "All Cities" || r.city.toLowerCase() === city.toLowerCase()) && 
      (r.status === "REQUESTED" || r.status === "ACCEPTED")
    ).length;

    res.json({
      success: true,
      data: {
        selectedCity: city || "All Cities",
        totalClinics: targetClinics.length,
        criticalClinics,
        warningClinics,
        normalClinics,
        totalCurrentPatients,
        totalExpectedPatientsTomorrow,
        totalExpectedPatients7Days,
        criticalMedicineShortages,
        totalAdditionalStockNeeded,
        pendingRequests,
        beds: {
          total: totalBeds,
          occupied: occupiedBeds,
          occupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : "0"
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Minister Analytics Datasets
router.get("/analytics", (req, res) => {
  try {
    const { city } = req.query;
    let target = facilities;
    if (city && city !== "ALL" && city !== "All Cities") {
      target = target.filter(f => f.city.toLowerCase() === city.toLowerCase());
    }

    // A. Patient Demand by Zone
    const zoneMap = {};
    target.forEach(f => {
      const z = f.zone || "Central";
      if (!zoneMap[z]) zoneMap[z] = { zone: z, current: 0, expected: 0 };
      zoneMap[z].current += f.currentPatients || 0;
      zoneMap[z].expected += f.expectedPatients?.tomorrow || 0;
    });
    const patientDemandByZone = Object.values(zoneMap);

    // B. Critical Shortages by Medicine
    const medShortageMap = {};
    target.forEach(f => {
      f.inventory.forEach(inv => {
        if (inv.status === "CRITICAL" || inv.currentStock <= inv.requiredStock * 0.35) {
          medShortageMap[inv.medicineName] = (medShortageMap[inv.medicineName] || 0) + 1;
        }
      });
    });
    const shortagesByMedicine = Object.entries(medShortageMap).map(([name, count]) => ({ name, count }));

    // C. Aggregate Stock vs Required vs Additional Needed for Key Medicines
    const stockComparison = medicineCatalog.slice(0, 6).map(m => {
      let current = 0, required = 0, additional = 0;
      target.forEach(f => {
        const inv = f.inventory.find(i => i.medicineId === m.id);
        if (inv) {
          current += inv.currentStock;
          required += inv.requiredStock;
          additional += inv.additionalRequired;
        }
      });
      return {
        medicine: m.name.split(" ")[0],
        current,
        required,
        additional
      };
    });

    res.json({
      success: true,
      data: {
        patientDemandByZone,
        shortagesByMedicine,
        stockComparison
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Clinics / PHCs Directory
router.get(["/clinics", "/facilities"], (req, res) => {
  try {
    const { city, zone, status, search } = req.query;
    let result = facilities.map(f => {
      const statusInfo = getFacilityStatus(f);
      return {
        ...f,
        statusInfo,
        status: statusInfo.status,
        totalAdditionalNeeded: statusInfo.totalAdditionalNeeded
      };
    });

    if (city && city !== "ALL" && city !== "All Cities") {
      result = result.filter(f => f.city.toLowerCase() === city.toLowerCase());
    }
    if (zone && zone !== "ALL") {
      result = result.filter(f => f.zone === zone);
    }
    if (status && status !== "ALL") {
      result = result.filter(f => f.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(f => 
        f.name.toLowerCase().includes(q) || 
        f.displayName.toLowerCase().includes(q) || 
        f.chiefDoctor.toLowerCase().includes(q) ||
        (f.area && f.area.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: result.length, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get(["/clinics/:id", "/facilities/:id"], (req, res) => {
  const clinic = facilities.find(f => f.id === req.params.id);
  if (!clinic) return res.status(404).json({ success: false, message: "PHC not found" });
  
  const statusInfo = getFacilityStatus(clinic);
  const clinicRequests = supplyRequests.filter(r => r.clinicId === clinic.id);

  res.json({
    success: true,
    data: {
      ...clinic,
      statusInfo,
      status: statusInfo.status,
      totalAdditionalNeeded: statusInfo.totalAdditionalNeeded,
      requests: clinicRequests
    }
  });
});

// 5. Medicine Catalog
router.get("/medicines", (req, res) => {
  res.json({ success: true, data: medicineCatalog });
});

// 6. Supply Requests Lifecycle (Doctor -> Supplier -> Delivery)
router.get("/requests", (req, res) => {
  try {
    const { city, clinicId, status } = req.query;
    let result = supplyRequests;

    if (city && city !== "ALL" && city !== "All Cities") {
      result = result.filter(r => r.city.toLowerCase() === city.toLowerCase());
    }
    if (clinicId) {
      result = result.filter(r => r.clinicId === clinicId);
    }
    if (status && status !== "ALL") {
      result = result.filter(r => r.status === status);
    }

    res.json({ success: true, count: result.length, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/requests", (req, res) => {
  try {
    const created = createSupplyRequest(req.body);
    res.status(201).json({
      success: true,
      message: `Supply order ${created.id} submitted successfully to Central Stock Supplier.`,
      data: created
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.patch("/requests/:id", (req, res) => {
  try {
    const { status, note } = req.body;
    const updated = updateSupplyRequestStatus(req.params.id, status, note);
    res.json({
      success: true,
      message: `Request ${updated.id} status transitioned to ${status}.`,
      data: updated
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 7. Role-Based Notifications
router.get("/notifications", (req, res) => {
  try {
    const { role, clinicId, city } = req.query;
    const notifications = [];

    if (role === "DOCTOR") {
      const clinic = facilities.find(f => f.id === (clinicId || "CHE-042")) || facilities[0];
      const st = getFacilityStatus(clinic);
      if (st.status === "CRITICAL") {
        notifications.push({
          id: "NOTIF-DOC-1",
          type: "CRITICAL",
          title: "Critical Stock Shortage Alert",
          message: `Insulin & Paracetamol deficits detected at ${clinic.displayName} based on expected ${clinic.expectedPatients.tomorrow} patients.`,
          timestamp: "Just now"
        });
      }
      const myReqs = supplyRequests.filter(r => r.clinicId === clinic.id);
      myReqs.forEach((r, idx) => {
        notifications.push({
          id: `NOTIF-DOC-REQ-${idx}`,
          type: r.status === "DELIVERED" ? "SUCCESS" : "INFO",
          title: `Supply Order ${r.status}`,
          message: `Order for ${r.requestedQuantity} ${r.unit} of ${r.medicineName} is ${r.status}.`,
          timestamp: "5 mins ago"
        });
      });
    } else if (role === "MINISTER") {
      const chennaiCrit = facilities.filter(f => f.city === "Chennai" && getFacilityStatus(f).status === "CRITICAL").length;
      const cbeCrit = facilities.filter(f => f.city === "Coimbatore" && getFacilityStatus(f).status === "CRITICAL").length;

      notifications.push({
        id: "NOTIF-MIN-1",
        type: "CRITICAL",
        title: "Network Shortage Alert",
        message: `${chennaiCrit} Chennai PHCs & ${cbeCrit} Coimbatore PHCs currently have critical medicine deficits.`,
        timestamp: "2 mins ago"
      });
      notifications.push({
        id: "NOTIF-MIN-2",
        type: "INFO",
        title: "Patient Surge Surveillance",
        message: "Expected patient demand indicates a +39% surge in North & Central Chennai sectors.",
        timestamp: "10 mins ago"
      });
    } else if (role === "SUPPLIER") {
      const urgentCount = supplyRequests.filter(r => r.status === "REQUESTED").length;
      notifications.push({
        id: "NOTIF-SUP-1",
        type: "URGENT",
        title: "Urgent PHC Supply Orders",
        message: `${urgentCount} critical replenishment orders awaiting acceptance and dispatch.`,
        timestamp: "Just now"
      });
    }

    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Early Warning Alerts
router.get("/alerts", (req, res) => {
  try {
    const { city, zone } = req.query;
    const data = getSystemAlerts(city, zone);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. AI Demand Forecasting
router.get("/forecast", (req, res) => {
  try {
    const { medicineId = "MED-001", facilityId = "CHE-042", horizon = 30 } = req.query;
    const data = generateDemandForecast(medicineId, facilityId, parseInt(horizon, 10));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. Redistribution Engine
router.get("/redistribution/recommendations", (req, res) => {
  try {
    const { city } = req.query;
    const data = generateRedistributionRecommendations(city);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/redistribution/execute", (req, res) => {
  try {
    const result = executeTransfer(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
