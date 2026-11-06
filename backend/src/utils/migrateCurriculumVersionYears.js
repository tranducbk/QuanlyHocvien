require('dotenv').config();
const { Client } = require('pg');
const dbConfig = require('../config/dbConfig');

const mode = process.argv[2];
if (process.argv.length !== 3 || !['--report', '--dry-run', '--apply'].includes(mode)) {
  console.error('Dùng --report để kiểm tra, --dry-run để thử rồi rollback, hoặc --apply để đổi ngày thành năm.');
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

const getColumns = async (client) => {
  const result = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'curriculum_versions'
  `);
  return new Map(result.rows.map((row) => [row.column_name, row.data_type]));
};

async function report(client) {
  const table = await client.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = current_schema() AND table_name = 'curriculum_versions'
    ) AS present
  `);
  if (!table.rows[0].present) {
    console.table([{ table: 'curriculum_versions', present: false }]);
    return;
  }

  const columns = await getColumns(client);
  const rows = [];
  for (const [column, legacyColumn] of [['start_year', 'effective_from'], ['end_year', 'effective_to']]) {
    const activeColumn = columns.has(column) ? column : legacyColumn;
    const type = columns.get(activeColumn) || 'missing';
    const expression = type === 'date' ? `EXTRACT(YEAR FROM ${activeColumn})::INTEGER` : activeColumn;
    const result = type === 'missing'
      ? { rows: [{ count: null, empty: null, outside_range: null }] }
      : await client.query(`
          SELECT
            COUNT(*)::INTEGER AS count,
            COUNT(*) FILTER (WHERE ${activeColumn} IS NULL)::INTEGER AS empty,
            COUNT(*) FILTER (
              WHERE ${activeColumn} IS NOT NULL
                AND (${expression} < 1945 OR ${expression} > 2100)
            )::INTEGER AS outside_range
          FROM curriculum_versions
        `);
    rows.push({
      column: activeColumn,
      type,
      ...result.rows[0],
    });
  }
  console.table(rows);
}

async function migrate(client) {
  const table = await client.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = current_schema() AND table_name = 'curriculum_versions'
    ) AS present
  `);
  if (!table.rows[0].present) throw new Error('Không tìm thấy bảng curriculum_versions');

  await client.query(`
    ALTER TABLE curriculum_versions
      DROP CONSTRAINT IF EXISTS curriculum_versions_date_order_chk,
      DROP CONSTRAINT IF EXISTS curriculum_versions_year_order_chk,
      DROP CONSTRAINT IF EXISTS curriculum_versions_year_range_chk
  `);
  let columns = await getColumns(client);
  for (const [legacyColumn, yearColumn] of [['effective_from', 'start_year'], ['effective_to', 'end_year']]) {
    if (columns.has(legacyColumn) && columns.has(yearColumn)) {
      throw new Error(`Đồng thời tồn tại ${legacyColumn} và ${yearColumn}; cần đối soát thủ công`);
    }
    if (columns.has(legacyColumn)) {
      await client.query(`ALTER TABLE curriculum_versions RENAME COLUMN ${legacyColumn} TO ${yearColumn}`);
    } else if (!columns.has(yearColumn)) {
      throw new Error(`Thiếu cả cột ${legacyColumn} và ${yearColumn}`);
    }
    columns = await getColumns(client);
    const type = columns.get(yearColumn);
    if (type !== 'date' && type !== 'integer') {
      throw new Error(`Kiểu dữ liệu không hỗ trợ cho ${yearColumn}: ${type}`);
    }
    if (type === 'date') {
      const outOfRange = await client.query(`
        SELECT COUNT(*)::INTEGER AS count
        FROM curriculum_versions
        WHERE ${yearColumn} IS NOT NULL
          AND (EXTRACT(YEAR FROM ${yearColumn}) < 1945 OR EXTRACT(YEAR FROM ${yearColumn}) > 2100)
      `);
      if (outOfRange.rows[0].count > 0) {
        throw new Error(`${yearColumn} có ${outOfRange.rows[0].count} giá trị ngoài khoảng 1945–2100; dừng để tránh mất dữ liệu`);
      }
      await client.query(`
        ALTER TABLE curriculum_versions
        ALTER COLUMN ${yearColumn} TYPE INTEGER
        USING EXTRACT(YEAR FROM ${yearColumn})::INTEGER
      `);
    }
  }
  const invalidYears = await client.query(`
    SELECT COUNT(*)::INTEGER AS count
    FROM curriculum_versions
    WHERE (start_year IS NOT NULL AND (start_year < 1945 OR start_year > 2100))
      OR (end_year IS NOT NULL AND (end_year < 1945 OR end_year > 2100))
  `);
  if (invalidYears.rows[0].count > 0) {
    throw new Error(`Có ${invalidYears.rows[0].count} giá trị năm ngoài khoảng 1945–2100; dừng để đối soát`);
  }
  const invalidRanges = await client.query(`
    SELECT COUNT(*)::INTEGER AS count
    FROM curriculum_versions
    WHERE start_year IS NOT NULL AND end_year IS NOT NULL AND end_year <= start_year
  `);
  if (invalidRanges.rows[0].count > 0) {
    throw new Error(`Có ${invalidRanges.rows[0].count} khóa có năm kết thúc không sau năm bắt đầu; dừng để đối soát`);
  }
  await client.query(`
    ALTER TABLE curriculum_versions
      DROP CONSTRAINT IF EXISTS curriculum_versions_date_order_chk,
      DROP CONSTRAINT IF EXISTS curriculum_versions_year_order_chk,
      DROP CONSTRAINT IF EXISTS curriculum_versions_year_range_chk,
      ADD CONSTRAINT curriculum_versions_year_order_chk
        CHECK (end_year IS NULL OR start_year IS NULL OR end_year > start_year),
      ADD CONSTRAINT curriculum_versions_year_range_chk
        CHECK (
          (start_year IS NULL OR start_year BETWEEN 1945 AND 2100)
          AND (end_year IS NULL OR end_year BETWEEN 1945 AND 2100)
        )
  `);
}

async function main() {
  const client = new Client(connection);
  let inTransaction = false;
  try {
    await client.connect();
    const current = await client.query('SELECT current_database() AS name');
    console.log('Database:', current.rows[0].name);
    if (process.env.QLHV_EXPECT_DATABASE && current.rows[0].name !== process.env.QLHV_EXPECT_DATABASE) {
      throw new Error('Sai database dự kiến; dừng trước khi chạy migration');
    }
    await client.query(mode === '--report' ? 'BEGIN READ ONLY' : 'BEGIN');
    inTransaction = true;
    if (mode !== '--report') {
      await client.query("SET LOCAL lock_timeout = '2s'");
      await migrate(client);
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
  console.error('Không thể đổi ngày khóa học thành năm:', error.code || error.message);
  process.exitCode = 1;
});
