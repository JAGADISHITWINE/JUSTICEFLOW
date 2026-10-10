const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function importDatabase() {
  const dumpPath = path.join(__dirname, 'justiceflow_dump.sql');
  if (!fs.existsSync(dumpPath)) {
    console.error(`Dump file not found at: ${dumpPath}`);
    process.exit(1);
  }

  const dbName = process.env.DB_NAME || 'justiceflow_db';
  console.log(`Connecting to MySQL host: ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}...`);

  // First ensure database exists
  const rootConn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });
  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  console.log(`Database '${dbName}' verified/created.`);
  await rootConn.end();

  // Connect to target database with multiple statements enabled
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: dbName,
    multipleStatements: true
  });

  console.log(`Reading SQL dump from ${dumpPath}...`);
  const sql = fs.readFileSync(dumpPath, 'utf8');

  console.log('Executing SQL dump into database...');
  await conn.query('SET FOREIGN_KEY_CHECKS = 0;');
  await conn.query(sql);
  await conn.query('SET FOREIGN_KEY_CHECKS = 1;');
  await conn.end();

  console.log(`✅ Database dump imported successfully into '${dbName}'!`);
}

importDatabase().catch((err) => {
  console.error('❌ Database import failed:', err.message);
  process.exit(1);
});
