const express = require('express');
const router = express.Router();
const { authMiddleware, requireTrainingSystem } = require('../middlewares/auth.middleware.js');
const { ForbiddenError } = require('../utils/apiError');

const mountExternal = (path, route) => {
  const scopedRouter = express.Router();
  scopedRouter.use(authMiddleware, requireTrainingSystem('HE_5'), route);
  router.use(path, scopedRouter);
};

router.use('/auth', require('./authentication/auth.route.js'));
router.use('/files', require('./file.route.js'));
router.use('/', require('./academic-results/gradeRequest.route.js'));
router.use('/admins', require('./reports/adminDashboard.route.js'));
mountExternal('/students', require('./reports/studentDashboard.route.js'));
mountExternal('/commanders', require('./reports/commanderReport.route.js'));
router.use('/users', require('./accounts/user.route.js'));
router.use('/training-programs', require('./training-program/trainingProgram.route.js'));
router.use('/training-classes', require('./training-program/trainingClass.route.js'));
router.use('/training-class-academic', require('./training-program/trainingClassAcademic.route.js'));
mountExternal('/universities', require('./training-program/university.route.js'));
mountExternal('/organizations', require('./training-program/organization.route.js'));
mountExternal('/education-levels', require('./training-program/educationLevel.route.js'));
mountExternal('/classes', require('./training-program/class.route.js'));
// Legacy military tables have no training_system_id; deny them until they can be scoped by cohort.
const rejectUnscopedMilitary = () => { throw new ForbiddenError('Phân hệ quân sự cần hoàn tất phân tách dữ liệu theo hệ'); };
router.use('/military/classes', authMiddleware, rejectUnscopedMilitary, require('./military-legacy/militaryClass.route.js'));
router.use('/military/academic', authMiddleware, rejectUnscopedMilitary, require('./military-legacy/militaryAcademic.route.js'));
router.use('/military/records', authMiddleware, rejectUnscopedMilitary, require('./military-legacy/militaryRecords.route.js'));
mountExternal('/yearly-results', require('./academic-results/yearlyResult.route.js'));
mountExternal('/semester-results', require('./academic-results/semesterResult.route.js'));
mountExternal('/subject-results', require('./academic-results/subjectResult.route.js'));
mountExternal('/semesters', require('./academic-years/semester.route.js'));
mountExternal('/time-tables', require('./schedules/timeTable.route.js'));
mountExternal('/tuition-fees', require('./tuition-and-meals/tuitionFee.route.js'));
mountExternal('/achievements', require('./achievements/achievement.route.js'));
mountExternal('/achievement-profiles', require('./achievements/achievementProfile.route.js'));
mountExternal('/yearly-achievements', require('./achievements/yearlyAchievement.route.js'));
mountExternal('/scientific-initiatives', require('./scientific-research/scientificInitiative.route.js'));
mountExternal('/scientific-topics', require('./scientific-research/scientificTopic.route.js'));
mountExternal('/cut-rice', require('./tuition-and-meals/cutRice.route.js'));
mountExternal('/commander-duty-schedules', require('./schedules/commanderDutySchedule.route.js'));
router.use('/notifications', require('./notification/notification.route.js'));

module.exports = router;
