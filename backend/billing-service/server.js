const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BillingController = require('./controllers/billing.controller');
const { authenticateToken } = require('../shared/authMiddleware');
const { testConnection } = require('../database/db');

const app = express();
const PORT = process.env.BILLING_SERVICE_PORT || 3006;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'billing-service', status: 'healthy', timestamp: new Date().toISOString() });
});

// Invoices Routes
app.get('/api/billing/stats/summary', authenticateToken, BillingController.getSummary);
app.get('/api/billing/invoices', authenticateToken, BillingController.getAllInvoices);
app.get('/api/billing/invoices/:id', authenticateToken, BillingController.getInvoiceById);
app.get('/api/billing/invoices/:id/pdf', authenticateToken, BillingController.downloadInvoicePdf);
app.post('/api/billing/invoices', authenticateToken, BillingController.createInvoice);
app.post('/api/billing/invoices/generate-from-time', authenticateToken, BillingController.generateFromUnbilledTime);
app.post('/api/billing/invoices/:id/pay', authenticateToken, BillingController.recordPayment);
app.put('/api/billing/invoices/:id/status', authenticateToken, BillingController.updateStatus);
app.delete('/api/billing/invoices/:id', authenticateToken, BillingController.deleteInvoice);

// IOLTA Trust Account Routes
app.get('/api/billing/trust-accounts', authenticateToken, BillingController.getAllTrustAccounts);
app.get('/api/billing/trust-accounts/:id/transactions', authenticateToken, BillingController.getTrustTransactions);
app.post('/api/billing/trust-accounts/transaction', authenticateToken, BillingController.recordTrustTransaction);

// Error handling
app.use((err, req, res, next) => {
  console.error('[Billing Service Error]', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, async () => {
  // console.log(`🚀 [Billing Service] running on port ${PORT}`);
  await testConnection();
});
