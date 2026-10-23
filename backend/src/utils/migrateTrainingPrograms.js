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

async function report(client) {
  const rows = [];
  for (const table of ['training_programs', 'curriculum_versions']) {
    const exists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = current_schema() AND table_name = $1
      ) AS present
    `, [table]);
    if (!exists.rows[0].present) {
      rows.push({ table, present: false, count: null });
      continue;
    }
    const count = await client.query(`SELECT COUNT(*)::int AS count FROM ${table}`);
    rows.push({ table, present: true, count: count.rows[0].count });
  }
  console.table(rows);
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
      const systemTable = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = current_schema() AND table_name = 'training_systems'
        ) AS present
      `);
      if (!systemTable.rows[0].present) throw new Error('Chưa có bảng training_systems');

      await client.query(`
        CREATE TABLE IF NOT EXISTS training_programs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          training_system_id UUID NOT NULL REFERENCES training_systems(id) ON DELETE RESTRICT,
          code VARCHAR(50) NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS training_programs_system_code_uniq
        ON training_programs(training_system_id, code)
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS curriculum_versions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          training_program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE RESTRICT,
          version_code VARCHAR(50) NOT NULL,
          name VARCHAR(255) NOT NULL,
          effective_from DATE,
          effective_to DATE,
          status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT curriculum_versions_date_order_chk
            CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from)
        )
      `);
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS curriculum_versions_program_code_uniq
        ON curriculum_versions(training_program_id, version_code)
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
  console.error('Không thể kiểm tra hoặc tạo cấu trúc chương trình:', error.code || error.message);
  process.exitCode = 1;
});
