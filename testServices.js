const db = require('./backend/src/models');
const universityService = require('./backend/src/services/university.service');
const organizationService = require('./backend/src/services/organization.service');

async function test() {
  const unis = await universityService.getAll({});
  console.log("Universities:");
  console.log(unis.rows.slice(0, 1).map(u => u.toJSON()));

  const orgs = await organizationService.getAll({});
  console.log("Organizations:");
  console.log(orgs.rows.slice(0, 1).map(o => o.toJSON()));

  process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });
