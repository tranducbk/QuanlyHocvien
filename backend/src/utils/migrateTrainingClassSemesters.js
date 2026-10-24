require('dotenv').config();
const { Client } = require('pg');
const config = require('../config/dbConfig');

const mode = process.argv[2];
if (!['--report', '--dry-run', '--apply'].includes(mode) || process.argv.length !== 3) {
  console.error('Dùng --report, --dry-run hoặc --apply.');
  process.exit(1);
}
const connection = config.URL
  ? { connectionString: config.URL }
  : { host: config.HOST, port: config.port, user: config.USER, password: config.PASSWORD, database: config.DB };
if (config.ssl) connection.ssl = { rejectUnauthorized: false };

async function main() {
  const client = new Client(connection);
  let inTransaction = false;
  try {
    await client.connect();
    const database = (await client.query('SELECT current_database() AS name')).rows[0].name;
    console.log('Database:', database);
    if (process.env.QLHV_EXPECT_DATABASE && database !== process.env.QLHV_EXPECT_DATABASE) {
      throw new Error('Sai database dự kiến; dừng migration');
    }
    await client.query(mode === '--report' ? 'BEGIN READ ONLY' : 'BEGIN');
    inTransaction = true;
    if (mode !== '--report') {
      if (!(await client.query("SELECT to_regclass('training_classes') AS name")).rows[0].name) {
        throw new Error('Thiếu bảng training_classes');
      }
      await client.query("SET LOCAL lock_timeout = '2s'");
      await client.query(`
        CREATE TABLE IF NOT EXISTS training_class_semesters (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          training_class_id UUID NOT NULL REFERENCES training_classes(id) ON DELETE RESTRICT,
          code INTEGER NOT NULL CHECK (code BETWEEN 1 AND 4),
          school_year VARCHAR(50) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT training_class_semesters_unique UNIQUE (training_class_id, school_year, code)
        )
      `);
    }
    const present = (await client.query("SELECT to_regclass('training_class_semesters') AS name")).rows[0].name !== null;
    const count = present ? (await client.query('SELECT COUNT(*)::int AS count FROM training_class_semesters')).rows[0].count : null;
    console.table([{ table: 'training_class_semesters', present, count }]);
    await client.query(mode === '--apply' ? 'COMMIT' : 'ROLLBACK');
    inTransaction = false;
  } catch (error) {
    if (inTransaction) await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}
main().catch((error) => {
  console.error('Không thể cập nhật học kỳ của lớp:', error.code || error.message);
  process.exitCode = 1;
});
