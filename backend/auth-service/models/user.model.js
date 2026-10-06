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
}

module.exports = UserModel;
