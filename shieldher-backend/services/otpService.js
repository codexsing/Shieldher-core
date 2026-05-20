const crypto     = require("crypto");
const nodemailer = require("nodemailer");
const { Otp }    = require("../models/SafeZoneOtp");
const { otpEmail } = require("../utils/emailTemplates");
const logger     = require("../utils/logger");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const sendOtp = async (email, name) => {
  const otp       = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  // Invalidate any existing OTPs for this email
  await Otp.deleteMany({ email });
  await Otp.create({ email, otp, expiresAt });

  const { subject, html } = otpEmail({ name, otp });
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to: email, subject, html });
  logger.info(`OTP sent to ${email}`);
};

const verifyOtp = async (email, otp) => {
  const record = await Otp.findOne({ email, used: false });
  if (!record) return { valid: false, message: "No OTP found. Request a new one." };
  if (new Date() > record.expiresAt) return { valid: false, message: "OTP expired." };
  if (record.otp !== otp) return { valid: false, message: "Incorrect OTP." };
  record.used = true;
  await record.save();
  return { valid: true };
};

module.exports = { sendOtp, verifyOtp };
