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

async function report(client) {
  const rows = [];
  for (const table of ['training_class_achievements', 'training_class_duty_schedules']) {
    const present = (await client.query('SELECT to_regclass($1) AS name', [table])).rows[0].name !== null;
    const count = present ? (await client.query(`SELECT COUNT(*)::int AS count FROM ${table}`)).rows[0].count : null;
    rows.push({ table, present, count });
  }
  console.table(rows);
}

async function main() {
  const client = new Client(connection);
  let inTransaction = false;
  try {
    await client.connect();
    const database = (await client.query('SELECT current_database() AS name')).rows[0].name;
    console.log('Database:', database);
    if (process.env.QLHV_EXPECT_DATABASE && database !== process.env.QLHV_EXPECT_DATABASE) throw new Error('Sai database dự kiến');
    await client.query(mode === '--report' ? 'BEGIN READ ONLY' : 'BEGIN');
    inTransaction = true;
    if (mode !== '--report') {
      for (const table of ['training_classes', 'users', 'profiles']) {
        if (!(await client.query('SELECT to_regclass($1) AS name', [table])).rows[0].name) throw new Error(`Thiếu bảng ${table}`);
      }
      await client.query("SET LOCAL lock_timeout = '2s'");
      await client.query(`
        CREATE TABLE IF NOT EXISTS training_class_achievements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          training_class_id UUID NOT NULL REFERENCES training_classes(id) ON DELETE RESTRICT,
          student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          category VARCHAR(40) NOT NULL CHECK (category IN ('AWARD', 'SCIENTIFIC_TOPIC', 'SCIENTIFIC_INITIATIVE')),
          title VARCHAR(255) NOT NULL,
          award VARCHAR(255),
          year INTEGER CHECK (year BETWEEN 1900 AND 2200),
          description TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS training_class_duty_schedules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          training_class_id UUID NOT NULL REFERENCES training_classes(id) ON DELETE RESTRICT,
          student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          position VARCHAR(100) NOT NULL,
          work_day DATE NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT training_class_duty_student_day_uniq UNIQUE (training_class_id, student_user_id, work_day)
        )
      `);
      await client.query('CREATE INDEX IF NOT EXISTS training_class_achievements_class_idx ON training_class_achievements(training_class_id)');
      await client.query('CREATE INDEX IF NOT EXISTS training_class_duty_class_day_idx ON training_class_duty_schedules(training_class_id, work_day)');
    }
    await report(client);
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
  console.error('Không thể cập nhật thành tích và lịch trực:', error.code || error.message);
  process.exitCode = 1;
});
