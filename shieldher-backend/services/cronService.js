const cron    = require("node-cron");
const Journey = require("../models/Journey");
const Contact = require("../models/Contact");
const User    = require("../models/User");
const { sendMissedCheckinAlerts } = require("./alertService");
const logger  = require("../utils/logger");

/**
 * Every 2 minutes — check for overdue journeys and alert contacts.
 */
const startJourneyCronJob = () => {
  cron.schedule("*/2 * * * *", async () => {
    try {
      const now = new Date();
      const overdueJourneys = await Journey.find({
        status:          "active",
        expectedArrival: { $lt: now },
        checkedInAt:     { $exists: false },
      }).populate("user");

      for (const journey of overdueJourneys) {
        journey.status = "overdue";
        await journey.save();

        const contacts = await Contact.find({ user: journey.user._id });
        if (!contacts.length) continue;

        const lastPoint = journey.liveTrail[journey.liveTrail.length - 1];
        await sendMissedCheckinAlerts({
          contacts,
          userName:  journey.user.name,
          journeyId: journey._id.toString(),
          lastLat:   lastPoint?.lat || journey.origin.lat,
          lastLng:   lastPoint?.lng || journey.origin.lng,
        });

        logger.info(`Overdue journey handled: ${journey._id}`);
      }
    } catch (err) {
      logger.error(`Journey cron error: ${err.message}`);
    }
  });

  logger.info("Journey cron job started (every 2 minutes)");
};

/**
 * Daily midnight — deactivate expired danger zones.
 */
const startZoneCleanupCron = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const Zone = require("../models/Zone");
      const result = await Zone.updateMany(
        { expiresAt: { $lt: new Date() }, isActive: true },
        { isActive: false }
      );
      logger.info(`Zone cleanup: ${result.modifiedCount} zones deactivated`);
    } catch (err) {
      logger.error(`Zone cleanup cron error: ${err.message}`);
    }
  });
  logger.info("Zone cleanup cron started (daily at midnight)");
};

const startAllCrons = () => {
  startJourneyCronJob();
  startZoneCleanupCron();
};

module.exports = { startAllCrons };
