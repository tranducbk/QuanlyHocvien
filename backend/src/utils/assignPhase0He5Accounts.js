require('dotenv').config();
const { Client } = require('pg');
const dbConfig = require('../config/dbConfig');

const mode = process.argv[2];
if (!['--report', '--apply'].includes(mode)) {
  console.error('Dùng --report để kiểm tra hoặc --apply để gán hai tài khoản nghiệp vụ vào HE_5.');
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

const main = async () => {
  const client = new Client(connection);
  let transactionStarted = false;
  try {
    await client.connect();
    await client.query(mode === '--apply' ? 'BEGIN' : 'BEGIN READ ONLY');
    transactionStarted = true;

    const systemResult = await client.query(`
      SELECT id FROM training_systems WHERE code = 'HE_5' AND is_active = TRUE
    `);
    if (systemResult.rowCount !== 1) throw new Error('Không tìm thấy đúng một hệ HE_5 đang hoạt động');
    const he5Id = systemResult.rows[0].id;

    const accounts = await client.query(`
      SELECT id, role, system_type AS "systemType", training_system_id AS "trainingSystemId"
      FROM users
      WHERE role IN ('COMMANDER', 'STUDENT') AND delete_at IS NULL
      ORDER BY role, id
      ${mode === '--apply' ? 'FOR UPDATE' : ''}
    `);

    const commanders = accounts.rows.filter((row) => row.role === 'COMMANDER');
    const students = accounts.rows.filter((row) => row.role === 'STUDENT');
    if (accounts.rows.length !== 2 || commanders.length !== 1 || students.length !== 1) {
      throw new Error('Dữ liệu tài khoản đã thay đổi: cần đúng 1 Chỉ huy và 1 Học viên đang hoạt động');
    }
    for (const account of accounts.rows) {
      if (account.trainingSystemId && account.trainingSystemId !== he5Id) {
        throw new Error('Có tài khoản đã thuộc hệ khác; không tự ghi đè');
      }
      if (account.systemType && account.systemType !== 'EXTERNAL') {
        throw new Error('Có tài khoản thuộc phân loại cũ khác EXTERNAL; cần đối soát thủ công');
      }
    }

    console.table(accounts.rows.map(({ role, systemType, trainingSystemId }) => ({
      role,
      systemType: systemType || 'NULL',
      trainingSystem: trainingSystemId ? 'HE_5' : 'UNASSIGNED',
    })));

    if (mode === '--apply') {
      const pending = accounts.rows.filter((row) => row.trainingSystemId !== he5Id || row.systemType !== 'EXTERNAL');
      if (pending.length) {
        const result = await client.query(`
          UPDATE users
          SET training_system_id = $1, system_type = 'EXTERNAL', updated_at = NOW()
          WHERE id = ANY($2::uuid[])
            AND (training_system_id IS NULL OR training_system_id = $1)
            AND (system_type IS NULL OR system_type = 'EXTERNAL')
        `, [he5Id, pending.map((row) => row.id)]);
        if (result.rowCount !== pending.length) throw new Error('Số tài khoản cập nhật không khớp; đã rollback');
      }
      await client.query('COMMIT');
      transactionStarted = false;
      console.log(`Đã gán HE_5 cho ${pending.length} tài khoản; cả Chỉ huy và Học viên hiện thuộc HE_5.`);
    } else {
      await client.query('ROLLBACK');
      transactionStarted = false;
      console.log('Chỉ kiểm tra, chưa thay đổi database.');
    }
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
};

main().catch((error) => {
  console.error('Không thể gán tài khoản HE_5:', error.code || error.message);
  process.exitCode = 1;
});
