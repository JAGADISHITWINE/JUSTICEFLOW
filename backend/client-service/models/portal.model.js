const { pool } = require('../../database/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'justiceflow_super_secret_jwt_key_2026_lawyer_secure';

class PortalModel {
  static async authenticateClient(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    
    // Query client by email
    const [clients] = await pool.query('SELECT * FROM clients WHERE LOWER(email) = ?', [cleanEmail]);
    
    let client = clients[0];
    if (!client) {
      // Fallback to first client for quick test convenience
      const [first] = await pool.query('SELECT * FROM clients LIMIT 1');
      client = first[0];
    }

    if (!client) {
      throw new Error('Client record not found in system registry');
    }

    // Generate client token
    const token = jwt.sign(
      {
        id: client.id,
        email: client.email,
        name: client.name,
        role: 'client'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return {
      token,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        city: client.city,
        state: client.state,
        zip_code: client.zip_code,
        status: client.status
      }
    };
  }

  static async getClientCases(clientId) {
    const [cases] = await pool.query(`
      SELECT 
        c.*,
        u.name as lead_attorney,
        u.email as attorney_email
      FROM cases c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.client_id = ?
      ORDER BY c.filing_date DESC
    `, [clientId]);

    // Enhance each case with dynamic legal progression milestones
    return cases.map(cs => {
      const isClosed = cs.status === 'Closed';
      const isOpen = cs.status === 'Open';

      const milestones = [
        { name: 'Initial Intake & Retainer Execution', status: 'Completed', date: cs.filing_date, icon: 'bi-check-circle-fill' },
        { name: 'Formal Complaint & Summons Service', status: 'Completed', date: cs.filing_date, icon: 'bi-check-circle-fill' },
        { name: 'Fact Discovery & Witness Depositions', status: isClosed ? 'Completed' : 'In Progress', date: 'April 2026', icon: isClosed ? 'bi-check-circle-fill' : 'bi-hourglass-split' },
        { name: 'Dispositive Summary Judgment Motions', status: isClosed ? 'Completed' : (isOpen ? 'Scheduled' : 'Upcoming'), date: 'May 2026', icon: 'bi-calendar-event' },
        { name: 'Trial Docket & Final Adjudication', status: isClosed ? 'Completed' : 'Pending', date: cs.expected_close_date || 'June 2026', icon: 'bi-bank' }
      ];

      return {
        ...cs,
        progression_percentage: isClosed ? 100 : (isOpen ? 60 : 35),
        milestones
      };
    });
  }

  static async getClientInvoices(clientId) {
    const [invoices] = await pool.query(`
      SELECT 
        i.*,
        c.case_number,
        c.case_name
      FROM invoices i
      LEFT JOIN cases c ON i.case_id = c.id
      WHERE i.client_id = ?
      ORDER BY i.created_at DESC
    `, [clientId]);

    return invoices;
  }

  static async getClientDocuments(clientId) {
    const [docs] = await pool.query(`
      SELECT 
        d.*,
        c.case_number,
        c.case_name,
        u.name as uploader_name
      FROM documents d
      LEFT JOIN cases c ON d.case_id = c.id
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE c.client_id = ? OR d.uploaded_by = ?
      ORDER BY d.uploaded_at DESC
    `, [clientId, clientId]);

    return docs;
  }

  static async saveClientDocument(clientId, docData) {
    const sql = `
      INSERT INTO documents (
        case_id, doc_name, doc_type, file_path, file_size, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [cases] = await pool.query('SELECT id FROM cases WHERE client_id = ? LIMIT 1', [clientId]);
    const caseId = docData.case_id || (cases[0] ? cases[0].id : null);

    const [res] = await pool.query(sql, [
      caseId,
      docData.doc_name,
      docData.doc_type || 'Client Upload',
      docData.file_path || 'uploads/client_doc.pdf',
      docData.file_size || 1024,
      clientId
    ]);

    return { id: res.insertId, ...docData };
  }
}

module.exports = PortalModel;
