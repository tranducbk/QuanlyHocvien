const fs = require('fs');
const path = require('path');
const swaggerSpec = require('../config/swagger');

const routeMounts = {
  'auth.route.js': '/auth',
  'file.route.js': '/files',
  'gradeRequest.route.js': '',
  'adminDashboard.route.js': '/admins',
  'studentDashboard.route.js': '/students',
  'commanderReport.route.js': '/commanders',
  'user.route.js': '/users',
  'university.route.js': '/universities',
  'organization.route.js': '/organizations',
  'educationLevel.route.js': '/education-levels',
  'class.route.js': '/classes',
  'yearlyResult.route.js': '/yearly-results',
  'semesterResult.route.js': '/semester-results',
  'subjectResult.route.js': '/subject-results',
  'semester.route.js': '/semesters',
  'timeTable.route.js': '/time-tables',
  'tuitionFee.route.js': '/tuition-fees',
  'achievement.route.js': '/achievements',
  'achievementProfile.route.js': '/achievement-profiles',
  'yearlyAchievement.route.js': '/yearly-achievements',
  'scientificInitiative.route.js': '/scientific-initiatives',
  'scientificTopic.route.js': '/scientific-topics',
  'cutRice.route.js': '/cut-rice',
  'commanderDutySchedule.route.js': '/commander-duty-schedules',
  'notification.route.js': '/notifications',
};

const normalizePath = (mountPath, routePath) => {
  let fullPath = `${mountPath}${routePath === '/' ? '' : routePath}`.replace(/\/+/g, '/');
  if (!fullPath.startsWith('/')) fullPath = `/${fullPath}`;
  return fullPath.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
};

const readRouteMethods = () => {
  const routeDir = path.join(__dirname, '..', 'routes');
  const routeMethods = [];

  for (const [fileName, mountPath] of Object.entries(routeMounts)) {
    const filePath = path.join(routeDir, fileName);
    const source = fs.readFileSync(filePath, 'utf8');
    const routePattern = /router\.(get|post|put|delete)\('([^']+)'/g;

    for (const match of source.matchAll(routePattern)) {
      const method = match[1].toUpperCase();
      const routePath = normalizePath(mountPath, match[2]);
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
