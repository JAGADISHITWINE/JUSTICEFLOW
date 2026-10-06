const { query } = require('../../database/db');

class BillingModel {
  // --- INVOICES ---
  static async findAllInvoices({ search, status, client_id, page = 1, limit = 10 }) {
    let sql = `
      SELECT 
        inv.*, 
        cl.name as client_name,
        cl.email as client_email,
        c.case_name,
        c.case_number
      FROM invoices inv
      JOIN clients cl ON inv.client_id = cl.id
      JOIN cases c ON inv.case_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (inv.invoice_number LIKE ? OR cl.name LIKE ? OR c.case_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status && status !== 'All') {
      sql += ' AND inv.status = ?';
      params.push(status);
    }

    if (client_id) {
      sql += ' AND inv.client_id = ?';
      params.push(client_id);
    }

    // Count
    let countSql = `
      SELECT COUNT(*) as total 
      FROM invoices inv
      JOIN clients cl ON inv.client_id = cl.id
      JOIN cases c ON inv.case_id = c.id
      WHERE 1=1
    `;
    const countParams = [];
    if (search) {
      countSql += ' AND (inv.invoice_number LIKE ? OR cl.name LIKE ? OR c.case_name LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status && status !== 'All') {
      countSql += ' AND inv.status = ?';
      countParams.push(status);
    }
    if (client_id) {
      countSql += ' AND inv.client_id = ?';
      countParams.push(client_id);
    }

    const [countResult] = await query(countSql, countParams);
    const total = countResult ? countResult.total : 0;

    sql += ' ORDER BY inv.issue_date DESC, inv.created_at DESC LIMIT ? OFFSET ?';
    const offset = (page - 1) * limit;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const rows = await query(sql, params);
    return {
      data: rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async findInvoiceById(id) {
    const rows = await query(
      `SELECT 
        inv.*, 
        cl.name as client_name,
        cl.email as client_email,
        cl.phone as client_phone,
        cl.address as client_address,
        cl.city as client_city,
        cl.state as client_state,
        cl.zip_code as client_zip_code,
        c.case_name,
        c.case_number
      FROM invoices inv
      JOIN clients cl ON inv.client_id = cl.id
      JOIN cases c ON inv.case_id = c.id
      WHERE inv.id = ?`,
      [id]
    );

    if (!rows.length) return null;
    const invoice = rows[0];

    // Fetch line items
    const items = await query(
      `SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id ASC`,
      [id]
    );
    invoice.items = items;
    return invoice;
  }

  static async createInvoice({ client_id, case_id, issue_date, due_date, subtotal, tax, total, notes, items }) {
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentLink = `https://checkout.lawpay.com/pay/${invoiceNumber.toLowerCase()}`;

    const res = await query(
      `INSERT INTO invoices 
       (invoice_number, client_id, case_id, issue_date, due_date, subtotal, tax, total, amount_paid, status, notes, payment_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0.00, 'Sent', ?, ?)`,
      [
        invoiceNumber,
        client_id,
        case_id,
        issue_date || new Date().toISOString().slice(0, 10),
        due_date || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        subtotal,
        tax || 0.00,
        total,
        notes || null,
        paymentLink
      ]
    );

    const invoiceId = res.insertId;

    if (items && items.length > 0) {
      for (const item of items) {
        await query(
          `INSERT INTO invoice_items (invoice_id, time_entry_id, description, hours, rate, amount)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            invoiceId,
            item.time_entry_id || null,
            item.description,
            item.hours || 0,
            item.rate || 0,
            item.amount
          ]
        );
      }
    }

    return this.findInvoiceById(invoiceId);
  }

  static async generateFromUnbilledTime({ case_id, due_date, notes }) {
    // 1. Get case and client details
    const [caseRow] = await query('SELECT * FROM cases WHERE id = ?', [case_id]);
    if (!caseRow) throw new Error('Case not found');

    // 2. Fetch unbilled time entries
    const timeEntries = await query(
      `SELECT t.* 
       FROM time_entries t 
       WHERE t.case_id = ? AND t.is_billable = 1 
       AND t.id NOT IN (SELECT COALESCE(time_entry_id, 0) FROM invoice_items WHERE time_entry_id IS NOT NULL)`,
      [case_id]
    );

    if (timeEntries.length === 0) {
      throw new Error('No unbilled billable time slips found for this legal matter.');
    }

    let subtotal = 0;
    const items = timeEntries.map(entry => {
      const amount = parseFloat(entry.hours) * parseFloat(entry.hourly_rate);
      subtotal += amount;
      return {
        time_entry_id: entry.id,
        description: entry.description,
        hours: entry.hours,
        rate: entry.hourly_rate,
        amount: amount
      };
    });

    return this.createInvoice({
      client_id: caseRow.client_id,
      case_id: case_id,
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: due_date || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      subtotal: subtotal,
      tax: 0.00,
      total: subtotal,
      notes: notes || `Legal services rendered for matter ${caseRow.case_name} (${caseRow.case_number}).`,
      items: items
    });
  }

  static async recordPayment(invoice_id, { amount, payment_method, stripe_payment_id }) {
    const inv = await this.findInvoiceById(invoice_id);
    if (!inv) return null;

    const newAmountPaid = parseFloat(inv.amount_paid || 0) + parseFloat(amount);
    const newStatus = newAmountPaid >= parseFloat(inv.total) ? 'Paid' : 'Sent';

    await query(
      `UPDATE invoices 
       SET amount_paid = ?, status = ?, stripe_payment_id = COALESCE(?, stripe_payment_id)
       WHERE id = ?`,
      [newAmountPaid, newStatus, stripe_payment_id || `LPAY_${Date.now()}`, invoice_id]
    );

    return this.findInvoiceById(invoice_id);
  }

  static async updateStatus(invoice_id, status) {
    await query('UPDATE invoices SET status = ? WHERE id = ?', [status, invoice_id]);
    return this.findInvoiceById(invoice_id);
  }

  static async deleteInvoice(id) {
    const res = await query('DELETE FROM invoices WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }

  // --- IOLTA TRUST ACCOUNTS ---
  static async findAllTrustAccounts() {
    return query(`
      SELECT 
        ta.*, 
        cl.name as client_name,
        cl.email as client_email,
        (SELECT COUNT(*) FROM trust_transactions WHERE trust_account_id = ta.id) as transaction_count,
        (SELECT COALESCE(SUM(amount), 0) FROM trust_transactions WHERE trust_account_id = ta.id AND type = 'Deposit') as total_deposited,
        (SELECT COALESCE(SUM(amount), 0) FROM trust_transactions WHERE trust_account_id = ta.id AND type = 'Disbursement') as total_disbursed
      FROM trust_accounts ta
      JOIN clients cl ON ta.client_id = cl.id
      ORDER BY ta.balance DESC
    `);
  }

  static async findTrustTransactions(trust_account_id) {
    return query(
      `SELECT tt.*, c.case_name, c.case_number 
       FROM trust_transactions tt 
       LEFT JOIN cases c ON tt.case_id = c.id 
       WHERE tt.trust_account_id = ? 
       ORDER BY tt.transaction_date DESC, tt.created_at DESC`,
      [trust_account_id]
    );
  }

  static async createTrustTransaction({ client_id, trust_account_id, case_id, type, amount, description, reference_number, transaction_date }) {
    let accountId = trust_account_id;

    // Create trust account if doesn't exist for client
    if (!accountId && client_id) {
      let [existingAcc] = await query('SELECT id FROM trust_accounts WHERE client_id = ?', [client_id]);
      if (existingAcc) {
        accountId = existingAcc.id;
      } else {
        const accNum = `TR-${Math.floor(100000 + Math.random() * 900000)}`;
        const newAcc = await query('INSERT INTO trust_accounts (client_id, account_number, balance) VALUES (?, ?, 0.00)', [client_id, accNum]);
        accountId = newAcc.insertId;
      }
    }

    const txDate = transaction_date || new Date().toISOString().slice(0, 10);
    await query(
      `INSERT INTO trust_transactions (trust_account_id, case_id, type, amount, description, reference_number, transaction_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [accountId, case_id || null, type, amount, description, reference_number || null, txDate]
    );

    // Recalculate balance
    const [dep] = await query(`SELECT COALESCE(SUM(amount), 0) as s FROM trust_transactions WHERE trust_account_id = ? AND type = 'Deposit'`, [accountId]);
    const [dis] = await query(`SELECT COALESCE(SUM(amount), 0) as s FROM trust_transactions WHERE trust_account_id = ? AND type = 'Disbursement'`, [accountId]);
    const [ref] = await query(`SELECT COALESCE(SUM(amount), 0) as s FROM trust_transactions WHERE trust_account_id = ? AND type = 'Refund'`, [accountId]);

    const newBalance = parseFloat(dep.s) - parseFloat(dis.s) - parseFloat(ref.s);
    await query('UPDATE trust_accounts SET balance = ? WHERE id = ?', [newBalance, accountId]);

    return {
      success: true,
      trust_account_id: accountId,
      new_balance: newBalance
    };
  }

  static async getBillingSummary() {
    const [invStats] = await query(`
      SELECT 
        COUNT(*) as total_invoices,
        COALESCE(SUM(total), 0) as total_billed,
        COALESCE(SUM(amount_paid), 0) as total_collected,
        COALESCE(SUM(CASE WHEN status IN ('Sent', 'Draft') THEN total - amount_paid ELSE 0 END), 0) as outstanding_receivables,
        COALESCE(SUM(CASE WHEN status = 'Paid' THEN total ELSE 0 END), 0) as paid_invoices_amount,
        COALESCE(SUM(CASE WHEN status = 'Overdue' THEN total - amount_paid ELSE 0 END), 0) as overdue_amount
      FROM invoices
    `);

    const [trustStats] = await query(`
      SELECT 
        COUNT(*) as total_trust_accounts,
        COALESCE(SUM(balance), 0) as total_trust_liability
      FROM trust_accounts
    `);

    return {
      invoices: invStats || {},
      trust: trustStats || {}
    };
  }
}

module.exports = BillingModel;
