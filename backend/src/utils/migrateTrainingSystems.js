require('dotenv').config();
const db = require('../models');

const SYSTEMS = [
  ['HE_1', 'Hệ 1'],
  ['HE_3', 'Hệ 3'],
  ['HE_4', 'Hệ 4'],
  ['HE_5', 'Hệ 5'],
  ['HE_7', 'Hệ 7'],
];

const report = async () => {
  const [legacy] = await db.sequelize.query(`
    SELECT role, system_type AS "systemType", COUNT(*)::integer AS count
    FROM users
    GROUP BY role, system_type
    ORDER BY role, system_type
  `);
  console.log('Tài khoản theo phân loại cũ:');
  console.table(legacy);

  const [columns] = await db.sequelize.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'users'
      AND column_name = 'training_system_id'
  `);
  if (!columns.length) {
    console.log('users.training_system_id chưa tồn tại; chưa có tài khoản nào được ánh xạ.');
    return;
  }

  const [assignment] = await db.sequelize.query(`
    SELECT role, system_type AS "systemType",
           COUNT(*) FILTER (WHERE training_system_id IS NULL)::integer AS "unmappedCount",
           COUNT(*) FILTER (WHERE training_system_id IS NOT NULL)::integer AS "mappedCount"
    FROM users
    GROUP BY role, system_type
    ORDER BY role, system_type
  `);
  console.log('Tình trạng ánh xạ hệ mới:');
  console.table(assignment);
  if (assignment.some((row) => row.systemType === 'MILITARY' && row.unmappedCount > 0)) {
    console.log('MILITARY cần ánh xạ tường minh sang HE_1, HE_3, HE_4 hoặc HE_7.');
  }
};

const apply = async () => {
  await db.sequelize.transaction(async (transaction) => {
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS training_systems (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(10) NOT NULL UNIQUE
          CHECK (code IN ('HE_1', 'HE_3', 'HE_4', 'HE_5', 'HE_7')),
        name VARCHAR(100) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `, { transaction });

    for (const [code, name] of SYSTEMS) {
      await db.sequelize.query(`
        INSERT INTO training_systems (code, name)
        VALUES (:code, :name)
        ON CONFLICT (code) DO NOTHING
      `, { replacements: { code, name }, transaction });
    }

    await db.sequelize.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS training_system_id UUID
        REFERENCES training_systems(id) ON DELETE RESTRICT
    `, { transaction });
    await db.sequelize.query(`
      CREATE INDEX IF NOT EXISTS users_training_system_id_idx
      ON users(training_system_id)
    `, { transaction });
  });
  console.log('Đã tạo danh mục và cột hệ đào tạo. Không tự ánh xạ tài khoản cũ.');
};

async function main() {
  const [mode] = process.argv.slice(2);
  if (mode !== '--report' && mode !== '--apply') {
    throw new Error('Dùng --report để xem dữ liệu hoặc --apply để tạo cấu trúc.');
  }
  try {
    await db.sequelize.authenticate();
    if (mode === '--apply') await apply();
    await report();
  } finally {
    await db.sequelize.close();
  }
}

main().catch((error) => {
  console.error('Migration hệ đào tạo thất bại:', error.message);
  process.exitCode = 1;
});
