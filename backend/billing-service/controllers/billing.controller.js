const BillingModel = require('../models/billing.model');
const { logAudit } = require('../../shared/audit');

class BillingController {
  // Invoices
  static async getAllInvoices(req, res) {
    try {
      const { search, status, client_id, page = 1, limit = 10 } = req.query;
      const result = await BillingModel.findAllInvoices({ search, status, client_id, page, limit });
      return res.json({ success: true, ...result });
    } catch (err) {
      console.error('[Billing GetAllInvoices Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve invoices.' });
    }
  }

  static async getInvoiceById(req, res) {
    try {
      const invoice = await BillingModel.findInvoiceById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found.' });
      }
      return res.json({ success: true, data: invoice });
    } catch (err) {
      console.error('[Billing GetInvoiceById Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch invoice.' });
    }
  }

  static async createInvoice(req, res) {
    try {
      const { client_id, case_id, subtotal, total, items } = req.body;
      if (!client_id || !case_id || !total) {
        return res.status(400).json({ success: false, message: 'Client, matter, and total are required.' });
      }

      const invoice = await BillingModel.createInvoice(req.body);
      const userId = req.user ? req.user.id : 1;
      await logAudit(userId, `Created Invoice ${invoice.invoice_number} for $${invoice.total}`, 'INVOICE', invoice.id);

      return res.status(201).json({ success: true, message: 'Invoice created successfully.', data: invoice });
    } catch (err) {
      console.error('[Billing CreateInvoice Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to create invoice.' });
    }
  }

  static async generateFromUnbilledTime(req, res) {
    try {
      const { case_id, due_date, notes } = req.body;
      if (!case_id) {
        return res.status(400).json({ success: false, message: 'case_id is required.' });
      }

      const invoice = await BillingModel.generateFromUnbilledTime({ case_id, due_date, notes });
      const userId = req.user ? req.user.id : 1;
      await logAudit(userId, `Generated Invoice ${invoice.invoice_number} from unbilled time slips`, 'INVOICE', invoice.id);

      return res.status(201).json({
        success: true,
        message: `Successfully bundled unbilled time slips into ${invoice.invoice_number}.`,
        data: invoice
      });
    } catch (err) {
      console.error('[Billing GenerateFromTime Error]', err);
      return res.status(400).json({ success: false, message: err.message || 'Failed to generate invoice.' });
    }
  }

  static async recordPayment(req, res) {
    try {
      const id = req.params.id;
      const { amount, payment_method, stripe_payment_id } = req.body;

      if (!amount) {
        return res.status(400).json({ success: false, message: 'Payment amount is required.' });
      }

      const updated = await BillingModel.recordPayment(id, { amount, payment_method, stripe_payment_id });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Invoice not found.' });
      }

      const userId = req.user ? req.user.id : 1;
      await logAudit(userId, `Processed payment of $${amount} for ${updated.invoice_number}`, 'PAYMENT', id);

      return res.json({
        success: true,
        message: 'Payment recorded successfully.',
        data: updated
      });
    } catch (err) {
      console.error('[Billing RecordPayment Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to record payment.' });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const updated = await BillingModel.updateStatus(req.params.id, status);
      return res.json({ success: true, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to update status.' });
    }
  }

  static async deleteInvoice(req, res) {
    try {
      await BillingModel.deleteInvoice(req.params.id);
      return res.json({ success: true, message: 'Invoice deleted successfully.' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to delete invoice.' });
    }
  }

  static async downloadInvoicePdf(req, res) {
    try {
      const inv = await BillingModel.findInvoiceById(req.params.id);
      if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found.' });

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `inline; filename="${inv.invoice_number}.html"`);

      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${inv.invoice_number} - JusticeFlow</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #2C3E50; padding: 40px; margin: 0; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2C3E50; padding-bottom: 20px; }
          .logo { font-size: 26px; font-weight: bold; color: #2C3E50; }
          .logo span { color: #3498DB; }
          .tagline { font-size: 13px; color: #7F8C8D; margin-top: 4px; }
          .inv-title { text-align: right; }
          .inv-title h1 { margin: 0; font-size: 32px; color: #2C3E50; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 6px; }
          .badge-paid { background: #E8F8F0; color: #27AE60; }
          .badge-sent { background: #EBF5FB; color: #2980B9; }
          .meta-row { display: flex; justify-content: space-between; margin: 30px 0; }
          .bill-to, .firm-info { font-size: 14px; line-height: 1.5; }
          table { width: 100%; border-collapse: collapse; margin-top: 25px; }
          th { background: #2C3E50; color: white; text-align: left; padding: 10px 12px; font-size: 13px; text-transform: uppercase; }
          td { border-bottom: 1px solid #E2E8F0; padding: 12px; font-size: 14px; }
          .totals { margin-top: 30px; margin-left: auto; width: 320px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .total-row.grand { font-size: 18px; font-weight: bold; border-top: 2px solid #2C3E50; border-bottom: 2px solid #2C3E50; padding: 12px 0; }
          .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #7F8C8D; border-top: 1px solid #E2E8F0; padding-top: 20px; }
          .pay-btn { display: inline-block; background: #3498DB; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">JUSTICE<span>FLOW</span></div>
            <div class="tagline">ATTORNEYS AT LAW &bull; LITIGATION & CORPORATE ADVISORY</div>
            <div style="font-size: 12px; color: #7F8C8D; margin-top: 6px;">742 Lexington Ave, 18th Floor &bull; New York, NY 10022 &bull; (555) 019-2831</div>
          </div>
          <div class="inv-title">
            <h1>INVOICE</h1>
            <div><strong>${inv.invoice_number}</strong></div>
            <span class="badge ${inv.status === 'Paid' ? 'badge-paid' : 'badge-sent'}">${inv.status.toUpperCase()}</span>
          </div>
        </div>

        <div class="meta-row">
          <div class="bill-to">
            <strong style="color: #7F8C8D; font-size: 11px; text-transform: uppercase;">BILLED TO:</strong><br>
            <strong style="font-size: 16px;">${inv.client_name}</strong><br>
            ${inv.client_address ? inv.client_address + '<br>' : ''}
            ${inv.client_city || ''} ${inv.client_state || ''} ${inv.client_zip_code || ''}<br>
            Email: ${inv.client_email || 'N/A'}
          </div>
          <div class="firm-info" style="text-align: right;">
            <div><strong>Matter:</strong> ${inv.case_name}</div>
            <div><strong>Docket Number:</strong> ${inv.case_number}</div>
            <div><strong>Invoice Date:</strong> ${inv.issue_date}</div>
            <div><strong>Payment Due:</strong> ${inv.due_date}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description of Legal Services</th>
              <th style="text-align: center; width: 100px;">Hours</th>
              <th style="text-align: right; width: 120px;">Rate</th>
              <th style="text-align: right; width: 140px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(inv.items || []).map(i => `
              <tr>
                <td>${i.description}</td>
                <td style="text-align: center;">${i.hours ? Number(i.hours).toFixed(2) : '-'}</td>
                <td style="text-align: right;">$${Number(i.rate || 0).toFixed(2)}</td>
                <td style="text-align: right; font-weight: bold;">$${Number(i.amount).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row"><span>Subtotal:</span><span>$${Number(inv.subtotal).toFixed(2)}</span></div>
          <div class="total-row"><span>Tax / Surcharge:</span><span>$${Number(inv.tax || 0).toFixed(2)}</span></div>
          <div class="total-row grand"><span>Total Due:</span><span>$${Number(inv.total).toFixed(2)}</span></div>
          <div class="total-row" style="color: #27AE60;"><span>Amount Paid:</span><span>$${Number(inv.amount_paid || 0).toFixed(2)}</span></div>
          <div class="total-row" style="font-weight: bold; color: ${inv.status === 'Paid' ? '#27AE60' : '#E74C3C'};">
            <span>Balance Due:</span><span>$${(Number(inv.total) - Number(inv.amount_paid || 0)).toFixed(2)}</span>
          </div>
        </div>

        ${inv.status !== 'Paid' ? `
          <div style="text-align: center; margin-top: 40px;">
            <a href="${inv.payment_link || '#'}" class="pay-btn">PAY SECURELY VIA LAWPAY / STRIPE &rarr;</a>
          </div>
        ` : ''}

        <div class="footer">
          Thank you for choosing JusticeFlow LLP. For billing inquiries, contact accounting@justiceflow.com.<br>
          Wire instructions and electronic payment portal available at checkout.lawpay.com
        </div>
      </body>
      </html>
      `;
      return res.send(html);
    } catch (err) {
      console.error('[Download Invoice PDF Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to generate PDF.' });
    }
  }

  // --- IOLTA Trust Accounts ---
  static async getAllTrustAccounts(req, res) {
    try {
      const accounts = await BillingModel.findAllTrustAccounts();
      return res.json({ success: true, data: accounts });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch trust accounts.' });
    }
  }

  static async getTrustTransactions(req, res) {
    try {
      const txs = await BillingModel.findTrustTransactions(req.params.id);
      return res.json({ success: true, data: txs });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch trust transactions.' });
    }
  }

  static async recordTrustTransaction(req, res) {
    try {
      const { client_id, trust_account_id, case_id, type, amount, description, reference_number, transaction_date } = req.body;
      if ((!client_id && !trust_account_id) || !amount || !type || !description) {
        return res.status(400).json({ success: false, message: 'Account, amount, type, and description are required.' });
      }

      const result = await BillingModel.createTrustTransaction(req.body);
      const userId = req.user ? req.user.id : 1;
      await logAudit(userId, `Recorded BCI Rule 24 Client Escrow ${type} of ₹${amount} (${description})`, 'TRUST_ACCOUNT', result.trust_account_id);

      return res.status(201).json({
        success: true,
        message: 'Trust transaction recorded in Client Escrow ledger (BCI Rule 24 compliant).',
        data: result
      });
    } catch (err) {
      console.error('[Record Trust Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to record trust transaction.' });
    }
  }

  static async getSummary(req, res) {
    try {
      const summary = await BillingModel.getBillingSummary();
      return res.json({ success: true, data: summary });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch summary.' });
    }
  }
}

module.exports = BillingController;
