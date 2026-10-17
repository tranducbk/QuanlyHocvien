const http = require('http');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:6868/api';
const ZERO_ID = '00000000-0000-0000-0000-000000000000';

let passed = 0;
let failed = 0;
let skipped = 0;

const request = (method, path, body = null, token = null) => new Promise((resolve, reject) => {
  const url = new URL(`${BASE_URL}${path}`);
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const req = http.request({
    hostname: url.hostname,
    port: url.port,
    path: `${url.pathname}${url.search}`,
    method,
    headers,
  }, (res) => {
    let raw = '';
    res.on('data', chunk => { raw += chunk; });
    res.on('end', () => {
      try {
        resolve({ status: res.statusCode, body: JSON.parse(raw) });
      } catch {
        resolve({ status: res.statusCode, body: raw });
      }
    });
  });

  req.setTimeout(5000, () => req.destroy(new Error('API timeout')));
  req.on('error', reject);
  if (body) req.write(JSON.stringify(body));
  req.end();
});

const check = (label, actual, expected) => {
  const ok = actual === expected;
  if (ok) passed += 1;
  else failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: ${actual} (expected ${expected})`);
};

const skip = (label) => {
  skipped += 1;
  console.log(`SKIP ${label}`);
};

const rowsOf = response => {
  const data = response?.body?.data;
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.rows) ? data.rows : [];
};

const login = async (username, password) => {
  const response = await request('POST', '/auth/login', { username, password });
  check(`login ${username}`, response.status, 200);
  return response.body?.data || {};
};

const assertRoleMatrix = async (path, tokens) => {
  check(`GET ${path} admin`, (await request('GET', path, null, tokens.admin)).status, 403);
  check(`GET ${path} commander`, (await request('GET', path, null, tokens.commander)).status, 200);
  check(`GET ${path} student`, (await request('GET', path, null, tokens.student)).status, 403);
};

// Chỉ huy cùng hệ được xem mọi học viên của hệ; chỉ huy khác hệ bị chặn (route hệ ngoài trả 403)
const assertCrossCommanderDetail = async (resource, firstCommanderToken, secondCommanderToken, sameSystem) => {
  const list = await request('GET', `/${resource}?limit=10`, null, firstCommanderToken);
  const row = rowsOf(list)[0];
  if (!row?.id) {
    skip(`${resource}: no record in first commander's scope`);
    return;
  }

  check(
    `GET /${resource}/:id from another ${sameSystem ? 'same-system' : 'other-system'} commander`,
    (await request('GET', `/${resource}/${row.id}`, null, secondCommanderToken)).status,
    sameSystem ? 200 : 403
  );
};

async function main() {
  console.log(`TASK-004 read-only API checks against ${BASE_URL}`);

  const admin = await login(
    process.env.TEST_ADMIN_USERNAME || 'admin',
    process.env.TEST_ADMIN_PASSWORD || 'admin123'
  );
  const commander = await login(
    process.env.TEST_COMMANDER_USERNAME || 'chihuy01',
    process.env.TEST_COMMANDER_PASSWORD || 'chihuy123'
  );
  const secondCommander = await login(
    process.env.TEST_SECOND_COMMANDER_USERNAME || 'chihuy02',
    process.env.TEST_SECOND_COMMANDER_PASSWORD || 'chihuy123'
  );
  const student = await login(
    process.env.TEST_STUDENT_USERNAME || 'hv001',
    process.env.TEST_STUDENT_PASSWORD || 'hocvien123'
  );

  const tokens = {
    admin: admin.accessToken,
    commander: commander.accessToken,
    secondCommander: secondCommander.accessToken,
    student: student.accessToken,
  };
  const sameSystem = commander.user?.systemType === secondCommander.user?.systemType;

  if (Object.values(tokens).some(token => !token)) {
    throw new Error('Không lấy đủ token để kiểm tra ma trận quyền');
  }

  for (const path of ['/yearly-results', '/semester-results', '/subject-results']) {
    await assertRoleMatrix(path, tokens);
  }
  await assertRoleMatrix('/yearly-results/export', tokens);

  check(
    'GET commander grade requests as admin',
    (await request('GET', '/commanders/grade-requests', null, tokens.admin)).status,
    403
  );
  check(
    'GET commander grade requests as commander',
    (await request('GET', '/commanders/grade-requests', null, tokens.commander)).status,
    200
  );
  check(
    'GET commander grade requests as student',
    (await request('GET', '/commanders/grade-requests', null, tokens.student)).status,
    403
  );

  for (const resource of ['semester-results', 'subject-results']) {
    check(
      `PUT /${resource}/:id is not exposed`,
      (await request('PUT', `/${resource}/${ZERO_ID}`, {}, tokens.commander)).status,
      404
    );
    check(
      `DELETE /${resource}/:id is not exposed`,
      (await request('DELETE', `/${resource}/${ZERO_ID}`, null, tokens.commander)).status,
      404
    );
  }

  check(
    'approve grade request as admin',
    (await request('POST', `/commanders/grade-requests/${ZERO_ID}/approve`, { reviewNote: 'RBAC check' }, tokens.admin)).status,
    403
  );
  check(
    'approve grade request as student',
    (await request('POST', `/commanders/grade-requests/${ZERO_ID}/approve`, { reviewNote: 'RBAC check' }, tokens.student)).status,
    403
  );

  for (const resource of ['yearly-results', 'semester-results', 'subject-results']) {
    await assertCrossCommanderDetail(resource, tokens.commander, tokens.secondCommander, sameSystem);
  }

  const studentId = student.user?.id;
  if (studentId) {
    for (const resource of ['yearly-results', 'semester-results']) {
      const response = await request(
        'GET',
        `/${resource}?userId=${encodeURIComponent(studentId)}&limit=10`,
        null,
        tokens.secondCommander
      );
      check(`GET ${resource} cross-commander status`, response.status, sameSystem ? 200 : 403);
    }
  } else {
    skip('cross-commander userId filters: student id unavailable');
  }

  console.log(`Summary: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  if (failed > 0) process.exitCode = 1;
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
