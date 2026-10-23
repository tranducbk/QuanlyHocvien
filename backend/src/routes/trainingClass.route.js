const router = require('express').Router();
const controller = require('../controllers/trainingClass.controller');
const { authMiddleware, requireAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /training-classes/options:
 *   get:
 *     tags: [Training Classes]
 *     summary: Admin lấy Chỉ huy và cơ sở đào tạo để tạo lớp
 *     responses:
 *       200:
 *         description: Danh sách lựa chọn
 * /training-classes:
 *   get:
 *     tags: [Training Classes]
 *     summary: Admin xem lớp của năm Hệ
 *     responses:
 *       200:
 *         description: Danh sách lớp
 *   post:
 *     tags: [Training Classes]
 *     summary: Admin tạo lớp trong Hệ đã chọn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [trainingSystemId, code, name]
 *             properties:
 *               trainingSystemId: { type: string, format: uuid }
 *               code: { type: string }
 *               name: { type: string }
 *               commanderId: { type: string, format: uuid, nullable: true }
 *               educationProviderId: { type: string, format: uuid, nullable: true }
 *               trainingProgramId: { type: string, format: uuid, nullable: true }
 *               curriculumVersionId: { type: string, format: uuid, nullable: true }
 *               startYear: { type: integer, nullable: true }
 *               endYear: { type: integer, nullable: true }
 *     responses:
 *       201:
 *         description: Đã tạo lớp
 * /training-classes/{id}/commander:
 *   put:
 *     tags: [Training Classes]
 *     summary: Admin phân công Chỉ huy cùng Hệ
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [commanderId]
 *             properties:
 *               commanderId: { type: string, format: uuid, nullable: true }
 *     responses:
 *       200:
 *         description: Đã cập nhật Chỉ huy
 */
router.use(authMiddleware, requireAdmin);
router.get('/options', controller.listOptions);
router.get('/', controller.list);
router.post('/', controller.create);
router.put('/:id/commander', controller.assignCommander);

module.exports = router;
