/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en kilomètres
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get user's current position using Geolocation API
 * @returns Promise with user's coordinates
 */
export function getUserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La géolocalisation n\'est pas supportée par votre navigateur'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Find nearest centre based on coordinates
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @param centres Array of centres with coordinates
 * @returns Nearest centre or null
 */
export function findNearestCentre<T extends { latitude: number | null; longitude: number | null }>(
  userLat: number,
  userLon: number,
  centres: T[]
): T | null {
  let nearestCentre: T | null = null;
  let minDistance = Infinity;

  for (const centre of centres) {
    if (centre.latitude !== null && centre.longitude !== null) {
      const distance = calculateDistance(userLat, userLon, centre.latitude, centre.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCentre = centre;
      }
    }
  }

  return nearestCentre;
}
