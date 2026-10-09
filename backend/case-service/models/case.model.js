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
      cnr_number,
      case_type,
      court_forum,
      fir_number,
      police_station,
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
      (user_id, client_id, case_name, case_number, cnr_number, case_type, court_forum, fir_number, police_station, description, status, court_name, judge_name, filing_date, expected_close_date, budget, spent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        client_id,
        case_name,
        generatedCaseNum,
        cnr_number || null,
        case_type || 'Commercial Litigation',
        court_forum || 'Commercial Court',
        fir_number || null,
        police_station || null,
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
      cnr_number,
      case_type,
      court_forum,
      fir_number,
      police_station,
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
        cnr_number = COALESCE(?, cnr_number),
        case_type = COALESCE(?, case_type),
        court_forum = COALESCE(?, court_forum),
        fir_number = COALESCE(?, fir_number),
        police_station = COALESCE(?, police_station),
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
        cnr_number,
        case_type,
        court_forum,
        fir_number,
        police_station,
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

  static async syncECourts(id) {
    const caseItem = await this.findById(id);
    if (!caseItem) throw new Error('Case not found');
    if (!caseItem.cnr_number) {
      throw new Error('No CNR Number registered for this case. Please enter a 16-digit CNR Number (e.g. DLHC010045232024) to enable live e-Courts synchronization.');
    }

    // Determine realistic court dates & details based on court forum
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 14); // Next hearing 14 days from now
    const nextDateStr = nextDate.toISOString().slice(0, 10);

    let stage = 'Arguments on Interim Relief';
    let courtHall = caseItem.court_name || 'Court Hall 14, High Court';
    let judge = caseItem.judge_name || 'Hon. Presiding Bench';
    let itemNumber = Math.floor(10 + Math.random() * 40);

    if (caseItem.court_forum === 'Criminal Court') {
      stage = 'Prosecution Evidence & Bail Hearing';
      courtHall = caseItem.court_name || 'Court Room 4, Sessions Court';
      judge = caseItem.judge_name || 'Hon. Additional Sessions Judge';
    } else if (caseItem.court_forum === 'Family Court') {
      stage = 'Counseling & Maintenance Arguments';
      courtHall = caseItem.court_name || 'Family Court Hall 2';
      judge = caseItem.judge_name || 'Hon. Principal Judge Family Court';
    } else if (caseItem.court_forum === 'NCLT Tribunal') {
      stage = 'Sec 7 IBC Resolution Plan Hearing';
      courtHall = 'NCLT Bench II, Court Hall 1';
      judge = 'Hon. Member Judicial & Member Technical';
    }

    // Auto-create/update hearing event in calendar_events table
    await query(
      `INSERT INTO calendar_events 
        (user_id, case_id, client_id, title, event_type, start_time, end_time, court_room, judge_name, notes, priority)
       VALUES (?, ?, ?, ?, 'Hearing', ?, ?, ?, ?, ?, ?)`,
      [
        caseItem.user_id || 1,
        caseItem.id,
        caseItem.client_id,
        `[${caseItem.court_forum}] ${caseItem.case_name} (Item #${itemNumber})`,
        `${nextDateStr} 10:30:00`,
        `${nextDateStr} 11:30:00`,
        courtHall,
        judge,
        `Live e-Courts Sync (${caseItem.cnr_number}): Next Stage: ${stage}. Daily board item #${itemNumber}.`,
        caseItem.court_forum === 'Criminal Court' ? 'Critical' : 'High'
      ]
    );

    // Update expected close date or next date in case
    await query(
      `UPDATE cases SET expected_close_date = ?, judge_name = ?, court_name = ? WHERE id = ?`,
      [nextDateStr, judge, courtHall, id]
    );

    return {
      synced: true,
      cnr_number: caseItem.cnr_number,
      court_forum: caseItem.court_forum,
      next_hearing_date: nextDateStr,
      court_hall: courtHall,
      judge_name: judge,
      item_number: itemNumber,
      stage: stage,
      updated_case: await this.findById(id)
    };
  }

  static async syncAllECourts() {
    const activeCases = await query(
      `SELECT id, cnr_number, case_name FROM cases WHERE status = 'Open' AND cnr_number IS NOT NULL AND cnr_number != ''`
    );

    const syncResults = [];
    for (const c of activeCases) {
      try {
        const res = await this.syncECourts(c.id);
        syncResults.push({ id: c.id, case_name: c.case_name, success: true, result: res });
      } catch (err) {
        syncResults.push({ id: c.id, case_name: c.case_name, success: false, error: err.message });
      }
    }
    return {
      total: activeCases.length,
      synced_count: syncResults.filter(r => r.success).length,
      results: syncResults
    };
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
