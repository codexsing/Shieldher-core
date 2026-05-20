const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema(
  {
    user:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sos:           { type: mongoose.Schema.Types.ObjectId, ref: "SOS" },
    type:          { type: String, enum: ["audio", "video", "image"], required: true },
    cloudinaryId:  { type: String, required: true },
    url:           { type: String, required: true },
    duration:      { type: Number },         // seconds (audio/video)
    size:          { type: Number },         // bytes
    location: {
      lat: Number,
      lng: Number,
    },
    isAutoCapture: { type: Boolean, default: false },  // true = captured during SOS
  },
  { timestamps: true }
);

evidenceSchema.index({ user: 1, createdAt: -1 });
evidenceSchema.index({ sos: 1 });

module.exports = mongoose.model("Evidence", evidenceSchema);
