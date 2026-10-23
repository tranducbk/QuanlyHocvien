const router = require('express').Router();
const controller = require('../controllers/trainingProgram.controller');
const { authMiddleware, requireAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /training-programs/systems:
 *   get:
 *     tags: [Training Programs]
 *     summary: Danh mục hệ đào tạo cho Admin
 *     responses:
 *       200:
 *         description: Danh sách hệ đào tạo
 * /training-programs:
 *   get:
 *     tags: [Training Programs]
 *     summary: Danh sách chương trình và phiên bản cho Admin
 *     responses:
 *       200:
 *         description: Danh sách chương trình
 *   post:
 *     tags: [Training Programs]
 *     summary: Admin tạo chương trình đào tạo
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
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Đã tạo chương trình
 * /training-programs/{id}/versions:
 *   post:
 *     tags: [Training Programs]
 *     summary: Admin thêm phiên bản DRAFT
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
 *             required: [versionCode, name]
 *             properties:
 *               versionCode: { type: string }
 *               name: { type: string }
 *               effectiveFrom: { type: string, format: date }
 *               effectiveTo: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Đã tạo phiên bản
 */

router.use(authMiddleware, requireAdmin);
router.get('/systems', controller.listSystems);
router.get('/', controller.listPrograms);
router.post('/', controller.createProgram);
router.post('/:id/versions', controller.createVersion);

module.exports = router;
