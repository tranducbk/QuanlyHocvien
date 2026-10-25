// Keep the active DATABASE_URL from backend/.env out of this isolated test process.
process.env.DATABASE_URL = '';
require('dotenv').config();
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const expectedDatabase = process.env.QLHV_TEST_DB;
if (
  process.env.DATABASE_URL !== '' ||
  !expectedDatabase ||
  process.env.DB_HOST !== '127.0.0.1' ||
  process.env.DB_USER !== 'qlhv_test' ||
  process.env.DB_NAME !== expectedDatabase ||
  process.env.DB_SSL !== 'false' ||
  !/^\d+$/.test(process.env.DB_PORT || '') ||
  !/^qlhv_scope_test_[0-9a-f]{8}$/.test(expectedDatabase)
) {
  console.error('Integration test requires a fresh isolated qlhv_scope_test database on localhost.');
  process.exit(1);
}

const db = require('../src/models');
const studentService = require('../src/services/profiles/student.service.js');
const userService = require('../src/services/accounts/user.service.js');

const createUser = async (username, role, trainingSystemId, profileId, systemType) => db.user.create({
  username,
  password: crypto.randomBytes(32).toString('hex'),
  role,
  systemType,
  trainingSystemId,
  profileId,
});

async function main() {
  try {
    await db.sequelize.authenticate();
    const [existingTables] = await db.sequelize.query(`
      SELECT COUNT(*)::int AS count
      FROM information_schema.tables
      WHERE table_schema = current_schema() AND table_type = 'BASE TABLE'
    `);
    assert.equal(existingTables[0].count, 0, 'Integration test database must be empty');

    // A fresh, isolated test database only. No force or alter operation is used.
    await db.sequelize.sync();

    const he5 = await db.trainingSystem.create({ code: 'HE_5', name: 'Hệ 5' });
    const he1 = await db.trainingSystem.create({ code: 'HE_1', name: 'Hệ 1' });
    const commanderProfile = await db.profile.create({ code: 'TEST-CMD-1', fullName: 'Chỉ huy kiểm thử 1' });
    const otherCommanderProfile = await db.profile.create({ code: 'TEST-CMD-2', fullName: 'Chỉ huy kiểm thử 2' });
    const commander = await createUser('test-commander-1', 'COMMANDER', he5.id, commanderProfile.id, 'EXTERNAL');
    const otherCommander = await createUser('test-commander-2', 'COMMANDER', he5.id, otherCommanderProfile.id, 'EXTERNAL');

    const ownProfile = await db.profile.create({ code: 'TEST-OWN', fullName: 'Học viên được giao', commanderId: commander.id, currentCpa4: 3.5 });
    const otherProfile = await db.profile.create({ code: 'TEST-OTHER', fullName: 'Học viên cùng hệ khác Chỉ huy', commanderId: otherCommander.id });
    const crossSystemProfile = await db.profile.create({ code: 'TEST-CROSS', fullName: 'Học viên khác hệ', commanderId: commander.id });
    await createUser('test-own', 'STUDENT', he5.id, ownProfile.id, 'EXTERNAL');
    await createUser('test-other', 'STUDENT', he5.id, otherProfile.id, 'EXTERNAL');
    await createUser('test-cross', 'STUDENT', he1.id, crossSystemProfile.id, 'MILITARY');

    const requester = { id: commander.id, role: 'COMMANDER', trainingSystemId: he5.id, trainingSystemCode: 'HE_5' };
    const list = await studentService.getAll({}, requester);
    assert.deepEqual(list.rows.map((profile) => profile.code), ['TEST-OWN']);
    assert.equal((await studentService.getDetail(ownProfile.id, requester)).code, 'TEST-OWN');
    await assert.rejects(studentService.getDetail(otherProfile.id, requester), { statusCode: 404 });
    await assert.rejects(studentService.getDetail(crossSystemProfile.id, requester), { statusCode: 404 });

    const updateResults = await userService.updateBatchProfiles([
      { code: 'TEST-OWN', fullName: 'Đã cập nhật' },
      { code: 'TEST-OTHER', fullName: 'Không được cập nhật' },
      { code: 'TEST-CROSS', fullName: 'Không được cập nhật' },
    ], requester);
    assert.deepEqual(updateResults.map((item) => item.status), ['UPDATED', 'ERROR', 'ERROR']);
    assert.equal((await ownProfile.reload()).fullName, 'Đã cập nhật');
    assert.equal((await otherProfile.reload()).fullName, 'Học viên cùng hệ khác Chỉ huy');
    assert.equal((await crossSystemProfile.reload()).fullName, 'Học viên khác hệ');

    const graduation = await userService.graduateBatchProfiles({
      students: [
        { code: 'TEST-OWN', graduationDate: '2026-10-23' },
        { code: 'TEST-OTHER', graduationDate: '2026-10-23' },
        { code: 'TEST-CROSS', graduationDate: '2026-10-23' },
      ],
    }, requester);
    assert.equal(graduation.updated, 1);
    assert.equal(graduation.errors, 2);
    assert.ok((await ownProfile.reload()).graduationDate);
    assert.equal((await otherProfile.reload()).graduationDate, null);
    assert.equal((await crossSystemProfile.reload()).graduationDate, null);

    const admin = { role: 'ADMIN' };
    await assert.rejects(studentService.getAll({ schoolYear: '2026-2027' }, admin), { statusCode: 403 });
    const adminView = await studentService.getDetail(ownProfile.id, admin);
    assert.equal(Object.hasOwn(adminView, 'currentCpa4'), false);
    assert.equal(Object.hasOwn(adminView, 'currentCpa10'), false);

    console.log('PASS: commander list/detail, batch update/graduation and admin grade visibility on isolated test database.');
  } finally {
    await db.sequelize.close();
  }
}

main().catch((error) => {
  console.error('Scope integration test failed:', error.message);
  process.exitCode = 1;
});
