const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const CaseController = require('./controllers/case.controller');
const RetainerController = require('./controllers/retainer.controller');
const { authenticateToken } = require('../shared/authMiddleware');
const { testConnection } = require('../database/db');

const app = express();
const PORT = process.env.CASE_SERVICE_PORT || 3003;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'case-service', status: 'healthy', timestamp: new Date().toISOString() });
});

// Digital Retainer Agreements & E-Signatures Routes
app.get('/api/cases/retainers', authenticateToken, RetainerController.getAll);
app.get('/api/cases/retainers/:id', authenticateToken, RetainerController.getById);
app.post('/api/cases/retainers', authenticateToken, RetainerController.create);
app.post('/api/cases/retainers/:id/revision', authenticateToken, RetainerController.createRevision);
app.post('/api/cases/retainers/:id/sign', RetainerController.signAgreement);
app.put('/api/cases/retainers/:id/status', authenticateToken, RetainerController.updateStatus);
app.delete('/api/cases/retainers/:id', authenticateToken, RetainerController.deleteAgreement);
app.get('/api/cases/retainers/:id/pdf', RetainerController.downloadContractPdf);

// Case Routes
app.get('/api/cases/stats/dashboard', authenticateToken, CaseController.getDashboardStats);
app.get('/api/cases/teams', authenticateToken, CaseController.getTeams);
app.post('/api/cases/sync-all-ecourts', authenticateToken, CaseController.syncAllECourts);
app.post('/api/cases/:id/sync-ecourts', authenticateToken, CaseController.syncECourts);
app.get('/api/cases', authenticateToken, CaseController.getAll);
app.get('/api/cases/:id', authenticateToken, CaseController.getById);
app.post('/api/cases', authenticateToken, CaseController.create);
app.put('/api/cases/:id', authenticateToken, CaseController.update);
app.delete('/api/cases/:id', authenticateToken, CaseController.delete);

// Error handling
app.use((err, req, res, next) => {
  console.error('[Case Service Error]', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, async () => {
  // console.log(`🚀 [Case Service] running on port ${PORT}`);
  await testConnection();
});
