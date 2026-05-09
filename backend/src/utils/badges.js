// Performance: Evaluated after each trip save - queries are indexed on userId
const Badge = require('../models/Badge');
const Trip = require('../models/Trip');

const BADGE_DEFINITIONS = [
  {
    key: 'first_step',
    label: 'First Step',
    icon: '🌱',
    desc: 'Logged your first verdi trip',
    condition: (s) => s.totalTrips >= 1,
  },
  {
    key: 'green_week',
    label: 'Green Week',
    icon: '🗓️',
    desc: '7-day streak of verdi commutes',
    condition: (s) => s.streakDays >= 7,
  },
  {
    key: 'carbon_100',
    label: 'Century Saver',
    icon: '💚',
    desc: 'Saved 100g of CO2',
    condition: (s) => s.totalCarbonSaved >= 100,
  },
  {
    key: 'carbon_1kg',
    label: 'Kilo Hero',
    icon: '🏅',
    desc: 'Saved 1kg of CO2',
    condition: (s) => s.totalCarbonSaved >= 1000,
  },
  {
    key: 'carbon_10kg',
    label: 'Verdi Champion',
    icon: '🏆',
    desc: 'Saved 10kg of CO2',
    condition: (s) => s.totalCarbonSaved >= 10000,
  },
  {
    key: 'cyclist',
    label: 'Pedal Power',
    icon: '🚴',
    desc: 'Logged 10 cycling trips',
    condition: (s) => s.cyclingTrips >= 10,
  },
  {
    key: 'walker',
    label: 'Walkabout',
    icon: '🚶',
    desc: 'Walked 5 trips instead of driving',
    condition: (s) => s.walkingTrips >= 5,
  },
  {
    key: 'distance_50',
    label: 'Long Hauler',
    icon: '🛤️',
    desc: 'Logged 50km of green commutes total',
    condition: (s) => s.totalGreenDistance >= 50,
  },
];

/**
 * Calculate user stats needed for badge evaluation.
 * @param {string} userId - User's ObjectId
 * @returns {object} Stats object for badge condition checks
 */
async function getUserStats(userId) {
  // INDEX: { userId: 1, date: -1 }
  const trips = await Trip.find({ userId })
    .select('transportMode carbonSaved distance date')
    .sort({ date: -1 })
    .lean();

  const totalTrips = trips.length;
  const totalCarbonSaved = trips.reduce((sum, t) => sum + (t.carbonSaved || 0), 0);

  const cyclingTrips = trips.filter((t) => t.transportMode === 'cycling').length;
  const walkingTrips = trips.filter((t) => t.transportMode === 'walking').length;

  const greenModes = ['cycling', 'walking', 'bus', 'electric_car'];
  const totalGreenDistance = trips
    .filter((t) => greenModes.includes(t.transportMode))
    .reduce((sum, t) => sum + (t.distance || 0), 0);

  const streakDays = calculateStreak(trips);

  return {
    totalTrips,
    totalCarbonSaved,
    cyclingTrips,
    walkingTrips,
    totalGreenDistance,
    streakDays,
  };
}

/**
 * Calculate consecutive day streak of non-car trips.
 * @param {Array} trips - Sorted trips (newest first)
 * @returns {number} Number of consecutive days
 */
function calculateStreak(trips) {
  if (trips.length === 0) return 0;

  const nonCarTrips = trips.filter((t) => t.transportMode !== 'car' && t.transportMode !== 'motorcycle');
  if (nonCarTrips.length === 0) return 0;

  const uniqueDays = new Set();
  nonCarTrips.forEach((t) => {
    const day = new Date(t.date).toISOString().split('T')[0];
    uniqueDays.add(day);
  });

  const sortedDays = Array.from(uniqueDays).sort().reverse();
  if (sortedDays.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (sortedDays[0] !== today && sortedDays[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    const diffMs = prev.getTime() - curr.getTime();
    const diffDays = diffMs / 86400000;

    if (Math.abs(diffDays - 1) < 0.01) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Evaluate and award new badges for a user after a trip is logged.
 * @param {string} userId - User's ObjectId
 * @returns {Array} Array of newly earned badge documents
 */
async function evaluateBadges(userId) {
  const stats = await getUserStats(userId);

  // INDEX: { userId: 1, badgeKey: 1 }
  const existingBadges = await Badge.find({ userId })
    .select('badgeKey')
    .lean();

  const existingKeys = new Set(existingBadges.map((b) => b.badgeKey));
  const newBadges = [];

  for (const def of BADGE_DEFINITIONS) {
    if (existingKeys.has(def.key)) continue;

    if (def.condition(stats)) {
      const badge = await Badge.create({
        userId,
        badgeKey: def.key,
        earnedAt: new Date(),
      });

      newBadges.push({
        ...badge.toObject(),
        label: def.label,
        icon: def.icon,
        desc: def.desc,
      });
    }
  }

  return newBadges;
}

module.exports = {
  BADGE_DEFINITIONS,
  evaluateBadges,
  getUserStats,
  calculateStreak,
};
