// ─────────────────────────────────────────────
// routes/user.routes.js
// ─────────────────────────────────────────────
const express = require("express");
const r = express.Router();
const { getProfile, updateProfile, updatePassword, deleteAccount } = require("../controllers/allControllers");
const { protect } = require("../middleware/authMiddleware");

r.use(protect);
r.get("/me",              getProfile);
r.put("/me",              updateProfile);
r.patch("/me/password",   updatePassword);
r.delete("/me",           deleteAccount);

module.exports = r;

// ─────────────────────────────────────────────
// (Save above to routes/user.routes.js)
// Below files should each be their own file.
// They are combined here for readability.
// ─────────────────────────────────────────────
