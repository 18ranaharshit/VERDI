// Performance: MongoDB aggregation pipeline - indexed on userId for $group stage
const { query, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const Trip = require('../models/Trip');
const User = require('../models/User');

const getLeaderboard = [
  query('institution').optional().trim().isLength({ max: 100 }),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
        code: 400,
      });
    }

    // INDEX: { userId: 1 } - aggregation groups by userId
    const pipeline = [
      {
        $group: {
          _id: '$userId',
          totalCarbonSaved: { $sum: '$carbonSaved' },
          totalTrips: { $sum: 1 },
        },
      },
      { $sort: { totalCarbonSaved: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          displayName: '$user.displayName',
          avatar: '$user.avatar',
          institution: '$user.institution',
          totalCarbonSaved: 1,
          totalTrips: 1,
        },
      },
    ];

    let results = await Trip.aggregate(pipeline);

    if (req.query.institution) {
      results = results.filter(
        (r) => r.institution && r.institution.toLowerCase().includes(req.query.institution.toLowerCase())
      );
    }

    const leaderboard = results.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      displayName: entry.displayName,
      avatar: entry.avatar,
      institution: entry.institution || '',
      totalCarbonSaved: Math.round(entry.totalCarbonSaved / 10) / 100,
      totalCarbonSavedGrams: entry.totalCarbonSaved,
      totalTrips: entry.totalTrips,
      isCurrentUser: entry.userId.toString() === req.user._id.toString(),
    }));

    return res.status(200).json({
      success: true,
      data: leaderboard,
    });
  }),
];

module.exports = { getLeaderboard };
