// Performance: Pure computation - no I/O. Credit calculation from carbon savings.

const CREDITS_PER_GRAM_SAVED = 0.1; // 1 credit per 10g saved

/**
 * Calculate credits earned from carbon savings.
 * @param {number} carbonSaved - grams of CO2 saved vs car baseline
 * @returns {number} integer credits earned
 */
function calculateCreditsEarned(carbonSaved) {
  if (!carbonSaved || carbonSaved <= 0) return 0;
  return Math.floor(carbonSaved * CREDITS_PER_GRAM_SAVED);
}

/**
 * Generate a unique voucher code in format: VERDI-XXXX-XXXX
 * @returns {string}
 */
function generateVoucherCode() {
  const prefix = 'VERDI';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segment = (len) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${segment(4)}-${segment(4)}`;
}

module.exports = { calculateCreditsEarned, generateVoucherCode, CREDITS_PER_GRAM_SAVED };
