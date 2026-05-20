// ─────────────────────────────────────────────
// services/socketService.js
// ─────────────────────────────────────────────
const { getIO }      = require("../config/socket");
const logger         = require("../utils/logger");

/**
 * Broadcast live GPS update to all guardians in a SOS room.
 * roomId = "sos:<sosId>"
 */
const broadcastGPS = (sosId, locationData) => {
  try {
    getIO().to(`sos:${sosId}`).emit("sos:gps_update", locationData);
  } catch (err) {
    logger.error(`broadcastGPS error: ${err.message}`);
  }
};

/**
 * Broadcast SOS trigger event to all contacts in user room.
 * roomId = "user:<userId>"
 */
const broadcastSOSTrigger = (userId, payload) => {
  try {
    getIO().to(`user:${userId}`).emit("sos:triggered", payload);
  } catch (err) {
    logger.error(`broadcastSOSTrigger error: ${err.message}`);
  }
};

/**
 * Broadcast SOS resolved/cancelled.
 */
const broadcastSOSResolved = (sosId, status) => {
  try {
    getIO().to(`sos:${sosId}`).emit("sos:resolved", { sosId, status });
  } catch (err) {
    logger.error(`broadcastSOSResolved error: ${err.message}`);
  }
};

/**
 * Notify guardian of journey deviation.
 */
const broadcastJourneyDeviation = (userId, journeyData) => {
  try {
    getIO().to(`user:${userId}`).emit("journey:deviation", journeyData);
  } catch (err) {
    logger.error(`broadcastJourneyDeviation error: ${err.message}`);
  }
};

module.exports = { broadcastGPS, broadcastSOSTrigger, broadcastSOSResolved, broadcastJourneyDeviation };
