const crypto = require("crypto");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const { Otp } = require("../models/SafeZoneOtp");
const { otpEmail } = require("../utils/emailTemplates");
const logger = require("../utils/logger");

const client = SibApiV3Sdk.ApiClient.instance;

client.authentications["api-key"].apiKey =
  process.env.BREVO_API_KEY;

const apiInstance =
  new SibApiV3Sdk.TransactionalEmailsApi();

console.log("BREVO API INITIALIZED");
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



  try {
    console.log("BEFORE SENDMAIL");
await apiInstance.sendTransacEmail({
  sender: {
    email: "st7879singh@gmail.com",
    name: "ShieldHer"
  },
  to: [
    {
      email
    }
  ],
  subject,
  htmlContent: html
});

console.log("MAIL SENT USING BREVO API");

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