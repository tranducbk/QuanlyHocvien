require('dotenv').config();
const { Client } = require('pg');
const dbConfig = require('../config/dbConfig');

const mode = process.argv[2];
if (process.argv.length !== 3 || !['--report', '--dry-run', '--apply'].includes(mode)) {
  console.error('Dùng --report, --dry-run hoặc --apply.');
  process.exit(1);
}

const connection = dbConfig.URL
  ? { connectionString: dbConfig.URL }
  : { host: dbConfig.HOST, port: dbConfig.port, user: dbConfig.USER, password: dbConfig.PASSWORD, database: dbConfig.DB };
if (dbConfig.ssl) connection.ssl = { rejectUnauthorized: false };

async function report(client) {
  const rows = [];
  for (const table of ['training_classes']) {
    const result = await client.query('SELECT to_regclass($1) AS name', [table]);
    const present = result.rows[0].name !== null;
    const count = present ? (await client.query(`SELECT COUNT(*)::int AS count FROM ${table}`)).rows[0].count : null;
    rows.push({ table, present, count });
  }
  console.table(rows);
}

async function migrate(client) {
  for (const table of ['training_systems', 'universities', 'users', 'training_programs', 'curriculum_versions']) {
    const result = await client.query('SELECT to_regclass($1) AS name', [table]);
    if (!result.rows[0].name) throw new Error(`Thiếu bảng nền ${table}; dừng migration`);
  }
  await client.query('CREATE UNIQUE INDEX IF NOT EXISTS training_programs_id_system_uniq ON training_programs(id, training_system_id)');
  await client.query('CREATE UNIQUE INDEX IF NOT EXISTS curriculum_versions_id_program_uniq ON curriculum_versions(id, training_program_id)');
  await client.query(`
    CREATE TABLE IF NOT EXISTS training_classes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      training_system_id UUID NOT NULL REFERENCES training_systems(id) ON DELETE RESTRICT,
      code VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      commander_id UUID REFERENCES users(id) ON DELETE RESTRICT,
      education_provider_id UUID REFERENCES universities(id) ON DELETE RESTRICT,
      training_program_id UUID,
      curriculum_version_id UUID,
      start_year INTEGER,
      end_year INTEGER,
      status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT training_classes_program_pair_chk CHECK ((training_program_id IS NULL) = (curriculum_version_id IS NULL)),
      CONSTRAINT training_classes_year_order_chk CHECK (end_year IS NULL OR start_year IS NULL OR end_year >= start_year),
      CONSTRAINT training_classes_status_chk CHECK (status IN ('ACTIVE', 'INACTIVE')),
      CONSTRAINT training_classes_program_system_fk FOREIGN KEY (training_program_id, training_system_id)
        REFERENCES training_programs(id, training_system_id) ON DELETE RESTRICT,
      CONSTRAINT training_classes_version_program_fk FOREIGN KEY (curriculum_version_id, training_program_id)
        REFERENCES curriculum_versions(id, training_program_id) ON DELETE RESTRICT
    )
  `);
  await client.query('CREATE UNIQUE INDEX IF NOT EXISTS training_classes_system_code_uniq ON training_classes(training_system_id, code)');
}

async function main() {
  const client = new Client(connection);
  let inTransaction = false;
  try {
    await client.connect();
    const database = (await client.query('SELECT current_database() AS name')).rows[0].name;
    console.log('Database:', database);
    if (process.env.QLHV_EXPECT_DATABASE && database !== process.env.QLHV_EXPECT_DATABASE) {
      throw new Error('Sai database dự kiến; dừng trước khi chạy migration');
    }
    await client.query(mode === '--report' ? 'BEGIN READ ONLY' : 'BEGIN');
    inTransaction = true;
    if (mode !== '--report') {
      await client.query("SET LOCAL lock_timeout = '2s'");
      await migrate(client);
    }
    await report(client);
    await client.query(mode === '--apply' ? 'COMMIT' : 'ROLLBACK');
    inTransaction = false;
    if (mode === '--dry-run') {
      console.log('Sau rollback:');
      await report(client);
    }
  } catch (error) {
    if (inTransaction) await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Không thể kiểm tra hoặc tạo cấu trúc lớp:', error.code || error.message);
  process.exitCode = 1;
});
