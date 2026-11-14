require('dotenv').config();
const { Client } = require('pg');
const config = require('../config/dbConfig');

const mode = process.argv[2];
if (!['--report', '--dry-run', '--apply'].includes(mode) || process.argv.length !== 3) {
  console.error('Dùng --report, --dry-run hoặc --apply.');
  process.exit(1);
}
const connection = config.URL
  ? { connectionString: config.URL }
  : { host: config.HOST, port: config.port, user: config.USER, password: config.PASSWORD, database: config.DB };
if (config.ssl) connection.ssl = { rejectUnauthorized: false };

async function report(client) {
  const rows = [];
  for (const table of ['training_class_results', 'training_class_grade_proposals']) {
    const present = (await client.query('SELECT to_regclass($1) AS name', [table])).rows[0].name !== null;
    const count = present ? (await client.query(`SELECT COUNT(*)::int AS count FROM ${table}`)).rows[0].count : null;
    rows.push({ table, present, count });
  }
  console.table(rows);
}

async function main() {
  const client = new Client(connection);
  let inTransaction = false;
  try {
    await client.connect();
    const database = (await client.query('SELECT current_database() AS name')).rows[0].name;
    console.log('Database:', database);
    if (process.env.QLHV_EXPECT_DATABASE && database !== process.env.QLHV_EXPECT_DATABASE) throw new Error('Sai database dự kiến');
    await client.query(mode === '--report' ? 'BEGIN READ ONLY' : 'BEGIN');
    inTransaction = true;
    if (mode !== '--report') {
      for (const table of ['training_classes', 'training_class_semesters', 'training_class_subjects', 'profiles', 'users']) {
        if (!(await client.query('SELECT to_regclass($1) AS name', [table])).rows[0].name) throw new Error(`Thiếu bảng ${table}`);
      }
      await client.query("SET LOCAL lock_timeout = '2s'");
      await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS training_class_subjects_id_class_semester_uniq
        ON training_class_subjects(id, training_class_id, semester_id)`);
      await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS profiles_id_training_class_uniq
        ON profiles(id, training_class_id)`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS training_class_results (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          training_class_id UUID NOT NULL REFERENCES training_classes(id) ON DELETE RESTRICT,
          semester_id UUID NOT NULL,
          subject_id UUID NOT NULL,
          profile_id UUID NOT NULL,
          attempt_no INTEGER NOT NULL CHECK (attempt_no BETWEEN 1 AND 20),
          midterm_score NUMERIC(4, 2) NOT NULL CHECK (midterm_score BETWEEN 0 AND 10),
          final_score NUMERIC(4, 2) NOT NULL CHECK (final_score BETWEEN 0 AND 10),
          midterm_weight NUMERIC(3, 2) NOT NULL DEFAULT 0.50 CHECK (midterm_weight = 0.50),
          final_weight NUMERIC(3, 2) NOT NULL DEFAULT 0.50 CHECK (final_weight = 0.50),
          total_score NUMERIC(4, 2) NOT NULL CHECK (total_score BETWEEN 0 AND 10),
          classification VARCHAR(20) NOT NULL,
          entered_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT training_class_results_subject_fk FOREIGN KEY (subject_id, training_class_id, semester_id)
            REFERENCES training_class_subjects(id, training_class_id, semester_id) ON DELETE RESTRICT,
          CONSTRAINT training_class_results_profile_fk FOREIGN KEY (profile_id, training_class_id)
            REFERENCES profiles(id, training_class_id) ON DELETE RESTRICT,
          CONSTRAINT training_class_results_unique UNIQUE (profile_id, subject_id, attempt_no),
          CONSTRAINT training_class_results_total_check CHECK (total_score = ROUND((midterm_score + final_score) / 2, 2)),
          CONSTRAINT training_class_results_classification_check CHECK (
            (total_score < 5 AND classification = 'FAIL') OR
            (total_score >= 5 AND total_score < 6.5 AND classification = 'AVERAGE') OR
            (total_score >= 6.5 AND total_score < 8 AND classification = 'GOOD') OR
            (total_score >= 8 AND classification = 'EXCELLENT')
          )
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS training_class_grade_proposals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          training_class_id UUID NOT NULL REFERENCES training_classes(id) ON DELETE RESTRICT,
          semester_id UUID NOT NULL,
          subject_id UUID NOT NULL,
          profile_id UUID NOT NULL,
          student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          attempt_no INTEGER NOT NULL CHECK (attempt_no BETWEEN 1 AND 20),
          midterm_score NUMERIC(4, 2) NOT NULL CHECK (midterm_score BETWEEN 0 AND 10),
          final_score NUMERIC(4, 2) NOT NULL CHECK (final_score BETWEEN 0 AND 10),
          reason TEXT NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
          reviewer_id UUID REFERENCES users(id) ON DELETE RESTRICT,
          review_note TEXT,
          reviewed_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT training_class_grade_proposals_subject_fk FOREIGN KEY (subject_id, training_class_id, semester_id)
            REFERENCES training_class_subjects(id, training_class_id, semester_id) ON DELETE RESTRICT,
          CONSTRAINT training_class_grade_proposals_profile_fk FOREIGN KEY (profile_id, training_class_id)
            REFERENCES profiles(id, training_class_id) ON DELETE RESTRICT
        )
      `);
      await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS training_class_grade_proposals_pending_uniq
        ON training_class_grade_proposals(profile_id, subject_id, attempt_no) WHERE status = 'PENDING'`);
      await client.query(`CREATE INDEX IF NOT EXISTS training_class_results_class_idx ON training_class_results(training_class_id, semester_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS training_class_grade_proposals_class_idx ON training_class_grade_proposals(training_class_id, status)`);
      await client.query(`CREATE OR REPLACE FUNCTION reject_training_class_result_changes() RETURNS trigger AS $$
        BEGIN RAISE EXCEPTION 'Điểm chính thức đã ghi không được sửa hoặc xóa'; END;
        $$ LANGUAGE plpgsql`);
      await client.query(`DROP TRIGGER IF EXISTS training_class_results_immutable ON training_class_results`);
      await client.query(`CREATE TRIGGER training_class_results_immutable BEFORE UPDATE OR DELETE ON training_class_results
        FOR EACH ROW EXECUTE FUNCTION reject_training_class_result_changes()`);
      await client.query(`CREATE OR REPLACE FUNCTION protect_training_class_grade_proposal() RETURNS trigger AS $$
        BEGIN
          IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Đề xuất đã gửi không được xóa'; END IF;
          IF (OLD.training_class_id, OLD.semester_id, OLD.subject_id, OLD.profile_id, OLD.student_user_id,
              OLD.attempt_no, OLD.midterm_score, OLD.final_score, OLD.reason, OLD.created_at)
            IS DISTINCT FROM
             (NEW.training_class_id, NEW.semester_id, NEW.subject_id, NEW.profile_id, NEW.student_user_id,
              NEW.attempt_no, NEW.midterm_score, NEW.final_score, NEW.reason, NEW.created_at)
            OR OLD.status <> 'PENDING' OR NEW.status NOT IN ('APPROVED', 'REJECTED')
            OR NEW.reviewer_id IS NULL OR NEW.reviewed_at IS NULL
          THEN RAISE EXCEPTION 'Nội dung đề xuất đã gửi không được sửa'; END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql`);
      await client.query(`DROP TRIGGER IF EXISTS training_class_grade_proposals_protected ON training_class_grade_proposals`);
      await client.query(`CREATE TRIGGER training_class_grade_proposals_protected BEFORE UPDATE OR DELETE ON training_class_grade_proposals
        FOR EACH ROW EXECUTE FUNCTION protect_training_class_grade_proposal()`);
    }
    await report(client);
    await client.query(mode === '--apply' ? 'COMMIT' : 'ROLLBACK');
    inTransaction = false;
  } catch (error) {
    if (inTransaction) await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}
main().catch((error) => {
  console.error('Không thể cập nhật kết quả học tập:', error.code || 'ERROR', error.message);
  if (error.table || error.constraint) console.error('Đối tượng liên quan:', { table: error.table, constraint: error.constraint });
  process.exitCode = 1;
});
