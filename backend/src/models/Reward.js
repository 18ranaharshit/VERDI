// Performance: Indexed on (category, isActive) for filtered reward catalog queries
const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    howToUse: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['food', 'study', 'transport', 'store'],
      required: true,
    },
    creditCost: {
      type: Number,
      required: true,
      min: 1,
    },
    icon: {
      type: String,
      required: true,
    },
    validityHours: {
      type: Number,
      required: true,
    },
    isBikeUnlock: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

rewardSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Reward', rewardSchema);
