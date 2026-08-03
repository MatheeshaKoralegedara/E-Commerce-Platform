// Wraps an async route handler so thrown errors (including rejected promises)
// automatically get passed to Express's error-handling middleware via next(err),
// instead of needing try/catch in every single controller function.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
