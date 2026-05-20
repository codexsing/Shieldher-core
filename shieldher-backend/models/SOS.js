const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    lat:       { type: Number, required: true },
    lng:       { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const sosSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    trigger:   { type: String, enum: ["button", "shake", "voice", "auto"], default: "button" },
    status:    { type: String, enum: ["active", "resolved", "cancelled"], default: "active" },
    startLocation: locationSchema,
    locationHistory: [locationSchema],       // live GPS trail
    alertsSent: [
      {
        contactId: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
        name:      String,
        phone:     String,
        email:     String,
        sentAt:    { type: Date, default: Date.now },
        channels:  [{ type: String, enum: ["sms", "email", "socket"] }],
      },
    ],
    resolvedAt:  { type: Date },
    resolvedBy:  { type: String, enum: ["user", "admin", "auto"] },
    notes:       { type: String },
  },
  { timestamps: true }
);

sosSchema.index({ user: 1, status: 1 });
sosSchema.index({ createdAt: -1 });

module.exports = mongoose.model("SOS", sosSchema);
