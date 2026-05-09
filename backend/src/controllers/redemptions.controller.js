// Performance: Atomic updates and robust validation for redemptions
const { body, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const Reward = require('../models/Reward');
const Redemption = require('../models/Redemption');
const CreditTransaction = require('../models/CreditTransaction');
const { generateVoucherCode } = require('../utils/credits');
const { expireVouchers } = require('../utils/expireVouchers');

const redeemReward = [
  body('rewardId').isMongoId().withMessage('Valid rewardId is required'),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { rewardId } = req.body;
    const userId = req.user._id;

    // 1. Fetch the reward
    const reward = await Reward.findById(rewardId).lean();
    if (!reward || !reward.isActive) {
      return res.status(400).json({ success: false, error: 'Reward not found or inactive' });
    }

    // 2. ATOMIC credit deduction (prevents overdraft)
    // Find user who has AT LEAST the required credit cost, and deduct it atomically.
    const user = await User.findOneAndUpdate(
      { _id: userId, creditBalance: { $gte: reward.creditCost } },
      { $inc: { creditBalance: -reward.creditCost } },
      { new: true } // return updated doc
    ).select('creditBalance').lean();

    if (!user) {
      return res.status(400).json({ success: false, error: 'Insufficient credits' });
    }

    // 3. Generate voucher code
    // A production system might use a loop with a unique index catch,
    // but generateVoucherCode is highly random. We will rely on it.
    const voucherCode = generateVoucherCode();

    // 4. Calculate expiresAt
    const expiresAt = new Date(Date.now() + reward.validityHours * 60 * 60 * 1000);

    // 5. Create Redemption
    const redemption = await Redemption.create({
      userId,
      rewardId: reward._id,
      voucherCode,
      expiresAt,
      creditsCost: reward.creditCost,
      rewardSnapshot: {
        title: reward.title,
        description: reward.description,
        howToUse: reward.howToUse,
        icon: reward.icon,
        isBikeUnlock: reward.isBikeUnlock,
      },
    });

    // 6. Create Transaction
    await CreditTransaction.create({
      userId,
      type: 'debit',
      amount: reward.creditCost,
      balance: user.creditBalance,
      reason: `Redeemed: ${reward.title}`,
      redemptionId: redemption._id,
    });

    return res.status(201).json({
      success: true,
      data: {
        redemption,
        reward,
        newBalance: user.creditBalance,
      },
    });
  }),
];

const getHistory = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('status').optional().isIn(['active', 'expired']),

  asyncHandler(async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 15;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // INDEX: { userId: 1, expiresAt: -1 } OR { userId: 1, status: 1 }
    const [redemptions, totalCount] = await Promise.all([
      Redemption.find(filter)
        .sort({ redeemedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Redemption.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: {
        redemptions,
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  }),
];

const getActive = asyncHandler(async (req, res) => {
  // Guarantee fresh status before returning
  await expireVouchers();

  // INDEX: { userId: 1, status: 1 }
  const activeRedemptions = await Redemption.find({
    userId: req.user._id,
    status: 'active',
  })
    .sort({ expiresAt: 1 }) // Soonest to expire first
    .lean();

  return res.json({
    success: true,
    data: activeRedemptions,
  });
});

module.exports = { redeemReward, getHistory, getActive };
