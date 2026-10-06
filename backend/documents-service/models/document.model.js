const { query } = require('../../database/db');

class DocumentModel {
  static async findAll({ case_id, search, doc_type }) {
    let sql = `
      SELECT d.*, c.case_name, c.case_number, u.name as uploader_name
      FROM documents d
      JOIN cases c ON d.case_id = c.id
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (case_id) {
      sql += ' AND d.case_id = ?';
      params.push(case_id);
    }

    if (doc_type && doc_type !== 'All') {
      sql += ' AND d.doc_type = ?';
      params.push(doc_type);
    }

    if (search) {
      sql += ' AND (d.doc_name LIKE ? OR c.case_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY d.uploaded_at DESC';

    return query(sql, params);
  }

  static async findById(id) {
    const rows = await query(
      `SELECT d.*, c.case_name, c.case_number, u.name as uploader_name
       FROM documents d
       JOIN cases c ON d.case_id = c.id
       LEFT JOIN users u ON d.uploaded_by = u.id
       WHERE d.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async create({ case_id, doc_name, doc_type, file_path, file_size, uploaded_by }) {
    const result = await query(
      `INSERT INTO documents (case_id, doc_name, doc_type, file_path, file_size, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [case_id, doc_name, doc_type || 'Other', file_path, file_size || 0, uploaded_by || null]
    );
    return this.findById(result.insertId);
  }

  static async delete(id) {
    const result = await query('DELETE FROM documents WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = DocumentModel;
