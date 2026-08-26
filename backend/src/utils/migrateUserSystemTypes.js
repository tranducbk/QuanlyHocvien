require('dotenv').config();

const db = require('../models');

const CONSTRAINTS = [
  {
    name: 'users_role_check',
    expression: "role IN ('ADMIN', 'COMMANDER', 'STUDENT')",
  },
  {
    name: 'users_system_type_check',
    expression: "system_type IS NULL OR system_type IN ('EXTERNAL', 'MILITARY', 'CIVILIAN')",
  },
  {
    name: 'users_role_system_type_check',
    expression: `
      (role = 'ADMIN' AND system_type IS NULL)
      OR
      (role IN ('COMMANDER', 'STUDENT') AND system_type IN ('EXTERNAL', 'MILITARY', 'CIVILIAN'))
    `,
  },
];

async function addConstraintIfMissing(transaction, name, expression) {
  await db.sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = '${name}'
          AND conrelid = 'users'::regclass
      ) THEN
        ALTER TABLE users
        ADD CONSTRAINT ${name}
        CHECK (${expression});
      END IF;
    END $$;
  `, { transaction });
}

async function run() {
  await db.sequelize.transaction(async (transaction) => {
    await db.sequelize.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS system_type VARCHAR(20) NULL;
    `, { transaction });

    await db.sequelize.query(`
      UPDATE users
      SET system_type = 'EXTERNAL'
      WHERE role IN ('STUDENT', 'COMMANDER')
        AND system_type IS NULL;
    `, { transaction });

    await db.sequelize.query(`
      UPDATE users
      SET system_type = NULL
      WHERE role = 'ADMIN'
        AND system_type IS NOT NULL;
    `, { transaction });

    const [invalidUsers] = await db.sequelize.query(`
      SELECT id, username, role, system_type
      FROM users
      WHERE role IS NULL
         OR role NOT IN ('ADMIN', 'COMMANDER', 'STUDENT')
         OR (role = 'ADMIN' AND system_type IS NOT NULL)
         OR (role IN ('COMMANDER', 'STUDENT') AND system_type NOT IN ('EXTERNAL', 'MILITARY', 'CIVILIAN'))
      LIMIT 20;
    `, { transaction });

    if (invalidUsers.length > 0) {
      throw new Error(`Không thể áp dụng constraint vì có tài khoản không hợp lệ: ${JSON.stringify(invalidUsers)}`);
    }

    await db.sequelize.query(`
      ALTER TABLE users
      ALTER COLUMN role SET NOT NULL;
    `, { transaction });

    for (const constraint of CONSTRAINTS) {
      await addConstraintIfMissing(transaction, constraint.name, constraint.expression);
    }

    await db.sequelize.query(`
      CREATE INDEX IF NOT EXISTS users_system_type_idx
      ON users (system_type);
    `, { transaction });
  });

  console.log('User system type migration completed.');
}

run()
  .catch((error) => {
    console.error('User system type migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.sequelize.close();
  });
