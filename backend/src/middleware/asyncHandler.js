// Performance: N/A - utility wrapper eliminating try/catch boilerplate in all async handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
