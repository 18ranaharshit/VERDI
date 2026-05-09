// Performance: Prevents abuse on mutation endpoints - in-memory store suitable for single-instance Render
const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: message,
      code: 429,
    },
  });
};

const generalLimiter = createLimiter(15 * 60 * 1000, 100, 'Too many requests, please try again later');

const authLimiter = createLimiter(15 * 60 * 1000, 20, 'Too many authentication attempts');

const tripLimiter = createLimiter(1 * 60 * 1000, 30, 'Too many trip submissions, slow down');

module.exports = { generalLimiter, authLimiter, tripLimiter };
