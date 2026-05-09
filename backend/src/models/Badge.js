// Performance: Unique compound index on (userId, badgeKey) prevents duplicate badges
const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    badgeKey: {
      type: String,
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// INDEX: { userId: 1, badgeKey: 1 } - unique, prevents duplicate badge awards
badgeSchema.index({ userId: 1, badgeKey: 1 }, { unique: true });

module.exports = mongoose.model('Badge', badgeSchema);
