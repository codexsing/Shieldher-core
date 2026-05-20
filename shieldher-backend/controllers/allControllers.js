// =========================================================================
// ─── MODEL IMPORT CONTROLS ───────────────────────────────────────────────
// =========================================================================
const User         = require("../models/User");
const SOS          = require("../models/SOS");
const Zone         = require("../models/Zone");
const Contact      = require("../models/Contact");
const Journey      = require("../models/Journey");
const Evidence     = require("../models/Evidence");
const { SafeZone } = require("../models/SafeZoneOtp");

// ─── THIRD PARTY CONFIGS & SERVICES ──────────────────────────────────────
const cloudinary   = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse  = require("../utils/apiResponse");
const { 
  getHeatmapData, 
  getNearbyDangerZones, 
  checkSafeZones 
} = require("../services/geoService");


// =========================================================================
// ─── CONTACT CONTROLLER ──────────────────────────────────────────────────
// =========================================================================
exports.addContact = asyncHandler(async (req, res) => {
  const count = await Contact.countDocuments({ user: req.user._id });
  if (count >= 5) {
    return ApiResponse.error(res, { 
      message: "Maximum 5 trusted contacts allowed.", 
      statusCode: 400 
    });
  }

  const { name, phone, email, relationship } = req.body;
  const contact = await Contact.create({ 
    user: req.user._id, 
    name, 
    phone, 
    email, 
    relationship 
  });
  
  return ApiResponse.success(res, { 
    statusCode: 201, 
    message: "Contact added.", 
    data: contact 
  });
});

exports.getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({ user: req.user._id });
  return ApiResponse.success(res, { data: contacts });
});

exports.updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!contact) {
    return ApiResponse.error(res, { 
      message: "Contact not found.", 
      statusCode: 404 
    });
  }
  return ApiResponse.success(res, { message: "Contact updated.", data: contact });
});

exports.deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOneAndDelete({ 
    _id: req.params.id, 
    user: req.user._id 
  });
  if (!contact) {
    return ApiResponse.error(res, { 
      message: "Contact not found.", 
      statusCode: 404 
    });
  }
  return ApiResponse.success(res, { message: "Contact deleted." });
});


// =========================================================================
// ─── HEATMAP CONTROLLER ──────────────────────────────────────────────────
// =========================================================================
exports.reportZone = asyncHandler(async (req, res) => {
  console.log("USER:", req.user);
  console.log("BODY:", req.body);
  const { lat, lng, description, category, severity } = req.body;
  
  const zone = await Zone.create({ 
    reportedBy: req.user._id, 
    lat, 
    lng, 
    description, 
    category, 
    severity 
  });
  
  return ApiResponse.success(res, { 
    statusCode: 201, 
    message: "Danger zone reported. Thank you.", 
    data: zone 
  });
});

exports.getHeatmap = asyncHandler(async (req, res) => {
  const data = await getHeatmapData();
  return ApiResponse.success(res, { data });
});

exports.getNearby = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 1 } = req.query;
  const zones = await getNearbyDangerZones(Number(lat), Number(lng), Number(radius));
  return ApiResponse.success(res, { data: zones });
});

exports.upvoteZone = asyncHandler(async (req, res) => {
  const zone = await Zone.findByIdAndUpdate(
    req.params.id, 
    { $inc: { upvotes: 1 } }, 
    { new: true }
  );
  if (!zone) {
    return ApiResponse.error(res, { 
      message: "Zone not found.", 
      statusCode: 404 
    });
  }
  return ApiResponse.success(res, { data: zone });
});


// =========================================================================
// ─── EVIDENCE CONTROLLER ─────────────────────────────────────────────────
// =========================================================================
exports.uploadEvidence = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return ApiResponse.error(res, {
        message: "No file uploaded.",
        statusCode: 400,
      });
    }

    const { sosId, lat, lng } = req.body;
    const base64 = req.file.buffer.toString("base64");

    const uploadResult = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64}`,
      {
        folder: "shieldher/evidence",
        resource_type: "image",
      }
    );

    const evidence = await Evidence.create({
      user: req.user._id,
      sos: sosId || undefined,
      type: "image",
      cloudinaryId: uploadResult.public_id,
      url: uploadResult.secure_url,
      size: req.file.size,
      location: lat && lng
        ? {
            lat: Number(lat),
            lng: Number(lng),
          }
        : undefined,
      isAutoCapture: !!sosId,
    });

    return ApiResponse.success(res, {
      statusCode: 201,
      message: "Evidence uploaded successfully.",
      data: evidence,
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

exports.getMyEvidence = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  
  const total = await Evidence.countDocuments({ user: req.user._id });
  const list = await Evidence.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
    
  return ApiResponse.paginated(res, { data: list, total, page, limit });
});

exports.deleteEvidence = asyncHandler(async (req, res) => {
  const evidence = await Evidence.findOne({ _id: req.params.id, user: req.user._id });
  if (!evidence) {
    return ApiResponse.error(res, { 
      message: "Evidence not found.", 
      statusCode: 404 
    });
  }
  
  await cloudinary.uploader.destroy(evidence.cloudinaryId, { 
    resource_type: evidence.type === "image" ? "image" : "video" 
  });
  
  await evidence.deleteOne();
  return ApiResponse.success(res, { message: "Evidence deleted." });
});


// =========================================================================
// ─── SAFEZONE CONTROLLER ─────────────────────────────────────────────────
// =========================================================================
exports.addSafeZone = asyncHandler(async (req, res) => {
  const { label, lat, lng, radiusKm, notifyOnExit, notifyOnEnter } = req.body;
  const zone = await SafeZone.create({ 
    user: req.user._id, 
    label, 
    lat, 
    lng, 
    radiusKm, 
    notifyOnExit, 
    notifyOnEnter 
  });
  
  return ApiResponse.success(res, { 
    statusCode: 201, 
    message: "Safe zone added.", 
    data: zone 
  });
});

exports.getSafeZones = asyncHandler(async (req, res) => {
  const zones = await SafeZone.find({ user: req.user._id, isActive: true });
  return ApiResponse.success(res, { data: zones });
});

exports.deleteSafeZone = asyncHandler(async (req, res) => {
  const zone = await SafeZone.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!zone) {
    return ApiResponse.error(res, { 
      message: "Safe zone not found.", 
      statusCode: 404 
    });
  }
  return ApiResponse.success(res, { message: "Safe zone deleted." });
});

exports.checkLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  const result = await checkSafeZones(req.user._id, Number(lat), Number(lng));
  return ApiResponse.success(res, { data: result });
});


// =========================================================================
// ─── USER CONTROLLER ─────────────────────────────────────────────────────
// =========================================================================
exports.getProfile = asyncHandler(async (req, res) =>
  ApiResponse.success(res, { data: req.user })
);

exports.updateProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "phone", "avatar"];
  const updates = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  return ApiResponse.success(res, { message: "Profile updated.", data: user });
});

exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  
  if (!(await user.matchPassword(currentPassword))) {
    return ApiResponse.error(res, { 
      message: "Current password is incorrect.", 
      statusCode: 400 
    });
  }
  
  user.password = newPassword;
  await user.save();
  return ApiResponse.success(res, { message: "Password updated." });
});

exports.deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false });
  return ApiResponse.success(res, { message: "Account deactivated." });
});


// =========================================================================
// ─── ADMIN CONTROLLER (FULLY UPDATED WITH EVIDENCE AGGREGATION) ──────────
// =========================================================================
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalSOS, activeSOS, totalJourneys, totalZones] = await Promise.all([
    User.countDocuments({ role: "user" }),
    SOS.countDocuments(),
    SOS.countDocuments({ status: "active" }),
    Journey.countDocuments(),
    Zone.countDocuments({ isActive: true }),
  ]);
  return ApiResponse.success(res, { data: { totalUsers, totalSOS, activeSOS, totalJourneys, totalZones } });
});

// 🔥 CORE BUG FIX: Users ke sath unke dynamic contacts aur evidences ka real count aggregate karna
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip  = (page - 1) * limit;
  
  // Total users counter
  const total = await User.countDocuments();
  
  // 1. Fetch registered users as plain JSON objects using .lean()
  const users = await User.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean(); // 👈 YEH SABSE CRITICAL HAI, iske bina custom keys destroy ho jati hain

  // 2. ⚡ REAL-TIME COUNT AGGREGATION: Har user ke dynamic contacts aur files count karo
  const enhancedUsers = await Promise.all(
    users.map(async (user) => {
      // Direct database count aggregates
      const contactsCount = await Contact.countDocuments({ user: user._id });
      const evidenceCount = await Evidence.countDocuments({ user: user._id });

      return {
        ...user, // Plain object copy
        trustedContactsCount: contactsCount, // 👈 Frontend ko real count milega
        uploadedEvidencesCount: evidenceCount // 👈 Frontend ko real count milega
      };
    })
  );

  return ApiResponse.paginated(res, { data: enhancedUsers, total, page, limit });
});
// ⚡ BUG RESOLVED: Maps database entries from Evidence Schema inside matching active loops
exports.getAllSOS = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = status ? { status } : {};
  const skip   = (page - 1) * limit;
  
  // Total alerts logs count
  const total  = await SOS.countDocuments(filter);
  
  // 1. Fetch filtered paginated SOS records
  const list   = await SOS.find(filter)
    .populate("user", "name email phone")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // 2. Aggregate evidence photos synced via active sos identifiers
  const enhancedList = await Promise.all(
    list.map(async (sos) => {
      // Find matching uploads inside 'Evidence' model referencing this sos identifier
      const linkedEvidences = await Evidence.find({ sos: sos._id });

      // Return unified runtime collection block mappings
      return {
        ...sos.toObject(),
        evidences: linkedEvidences || [] // Feeds directly inside AdminSOS frontend UI arrays
      };
    })
  );

  return ApiResponse.paginated(res, { data: enhancedList, total, page, limit });
});

exports.resolveSOSAdmin = asyncHandler(async (req, res) => {
  const sos = await SOS.findByIdAndUpdate(
    req.params.sosId,
    { status: "resolved", resolvedAt: new Date(), resolvedBy: "admin" },
    { new: true }
  );
  if (!sos) {
    return ApiResponse.error(res, { 
      message: "SOS not found.", 
      statusCode: 404 
    });
  }
  return ApiResponse.success(res, { message: "SOS resolved by admin.", data: sos });
});