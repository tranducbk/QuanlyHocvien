require('dotenv').config();
const db = require('../models');

async function migrateCutRiceSemesterRequests() {
  await db.sequelize.query(`
    ALTER TABLE cut_rice
      ADD COLUMN IF NOT EXISTS semester_id UUID NULL;
  `);

  await db.sequelize.query(`
    ALTER TABLE cut_rice
      ADD COLUMN IF NOT EXISTS week_start_date DATE NULL,
      ADD COLUMN IF NOT EXISTS week_end_date DATE NULL;
  `);

  await db.sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_cut_rice_requests_status') THEN
        CREATE TYPE enum_cut_rice_requests_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
      END IF;
    END
    $$;
  `);

  await db.sequelize.query(`
    CREATE TABLE IF NOT EXISTS cut_rice_requests (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
      semester_id UUID NOT NULL REFERENCES semesters(id) ON UPDATE CASCADE ON DELETE CASCADE,
      week_start_date DATE NOT NULL,
      week_end_date DATE NOT NULL,
      weekly JSONB NOT NULL DEFAULT '{}'::jsonb,
      notes VARCHAR(255),
      status enum_cut_rice_requests_status NOT NULL DEFAULT 'PENDING',
      reviewed_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
      reviewed_at TIMESTAMP WITH TIME ZONE,
      review_note VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await db.sequelize.query(`
    ALTER TABLE cut_rice_requests
      ADD COLUMN IF NOT EXISTS week_start_date DATE,
      ADD COLUMN IF NOT EXISTS week_end_date DATE;
  `);

  await db.sequelize.query(`
    UPDATE cut_rice_requests
    SET
      week_start_date = COALESCE(week_start_date, CURRENT_DATE - ((EXTRACT(DOW FROM CURRENT_DATE)::int + 6) % 7)),
      week_end_date = COALESCE(week_end_date, CURRENT_DATE - ((EXTRACT(DOW FROM CURRENT_DATE)::int + 6) % 7) + 6)
    WHERE week_start_date IS NULL OR week_end_date IS NULL;
  `);

  await db.sequelize.query(`
    ALTER TABLE cut_rice_requests
      ALTER COLUMN week_start_date SET NOT NULL,
      ALTER COLUMN week_end_date SET NOT NULL;
  `);

  await db.sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'cut_rice_semester_id_fkey'
      ) THEN
        ALTER TABLE cut_rice
          ADD CONSTRAINT cut_rice_semester_id_fkey
          FOREIGN KEY (semester_id) REFERENCES semesters(id)
          ON UPDATE CASCADE ON DELETE SET NULL;
      END IF;
    END
    $$;
  `);

  await db.sequelize.query(`
    CREATE INDEX IF NOT EXISTS cut_rice_user_semester_idx ON cut_rice(user_id, semester_id);
    CREATE INDEX IF NOT EXISTS cut_rice_user_semester_week_idx ON cut_rice(user_id, semester_id, week_start_date);
    CREATE INDEX IF NOT EXISTS cut_rice_requests_status_idx ON cut_rice_requests(status);
    CREATE INDEX IF NOT EXISTS cut_rice_requests_user_semester_idx ON cut_rice_requests(user_id, semester_id);
    CREATE INDEX IF NOT EXISTS cut_rice_requests_user_semester_week_idx ON cut_rice_requests(user_id, semester_id, week_start_date);
  `);

  console.log('Cut rice semester/request migration completed.');
}

migrateCutRiceSemesterRequests()
  .then(async () => {
    await db.sequelize.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Cut rice migration error:', error);
    try {
      await db.sequelize.close();
    } catch {}
    process.exit(1);
  });
