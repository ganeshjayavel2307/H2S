// Comprehensive Citywide Healthcare Dataset: Chennai (~180 PHCs) & Coimbatore (~45 PHCs)
// With Patient Demand & Medicine Requirement Modeling

const medicineCatalog = [
  { id: "MED-001", name: "Paracetamol 650mg Tabs", category: "Essential / Antipyretic", unit: "Tablets", unitCostINR: 2.5, basePerPatient: 4, shelfLifeMonths: 24, tempControl: "Ambient (<25°C)" },
  { id: "MED-002", name: "Amoxicillin + Clavulanic Acid 625mg", category: "Antibiotics", unit: "Strips (6s)", unitCostINR: 115.0, basePerPatient: 1, shelfLifeMonths: 18, tempControl: "Ambient (<25°C)" },
  { id: "MED-003", name: "Ceftriaxone 1g Injection", category: "Critical Care / Antibiotic", unit: "Vials", unitCostINR: 48.0, basePerPatient: 0.5, shelfLifeMonths: 24, tempControl: "Cold (2-8°C)" },
  { id: "MED-004", name: "Azithromycin 500mg", category: "Antibiotics / Respiratory", unit: "Strips (3s)", unitCostINR: 65.0, basePerPatient: 1, shelfLifeMonths: 24, tempControl: "Ambient (<25°C)" },
  { id: "MED-005", name: "Insulin Glargine (100 IU/ml)", category: "Chronic Care / Diabetes", unit: "Cartridges (3ml)", unitCostINR: 460.0, basePerPatient: 0.8, shelfLifeMonths: 12, tempControl: "Cold (2-8°C)" },
  { id: "MED-006", name: "Remdesivir 100mg Inj", category: "Critical Care / Antiviral", unit: "Vials", unitCostINR: 1850.0, basePerPatient: 0.2, shelfLifeMonths: 24, tempControl: "Ambient (<25°C)" },
  { id: "MED-007", name: "Normal Saline (0.9% NaCl 500ml)", category: "Fluids & Electrolytes", unit: "IV Bottles", unitCostINR: 32.0, basePerPatient: 2, shelfLifeMonths: 36, tempControl: "Ambient" },
  { id: "MED-008", name: "Dexamethasone 4mg/ml Inj", category: "Emergency / Steroid", unit: "Ampoules (2ml)", unitCostINR: 12.5, basePerPatient: 0.5, shelfLifeMonths: 24, tempControl: "Ambient" },
  { id: "MED-010", name: "ORS (Oral Rehydration Salts 21.8g)", category: "Essential / Pediatric", unit: "Sachets", unitCostINR: 6.5, basePerPatient: 3, shelfLifeMonths: 36, tempControl: "Ambient" }
];

const chennaiZones = ["Central Chennai", "North Chennai", "South Chennai", "East Coastal", "West Chennai"];
const chennaiAreas = [
  "Porur", "Tambaram", "Kelambakkam", "Ambattur", "Anna Nagar", "Adyar", 
  "Velachery", "Guindy", "T Nagar", "Perambur", "Avadi", "Sholinganallur"
];

const coimbatoreZones = ["Central Zone", "North Zone", "East Zone", "South Zone", "West Zone"];
const coimbatoreAreas = [
  "Gandhipuram", "RS Puram", "Peelamedu", "Singanallur", "Saibaba Colony", 
  "Kuniyamuthur", "Saravanampatti", "Ukkadam"
];

const doctorFirstNames = [
  "Anitha", "Priya", "Kavitha", "Meenakshi", "Radhika", "Deepa", "Gayathri", "Shalini",
  "Sangeetha", "Revathi", "Selvi", "Sudha", "Nithya", "Abirami", "Divya", "Swetha",
  "Arvind", "Manoj", "Karthik", "Balamurugan", "Saravanan", "Vigneshwaran", "Sundaramurthy", 
  "Rajesh", "Suresh", "Ramesh", "Santhosh", "Vijay", "Prakash", "Dinesh", "Sanjay"
];

const doctorLastNames = [
  "Kumar", "Ramesh", "Narayanan", "Balaji", "Sundaram", "Lakshmi", "Raja", "Mohan",
  "Marimuthu", "Vijayaraghavan", "Natarajan", "Murugesan", "Subramanian", "Krishnan",
  "Venkatesh", "Ramachandran", "Pillai", "Chettiar", "Menon", "Gounder", "Srinivasan"
];

function generateDoctorName(index) {
  const first = doctorFirstNames[index % doctorFirstNames.length];
  const last = doctorLastNames[(index * 7) % doctorLastNames.length];
  return `Dr. ${first} ${last}`;
}

// Generate Chennai PHCs (180 PHCs distributed across 12 areas, ~15 PHCs per area)
function generateChennaiPHCs() {
  const phcs = [];
  const areaCounts = {};
  
  // ~24 Critical, ~38 Warning, ~118 Normal
  const criticalIndices = [42, 7, 18, 29, 53, 64, 76, 88, 95, 104, 115, 122, 131, 140, 148, 155, 163, 172, 12, 33, 81, 109, 137, 169];
  const warningIndices = [3, 9, 15, 21, 27, 35, 47, 58, 69, 73, 84, 91, 99, 107, 118, 126, 134, 143, 151, 159, 167, 175, 2, 14, 25, 38, 50, 62, 80, 93, 105, 119, 133, 145, 157, 168, 178, 180];

  for (let i = 1; i <= 180; i++) {
    const padded = String(i).padStart(3, "0");
    const id = `CHE-${padded}`;
    const zone = chennaiZones[(i - 1) % chennaiZones.length];
    const area = chennaiAreas[(i - 1) % chennaiAreas.length];
    
    areaCounts[area] = (areaCounts[area] || 0) + 1;
    const areaSeqPadded = String(areaCounts[area]).padStart(3, "0");
    const name = `${area} PHC ${areaSeqPadded}`;
    const chiefDoctor = i === 42 ? "Dr. Priya Ramesh" : (i === 1 ? "Dr. Anitha Kumar" : generateDoctorName(i));
    
    const angle = (i * 137.5) * (Math.PI / 180);
    const r = Math.min(42, 6 + Math.sqrt(i) * 2.7);
    const x = Math.round(Math.max(8, Math.min(92, 50 + r * Math.cos(angle))));
    const y = Math.round(Math.max(8, Math.min(92, 50 + r * Math.sin(angle))));

    const isCritical = criticalIndices.includes(i);
    const isWarning = warningIndices.includes(i);

    // Patient Demand Data
    const currentPatients = i === 42 ? 86 : (isCritical ? 95 + (i % 25) : (isWarning ? 75 + (i % 20) : 55 + (i % 30)));
    const expectedTomorrow = i === 42 ? 105 : Math.round(currentPatients * (isCritical ? 1.35 : (isWarning ? 1.18 : 1.05)));
    const expectedNext7Days = i === 42 ? 720 : Math.round(expectedTomorrow * 6.8);
    const expectedNext30Days = i === 42 ? 2900 : Math.round(expectedTomorrow * 27.5);

    // Inventory with Requirement & Additional Needed Calculation
    const inventory = medicineCatalog.map((med, mIdx) => {
      let requiredStock, currentStock, dailyBurnRate;
      
      // Calculate required stock from patient demand multiplier
      const patientMultiplier = expectedTomorrow / 75;
      
      if (med.id === "MED-001") {
        // Paracetamol
        requiredStock = 500;
        dailyBurnRate = 45;
        if (i === 42) currentStock = 350; // User example: Paracetamol Current 350, Required 500, Additional 150
        else if (isCritical) currentStock = 120;
        else if (isWarning) currentStock = 380;
        else currentStock = 750;
      } else if (med.id === "MED-005") {
        // Insulin
        requiredStock = 100;
        dailyBurnRate = 8;
        if (i === 42) currentStock = 20; // User example: Insulin Current 20, Required 100, Additional 80
        else if (isCritical) currentStock = 15;
        else if (isWarning) currentStock = 75;
        else currentStock = 140;
      } else if (med.id === "MED-002") {
        // Amoxicillin
        requiredStock = 180;
        dailyBurnRate = 18;
        currentStock = isCritical ? 40 : (isWarning ? 140 : 250);
      } else if (med.id === "MED-007") {
        // Normal Saline
        requiredStock = 300;
        dailyBurnRate = 25;
        currentStock = isCritical ? 80 : (isWarning ? 240 : 450);
      } else {
        requiredStock = Math.round(120 * patientMultiplier);
        dailyBurnRate = Math.max(5, Math.round(12 * patientMultiplier));
        currentStock = isCritical && mIdx % 2 === 0 ? Math.round(requiredStock * 0.25) : Math.round(requiredStock * (isWarning ? 0.8 : 1.6));
      }

      const additionalRequired = Math.max(0, requiredStock - currentStock);
      
      let itemStatus = "NORMAL";
      if (currentStock <= Math.max(5, requiredStock * 0.35)) {
        itemStatus = "CRITICAL";
      } else if (currentStock < requiredStock) {
        itemStatus = "WARNING";
      }

      return {
        medicineId: med.id,
        medicineName: med.name,
        category: med.category,
        unit: med.unit,
        currentStock,
        requiredStock,
        additionalRequired,
        dailyBurnRate,
        minThreshold: Math.round(requiredStock * 0.4),
        status: itemStatus,
        lastRestocked: "2026-09-24",
        batchNo: `CHE-B${padded}-${med.id.replace('MED-', '')}`
      };
    });

    const totalBeds = 15 + (i % 15);
    const occBeds = isCritical ? totalBeds - 1 : Math.round(totalBeds * 0.7);

    phcs.push({
      id,
      name,
      displayName: `${name} (${id})`,
      city: "Chennai",
      zone,
      area,
      type: "Primary Health Centre (PHC)",
      chiefDoctor,
      contactPerson: chiefDoctor,
      phone: `+91 44 2834 ${1000 + i}`,
      mapCoords: { x, y },
      currentPatients,
      expectedPatients: {
        tomorrow: expectedTomorrow,
        next7Days: expectedNext7Days,
        next30Days: expectedNext30Days,
        growthRate: isCritical ? "+39% (Surge)" : (isWarning ? "+22% (Elevated)" : "+6% (Steady)")
      },
      patientDemandStatus: isCritical ? "Surge (+39%)" : (isWarning ? "Elevated (+22%)" : "Normal Flow (+6%)"),
      beds: {
        total: totalBeds,
        occupied: occBeds,
        icu: { total: 2, occupied: isCritical ? 2 : 1 },
        oxygen: { total: 6, occupied: isCritical ? 5 : 3 },
        general: { total: totalBeds - 8, occupied: occBeds - (isCritical ? 7 : 4) }
      },
      staff: {
        doctors: { total: 4, onDuty: isCritical ? 3 : 4, onLeave: isCritical ? 1 : 0 },
        nurses: { total: 8, onDuty: isCritical ? 6 : 8, onLeave: isCritical ? 2 : 0 },
        pharmacists: { total: 2, onDuty: 2, onLeave: 0 },
        paramedics: { total: 4, onDuty: 3, onLeave: 1 }
      },
      inventory
    });
  }

  return phcs;
}

// Generate Coimbatore PHCs (45 PHCs distributed across 8 areas)
function generateCoimbatorePHCs() {
  const phcs = [];
  const areaCounts = {};
  const criticalIndices = [8, 19, 27, 34, 41]; // ~5 Critical
  const warningIndices = [3, 7, 12, 16, 22, 29, 33, 38, 43, 45]; // ~10 Warning

  for (let i = 1; i <= 45; i++) {
    const padded = String(i).padStart(3, "0");
    const id = `CBE-${padded}`;
    const zone = coimbatoreZones[(i - 1) % coimbatoreZones.length];
    const area = coimbatoreAreas[(i - 1) % coimbatoreAreas.length];
    areaCounts[area] = (areaCounts[area] || 0) + 1;
    const areaSeqPadded = String(areaCounts[area]).padStart(3, "0");
    const name = `${area} PHC ${areaSeqPadded}`;
    const chiefDoctor = generateDoctorName(i + 200);

    const angle = (i * 142) * (Math.PI / 180);
    const r = Math.min(40, 7 + Math.sqrt(i) * 4.5);
    const x = Math.round(Math.max(10, Math.min(90, 50 + r * Math.cos(angle))));
    const y = Math.round(Math.max(10, Math.min(90, 50 + r * Math.sin(angle))));

    const isCritical = criticalIndices.includes(i);
    const isWarning = warningIndices.includes(i);

    const currentPatients = isCritical ? 85 + (i % 20) : (isWarning ? 65 + (i % 15) : 48 + (i % 20));
    const expectedTomorrow = Math.round(currentPatients * (isCritical ? 1.3 : (isWarning ? 1.15 : 1.04)));
    const expectedNext7Days = Math.round(expectedTomorrow * 6.8);
    const expectedNext30Days = Math.round(expectedTomorrow * 27.5);

    const inventory = medicineCatalog.map((med, mIdx) => {
      let requiredStock, currentStock, dailyBurnRate;
      
      if (med.id === "MED-001") {
        requiredStock = 400;
        dailyBurnRate = 35;
        currentStock = isCritical ? 90 : (isWarning ? 310 : 600);
      } else if (med.id === "MED-005") {
        requiredStock = 80;
        dailyBurnRate = 6;
        currentStock = isCritical ? 14 : (isWarning ? 60 : 120);
      } else {
        requiredStock = 100;
        dailyBurnRate = 10;
        currentStock = isCritical && mIdx % 2 === 0 ? 20 : (isWarning ? 75 : 150);
      }

      const additionalRequired = Math.max(0, requiredStock - currentStock);
      let itemStatus = "NORMAL";
      if (currentStock <= Math.max(5, requiredStock * 0.35)) {
        itemStatus = "CRITICAL";
      } else if (currentStock < requiredStock) {
        itemStatus = "WARNING";
      }

      return {
        medicineId: med.id,
        medicineName: med.name,
        category: med.category,
        unit: med.unit,
        currentStock,
        requiredStock,
        additionalRequired,
        dailyBurnRate,
        minThreshold: Math.round(requiredStock * 0.4),
        status: itemStatus,
        lastRestocked: "2026-09-25",
        batchNo: `CBE-B${padded}-${med.id.replace('MED-', '')}`
      };
    });

    const totalBeds = 12 + (i % 12);
    const occBeds = isCritical ? totalBeds - 1 : Math.round(totalBeds * 0.65);

    phcs.push({
      id,
      name,
      displayName: `${name} (${id})`,
      city: "Coimbatore",
      zone,
      area,
      type: "Primary Health Centre (PHC)",
      chiefDoctor,
      contactPerson: chiefDoctor,
      phone: `+91 422 245 ${1000 + i}`,
      mapCoords: { x, y },
      currentPatients,
      expectedPatients: {
        tomorrow: expectedTomorrow,
        next7Days: expectedNext7Days,
        next30Days: expectedNext30Days,
        growthRate: isCritical ? "+30% (Surge)" : (isWarning ? "+15% (Elevated)" : "+4% (Steady)")
      },
      patientDemandStatus: isCritical ? "Surge (+30%)" : (isWarning ? "Elevated (+15%)" : "Normal Flow (+4%)"),
      beds: {
        total: totalBeds,
        occupied: occBeds,
        icu: { total: 2, occupied: isCritical ? 2 : 0 },
        oxygen: { total: 4, occupied: isCritical ? 4 : 2 },
        general: { total: totalBeds - 6, occupied: occBeds - (isCritical ? 6 : 2) }
      },
      staff: {
        doctors: { total: 3, onDuty: isCritical ? 2 : 3, onLeave: isCritical ? 1 : 0 },
        nurses: { total: 6, onDuty: isCritical ? 5 : 6, onLeave: isCritical ? 1 : 0 },
        pharmacists: { total: 1, onDuty: 1, onLeave: 0 },
        paramedics: { total: 3, onDuty: 2, onLeave: 1 }
      },
      inventory
    });
  }

  return phcs;
}

// Master PHC list initialized with Chennai (180) + Coimbatore (45)
let allFacilities = [
  ...generateChennaiPHCs(),
  ...generateCoimbatorePHCs()
];

// Active Supply Requests Store (supports Doctor -> Supplier lifecycle)
let supplyRequests = [
  {
    id: "REQ-2026-001",
    clinicId: "CHE-042",
    clinicName: "Chennai PHC 042",
    city: "Chennai",
    zone: "Central Chennai",
    area: "Anna Nagar",
    chiefDoctor: "Dr. Priya Ramesh",
    medicineId: "MED-005",
    medicineName: "Insulin Glargine (100 IU/ml)",
    unit: "Cartridges (3ml)",
    currentStock: 20,
    requiredStock: 100,
    requestedQuantity: 80, // Additional Needed = 100 - 20 = 80
    priority: "CRITICAL",
    status: "REQUESTED", // REQUESTED -> ACCEPTED -> DISPATCHED -> DELIVERED
    reason: "Critical shortage: 20 current vs 100 required for 120 expected patients",
    requestDate: new Date(Date.now() - 3600000 * 2).toISOString(),
    statusHistory: [
      { status: "REQUESTED", timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), note: "Auto-generated from expected patient demand & confirmed by Dr. Priya" }
    ]
  },
  {
    id: "REQ-2026-002",
    clinicId: "CHE-042",
    clinicName: "Chennai PHC 042",
    city: "Chennai",
    zone: "Central Chennai",
    area: "Anna Nagar",
    chiefDoctor: "Dr. Priya Ramesh",
    medicineId: "MED-001",
    medicineName: "Paracetamol 650mg Tabs",
    unit: "Tablets",
    currentStock: 350,
    requiredStock: 500,
    requestedQuantity: 150, // Additional Needed = 500 - 350 = 150
    priority: "HIGH",
    status: "ACCEPTED",
    reason: "Stock shortage: 350 current vs 500 required for expected fever cases",
    requestDate: new Date(Date.now() - 3600000 * 5).toISOString(),
    statusHistory: [
      { status: "REQUESTED", timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), note: "Submitted by Chief Doctor" },
      { status: "ACCEPTED", timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), note: "Accepted by Central Medical Stores Depot" }
    ]
  },
  {
    id: "REQ-2026-003",
    clinicId: "CHE-007",
    clinicName: "Chennai PHC 007",
    city: "Chennai",
    zone: "South Chennai",
    area: "Mylapore",
    chiefDoctor: "Dr. K. Narayanan",
    medicineId: "MED-002",
    medicineName: "Amoxicillin + Clavulanic Acid 625mg",
    unit: "Strips (6s)",
    currentStock: 40,
    requiredStock: 180,
    requestedQuantity: 140,
    priority: "CRITICAL",
    status: "DISPATCHED",
    reason: "Respiratory cluster surge stock depletion",
    requestDate: new Date(Date.now() - 3600000 * 8).toISOString(),
    statusHistory: [
      { status: "REQUESTED", timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), note: "Stock requested" },
      { status: "ACCEPTED", timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), note: "Accepted by Depot" },
      { status: "DISPATCHED", timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), note: "Cold chain dispatch vehicle en-route" }
    ]
  },
  {
    id: "REQ-2026-004",
    clinicId: "CBE-008",
    clinicName: "Coimbatore PHC 008",
    city: "Coimbatore",
    zone: "Central Zone",
    area: "Gandhipuram",
    chiefDoctor: "Dr. S. Ramachandran",
    medicineId: "MED-003",
    medicineName: "Ceftriaxone 1g Injection",
    unit: "Vials",
    currentStock: 20,
    requiredStock: 100,
    requestedQuantity: 80,
    priority: "CRITICAL",
    status: "REQUESTED",
    reason: "Critical antibiotic requirement for inpatient care",
    requestDate: new Date(Date.now() - 3600000 * 1).toISOString(),
    statusHistory: [
      { status: "REQUESTED", timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), note: "Chief Doctor submitted request" }
    ]
  }
];

/**
 * Compute overall status of a PHC: CRITICAL, WARNING, NORMAL
 */
function getFacilityStatus(facility) {
  let hasCriticalItem = false;
  let hasWarningItem = false;
  let totalAdditionalNeeded = 0;
  const criticalItems = [];
  const warningItems = [];

  facility.inventory.forEach(inv => {
    const med = medicineCatalog.find(m => m.id === inv.medicineId) || { name: inv.medicineName || inv.medicineId, unit: inv.unit || "units" };
    const additional = Math.max(0, inv.requiredStock - inv.currentStock);
    totalAdditionalNeeded += additional;

    // Strict Requirement Comparison Rules:
    // 1. Current Stock <= 35% of Required Stock OR Critical threshold => CRITICAL
    // 2. Current Stock < Required Stock => WARNING
    // 3. Current Stock >= Required Stock => NORMAL
    if (inv.currentStock <= Math.max(5, inv.requiredStock * 0.35)) {
      hasCriticalItem = true;
      criticalItems.push({
        medicineId: inv.medicineId,
        medicineName: med.name,
        unit: med.unit,
        currentStock: inv.currentStock,
        requiredStock: inv.requiredStock,
        additionalRequired: additional,
        status: "CRITICAL"
      });
    } else if (inv.currentStock < inv.requiredStock) {
      hasWarningItem = true;
      warningItems.push({
        medicineId: inv.medicineId,
        medicineName: med.name,
        unit: med.unit,
        currentStock: inv.currentStock,
        requiredStock: inv.requiredStock,
        additionalRequired: additional,
        status: "WARNING"
      });
    }
  });

  const icuOcc = facility.beds.icu.total > 0 ? (facility.beds.icu.occupied / facility.beds.icu.total) * 100 : 0;
  const totalOcc = facility.beds.total > 0 ? (facility.beds.occupied / facility.beds.total) * 100 : 0;

  if (hasCriticalItem || icuOcc >= 92 || totalOcc >= 94) {
    return {
      status: "CRITICAL",
      color: "#ef4444",
      label: "Critical Shortage / Surge",
      criticalItems,
      warningItems,
      totalAdditionalNeeded
    };
  } else if (hasWarningItem || icuOcc >= 80 || totalOcc >= 80) {
    return {
      status: "WARNING",
      color: "#f59e0b",
      label: "Stock Deficit (Warning)",
      criticalItems,
      warningItems,
      totalAdditionalNeeded
    };
  }

  return {
    status: "NORMAL",
    color: "#10b981",
    label: "Sufficient Buffer",
    criticalItems: [],
    warningItems: [],
    totalAdditionalNeeded: 0
  };
}

/**
 * Handle Stock Request Lifecycle & Automated Inventory Update on Delivery
 */
function updateSupplyRequestStatus(requestId, newStatus, supplierNote = "") {
  const req = supplyRequests.find(r => r.id === requestId);
  if (!req) throw new Error("Request ID not found");

  req.status = newStatus;
  req.statusHistory.push({
    status: newStatus,
    timestamp: new Date().toISOString(),
    note: supplierNote || `Status updated to ${newStatus}`
  });

  // If status reaches DELIVERED, automatically replenish clinic stock!
  if (newStatus === "DELIVERED") {
    const clinic = allFacilities.find(f => f.id === req.clinicId);
    if (clinic) {
      const invItem = clinic.inventory.find(i => i.medicineId === req.medicineId);
      if (invItem) {
        invItem.currentStock += req.requestedQuantity;
        invItem.additionalRequired = Math.max(0, invItem.requiredStock - invItem.currentStock);
        invItem.status = invItem.currentStock >= invItem.requiredStock ? "NORMAL" : (invItem.currentStock <= invItem.requiredStock * 0.35 ? "CRITICAL" : "WARNING");
        invItem.lastRestocked = new Date().toISOString().split("T")[0];
      }
    }
  }

  return req;
}

function createSupplyRequest(requestData) {
  const { clinicId, medicineId, requestedQuantity, reason, chiefDoctor } = requestData;
  const clinic = allFacilities.find(f => f.id === clinicId);
  const med = medicineCatalog.find(m => m.id === medicineId);

  if (!clinic || !med) throw new Error("Invalid PHC or medicine specified");

  const invItem = clinic.inventory.find(i => i.medicineId === medicineId) || { currentStock: 0, requiredStock: 100 };
  const additionalNeeded = Math.max(0, invItem.requiredStock - invItem.currentStock);
  const qtyToRequest = parseInt(requestedQuantity, 10) || additionalNeeded || 100;

  const newReq = {
    id: `REQ-${Date.now().toString().slice(-5)}`,
    clinicId: clinic.id,
    clinicName: clinic.name,
    city: clinic.city,
    zone: clinic.zone,
    area: clinic.area,
    chiefDoctor: chiefDoctor || clinic.chiefDoctor,
    medicineId: med.id,
    medicineName: med.name,
    unit: med.unit,
    currentStock: invItem.currentStock,
    requiredStock: invItem.requiredStock,
    requestedQuantity: qtyToRequest,
    priority: invItem.currentStock <= Math.max(5, invItem.requiredStock * 0.35) ? "CRITICAL" : "HIGH",
    status: "REQUESTED",
    reason: reason || `Patient demand requirement: ${invItem.currentStock} current vs ${invItem.requiredStock} required (+${qtyToRequest} needed)`,
    requestDate: new Date().toISOString(),
    statusHistory: [
      { status: "REQUESTED", timestamp: new Date().toISOString(), note: "Submitted by Chief Doctor based on patient forecast" }
    ]
  };

  supplyRequests.unshift(newReq);
  return newReq;
}

module.exports = {
  medicineCatalog,
  facilities: allFacilities,
  supplyRequests,
  getFacilityStatus,
  updateSupplyRequestStatus,
  createSupplyRequest
};
