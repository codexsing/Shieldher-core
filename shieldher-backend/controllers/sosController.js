const SOS          = require("../models/SOS");
const Contact      = require("../models/Contact");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse  = require("../utils/apiResponse");
const { sendSOSAlerts }         = require("../services/alertService");
const { broadcastGPS, broadcastSOSTrigger, broadcastSOSResolved } = require("../services/socketService");

// POST /api/sos/trigger
exports.triggerSOS = asyncHandler(async (req, res) => {
  const { lat, lng, trigger = "button" } = req.body;
  const userId = req.user._id;

  // Check if there's already an active SOS
  const existing = await SOS.findOne({ user: userId, status: "active" });
  if (existing) {
    return ApiResponse.success(res, {
      message: "SOS already active.",
      data: { sosId: existing._id },
    });
  }

  // Create SOS event
  const sos = await SOS.create({
    user:          userId,
    trigger,
    status:        "active",
    startLocation: { lat, lng },
    locationHistory: [{ lat, lng }],
  });

  // Fetch trusted contacts
  const contacts = await Contact.find({ user: userId });

  // Alert all contacts — SMS + email + socket simultaneously
  const alertsSent = [];
  if (contacts.length) {
    await sendSOSAlerts({
      contacts: contacts.map((c) => ({ name: c.name, phone: c.phone, email: c.email })),
      userName: req.user.name,
      lat, lng,
      sosId: sos._id.toString(),
    });

    alertsSent.push(
      ...contacts.map((c) => ({
        contactId: c._id,
        name:      c.name,
        phone:     c.phone,
        email:     c.email,
        channels:  ["sms", "email", "socket"],
      }))
    );
  }

  sos.alertsSent = alertsSent;
  await sos.save();

  // Real-time broadcast to all guardians watching this user
  broadcastSOSTrigger(userId.toString(), {
    sosId:    sos._id,
    userName: req.user.name,
    lat, lng,
    trigger,
    timestamp: new Date(),
  });

  return ApiResponse.success(res, {
    statusCode: 201,
    message: "SOS triggered. Contacts alerted.",
    data: { sosId: sos._id, contactsAlerted: contacts.length },
  });
});

// POST /api/sos/:sosId/location — update live GPS
exports.updateLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  const { sosId }    = req.params;

  const sos = await SOS.findOne({ _id: sosId, user: req.user._id, status: "active" });
  if (!sos) return ApiResponse.error(res, { message: "Active SOS not found.", statusCode: 404 });

  sos.locationHistory.push({ lat, lng });
  await sos.save();

  // Update user's last known location
  req.user.lastLocation = { lat, lng, updatedAt: new Date() };
  await req.user.save({ validateBeforeSave: false });

  broadcastGPS(sosId, { lat, lng, timestamp: new Date() });

  return ApiResponse.success(res, { message: "Location updated." });
});

// PATCH /api/sos/:sosId/cancel
exports.cancelSOS = asyncHandler(async (req, res) => {
  const sos = await SOS.findOneAndUpdate(
    { _id: req.params.sosId, user: req.user._id, status: "active" },
    { status: "cancelled", resolvedAt: new Date(), resolvedBy: "user" },
    { new: true }
  );
  if (!sos) return ApiResponse.error(res, { message: "Active SOS not found.", statusCode: 404 });

  broadcastSOSResolved(req.params.sosId, "cancelled");
  return ApiResponse.success(res, { message: "SOS cancelled." });
});

// PATCH /api/sos/:sosId/resolve
exports.resolveSOS = asyncHandler(async (req, res) => {
  const sos = await SOS.findOneAndUpdate(
    { _id: req.params.sosId, user: req.user._id, status: "active" },
    { status: "resolved", resolvedAt: new Date(), resolvedBy: "user", notes: req.body.notes },
    { new: true }
  );
  if (!sos) return ApiResponse.error(res, { message: "Active SOS not found.", statusCode: 404 });

  broadcastSOSResolved(req.params.sosId, "resolved");
  return ApiResponse.success(res, { message: "SOS marked as resolved." });
});

// GET /api/sos/active
exports.getActiveSOS = asyncHandler(async (req, res) => {
  const sos = await SOS.findOne({ user: req.user._id, status: "active" });
  return ApiResponse.success(res, { data: sos });
});

// GET /api/sos/history
exports.getSOSHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip  = (page - 1) * limit;
  const total = await SOS.countDocuments({ user: req.user._id });
  const list  = await SOS.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return ApiResponse.paginated(res, { data: list, total, page, limit });
});
