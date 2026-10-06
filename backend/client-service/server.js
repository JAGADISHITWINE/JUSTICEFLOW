const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ClientController = require('./controllers/client.controller');
const ConflictController = require('./controllers/conflict.controller');
const { authenticateToken } = require('../shared/authMiddleware');
const { testConnection } = require('../database/db');

const app = express();
const PORT = process.env.CLIENT_SERVICE_PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'client-service', status: 'healthy', timestamp: new Date().toISOString() });
});

// Ethical Conflict of Interest Checker Routes
app.post('/api/clients/conflict-check', authenticateToken, ConflictController.runConflictCheck);
app.get('/api/clients/conflict-check/history', authenticateToken, ConflictController.getConflictHistory);
app.get('/api/clients/conflict-check/:id', authenticateToken, ConflictController.getConflictById);
app.get('/api/clients/conflict-check/:id/certificate-pdf', ConflictController.downloadCertifiedAuditPdf);

// Client Self-Service Portal Routes (Distinct endpoints for client portal)
const PortalController = require('./controllers/portal.controller');
app.post('/api/portal/auth/login', PortalController.login);
app.get('/api/portal/me', authenticateToken, PortalController.getProfile);
app.get('/api/portal/cases', authenticateToken, PortalController.getCases);
app.get('/api/portal/invoices', authenticateToken, PortalController.getInvoices);
app.get('/api/portal/documents', authenticateToken, PortalController.getDocuments);
app.post('/api/portal/documents/upload', authenticateToken, PortalController.uploadDocument);

// Client Routes
app.get('/api/clients/stats/summary', authenticateToken, ClientController.getStats);
app.get('/api/clients', authenticateToken, ClientController.getAll);
app.get('/api/clients/:id', authenticateToken, ClientController.getById);
app.post('/api/clients', authenticateToken, ClientController.create);
app.put('/api/clients/:id', authenticateToken, ClientController.update);
app.delete('/api/clients/:id', authenticateToken, ClientController.delete);

// Error handling
app.use((err, req, res, next) => {
  console.error('[Client Service Error]', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, async () => {
  console.log(`🚀 [Client Service] running on port ${PORT}`);
  await testConnection();
});
