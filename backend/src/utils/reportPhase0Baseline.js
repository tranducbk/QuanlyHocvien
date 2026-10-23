require('dotenv').config();
const { Client } = require('pg');
const dbConfig = require('../config/dbConfig');

const tables = [
  'training_systems', 'users', 'profiles', 'classes', 'military_classes',
  'yearly_results', 'semester_results', 'subject_results',
  'military_subject_results', 'grade_requests',
];

const connection = dbConfig.URL
  ? { connectionString: dbConfig.URL }
  : {
      host: dbConfig.HOST,
      port: dbConfig.port,
      user: dbConfig.USER,
      password: dbConfig.PASSWORD,
      database: dbConfig.DB,
    };
if (dbConfig.ssl) connection.ssl = { rejectUnauthorized: false };

const main = async () => {
  const client = new Client(connection);
  try {
    await client.connect();
    await client.query('BEGIN READ ONLY');

    const codes = await client.query('SELECT code FROM training_systems ORDER BY code');
    console.log('Hệ đào tạo:', codes.rows.map((row) => row.code).join(', '));

    const accounts = await client.query(`
      SELECT u.role, COALESCE(ts.code, 'UNASSIGNED') AS system, COUNT(*)::int AS count
      FROM users u
      LEFT JOIN training_systems ts ON ts.id = u.training_system_id
      GROUP BY u.role, ts.code
      ORDER BY u.role, ts.code
    `);
    console.log('Tài khoản theo vai trò và hệ:');
    console.table(accounts.rows);

    const existing = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = current_schema() AND table_name = ANY($1)
    `, [tables]);
    const available = new Set(existing.rows.map((row) => row.table_name));
    const counts = [];
    for (const table of tables) {
      if (!available.has(table)) {
        counts.push({ table, count: 'MISSING' });
        continue;
      }
      const result = await client.query(`SELECT COUNT(*)::int AS count FROM "${table}"`);
      counts.push({ table, count: result.rows[0].count });
    }
    console.log('Số bản ghi theo bảng:');
    console.table(counts);
    await client.query('ROLLBACK');
  } finally {
    await client.end();
  }
};

main().catch((error) => {
  console.error('Không đọc được baseline database:', error.code || error.message);
  process.exitCode = 1;
});
