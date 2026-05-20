// middleware/authMiddleware.js

const jwt    = require("jsonwebtoken");
const User   = require("../models/User");
const ApiResponse = require("../utils/apiResponse");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // 🔍 DEBUG LOG 1: Check karo backend tak header pahunch bhi raha hai ya nahi
    console.log("=== BACKEND AUTH DEBUG ===");
    console.log("Received Auth Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ Error: Bearer prefix missing or Header is empty");
      return ApiResponse.error(res, { message: "Not authorised. No token.", statusCode: 401 });
    }

    const token = authHeader.split(" ")[1];
    
    // 🔍 DEBUG LOG 2: Check karo token extracted sahi se hua
    console.log("Extracted Token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 🔍 DEBUG LOG 3: Check karo decode hone ke baad kya data mila
    console.log("Decoded Token Data:", decoded);

    const user = await User.findById(decoded.id).select("-password -refreshToken");
    
    if (!user) {
      console.log("❌ Error: User ID found in token but NOT found in MongoDB database");
      return ApiResponse.error(res, { message: "User not found or deactivated.", statusCode: 401 });
    }
    
    if (!user.isActive) {
      console.log("❌ Error: User account is marked as isActive: false");
      return ApiResponse.error(res, { message: "User not found or deactivated.", statusCode: 401 });
    }

    console.log("✅ Token verified successfully for User:", user.name);
    req.user = user;
    next();
  } catch (err) {
    // 🔍 DEBUG LOG 4: Agar JWT crash hua toh error catch karega
    console.log("❌ JWT Verification Failed Error:", err.message);
    return ApiResponse.error(res, { message: "Invalid or expired token.", statusCode: 401 });
  }
};

const adminOnly = (req, res, next) => {
  // 🔍 DEBUG LOG 5: Check karo role kya hai user ka
  console.log("Checking Admin Access for user role:", req.user?.role);
  
  if (req.user?.role !== "admin") {
    console.log("❌ Error: Access denied. User role is NOT admin");
    return ApiResponse.error(res, { message: "Admin access required.", statusCode: 403 });
  }
  
  console.log("✅ Admin access granted!");
  next();
};

module.exports = { protect, adminOnly };