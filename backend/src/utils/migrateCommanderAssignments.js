require('dotenv').config();

const db = require('../models');

async function run() {
  const qi = db.sequelize.getQueryInterface();

  await qi.sequelize.query(`
    ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS commander_id UUID NULL;
  `);

  await qi.sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'profiles_commander_id_fkey'
      ) THEN
        ALTER TABLE profiles
        ADD CONSTRAINT profiles_commander_id_fkey
        FOREIGN KEY (commander_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL;
      END IF;
    END $$;
  `);

  await qi.sequelize.query(`
    CREATE INDEX IF NOT EXISTS profiles_commander_id_idx
    ON profiles (commander_id);
  `);

  console.log('Commander assignment migration completed.');
}

run()
  .catch((error) => {
    console.error('Commander assignment migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.sequelize.close();
  });
