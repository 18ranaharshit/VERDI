// Performance: getMe reads from session (no DB query); logout destroys session
const asyncHandler = require('../middleware/asyncHandler');

const getMe = asyncHandler(async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated',
      code: 401,
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      googleId: req.user.googleId,
      email: req.user.email,
      displayName: req.user.displayName,
      avatar: req.user.avatar,
      institution: req.user.institution,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to logout',
        code: 500,
      });
    }

    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error('[Auth] Session destroy error:', sessionErr);
      }
      res.clearCookie('connect.sid');
      return res.status(200).json({
        success: true,
        data: null,
        message: 'Logged out successfully',
      });
    });
  });
});

module.exports = { getMe, logout };
