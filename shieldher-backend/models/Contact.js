const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    user:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:         { type: String, required: true, trim: true },
    phone:        { type: String, required: true, trim: true },
    email:        { type: String, required: true, lowercase: true, trim: true },
    relationship: { type: String, trim: true, default: "Guardian" },
    isVerified:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Max 5 contacts per user (enforced in controller)
contactSchema.index({ user: 1 });

module.exports = mongoose.model("Contact", contactSchema);
