// Performance: N/A - simple route definitions with auth middleware
const express = require('express');
const { isAuthenticated } = require('../middleware/auth.middleware');
const { generalLimiter } = require('../middleware/rateLimit');
const { updateProfile, getUserBadges } = require('../controllers/user.controller');

const router = express.Router();

// PATCH /api/users/me - Update institution
router.patch('/me', isAuthenticated, generalLimiter, updateProfile);

// GET /api/users/me/badges - All user badges
router.get('/me/badges', isAuthenticated, getUserBadges);

module.exports = router;
