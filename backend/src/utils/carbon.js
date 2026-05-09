// Performance: Pure computation - no I/O. Keep in sync with frontend/src/utils/carbon.ts

const EMISSION_FACTORS = {
  car: 170,
  motorcycle: 103,
  bus: 89,
  electric_car: 50,
  cycling: 0,
  walking: 0,
};

const CAR_BASELINE = 170;

/**
 * Calculate CO2 emitted for a trip in grams.
 * @param {number} distanceKm - Distance in kilometers
 * @param {string} mode - Transport mode key
 * @returns {number} Grams of CO2 emitted
 */
function calculateCarbon(distanceKm, mode) {
  const factor = EMISSION_FACTORS[mode];
  if (factor === undefined) {
    throw new Error(`Unknown transport mode: ${mode}`);
  }
  return Math.round(distanceKm * factor);
}

/**
 * Calculate CO2 saved vs driving a car.
 * @param {number} distanceKm - Distance in kilometers
 * @param {string} mode - Transport mode key
 * @returns {number} Grams of CO2 saved vs car baseline
 */
function calculateSaved(distanceKm, mode) {
  const carEmission = distanceKm * CAR_BASELINE;
  const actualEmission = distanceKm * (EMISSION_FACTORS[mode] || 0);
  return Math.round(Math.max(0, carEmission - actualEmission));
}

/**
 * Convert grams of CO2 into human-relatable equivalents.
 * @param {number} grams - CO2 in grams
 * @returns {object} Human-readable equivalents
 */
function getEquivalents(grams) {
  return {
    phonesCharged: Math.round(grams / 8.22),
    treeHours: Math.round(grams / 21.77),
    drivingMeters: Math.round((grams / 170) * 1000),
    kettleBoils: Math.round(grams / 71),
  };
}

module.exports = {
  EMISSION_FACTORS,
  CAR_BASELINE,
  calculateCarbon,
  calculateSaved,
  getEquivalents,
};
