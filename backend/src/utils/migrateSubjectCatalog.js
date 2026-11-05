require('dotenv').config();
const { Client } = require('pg');
const dbConfig = require('../config/dbConfig');

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

async function report(client) {
  const tables = await client.query(`SELECT table_name FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name IN ('subject_catalogs', 'training_class_subjects')`);
  console.table(tables.rows);
  const columns = await client.query(`SELECT column_name FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'training_class_subjects'
    AND column_name = 'catalog_subject_id'`);
  console.log('Cột catalog_subject_id:', columns.rowCount ? 'đã có' : 'chưa có');
}

async function main() {
  const client = new Client(connection);
  let inTransaction = false;
  try {
    await client.connect();
    const current = await client.query('SELECT current_database() AS name');
    console.log('Database:', current.rows[0].name);
    if (process.env.QLHV_EXPECT_DATABASE && process.env.QLHV_EXPECT_DATABASE !== current.rows[0].name) {
      throw new Error('Sai database; dừng migration');
    }
    await client.query(mode === '--report' ? 'BEGIN READ ONLY' : 'BEGIN');
    inTransaction = true;
    if (mode !== '--report') {
      await client.query("SET LOCAL lock_timeout = '2s'");
      await client.query(`CREATE TABLE IF NOT EXISTS subject_catalogs (
        id UUID PRIMARY KEY,
        training_system_id UUID NOT NULL REFERENCES training_systems(id) ON DELETE RESTRICT,
        subject_code VARCHAR(50) NOT NULL CHECK (length(trim(subject_code)) > 0),
        subject_name VARCHAR(255) NOT NULL CHECK (length(trim(subject_name)) > 0),
        credits INTEGER NOT NULL DEFAULT 0 CHECK (credits BETWEEN 0 AND 100),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (training_system_id, subject_code)
      )`);
      // Existing subjects remain intact, without a catalog link until selected from the catalog.
      await client.query(`ALTER TABLE training_class_subjects
        ADD COLUMN IF NOT EXISTS catalog_subject_id UUID REFERENCES subject_catalogs(id) ON DELETE RESTRICT`);
      await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS training_class_subjects_catalog_unique
        ON training_class_subjects (training_class_id, semester_id, catalog_subject_id)`);
    }
    await report(client);
    await client.query(mode === '--apply' ? 'COMMIT' : 'ROLLBACK');
    inTransaction = false;
    console.log(mode === '--apply' ? 'Đã áp dụng migration.' : 'Đã kết thúc, không lưu thay đổi database.');
  } catch (error) {
    if (inTransaction) await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}
main().catch((error) => {
  console.error('Migration danh mục môn thất bại:', error.code || error.message);
  process.exitCode = 1;
});
