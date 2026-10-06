const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const CalendarController = require('./controllers/calendar.controller');
const { authenticateToken } = require('../shared/authMiddleware');
const { testConnection } = require('../database/db');

const app = express();
const PORT = process.env.CALENDAR_SERVICE_PORT || 3007;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'calendar-service', status: 'healthy', port: PORT, timestamp: new Date().toISOString() });
});

// Calendar Events CRUD
app.get('/api/calendar/events', authenticateToken, CalendarController.getEvents);
app.get('/api/calendar/events/:id', authenticateToken, CalendarController.getEventById);
app.post('/api/calendar/events', authenticateToken, CalendarController.createEvent);
app.put('/api/calendar/events/:id', authenticateToken, CalendarController.updateEvent);
app.delete('/api/calendar/events/:id', authenticateToken, CalendarController.deleteEvent);

// Rule-Based Statutory Deadline Generator
app.post('/api/calendar/calculate-deadlines', authenticateToken, CalendarController.calculateDeadlines);
app.post('/api/calendar/apply-deadlines', authenticateToken, CalendarController.applyDeadlines);

// iCal RFC 5545 feed & export (compatible with Outlook 365, Google Calendar, Apple iCal)
app.get('/api/calendar/export.ics', CalendarController.exportIcsFeed);
app.get('/api/calendar/events/:id/ics', CalendarController.exportSingleEventIcs);

// Alerts & Court Reminders (7 days, 48 hours, 2 hours)
app.get('/api/calendar/alerts/upcoming', authenticateToken, CalendarController.getUpcomingAlerts);
app.post('/api/calendar/alerts/:id/send', authenticateToken, CalendarController.sendCourtReminder);

// Error handling
app.use((err, req, res, next) => {
  console.error('[Calendar Service Error]', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, async () => {
  console.log(`📅 [Calendar Service] running on port ${PORT}`);
  await testConnection();
});
