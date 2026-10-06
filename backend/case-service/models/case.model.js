const { query } = require('../../database/db');

class CaseModel {
  static async findAll({ search, status, case_type, client_id, page = 1, limit = 10 }) {
    let sql = `
      SELECT 
        c.*, 
        cl.name as client_name,
        cl.email as client_email,
        cl.phone as client_phone,
        u.name as lead_lawyer,
        (SELECT COUNT(*) FROM documents WHERE case_id = c.id) as doc_count,
        (SELECT COALESCE(SUM(hours), 0) FROM time_entries WHERE case_id = c.id) as total_hours
      FROM cases c
      JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (c.case_name LIKE ? OR c.case_number LIKE ? OR c.court_name LIKE ? OR cl.name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (status && status !== 'All') {
      sql += ` AND c.status = ?`;
      params.push(status);
    }

    if (case_type && case_type !== 'All') {
      sql += ` AND c.case_type = ?`;
      params.push(case_type);
    }

    if (client_id) {
      sql += ` AND c.client_id = ?`;
      params.push(client_id);
    }

    // Count query
    let countSql = `
      SELECT COUNT(*) as total 
      FROM cases c 
      JOIN clients cl ON c.client_id = cl.id 
      WHERE 1=1
    `;
    const countParams = [];
    if (search) {
      countSql += ` AND (c.case_name LIKE ? OR c.case_number LIKE ? OR c.court_name LIKE ? OR cl.name LIKE ?)`;
      const term = `%${search}%`;
      countParams.push(term, term, term, term);
    }
    if (status && status !== 'All') {
      countSql += ` AND c.status = ?`;
      countParams.push(status);
    }
    if (case_type && case_type !== 'All') {
      countSql += ` AND c.case_type = ?`;
      countParams.push(case_type);
    }
    if (client_id) {
      countSql += ` AND c.client_id = ?`;
      countParams.push(client_id);
    }

    const [countResult] = await query(countSql, countParams);
    const total = countResult ? countResult.total : 0;

    sql += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
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

  static async findById(id) {
    const cases = await query(
      `SELECT 
        c.*, 
        cl.name as client_name,
        cl.email as client_email,
        cl.phone as client_phone,
        cl.address as client_address,
        u.name as lead_lawyer,
        u.email as lawyer_email
      FROM cases c
      JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [id]
    );

    if (!cases.length) return null;
    const caseItem = cases[0];

    // Fetch related documents
    const documents = await query(
      `SELECT d.*, u.name as uploader_name 
       FROM documents d 
       LEFT JOIN users u ON d.uploaded_by = u.id 
       WHERE d.case_id = ? 
       ORDER BY d.uploaded_at DESC`,
      [id]
    );
    caseItem.documents = documents;

    // Fetch related time entries
    const timeEntries = await query(
      `SELECT t.*, u.name as lawyer_name 
       FROM time_entries t 
       LEFT JOIN users u ON t.user_id = u.id 
       WHERE t.case_id = ? 
       ORDER BY t.entry_date DESC, t.created_at DESC`,
      [id]
    );
    caseItem.time_entries = timeEntries;

    // Total hours logged
    const totalHours = timeEntries.reduce((sum, entry) => sum + parseFloat(entry.hours || 0), 0);
    const totalBilled = timeEntries.reduce((sum, entry) => sum + (parseFloat(entry.hours || 0) * parseFloat(entry.hourly_rate || 0)), 0);
    caseItem.total_hours = totalHours;
    caseItem.calculated_billed = totalBilled;

    return caseItem;
  }

  static async create(data) {
    const {
      user_id,
      client_id,
      case_name,
      case_number,
      case_type,
      description,
      status,
      court_name,
      judge_name,
      filing_date,
      expected_close_date,
      budget,
      spent
    } = data;

    // Generate case number if none supplied (e.g. JF-2026-XXXX)
    const generatedCaseNum = case_number || `JF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await query(
      `INSERT INTO cases 
      (user_id, client_id, case_name, case_number, case_type, description, status, court_name, judge_name, filing_date, expected_close_date, budget, spent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        client_id,
        case_name,
        generatedCaseNum,
        case_type || 'General Civil',
        description || null,
        status || 'Open',
        court_name || null,
        judge_name || null,
        filing_date || null,
        expected_close_date || null,
        budget || 0.00,
        spent || 0.00
      ]
    );

    return this.findById(result.insertId);
  }

  static async update(id, data) {
    const {
      user_id,
      client_id,
      case_name,
      case_number,
      case_type,
      description,
      status,
      court_name,
      judge_name,
      filing_date,
      expected_close_date,
      budget,
      spent
    } = data;

    await query(
      `UPDATE cases SET
        user_id = COALESCE(?, user_id),
        client_id = COALESCE(?, client_id),
        case_name = COALESCE(?, case_name),
        case_number = COALESCE(?, case_number),
        case_type = COALESCE(?, case_type),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        court_name = COALESCE(?, court_name),
        judge_name = COALESCE(?, judge_name),
        filing_date = COALESCE(?, filing_date),
        expected_close_date = COALESCE(?, expected_close_date),
        budget = COALESCE(?, budget),
        spent = COALESCE(?, spent)
      WHERE id = ?`,
      [
        user_id,
        client_id,
        case_name,
        case_number,
        case_type,
        description,
        status,
        court_name,
        judge_name,
        filing_date,
        expected_close_date,
        budget,
        spent,
        id
      ]
    );

    return this.findById(id);
  }

  static async delete(id) {
    const result = await query('DELETE FROM cases WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getDashboardStats() {
    const caseStats = await query(`
      SELECT
        COUNT(*) as total_cases,
        SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) as open_cases,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_cases,
        SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) as closed_cases,
        SUM(CASE WHEN status = 'On Hold' THEN 1 ELSE 0 END) as on_hold_cases,
        COALESCE(SUM(budget), 0) as total_budget,
        COALESCE(SUM(spent), 0) as total_spent
      FROM cases
    `);

    const clientStats = await query(`
      SELECT 
        COUNT(*) as total_clients,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_clients
      FROM clients
    `);

    const timeStats = await query(`
      SELECT 
        COALESCE(SUM(hours), 0) as total_hours,
        COALESCE(SUM(CASE WHEN is_billable = 1 THEN hours ELSE 0 END), 0) as billable_hours,
        COALESCE(SUM(CASE WHEN is_billable = 1 THEN hours * hourly_rate ELSE 0 END), 0) as total_billed_revenue
      FROM time_entries
    `);

    const recentCases = await query(`
      SELECT c.id, c.case_name, c.case_number, c.case_type, c.status, c.budget, c.spent, cl.name as client_name
      FROM cases c
      JOIN clients cl ON c.client_id = cl.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `);

    const upcomingDeadlines = await query(`
      SELECT c.id, c.case_name, c.case_number, c.expected_close_date, c.status, cl.name as client_name
      FROM cases c
      JOIN clients cl ON c.client_id = cl.id
      WHERE c.expected_close_date IS NOT NULL AND c.status IN ('Open', 'Pending')
      ORDER BY c.expected_close_date ASC
      LIMIT 5
    `);

    return {
      cases: caseStats[0] || {},
      clients: clientStats[0] || {},
      time: timeStats[0] || {},
      recentCases,
      upcomingDeadlines
    };
  }
}

module.exports = CaseModel;
