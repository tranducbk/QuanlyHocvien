const db = require('../models');
const { BadRequestError, NotFoundError } = require('../utils/apiError');

const listSystems = () => db.trainingSystem.findAll({
  attributes: ['id', 'code', 'name', 'isActive'],
  order: [['code', 'ASC']],
});

const listPrograms = async () => {
  const [systems, programs, versions] = await Promise.all([
    listSystems(),
    db.trainingProgram.findAll({ order: [['name', 'ASC']] }),
    db.curriculumVersion.findAll({ order: [['createdAt', 'ASC']] }),
  ]);
  const systemById = new Map(systems.map((system) => [system.id, system]));
  const versionsByProgram = new Map();
  for (const version of versions) {
    const existing = versionsByProgram.get(version.trainingProgramId) || [];
    existing.push(version);
    versionsByProgram.set(version.trainingProgramId, existing);
  }
  return programs.map((program) => ({
    ...program.get({ plain: true }),
    trainingSystem: systemById.get(program.trainingSystemId) || null,
    versions: versionsByProgram.get(program.id) || [],
  }));
};

const createProgram = async (data) => {
  const system = await db.trainingSystem.findByPk(data.trainingSystemId);
  if (!system || !system.isActive) throw new BadRequestError('Hệ đào tạo không tồn tại hoặc đã ngừng hoạt động');
  const code = data.code.trim();
  if (await db.trainingProgram.findOne({ where: { trainingSystemId: system.id, code } })) {
    throw new BadRequestError('Mã chương trình đã tồn tại trong Hệ này');
  }
  try {
    return await db.trainingProgram.create({
      trainingSystemId: system.id,
      code,
      name: data.name.trim(),
      description: data.description?.trim() || null,
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') throw new BadRequestError('Mã chương trình đã tồn tại trong Hệ này');
    throw error;
  }
};

const createVersion = async (programId, data) => {
  const program = await db.trainingProgram.findByPk(programId);
  if (!program) throw new NotFoundError('Không tìm thấy chương trình đào tạo');
  const versionCode = data.versionCode.trim();
  if (data.effectiveFrom && data.effectiveTo && data.effectiveTo < data.effectiveFrom) {
    throw new BadRequestError('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu');
  }
  if (await db.curriculumVersion.findOne({ where: { trainingProgramId: programId, versionCode } })) {
    throw new BadRequestError('Mã phiên bản đã tồn tại trong chương trình này');
  }
  try {
    return await db.curriculumVersion.create({
      trainingProgramId: programId,
      versionCode,
      name: data.name.trim(),
      effectiveFrom: data.effectiveFrom || null,
      effectiveTo: data.effectiveTo || null,
      status: 'DRAFT',
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') throw new BadRequestError('Mã phiên bản đã tồn tại trong chương trình này');
    throw error;
  }
};

module.exports = { listSystems, listPrograms, createProgram, createVersion };
