// ─────────────────────────────────────────────
// routes/auth.routes.js
// ─────────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const { register, login, verifyEmail, resendOtp, refreshToken, logout } = require("../controllers/authController");
const { protect }    = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/register",    authLimiter, register);
router.post("/verify-otp",  authLimiter, verifyEmail);
router.post("/resend-otp",  authLimiter, resendOtp);
router.post("/login",       authLimiter, login);
router.post("/refresh-token",            refreshToken);
router.post("/logout",      protect,     logout);

module.exports = router;
