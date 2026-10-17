require('dotenv').config();
const db = require('../models');

async function migrateMilitarySystem() {
  const queryInterface = db.sequelize.getQueryInterface();
  const transaction = await db.sequelize.transaction();
  try {
    const users = await queryInterface.describeTable('users', { transaction });
    const profiles = await queryInterface.describeTable('profiles', {
      transaction,
    });
    if (!users.system_type)
      await queryInterface.addColumn(
        'users',
        'system_type',
        { type: db.Sequelize.STRING(30), allowNull: true },
        { transaction },
      );

    await db.sequelize.query(
      `
      CREATE TABLE IF NOT EXISTS military_classes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_name VARCHAR(255) NOT NULL,
        class_code VARCHAR(50) NOT NULL UNIQUE,
        commander_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
      { transaction },
    );
    if (!profiles.military_class_id)
      await queryInterface.addColumn(
        'profiles',
        'military_class_id',
        {
          type: db.Sequelize.UUID,
          allowNull: true,
          references: { model: 'military_classes', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        { transaction },
      );
    await db.sequelize.query(
      `CREATE TABLE IF NOT EXISTS military_semesters (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code INTEGER NOT NULL,
      school_year VARCHAR(50) NOT NULL, commander_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (commander_id, school_year, code)
    )`,
      { transaction },
    );
    await db.sequelize.query(
      `CREATE TABLE IF NOT EXISTS military_subjects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), subject_code VARCHAR(50) NOT NULL,
      subject_name VARCHAR(255) NOT NULL, credits INTEGER NOT NULL DEFAULT 0,
      class_id UUID NOT NULL REFERENCES military_classes(id) ON DELETE RESTRICT,
      semester_id UUID NOT NULL REFERENCES military_semesters(id) ON DELETE RESTRICT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (class_id, semester_id, subject_code)
    )`,
      { transaction },
    );
    await db.sequelize.query(
      `CREATE TABLE IF NOT EXISTS military_time_tables (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      class_id UUID NOT NULL REFERENCES military_classes(id) ON DELETE RESTRICT,
      semester_id UUID NOT NULL REFERENCES military_semesters(id) ON DELETE RESTRICT,
      schedules JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (class_id, semester_id)
    )`,
      { transaction },
    );
    await db.sequelize.query(
      `CREATE TABLE IF NOT EXISTS military_class_histories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
      from_class_id UUID REFERENCES military_classes(id) ON DELETE RESTRICT,
      to_class_id UUID REFERENCES military_classes(id) ON DELETE RESTRICT,
      changed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      reason VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
      { transaction },
    );
    await db.sequelize.query(
      `CREATE TABLE IF NOT EXISTS military_subject_results (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
      military_subject_id UUID NOT NULL REFERENCES military_subjects(id) ON DELETE RESTRICT,
      entered_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      letter_grade VARCHAR(5) NOT NULL,
      grade_point4 DOUBLE PRECISION NOT NULL CHECK (grade_point4 >= 0 AND grade_point4 <= 4),
      grade_point10 DOUBLE PRECISION NOT NULL CHECK (grade_point10 >= 0 AND grade_point10 <= 10),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (profile_id, military_subject_id)
    )`,
      { transaction },
    );
    await db.sequelize.query(
      `CREATE TABLE IF NOT EXISTS military_grade_proposals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      military_subject_id UUID NOT NULL REFERENCES military_subjects(id) ON DELETE RESTRICT,
      proposed_letter_grade VARCHAR(5) NOT NULL,
      proposed_grade_point4 DOUBLE PRECISION NOT NULL CHECK (proposed_grade_point4 >= 0 AND proposed_grade_point4 <= 4),
      proposed_grade_point10 DOUBLE PRECISION NOT NULL CHECK (proposed_grade_point10 >= 0 AND proposed_grade_point10 <= 10),
      reason TEXT NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
      reviewer_id UUID REFERENCES users(id) ON DELETE RESTRICT, review_note TEXT, reviewed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
      { transaction },
    );
    await db.sequelize.query(
      'CREATE INDEX IF NOT EXISTS military_grade_proposals_status_created_idx ON military_grade_proposals(status, created_at)',
      { transaction },
    );
    await db.sequelize.query(
      'CREATE INDEX IF NOT EXISTS military_grade_proposals_profile_idx ON military_grade_proposals(profile_id, created_at)',
      { transaction },
    );
    await db.sequelize.query(
      "CREATE UNIQUE INDEX IF NOT EXISTS military_grade_proposals_one_pending_idx ON military_grade_proposals(profile_id, military_subject_id) WHERE status = 'PENDING'",
      { transaction },
    );
    await db.sequelize.query(
      `CREATE TABLE IF NOT EXISTS military_achievements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      class_id UUID NOT NULL REFERENCES military_classes(id) ON DELETE RESTRICT,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      category VARCHAR(40) NOT NULL DEFAULT 'AWARD', title VARCHAR(255) NOT NULL,
      award VARCHAR(255), year INTEGER, school_year VARCHAR(50), semester VARCHAR(50),
      decision_number VARCHAR(100), description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
      { transaction },
    );
    await db.sequelize.query(
      `CREATE TABLE IF NOT EXISTS military_duty_schedules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      class_id UUID NOT NULL REFERENCES military_classes(id) ON DELETE RESTRICT,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      position VARCHAR(100) NOT NULL, work_day DATE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
      { transaction },
    );
    await db.sequelize.query(
      'CREATE INDEX IF NOT EXISTS profiles_military_class_id_idx ON profiles(military_class_id)',
      { transaction },
    );
    await db.sequelize.query(
      'CREATE INDEX IF NOT EXISTS military_class_histories_profile_created_idx ON military_class_histories(profile_id, created_at)',
      { transaction },
    );
    await db.sequelize.query("UPDATE users SET system_type = NULL WHERE role = 'ADMIN'", {
      transaction,
    });
    await db.sequelize.query(
      "UPDATE users SET system_type = 'EXTERNAL' WHERE system_type IS NULL AND role IS DISTINCT FROM 'ADMIN'",
      { transaction },
    );
    await transaction.commit();
    console.log('Military system schema migration completed.');
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    await db.sequelize.close();
  }
}

migrateMilitarySystem().catch((error) => {
  console.error('Military system migration failed:', error.message);
  process.exitCode = 1;
});
