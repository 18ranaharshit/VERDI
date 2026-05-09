// Performance: N/A - auth routes only, no DB queries in route definitions
const express = require('express');
const passport = require('passport');
const { isAuthenticated } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimit');
const { getMe, logout } = require('../controllers/auth.controller');

const router = express.Router();

// GET /api/auth/google - Initiates Google OAuth redirect
router.get(
  '/google',
  authLimiter,
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// GET /api/auth/google/callback - Google redirects here after login
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL);
  }
);

// GET /api/auth/me - Returns current user if session exists
router.get('/me', getMe);

// POST /api/auth/logout - Destroys session, clears cookie
router.post('/logout', isAuthenticated, logout);

module.exports = router;
