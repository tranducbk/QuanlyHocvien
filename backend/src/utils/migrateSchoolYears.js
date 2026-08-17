require('dotenv').config();
const db = require('../models');

const migrate = async () => {
  await db.sequelize.query(`
    CREATE TABLE IF NOT EXISTS school_years (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      school_year VARCHAR(50) NOT NULL UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await db.sequelize.query(`
    ALTER TABLE semesters
    ADD COLUMN IF NOT EXISTS school_year_id UUID;
  `);

  await db.sequelize.query(`
    INSERT INTO school_years (school_year, created_at, updated_at)
    SELECT DISTINCT school_year, NOW(), NOW()
    FROM semesters
    WHERE school_year IS NOT NULL
    ON CONFLICT (school_year) DO NOTHING;
  `);

  await db.sequelize.query(`
    UPDATE semesters
    SET school_year_id = school_years.id
    FROM school_years
    WHERE semesters.school_year = school_years.school_year
      AND semesters.school_year_id IS NULL;
  `);

  await db.sequelize.query(`
    ALTER TABLE semesters
    ALTER COLUMN code TYPE INTEGER
    USING CASE
      WHEN code ~ '^[0-9]+$' THEN code::INTEGER
      WHEN code ~ 'HK[0-9]+$' THEN substring(code from 'HK([0-9]+)$')::INTEGER
      ELSE NULL
    END;
  `);

  await db.sequelize.query(`
    ALTER TABLE semesters
    DROP COLUMN IF EXISTS school_year;
  `);

  await db.sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'semesters_school_year_id_fkey'
      ) THEN
        ALTER TABLE semesters
        ADD CONSTRAINT semesters_school_year_id_fkey
        FOREIGN KEY (school_year_id)
        REFERENCES school_years(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT;
      END IF;
    END $$;
  `);
};

migrate()
  .then(async () => {
    console.log('School year migration completed.');
    await db.sequelize.close();
  })
  .catch(async (err) => {
    console.error('School year migration failed:', err);
    await db.sequelize.close();
    process.exit(1);
  });
