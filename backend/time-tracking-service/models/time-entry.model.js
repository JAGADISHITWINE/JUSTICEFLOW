const { query } = require('../../database/db');

class TimeEntryModel {
  static async findAll({ case_id, user_id, start_date, end_date, is_billable, page = 1, limit = 15 }) {
    let sql = `
      SELECT 
        t.*,
        c.case_name,
        c.case_number,
        cl.name as client_name,
        u.name as lawyer_name,
        (t.hours * t.hourly_rate) as total_amount
      FROM time_entries t
      JOIN cases c ON t.case_id = c.id
      JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (case_id) {
      sql += ' AND t.case_id = ?';
      params.push(case_id);
    }

    if (user_id) {
      sql += ' AND t.user_id = ?';
      params.push(user_id);
    }

    if (start_date) {
      sql += ' AND t.entry_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      sql += ' AND t.entry_date <= ?';
      params.push(end_date);
    }

    if (is_billable !== undefined && is_billable !== '') {
      sql += ' AND t.is_billable = ?';
      params.push(is_billable === 'true' || is_billable === 1 || is_billable === '1' ? 1 : 0);
    }

    // Count
    let countSql = `SELECT COUNT(*) as total FROM time_entries t WHERE 1=1`;
    const countParams = [];
    if (case_id) {
      countSql += ' AND t.case_id = ?';
      countParams.push(case_id);
    }
    if (user_id) {
      countSql += ' AND t.user_id = ?';
      countParams.push(user_id);
    }
    if (start_date) {
      countSql += ' AND t.entry_date >= ?';
      countParams.push(start_date);
    }
    if (end_date) {
      countSql += ' AND t.entry_date <= ?';
      countParams.push(end_date);
    }
    if (is_billable !== undefined && is_billable !== '') {
      countSql += ' AND t.is_billable = ?';
      countParams.push(is_billable === 'true' || is_billable === 1 || is_billable === '1' ? 1 : 0);
    }

    const [countResult] = await query(countSql, countParams);
    const total = countResult ? countResult.total : 0;

    sql += ' ORDER BY t.entry_date DESC, t.created_at DESC LIMIT ? OFFSET ?';
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
    const rows = await query(
      `SELECT t.*, c.case_name, c.case_number, cl.name as client_name, u.name as lawyer_name,
        (t.hours * t.hourly_rate) as total_amount
       FROM time_entries t
       JOIN cases c ON t.case_id = c.id
       JOIN clients cl ON c.client_id = cl.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async create({ user_id, case_id, description, hours, hourly_rate, entry_date, is_billable }) {
    const result = await query(
      `INSERT INTO time_entries (user_id, case_id, description, hours, hourly_rate, entry_date, is_billable)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        case_id,
        description,
        hours,
        hourly_rate || 200.00,
        entry_date || new Date().toISOString().slice(0, 10),
        is_billable === false || is_billable === 0 ? 0 : 1
      ]
    );

    // Update case spent amount
    await this.recalculateCaseSpent(case_id);

    return this.findById(result.insertId);
  }

  static async update(id, data) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const { description, hours, hourly_rate, entry_date, is_billable, case_id } = data;

    await query(
      `UPDATE time_entries SET
        description = COALESCE(?, description),
        hours = COALESCE(?, hours),
        hourly_rate = COALESCE(?, hourly_rate),
        entry_date = COALESCE(?, entry_date),
        is_billable = COALESCE(?, is_billable),
        case_id = COALESCE(?, case_id)
      WHERE id = ?`,
      [
        description,
        hours,
        hourly_rate,
        entry_date,
        is_billable,
        case_id,
        id
      ]
    );

    await this.recalculateCaseSpent(existing.case_id);
    if (case_id && case_id !== existing.case_id) {
      await this.recalculateCaseSpent(case_id);
    }

    return this.findById(id);
  }

  static async delete(id) {
    const existing = await this.findById(id);
    if (!existing) return false;

    const result = await query('DELETE FROM time_entries WHERE id = ?', [id]);
    await this.recalculateCaseSpent(existing.case_id);
    return result.affectedRows > 0;
  }

  static async recalculateCaseSpent(caseId) {
    try {
      const [sumRow] = await query(
        `SELECT COALESCE(SUM(hours * hourly_rate), 0) as total_spent
         FROM time_entries 
         WHERE case_id = ? AND is_billable = 1`,
        [caseId]
      );
      const spent = sumRow ? sumRow.total_spent : 0;
      await query('UPDATE cases SET spent = ? WHERE id = ?', [spent, caseId]);
    } catch (err) {
      console.error('[Recalculate Case Spent Error]', err);
    }
  }

  static async getSummaryStats() {
    const rows = await query(`
      SELECT 
        COALESCE(SUM(hours), 0) as total_hours,
        COALESCE(SUM(CASE WHEN is_billable = 1 THEN hours ELSE 0 END), 0) as billable_hours,
        COALESCE(SUM(CASE WHEN is_billable = 0 THEN hours ELSE 0 END), 0) as non_billable_hours,
        COALESCE(SUM(CASE WHEN is_billable = 1 THEN hours * hourly_rate ELSE 0 END), 0) as total_billed_revenue,
        COUNT(*) as total_entries
      FROM time_entries
    `);
    return rows[0] || {
      total_hours: 0,
      billable_hours: 0,
      non_billable_hours: 0,
      total_billed_revenue: 0,
      total_entries: 0
    };
  }
}

module.exports = TimeEntryModel;
