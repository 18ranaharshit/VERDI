// Performance: N/A - route definitions with auth + rate limiting middleware
const express = require('express');
const { isAuthenticated } = require('../middleware/auth.middleware');
const { tripLimiter, generalLimiter } = require('../middleware/rateLimit');
const {
  getTrips,
  createTrip,
  getTripStats,
  deleteTrip,
} = require('../controllers/trip.controller');

const router = express.Router();

// GET /api/trips - User trip history (paginated)
router.get('/', isAuthenticated, getTrips);

// GET /api/trips/stats - Aggregated stats
router.get('/stats', isAuthenticated, getTripStats);

// POST /api/trips - Log a new trip
router.post('/', isAuthenticated, tripLimiter, createTrip);

// DELETE /api/trips/:id - Delete a trip
router.delete('/:id', isAuthenticated, generalLimiter, deleteTrip);

module.exports = router;
