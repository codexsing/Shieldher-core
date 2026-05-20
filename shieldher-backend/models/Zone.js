const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema(
  {
    reportedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lat:         { type: Number, required: true },
    lng:         { type: Number, required: true },
    description: { type: String, maxlength: 300 },
    category:    {
      type: String,
      enum: ["harassment", "poor_lighting", "unsafe_area", "stalking", "other"],
      default: "other",
    },
    severity:   { type: Number, min: 1, max: 5, default: 3 },
    upvotes:    { type: Number, default: 0 },
    isActive:   { type: Boolean, default: true },
    expiresAt:  { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // 30 days
  },
  { timestamps: true }
);

// 2dsphere index for geo queries
zoneSchema.index({ lat: 1, lng: 1 });
zoneSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL auto-delete

module.exports = mongoose.model("Zone", zoneSchema);
