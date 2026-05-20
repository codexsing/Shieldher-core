const sosAlertEmail = ({ guardianName, userName, lat, lng, sosId }) => ({
  subject: `🚨 SOS ALERT — ${userName} needs help NOW`,
  html: `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0d0b14;color:#e8e6f0;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#7c5cdb,#9b7ff5);padding:28px 32px">
        <h1 style="margin:0;font-size:24px;color:#fff">🛡️ ShieldHer — Emergency Alert</h1>
      </div>
      <div style="padding:32px">
        <p style="font-size:16px;color:#e05c6a;font-weight:bold">⚠️ URGENT: ${userName} has triggered an SOS alert</p>
        <p>Hi <strong>${guardianName}</strong>,</p>
        <p><strong>${userName}</strong> has activated an emergency SOS on ShieldHer. Please check on them immediately.</p>
        <div style="background:#1a1730;border:1px solid #3d2a7c;border-radius:12px;padding:20px;margin:20px 0">
          <p style="margin:0 0 8px"><strong>📍 Last known location:</strong></p>
          <p style="margin:0;color:#9b7ff5">Lat: ${lat} | Lng: ${lng}</p>
          <a href="https://maps.google.com/?q=${lat},${lng}" style="display:inline-block;margin-top:12px;background:#7c5cdb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold">
            Open on Google Maps
          </a>
        </div>
        <p style="font-size:12px;color:#8c86a8">SOS ID: ${sosId} | Sent by ShieldHer Safety Platform</p>
      </div>
    </div>
  `,
});

const otpEmail = ({ name, otp }) => ({
  subject: `${otp} — Your ShieldHer verification code`,
  html: `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0d0b14;color:#e8e6f0;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#7c5cdb,#9b7ff5);padding:24px 32px">
        <h1 style="margin:0;font-size:20px;color:#fff">🛡️ ShieldHer</h1>
      </div>
      <div style="padding:32px">
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your verification code is:</p>
        <div style="background:#1a1730;border:1px solid #3d2a7c;border-radius:12px;padding:24px;text-align:center;margin:20px 0">
          <span style="font-size:40px;font-weight:bold;letter-spacing:12px;color:#9b7ff5">${otp}</span>
        </div>
        <p style="font-size:13px;color:#8c86a8">This code expires in <strong>10 minutes</strong>. Never share it with anyone.</p>
      </div>
    </div>
  `,
});

const journeyMissedCheckinEmail = ({ guardianName, userName, journeyId, lastLat, lastLng }) => ({
  subject: `⚠️ ${userName} missed a journey check-in`,
  html: `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0d0b14;color:#e8e6f0;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#c4a000,#e0b800);padding:24px 32px">
        <h1 style="margin:0;font-size:20px;color:#fff">⚠️ Missed Check-in Alert</h1>
      </div>
      <div style="padding:32px">
        <p>Hi <strong>${guardianName}</strong>,</p>
        <p><strong>${userName}</strong> did not check in at their expected destination on time.</p>
        <div style="background:#1a1730;border:1px solid #5a4400;border-radius:12px;padding:20px;margin:20px 0">
          <p style="margin:0 0 8px"><strong>📍 Last known location:</strong></p>
          <a href="https://maps.google.com/?q=${lastLat},${lastLng}" style="display:inline-block;margin-top:8px;background:#c4a000;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold">
            View on Map
          </a>
        </div>
        <p style="font-size:12px;color:#8c86a8">Journey ID: ${journeyId}</p>
      </div>
    </div>
  `,
});

module.exports = { sosAlertEmail, otpEmail, journeyMissedCheckinEmail };
