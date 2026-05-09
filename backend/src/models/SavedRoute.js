// Performance: Indexed on { userId: 1, createdAt: -1 } for sorted user route listing
const mongoose = require('mongoose');

const savedRouteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 60,
    },
    originText: {
      type: String,
      required: true,
    },
    destText: {
      type: String,
      required: true,
    },
    originCoords: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    destCoords: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

// INDEX: { userId: 1, createdAt: -1 } - user's saved routes sorted by newest
savedRouteSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SavedRoute', savedRouteSchema);
