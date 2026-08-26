const assert = require('assert/strict');
const { requireRoleAndSystem } = require('../middlewares/accessScope.middleware');
const { normalizeAndValidateUserAccess } = require('./userAccess');

const runMiddleware = (middleware, user) => new Promise((resolve) => {
  middleware({ user }, {}, (error) => resolve(error || null));
});

async function run() {
  const previousServerJwt = process.env.SERVER_JWT;
  process.env.SERVER_JWT = 'true';

  try {
    const student = normalizeAndValidateUserAccess({ role: 'STUDENT', systemType: 'external' });
    assert.equal(student.systemType, 'EXTERNAL');

    const admin = normalizeAndValidateUserAccess({ role: 'ADMIN' });
    assert.equal(admin.systemType, null);

    assert.throws(
      () => normalizeAndValidateUserAccess({ role: 'STUDENT' }),
      (error) => error.statusCode === 400,
    );
    assert.throws(
      () => normalizeAndValidateUserAccess({ role: 'ADMIN', systemType: 'EXTERNAL' }),
      (error) => error.statusCode === 400,
    );

    const militaryCommanderOnly = requireRoleAndSystem({
      roles: ['COMMANDER'],
      systemTypes: ['MILITARY'],
    });

    assert.equal(await runMiddleware(militaryCommanderOnly, {
      role: 'COMMANDER',
      systemType: 'MILITARY',
    }), null);

    const wrongSystemError = await runMiddleware(militaryCommanderOnly, {
      role: 'COMMANDER',
      systemType: 'EXTERNAL',
    });
    assert.equal(wrongSystemError?.statusCode, 403);

    const wrongRoleError = await runMiddleware(militaryCommanderOnly, {
      role: 'STUDENT',
      systemType: 'MILITARY',
    });
    assert.equal(wrongRoleError?.statusCode, 403);

    const missingUserError = await runMiddleware(militaryCommanderOnly, null);
    assert.equal(missingUserError?.statusCode, 401);

    console.log('Auth scope middleware tests passed.');
  } finally {
    if (previousServerJwt === undefined) delete process.env.SERVER_JWT;
    else process.env.SERVER_JWT = previousServerJwt;
  }
}

run().catch((error) => {
  console.error('Auth scope middleware tests failed:', error);
  process.exitCode = 1;
});
