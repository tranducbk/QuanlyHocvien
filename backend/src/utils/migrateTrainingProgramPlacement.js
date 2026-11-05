require('dotenv').config();
const { Client } = require('pg');
const dbConfig = require('../config/dbConfig');

const mode = process.argv[2];
if (process.argv.length !== 3 || !['--report', '--dry-run', '--apply'].includes(mode)) {
  console.error('Dùng --report để kiểm tra, --dry-run để thử rồi rollback, hoặc --apply để thêm cấu trúc.');
  process.exit(1);
}

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

const COLUMNS = ['university_id', 'organization_id', 'education_level_id'];

async function tableExists(client, table) {
  const result = await client.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = current_schema() AND table_name = $1
    ) AS present
  `, [table]);
  return result.rows[0].present;
}

async function tableReport(client) {
  const rows = [];
  for (const table of ['training_programs', 'universities', 'organizations', 'education_levels']) {
    if (!(await tableExists(client, table))) {
      rows.push({ table, present: false, count: null });
      continue;
    }
    const count = await client.query(`SELECT COUNT(*)::int AS count FROM ${table}`);
    rows.push({ table, present: true, count: count.rows[0].count });
  }
  console.table(rows);
}

async function columnReport(client) {
  if (!(await tableExists(client, 'training_programs'))) return;
  const result = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'training_programs'
      AND column_name = ANY($1)
    ORDER BY column_name
  `, [COLUMNS]);
  const present = new Set(result.rows.map((row) => row.column_name));
  console.table(COLUMNS.map((column) => ({ column, present: present.has(column) })));
}

async function report(client) {
  await tableReport(client);
  await columnReport(client);
}

async function main() {
  const client = new Client(connection);
  let inTransaction = false;
  try {
    await client.connect();
    const current = await client.query('SELECT current_database() AS name');
    console.log('Database:', current.rows[0].name);
    if (process.env.QLHV_EXPECT_DATABASE && current.rows[0].name !== process.env.QLHV_EXPECT_DATABASE) {
      throw new Error('Sai database kiểm thử; dừng trước khi chạy migration');
    }
    await client.query(mode === '--report' ? 'BEGIN READ ONLY' : 'BEGIN');
    inTransaction = true;
    if (mode !== '--report') await client.query("SET LOCAL lock_timeout = '2s'");

    if (mode !== '--report') {
      for (const table of ['training_programs', 'universities', 'organizations', 'education_levels']) {
        if (!(await tableExists(client, table))) throw new Error(`Chưa có bảng ${table}`);
      }

      await client.query('ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS university_id UUID');
      await client.query('ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS organization_id UUID');
      await client.query('ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS education_level_id UUID');

      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'training_programs_university_fk'
          ) THEN
            ALTER TABLE training_programs
              ADD CONSTRAINT training_programs_university_fk
              FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE RESTRICT;
          END IF;
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'training_programs_organization_fk'
          ) THEN
            ALTER TABLE training_programs
              ADD CONSTRAINT training_programs_organization_fk
              FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;
          END IF;
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'training_programs_placement_pair_chk'
          ) THEN
            ALTER TABLE training_programs
              ADD CONSTRAINT training_programs_placement_pair_chk
              CHECK ((university_id IS NULL) = (organization_id IS NULL));
          END IF;
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'training_programs_education_level_fk'
          ) THEN
            ALTER TABLE training_programs
              ADD CONSTRAINT training_programs_education_level_fk
              FOREIGN KEY (education_level_id) REFERENCES education_levels(id) ON DELETE RESTRICT;
          END IF;
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'training_programs_education_level_chk'
          ) THEN
            ALTER TABLE training_programs
              ADD CONSTRAINT training_programs_education_level_chk
              CHECK (education_level_id IS NULL OR (university_id IS NOT NULL AND organization_id IS NOT NULL));
          END IF;
        END $$
      `);
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS training_programs_he5_placement_uidx
        ON training_programs (training_system_id, university_id, organization_id, education_level_id)
        WHERE education_level_id IS NOT NULL
      `);
    }

    if (mode === '--dry-run') console.log('Trong giao dịch thử:');
    await report(client);
    await client.query(mode === '--apply' ? 'COMMIT' : 'ROLLBACK');
    inTransaction = false;
    if (mode === '--dry-run') {
      console.log('Sau rollback:');
      await report(client);
      console.log('Đã rollback toàn bộ thay đổi thử; database giữ nguyên.');
    }
  } catch (error) {
    if (inTransaction) await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Không thể kiểm tra hoặc thêm cột gắn trường/ngành cho chương trình:', error.code || error.message);
  process.exitCode = 1;
});
