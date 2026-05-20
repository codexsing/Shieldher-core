const Journey    = require("../models/Journey");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse  = require("../utils/apiResponse");
const { checkRouteDeviation } = require("../services/geoService");
const { broadcastJourneyDeviation } = require("../services/socketService");

// POST /api/journey/start
exports.startJourney = asyncHandler(async (req, res) => {
  const { title, origin, destination, routePoints, expectedArrival, sharedWith } = req.body;

  const journey = await Journey.create({
    user: req.user._id,
    title: title || "My Journey",
    origin,
    destination,
    routePoints: routePoints || [],
    expectedArrival: new Date(expectedArrival),
    sharedWith: sharedWith || [],
    liveTrail: [{ lat: origin.lat, lng: origin.lng }],
  });

  return ApiResponse.success(res, {
    statusCode: 201,
    message: "Journey started.",
    data: journey,
  });
});

// POST /api/journey/:journeyId/ping — live location update
exports.pingLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  const journey = await Journey.findOne({ _id: req.params.journeyId, user: req.user._id, status: "active" });
  if (!journey) return ApiResponse.error(res, { message: "Journey not found.", statusCode: 404 });

  journey.liveTrail.push({ lat, lng });

  // Check deviation
  if (journey.routePoints.length > 0) {
    const { deviated, distanceKm } = checkRouteDeviation(journey.routePoints, lat, lng, journey.deviationThresholdKm);
    if (deviated && !journey.deviationAlert) {
      journey.deviationAlert = true;
      broadcastJourneyDeviation(req.user._id.toString(), {
        journeyId:   journey._id,
        distanceKm,
        currentLat:  lat,
        currentLng:  lng,
        message:     `${req.user.name} has deviated ${distanceKm.toFixed(2)}km from planned route`,
      });
    }
  }

  await journey.save();
  return ApiResponse.success(res, { message: "Location pinged." });
});

// POST /api/journey/:journeyId/checkin
exports.checkIn = asyncHandler(async (req, res) => {
  const journey = await Journey.findOneAndUpdate(
    { _id: req.params.journeyId, user: req.user._id, status: { $in: ["active", "overdue"] } },
    { checkedInAt: new Date(), status: "completed" },
    { new: true }
  );
  if (!journey) return ApiResponse.error(res, { message: "Journey not found.", statusCode: 404 });
  return ApiResponse.success(res, { message: "Checked in. Journey marked complete.", data: journey });
});

// PATCH /api/journey/:journeyId/end
exports.endJourney = asyncHandler(async (req, res) => {
  const journey = await Journey.findOneAndUpdate(
    { _id: req.params.journeyId, user: req.user._id, status: "active" },
    { status: "completed" },
    { new: true }
  );
  if (!journey) return ApiResponse.error(res, { message: "Journey not found.", statusCode: 404 });
  return ApiResponse.success(res, { message: "Journey ended.", data: journey });
});

// GET /api/journey/active
exports.getActiveJourney = asyncHandler(async (req, res) => {
  const journey = await Journey.findOne({ user: req.user._id, status: "active" }).populate("sharedWith", "name phone email");
  return ApiResponse.success(res, { data: journey });
});

// GET /api/journey/history
exports.getJourneyHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip  = (page - 1) * limit;
  const total = await Journey.countDocuments({ user: req.user._id });
  const list  = await Journey.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  return ApiResponse.paginated(res, { data: list, total, page, limit });
});
