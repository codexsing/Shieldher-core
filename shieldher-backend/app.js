const express      = require("express");
const cors         = require("cors");
const helmet       = require("helmet");
const morgan       = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const errorHandler = require("./middleware/errorHandler");
const { globalLimiter } = require("./middleware/rateLimiter");
const logger       = require("./utils/logger");

const app = express();

// ── Security headers ──────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────
// ── CORS ──────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://shieldher-core.vercel.app" // 👈 Yahan bina extra slash (/) ke copy-paste kar do
  ],
  credentials: true,
  methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Body parsers ──────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Mongo injection sanitize ──────────────────
app.use(mongoSanitize());

// ── HTTP logger ───────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev", { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

// ── Global rate limiter ───────────────────────
app.use("/api", globalLimiter);

// ── Health check ──────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

// ── API Routes ────────────────────────────────
app.use("/api/auth",      require("./routes/auth.routes"));
app.use("/api/users",     require("./routes/user.routes"));
app.use("/api/contacts",  require("./routes/contact.routes"));
app.use("/api/sos",       require("./routes/sos.routes"));
app.use("/api/journey",   require("./routes/journey.routes"));
app.use("/api/heatmap",   require("./routes/heatmap.routes"));
app.use("/api/evidence",  require("./routes/evidence.routes"));
app.use("/api/safezones", require("./routes/safezone.routes"));
app.use("/api/admin",     require("./routes/admin.routes"));

// ── 404 handler ───────────────────────────────
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global error handler ──────────────────────
app.use(errorHandler);

module.exports = app;
