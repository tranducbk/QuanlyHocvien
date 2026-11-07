const router = require('express').Router();
const controller = require('../../controllers/training-program/he5Placement.controller');
const { authMiddleware, requireRole, requireTrainingSystem } = require('../../middlewares/auth.middleware');

/**
 * @swagger
 * /he5-placement/years:
 *   get:
 *     tags: [Training Classes]
 *     summary: Chỉ huy Hệ 5 xem các năm xếp lớp dùng chung toàn Hệ
 *     responses:
 *       200: { description: Danh sách năm học }
 *   post:
 *     tags: [Training Classes]
 *     summary: Chuẩn bị năm kế tiếp từ danh sách đã chốt, bỏ học viên tốt nghiệp
 *     responses:
 *       201: { description: Bản nháp năm học mới }
 * /he5-placement/years/{yearId}:
 *   get:
 *     tags: [Training Classes]
 *     summary: Xem 6 lớp và danh sách học viên theo năm học
 *     parameters:
 *       - in: path
 *         name: yearId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Danh sách phân lớp và tốt nghiệp của năm học }
 * /he5-placement/years/{yearId}/available:
 *   get:
 *     tags: [Training Classes]
 *     summary: Tìm học viên Hệ 5 chưa xếp lớp, chưa tốt nghiệp, cho bản nháp
 *     responses:
 *       200: { description: Danh sách học viên khả dụng }
 * /he5-placement/years/{yearId}/assign:
 *   post:
 *     tags: [Training Classes]
 *     summary: Xếp hoặc chuyển nhiều học viên Hệ 5 trong bản nháp, có lịch sử
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [profileIds, trainingClassId]
 *             properties:
 *               profileIds: { type: array, minItems: 1, maxItems: 500, uniqueItems: true, items: { type: string, format: uuid } }
 *               trainingClassId: { type: string, format: uuid }
 *     responses:
 *       200: { description: Đã xếp lớp }
 * /he5-placement/years/{yearId}/graduate:
 *   post:
 *     tags: [Training Classes]
 *     summary: Đánh dấu tốt nghiệp trong bản nháp, giữ nguyên dữ liệu năm trước
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [profileIds]
 *             properties:
 *               profileIds: { type: array, minItems: 1, maxItems: 500, uniqueItems: true, items: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Đã đánh dấu tốt nghiệp }
 * /he5-placement/years/{yearId}/close:
 *   post:
 *     tags: [Training Classes]
 *     summary: Chốt danh sách cho toàn Hệ 5, khóa thêm và chuyển lớp trong năm
 *     responses:
 *       200: { description: Đã chốt danh sách }
 * /he5-placement/years/{yearId}/history:
 *   get:
 *     tags: [Training Classes]
 *     summary: Xem lịch sử xếp lớp, người và thời gian thực hiện
 *     responses:
 *       200: { description: Lịch sử chỉ đọc }
 */
router.use(authMiddleware, requireRole('COMMANDER'), requireTrainingSystem('HE_5'));
router.get('/years', controller.listYears);
router.post('/years', controller.prepareNext);
router.get('/years/:yearId', controller.detail);
router.get('/years/:yearId/available', controller.available);
router.post('/years/:yearId/assign', controller.assign);
router.post('/years/:yearId/graduate', controller.graduate);
router.post('/years/:yearId/close', controller.close);
router.get('/years/:yearId/history', controller.history);
module.exports = router;
