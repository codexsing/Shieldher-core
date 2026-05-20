const mongoose = require("mongoose");

const waypointSchema = new mongoose.Schema(
  { lat: Number, lng: Number },
  { _id: false }
);

const journeySchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title:       { type: String, default: "My Journey" },
    status:      { type: String, enum: ["active", "completed", "overdue", "sos_triggered"], default: "active" },
    origin:      waypointSchema,
    destination: waypointSchema,
    routePoints: [waypointSchema],           // planned route polyline
    liveTrail:   [
      {
        lat:       Number,
        lng:       Number,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    expectedArrival:  { type: Date, required: true },
    checkedInAt:      { type: Date },
    deviationAlert:   { type: Boolean, default: false },
    deviationThresholdKm: { type: Number, default: 0.3 },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contact" }],
  },
  { timestamps: true }
);

journeySchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("Journey", journeySchema);
