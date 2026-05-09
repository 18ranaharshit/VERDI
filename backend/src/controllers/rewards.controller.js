// Performance: Indexed query on category + isActive. Small document payload.
const asyncHandler = require('../middleware/asyncHandler');
const Reward = require('../models/Reward');

const getAllRewards = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  
  if (req.query.category) {
    filter.category = req.query.category;
  }

  // INDEX: { category: 1, isActive: 1 }
  const rewards = await Reward.find(filter)
    .select('key title description howToUse category creditCost icon validityHours isBikeUnlock')
    // Bike unlocks bubble to the top, followed by cost ascending
    .sort({ isBikeUnlock: -1, creditCost: 1 })
    .lean();

  return res.json({
    success: true,
    data: rewards,
  });
});

module.exports = { getAllRewards };
