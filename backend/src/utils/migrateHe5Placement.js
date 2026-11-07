require('dotenv').config();
const { Client } = require('pg');
const config = require('../config/dbConfig');

async function migrate(client) {
  const system = (await client.query("SELECT id FROM training_systems WHERE code='HE_5' AND is_active=true")).rows[0];
  if (!system) throw new Error('Không tìm thấy Hệ 5 đang hoạt động');
  const classes = (await client.query('SELECT code,name,status FROM training_classes WHERE training_system_id=$1 ORDER BY code', [system.id])).rows;
  if (classes.length !== 6 || classes.some((row, index) => row.code !== `LOP-${index + 1}` || row.name !== `Lớp ${index + 1}` || row.status !== 'ACTIVE')) {
    throw new Error('Cần đúng 6 lớp LOP-1 đến LOP-6 đang hoạt động; dừng để tránh tự sửa dữ liệu lớp');
  }
  await client.query(`
    CREATE TABLE IF NOT EXISTS he5_placement_years (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      training_system_id UUID NOT NULL REFERENCES training_systems(id) ON DELETE RESTRICT,
      school_year VARCHAR(9) NOT NULL,
      start_year INTEGER NOT NULL CHECK (start_year BETWEEN 2026 AND 2199),
      status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','CLOSED')),
      previous_year_id UUID REFERENCES he5_placement_years(id) ON DELETE RESTRICT,
      closed_by UUID REFERENCES users(id) ON DELETE RESTRICT,
      closed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(training_system_id, school_year), UNIQUE(training_system_id, start_year),
      CHECK (school_year = start_year::text || '-' || (start_year+1)::text),
      CHECK ((status='DRAFT' AND closed_at IS NULL AND closed_by IS NULL) OR (status='CLOSED' AND closed_at IS NOT NULL AND closed_by IS NOT NULL))
    );
    CREATE UNIQUE INDEX IF NOT EXISTS he5_one_draft_year ON he5_placement_years(training_system_id) WHERE status='DRAFT';
    CREATE TABLE IF NOT EXISTS he5_placements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      year_id UUID NOT NULL REFERENCES he5_placement_years(id) ON DELETE RESTRICT,
      profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
      training_class_id UUID NOT NULL REFERENCES training_classes(id) ON DELETE RESTRICT,
      student_code VARCHAR(50) NOT NULL, full_name VARCHAR(100),
      status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','GRADUATED')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(year_id,profile_id)
    );
    CREATE INDEX IF NOT EXISTS he5_placements_class ON he5_placements(year_id,training_class_id,status);
    CREATE INDEX IF NOT EXISTS he5_placements_profile ON he5_placements(profile_id);
    CREATE TABLE IF NOT EXISTS he5_placement_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      year_id UUID NOT NULL REFERENCES he5_placement_years(id) ON DELETE RESTRICT,
      profile_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
      action VARCHAR(30) NOT NULL, before JSONB, after JSONB,
      changed_by UUID REFERENCES users(id) ON DELETE RESTRICT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS he5_events_year ON he5_placement_events(year_id,created_at);
  `);
  // Only the first run imports current assignments; subsequent runs never re-import them.
  const initial = await client.query(`INSERT INTO he5_placement_years(training_system_id,school_year,start_year)
    VALUES ($1,'2026-2027',2026) ON CONFLICT(training_system_id,school_year) DO NOTHING RETURNING id`, [system.id]);
  if (initial.rows.length) {
    const yearId = initial.rows[0].id;
    await client.query(`INSERT INTO he5_placements(year_id,profile_id,training_class_id,student_code,full_name)
      SELECT $1,p.id,p.training_class_id,p.code,p.full_name FROM profiles p
      JOIN users u ON u.profile_id=p.id JOIN training_classes c ON c.id=p.training_class_id
      WHERE u.role='STUDENT' AND u.training_system_id=$2 AND c.training_system_id=$2`, [yearId, system.id]);
    await client.query(`INSERT INTO he5_placement_events(year_id,profile_id,action,after)
      SELECT year_id,profile_id,'INITIAL_IMPORT',jsonb_build_object('trainingClassId',training_class_id,'status',status)
      FROM he5_placements WHERE year_id=$1`, [yearId]);
    await client.query("INSERT INTO he5_placement_events(year_id,action,after) VALUES ($1,'INITIALIZE',jsonb_build_object('schoolYear','2026-2027'))", [yearId]);
  }
  await client.query(`
    CREATE OR REPLACE FUNCTION he5_guard_year() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF TG_OP='DELETE' OR (TG_OP='UPDATE' AND (OLD.status='CLOSED' OR NEW.id<>OLD.id OR NEW.training_system_id<>OLD.training_system_id OR NEW.start_year<>OLD.start_year OR NEW.school_year<>OLD.school_year OR NEW.previous_year_id IS DISTINCT FROM OLD.previous_year_id)) THEN
        RAISE EXCEPTION 'Không được xóa năm học hoặc sửa năm học đã chốt';
      END IF;
      IF NOT EXISTS(SELECT 1 FROM training_systems WHERE id=NEW.training_system_id AND code='HE_5') THEN
        RAISE EXCEPTION 'Năm xếp lớp chỉ dành cho Hệ 5';
      END IF;
      RETURN NEW;
    END $$;
    DROP TRIGGER IF EXISTS he5_year_guard ON he5_placement_years;
    CREATE TRIGGER he5_year_guard BEFORE INSERT OR UPDATE OR DELETE ON he5_placement_years FOR EACH ROW EXECUTE FUNCTION he5_guard_year();

    CREATE OR REPLACE FUNCTION he5_guard_placement() RETURNS trigger LANGUAGE plpgsql AS $$
    DECLARE year_system UUID; year_status TEXT;
    BEGIN
      IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Không xóa dữ liệu phân lớp'; END IF;
      IF TG_OP='UPDATE' AND (NEW.year_id<>OLD.year_id OR NEW.profile_id<>OLD.profile_id OR NEW.student_code<>OLD.student_code OR NEW.full_name IS DISTINCT FROM OLD.full_name) THEN
        RAISE EXCEPTION 'Không thay đổi định danh hoặc bản chụp học viên của năm học';
      END IF;
      SELECT training_system_id,status INTO year_system,year_status FROM he5_placement_years WHERE id=NEW.year_id FOR UPDATE;
      IF year_status IS DISTINCT FROM 'DRAFT' THEN RAISE EXCEPTION 'Năm học đã chốt'; END IF;
      IF NOT EXISTS(SELECT 1 FROM training_classes WHERE id=NEW.training_class_id AND training_system_id=year_system)
        OR NOT EXISTS(SELECT 1 FROM users WHERE profile_id=NEW.profile_id AND role='STUDENT' AND training_system_id=year_system) THEN
        RAISE EXCEPTION 'Học viên và lớp phải cùng Hệ 5';
      END IF;
      RETURN NEW;
    END $$;
    DROP TRIGGER IF EXISTS he5_placement_guard ON he5_placements;
    CREATE TRIGGER he5_placement_guard BEFORE INSERT OR UPDATE OR DELETE ON he5_placements FOR EACH ROW EXECUTE FUNCTION he5_guard_placement();

    CREATE OR REPLACE FUNCTION he5_guard_event() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN RAISE EXCEPTION 'Không được sửa hoặc xóa lịch sử xếp lớp'; END $$;
    DROP TRIGGER IF EXISTS he5_event_guard ON he5_placement_events;
    CREATE TRIGGER he5_event_guard BEFORE UPDATE OR DELETE ON he5_placement_events FOR EACH ROW EXECUTE FUNCTION he5_guard_event();

    CREATE OR REPLACE FUNCTION he5_guard_fixed_class() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF TG_OP<>'INSERT' AND EXISTS(SELECT 1 FROM training_systems WHERE id=OLD.training_system_id AND code='HE_5') THEN
        RAISE EXCEPTION 'Sáu lớp Hệ 5 là cố định';
      END IF;
      IF TG_OP<>'DELETE' AND EXISTS(SELECT 1 FROM training_systems WHERE id=NEW.training_system_id AND code='HE_5') THEN
        RAISE EXCEPTION 'Sáu lớp Hệ 5 là cố định';
      END IF;
      IF TG_OP='DELETE' THEN RETURN OLD; END IF;
      RETURN NEW;
    END $$;
    DROP TRIGGER IF EXISTS he5_fixed_class_guard ON training_classes;
    CREATE TRIGGER he5_fixed_class_guard BEFORE INSERT OR UPDATE OR DELETE ON training_classes FOR EACH ROW EXECUTE FUNCTION he5_guard_fixed_class();
  `);
}

async function report(client) {
  for (const table of ['he5_placement_years', 'he5_placements', 'he5_placement_events']) {
    const exists = (await client.query('SELECT to_regclass($1) AS name', [table])).rows[0].name;
    console.log(table, exists ? (await client.query(`SELECT COUNT(*)::int AS count FROM ${table}`)).rows[0].count : 'chưa tồn tại');
  }
}

async function main() {
  const mode = process.argv[2];
  if (!['--report', '--dry-run', '--apply'].includes(mode)) throw new Error('Dùng --report, --dry-run hoặc --apply');
  const connection = config.URL ? { connectionString: config.URL } : { host: config.HOST, port: config.port, user: config.USER, password: config.PASSWORD, database: config.DB };
  if (config.ssl) connection.ssl = { rejectUnauthorized: false };
  const client = new Client({ ...connection, connectionTimeoutMillis: 10000 });
  try {
    await client.connect();
    const database = (await client.query('SELECT current_database() AS name')).rows[0].name;
    console.log('Database:', database);
    if (process.env.QLHV_EXPECT_DATABASE && database !== process.env.QLHV_EXPECT_DATABASE) throw new Error('Sai database dự kiến');
    if (mode === '--apply' && !process.env.QLHV_EXPECT_DATABASE) throw new Error('Cần đặt QLHV_EXPECT_DATABASE bằng tên database đã kiểm tra');
    await client.query(mode === '--report' ? 'BEGIN READ ONLY' : 'BEGIN');
    await client.query("SET LOCAL lock_timeout='3s'");
    if (mode !== '--report') await migrate(client);
    await report(client);
    await client.query(mode === '--apply' ? 'COMMIT' : 'ROLLBACK');
    console.log(mode === '--apply' ? 'Đã áp dụng.' : 'Không ghi dữ liệu (rollback).');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally { await client.end(); }
}
if (require.main === module) main().catch(error => { console.error(error.code || error.message); process.exitCode = 1; });
module.exports = { migrate, report };
