// routes/safezone.routes.js
const express = require("express");
const r = express.Router();
const { addSafeZone, getSafeZones, deleteSafeZone, checkLocation } = require("../controllers/allControllers");
const { protect } = require("../middleware/authMiddleware");
r.use(protect);
r.route("/").get(getSafeZones).post(addSafeZone);
r.delete("/:id",    deleteSafeZone);
r.get("/check",     checkLocation);
module.exports = r;
