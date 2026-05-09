// Performance: Indexed on googleId for OAuth lookups; .lean() + .select() enforced at query sites
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    institution: {
      type: String,
      default: '',
    },
    creditBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCreditsEarned: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// INDEX: { googleId: 1 } - unique, used by Passport deserialize + findOrCreate
userSchema.index({ googleId: 1 });

module.exports = mongoose.model('User', userSchema);
