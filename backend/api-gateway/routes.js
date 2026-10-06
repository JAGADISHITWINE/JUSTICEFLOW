const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const router = express.Router();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const CLIENT_SERVICE_URL = process.env.CLIENT_SERVICE_URL || 'http://localhost:3002';
const CASE_SERVICE_URL = process.env.CASE_SERVICE_URL || 'http://localhost:3003';
const DOCUMENTS_SERVICE_URL = process.env.DOCUMENTS_SERVICE_URL || 'http://localhost:3004';
const TIME_TRACKING_SERVICE_URL = process.env.TIME_TRACKING_SERVICE_URL || 'http://localhost:3005';
const BILLING_SERVICE_URL = process.env.BILLING_SERVICE_URL || 'http://localhost:3006';
const CALENDAR_SERVICE_URL = process.env.CALENDAR_SERVICE_URL || 'http://localhost:3007';
const JWT_SECRET = process.env.JWT_SECRET || 'justiceflow_super_secret_jwt_key_2026_lawyer_secure';

// Gateway token inspection middleware (decorates request headers with user details)
function gatewayAuthInspector(req, res, next) {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.headers['x-user-id'] = String(decoded.id);
      req.headers['x-user-email'] = decoded.email || '';
      req.headers['x-user-role'] = decoded.role || 'lawyer';
      req.headers['x-user-name'] = decoded.name || '';
    } catch (e) {
      // Token expired or invalid
    }
  }
  next();
}

router.use(gatewayAuthInspector);

// Proxy to Auth Service
router.use(
  '/api/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (pathname, req) => req.originalUrl
  })
);

// Proxy to Client Service
router.use(
  '/api/clients',
  createProxyMiddleware({
    target: CLIENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (pathname, req) => req.originalUrl
  })
);

// Proxy to Case Service
router.use(
  '/api/cases',
  createProxyMiddleware({
    target: CASE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (pathname, req) => req.originalUrl
  })
);

// Proxy to Documents Service
router.use(
  '/api/documents',
  createProxyMiddleware({
    target: DOCUMENTS_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (pathname, req) => req.originalUrl
  })
);

router.use(
  '/uploads',
  createProxyMiddleware({
    target: DOCUMENTS_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (pathname, req) => req.originalUrl
  })
);

// Proxy to Time Tracking Service
router.use(
  '/api/time-entries',
  createProxyMiddleware({
    target: TIME_TRACKING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (pathname, req) => req.originalUrl
  })
);

// Proxy to Billing Service (Invoicing & IOLTA Trust)
router.use(
  '/api/billing',
  createProxyMiddleware({
    target: BILLING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (pathname, req) => req.originalUrl
  })
);

// Proxy to Calendar Service (Court Calendar & Rule-Based Deadlines)
router.use(
  '/api/calendar',
  createProxyMiddleware({
    target: CALENDAR_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (pathname, req) => req.originalUrl
  })
);

// Proxy to Client Portal (Dedicated Client Self-Service Gateway)
router.use(
  '/api/portal',
  createProxyMiddleware({
    target: CLIENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (pathname, req) => req.originalUrl
  })
);

module.exports = router;
