const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'justiceflow_db',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  dateStrings: true
});

async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    console.error('[DB Query Error]', err.message, 'SQL:', sql);
    throw err;
  }
}

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    // console.log('[MySQL] Connected to database successfully');
    connection.release();
    return true;
  } catch (err) {
    console.error('[MySQL] Connection failed:', err.message);
    return false;
  }
}

module.exports = {
  pool,
  query,
  testConnection
};
