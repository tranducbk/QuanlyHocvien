const express = require('express');
const router = express.Router();
const { authMiddleware, requireSystemType } = require('../middlewares/auth.middleware');

const mountExternal = (path, route) => {
  const scopedRouter = express.Router();
  scopedRouter.use(authMiddleware, requireSystemType('EXTERNAL'), route);
  router.use(path, scopedRouter);
};

router.use('/auth', require('./auth.route'));
router.use('/files', require('./file.route'));
router.use('/', require('./gradeRequest.route'));
router.use('/admins', require('./adminDashboard.route'));
mountExternal('/students', require('./studentDashboard.route'));
mountExternal('/commanders', require('./commanderReport.route'));
router.use('/users', require('./user.route'));
mountExternal('/universities', require('./university.route'));
mountExternal('/organizations', require('./organization.route'));
mountExternal('/education-levels', require('./educationLevel.route'));
mountExternal('/classes', require('./class.route'));
router.use('/military/classes', require('./militaryClass.route'));
router.use('/military/academic', require('./militaryAcademic.route'));
router.use('/military/records', require('./militaryRecords.route'));
mountExternal('/yearly-results', require('./yearlyResult.route'));
mountExternal('/semester-results', require('./semesterResult.route'));
mountExternal('/subject-results', require('./subjectResult.route'));
mountExternal('/semesters', require('./semester.route'));
mountExternal('/time-tables', require('./timeTable.route'));
mountExternal('/tuition-fees', require('./tuitionFee.route'));
mountExternal('/achievements', require('./achievement.route'));
mountExternal('/achievement-profiles', require('./achievementProfile.route'));
mountExternal('/yearly-achievements', require('./yearlyAchievement.route'));
mountExternal('/scientific-initiatives', require('./scientificInitiative.route'));
mountExternal('/scientific-topics', require('./scientificTopic.route'));
mountExternal('/cut-rice', require('./cutRice.route'));
mountExternal('/commander-duty-schedules', require('./commanderDutySchedule.route'));
router.use('/notifications', require('./notification.route'));

module.exports = router;
