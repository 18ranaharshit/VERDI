// Performance: Passport endpoint - single Trip.find() call, all derived data computed from same array
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth.middleware');
const controller = require('../controllers/passport.controller');

// All routes require authentication
router.use(isAuthenticated);

// GET /api/passport - Full passport data (heavy endpoint, cache aggressively on frontend)
router.get('/', controller.getPassport);

module.exports = router;
