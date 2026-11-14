require('dotenv').config();
const { Client } = require('pg');
const dbConfig = require('../config/dbConfig');

const mode = process.argv[2];
if (process.argv.length !== 3 || !['--report', '--dry-run', '--apply'].includes(mode)) {
  console.error('Dùng --report, --dry-run hoặc --apply.');
  process.exit(1);
}
const connection = dbConfig.URL ? { connectionString: dbConfig.URL } : {
  host: dbConfig.HOST, port: dbConfig.port, user: dbConfig.USER, password: dbConfig.PASSWORD, database: dbConfig.DB,
};
if (dbConfig.ssl) connection.ssl = { rejectUnauthorized: false };

async function main() {
  const client = new Client(connection);
  let inTransaction = false;
  try {
    await client.connect();
    const current = await client.query('SELECT current_database() AS name');
    console.log('Database:', current.rows[0].name);
    if (process.env.QLHV_EXPECT_DATABASE && process.env.QLHV_EXPECT_DATABASE !== current.rows[0].name) throw new Error('Sai database');
    await client.query(mode === '--report' ? 'BEGIN READ ONLY' : 'BEGIN');
    inTransaction = true;
    if (mode !== '--report') {
      await client.query("SET LOCAL lock_timeout = '2s'");
      await client.query(`ALTER TABLE training_class_semesters ADD COLUMN IF NOT EXISTS grade_closed_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS grade_closed_by UUID REFERENCES users(id) ON DELETE RESTRICT`);
      await client.query('ALTER TABLE training_class_results ADD COLUMN IF NOT EXISTS corrected_at TIMESTAMPTZ');
      await client.query(`CREATE TABLE IF NOT EXISTS training_class_grade_revisions (
        id BIGSERIAL PRIMARY KEY,
        result_id UUID NOT NULL REFERENCES training_class_results(id) ON DELETE RESTRICT,
        changed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        reason TEXT,
        before_score JSONB,
        after_score JSONB NOT NULL,
        was_closed BOOLEAN NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CHECK (NOT was_closed OR length(trim(reason)) >= 5 AND reason IS NOT NULL)
      )`);
      await client.query('CREATE INDEX IF NOT EXISTS training_class_grade_revisions_result_idx ON training_class_grade_revisions(result_id, id)');
      await client.query(`CREATE OR REPLACE FUNCTION protect_audited_class_grade() RETURNS trigger AS $$
      DECLARE editor UUID; closed_at TIMESTAMPTZ; explanation TEXT;
      BEGIN
        IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Điểm chính thức không được xóa'; END IF;
        IF TG_OP = 'UPDATE' AND
          (OLD.id, OLD.training_class_id, OLD.semester_id, OLD.subject_id, OLD.profile_id, OLD.attempt_no, OLD.entered_by, OLD.created_at)
          IS DISTINCT FROM
          (NEW.id, NEW.training_class_id, NEW.semester_id, NEW.subject_id, NEW.profile_id, NEW.attempt_no, NEW.entered_by, NEW.created_at)
        THEN RAISE EXCEPTION 'Không được thay đổi định danh điểm hoặc người nhập ban đầu'; END IF;
        editor := NULLIF(current_setting('qlhv.grade_editor', true), '')::uuid;
        explanation := trim(COALESCE(current_setting('qlhv.grade_reason', true), ''));
        IF editor IS NULL OR NOT EXISTS (
          SELECT 1 FROM training_classes c JOIN users u ON u.id = c.commander_id
          WHERE c.id = NEW.training_class_id AND u.id = editor AND u.role = 'COMMANDER'
            AND u.is_active = true AND u.training_system_id = c.training_system_id
        ) THEN RAISE EXCEPTION 'Không có Chỉ huy hợp lệ cho thao tác điểm'; END IF;
        SELECT grade_closed_at INTO closed_at FROM training_class_semesters
          WHERE id = NEW.semester_id AND training_class_id = NEW.training_class_id FOR UPDATE;
        IF NOT FOUND THEN RAISE EXCEPTION 'Học kỳ không thuộc lớp'; END IF;
        IF closed_at IS NOT NULL AND length(explanation) < 5 THEN RAISE EXCEPTION 'Sau chốt cần lý do ít nhất 5 ký tự'; END IF;
        IF TG_OP = 'UPDATE' AND closed_at IS NOT NULL THEN NEW.corrected_at := clock_timestamp(); END IF;
        RETURN NEW;
      END; $$ LANGUAGE plpgsql`);
      await client.query('DROP TRIGGER IF EXISTS training_class_results_immutable ON training_class_results');
      await client.query('DROP TRIGGER IF EXISTS training_class_results_audited_guard ON training_class_results');
      await client.query(`CREATE TRIGGER training_class_results_audited_guard BEFORE INSERT OR UPDATE OR DELETE
        ON training_class_results FOR EACH ROW EXECUTE FUNCTION protect_audited_class_grade()`);
      await client.query(`CREATE OR REPLACE FUNCTION record_class_grade_revision() RETURNS trigger AS $$
      DECLARE previous JSONB;
      BEGIN
        IF TG_OP = 'UPDATE' THEN previous := jsonb_build_object('midtermScore', OLD.midterm_score,
          'finalScore', OLD.final_score, 'totalScore', OLD.total_score, 'classification', OLD.classification); END IF;
        INSERT INTO training_class_grade_revisions(result_id, changed_by, reason, before_score, after_score, was_closed)
          VALUES (NEW.id, current_setting('qlhv.grade_editor')::uuid,
            NULLIF(trim(current_setting('qlhv.grade_reason', true)), ''), previous,
            jsonb_build_object('midtermScore', NEW.midterm_score, 'finalScore', NEW.final_score,
              'totalScore', NEW.total_score, 'classification', NEW.classification),
            (SELECT grade_closed_at IS NOT NULL FROM training_class_semesters WHERE id = NEW.semester_id));
        RETURN NEW;
      END; $$ LANGUAGE plpgsql`);
      await client.query('DROP TRIGGER IF EXISTS training_class_results_record_revision ON training_class_results');
      await client.query(`CREATE TRIGGER training_class_results_record_revision AFTER INSERT OR UPDATE
        ON training_class_results FOR EACH ROW EXECUTE FUNCTION record_class_grade_revision()`);
      await client.query(`CREATE OR REPLACE FUNCTION reject_class_grade_revision_change() RETURNS trigger AS $$
        BEGIN RAISE EXCEPTION 'Lịch sử điểm không được sửa hoặc xóa'; END; $$ LANGUAGE plpgsql`);
      await client.query('DROP TRIGGER IF EXISTS class_grade_revisions_immutable ON training_class_grade_revisions');
      await client.query(`CREATE TRIGGER class_grade_revisions_immutable BEFORE UPDATE OR DELETE ON training_class_grade_revisions
        FOR EACH ROW EXECUTE FUNCTION reject_class_grade_revision_change()`);
    }
    const columns = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema()
      AND table_name = 'training_class_semesters' AND column_name LIKE 'grade_closed_%'`);
    const triggers = await client.query(`SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = current_schema()
      AND event_object_table IN ('training_class_results', 'training_class_grade_revisions') GROUP BY trigger_name`);
    console.table(columns.rows);
    console.table(triggers.rows);
    await client.query(mode === '--apply' ? 'COMMIT' : 'ROLLBACK');
    inTransaction = false;
    console.log(mode === '--apply' ? 'Đã áp dụng chốt điểm và lịch sử.' : 'Không lưu thay đổi database.');
  } catch (error) {
    if (inTransaction) await client.query('ROLLBACK');
    throw error;
  } finally { await client.end(); }
}
main().catch((error) => { console.error('Migration điểm thất bại:', error.code || error.message); process.exitCode = 1; });
