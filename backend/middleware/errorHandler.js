// Global error handler
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Default error
  let error = {
    success: false,
    message: err.message || 'Server Error',
    statusCode: err.statusCode || 500
  };

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    error.statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error.message = 'Duplicate field value entered';
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(val => val.message).join(', ');
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }

  // PostgreSQL errors
  if (err.code === '23505') { // Unique violation
    error.message = 'Duplicate entry. This record already exists.';
    error.statusCode = 400;
  }

  if (err.code === '23503') { // Foreign key violation
    error.message = 'Referenced record does not exist.';
    error.statusCode = 400;
  }

  if (err.code === '23502') { // Not null violation
    error.message = 'Required field is missing.';
    error.statusCode = 400;
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};