const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/models');
const service = require('../src/services/training-program/trainingClassAcademic.service.js');
const trainingClassService = require('../src/services/training-program/trainingClass.service.js');

const student = { id: 'student-user-id', role: 'STUDENT', trainingSystemId: 'he-1-id' };

const stubOwnStudent = (t) => {
  const originalUserFindOne = db.user.findOne;
  const originalTrainingClassFindOne = db.trainingClass.findOne;
  db.user.findOne = async (options) => {
    assert.deepEqual(options.where, {
      id: student.id,
      role: 'STUDENT',
      isActive: true,
      trainingSystemId: student.trainingSystemId,
    });
    return { Profile: { trainingClassId: 'class-id', commanderId: 'commander-id' } };
  };
  db.trainingClass.findOne = async (options) => {
    assert.deepEqual(options.where, {
      id: 'class-id',
      trainingSystemId: student.trainingSystemId,
      commanderId: 'commander-id',
    });
    return { id: 'class-id' };
  };
  t.after(() => {
    db.user.findOne = originalUserFindOne;
    db.trainingClass.findOne = originalTrainingClassFindOne;
  });
};

test('student time tables and nested subject names are scoped to their own class', async (t) => {
  stubOwnStudent(t);
  const originals = {
    findTimeTables: db.trainingClassTimeTable.findAll,
    findSemesters: db.trainingClassSemester.findAll,
    findSubjects: db.trainingClassSubject.findAll,
  };
  t.after(() => {
    db.trainingClassTimeTable.findAll = originals.findTimeTables;
    db.trainingClassSemester.findAll = originals.findSemesters;
    db.trainingClassSubject.findAll = originals.findSubjects;
  });

  db.trainingClassTimeTable.findAll = async ({ where }) => {
    assert.deepEqual(where, { trainingClassId: 'class-id' });
    return [{
      semesterId: 'semester-id',
      schedules: [{ subjectId: 'subject-id', day: 1, startTime: '08:00', endTime: '09:00' }],
      get: () => ({ id: 'table-id', semesterId: 'semester-id', schedules: [{ subjectId: 'subject-id', day: 1, startTime: '08:00', endTime: '09:00' }] }),
    }];
  };
  db.trainingClassSemester.findAll = async ({ where }) => {
    assert.deepEqual(where, { trainingClassId: 'class-id' });
    return [{ id: 'semester-id', code: 1, schoolYear: '2025-2026' }];
  };
  db.trainingClassSubject.findAll = async ({ where }) => {
    assert.deepEqual(where, { trainingClassId: 'class-id' });
    return [{ id: 'subject-id', subjectCode: 'M01', subjectName: 'Môn thử nghiệm' }];
  };

  const result = await service.listMyTimeTables(student);
  assert.equal(result[0].trainingClassSemester.schoolYear, '2025-2026');
  assert.equal(result[0].schedules[0].subjectName, 'Môn thử nghiệm');
});

test('student achievements query is restricted to their user and assigned class', async (t) => {
  stubOwnStudent(t);
  const originalFindAll = db.trainingClassAchievement.findAll;
  t.after(() => { db.trainingClassAchievement.findAll = originalFindAll; });
  db.trainingClassAchievement.findAll = async ({ where }) => {
    assert.deepEqual(where, {
      trainingClassId: 'class-id',
      studentUserId: student.id,
    });
    return [];
  };

  assert.deepEqual(await service.listMyAchievements(student), []);
});

test('available class students are searched within the assigned commander and system', async (t) => {
  const commander = { id: 'commander-id', trainingSystemId: student.trainingSystemId };
  const originalClassFindOne = db.trainingClass.findOne;
  const originalProfileFindAll = db.profile.findAll;
  t.after(() => {
    db.trainingClass.findOne = originalClassFindOne;
    db.profile.findAll = originalProfileFindAll;
  });

  db.trainingClass.findOne = async ({ where }) => {
    assert.deepEqual(where, {
      id: 'class-id',
      trainingSystemId: commander.trainingSystemId,
      commanderId: commander.id,
    });
    return { id: 'class-id' };
  };
  db.profile.findAll = async (options) => {
    assert.deepEqual(options.where, {
      commanderId: commander.id,
      trainingClassId: null,
      [db.Sequelize.Op.or]: [
        { fullName: { [db.Sequelize.Op.iLike]: '%Nguyen Van A%' } },
        { code: { [db.Sequelize.Op.iLike]: '%Nguyen Van A%' } },
      ],
    });
    assert.deepEqual(options.attributes, ['id', 'code', 'fullName']);
    assert.deepEqual(options.include[0].where, {
      role: 'STUDENT',
      isActive: true,
      trainingSystemId: commander.trainingSystemId,
    });
    assert.equal(options.limit, 20);
    return [{ id: 'profile-id', code: 'HV011', fullName: 'Nguyen Van A' }];
  };

  const result = await trainingClassService.listAvailableStudents('class-id', ' Nguyen Van A ', commander);
  assert.deepEqual(result, [{ id: 'profile-id', code: 'HV011', fullName: 'Nguyen Van A' }]);
});
