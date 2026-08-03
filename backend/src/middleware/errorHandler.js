const logger = require('../config/logger');

// Custom error class so controllers can throw errors with a specific status code
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Express recognizes this as error-handling middleware specifically because
// it takes FOUR arguments (err, req, res, next) — this exact signature matters,
// Express uses it to distinguish error handlers from regular middleware.
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  // Only log real server errors as errors; expected 4xx responses (like validation
  // failures) are logged at a lower level so they don't clutter error-level alerting
  if (statusCode >= 500) {
    (req.log || logger).error({ err }, err.message || 'Unhandled server error');
  } else {
    (req.log || logger).warn({ err: err.message }, 'Request failed');
  }

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Something went wrong. Please try again.' : err.message,
  });
}

module.exports = { AppError, errorHandler };
