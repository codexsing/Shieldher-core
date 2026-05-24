const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Otp } = require("../models/SafeZoneOtp");
const { otpEmail } = require("../utils/emailTemplates");
const logger = require("../utils/logger");
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const generateOtp = () =>
  crypto.randomInt(100000, 999999).toString();

const sendOtp = async (email, name) => {
  const otp = generateOtp();

  const expiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );

  await Otp.deleteMany({ email });

  await Otp.create({
    email,
    otp,
    expiresAt
  });

  const { subject, html } = otpEmail({
    name,
    otp
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    console.log("MAIL SENT:", info.response);

    logger.info(`OTP sent to ${email}`);
  } catch (err) {
    console.log("MAIL ERROR:", err);
  }
};

module.exports = { sendOtp };