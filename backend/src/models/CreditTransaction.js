// Performance: Indexed on (userId, createdAt) for paginated wallet history feed
const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    balance: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },
    redemptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Redemption',
      default: null,
    },
  },
  { timestamps: true }
);

creditTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('CreditTransaction', creditTransactionSchema);
