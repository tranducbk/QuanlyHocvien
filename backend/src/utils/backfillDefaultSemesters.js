require('dotenv').config();
const { Client } = require('pg');
const { randomUUID } = require('node:crypto');
const dbConfig = require('../config/dbConfig');
const { semesterRows } = require('../services/training-program/defaultSemesters');

const mode = process.argv[2];
if (process.argv.length !== 3 || !['--report', '--dry-run', '--apply'].includes(mode)) {
  console.error('Dùng --report, --dry-run (rollback) hoặc --apply.');
  process.exit(1);
}
const connection = dbConfig.URL ? { connectionString: dbConfig.URL } : {
  host: dbConfig.HOST, port: dbConfig.port, user: dbConfig.USER,
  password: dbConfig.PASSWORD, database: dbConfig.DB,
};
if (dbConfig.ssl) connection.ssl = { rejectUnauthorized: false };

async function main() {
  const client = new Client(connection);
  let inTransaction = false;
  try {
    await client.connect();
    const current = await client.query('SELECT current_database() AS name');
    console.log('Database:', current.rows[0].name);
    if (process.env.QLHV_EXPECT_DATABASE && process.env.QLHV_EXPECT_DATABASE !== current.rows[0].name) throw new Error('Sai database');
    await client.query(mode === '--report' ? 'BEGIN READ ONLY' : 'BEGIN');
    inTransaction = true;
    if (mode !== '--report') await client.query("SET LOCAL lock_timeout = '2s'");
    const classes = await client.query('SELECT id, start_year AS "startYear", end_year AS "endYear" FROM training_classes');
    const existing = await client.query('SELECT training_class_id, school_year, code FROM training_class_semesters');
    const existingKeys = new Set(existing.rows.map((row) => `${row.training_class_id}/${row.school_year}/${row.code}`));
    const missing = classes.rows.flatMap(semesterRows).filter((row) => !existingKeys.has(`${row.trainingClassId}/${row.schoolYear}/${row.code}`));
    const years = await client.query('SELECT id, school_year FROM school_years');
    const terms = await client.query('SELECT school_year_id, code FROM semesters');
    const termKeys = new Set(terms.rows.map((row) => `${row.school_year_id}/${row.code}`));
    const missingExternal = years.rows.filter((row) => {
      const year = Number(row.school_year.slice(0, 4));
      return row.school_year === `${year}-${year + 1}`;
    }).flatMap((row) => [1, 2].filter((code) => !termKeys.has(`${row.id}/${code}`)).map((code) => ({ schoolYearId: row.id, code })));
    console.log('Lớp chưa có niên khóa hợp lệ (bỏ qua):', classes.rows.filter((row) => !semesterRows(row).length).length);
    console.log('Học kỳ lớp còn thiếu:', missing.length);
    console.log('Học kỳ năm học chung Hệ 5 còn thiếu:', missingExternal.length);
    if (mode !== '--report') {
      for (const row of missing) {
        await client.query(`INSERT INTO training_class_semesters (id, training_class_id, school_year, code, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW()) ON CONFLICT (training_class_id, school_year, code) DO NOTHING`,
        [randomUUID(), row.trainingClassId, row.schoolYear, row.code]);
      }
      for (const row of missingExternal) {
        await client.query(`INSERT INTO semesters (id, school_year_id, code, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW()) ON CONFLICT (school_year_id, code) DO NOTHING`,
        [randomUUID(), row.schoolYearId, row.code]);
      }
    }
    await client.query(mode === '--apply' ? 'COMMIT' : 'ROLLBACK');
    inTransaction = false;
    console.log(mode === '--apply' ? 'Đã bổ sung kỳ còn thiếu. Không thay đổi kỳ cũ.' : 'Không lưu thay đổi database.');
  } catch (error) {
    if (inTransaction) await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}
main().catch((error) => { console.error('Bổ sung học kỳ thất bại:', error.code || error.message); process.exitCode = 1; });
