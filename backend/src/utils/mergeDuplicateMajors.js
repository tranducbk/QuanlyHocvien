require('dotenv').config();
const { Client } = require('pg');
const config = require('../config/dbConfig');
const key = (name) => name.normalize('NFC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('vi');
const quote = (name) => `"${name.replace(/"/g, '""')}"`;

async function references(client, table) {
  const result = await client.query(`SELECT ns.nspname AS schema, c.relname AS table, a.attname AS column
    FROM pg_constraint fk JOIN pg_class c ON c.oid=fk.conrelid
    JOIN pg_namespace ns ON ns.oid=c.relnamespace
    JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum=fk.conkey[1]
    WHERE fk.contype='f' AND fk.confrelid=$1::regclass
      AND array_length(fk.conkey,1)=1`, [table]);
  return result.rows;
}
async function moveReferences(client, table, source, target) {
  for (const ref of await references(client, table)) {
    await client.query(`UPDATE ${quote(ref.schema)}.${quote(ref.table)} SET ${quote(ref.column)}=$1 WHERE ${quote(ref.column)}=$2`, [target, source]);
  }
}
async function merge(client, apply) {
  const rows = (await client.query('SELECT id, university_id, organization_name FROM organizations ORDER BY created_at, id')).rows;
  const groups = new Map();
  for (const row of rows) {
    const groupKey = `${row.university_id}:${key(row.organization_name)}`;
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(row);
  }
  let merged = 0;
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const target = group[0];
    console.log(JSON.stringify({ name: target.organization_name, universityId: target.university_id, keepId: target.id, mergeIds: group.slice(1).map((row) => row.id) }));
    merged += group.length - 1;
    if (!apply) continue;
    const levels = (await client.query('SELECT id, level_name FROM education_levels WHERE organization_id=ANY($1::uuid[]) ORDER BY created_at,id', [group.map((row) => row.id)])).rows;
    const levelGroups = new Map();
    for (const level of levels) {
      const levelKey = key(level.level_name);
      if (levelGroups.has(levelKey)) {
        await moveReferences(client, 'education_levels', level.id, levelGroups.get(levelKey));
        await client.query('DELETE FROM education_levels WHERE id=$1', [level.id]);
      } else levelGroups.set(levelKey, level.id);
    }
    for (const source of group.slice(1)) {
      await moveReferences(client, 'organizations', source.id, target.id);
      await client.query('DELETE FROM organizations WHERE id=$1', [source.id]);
    }
  }
  console.log('Duplicate majors:', merged);
}
async function main() {
  const mode = process.argv[2];
  if (!['--report', '--dry-run', '--apply'].includes(mode)) throw new Error('Dùng --report, --dry-run hoặc --apply');
  const connection = config.URL ? { connectionString: config.URL } : { host: config.HOST, port: config.port, user: config.USER, password: config.PASSWORD, database: config.DB };
  if (config.ssl) connection.ssl = { rejectUnauthorized: false };
  const client = new Client({ ...connection, connectionTimeoutMillis: 10000 });
  try {
    await client.connect();
    const database = (await client.query('SELECT current_database() AS name')).rows[0].name;
    console.log('Database:', database);
    if (mode === '--apply' && (!process.env.QLHV_EXPECT_DATABASE || database !== process.env.QLHV_EXPECT_DATABASE)) throw new Error('Cần xác nhận đúng QLHV_EXPECT_DATABASE');
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout='5s'");
    if (mode !== '--report') {
      const tables = new Set(['public.organizations', 'public.education_levels']);
      for (const table of ['organizations', 'education_levels']) {
        for (const ref of await references(client, table)) tables.add(`${ref.schema}.${ref.table}`);
      }
      for (const table of [...tables].sort()) await client.query(`LOCK TABLE ${table.split('.').map(quote).join('.')} IN SHARE ROW EXCLUSIVE MODE`);
    }
    await merge(client, mode !== '--report');
    await client.query(mode === '--apply' ? 'COMMIT' : 'ROLLBACK');
    console.log(mode === '--apply' ? 'Đã gộp.' : 'Không lưu thay đổi.');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(error.code || error.message);
    process.exitCode = 1;
  } finally { await client.end(); }
}
main();
