// 404 Not Found middleware
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/hospitals',
      'POST /api/appointments',
      'POST /api/ai/analyze',
      'POST /api/ai/chat'
    ]
  });
};