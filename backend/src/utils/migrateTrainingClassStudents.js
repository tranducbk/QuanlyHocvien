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
  const result = await client.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'training_class_id'
    ) AS present
  `);
  const present = result.rows[0].present;
  const count = present ? (await client.query('SELECT COUNT(*)::int AS count FROM profiles WHERE training_class_id IS NOT NULL')).rows[0].count : null;
  console.table([{ column: 'profiles.training_class_id', present, assignedStudents: count }]);
}

async function main() {
  const client = new Client(connection);
  let inTransaction = false;
  try {
    await client.connect();
    const database = (await client.query('SELECT current_database() AS name')).rows[0].name;
    console.log('Database:', database);
    if (process.env.QLHV_EXPECT_DATABASE && process.env.QLHV_EXPECT_DATABASE !== database) {
      throw new Error('Sai database dự kiến; dừng migration');
    }
    await client.query(mode === '--report' ? 'BEGIN READ ONLY' : 'BEGIN');
    inTransaction = true;
    if (mode !== '--report') {
      for (const table of ['profiles', 'training_classes']) {
        if (!(await client.query('SELECT to_regclass($1) AS name', [table])).rows[0].name) {
          throw new Error(`Thiếu bảng ${table}`);
        }
      }
      await client.query("SET LOCAL lock_timeout = '2s'");
      await client.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS training_class_id UUID');
      await client.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_training_class_fk') THEN
            ALTER TABLE profiles ADD CONSTRAINT profiles_training_class_fk
              FOREIGN KEY (training_class_id) REFERENCES training_classes(id) ON DELETE RESTRICT;
          END IF;
        END $$
      `);
      await client.query('CREATE INDEX IF NOT EXISTS profiles_training_class_id_idx ON profiles(training_class_id)');
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
  console.error('Không thể cập nhật quan hệ lớp học viên:', error.code || error.message);
  process.exitCode = 1;
});
