// Performance: Uses .select() + .lean() on all queries; indexed on userId
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const Badge = require('../models/Badge');
const { BADGE_DEFINITIONS } = require('../utils/badges');

const updateProfile = [
  body('institution')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Institution must be 1-100 characters'),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
        code: 400,
      });
    }

    // INDEX: { _id: 1 } - default primary key
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { institution: req.body.institution },
      { new: true }
    )
      .select('googleId email displayName avatar institution createdAt lastLogin')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 404,
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated',
    });
  }),
];

const getUserBadges = asyncHandler(async (req, res) => {
  // INDEX: { userId: 1, badgeKey: 1 }
  const earnedBadges = await Badge.find({ userId: req.user._id })
    .select('badgeKey earnedAt')
    .lean();

  const earnedKeys = new Set(earnedBadges.map((b) => b.badgeKey));

  const allBadges = BADGE_DEFINITIONS.map((def) => {
    const earned = earnedBadges.find((b) => b.badgeKey === def.key);
    return {
      key: def.key,
      label: def.label,
      icon: def.icon,
      desc: def.desc,
      earned: earnedKeys.has(def.key),
      earnedAt: earned ? earned.earnedAt : null,
    };
  });

  return res.status(200).json({
    success: true,
    data: allBadges,
  });
});

module.exports = { updateProfile, getUserBadges };
