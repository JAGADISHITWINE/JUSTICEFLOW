const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'justiceflow_super_secret_jwt_key_2026_lawyer_secure';

function authenticateToken(req, res, next) {
  // Check for x-user-id header forwarded by API gateway first
  if (req.headers['x-user-id']) {
    req.user = {
      id: parseInt(req.headers['x-user-id'], 10),
      email: req.headers['x-user-email'] || '',
      role: req.headers['x-user-role'] || 'lawyer',
      name: req.headers['x-user-name'] || ''
    };
    return next();
  }

  // Otherwise check Bearer Authorization header or query param token
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
}

function optionalAuthenticateToken(req, res, next) {
  if (req.headers['x-user-id']) {
    req.user = {
      id: parseInt(req.headers['x-user-id'], 10),
      email: req.headers['x-user-email'] || '',
      role: req.headers['x-user-role'] || 'lawyer',
      name: req.headers['x-user-name'] || ''
    };
    return next();
  }

  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Ignore invalid token for optional auth
    }
  }
  next();
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permissions for this action.'
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  optionalAuthenticateToken,
  authorizeRoles,
  JWT_SECRET
};
