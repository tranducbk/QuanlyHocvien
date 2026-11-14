// Integration test: every fixture, roster change and schema change is rolled back.
require('dotenv').config();
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const db = require('../models');
const service = require('../services/training-program/he5Placement.service');
const { migrate } = require('./migrateHe5Placement');

async function main() {
  const outer = await db.sequelize.transaction();
  const originalQuery = db.sequelize.query.bind(db.sequelize);
  const originalTransaction = db.sequelize.transaction.bind(db.sequelize);
  // Run real service queries on one real PostgreSQL transaction; service transactions use savepoints.
  db.sequelize.query = (sql, options = {}) => originalQuery(sql, { ...options, transaction: options.transaction ?? outer });
  db.sequelize.transaction = (callback) => originalTransaction({ transaction: outer }, callback);
  let checks = 0;
  const check = (condition) => { assert.ok(condition); checks++; };
  const rejectedWrite = async (fn) => {
    await assert.rejects(originalTransaction({ transaction: outer }, fn)); checks++;
  };
  try {
    await migrate(outer.connection);
    await migrate(outer.connection);
    const system = await db.trainingSystem.findOne({ where: { code: 'HE_5' } });
    const otherSystem = await db.trainingSystem.findOne({ where: { code: 'HE_1' } });
    assert.ok(system && otherSystem);
    const makeAccount = async (role, systemId = system.id) => {
      const profile = await db.profile.create({ code: `test-${randomUUID()}`, fullName: 'Integration Test' });
      const account = await db.user.create({ username: `test-${randomUUID()}`, password: '!', role, profileId: profile.id, trainingSystemId: systemId, isActive: true, systemType: systemId === system.id ? 'EXTERNAL' : 'MILITARY' });
      return { profile, account };
    };
    const commanderAccount = await makeAccount('COMMANDER');
    const commander = { id: commanderAccount.account.id, role: 'COMMANDER', trainingSystemId: system.id, trainingSystemCode: 'HE_5' };
    const another = await makeAccount('COMMANDER');
    const secondCommander = { ...commander, id: another.account.id };
    const first = await makeAccount('STUDENT');
    const second = await makeAccount('STUDENT');
    const foreign = await makeAccount('STUDENT', otherSystem.id);
    await first.profile.update({ commanderId: another.account.id });
    const years = await service.listYears(commander);
    const initial = years.find(row => row.schoolYear === '2026-2027');
    if (!initial || initial.status !== 'DRAFT' || years.length !== 1) throw new Error('Test yêu cầu giai đoạn khởi tạo: chỉ năm 2026-2027 ở trạng thái DRAFT');
    const initialCount = await db.he5Placement.count({ where: { yearId: initial.id } });
    const classes = (await service.detail(initial.id, commander)).classes;
    check(classes.length === 6);
    await assert.rejects(service.listYears({ ...commander, role: 'ADMIN' }), error => error.statusCode === 403); checks++;
    await assert.rejects(service.listYears({ ...commander, trainingSystemCode: 'HE_1', trainingSystemId: otherSystem.id }), error => error.statusCode === 403); checks++;
    const candidates = await service.available(initial.id, commander);
    check(candidates.some(row => row.id === first.profile.id));
    check(!candidates.some(row => row.id === foreign.profile.id));
    await assert.rejects(service.assign(initial.id, { profileIds: [foreign.profile.id], trainingClassId: classes[0].id }, commander)); checks++;
    await assert.rejects(service.assign(initial.id, { profileIds: [first.profile.id], trainingClassId: randomUUID() }, commander)); checks++;
    check(await db.he5Placement.count({ where: { yearId: initial.id } }) === initialCount);
    await service.assign(initial.id, { profileIds: [first.profile.id, second.profile.id], trainingClassId: classes[0].id }, commander);
    check((await service.detail(initial.id, secondCommander)).placements.some(row => row.profileId === first.profile.id));
    await service.assign(initial.id, { profileIds: [first.profile.id], trainingClassId: classes[1].id }, secondCommander);
    await service.graduate(initial.id, [second.profile.id], commander);
    await service.assign(initial.id, { profileIds: [second.profile.id], trainingClassId: classes[0].id }, commander);
    const events = await service.history(initial.id, secondCommander);
    check(events.some(row => row.action === 'MOVE' && row.changedBy === secondCommander.id && row.before.trainingClassId === classes[0].id && row.after.trainingClassId === classes[1].id));
    check(events.some(row => row.action === 'UNDO_GRADUATION'));
    await assert.rejects(service.prepareNext(commander)); checks++;
    await service.close(initial.id, commander);
    await first.profile.reload();
    check(first.profile.trainingClassId === classes[1].id);
    await assert.rejects(service.assign(initial.id, { profileIds: [first.profile.id], trainingClassId: classes[0].id }, commander)); checks++;
    await assert.rejects(service.graduate(initial.id, [first.profile.id], commander)); checks++;
    await assert.rejects(service.close(initial.id, commander)); checks++;
    const placement = await db.he5Placement.findOne({ where: { yearId: initial.id, profileId: first.profile.id } });
    await rejectedWrite(transaction => placement.update({ trainingClassId: classes[0].id }, { transaction }));
    await rejectedWrite(transaction => db.he5PlacementEvent.destroy({ where: { yearId: initial.id }, transaction }));
    await rejectedWrite(transaction => db.he5PlacementYear.update({ status: 'DRAFT' }, { where: { id: initial.id }, transaction }));
    await rejectedWrite(transaction => db.trainingClass.update({ name: 'Changed' }, { where: { id: classes[0].id }, transaction }));
    await rejectedWrite(transaction => db.trainingClass.create({ trainingSystemId: system.id, code: 'LOP-7', name: 'Extra' }, { transaction }));
    const next = await service.prepareNext(secondCommander);
    check(next.schoolYear === '2027-2028');
    check((await service.detail(next.id, commander)).placements.some(row => row.profileId === first.profile.id && row.previousClassId === classes[1].id));
    await service.graduate(next.id, [second.profile.id], secondCommander);
    await service.assign(next.id, { profileIds: [first.profile.id], trainingClassId: classes[2].id }, commander);
    check((await service.detail(initial.id, commander)).placements.find(row => row.profileId === first.profile.id).trainingClassId === classes[1].id);
    check((await service.detail(initial.id, commander)).placements.find(row => row.profileId === second.profile.id).status === 'ACTIVE');
    await service.close(next.id, commander);
    await second.profile.reload();
    check(second.profile.trainingClassId === null);
    const third = await service.prepareNext(commander);
    check(!(await service.detail(third.id, commander)).placements.some(row => row.profileId === second.profile.id));
    check(!(await service.available(third.id, commander)).some(row => row.id === second.profile.id));
    await assert.rejects(service.assign(third.id, { profileIds: [second.profile.id], trainingClassId: classes[0].id }, commander)); checks++;
    await assert.rejects(service.prepareNext(secondCommander)); checks++;
    // Exercise actual Express authentication, role/system middleware and Yup validation.
    const express = require('express');
    const { jwtSign } = require('../services/authentication/jwt.service');
    const previousJwtSetting = process.env.SERVER_JWT;
    process.env.SERVER_JWT = 'true';
    const app = express();
    app.use(express.json());
    app.use('/api/he5-placement', require('../routes/training-program/he5Placement.route'));
    app.use((error, req, res, next) => res.status(error.statusCode || 500).json({ success: false }));
    const server = await new Promise(resolve => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)); });
    const request = async (path, account, body) => {
      const headers = { 'Content-Type': 'application/json' };
      if (account) headers.Authorization = `Bearer ${jwtSign({ userId: account.id }, { expiresIn: '1m' })}`;
      return fetch(`http://127.0.0.1:${server.address().port}/api/he5-placement${path}`, { method: body ? 'POST' : 'GET', headers, ...(body ? { body: JSON.stringify(body) } : {}) });
    };
    try {
      check((await request('/years')).status === 401);
      check((await request('/years', first.account)).status === 403);
      const foreignCommander = await makeAccount('COMMANDER', otherSystem.id);
      check((await request('/years', foreignCommander.account)).status === 403);
      check((await request('/years', another.account)).status === 200);
      check((await request('/years/not-a-uuid', another.account)).status === 400);
      check((await request(`/years/${third.id}/assign`, another.account, { profileIds: [first.profile.id, first.profile.id], trainingClassId: classes[0].id })).status === 400);
      check((await request(`/years/${third.id}/assign`, another.account, { profileIds: [foreign.profile.id], trainingClassId: classes[0].id })).status === 400);
      check((await request(`/years/${initial.id}/assign`, another.account, { profileIds: [first.profile.id], trainingClassId: classes[0].id })).status === 400);
    } finally {
      await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
      if (previousJwtSetting === undefined) delete process.env.SERVER_JWT;
      else process.env.SERVER_JWT = previousJwtSetting;
    }
    console.log(`PASS: ${checks} checks: scope, shared rosters, placement, graduation, inheritance, frozen history and database guards`);
  } catch (error) {
    console.error(`Failed after ${checks} successful checks`);
    throw error;
  } finally {
    db.sequelize.query = originalQuery;
    db.sequelize.transaction = originalTransaction;
    await outer.rollback();
    await db.sequelize.close();
    console.log('ROLLBACK: no fixtures, schema or roster changes retained');
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
