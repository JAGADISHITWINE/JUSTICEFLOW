const PortalModel = require('../models/portal.model');

class PortalController {
  // POST /api/portal/auth/login
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required' });
      }

      const result = await PortalModel.authenticateClient(email, password);
      res.json({
        success: true,
        message: 'Welcome to your JusticeFlow Secure Client Portal',
        data: result
      });
    } catch (err) {
      res.status(401).json({ success: false, message: err.message });
    }
  }

  // GET /api/portal/me
  static async getProfile(req, res) {
    try {
      const clientId = req.headers['x-user-id'] || 1;
      const cases = await PortalModel.getClientCases(clientId);
      const invoices = await PortalModel.getClientInvoices(clientId);
      const docs = await PortalModel.getClientDocuments(clientId);

      const totalBilled = invoices.reduce((acc, inv) => acc + parseFloat(inv.total || 0), 0);
      const totalPaid = invoices.reduce((acc, inv) => acc + parseFloat(inv.amount_paid || 0), 0);
      const outstandingBalance = totalBilled - totalPaid;

      res.json({
        success: true,
        data: {
          clientId,
          activeCasesCount: cases.filter(c => c.status !== 'Closed').length,
          totalCasesCount: cases.length,
          outstandingBalance,
          totalInvoicesCount: invoices.length,
          documentsCount: docs.length
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/portal/cases
  static async getCases(req, res) {
    try {
      const clientId = req.headers['x-user-id'] || 1;
      const cases = await PortalModel.getClientCases(clientId);
      res.json({ success: true, data: cases });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/portal/invoices
  static async getInvoices(req, res) {
    try {
      const clientId = req.headers['x-user-id'] || 1;
      const invoices = await PortalModel.getClientInvoices(clientId);
      res.json({ success: true, data: invoices });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/portal/documents
  static async getDocuments(req, res) {
    try {
      const clientId = req.headers['x-user-id'] || 1;
      const docs = await PortalModel.getClientDocuments(clientId);
      res.json({ success: true, data: docs });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // POST /api/portal/documents/upload
  static async uploadDocument(req, res) {
    try {
      const clientId = req.headers['x-user-id'] || 1;
      const { doc_name, doc_type, file_path, file_size, case_id } = req.body;

      const saved = await PortalModel.saveClientDocument(clientId, {
        doc_name: doc_name || 'Client Uploaded File.pdf',
        doc_type: doc_type || 'Evidence / Discovery',
        file_path: file_path || 'uploads/client_upload.pdf',
        file_size: file_size || 2048,
        case_id
      });

      res.status(201).json({
        success: true,
        message: 'File securely uploaded to confidential legal repository!',
        data: saved
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = PortalController;
