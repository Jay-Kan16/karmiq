/**
 * Google Maps Navigation and Routing Utilities for KarmiK
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface CustomerLocationInfo {
  lat?: number;
  lng?: number;
  address?: string;
}

/**
 * Extract latitude, longitude, and formatted address from a booking object.
 * Supports GeoJSON Point ([lng, lat]) as well as standard lat/lng object properties.
 */
export function getCustomerCoordinates(b: any): CustomerLocationInfo {
  if (!b) return {};

  const loc = b.location;
  let lat: number | undefined;
  let lng: number | undefined;

  // 1. GeoJSON format: coordinates: [longitude, latitude]
  if (loc?.coordinates && Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
    const rawLng = Number(loc.coordinates[0]);
    const rawLat = Number(loc.coordinates[1]);
    if (!isNaN(rawLat) && !isNaN(rawLng) && (rawLat !== 0 || rawLng !== 0)) {
      lat = rawLat;
      lng = rawLng;
    }
  }

  // 2. Fallback to direct lat/lng on location object
  if (lat === undefined && loc?.lat != null && loc?.lng != null) {
    const rawLat = Number(loc.lat);
    const rawLng = Number(loc.lng);
    if (!isNaN(rawLat) && !isNaN(rawLng) && (rawLat !== 0 || rawLng !== 0)) {
      lat = rawLat;
      lng = rawLng;
    }
  }

  // 3. Fallback to customer's saved address
  const address = loc?.address || b.customerId?.address || "";

  return { lat, lng, address };
}

/**
 * Build the universal Google Maps directions URL to navigate to the customer.
 * Uses travelmode=driving. Cross-platform compatible with mobile apps and web.
 */
export function getGoogleMapsDirectionsUrl(
  booking: any,
  originCoord?: LatLng | null
): string {
  const { lat, lng, address } = getCustomerCoordinates(booking);

  let destination = "";
  if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
    destination = `${lat},${lng}`;
  } else if (address) {
    destination = encodeURIComponent(address);
  }

  if (!destination) {
    return "https://www.google.com/maps";
  }

  let url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;

  if (
    originCoord &&
    typeof originCoord.lat === "number" &&
    typeof originCoord.lng === "number" &&
    !isNaN(originCoord.lat) &&
    !isNaN(originCoord.lng) &&
    (originCoord.lat !== 0 || originCoord.lng !== 0)
  ) {
    url += `&origin=${originCoord.lat},${originCoord.lng}`;
  }

  return url;
}

/**
 * Open the Google Maps route in a new tab/app immediately.
 * Opening synchronously during a user click event avoids browser popup blockers.
 */
export function openGoogleMapsRoute(
  booking: any,
  originCoord?: LatLng | null
): Window | null {
  const url = getGoogleMapsDirectionsUrl(booking, originCoord);
  return window.open(url, "_blank", "noopener,noreferrer");
}
