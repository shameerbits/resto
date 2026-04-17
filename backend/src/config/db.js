const mysql = require('mysql2/promise');
const { db } = require('./env');

const pool = mysql.createPool({
  host: db.host,
  port: db.port,
  user: db.user,
  password: db.password,
  database: db.database,
  connectionLimit: db.connectionLimit,
});

async function pingDatabase() {
  await pool.query('SELECT 1 AS ok');
  return true;
}

module.exports = {
  pool,
  pingDatabase,
};
