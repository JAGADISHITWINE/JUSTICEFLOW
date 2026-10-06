const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const gatewayRoutes = require('./routes');

const app = express();
const PORT = process.env.GATEWAY_PORT || 5000;

// Enable CORS for frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role', 'x-user-email', 'x-user-name']
}));

app.use(morgan('combined'));

// Gateway status endpoint
app.get('/health', (req, res) => {
  res.json({
    gateway: 'JusticeFlow API Gateway',
    status: 'operational',
    port: PORT,
    timestamp: new Date().toISOString(),
    services: {
      auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      client: process.env.CLIENT_SERVICE_URL || 'http://localhost:3002',
      case: process.env.CASE_SERVICE_URL || 'http://localhost:3003',
      documents: process.env.DOCUMENTS_SERVICE_URL || 'http://localhost:3004',
      timeTracking: process.env.TIME_TRACKING_SERVICE_URL || 'http://localhost:3005'
    }
  });
});

// Mount microservice proxy routes
app.use('/', gatewayRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found on JusticeFlow Gateway.`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[API Gateway Error]', err);
  res.status(502).json({
    success: false,
    message: 'Bad Gateway: Microservice communication error.',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`⚖️  JUSTICEFLOW API GATEWAY RUNNING ON PORT ${PORT}`);
  console.log(`======================================================`);
  console.log(`👉 Auth Service:         http://localhost:3001`);
  console.log(`👉 Client Service:       http://localhost:3002`);
  console.log(`👉 Case Service:         http://localhost:3003`);
  console.log(`👉 Documents Service:    http://localhost:3004`);
  console.log(`👉 Time Tracking:        http://localhost:3005`);
  console.log(`👉 Gateway Health:       http://localhost:${PORT}/health`);
  console.log(`======================================================\n`);
});
