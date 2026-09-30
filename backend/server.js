const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/apiRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "*"],
  credentials: true
}));
app.use(express.json());

// Request logger for hackathon demo transparency
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "National Healthcare Federated AI Platform Backend",
    version: "2.4.0",
    timestamp: new Date().toISOString()
  });
});

// Mount Main API Routes
app.use("/api", apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({ success: false, error: "Internal Server Error", message: err.message });
});

app.listen(PORT, () => {
  console.log("=================================================================");
  console.log(`🚀 Smart Health AI Backend running on http://localhost:${PORT}`);
  console.log(`📡 REST API Endpoints active at http://localhost:${PORT}/api`);
  console.log(`🔒 Privacy-Preserving Federated Engine Initialized (FedAvg)`);
  console.log("=================================================================");
});
