export interface WorkerFareEstimate {
  fare: number;
  fareMin: number;
  fareMax: number;
  experienceBonus: number;
  ratingBonus: number;
  rateTier: "Standard" | "Experienced Pro" | "Master Specialist";
}

/**
 * Calculates a fair, transparent cooperative fare based on:
 * - Base starting price for the service category
 * - Worker experience (bonus for years of field expertise)
 * - Worker rating (quality incentive for high customer satisfaction)
 * - Optional emergency surcharge
 */
export function calculateWorkerFare(
  basePrice: number,
  worker: { experience: number; rating: number; emergency?: boolean }
): WorkerFareEstimate {
  // Experience bonus: ~₹15 per year above baseline 3 years
  const experienceBonus = Math.max(0, Math.round((worker.experience - 3) * 15));

  // Rating bonus: incentive for verified high quality (4.5 to 5.0)
  // 4.5 -> ~₹15, 4.6 -> ~₹30, 4.7 -> ~₹45, 4.8 -> ~₹65, 4.9 -> ~₹80, 5.0 -> ~₹95
  const ratingBonus = Math.max(0, Math.round((worker.rating - 4.4) * 160));

  // Emergency surcharge if urgent dispatch
  const emergencySurcharge = worker.emergency ? 60 : 0;

  // Total base worker fare, rounded to nearest ₹10
  const rawFare = basePrice + experienceBonus + ratingBonus + emergencySurcharge;
  const fare = Math.round(rawFare / 10) * 10;

  // Estimated task range (minor adjustment vs comprehensive task)
  const fareMin = Math.round((fare - 35) / 10) * 10;
  const fareMax = Math.round((fare + 55) / 10) * 10;

  let rateTier: "Standard" | "Experienced Pro" | "Master Specialist" = "Standard";
  if (worker.experience >= 8 && worker.rating >= 4.8) {
    rateTier = "Master Specialist";
  } else if (worker.experience >= 6 || worker.rating >= 4.7) {
    rateTier = "Experienced Pro";
  }

  return {
    fare,
    fareMin,
    fareMax,
    experienceBonus,
    ratingBonus,
    rateTier
  };
}

