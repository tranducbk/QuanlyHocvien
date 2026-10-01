require('dotenv').config();
const db = require('../models');

async function migrateMilitarySystem() {
  const queryInterface = db.sequelize.getQueryInterface();
  const transaction = await db.sequelize.transaction();
  try {
    const users = await queryInterface.describeTable('users', { transaction });
    const profiles = await queryInterface.describeTable('profiles', { transaction });
    if (!users.system_type) await queryInterface.addColumn('users', 'system_type', { type: db.Sequelize.STRING(30), allowNull: true }, { transaction });

    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS military_classes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_name VARCHAR(255) NOT NULL,
        class_code VARCHAR(50) NOT NULL UNIQUE,
        commander_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `, { transaction });
    if (!profiles.military_class_id) await queryInterface.addColumn('profiles', 'military_class_id', {
      type: db.Sequelize.UUID,
      allowNull: true,
      references: { model: 'military_classes', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    }, { transaction });
    await db.sequelize.query(`CREATE TABLE IF NOT EXISTS military_semesters (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code INTEGER NOT NULL,
      school_year VARCHAR(50) NOT NULL, commander_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (commander_id, school_year, code)
    )`, { transaction });
    await db.sequelize.query(`CREATE TABLE IF NOT EXISTS military_subjects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), subject_code VARCHAR(50) NOT NULL,
      subject_name VARCHAR(255) NOT NULL, credits INTEGER NOT NULL DEFAULT 0,
      class_id UUID NOT NULL REFERENCES military_classes(id) ON DELETE RESTRICT,
      semester_id UUID NOT NULL REFERENCES military_semesters(id) ON DELETE RESTRICT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (class_id, semester_id, subject_code)
    )`, { transaction });
    await db.sequelize.query(`CREATE TABLE IF NOT EXISTS military_time_tables (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      class_id UUID NOT NULL REFERENCES military_classes(id) ON DELETE RESTRICT,
      semester_id UUID NOT NULL REFERENCES military_semesters(id) ON DELETE RESTRICT,
      schedules JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (class_id, semester_id)
    )`, { transaction });
    await db.sequelize.query(`CREATE TABLE IF NOT EXISTS military_class_histories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
      from_class_id UUID REFERENCES military_classes(id) ON DELETE RESTRICT,
      to_class_id UUID REFERENCES military_classes(id) ON DELETE RESTRICT,
      changed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      reason VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`, { transaction });
    await db.sequelize.query('CREATE INDEX IF NOT EXISTS profiles_military_class_id_idx ON profiles(military_class_id)', { transaction });
    await db.sequelize.query('CREATE INDEX IF NOT EXISTS military_class_histories_profile_created_idx ON military_class_histories(profile_id, created_at)', { transaction });
    await db.sequelize.query("UPDATE users SET system_type = NULL WHERE role = 'ADMIN'", { transaction });
    await db.sequelize.query("UPDATE users SET system_type = 'EXTERNAL' WHERE system_type IS NULL AND role IS DISTINCT FROM 'ADMIN'", { transaction });
    await transaction.commit();
    console.log('Military system schema migration completed.');
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    await db.sequelize.close();
  }
}

migrateMilitarySystem().catch(error => {
  console.error('Military system migration failed:', error.message);
  process.exitCode = 1;
});
