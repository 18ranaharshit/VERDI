// Performance: All queries use compound indexes on (userId, date/-1), .select() projections, .lean()
const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const Trip = require('../models/Trip');
const { calculateCarbon, calculateSaved } = require('../utils/carbon');
const { evaluateBadges, getUserStats } = require('../utils/badges');
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const { calculateCreditsEarned } = require('../utils/credits');

const VALID_MODES = ['car', 'motorcycle', 'bus', 'cycling', 'walking', 'electric_car'];

const getTrips = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('mode').optional().isIn(VALID_MODES),
  query('sort').optional().isIn(['newest', 'savings', 'distance']),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
        code: 400,
      });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (req.query.mode) {
      filter.transportMode = req.query.mode;
    }

    let sortObj = { date: -1 };
    if (req.query.sort === 'savings') sortObj = { carbonSaved: -1 };
    if (req.query.sort === 'distance') sortObj = { distance: -1 };

    // INDEX: { userId: 1, date: -1 }
    const [trips, totalTrips] = await Promise.all([
      Trip.find(filter)
        .select('distance transportMode carbonEmitted carbonSaved origin destination date')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Trip.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalTrips / limit);

    return res.status(200).json({
      success: true,
      data: {
        trips,
        totalPages,
        totalTrips,
        currentPage: page,
      },
    });
  }),
];

const createTrip = [
  body('distance')
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Distance must be between 0.1 and 1000 km'),
  body('transportMode')
    .isIn(VALID_MODES)
    .withMessage(`Transport mode must be one of: ${VALID_MODES.join(', ')}`),
  body('origin')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Origin is required (max 200 characters)'),
  body('destination')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Destination is required (max 200 characters)'),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
        code: 400,
      });
    }

    const { distance, transportMode, origin, destination } = req.body;
    const carbonEmitted = calculateCarbon(distance, transportMode);
    const carbonSaved = calculateSaved(distance, transportMode);

    const trip = await Trip.create({
      userId: req.user._id,
      distance,
      transportMode,
      carbonEmitted,
      carbonSaved,
      origin,
      destination,
      date: new Date(),
    });

    const newBadges = await evaluateBadges(req.user._id);

    const creditsEarned = calculateCreditsEarned(carbonSaved);
    let currentBalance = 0;

    if (creditsEarned > 0) {
      // Atomic update to prevent race conditions
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          $inc: {
            creditBalance: creditsEarned,
            totalCreditsEarned: creditsEarned,
          },
        },
        { new: true }
      )
        .select('creditBalance totalCreditsEarned')
        .lean();

      currentBalance = updatedUser.creditBalance;

      // Create transaction record
      await CreditTransaction.create({
        userId: req.user._id,
        type: 'credit',
        amount: creditsEarned,
        balance: currentBalance,
        reason: `Green commute: ${trip.origin || 'Trip'} → ${trip.destination || 'Destination'}`,
        tripId: trip._id,
      });
    } else {
      const user = await User.findById(req.user._id).select('creditBalance').lean();
      currentBalance = user ? user.creditBalance : 0;
    }

    return res.status(201).json({
      success: true,
      data: {
        trip: {
          _id: trip._id,
          distance: trip.distance,
          transportMode: trip.transportMode,
          carbonEmitted: trip.carbonEmitted,
          carbonSaved: trip.carbonSaved,
          origin: trip.origin,
          destination: trip.destination,
          date: trip.date,
        },
        newBadges,
        creditsEarned,
        currentBalance,
      },
      message: `Trip logged! ${carbonSaved > 0 ? `You saved ${carbonSaved}g of CO2` : ''}`,
    });
  }),
];

const getTripStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // INDEX: { userId: 1, date: -1 }
  const trips = await Trip.find({ userId })
    .select('transportMode carbonEmitted carbonSaved distance date')
    .sort({ date: -1 })
    .lean();

  const totalTrips = trips.length;
  const totalCarbonSaved = trips.reduce((sum, t) => sum + t.carbonSaved, 0);
  const totalCarbonEmitted = trips.reduce((sum, t) => sum + t.carbonEmitted, 0);

  const greenModes = ['cycling', 'walking', 'bus', 'electric_car'];
  const totalDistanceGreen = trips
    .filter((t) => greenModes.includes(t.transportMode))
    .reduce((sum, t) => sum + t.distance, 0);

  const stats = await getUserStats(userId);

  const modeCounts = {};
  trips.forEach((t) => {
    modeCounts[t.transportMode] = (modeCounts[t.transportMode] || 0) + 1;
  });
  const favoriteMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0];

  const co2ByMode = {};
  trips.forEach((t) => {
    co2ByMode[t.transportMode] = (co2ByMode[t.transportMode] || 0) + t.carbonEmitted;
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const tripsOverTime = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().split('T')[0];

    const dayTrips = trips.filter((t) => {
      const tripDay = new Date(t.date).toISOString().split('T')[0];
      return tripDay === dayStr;
    });

    tripsOverTime.push({
      date: dayStr,
      carbonSaved: dayTrips.reduce((sum, t) => sum + t.carbonSaved, 0),
      carbonEmitted: dayTrips.reduce((sum, t) => sum + t.carbonEmitted, 0),
      tripCount: dayTrips.length,
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      totalTrips,
      totalCarbonSaved,
      totalCarbonEmitted,
      totalDistanceGreen: Math.round(totalDistanceGreen * 10) / 10,
      streakDays: stats.streakDays,
      favoriteMode: favoriteMode ? favoriteMode[0] : null,
      co2ByMode,
      tripsOverTime,
    },
  });
});

const deleteTrip = [
  param('id').isMongoId().withMessage('Invalid trip ID'),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
        code: 400,
      });
    }

    // INDEX: { _id: 1 } - default primary key + userId ownership check
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found or unauthorized',
        code: 404,
      });
    }

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Trip deleted',
    });
  }),
];

module.exports = { getTrips, createTrip, getTripStats, deleteTrip };
