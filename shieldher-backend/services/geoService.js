const { isInsideRadius, minDistanceToRoute } = require("../utils/distanceCalc");
const SafeZone = require("../models/SafeZoneOtp").SafeZone || require("../models/SafeZoneOtp");
const Zone     = require("../models/Zone");

/**
 * Check if a lat/lng is inside any of the user's safe zones.
 * Returns { inside: bool, zone: SafeZone | null }
 */
const checkSafeZones = async (userId, lat, lng) => {
  const zones = await SafeZone.find({ user: userId, isActive: true });
  for (const z of zones) {
    if (isInsideRadius(z.lat, z.lng, lat, lng, z.radiusKm)) {
      return { inside: true, zone: z };
    }
  }
  return { inside: false, zone: null };
};

/**
 * Check if a coordinate has deviated from a journey route.
 * Returns { deviated: bool, distanceKm: number }
 */
const checkRouteDeviation = (routePoints, lat, lng, thresholdKm = 0.3) => {
  const distanceKm = minDistanceToRoute(routePoints, lat, lng);
  return { deviated: distanceKm > thresholdKm, distanceKm };
};

/**
 * Get all danger zones within radiusKm of a point.
 */
const getNearbyDangerZones = async (lat, lng, radiusKm = 1) => {
  const zones = await Zone.find({ isActive: true });
  return zones.filter((z) => isInsideRadius(z.lat, z.lng, lat, lng, radiusKm));
};

/**
 * Aggregate heatmap data — returns array of { lat, lng, weight }
 */
const getHeatmapData = async () => {
  return Zone.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id:      { lat: "$lat", lng: "$lng" },
        weight:   { $sum: "$severity" },
        count:    { $sum: 1 },
        category: { $first: "$category" },
      },
    },
    {
      $project: {
        _id: 0,
        lat:      "$_id.lat",
        lng:      "$_id.lng",
        weight:   1,
        count:    1,
        category: 1,
      },
    },
  ]);
};

module.exports = { checkSafeZones, checkRouteDeviation, getNearbyDangerZones, getHeatmapData };
