const crypto = require("crypto");
const nodemailer = require("nodemailer");
const dns = require("dns");

const { Otp } = require("../models/SafeZoneOtp");
const { otpEmail } = require("../utils/emailTemplates");
const logger = require("../utils/logger");

console.log("================================");
console.log("OTP SERVICE LOADED");
console.log("================================");

console.log("EMAIL_HOST =", process.env.EMAIL_HOST);
console.log("EMAIL_PORT =", process.env.EMAIL_PORT);
console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS EXISTS =", !!process.env.EMAIL_PASS);

dns.lookup("smtp-relay.brevo.com", (err, address) => {
  console.log("================================");
  console.log("DNS RESULT");
  console.log("ERROR =", err);
  console.log("ADDRESS =", address);
  console.log("================================");
});

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  logger: true,
  debug: true
});

(async () => {
  try {
    console.log("================================");
    console.log("CHECKING SMTP CONNECTION...");
    console.log("================================");

    await transporter.verify();

    console.log("================================");
    console.log("SMTP READY");
    console.log("================================");
  } catch (err) {
    console.log("================================");
    console.log("SMTP VERIFY FAILED");
    console.log(err);
    console.log("================================");
  }
})();
const generateOtp = () =>
  crypto.randomInt(100000, 999999).toString();

const sendOtp = async (email, name) => {
  console.log("SEND OTP CALLED:", email);

  const otp = generateOtp();

  console.log("OTP GENERATED:", otp);

  const expiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );

  await Otp.deleteMany({ email });

  await Otp.create({
    email,
    otp,
    expiresAt
  });

  console.log("OTP SAVED IN DB");

  const { subject, html } = otpEmail({
    name,
    otp
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject,
    html
  };

  try {
    console.log("BEFORE SENDMAIL");

    const info = await transporter.sendMail(mailOptions);

    console.log("AFTER SENDMAIL");
    console.log("MAIL SENT:", info.response);

    logger.info(`OTP sent to ${email}`);

    return true;
  } catch (err) {
    console.log("MAIL ERROR:", err);
    throw err;
  }
};

const verifyOtp = async (email, otp) => {
  const record = await Otp.findOne({
    email,
    used: false
  });

  if (!record) {
    return {
      valid: false,
      message: "No OTP found"
    };
  }

  if (new Date() > record.expiresAt) {
    return {
      valid: false,
      message: "OTP expired"
    };
  }

  if (record.otp !== otp) {
    return {
      valid: false,
      message: "Incorrect OTP"
    };
  }

  record.used = true;
  await record.save();

  return {
    valid: true
  };
};

module.exports = {
  sendOtp,
  verifyOtp
};