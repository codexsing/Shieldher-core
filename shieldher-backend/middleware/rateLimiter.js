// ─────────────────────────────────────────────
// middleware/rateLimiter.js
// ─────────────────────────────────────────────
const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  // 🔽 Isko testing ke liye 1000 ya 2000 kar do taaki development me bar-bar block na ho
  max:      Number(process.env.RATE_LIMIT_MAX) || 1000, 
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many auth attempts. Try after 15 minutes." },
});

const sosLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: "SOS rate limit hit. Please wait." },
});

module.exports = { globalLimiter, authLimiter, sosLimiter };
