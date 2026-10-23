const express = require('express');
const router = express.Router();
const { authMiddleware, requireTrainingSystem } = require('../middlewares/auth.middleware');
const { ForbiddenError } = require('../utils/apiError');

const mountExternal = (path, route) => {
  const scopedRouter = express.Router();
  scopedRouter.use(authMiddleware, requireTrainingSystem('HE_5'), route);
  router.use(path, scopedRouter);
};

router.use('/auth', require('./auth.route'));
router.use('/files', require('./file.route'));
router.use('/', require('./gradeRequest.route'));
router.use('/admins', require('./adminDashboard.route'));
mountExternal('/students', require('./studentDashboard.route'));
mountExternal('/commanders', require('./commanderReport.route'));
router.use('/users', require('./user.route'));
router.use('/training-programs', require('./trainingProgram.route'));
mountExternal('/universities', require('./university.route'));
mountExternal('/organizations', require('./organization.route'));
mountExternal('/education-levels', require('./educationLevel.route'));
mountExternal('/classes', require('./class.route'));
// Legacy military tables have no training_system_id; deny them until they can be scoped by cohort.
const rejectUnscopedMilitary = () => { throw new ForbiddenError('Phân hệ quân sự cần hoàn tất phân tách dữ liệu theo hệ'); };
router.use('/military/classes', authMiddleware, rejectUnscopedMilitary, require('./militaryClass.route'));
router.use('/military/academic', authMiddleware, rejectUnscopedMilitary, require('./militaryAcademic.route'));
router.use('/military/records', authMiddleware, rejectUnscopedMilitary, require('./militaryRecords.route'));
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
