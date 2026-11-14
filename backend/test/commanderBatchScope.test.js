const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/models');
const service = require('../src/services/accounts/user.service.js');

const commander = { id: 'commander-1', role: 'COMMANDER', trainingSystemId: 'he-5' };

test('batch profile updates require assigned student in the same system', async () => {
  const originalFindOne = db.profile.findOne;
  const updates = [];
  const profile = { update: async (data) => { updates.push(data); } };
  let lookup;
  db.profile.findOne = async (options) => {
    lookup = options;
    return options.where.code === 'OWN' ? profile : null;
  };

  try {
    const result = await service.updateBatchProfiles([
      { code: 'OWN', fullName: 'Tên mới' },
      { code: 'OTHER', fullName: 'Không được đổi' },
      { code: 'OWN', currentCpa4: 4 },
      { code: 'OWN', commanderId: 'another-commander' },
    ], commander);

    assert.deepEqual(result.map((row) => row.status), ['UPDATED', 'ERROR', 'ERROR', 'ERROR']);
    assert.deepEqual(updates, [{ fullName: 'Tên mới' }]);
    assert.equal(lookup.where.commanderId, commander.id);
    assert.equal(lookup.include[0].required, true);
    assert.deepEqual(lookup.include[0].where, {
      role: 'STUDENT',
      trainingSystemId: commander.trainingSystemId,
    });
    await assert.rejects(
      service.updateBatchProfiles([{ code: 'OWN', fullName: 'Tên khác' }], { role: 'ADMIN' }),
      { statusCode: 403 },
    );
  } finally {
    db.profile.findOne = originalFindOne;
  }
});

test('batch graduation updates only assigned students', async () => {
  const originalFindOne = db.profile.findOne;
  const updates = [];
  db.profile.findOne = async (options) => options.where.code === 'OWN'
    ? { update: async (data) => { updates.push(data); } }
    : null;

  try {
    const result = await service.graduateBatchProfiles({
      students: [
        { code: 'OWN', graduationDate: '2026-10-23' },
        { code: 'OTHER', graduationDate: '2026-10-23' },
      ],
    }, commander);

    assert.equal(result.updated, 1);
    assert.equal(result.errors, 1);
    assert.deepEqual(updates, [{ graduationDate: '2026-10-23' }]);
  } finally {
    db.profile.findOne = originalFindOne;
  }
});
