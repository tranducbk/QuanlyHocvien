const router = require('express').Router();
const controller = require('../../controllers/training-program/trainingClassAcademic.controller.js');
const { authMiddleware, requireRole, requireTrainingSystem } = require('../../middlewares/auth.middleware.js');

/**
 * @swagger
 * /training-class-academic/me/subjects:
 *   get:
 *     tags: [Training Class Academic]
 *     summary: Học viên xem môn trong lớp của mình
 *     responses:
 *       200:
 *         description: Danh sách môn học
 * /training-class-academic/me/time-tables:
 *   get:
 *     tags: [Training Class Academic]
 *     summary: Học viên xem lịch học của lớp mình
 *     responses:
 *       200:
 *         description: Lịch học theo học kỳ của lớp
 * /training-class-academic/me/achievements:
 *   get:
 *     tags: [Training Class Academic]
 *     summary: Học viên xem thành tích của bản thân
 *     responses:
 *       200:
 *         description: Danh sách thành tích cá nhân
 * /training-class-academic/me/results:
 *   get:
 *     tags: [Training Class Academic]
 *     summary: Học viên xem điểm chính thức của mình
 *     responses:
 *       200:
 *         description: Danh sách kết quả
 * /training-class-academic/me/grade-proposals:
 *   get:
 *     tags: [Training Class Academic]
 *     summary: Học viên xem đề xuất điểm của mình
 *     responses:
 *       200:
 *         description: Danh sách đề xuất
 *   post:
 *     tags: [Training Class Academic]
 *     summary: Học viên gửi đề xuất điểm cho lần thi chưa có điểm chính thức
 *     responses:
 *       201:
 *         description: Đã gửi đề xuất
 */
router.use(authMiddleware, requireRole('STUDENT'), requireTrainingSystem('HE_1', 'HE_3', 'HE_4', 'HE_7'));
router.get('/me/subjects', controller.listMySubjects);
router.get('/me/time-tables', controller.listMyTimeTables);
router.get('/me/achievements', controller.listMyAchievements);
router.get('/me/results', controller.listMyResults);
router.get('/me/grade-proposals', controller.listMyProposals);
router.post('/me/grade-proposals', controller.createProposal);

module.exports = router;
