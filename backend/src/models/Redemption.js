// Performance: Indexed on (userId, status), (userId, expiresAt), (voucherCode unique), (expiresAt) for expiry job
const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rewardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward',
      required: true,
    },
    voucherCode: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired'],
      default: 'active',
    },
    redeemedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    creditsCost: {
      type: Number,
      required: true,
    },
    rewardSnapshot: {
      title: String,
      description: String,
      howToUse: String,
      icon: String,
      isBikeUnlock: Boolean,
    },
  },
  { timestamps: true }
);

redemptionSchema.index({ userId: 1, status: 1 });
redemptionSchema.index({ userId: 1, expiresAt: -1 });
redemptionSchema.index({ voucherCode: 1 }, { unique: true });
redemptionSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Redemption', redemptionSchema);
