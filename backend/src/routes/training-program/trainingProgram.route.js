const router = require('express').Router();
const controller = require('../../controllers/training-program/trainingProgram.controller.js');
const { authMiddleware, requireRole, requireTrainingSystem } = require('../../middlewares/auth.middleware.js');

/**
 * @swagger
 * /training-programs:
 *   get:
 *     tags: [Training Programs]
 *     summary: Chương trình và khóa trong Hệ của Chỉ huy
 *     parameters:
 *       - in: query
 *         name: universityId
 *         required: false
 *         schema: { type: string, format: uuid }
 *         description: Chỉ áp dụng cho Hệ 5 để lọc chương trình theo trường
 *     responses:
 *       200:
 *         description: Danh sách chương trình
 *   post:
 *     tags: [Training Programs]
 *     summary: Chỉ huy tạo chương trình trong Hệ được giao (Hệ 5 chỉ cần trường, ngành, trình độ)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code: { type: string, description: 'Bắt buộc với Hệ 1/3/4/7, Hệ 5 tự sinh' }
 *               name: { type: string, description: 'Bắt buộc với Hệ 1/3/4/7, Hệ 5 tự sinh từ trường/ngành/trình độ' }
 *               description: { type: string }
 *               universityId: { type: string, format: uuid, nullable: true, description: 'Bắt buộc với Hệ 5' }
 *               organizationId: { type: string, format: uuid, nullable: true, description: 'Bắt buộc với Hệ 5, phải thuộc universityId' }
 *               educationLevelId: { type: string, format: uuid, nullable: true, description: 'Bắt buộc với Hệ 5, phải thuộc organizationId' }
 *     responses:
 *       201:
 *         description: Đã tạo chương trình
 * /training-programs/{id}:
 *   put:
 *     tags: [Training Programs]
 *     summary: Chỉ huy cập nhật chương trình trong Hệ được giao
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
 *             properties:
 *               code: { type: string, description: 'Chỉ dùng cho Hệ 1/3/4/7' }
 *               name: { type: string, description: 'Chỉ dùng cho Hệ 1/3/4/7' }
 *               description: { type: string, nullable: true }
 *               universityId: { type: string, format: uuid, nullable: true, description: 'Bắt buộc với Hệ 5' }
 *               organizationId: { type: string, format: uuid, nullable: true, description: 'Bắt buộc với Hệ 5, phải thuộc universityId' }
 *               educationLevelId: { type: string, format: uuid, nullable: true, description: 'Bắt buộc với Hệ 5, phải thuộc organizationId' }
 *     responses:
 *       200:
 *         description: Đã cập nhật chương trình
 * /training-programs/{id}/status:
 *   patch:
 *     tags: [Training Programs]
 *     summary: Chỉ huy bật hoặc ngừng chương trình trong Hệ được giao
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
 *             required: [isActive]
 *             properties:
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Đã cập nhật trạng thái chương trình
 * /training-programs/{id}/versions:
 *   post:
 *     tags: [Training Programs]
 *     summary: Chỉ huy thêm khóa DRAFT cho chương trình trong Hệ được giao (không áp dụng Hệ 5)
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
 *             required: [name, startYear, endYear]
 *             properties:
 *               versionCode: { type: string, description: 'Tùy chọn, tự sinh nếu để trống' }
 *               name: { type: string }
 *               startYear: { type: integer, minimum: 1945, maximum: 2100, description: 'Bắt buộc, năm bắt đầu khóa học' }
 *               endYear: { type: integer, minimum: 1945, maximum: 2100, description: 'Bắt buộc, năm kết thúc khóa học; phải sau startYear' }
 *     responses:
 *       201:
 *         description: Đã tạo khóa
 * /training-programs/{id}/versions/{versionId}:
 *   put:
 *     tags: [Training Programs]
 *     summary: Chỉ huy cập nhật tên và thời gian khóa trong chương trình thuộc Hệ được giao
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: versionId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, startYear, endYear]
 *             properties:
 *               name: { type: string, maxLength: 255 }
 *               startYear: { type: integer, minimum: 1945, maximum: 2100, description: 'Bắt buộc, năm bắt đầu khóa học' }
 *               endYear: { type: integer, minimum: 1945, maximum: 2100, description: 'Bắt buộc, năm kết thúc khóa học; phải sau startYear' }
 *     responses:
 *       200:
 *         description: Đã cập nhật thông tin khóa
 */

router.use(authMiddleware, requireRole('COMMANDER'), requireTrainingSystem('HE_1', 'HE_3', 'HE_4', 'HE_5', 'HE_7'));
router.get('/', controller.listPrograms);
router.post('/', controller.createProgram);
router.put('/:id', controller.updateProgram);
router.patch('/:id/status', controller.updateProgramStatus);
router.post('/:id/versions', controller.createVersion);
router.put('/:id/versions/:versionId', controller.updateVersion);

module.exports = router;
