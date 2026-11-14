// Never load the active DATABASE_URL from backend/.env for this isolated test.
process.env.DATABASE_URL = '';
require('dotenv').config();
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { once } = require('node:events');
const ExcelJS = require('exceljs');

const expectedDatabase = process.env.QLHV_TEST_DB;
if (
  process.env.DATABASE_URL !== '' ||
  !expectedDatabase ||
  process.env.DB_HOST !== '127.0.0.1' ||
  process.env.DB_USER !== 'qlhv_test' ||
  process.env.DB_NAME !== expectedDatabase ||
  process.env.DB_SSL !== 'false' ||
  !/^\d+$/.test(process.env.DB_PORT || '') ||
  !/^qlhv_scope_test_[0-9a-f]{8}$/.test(expectedDatabase) ||
  process.env.SERVER_JWT === 'false'
) {
  console.error('API integration test requires the isolated scope database and enabled JWT auth.');
  process.exit(1);
}

const db = require('../src/models');
const app = require('../src/app');
const jwtService = require('../src/services/authentication/jwt.service.js');

const getUser = async (username) => {
  const user = await db.user.findOne({ where: { username } });
  assert.ok(user, `Missing test user ${username}`);
  return user;
};

const getProfile = async (code) => {
  const profile = await db.profile.findOne({ where: { code } });
  assert.ok(profile, `Missing test profile ${code}`);
  return profile;
};

async function main() {
  let server;
  try {
    await db.sequelize.authenticate();
    const commander = await getUser('test-commander-1');
    const otherCommander = await getUser('test-commander-2');
    const ownStudent = await getUser('test-own');
    const crossSystemStudent = await getUser('test-cross');
    const [admin] = await db.user.findOrCreate({
      where: { username: 'test-admin' },
      defaults: { username: 'test-admin', password: crypto.randomBytes(32).toString('hex'), role: 'ADMIN', isAdmin: true },
    });
    const ownProfile = await getProfile('TEST-OWN');
    const otherProfile = await getProfile('TEST-OTHER');
    const crossSystemProfile = await getProfile('TEST-CROSS');
    const militaryAccounts = [];
    for (const code of ['HE_1', 'HE_3', 'HE_4', 'HE_7']) {
      const [system] = await db.trainingSystem.findOrCreate({
        where: { code },
        defaults: { code, name: `Hệ ${code.slice(3)}` },
      });
      const [commanderProfile] = await db.profile.findOrCreate({
        where: { code: `TEST-${code}-CMD` },
        defaults: { code: `TEST-${code}-CMD`, fullName: `Chỉ huy kiểm thử ${code}` },
      });
      const [militaryCommander] = await db.user.findOrCreate({
        where: { username: `test-${code}-commander` },
        defaults: {
          username: `test-${code}-commander`,
          password: crypto.randomBytes(32).toString('hex'),
          role: 'COMMANDER',
          systemType: 'MILITARY',
          trainingSystemId: system.id,
          profileId: commanderProfile.id,
        },
      });
      const [studentProfile] = await db.profile.findOrCreate({
        where: { code: `TEST-${code}-STUDENT` },
        defaults: { code: `TEST-${code}-STUDENT`, fullName: `Học viên kiểm thử ${code}`, commanderId: militaryCommander.id },
      });
      assert.equal(studentProfile.commanderId, militaryCommander.id);
      const [militaryStudent] = await db.user.findOrCreate({
        where: { username: `test-${code}-student` },
        defaults: {
          username: `test-${code}-student`,
          password: crypto.randomBytes(32).toString('hex'),
          role: 'STUDENT',
          systemType: 'MILITARY',
          trainingSystemId: system.id,
          profileId: studentProfile.id,
        },
      });
      militaryAccounts.push({ code, commander: militaryCommander, student: militaryStudent, profile: studentProfile });
    }

    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const baseUrl = `http://127.0.0.1:${server.address().port}/api`;

    const request = async (path, user, method = 'GET', body) => {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${jwtService.jwtSign({ userId: user.id })}`,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      return { status: response.status, body: await response.json() };
    };

    const exportedCodes = async (user) => {
      const response = await fetch(`${baseUrl}/users/profiles/export?fields=code,fullName`, {
        headers: { Authorization: `Bearer ${jwtService.jwtSign({ userId: user.id })}` },
      });
      assert.equal(response.status, 200, 'Commander Excel export');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(Buffer.from(await response.arrayBuffer()));
      const worksheet = workbook.worksheets[0];
      assert.ok(worksheet, 'Export must contain a worksheet');
      const codes = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) codes.push(String(row.getCell(1).value));
      });
      return codes;
    };

    const importProfiles = async (user, rows) => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Hồ sơ kiểm thử');
      worksheet.addRow(['Mã học viên', 'Họ và tên']);
      rows.forEach(({ code, fullName }) => worksheet.addRow([code, fullName]));
      const file = new Blob([await workbook.xlsx.writeBuffer()], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const form = new FormData();
      form.append('file', file, 'scope-profiles.xlsx');
      const response = await fetch(`${baseUrl}/users/batch-profiles`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${jwtService.jwtSign({ userId: user.id })}` },
        body: form,
      });
      return { status: response.status, body: await response.json() };
    };

    const list = await request('/users/profiles', commander);
    assert.equal(list.status, 200);
    assert.deepEqual(list.body.data.map((profile) => profile.code), ['TEST-OWN']);
    assert.equal((await request(`/users/profiles/${ownProfile.id}`, commander)).status, 200);
    assert.equal((await request(`/users/profiles/${otherProfile.id}`, commander)).status, 404);
    assert.equal((await request(`/users/profiles/${crossSystemProfile.id}`, commander)).status, 404);

    const secondCommanderList = await request('/users/profiles', otherCommander);
    assert.equal(secondCommanderList.status, 200);
    assert.deepEqual(secondCommanderList.body.data.map((profile) => profile.code), ['TEST-OTHER']);

    assert.equal((await request('/users/profiles', ownStudent)).status, 403);
    assert.equal((await request(`/users/profiles/${ownProfile.id}`, ownStudent)).status, 403);
    assert.equal((await request(`/users/profiles/${otherProfile.id}`, commander, 'PUT', { fullName: 'Denied' })).status, 404);
    assert.equal((await request(`/users/profiles/${crossSystemProfile.id}`, commander, 'PUT', { fullName: 'Denied' })).status, 404);

    const adminView = await request(`/users/profiles/${ownProfile.id}`, admin);
    assert.equal(adminView.status, 200);
    assert.equal(Object.hasOwn(adminView.body.data, 'currentCpa4'), false);
    assert.equal(Object.hasOwn(adminView.body.data, 'currentCpa10'), false);
    assert.equal((await request(`/users/profiles/${ownProfile.id}`, admin, 'PUT', { fullName: 'Denied' })).status, 403);

    assert.equal((await request('/subject-results', commander)).status, 200);
    assert.equal((await request('/subject-results', ownStudent)).status, 403);
    assert.equal((await request('/subject-results', crossSystemStudent)).status, 403);
    assert.equal((await request('/subject-results', admin)).status, 403);

    for (const account of militaryAccounts) {
      const scopedList = await request('/users/profiles', account.commander);
      assert.equal(scopedList.status, 200, `${account.code} commander list`);
      assert.deepEqual(scopedList.body.data.map((profile) => profile.code), [account.profile.code]);
      assert.equal((await request(`/users/profiles/${ownProfile.id}`, account.commander)).status, 404);
      assert.equal((await request('/users/profiles', account.student)).status, 403);
      assert.equal((await request('/subject-results', account.commander)).status, 403);
      assert.equal((await request('/subject-results', account.student)).status, 403);
      assert.equal((await request('/military/classes', account.commander)).status, 403);
    }

    assert.deepEqual(await exportedCodes(commander), ['TEST-OWN']);
    assert.deepEqual(await exportedCodes(otherCommander), ['TEST-OTHER']);
    for (const account of militaryAccounts) {
      assert.deepEqual(await exportedCodes(account.commander), [account.profile.code], `${account.code} Excel scope`);
    }
    assert.equal((await request('/users/profiles/export', ownStudent)).status, 403);
    assert.equal((await request('/users/profiles/export', admin)).status, 403);

    const otherName = otherProfile.fullName;
    const crossSystemName = crossSystemProfile.fullName;
    const excelImport = await importProfiles(commander, [
      { code: 'TEST-OWN', fullName: 'Học viên được giao qua Excel' },
      { code: 'TEST-OTHER', fullName: 'Không được sửa cùng hệ' },
      { code: 'TEST-CROSS', fullName: 'Không được sửa khác hệ' },
    ]);
    assert.equal(excelImport.status, 200, 'Commander Excel import');
    assert.deepEqual(excelImport.body.data.map(({ code, status }) => ({ code, status })), [
      { code: 'TEST-OWN', status: 'UPDATED' },
      { code: 'TEST-OTHER', status: 'ERROR' },
      { code: 'TEST-CROSS', status: 'ERROR' },
    ]);
    assert.equal((await getProfile('TEST-OWN')).fullName, 'Học viên được giao qua Excel');
    assert.equal((await getProfile('TEST-OTHER')).fullName, otherName);
    assert.equal((await getProfile('TEST-CROSS')).fullName, crossSystemName);
    assert.deepEqual(await exportedCodes(commander), ['TEST-OWN']);
    assert.equal((await importProfiles(ownStudent, [{ code: 'TEST-OWN', fullName: 'Denied' }])).status, 403);
    assert.equal((await importProfiles(admin, [{ code: 'TEST-OWN', fullName: 'Denied' }])).status, 403);

    assert.equal((await request(`/users/profiles/${ownProfile.id}`, commander, 'PUT', { currentAddress: 'Địa chỉ kiểm thử' })).status, 200);
    assert.equal((await getProfile('TEST-OWN')).currentAddress, 'Địa chỉ kiểm thử');
    assert.equal((await request(`/users/profiles/${ownProfile.id}`, commander, 'PUT', { currentCpa4: 3.5 })).status, 403);

    const createAcademicFixture = async (student, subjectCode) => {
      const schoolYear = '2099-2100';
      const [yearly] = await db.yearlyResult.findOrCreate({
        where: { userId: student.id, schoolYear },
        defaults: { userId: student.id, schoolYear, averageGrade4: 3.5, averageGrade10: 8.5, passedSubjects: 1, failedSubjects: 0 },
      });
      const [semester] = await db.semesterResult.findOrCreate({
        where: { userId: student.id, schoolYear, semester: 'HK1' },
        defaults: { userId: student.id, schoolYear, semester: 'HK1', yearlyResultId: yearly.id, averageGrade4: 3.5 },
      });
      const [subject] = await db.subjectResult.findOrCreate({
        where: { semesterResultId: semester.id, subjectCode },
        defaults: { semesterResultId: semester.id, subjectCode, subjectName: 'Môn kiểm thử phạm vi', credits: 3, gradePoint4: 3.5, gradePoint10: 8.5, letterGrade: 'B+' },
      });
      return { yearly, semester, subject };
    };
    const ownAcademic = await createAcademicFixture(ownStudent, 'SCOPE-OWN');
    const otherAcademic = await createAcademicFixture(await getUser('test-other'), 'SCOPE-OTHER');
    const crossAcademic = await createAcademicFixture(crossSystemStudent, 'SCOPE-CROSS');

    for (const [path, ownId, otherId, crossId] of [
      ['/yearly-results', ownAcademic.yearly.id, otherAcademic.yearly.id, crossAcademic.yearly.id],
      ['/semester-results', ownAcademic.semester.id, otherAcademic.semester.id, crossAcademic.semester.id],
      ['/subject-results', ownAcademic.subject.id, otherAcademic.subject.id, crossAcademic.subject.id],
    ]) {
      const listResult = await request(`${path}?schoolYear=2099-2100`, commander);
      assert.equal(listResult.status, 200, `${path} list`);
      assert.deepEqual(listResult.body.data.map((row) => row.id), [ownId], `${path} must list only assigned student's result`);
      assert.equal((await request(`${path}/${ownId}`, commander)).status, 200, `${path} own detail`);
      assert.equal((await request(`${path}/${otherId}`, commander)).status, 404, `${path} same-system unassigned detail`);
      assert.equal((await request(`${path}/${crossId}`, commander)).status, 404, `${path} cross-system detail`);
      assert.equal((await request(path, ownStudent)).status, 403, `${path} student role`);
      assert.equal((await request(path, admin)).status, 403, `${path} admin role`);
    }
    const yearlyDetail = await request(`/yearly-results/${ownAcademic.yearly.id}`, commander);
    assert.equal(yearlyDetail.status, 200, 'Yearly result detail');
    assert.ok(Array.isArray(yearlyDetail.body.data?.semesterResults), 'Yearly result detail must include semesterResults');
    assert.deepEqual(yearlyDetail.body.data.semesterResults.map((row) => row.id), [ownAcademic.semester.id]);
    const academicReport = await request('/users/reports/academic?schoolYear=2099-2100', commander);
    assert.equal(academicReport.status, 200);
    assert.deepEqual(academicReport.body.data.detail.map((row) => row.id), [ownAcademic.yearly.id]);
    assert.equal(academicReport.body.data.summary.totalStudents, 1);
    assert.equal((await request('/users/reports/academic?schoolYear=2099-2100', ownStudent)).status, 403);
    assert.equal((await request('/users/reports/academic?schoolYear=2099-2100', admin)).status, 403);

    console.log('PASS: HTTP role, assignment, Excel, populated academic/report, profile update and cross-system checks for HE_1/3/4/5/7 on isolated test database.');
  } finally {
    if (server) {
      server.close();
      server.closeAllConnections();
    }
    await db.sequelize.close();
  }
}

main().catch((error) => {
  console.error('Scope API integration test failed:', error.stack || error.message);
  process.exitCode = 1;
});
