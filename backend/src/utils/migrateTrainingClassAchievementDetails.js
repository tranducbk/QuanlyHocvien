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
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'training_class_achievements'
      AND column_name IN ('school_year', 'semester', 'content')
  `);
  const present = new Set(result.rows.map((row) => row.column_name));
  const count = (await client.query('SELECT COUNT(*)::int AS count FROM training_class_achievements')).rows[0].count;
  console.log('Existing achievements:', count);
  console.table(['school_year', 'semester', 'content'].map((column) => ({ column, present: present.has(column) })));
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
    if (!(await client.query("SELECT to_regclass('training_class_achievements') AS name")).rows[0].name) {
      throw new Error('Thiếu bảng training_class_achievements');
    }
    if (mode !== '--report') {
      await client.query("SET LOCAL lock_timeout = '2s'");
      await client.query('ALTER TABLE training_class_achievements ADD COLUMN IF NOT EXISTS school_year VARCHAR(50)');
      await client.query('ALTER TABLE training_class_achievements ADD COLUMN IF NOT EXISTS semester VARCHAR(50)');
      await client.query('ALTER TABLE training_class_achievements ADD COLUMN IF NOT EXISTS content TEXT');
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
  console.error('Không thể cập nhật chi tiết thành tích:', error.code || error.message);
  process.exitCode = 1;
});
