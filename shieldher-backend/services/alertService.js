const nodemailer  = require("nodemailer");
const twilioClient = require("../config/twilio");
const { sosAlertEmail, journeyMissedCheckinEmail } = require("../utils/emailTemplates");
const logger      = require("../utils/logger");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

/**
 * Send SOS alert to a list of contacts via SMS + email simultaneously.
 * contacts: [{ name, phone, email }]
 */
const sendSOSAlerts = async ({ contacts, userName, lat, lng, sosId }) => {
  // ✅ URL encode karo yahan
  const coords = `${parseFloat(lat).toFixed(6)},${parseFloat(lng).toFixed(6)}`;
  const locationUrl = `https://www.google.com/maps?q=${encodeURIComponent(coords)}`;

  const results = await Promise.allSettled(
    contacts.flatMap(({ name, phone, email }) => [
      twilioClient.messages.create({
        // ✅ locationUrl use karo
        body: `SOS ALERT: ${userName} needs help! Location: ${locationUrl}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone.startsWith("+") ? phone : `+91${phone}`,
      }),
      (async () => {
        const { subject, html } = sosAlertEmail({ guardianName: name, userName, lat, lng, sosId });
        await transporter.sendMail({ from: process.env.EMAIL_FROM, to: email, subject, html });
      })(),
    ])
  );

  results.forEach((r, i) => {
    if (r.status === "rejected") logger.error(`Alert failed [${i}]: ${r.reason}`);
  });

  logger.info(`SOS alerts sent to ${contacts.length} contacts for SOS ${sosId}`);
};

const sendMissedCheckinAlerts = async ({ contacts, userName, journeyId, lastLat, lastLng }) => {
  // ✅ URL encode karo yahan bhi
  const coords = `${parseFloat(lastLat).toFixed(6)},${parseFloat(lastLng).toFixed(6)}`;
  const locationUrl = `https://www.google.com/maps?q=${encodeURIComponent(coords)}`;

  console.log("MAPS URL:", locationUrl); // test ke liye — baad mein hata dena

  await Promise.allSettled(
    contacts.map(async ({ name, email, phone }) => {
      const { subject, html } = journeyMissedCheckinEmail({
        guardianName: name,
        userName,
        journeyId,
        lastLat,
        lastLng,
      });

      await transporter.sendMail({ from: process.env.EMAIL_FROM, to: email, subject, html });

      await twilioClient.messages.create({
        // ✅ locationUrl use karo
        body: `${userName} missed journey check-in! Location: ${locationUrl}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone.startsWith("+") ? phone : `+91${phone}`,
      });
    })
  );

  logger.info(`Missed check-in alerts sent for journey ${journeyId}`);
};
/**
 * Send missed check-in warning.
 */

module.exports = { sendSOSAlerts, sendMissedCheckinAlerts };
