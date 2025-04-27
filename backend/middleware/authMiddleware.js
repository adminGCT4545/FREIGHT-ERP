const jwt = require('jsonwebtoken');
const { APIError } = require('../utils/errors');
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error("FATAL ERROR: JWT_SECRET environment variable is not set for auth middleware.");
  process.exit(1);
}

const protect = (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Bearer TOKEN_STRING)
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, jwtSecret);

      // Attach user information to the request object (excluding sensitive info like password hash)
      // You might want to fetch fresh user data from DB here in a real app
      // to ensure the user still exists and roles haven't changed.
      // For now, we'll trust the decoded payload.
      req.user = {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role
      };

      console.log(`[Auth] User authenticated: ${req.user.username} (Role: ${req.user.role})`);
      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error('Token verification failed:', error.message);
      // Handle specific JWT errors
      if (error.name === 'JsonWebTokenError') {
        return next(new APIError('Not authorized, token failed', 401));
      }
      if (error.name === 'TokenExpiredError') {
        return next(new APIError('Not authorized, token expired', 401));
      }
      // Forward other errors
      return next(error);
    }
  }

  if (!token) {
    return next(new APIError('Not authorized, no token provided', 401));
  }
};

// Middleware to restrict access based on role(s)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
       // Should have been caught by 'protect' middleware, but double-check
       return next(new APIError('Not authorized to access this route', 401));
    }
    if (!roles.includes(req.user.role)) {
      console.warn(`[Auth] Forbidden: User ${req.user.username} (Role: ${req.user.role}) tried to access role-restricted route (${roles.join(', ')})`);
      return next(new APIError(`User role '${req.user.role}' is not authorized to access this route`, 403)); // 403 Forbidden
    }
    next(); // Role is authorized
  };
};


module.exports = { protect, authorize };