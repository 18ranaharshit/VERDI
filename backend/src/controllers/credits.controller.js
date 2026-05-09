// Performance: Indexed queries on User and CreditTransaction
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');

const getBalance = asyncHandler(async (req, res) => {
  // INDEX: { _id: 1 }
  const user = await User.findById(req.user._id)
    .select('creditBalance totalCreditsEarned')
    .lean();

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const totalSpent = user.totalCreditsEarned - user.creditBalance;

  return res.json({
    success: true,
    data: {
      balance: user.creditBalance,
      totalEarned: user.totalCreditsEarned,
      totalSpent,
    },
  });
});

const getTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const skip = (page - 1) * limit;

  // INDEX: { userId: 1, createdAt: -1 }
  const [transactions, totalCount] = await Promise.all([
    CreditTransaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CreditTransaction.countDocuments({ userId: req.user._id }),
  ]);

  return res.json({
    success: true,
    data: {
      transactions,
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
});

module.exports = { getBalance, getTransactions };
