// ─────────────────────────────────────────────
// models/SafeZone.js
// ─────────────────────────────────────────────
const mongoose = require("mongoose");

const safeZoneSchema = new mongoose.Schema(
  {
    user:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    label:      { type: String, required: true, trim: true },   // "Home", "College", etc.
    lat:        { type: Number, required: true },
    lng:        { type: Number, required: true },
    radiusKm:   { type: Number, default: 0.1 },                 // 100m default
    isActive:   { type: Boolean, default: true },
    notifyOnExit: { type: Boolean, default: true },
    notifyOnEnter: { type: Boolean, default: false },
  },
  { timestamps: true }
);

safeZoneSchema.index({ user: 1 });

const SafeZone = mongoose.model("SafeZone", safeZoneSchema);

// ─────────────────────────────────────────────
// models/Otp.js
// ─────────────────────────────────────────────
const otpSchema = new mongoose.Schema(
  {
    email:     { type: String, required: true, lowercase: true },
    otp:       { type: String, required: true },
    expiresAt: { type: Date,   required: true },
    used:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model("Otp", otpSchema);

module.exports = { SafeZone, Otp };
