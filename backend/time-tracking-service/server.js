const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const TimeEntryController = require('./controllers/time-entry.controller');
const { authenticateToken } = require('../shared/authMiddleware');
const { testConnection } = require('../database/db');

const app = express();
const PORT = process.env.TIME_TRACKING_SERVICE_PORT || 3005;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'time-tracking-service', status: 'healthy', timestamp: new Date().toISOString() });
});

// Time Tracking Routes
app.get('/api/time-entries/stats/summary', authenticateToken, TimeEntryController.getSummary);
app.get('/api/time-entries', authenticateToken, TimeEntryController.getAll);
app.get('/api/time-entries/:id', authenticateToken, TimeEntryController.getById);
app.post('/api/time-entries', authenticateToken, TimeEntryController.create);
app.put('/api/time-entries/:id', authenticateToken, TimeEntryController.update);
app.delete('/api/time-entries/:id', authenticateToken, TimeEntryController.delete);

// Error handling
app.use((err, req, res, next) => {
  console.error('[Time Tracking Service Error]', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, async () => {
  console.log(`🚀 [Time Tracking Service] running on port ${PORT}`);
  await testConnection();
});
