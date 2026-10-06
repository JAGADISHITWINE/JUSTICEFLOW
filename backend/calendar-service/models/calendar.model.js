const { pool } = require('../../database/db');

class CalendarModel {
  static async findAll(filters = {}) {
    let sql = `
      SELECT 
        ce.*,
        c.case_number,
        c.case_name AS case_title,
        c.case_name,
        cl.name AS client_name,
        cl.email AS client_email,
        u.name AS attorney_name
      FROM calendar_events ce
      LEFT JOIN cases c ON ce.case_id = c.id
      LEFT JOIN clients cl ON ce.client_id = cl.id
      LEFT JOIN users u ON ce.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.case_id) {
      sql += ' AND ce.case_id = ?';
      params.push(filters.case_id);
    }
    if (filters.event_type) {
      sql += ' AND ce.event_type = ?';
      params.push(filters.event_type);
    }
    if (filters.start_date) {
      sql += ' AND ce.start_time >= ?';
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      sql += ' AND ce.start_time <= ?';
      params.push(filters.end_date);
    }
    if (filters.is_sol !== undefined) {
      sql += ' AND ce.is_statute_of_limitations = ?';
      params.push(filters.is_sol ? 1 : 0);
    }

    sql += ' ORDER BY ce.start_time ASC';
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  static async findById(id) {
    const sql = `
      SELECT 
        ce.*,
        c.case_number,
        c.case_name AS case_title,
        c.case_name,
        cl.name AS client_name,
        cl.email AS client_email,
        u.name AS attorney_name
      FROM calendar_events ce
      LEFT JOIN cases c ON ce.case_id = c.id
      LEFT JOIN clients cl ON ce.client_id = cl.id
      LEFT JOIN users u ON ce.user_id = u.id
      WHERE ce.id = ?
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const sql = `
      INSERT INTO calendar_events (
        user_id, case_id, client_id, title, event_type,
        start_time, end_time, location, court_room, judge_name,
        reminder_minutes, notes, is_statute_of_limitations,
        rule_trigger_name, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.user_id || 1,
      data.case_id || null,
      data.client_id || null,
      data.title,
      data.event_type || 'Hearing',
      data.start_time,
      data.end_time || null,
      data.location || null,
      data.court_room || null,
      data.judge_name || null,
      data.reminder_minutes || 1440,
      data.notes || null,
      data.is_statute_of_limitations ? 1 : 0,
      data.rule_trigger_name || null,
      data.priority || 'Normal'
    ];

    const [result] = await pool.query(sql, values);
    return this.findById(result.insertId);
  }

  static async update(id, data) {
    const sql = `
      UPDATE calendar_events SET
        title = COALESCE(?, title),
        event_type = COALESCE(?, event_type),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        location = COALESCE(?, location),
        court_room = COALESCE(?, court_room),
        judge_name = COALESCE(?, judge_name),
        reminder_minutes = COALESCE(?, reminder_minutes),
        notes = COALESCE(?, notes),
        is_statute_of_limitations = COALESCE(?, is_statute_of_limitations),
        priority = COALESCE(?, priority),
        case_id = COALESCE(?, case_id),
        client_id = COALESCE(?, client_id)
      WHERE id = ?
    `;
    const values = [
      data.title,
      data.event_type,
      data.start_time,
      data.end_time,
      data.location,
      data.court_room,
      data.judge_name,
      data.reminder_minutes,
      data.notes,
      data.is_statute_of_limitations !== undefined ? (data.is_statute_of_limitations ? 1 : 0) : null,
      data.priority,
      data.case_id,
      data.client_id,
      id
    ];

    await pool.query(sql, values);
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM calendar_events WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getUpcomingAlerts() {
    const sql = `
      SELECT 
        ce.*,
        c.case_number,
        c.case_name AS case_title,
        c.case_name,
        cl.name AS client_name,
        cl.email AS client_email,
        cl.phone AS client_phone,
        u.name AS attorney_name,
        u.email AS attorney_email,
        TIMESTAMPDIFF(HOUR, NOW(), ce.start_time) AS hours_until_event
      FROM calendar_events ce
      LEFT JOIN cases c ON ce.case_id = c.id
      LEFT JOIN clients cl ON ce.client_id = cl.id
      LEFT JOIN users u ON ce.user_id = u.id
      WHERE ce.start_time >= NOW()
        AND ce.start_time <= DATE_ADD(NOW(), INTERVAL 8 DAY)
      ORDER BY ce.start_time ASC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  }

  static async markAlertSent(id, alertTier) {
    let col = 'alert_7d_sent';
    if (alertTier === '48h') col = 'alert_48h_sent';
    if (alertTier === '2h') col = 'alert_2h_sent';

    await pool.query(`UPDATE calendar_events SET ${col} = 1 WHERE id = ?`, [id]);
  }
}

module.exports = CalendarModel;
