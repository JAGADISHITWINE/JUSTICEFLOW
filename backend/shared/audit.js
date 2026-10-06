const { query } = require('../database/db');

async function logAudit(userId, action, entityType, entityId) {
  try {
    await query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)',
      [userId || null, action, entityType, entityId || null]
    );
  } catch (err) {
    console.error('[Audit Log Error]', err.message);
  }
}

module.exports = {
  logAudit
};
