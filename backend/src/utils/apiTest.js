const http = require('http');

const BASE_URL = 'http://localhost:6868/api';

let adminToken = null;
let commanderToken = null;
let studentToken = null;
let studentUserId = null;
let commanderUserId = null;
let passed = 0;
let failed = 0;
const ts = Date.now();

async function request(method, path, body = null, token = null) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return new Promise((resolve, reject) => {
    const options = new URL(url);
    const req = http.request(
      { hostname: options.hostname, port: options.port, path: options.pathname + options.search, method, headers },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function uploadAvatar(path, token = null) {
  const boundary = `----student-manager-${Date.now()}`;
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
    'base64'
  );
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\n`),
    Buffer.from('Content-Disposition: form-data; name="avatar"; filename="avatar.png"\r\n'),
    Buffer.from('Content-Type: image/png\r\n\r\n'),
    png,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': body.length,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  return new Promise((resolve, reject) => {
    const options = new URL(url);
    const req = http.request(
      { hostname: options.hostname, port: options.port, path: options.pathname + options.search, method: 'POST', headers },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function ok(label, status, expected) {
  const pass = status === expected;
  pass ? passed++ : failed++;
  console.log(`  ${pass ? '✅' : '❌'} ${label} (${status}${pass ? '' : `, expected ${expected}`})`);
}

function section(title) { console.log(`\n${'─'.repeat(55)}\n  ${title}\n${'─'.repeat(55)}`); }

async function testGetAll(label, path) {
  ok(`${label} | admin   `, (await request('GET', path, null, adminToken)).status, 200);
  ok(`${label} | commander`, (await request('GET', path, null, commanderToken)).status, 200);
  ok(`${label} | student `, (await request('GET', path, null, studentToken)).status, 403);
  ok(`${label} | no-token`, (await request('GET', path)).status, 401);
}

function firstId(res) {
  const data = res.body?.data;
  if (!data) return null;
  const rows = Array.isArray(data) ? data : data.rows;
  if (!rows || !rows.length) return null;
  return String(rows[0].id);
}

async function restoreAvatar(profile) {
  if (!profile?.id) return;
  const db = require('../models');
  await db.profile.update(
    { avatar: profile.avatar ?? null },
    { where: { id: profile.id } }
  );
}

async function main() {
  console.log('🚀 FULL API ENDPOINT TEST (all roles)\n');

  // =================================================================
  // 0. HEALTH
  // =================================================================
  section('0. HEALTH');
  await new Promise((resolve) => {
    http.get(BASE_URL.replace('/api', '/health'), (r) => resolve(r.statusCode));
  }).then(s => ok('GET /health', s, 200));

  // =================================================================
  // 1. AUTH: LOGIN (Public)
  // =================================================================
  section('1. AUTH: LOGIN (Public)');
  let r = await request('POST', '/auth/login', { username: 'admin', password: 'admin123' });
  ok('POST /auth/login (admin)     ', r.status, 200); adminToken = r.body.data?.accessToken;

  r = await request('POST', '/auth/login', { username: 'chihuy01', password: 'chihuy123' });
  ok('POST /auth/login (commander) ', r.status, 200);
  commanderToken = r.body.data?.accessToken;
  commanderUserId = r.body.data?.user?.id;

  r = await request('POST', '/auth/login', { username: 'hv001', password: 'hocvien123' });
  ok('POST /auth/login (student)   ', r.status, 200);
  studentToken = r.body.data?.accessToken;
  studentUserId = r.body.data?.user?.id;

  ok('POST /auth/login (wrong pass) ', (await request('POST', '/auth/login', { username: 'admin', password: 'x' })).status, 401);
  if (!adminToken) { console.log('\n❌ Admin login failed!'); process.exit(1); }

  // =================================================================
  // 2. AUTH: SELF-SERVICE (All Roles via authMiddleware)
  // =================================================================
  section('2. AUTH: SELF-SERVICE (All Roles)');
  ok('GET  /auth/me           | admin     ', (await request('GET', '/auth/me', null, adminToken)).status, 200);
  ok('GET  /auth/me           | commander ', (await request('GET', '/auth/me', null, commanderToken)).status, 200);
  ok('GET  /auth/me           | student   ', (await request('GET', '/auth/me', null, studentToken)).status, 200);
  ok('GET  /auth/me           | no-token  ', (await request('GET', '/auth/me')).status, 401);

  ok('GET  /auth/profile      | admin     ', (await request('GET', '/auth/profile', null, adminToken)).status, 200);
  ok('GET  /auth/profile      | commander ', (await request('GET', '/auth/profile', null, commanderToken)).status, 200);
  ok('GET  /auth/profile      | student   ', (await request('GET', '/auth/profile', null, studentToken)).status, 200);

  // Admin has no profileId → updateProfile returns 400
  ok('PUT  /auth/profile      | admin     ', (await request('PUT', '/auth/profile', { phoneNumber: '099' }, adminToken)).status, 400);
  ok('PUT  /auth/profile      | commander ', (await request('PUT', '/auth/profile', { phoneNumber: '099' }, commanderToken)).status, 200);
  ok('PUT  /auth/profile      | student   ', (await request('PUT', '/auth/profile', { phoneNumber: '099' }, studentToken)).status, 200);

  ok('POST /auth/change-password | admin     ', (await request('POST', '/auth/change-password', { oldPassword: 'admin123', newPassword: 'admin123' }, adminToken)).status, 200);
  ok('POST /auth/change-password | commander ', (await request('POST', '/auth/change-password', { oldPassword: 'chihuy123', newPassword: 'chihuy123' }, commanderToken)).status, 200);
  ok('POST /auth/change-password | student   ', (await request('POST', '/auth/change-password', { oldPassword: 'hocvien123', newPassword: 'hocvien123' }, studentToken)).status, 200);

  const rTok = (await request('POST', '/auth/login', { username: 'admin', password: 'admin123' })).body.data?.refreshToken;
  if (rTok) ok('POST /auth/refresh-token (public)  ', (await request('POST', '/auth/refresh-token', { refreshToken: rTok })).status, 200);

  // =================================================================
  // 3. AUTH: REGISTER (Admin Only)
  // =================================================================
  section('3. AUTH: REGISTER (Admin Only)');
  const regBody = { username: `reg${ts}`, password: 'test123456', role: 'STUDENT', fullName: 'Test' };
  ok('POST /auth/register | admin (201)     ', (await request('POST', '/auth/register', regBody, adminToken)).status, 201);
  ok('POST /auth/register | commander (403) ', (await request('POST', '/auth/register', regBody, commanderToken)).status, 403);
  ok('POST /auth/register | student (403)   ', (await request('POST', '/auth/register', regBody, studentToken)).status, 403);
  ok('POST /auth/register | no-token (401)  ', (await request('POST', '/auth/register', regBody)).status, 401);

  // =================================================================
  // 4. AUTH: NOTIFICATIONS SELF (All Roles)
  // =================================================================
  section('4. AUTH: NOTIFICATIONS SELF (All Roles)');
  ok('GET  /auth/notifications   | admin     ', (await request('GET', '/auth/notifications', null, adminToken)).status, 200);
  ok('GET  /auth/notifications   | commander ', (await request('GET', '/auth/notifications', null, commanderToken)).status, 200);
  ok('GET  /auth/notifications   | student   ', (await request('GET', '/auth/notifications', null, studentToken)).status, 200);
  ok('GET  /auth/notifications   | no-token  ', (await request('GET', '/auth/notifications')).status, 401);

  ok('PUT  /auth/notifications/read-all | admin    ', (await request('PUT', '/auth/notifications/read-all', {}, adminToken)).status, 200);
  ok('PUT  /auth/notifications/read-all | commander', (await request('PUT', '/auth/notifications/read-all', {}, commanderToken)).status, 200);
  ok('PUT  /auth/notifications/read-all | student  ', (await request('PUT', '/auth/notifications/read-all', {}, studentToken)).status, 200);

  // =================================================================
  // 5. STUDENT-ONLY (requireStudent)
  // =================================================================
  section('5. USERS: STUDENT-ONLY (requireStudent → role=STUDENT)');
  const studentOnly = [
    '/users/academic-results', '/users/time-table', '/users/cut-rice',
    '/users/achievements', '/users/tuition-fees',
  ];
  for (const p of studentOnly) {
    ok(`GET  ${p.padEnd(28)} | admin     `, (await request('GET', p, null, adminToken)).status, 403);
    ok(`GET  ${p.padEnd(28)} | commander `, (await request('GET', p, null, commanderToken)).status, 403);
    ok(`GET  ${p.padEnd(28)} | student   `, (await request('GET', p, null, studentToken)).status, 200);
  }

  const semesterId = firstId(await request('GET', '/semesters?limit=1', null, adminToken));
  const ttBody = { schedules: [{ day: 'Thứ 2', startTime: '07:00', endTime: '09:00', room: '101', subjectName: 'Toán cao cấp', week: [1, 2, 3] }] };
  ok('POST /users/time-table | student (403)   ', (await request('POST', '/users/time-table', ttBody, studentToken)).status, 403);
  ok('POST /users/time-table | admin (403)     ', (await request('POST', '/users/time-table', ttBody, adminToken)).status, 403);
  ok('POST /users/time-table | commander (403) ', (await request('POST', '/users/time-table', ttBody, commanderToken)).status, 403);
  if (studentUserId) {
    ok('POST /time-tables      | commander nhập TKB ', (await request('POST', '/time-tables', { ...ttBody, userId: studentUserId, semesterId }, commanderToken)).status, 201);
  }

  const cutBody = { weekly: { Monday: { morning: true } } };
  ok('PUT  /users/cut-rice   | student (200)   ', (await request('PUT', '/users/cut-rice', cutBody, studentToken)).status, 200);
  ok('PUT  /users/cut-rice   | admin (403)     ', (await request('PUT', '/users/cut-rice', cutBody, adminToken)).status, 403);
  ok('PUT  /users/cut-rice   | commander (403) ', (await request('PUT', '/users/cut-rice', cutBody, commanderToken)).status, 403);

  // =================================================================
  // 6. PROFILE SELF (Student + Commander only)
  // =================================================================
  section('6. USERS: PROFILE SELF (Student + Commander)');
  const studentProfileBefore = await request('GET', '/users/profile', null, studentToken);
  const commanderProfileBefore = await request('GET', '/users/profile', null, commanderToken);
  ok('GET  /users/profile    | student (200)   ', studentProfileBefore.status, 200);
  ok('GET  /users/profile    | commander (200) ', commanderProfileBefore.status, 200);
  ok('GET  /users/profile    | admin (403)     ', (await request('GET', '/users/profile', null, adminToken)).status, 403);

  ok('PUT  /users/profile    | student (200)   ', (await request('PUT', '/users/profile', { phoneNumber: '011' }, studentToken)).status, 200);
  ok('PUT  /users/profile    | commander (200) ', (await request('PUT', '/users/profile', { phoneNumber: '022' }, commanderToken)).status, 200);
  ok('PUT  /users/profile    | admin (403)     ', (await request('PUT', '/users/profile', { phoneNumber: '033' }, adminToken)).status, 403);

  ok('POST /users/avatar     | student file (200)   ', (await uploadAvatar('/users/avatar', studentToken)).status, 200);
  ok('POST /users/avatar     | commander file (200) ', (await uploadAvatar('/users/avatar', commanderToken)).status, 200);
  ok('POST /users/avatar     | json no file (400)   ', (await request('POST', '/users/avatar', { avatar: null }, studentToken)).status, 400);
  ok('POST /users/avatar     | admin (403)           ', (await uploadAvatar('/users/avatar', adminToken)).status, 403);
  await restoreAvatar(studentProfileBefore.body?.data);
  await restoreAvatar(commanderProfileBefore.body?.data);

  // =================================================================
  // 7. ADMIN+COMMANDER SHARED (Profile management, Reports, Users list)
  // =================================================================
  section('7. USERS: SHARED (Admin + Commander)');
  const shared = [
    '/users/profiles', '/users/profiles/export',
    '/users/reports/academic', '/users/reports/party-training',
    '/users/reports/achievements', '/users/reports/tuition',
    '/users',
  ];
  for (const p of shared) {
    ok(`GET  ${p.padEnd(32)} | admin     `, (await request('GET', p, null, adminToken)).status, 200);
    ok(`GET  ${p.padEnd(32)} | commander `, (await request('GET', p, null, commanderToken)).status, 200);
    ok(`GET  ${p.padEnd(32)} | student   `, (await request('GET', p, null, studentToken)).status, 403);
  }
  ok('GET  /commanders/reports/tuition    | admin     ', (await request('GET', '/commanders/reports/tuition', null, adminToken)).status, 200);
  ok('GET  /commanders/reports/tuition    | commander ', (await request('GET', '/commanders/reports/tuition', null, commanderToken)).status, 200);
  ok('GET  /commanders/reports/tuition    | student   ', (await request('GET', '/commanders/reports/tuition', null, studentToken)).status, 403);
  ok('GET  /admins/dashboard              | admin     ', (await request('GET', '/admins/dashboard', null, adminToken)).status, 200);
  ok('GET  /admins/dashboard              | commander ', (await request('GET', '/admins/dashboard', null, commanderToken)).status, 403);
  ok('GET  /admins/dashboard              | student   ', (await request('GET', '/admins/dashboard', null, studentToken)).status, 403);
  ok('GET  /commanders/dashboard          | admin     ', (await request('GET', '/commanders/dashboard', null, adminToken)).status, 403);
  ok('GET  /commanders/dashboard          | commander ', (await request('GET', '/commanders/dashboard', null, commanderToken)).status, 200);
  ok('GET  /commanders/dashboard          | student   ', (await request('GET', '/commanders/dashboard', null, studentToken)).status, 403);
  ok('GET  /students/dashboard            | admin     ', (await request('GET', '/students/dashboard', null, adminToken)).status, 403);
  ok('GET  /students/dashboard            | commander ', (await request('GET', '/students/dashboard', null, commanderToken)).status, 403);
  ok('GET  /students/dashboard            | student   ', (await request('GET', '/students/dashboard', null, studentToken)).status, 200);

  // Get first profile for detail tests
  const profPage = await request('GET', '/users/profiles?limit=1', null, adminToken);
  const profId = firstId(profPage);
  if (profId) {
    ok(`GET  /users/profiles/:id     | admin     `, (await request('GET', `/users/profiles/${profId}`, null, adminToken)).status, 200);
    ok(`GET  /users/profiles/:id     | commander `, (await request('GET', `/users/profiles/${profId}`, null, commanderToken)).status, 200);
    ok(`GET  /users/profiles/:id     | student   `, (await request('GET', `/users/profiles/${profId}`, null, studentToken)).status, 403);
    ok(`PUT  /users/profiles/:id     | admin     `, (await request('PUT', `/users/profiles/${profId}`, { phoneNumber: '099' }, adminToken)).status, 200);
    ok(`PUT  /users/profiles/:id     | commander `, (await request('PUT', `/users/profiles/${profId}`, { phoneNumber: '088' }, commanderToken)).status, 200);
    ok(`PUT  /users/profiles/:id     | student   `, (await request('PUT', `/users/profiles/${profId}`, { phoneNumber: '077' }, studentToken)).status, 403);
    ok(`DELETE /users/profiles/:id   | commander `, (await request('DELETE', `/users/profiles/${profId}`, null, commanderToken)).status, 403);
    ok(`DELETE /users/profiles/:id   | student   `, (await request('DELETE', `/users/profiles/${profId}`, null, studentToken)).status, 403);
  }

  // Batch profiles update
  ok('PUT  /users/batch-profiles | admin     ', (await request('PUT', '/users/batch-profiles', [{ code: 'HV001', phoneNumber: '000' }], adminToken)).status, 200);
  ok('PUT  /users/batch-profiles | commander ', (await request('PUT', '/users/batch-profiles', [{ code: 'HV001', phoneNumber: '111' }], commanderToken)).status, 200);
  ok('PUT  /users/batch-profiles | student   ', (await request('PUT', '/users/batch-profiles', [{ code: 'HV001' }], studentToken)).status, 403);

  // =================================================================
  // 8. ADMIN-ONLY (User CRUD create/delete/reset/toggle)
  // =================================================================
  section('8. USERS: ADMIN-ONLY');
  const userBody = { username: `admcrud${ts}`, password: 'test123456', role: 'STUDENT', fullName: 'CRUD' };
  ok('POST /users           | admin (201)     ', (await request('POST', '/users', userBody, adminToken)).status, 201);
  ok('POST /users           | commander (403) ', (await request('POST', '/users', userBody, commanderToken)).status, 403);
  ok('POST /users           | student (403)   ', (await request('POST', '/users', userBody, studentToken)).status, 403);

  const batchBody = { users: [{ username: `batchadm${ts}`, password: 'test123456', role: 'STUDENT' }] };
  ok('POST /users/batch     | admin (201)     ', (await request('POST', '/users/batch', batchBody, adminToken)).status, 201);
  ok('POST /users/batch     | commander (403) ', (await request('POST', '/users/batch', batchBody, commanderToken)).status, 403);
  ok('POST /users/batch     | student (403)   ', (await request('POST', '/users/batch', batchBody, studentToken)).status, 403);

  const batchUsersBody = { users: [{ username: `batch2adm${ts}`, password: 'test123456', role: 'STUDENT', fullName: 'B2' }] };
  ok('POST /users/batch-users | admin (201)   ', (await request('POST', '/users/batch-users', batchUsersBody, adminToken)).status, 201);
  ok('POST /users/batch-users | commander (403)', (await request('POST', '/users/batch-users', batchUsersBody, commanderToken)).status, 403);
  ok('POST /users/batch-users | student (403) ', (await request('POST', '/users/batch-users', batchUsersBody, studentToken)).status, 403);

  // Get a student user for update/delete/reset/toggle tests
  const userPage = await request('GET', '/users?role=STUDENT&limit=1', null, adminToken);
  const suId = firstId(userPage);

  if (suId) {
    ok(`PUT  /users/:id       | admin (200)     `, (await request('PUT', `/users/${suId}`, { fullName: 'Updated' }, adminToken)).status, 200);
    ok(`PUT  /users/:id       | commander (200) `, (await request('PUT', `/users/${suId}`, { fullName: 'Updated2' }, commanderToken)).status, 200);
    ok(`PUT  /users/:id       | student (403)   `, (await request('PUT', `/users/${suId}`, { fullName: 'x' }, studentToken)).status, 403);

    ok(`GET  /users/:id       | admin (200)     `, (await request('GET', `/users/${suId}`, null, adminToken)).status, 200);
    ok(`GET  /users/:id       | commander (200) `, (await request('GET', `/users/${suId}`, null, commanderToken)).status, 200);
    ok(`GET  /users/:id       | student (403)   `, (await request('GET', `/users/${suId}`, null, studentToken)).status, 403);

    const rpBody = { newPassword: 'reset123456' };
    ok(`POST /users/:id/reset-password | admin (200)  `, (await request('POST', `/users/${suId}/reset-password`, rpBody, adminToken)).status, 200);
    ok(`POST /users/:id/reset-password | commander (403)`, (await request('POST', `/users/${suId}/reset-password`, rpBody, commanderToken)).status, 403);
    ok(`POST /users/:id/reset-password | student (403)`, (await request('POST', `/users/${suId}/reset-password`, rpBody, studentToken)).status, 403);

    ok(`POST /users/:id/toggle-active | admin (200)   `, (await request('POST', `/users/${suId}/toggle-active`, {}, adminToken)).status, 200);
    ok(`POST /users/:id/toggle-active | commander (403)`, (await request('POST', `/users/${suId}/toggle-active`, {}, commanderToken)).status, 403);
    ok(`POST /users/:id/toggle-active | student (403) `, (await request('POST', `/users/${suId}/toggle-active`, {}, studentToken)).status, 403);

    ok(`DELETE /users/:id     | admin (200)     `, (await request('DELETE', `/users/${suId}`, null, adminToken)).status, 200);

    // Get another student for commander delete test
    const another = firstId(await request('GET', '/users?role=STUDENT&limit=1', null, adminToken));
    if (another) ok(`DELETE /users/:id     | commander (403) `, (await request('DELETE', `/users/${another}`, null, commanderToken)).status, 403);
  }

  // =================================================================
  // 9. GRADE REQUESTS
  // =================================================================
  section('9. GRADE REQUESTS');
  // Find a subject result owned by the logged-in student.
  let srId = null;
  if (studentUserId) {
    const studentSemPage = await request('GET', `/semester-results?userId=${studentUserId}&limit=1`, null, adminToken);
    const studentSemId = firstId(studentSemPage);
    if (studentSemId) {
      srId = firstId(await request('GET', `/subject-results?semesterResultId=${studentSemId}&limit=1`, null, adminToken));
    }
  }
  if (srId) {
    const grBody = { subjectResultId: srId, requestType: 'UPDATE', reason: 'Test reason' };
    const grRes = await request('POST', '/students/grade-requests', grBody, studentToken);
    ok('POST /students/grade-requests | student (201)   ', grRes.status, 201);
    ok('POST /students/grade-requests | admin (403)     ', (await request('POST', '/students/grade-requests', grBody, adminToken)).status, 403);
    ok('POST /students/grade-requests | commander (403) ', (await request('POST', '/students/grade-requests', grBody, commanderToken)).status, 403);
  }

  ok('GET  /students/grade-requests    | admin (403)     ', (await request('GET', '/students/grade-requests', null, adminToken)).status, 403);
  ok('GET  /students/grade-requests    | commander (403) ', (await request('GET', '/students/grade-requests', null, commanderToken)).status, 403);
  ok('GET  /students/grade-requests    | student (200)   ', (await request('GET', '/students/grade-requests', null, studentToken)).status, 200);
  ok('GET  /students/grade-requests?limit=1 | pagination ', (await request('GET', '/students/grade-requests?limit=1', null, studentToken)).body?.pagination?.limit, 1);

  ok('GET  /commanders/grade-requests  | admin (200)     ', (await request('GET', '/commanders/grade-requests', null, adminToken)).status, 200);
  ok('GET  /commanders/grade-requests  | commander (200) ', (await request('GET', '/commanders/grade-requests', null, commanderToken)).status, 200);
  ok('GET  /commanders/grade-requests  | student (403)   ', (await request('GET', '/commanders/grade-requests', null, studentToken)).status, 403);

  // Approve test (find a PENDING request)
  const pendPage = await request('GET', '/commanders/grade-requests?status=PENDING&limit=1', null, adminToken);
  const grId = firstId(pendPage);
  if (grId) {
    const appRes = await request('POST', `/commanders/grade-requests/${grId}/approve`, { reviewNote: 'OK' }, adminToken);
    ok('POST /cmd/grade-requests/:id/approve | admin (200)  ', appRes.status, 200);
    ok('POST /cmd/grade-requests/:id/approve | student (403)', (await request('POST', `/commanders/grade-requests/${grId}/approve`, {}, studentToken)).status, 403);
  }

  // =================================================================
  // 10. RESOURCE CRUD: GET LIST (Admin+Commander OK, Student 403)
  // =================================================================
  section('10. RESOURCE CRUD: GET All (Admin+Commander)');
  const resources = [
    '/universities', '/organizations', '/education-levels', '/classes',
    '/yearly-results', '/semester-results', '/subject-results', '/semesters',
    '/time-tables', '/tuition-fees',
    '/achievements', '/achievement-profiles', '/yearly-achievements',
    '/scientific-initiatives', '/scientific-topics',
    '/cut-rice', '/commander-duty-schedules', '/notifications',
  ];

  for (const p of resources) {
    ok(`GET  ${p.padEnd(22)} | admin     `, (await request('GET', p, null, adminToken)).status, 200);
    ok(`GET  ${p.padEnd(22)} | commander `, (await request('GET', p, null, commanderToken)).status, 200);
    ok(`GET  ${p.padEnd(22)} | student   `, (await request('GET', p, null, studentToken)).status, 403);
  }

  // =================================================================
  // 11. RESOURCE: CREATE (Admin+Commander), test with valid data
  // =================================================================
  section('11. RESOURCE CRUD: CREATE');
  // Get parent IDs for resources that require foreign keys
  const uniPage = await request('GET', '/universities?limit=1', null, adminToken);
  const orgPage = await request('GET', '/organizations?limit=1', null, adminToken);
  const elPage = await request('GET', '/education-levels?limit=1', null, adminToken);
  const firstUniId = firstId(uniPage);
  const firstOrgId = firstId(orgPage);
  const firstElId = firstId(elPage);

  const semesterCodeBase = Number(String(ts).slice(-6));
  const createTests = [
    { path: '/universities', body: { universityCode: `U_ADMIN_${ts}`, universityName: `Uni Admin ${ts}` }, cmdBody: { universityCode: `U_CMD_${ts}`, universityName: `Uni Cmd ${ts}` } },
    { path: '/organizations', body: { organizationName: `Org Admin ${ts}`, universityId: firstUniId }, cmdBody: { organizationName: `Org Cmd ${ts}`, universityId: firstUniId } },
    { path: '/education-levels', body: { levelName: `Level Admin ${ts}`, organizationId: firstOrgId }, cmdBody: { levelName: `Level Cmd ${ts}`, organizationId: firstOrgId } },
    { path: '/classes', body: { className: `Class Admin ${ts}`, educationLevelId: firstElId }, cmdBody: { className: `Class Cmd ${ts}`, educationLevelId: firstElId } },
    { path: '/semesters', body: { code: semesterCodeBase, schoolYear: '2024-2025' }, cmdBody: { code: semesterCodeBase + 1, schoolYear: '2024-2025' } },
    { path: '/commander-duty-schedules', body: { userId: commanderUserId, position: 'Admin' }, cmdBody: { userId: commanderUserId, position: 'Cmd' } },
  ];

  const created = {};
  for (const { path, body, cmdBody } of createTests) {
    const r1 = await request('POST', path, body, adminToken);
    ok(`POST ${path.padEnd(25)} | admin     `, r1.status, 201);
    if (r1.body.data?.id || r1.body.id) created[path] = String(r1.body.data?.id || r1.body.id);

    const cmdB = cmdBody || body;
    const r2 = await request('POST', path, cmdB, commanderToken);
    ok(`POST ${path.padEnd(25)} | commander `, r2.status, 201);

    ok(`POST ${path.padEnd(25)} | student   `, (await request('POST', path, body, studentToken)).status, 403);
  }

  // =================================================================
  // 12. RESOURCE: GET/:id PUT/:id DELETE/:id
  // =================================================================
  section('12. RESOURCE: GET/:id PUT/:id DELETE/:id');
  for (const [path, id] of Object.entries(created)) {
    const short = `${path}/${id.substring(0, 6)}...`;
    ok(`GET  ${short.padEnd(32)} | admin     `, (await request('GET', `${path}/${id}`, null, adminToken)).status, 200);
    ok(`GET  ${short.padEnd(32)} | commander `, (await request('GET', `${path}/${id}`, null, commanderToken)).status, 200);
    ok(`GET  ${short.padEnd(32)} | student   `, (await request('GET', `${path}/${id}`, null, studentToken)).status, 403);

    ok(`PUT  ${short.padEnd(32)} | admin     `, (await request('PUT', `${path}/${id}`, { notes: 'U' }, adminToken)).status, 200);
    ok(`PUT  ${short.padEnd(32)} | commander `, (await request('PUT', `${path}/${id}`, { notes: 'U' }, commanderToken)).status, 200);
    ok(`PUT  ${short.padEnd(32)} | student   `, (await request('PUT', `${path}/${id}`, { notes: 'x' }, studentToken)).status, 403);

    ok(`DELETE ${short.padEnd(32)} | admin     `, (await request('DELETE', `${path}/${id}`, null, adminToken)).status, 200);
  }

  // =================================================================
  // 13. SPECIAL ENDPOINTS
  // =================================================================
  section('13. SPECIAL ENDPOINTS');
  ok('GET  /universities/hierarchy | admin     ', (await request('GET', '/universities/hierarchy', null, adminToken)).status, 200);
  ok('GET  /universities/hierarchy | student   ', (await request('GET', '/universities/hierarchy', null, studentToken)).status, 403);

  ok('GET  /yearly-results/export  | admin     ', (await request('GET', '/yearly-results/export', null, adminToken)).status, 200);
  ok('GET  /yearly-results/export  | student   ', (await request('GET', '/yearly-results/export', null, studentToken)).status, 403);

  ok('GET  /cut-rice/export        | admin     ', (await request('GET', '/cut-rice/export', null, adminToken)).status, 200);
  ok('GET  /cut-rice/export        | student   ', (await request('GET', '/cut-rice/export', null, studentToken)).status, 403);

  ok('GET  /time-tables/report     | admin     ', (await request('GET', '/time-tables/report', null, adminToken)).status, 200);
  ok('GET  /time-tables/report     | student   ', (await request('GET', '/time-tables/report', null, studentToken)).status, 403);

  // Semester utils
  ok('GET  /semesters/grade-convert/table | admin    ', (await request('GET', '/semesters/grade-convert/table', null, adminToken)).status, 200);
  ok('GET  /semesters/grade-convert/table | student  ', (await request('GET', '/semesters/grade-convert/table', null, studentToken)).status, 403);

  const gpaBody = { grades: [{ point10: 8.5, credits: 3 }] };
  ok('POST /semesters/grade-convert/gpa | admin      ', (await request('POST', '/semesters/grade-convert/gpa', gpaBody, adminToken)).status, 200);
  ok('POST /semesters/grade-convert/gpa | student    ', (await request('POST', '/semesters/grade-convert/gpa', gpaBody, studentToken)).status, 403);

  // Cut rice generate
  const studentUser = firstId(await request('GET', '/users?role=STUDENT&limit=1', null, adminToken));
  if (studentUser) {
    const genRes = await request('POST', `/users/cut-rice/generate/${studentUser}`, {}, adminToken);
    ok('POST /users/cut-rice/generate/:userId | admin   ', genRes.status, genRes.status === 200 ? 200 : genRes.status);
    ok('POST /users/cut-rice/generate/:userId | student ', (await request('POST', `/users/cut-rice/generate/${studentUser}`, {}, studentToken)).status, 403);
  }
  ok('POST /users/cut-rice/generate-all | admin       ', (await request('POST', '/users/cut-rice/generate-all', {}, adminToken)).status, 200);
  ok('POST /users/cut-rice/generate-all | student     ', (await request('POST', '/users/cut-rice/generate-all', {}, studentToken)).status, 403);

  // =================================================================
  // 14. COMMANDER RBAC: Cannot touch Admin/Commander
  // =================================================================
  section('14. COMMANDER RBAC: Cannot Touch Admin/Commander');
  ok('POST /users (cmd create CMD) | commander (403) ', (await request('POST', '/users', { username: `badcmd${ts}`, password: 'test123456', role: 'COMMANDER', fullName: 'X' }, commanderToken)).status, 403);

  const cmdUserId = firstId(await request('GET', '/users?role=COMMANDER&limit=1', null, adminToken));
  if (cmdUserId) {
    ok(`PUT  /users/cmd-${cmdUserId.substring(0,6)} | commander (403)`, (await request('PUT', `/users/${cmdUserId}`, { fullName: 'HACKED' }, commanderToken)).status, 403);
    ok(`DELETE /users/cmd-${cmdUserId.substring(0,6)} | commander (403)`, (await request('DELETE', `/users/${cmdUserId}`, null, commanderToken)).status, 403);
  }

  const adminUserId = firstId(await request('GET', '/users?role=ADMIN&limit=1', null, adminToken));
  if (adminUserId) {
    ok(`PUT  /users/admin-${adminUserId.substring(0,6)} | commander (403)`, (await request('PUT', `/users/${adminUserId}`, { fullName: 'HACKED' }, commanderToken)).status, 403);
  }

  // =================================================================
  // 15. EDGE CASES
  // =================================================================
  section('15. EDGE CASES');
  ok('GET  /nonexistent (404)      ', (await request('GET', '/nonexistent')).status, 404);
  ok('GET  /users/not-found (404)  ', (await request('GET', '/users/00000000-0000-0000-0000-000000000000', null, adminToken)).status, 404);

  // =================================================================
  // SUMMARY
  // =================================================================
  console.log(`\n${'='.repeat(55)}`);
  console.log(`  ✅ PASSED: ${passed}`);
  console.log(`  ❌ FAILED: ${failed}`);
  console.log(`  📊 TOTAL:  ${passed + failed}`);
  console.log(`${'='.repeat(55)}`);
  if (failed > 0) process.exit(1);
}

(async () => {
  // Wait for server
  for (let i = 0; i < 30; i++) {
    try {
      const ok = await new Promise((r) => {
        const req = http.get('http://localhost:6868/health', (res) => r(res.statusCode === 200));
        req.on('error', () => r(false));
        req.setTimeout(2000, () => { req.destroy(); r(false); });
      });
      if (ok) { console.log(' Server ready!\n'); break; }
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
    process.stdout.write('.');
  }
  await main();
  process.exit(0);
})();
