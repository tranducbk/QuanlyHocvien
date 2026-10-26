const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/models');
const classService = require('../src/services/training-program/class.service.js');

const commander = {
  id: 'commander-id',
  role: 'COMMANDER',
  trainingSystemCode: 'HE_5',
  trainingSystemId: 'he-5-id',
};

const targetClass = {
  id: 'class-id',
  educationLevelId: 'level-id',
  EducationLevel: {
    organizationId: 'organization-id',
    Organization: { universityId: 'university-id' },
  },
  dataValues: { studentCount: 1 },
};

const restoreModels = (t) => {
  const originals = {
    findClass: db.class.findByPk,
    findAndCountUsers: db.user.findAndCountAll,
    findUsers: db.user.findAll,
    updateProfiles: db.profile.update,
    transaction: db.sequelize.transaction,
  };
  t.after(() => {
    db.class.findByPk = originals.findClass;
    db.user.findAndCountAll = originals.findAndCountUsers;
    db.user.findAll = originals.findUsers;
    db.profile.update = originals.updateProfiles;
    db.sequelize.transaction = originals.transaction;
  });
};

test('Hệ 5 commander candidate list only contains managed, unassigned students in the target hierarchy', async (t) => {
  restoreModels(t);
  db.class.findByPk = async () => targetClass;
  db.user.findAndCountAll = async (options) => {
    assert.deepEqual(options.where, {
      role: 'STUDENT',
      systemType: 'EXTERNAL',
      trainingSystemId: commander.trainingSystemId,
      isActive: true,
    });
    assert.equal(options.include[0].required, true);
    assert.equal(options.include[0].where.commanderId, commander.id);
    assert.equal(options.include[0].where.classId, null);
    assert.equal(options.include[0].where.code[db.Sequelize.Op.iLike], '%HV01%');
    assert.equal(options.limit, 20);
    return { count: 1, rows: [{ id: 'student-id' }] };
  };

  const result = await classService.getAvailableStudents(
    targetClass.id,
    { page: 1, limit: 20, code: ' HV01 ' },
    commander
  );

  assert.equal(result.rows[0].id, 'student-id');
  assert.equal(result.pagination.total, 1);
});

test('Hệ 5 commander assignment is scoped and committed as one transaction', async (t) => {
  restoreModels(t);
  db.class.findByPk = async () => targetClass;
  db.sequelize.transaction = async (work) => work({ id: 'transaction-id' });
  db.user.findAll = async (options) => {
    assert.deepEqual(options.where, {
      id: { [db.Sequelize.Op.in]: ['student-id'] },
      role: 'STUDENT',
      systemType: 'EXTERNAL',
      trainingSystemId: commander.trainingSystemId,
      isActive: true,
    });
    assert.equal(options.include[0].required, true);
    assert.equal(options.include[0].where.commanderId, commander.id);
    assert.equal(options.include[0].where.classId, null);
    assert.equal(options.transaction.id, 'transaction-id');
    return [{ Profile: { id: 'profile-id' } }];
  };
  db.profile.update = async (values, options) => {
    assert.deepEqual(values, {
      classId: targetClass.id,
      educationLevelId: targetClass.educationLevelId,
      organizationId: 'organization-id',
      universityId: 'university-id',
    });
    assert.deepEqual(options.where.id, { [db.Sequelize.Op.in]: ['profile-id'] });
    assert.equal(options.where.commanderId, commander.id);
    assert.equal(options.where.classId, null);
    assert.equal(options.transaction.id, 'transaction-id');
    return [1];
  };

  const result = await classService.assignStudents(targetClass.id, ['student-id'], commander);

  assert.deepEqual(result, {
    classId: targetClass.id,
    updated: 1,
    studentCount: 1,
  });
});

test('Hệ 5 commander cannot assign a student outside their managed scope', async (t) => {
  restoreModels(t);
  db.class.findByPk = async () => targetClass;
  db.sequelize.transaction = async (work) => work({ id: 'transaction-id' });
  db.user.findAll = async () => [];
  db.profile.update = async () => {
    assert.fail('Must reject before updating profiles');
  };

  await assert.rejects(
    classService.assignStudents(targetClass.id, ['foreign-student-id'], commander),
    { statusCode: 403 }
  );
});

test('non-Hệ 5 commanders cannot use legacy class assignment', async () => {
  await assert.rejects(
    classService.assignStudents(targetClass.id, ['student-id'], {
      ...commander,
      trainingSystemCode: 'HE_3',
    }),
    { statusCode: 403 }
  );
});

test('Hệ 5 commander cannot bypass managed-student checks with student codes', async () => {
  await assert.rejects(
    classService.assignStudentsByCodes(targetClass.id, ['HV001'], commander),
    { statusCode: 403 }
  );
});
