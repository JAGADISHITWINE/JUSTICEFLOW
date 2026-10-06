const { query } = require('../../database/db');
const bcrypt = require('bcryptjs');

class UserModel {
  static async findByEmail(email) {
    const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const rows = await query(
      'SELECT id, email, name, avatar, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async create({ email, password, name, avatar, role }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const result = await query(
      'INSERT INTO users (email, password, name, avatar, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, name, avatar || null, role || 'lawyer']
    );
    return {
      id: result.insertId,
      email,
      name,
      avatar,
      role: role || 'lawyer'
    };
  }

  static async comparePassword(candidatePassword, hash) {
    return bcrypt.compare(candidatePassword, hash);
  }

  static async getAllStaff() {
    return query(
      'SELECT id, email, name, avatar, role, created_at FROM users ORDER BY name ASC'
    );
  }

  static async getSessionStatus(id) {
    const rows = await query(
      `SELECT id, email, name, role, is_active_session, active_session_token, 
              session_started_at, last_activity,
              TIMESTAMPDIFF(SECOND, last_activity, NOW()) as inactive_seconds,
              TIMESTAMPDIFF(SECOND, session_started_at, NOW()) as session_seconds
       FROM users WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async setActiveSession(id, token) {
    return query(
      `UPDATE users 
       SET is_active_session = 1,
           active_session_token = ?,
           session_started_at = NOW(),
           last_activity = NOW()
       WHERE id = ?`,
      [token, id]
    );
  }

  static async clearActiveSession(id) {
    return query(
      `UPDATE users 
       SET is_active_session = 0,
           active_session_token = NULL,
           session_started_at = NULL,
           last_activity = NULL
       WHERE id = ?`,
      [id]
    );
  }

  static async updateLastActivity(id) {
    return query(
      `UPDATE users 
       SET last_activity = NOW()
       WHERE id = ? AND is_active_session = 1`,
      [id]
    );
  }

  static async setResetOtp(email, otp) {
    return query(
      `UPDATE users 
       SET reset_otp = ?,
           reset_otp_expires_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
       WHERE email = ?`,
      [otp, email]
    );
  }

  static async verifyResetOtp(email, otp) {
    const rows = await query(
      `SELECT id, email, name, reset_otp, reset_otp_expires_at 
       FROM users 
       WHERE email = ? AND reset_otp = ? AND reset_otp_expires_at >= NOW()`,
      [email, otp]
    );
    return rows[0] || null;
  }

  static async updatePassword(email, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    return query(
      `UPDATE users 
       SET password = ?,
           reset_otp = NULL,
           reset_otp_expires_at = NULL,
           is_active_session = 0,
           active_session_token = NULL
       WHERE email = ?`,
      [hashedPassword, email]
    );
  }
}

module.exports = UserModel;


