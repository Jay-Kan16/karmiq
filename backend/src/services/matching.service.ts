import Worker from "../models/Worker.js";
import "../models/User.js";

import type {Document} from "mongoose";

function score(w: any, d: number) {
  return Math.round(
    40 +
    Math.max(0, 20 - d * 4) +
    15 +
    (w.rating || 0) * 2 +
    Math.min(10, w.experience || 0) +
    Math.max(0, 5 - (w.workload || 0) / 20) +
    (w.verificationStatus === "VERIFIED" ? 20 : 5)
  );
}

export async function findBestWorker(serviceName: string, lat: number, lng: number, includeOfflineForScheduled: boolean = false) {
  // Find online workers with matching skill who are not rejected (VERIFIED or PENDING)
  let candidates = await Worker.find({
    skills: { $regex: new RegExp(`^${serviceName}$`, "i") },
    availability: "online",
    verificationStatus: { $ne: "REJECTED" }
  }).populate("userId", "name phone email");

  if (!candidates.length && includeOfflineForScheduled) {
    // For scheduled bookings, if no online worker is available right now, match from qualified workers
    candidates = await Worker.find({
      skills: { $regex: new RegExp(`^${serviceName}$`, "i") },
      verificationStatus: { $ne: "REJECTED" }
    }).populate("userId", "name phone email");
  }

  if (!candidates.length) return null;

  const ranked = candidates.map(w => {
    let d = 2.0; // default 2km fallback if GPS location has not yet synced
    if (w.currentLocation?.coordinates && w.currentLocation.coordinates.length === 2) {
      const [wlng, wlat] = w.currentLocation.coordinates;
      const R = 6371;
      const dLat = (wlat - lat) * Math.PI / 180;
      const dLng = (wlng - lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * Math.PI / 180) * Math.cos(wlat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
      d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    return {
      w,
      d: Number(d.toFixed(2)),
      matchScore: score(w, d),
      eta: Math.max(2, Math.round(d * 4))
    };
  }).sort((a, b) => b.matchScore - a.matchScore || a.d - b.d);

  return ranked[0] || null;
}

