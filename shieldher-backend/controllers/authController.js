// ─────────────────────────────────────────────
// controllers/authController.js
// ─────────────────────────────────────────────
const User          = require("../models/User");
const { Otp }       = require("../models/SafeZoneOtp");
const asyncHandler  = require("../utils/asyncHandler");
const ApiResponse   = require("../utils/apiResponse");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../services/tokenService");
const { sendOtp, verifyOtp } = require("../services/otpService");

// POST /api/auth/register
// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const exists = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (exists) {
    return ApiResponse.error(res, {
      message: "Email or phone already registered.",
      statusCode: 409
    });
  }

  const user = await User.create({
    name,
    email,
    phone,
    password
  });

  try {
    await sendOtp(email, name);
  } catch (err) {
    console.error("OTP SEND FAILED:", err);
  }

  return ApiResponse.success(res, {
    statusCode: 201,
    message: "Registration successful.",
    data: {
      userId: user._id,
      email: user.email
    }
  });
});

// POST /api/auth/verify-otp
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = await verifyOtp(email, otp);
  if (!result.valid) return ApiResponse.error(res, { message: result.message, statusCode: 400 });

  await User.findOneAndUpdate({ email }, { isVerified: true });
  return ApiResponse.success(res, { message: "Email verified successfully." });
});

// POST /api/auth/resend-otp
exports.resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return ApiResponse.error(res, { message: "No account with this email.", statusCode: 404 });
  await sendOtp(email, user.name);
  return ApiResponse.success(res, { message: "OTP resent." });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password +refreshToken");
  if (!user || !(await user.matchPassword(password))) {
    return ApiResponse.error(res, { message: "Invalid credentials.", statusCode: 401 });
  }
  if (!user.isVerified) {
    return ApiResponse.error(res, { message: "Please verify your email first.", statusCode: 403 });
  }

  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken  = refreshToken;
  await user.save({ validateBeforeSave: false });

  return ApiResponse.success(res, {
    message: "Login successful.",
    data: {
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar },
    },
  });
});

// POST /api/auth/refresh-token
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return ApiResponse.error(res, { message: "Refresh token required.", statusCode: 400 });

  const decoded = verifyRefreshToken(refreshToken);
  const user    = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== refreshToken) {
    return ApiResponse.error(res, { message: "Invalid refresh token.", statusCode: 401 });
  }

  const newAccess  = generateAccessToken(user._id);
  const newRefresh = generateRefreshToken(user._id);
  user.refreshToken = newRefresh;
  await user.save({ validateBeforeSave: false });

  return ApiResponse.success(res, { data: { accessToken: newAccess, refreshToken: newRefresh } });
});

// POST /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  return ApiResponse.success(res, { message: "Logged out." });
});
