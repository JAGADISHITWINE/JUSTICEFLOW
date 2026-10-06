const { query } = require('../../database/db');

class ClientModel {
  static async findAll({ search, status, page = 1, limit = 10, userId }) {
    let sql = `
      SELECT c.*, u.name as assigned_lawyer,
      (SELECT COUNT(*) FROM cases WHERE client_id = c.id) as case_count,
      (SELECT COALESCE(SUM(budget), 0) FROM cases WHERE client_id = c.id) as total_budget,
      (SELECT COALESCE(SUM(spent), 0) FROM cases WHERE client_id = c.id) as total_spent
      FROM clients c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ? OR c.city LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (status && status !== 'All') {
      sql += ` AND c.status = ?`;
      params.push(status);
    }

    // Count query for pagination
    let countSql = `SELECT COUNT(*) as total FROM clients c WHERE 1=1`;
    const countParams = [];
    if (search) {
      countSql += ` AND (c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ? OR c.city LIKE ?)`;
      const term = `%${search}%`;
      countParams.push(term, term, term, term);
    }
    if (status && status !== 'All') {
      countSql += ` AND c.status = ?`;
      countParams.push(status);
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
    const clients = await query(
      `SELECT c.*, u.name as assigned_lawyer, u.email as lawyer_email
       FROM clients c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [id]
    );

    if (!clients.length) return null;
    const client = clients[0];

    // Fetch related cases
    const cases = await query(
      `SELECT id, case_name, case_number, case_type, status, filing_date, budget, spent 
       FROM cases WHERE client_id = ? ORDER BY created_at DESC`,
      [id]
    );
    client.cases = cases;

    return client;
  }

  static async create(data) {
    const { user_id, name, email, phone, address, city, state, zip_code, status } = data;
    const result = await query(
      `INSERT INTO clients (user_id, name, email, phone, address, city, state, zip_code, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        name,
        email || null,
        phone || null,
        address || null,
        city || null,
        state || null,
        zip_code || null,
        status || 'Active'
      ]
    );
    return this.findById(result.insertId);
  }

  static async update(id, data) {
    const { name, email, phone, address, city, state, zip_code, status, user_id } = data;
    await query(
      `UPDATE clients 
       SET name = COALESCE(?, name),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           address = COALESCE(?, address),
           city = COALESCE(?, city),
           state = COALESCE(?, state),
           zip_code = COALESCE(?, zip_code),
           status = COALESCE(?, status),
           user_id = COALESCE(?, user_id)
       WHERE id = ?`,
      [
        name,
        email,
        phone,
        address,
        city,
        state,
        zip_code,
        status,
        user_id,
        id
      ]
    );
    return this.findById(id);
  }

  static async delete(id) {
    const result = await query('DELETE FROM clients WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getStats() {
    const rows = await query(`
      SELECT 
        COUNT(*) as total_clients,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_clients,
        SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) as inactive_clients
      FROM clients
    `);
    return rows[0] || { total_clients: 0, active_clients: 0, inactive_clients: 0 };
  }
}

module.exports = ClientModel;
