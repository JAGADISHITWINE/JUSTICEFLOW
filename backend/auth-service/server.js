const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const AuthController = require('./controllers/auth.controller');
const { authenticateToken, optionalAuthenticateToken } = require('../shared/authMiddleware');
const { testConnection } = require('../database/db');

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'auth-service', status: 'healthy', timestamp: new Date().toISOString() });
});

// Auth Routes
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/send-registration-otp', AuthController.sendRegistrationOtp);
app.post('/api/auth/forgot-password', AuthController.forgotPassword);
app.post('/api/auth/reset-password', AuthController.resetPassword);
app.post('/api/auth/login', AuthController.login);
app.post('/api/auth/logout', optionalAuthenticateToken, AuthController.logout);
app.post('/api/auth/heartbeat', authenticateToken, AuthController.heartbeat);
app.get('/api/auth/me', authenticateToken, AuthController.getProfile);
app.get('/api/auth/verify', authenticateToken, AuthController.verify);
app.get('/api/auth/users', authenticateToken, AuthController.listUsers);

// Error handling
app.use((err, req, res, next) => {
  console.error('[Auth Service Error]', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, async () => {
  // console.log(`🚀 [Auth Service] running on port ${PORT}`);
  await testConnection();
});
