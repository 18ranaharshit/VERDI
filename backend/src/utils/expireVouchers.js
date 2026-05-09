// Performance: Background job - runs every 5 minutes to expire stale vouchers
const Redemption = require('../models/Redemption');

/**
 * Mark all active redemptions past their expiresAt as 'expired'.
 * Called once at startup and then every 5 minutes via setInterval.
 */
async function expireVouchers() {
  try {
    const result = await Redemption.updateMany(
      { status: 'active', expiresAt: { $lt: new Date() } },
      { $set: { status: 'expired' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[expireVouchers] Expired ${result.modifiedCount} voucher(s)`);
    }
  } catch (err) {
    console.error('[expireVouchers] Error:', err.message);
  }
}

/**
 * Start the background expiry loop.
 */
function startExpiryLoop() {
  // Run immediately on startup
  expireVouchers();
  // Then every 5 minutes
  setInterval(expireVouchers, 5 * 60 * 1000);
}

module.exports = { expireVouchers, startExpiryLoop };
