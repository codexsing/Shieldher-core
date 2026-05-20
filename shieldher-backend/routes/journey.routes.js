// routes/journey.routes.js
const express = require("express");
const r = express.Router();
const { startJourney, pingLocation, checkIn, endJourney, getActiveJourney, getJourneyHistory } = require("../controllers/journeyController");
const { protect } = require("../middleware/authMiddleware");
r.use(protect);
r.post("/start",                    startJourney);
r.post("/:journeyId/ping",          pingLocation);
r.post("/:journeyId/checkin",       checkIn);
r.patch("/:journeyId/end",          endJourney);
r.get("/active",                    getActiveJourney);
r.get("/history",                   getJourneyHistory);
module.exports = r;
