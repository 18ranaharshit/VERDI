// Performance: Single Trip.find() call - all derived data computed from same in-memory array
const Trip = require('../models/Trip');
const User = require('../models/User');

exports.getPassport = async (req, res) => {
  try {
    const userId = req.user._id;

    // Step 1 - All user trips sorted by date (single query)
    // INDEX: { userId: 1, date: -1 }
    const trips = await Trip.find({ userId })
      .select('date carbonSaved carbonEmitted distance transportMode')
      .sort({ date: 1 })
      .lean();

    // Get user info
    const user = await User.findById(userId)
      .select('institution createdAt totalCreditsEarned')
      .lean();

    const now = new Date();

    // Step 2 - Activity grid (last 365 days)
    const dayMap = new Map();
    // Pre-fill all 365 days with 0
    for (let i = 364; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
      dayMap.set(key, 0);
    }
    // Fill in actual trip data
    for (const trip of trips) {
      const key = new Date(trip.date).toISOString().split('T')[0];
      if (dayMap.has(key)) {
        dayMap.set(key, dayMap.get(key) + (trip.carbonSaved || 0));
      }
    }
    const activityGrid = Array.from(dayMap.entries()).map(([date, carbonSaved]) => ({
      date,
      carbonSaved: Math.round(carbonSaved),
    }));

    // Step 3 - Weekly totals (last 12 weeks = 84 days)
    const weeklyMap = new Map();
    const twelveWeeksAgo = new Date(now);
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    for (const trip of trips) {
      const tripDate = new Date(trip.date);
      if (tripDate < twelveWeeksAgo) continue;

      // Get ISO week
      const d = new Date(tripDate);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
      const week1 = new Date(d.getFullYear(), 0, 4);
      const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
      const weekKey = `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;

      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, { carbonSaved: 0, trips: 0 });
      }
      const entry = weeklyMap.get(weekKey);
      entry.carbonSaved += trip.carbonSaved || 0;
      entry.trips += 1;
    }
    const weeklyTotals = Array.from(weeklyMap.entries())
      .map(([week, data]) => ({ week, carbonSaved: Math.round(data.carbonSaved), trips: data.trips }))
      .sort((a, b) => a.week.localeCompare(b.week));

    // Step 4 - Mode breakdown
    const modeMap = new Map();
    for (const trip of trips) {
      if (!modeMap.has(trip.transportMode)) {
        modeMap.set(trip.transportMode, { totalCarbonSaved: 0, tripCount: 0 });
      }
      const entry = modeMap.get(trip.transportMode);
      entry.totalCarbonSaved += trip.carbonSaved || 0;
      entry.tripCount += 1;
    }
    const modeBreakdown = Array.from(modeMap.entries())
      .map(([mode, data]) => ({
        mode,
        totalCarbonSaved: Math.round(data.totalCarbonSaved),
        tripCount: data.tripCount,
      }))
      .sort((a, b) => b.totalCarbonSaved - a.totalCarbonSaved);

    // Step 5 - Streak analysis
    const greenDates = new Set();
    for (const trip of trips) {
      if (trip.transportMode !== 'car') {
        greenDates.add(new Date(trip.date).toISOString().split('T')[0]);
      }
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate streaks from today backwards
    for (let i = 0; i <= 364; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (greenDates.has(key)) {
        tempStreak++;
        if (i === 0 || currentStreak > 0) currentStreak = tempStreak;
      } else {
        if (i === 0) currentStreak = 0; // No green trip today
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Step 6 - Projection
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    let last30Saved = 0;
    for (const trip of trips) {
      if (new Date(trip.date) >= thirtyDaysAgo) {
        last30Saved += trip.carbonSaved || 0;
      }
    }
    const avgDailySavings = last30Saved / 30;
    const projectedYearlySavings = Math.round(avgDailySavings * 365);

    const totalCarbonSaved = trips.reduce((sum, t) => sum + (t.carbonSaved || 0), 0);
    const milestoneTargets = [
      { label: '1 kg', targetGrams: 1000 },
      { label: '5 kg', targetGrams: 5000 },
      { label: '10 kg', targetGrams: 10000 },
      { label: '50 kg', targetGrams: 50000 },
    ];
    const milestones = milestoneTargets.map((m) => {
      const remaining = m.targetGrams - totalCarbonSaved;
      return {
        ...m,
        daysAway: remaining <= 0 ? 0 : avgDailySavings > 0 ? Math.ceil(remaining / avgDailySavings) : null,
      };
    });

    // Step 7 - Carbon Grade
    const totalGreenTrips = trips.filter((t) => t.transportMode !== 'car').length;
    const totalTrips = trips.length;
    const consistencyPct = (totalGreenTrips / Math.max(totalTrips, 1)) * 100;
    const totalSavedKg = totalCarbonSaved / 1000;

    let grade;
    if (consistencyPct >= 80 && totalSavedKg >= 5) grade = 'A+';
    else if (consistencyPct >= 65 && totalSavedKg >= 1) grade = 'A';
    else if (consistencyPct >= 45 || totalSavedKg >= 0.5) grade = 'B';
    else if (consistencyPct >= 20 || totalSavedKg >= 0.1) grade = 'C';
    else grade = 'D';

    // Step 8 - Percentile (if institution set)
    let percentile = null;
    let institutionAvg = null;

    if (user?.institution) {
      // Find all users at same institution
      const institutionUsers = await User.find({ institution: user.institution })
        .select('_id')
        .lean();

      if (institutionUsers.length > 1) {
        const userIds = institutionUsers.map((u) => u._id);

        // Aggregate carbon saved per user
        const userSavings = await Trip.aggregate([
          { $match: { userId: { $in: userIds } } },
          {
            $group: {
              _id: '$userId',
              totalSaved: { $sum: '$carbonSaved' },
            },
          },
          { $sort: { totalSaved: -1 } },
        ]);

        if (userSavings.length > 0) {
          const totalInstitutionSaved = userSavings.reduce((s, u) => s + u.totalSaved, 0);
          institutionAvg = Math.round(totalInstitutionSaved / userSavings.length);

          // Find user's rank
          const userRank = userSavings.findIndex((u) => u._id.toString() === userId.toString());
          if (userRank >= 0) {
            percentile = Math.round(((userSavings.length - userRank) / userSavings.length) * 100);
          }
        }
      }
    }

    // Step 9 - Summary
    const totalDistance = Math.round(trips.reduce((sum, t) => sum + (t.distance || 0), 0) * 10) / 10;
    const totalCarbonEmitted = Math.round(trips.reduce((sum, t) => sum + (t.carbonEmitted || 0), 0));

    const summary = {
      totalTrips,
      totalGreenTrips,
      totalCarbonSaved: Math.round(totalCarbonSaved),
      totalCarbonEmitted,
      totalDistance,
      totalCreditsEarned: user?.totalCreditsEarned || 0,
      memberSinceDate: user?.createdAt || now.toISOString(),
    };

    return res.json({
      success: true,
      data: {
        activityGrid,
        weeklyTotals,
        modeBreakdown,
        streaks: { currentStreak, longestStreak },
        projection: { avgDailySavings: Math.round(avgDailySavings), projectedYearlySavings, milestones },
        grade,
        percentile,
        institutionAvg,
        summary,
      },
    });
  } catch (err) {
    console.error('[Passport] Error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
