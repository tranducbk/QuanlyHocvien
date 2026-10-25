const fs = require('fs');
const path = require('path');
const swaggerSpec = require('../config/swagger');

const routeMounts = {
  'authentication/auth.route.js': '/auth',
  'file.route.js': '/files',
  'academic-results/gradeRequest.route.js': '',
  'reports/adminDashboard.route.js': '/admins',
  'reports/studentDashboard.route.js': '/students',
  'reports/commanderReport.route.js': '/commanders',
  'accounts/user.route.js': '/users',
  'training-program/trainingProgram.route.js': '/training-programs',
  'training-program/trainingClass.route.js': '/training-classes',
  'training-program/trainingClassAcademic.route.js': '/training-class-academic',
  'training-program/university.route.js': '/universities',
  'training-program/organization.route.js': '/organizations',
  'training-program/educationLevel.route.js': '/education-levels',
  'training-program/class.route.js': '/classes',
  'military-legacy/militaryClass.route.js': '/military/classes',
  'military-legacy/militaryAcademic.route.js': '/military/academic',
  'military-legacy/militaryRecords.route.js': '/military/records',
  'academic-results/yearlyResult.route.js': '/yearly-results',
  'academic-results/semesterResult.route.js': '/semester-results',
  'academic-results/subjectResult.route.js': '/subject-results',
  'academic-years/semester.route.js': '/semesters',
  'schedules/timeTable.route.js': '/time-tables',
  'tuition-and-meals/tuitionFee.route.js': '/tuition-fees',
  'achievements/achievement.route.js': '/achievements',
  'achievements/achievementProfile.route.js': '/achievement-profiles',
  'achievements/yearlyAchievement.route.js': '/yearly-achievements',
  'scientific-research/scientificInitiative.route.js': '/scientific-initiatives',
  'scientific-research/scientificTopic.route.js': '/scientific-topics',
  'tuition-and-meals/cutRice.route.js': '/cut-rice',
  'schedules/commanderDutySchedule.route.js': '/commander-duty-schedules',
  'notification/notification.route.js': '/notifications',
};

const normalizePath = (mountPath, routePath) => {
  let fullPath = `${mountPath}${routePath === '/' ? '' : routePath}`.replace(/\/+/g, '/');
  if (!fullPath.startsWith('/')) fullPath = `/${fullPath}`;
  return fullPath.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
};

const readRouteMethods = () => {
  const routeDir = path.join(__dirname, '..', 'routes');
  const routeMethods = [];

  for (const [relativePath, mountPath] of Object.entries(routeMounts)) {
    const filePath = path.join(routeDir, relativePath);
    const source = fs.readFileSync(filePath, 'utf8');
    const routePattern = /router\.(get|post|put|delete)\(\s*(['"])([^'"]+)\2/g;

    for (const match of source.matchAll(routePattern)) {
      const method = match[1].toUpperCase();
      const routePath = normalizePath(mountPath, match[3]);
      routeMethods.push(`${method} ${routePath}`);
    }
  }

  return routeMethods;
};

const readSwaggerMethods = () => {
  const methods = [];

  for (const [routePath, operations] of Object.entries(swaggerSpec.paths || {})) {
    for (const method of Object.keys(operations)) {
      methods.push(`${method.toUpperCase()} ${routePath}`);
    }
  }

  return methods;
};

const main = () => {
  const routeMethods = readRouteMethods();
  const swaggerMethods = readSwaggerMethods();
  const routeSet = new Set(routeMethods);
  const swaggerSet = new Set(swaggerMethods);

  const missingInSwagger = routeMethods.filter((item) => !swaggerSet.has(item)).sort();
  const extraInSwagger = swaggerMethods.filter((item) => !routeSet.has(item)).sort();

  if (missingInSwagger.length || extraInSwagger.length) {
    if (missingInSwagger.length) {
      console.error('Missing in Swagger:');
      console.error(missingInSwagger.join('\n'));
    }

    if (extraInSwagger.length) {
      console.error('Extra in Swagger:');
      console.error(extraInSwagger.join('\n'));
    }

    process.exit(1);
  }

  console.log(`Swagger coverage OK: ${routeMethods.length} route methods documented.`);
};

main();
