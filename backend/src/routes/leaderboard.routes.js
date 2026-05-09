// Performance: N/A - single route with auth middleware
const express = require('express');
const { isAuthenticated } = require('../middleware/auth.middleware');
const { getLeaderboard } = require('../controllers/leaderboard.controller');

const router = express.Router();

// GET /api/leaderboard - Top 20 users by cumulative carbon saved
router.get('/', isAuthenticated, getLeaderboard);

module.exports = router;
