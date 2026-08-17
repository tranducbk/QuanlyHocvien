require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../models');

async function seed() {
  try {
    await db.sequelize.sync();
    console.log('Database synced.');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const [adminUser, created] = await db.user.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN',
        isAdmin: true,
      },
    });
    console.log(created ? 'Admin user created.' : 'Admin user already exists.');

    await db.university.findOrCreate({
      where: { universityCode: 'NEU' },
      defaults: {
        universityCode: 'NEU',
        universityName: 'Đại học Kinh tế Quốc dân',
        status: 'ACTIVE',
      },
    });
    console.log('Sample university seeded.');

    const [schoolYear] = await db.schoolYear.findOrCreate({
      where: { schoolYear: '2024-2025' },
      defaults: { schoolYear: '2024-2025' },
    });

    await db.semester.findOrCreate({
      where: { schoolYearId: schoolYear.id, code: 1 },
      defaults: {
        code: 1,
        schoolYearId: schoolYear.id,
      },
    });
    console.log('Sample semester seeded.');

    console.log('\nSeed completed successfully.');
    console.log('Login: admin / admin123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
