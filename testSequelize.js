const db = require('./backend/src/models');
async function test() {
  const unis = await db.university.findAll({
    attributes: {
      include: [
        [
          db.Sequelize.literal(`(
            SELECT CAST(COUNT(id) AS INTEGER)
            FROM profiles
            WHERE profiles.university_id = "University"."id"
          )`),
          'totalStudents'
        ]
      ]
    },
    limit: 1
  });
  console.log(unis.map(u => u.toJSON()));
  process.exit(0);
}
test().catch(e => { console.error(e); process.exit(1); });
