const EARTH_RADIUS_KM = 6371;

/**
 * Haversine formula — returns distance in kilometres between two lat/lng points.
 */
const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

/**
 * Returns true if point is within radiusKm of center.
 */
const isInsideRadius = (centerLat, centerLng, pointLat, pointLng, radiusKm) =>
  getDistanceKm(centerLat, centerLng, pointLat, pointLng) <= radiusKm;

/**
 * Checks if a user has deviated significantly from a polyline route.
 * routePoints: [{ lat, lng }]
 * Returns minimum distance to any point on the route (km).
 */
const minDistanceToRoute = (routePoints, currentLat, currentLng) => {
  if (!routePoints || routePoints.length === 0) return Infinity;
  return Math.min(
    ...routePoints.map(({ lat, lng }) =>
      getDistanceKm(lat, lng, currentLat, currentLng)
    )
  );
};

module.exports = { getDistanceKm, isInsideRadius, minDistanceToRoute };
