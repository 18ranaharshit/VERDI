// Performance: Compound indexes on (userId, date) and (userId, createdAt) for paginated user queries
const mongoose = require('mongoose');

const TRANSPORT_MODES = ['car', 'motorcycle', 'bus', 'cycling', 'walking', 'electric_car'];

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    distance: {
      type: Number,
      required: true,
      min: 0.1,
    },
    transportMode: {
      type: String,
      enum: TRANSPORT_MODES,
      required: true,
    },
    carbonEmitted: {
      type: Number,
      required: true,
    },
    carbonSaved: {
      type: Number,
      required: true,
    },
    origin: {
      type: String,
      required: true,
      maxlength: 200,
    },
    destination: {
      type: String,
      required: true,
      maxlength: 200,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// INDEX: { userId: 1, date: -1 } - paginated trip history sorted by date
tripSchema.index({ userId: 1, date: -1 });

// INDEX: { userId: 1, createdAt: -1 } - alternative sort for recent trips
tripSchema.index({ userId: 1, createdAt: -1 });

// INDEX: { userId: 1, transportMode: 1 } - mode-filtered queries
tripSchema.index({ userId: 1, transportMode: 1 });

module.exports = mongoose.model('Trip', tripSchema);
