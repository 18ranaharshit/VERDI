// Performance: N/A - session-based auth check, no DB query (session already loaded by express-session)
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({
    success: false,
    error: 'Not authenticated',
    code: 401,
  });
};

module.exports = { isAuthenticated };
