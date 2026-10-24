const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate, summarize } = require('../src/services/trainingClassAcademic.service');

test('giữa kỳ và cuối kỳ mỗi phần chiếm 50%, tổng làm tròn hai chữ số', () => {
  assert.deepEqual(calculate({ midtermScore: 6.5, finalScore: 7.25 }), {
    midtermScore: 6.5, finalScore: 7.25, midtermWeight: 0.5, finalWeight: 0.5,
    totalScore: 6.88, classification: 'GOOD',
  });
});

test('phân loại đúng tại các ngưỡng theo đặc tả', () => {
  for (const [score, expected] of [[4.99, 'FAIL'], [5, 'AVERAGE'], [6.5, 'GOOD'], [8, 'EXCELLENT'], [10, 'EXCELLENT']]) {
    assert.equal(calculate({ midtermScore: score, finalScore: score }).classification, expected);
  }
});

test('không nhận điểm thiếu, ngoài thang hoặc hơn hai chữ số thập phân', () => {
  for (const data of [
    { midtermScore: null, finalScore: 8 },
    { midtermScore: -1, finalScore: 8 },
    { midtermScore: 8, finalScore: 10.01 },
    { midtermScore: 8.123, finalScore: 8 },
  ]) {
    assert.throws(() => calculate(data));
  }
});

test('tổng hợp học kỳ/năm lấy lần thi tốt nhất và trung bình đều các môn', () => {
  const student = { id: 'student-1', code: 'HV001', fullName: 'Học viên thử nghiệm' };
  const row = (subjectId, score, credits, schoolYear, semester, isBestAttempt = true) => ({
    isBestAttempt, profile: student, subjectId, totalScore: score,
    trainingClassSubject: { credits }, trainingClassSemester: { schoolYear, code: semester },
  });
  const result = summarize([
    row('subject-1', 4, 10, '2025-2026', 1, false),
    row('subject-1', 8, 10, '2025-2026', 1),
    row('subject-2', 6, 1, '2025-2026', 1),
    row('subject-3', 4, 2, '2025-2026', 2),
  ]);
  assert.equal(result.semesters.length, 2);
  assert.equal(result.semesters[0].averageGrade10, 7);
  assert.equal(result.semesters[0].subjectCount, 2);
  assert.equal(result.years[0].averageGrade10, 6);
  assert.equal(result.years[0].failedSubjects, 1);
  assert.equal(result.years[0].debtCredits, 2);
});
