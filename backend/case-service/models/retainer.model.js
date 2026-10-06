const { pool } = require('../../database/db');

class RetainerModel {
  static async findAll(filters = {}) {
    let sql = `
      SELECT 
        ra.*,
        c.case_number,
        c.case_name,
        cl.name as client_name,
        cl.email as client_email,
        u.name as creator_name
      FROM retainer_agreements ra
      LEFT JOIN cases c ON ra.case_id = c.id
      LEFT JOIN clients cl ON ra.client_id = cl.id
      LEFT JOIN users u ON ra.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.case_id) {
      sql += ' AND ra.case_id = ?';
      params.push(filters.case_id);
    }
    if (filters.client_id) {
      sql += ' AND ra.client_id = ?';
      params.push(filters.client_id);
    }
    if (filters.status) {
      sql += ' AND ra.status = ?';
      params.push(filters.status);
    }

    sql += ' ORDER BY ra.created_at DESC';
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  static async findById(id) {
    const sql = `
      SELECT 
        ra.*,
        c.case_number,
        c.case_name,
        cl.name as client_name,
        cl.email as client_email,
        cl.phone as client_phone,
        cl.address as client_address,
        u.name as creator_name
      FROM retainer_agreements ra
      LEFT JOIN cases c ON ra.case_id = c.id
      LEFT JOIN clients cl ON ra.client_id = cl.id
      LEFT JOIN users u ON ra.created_by = u.id
      WHERE ra.id = ?
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const sql = `
      INSERT INTO retainer_agreements (
        case_id, client_id, title, version, fee_type,
        retainer_amount, hourly_rate, terms_content,
        redline_notes, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.case_id || null,
      data.client_id,
      data.title,
      data.version || 'v1.0',
      data.fee_type || 'Retainer Draw',
      data.retainer_amount || 0,
      data.hourly_rate || 0,
      data.terms_content,
      data.redline_notes || null,
      data.status || 'Draft',
      data.created_by || 1
    ];

    const [result] = await pool.query(sql, values);
    return this.findById(result.insertId);
  }

  static async createRevision(prevId, data) {
    const prev = await this.findById(prevId);
    if (!prev) throw new Error('Previous retainer agreement not found');

    // Mark previous as Superseded if already active or draft
    await pool.query('UPDATE retainer_agreements SET status = "Superseded" WHERE id = ?', [prevId]);

    // Parse version number (e.g. v1.0 -> v2.0)
    let nextVersion = 'v2.0';
    if (prev.version && prev.version.startsWith('v')) {
      const num = parseFloat(prev.version.replace('v', ''));
      if (!isNaN(num)) {
        nextVersion = `v${(num + 1.0).toFixed(1)}`;
      }
    }

    const sql = `
      INSERT INTO retainer_agreements (
        case_id, client_id, title, version, previous_version_id, fee_type,
        retainer_amount, hourly_rate, terms_content, redline_notes, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', ?)
    `;
    const values = [
      prev.case_id,
      prev.client_id,
      data.title || prev.title,
      nextVersion,
      prev.id,
      data.fee_type || prev.fee_type,
      data.retainer_amount !== undefined ? data.retainer_amount : prev.retainer_amount,
      data.hourly_rate !== undefined ? data.hourly_rate : prev.hourly_rate,
      data.terms_content || prev.terms_content,
      data.redline_notes || `Revision created from ${prev.version}`,
      data.created_by || 1
    ];

    const [result] = await pool.query(sql, values);
    return this.findById(result.insertId);
  }

  static async signAgreement(id, signData) {
    const { signature_data, signer_name, signer_email, signer_ip, biometric_timestamp } = signData;
    
    const sql = `
      UPDATE retainer_agreements SET
        status = 'Signed',
        signature_data = ?,
        signer_name = ?,
        signer_email = ?,
        signer_ip = ?,
        biometric_timestamp = ?,
        signed_at = NOW()
      WHERE id = ?
    `;

    await pool.query(sql, [
      signature_data,
      signer_name,
      signer_email,
      signer_ip || '127.0.0.1',
      biometric_timestamp || `SHA256:${Date.now().toString(16)} | Touch/Stylus Canvas`,
      id
    ]);

    return this.findById(id);
  }

  static async updateStatus(id, status) {
    await pool.query('UPDATE retainer_agreements SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM retainer_agreements WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = RetainerModel;
