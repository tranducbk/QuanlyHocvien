const db = require('../../models');
const { BadRequestError, NotFoundError } = require('../../utils/apiError');

const listSystems = () => db.trainingSystem.findAll({
  attributes: ['id', 'code', 'name', 'isActive'],
  order: [['code', 'ASC']],
});

const listPrograms = async (requester, query = {}) => {
  const where = { trainingSystemId: requester.trainingSystemId };
  if (query.universityId) where.universityId = query.universityId;
  const [systems, programs, versions, universities, organizations, educationLevels] = await Promise.all([
    listSystems(),
    db.trainingProgram.findAll({ where, order: [['name', 'ASC']] }),
    db.curriculumVersion.findAll({ order: [['createdAt', 'ASC']] }),
    db.university.findAll({ attributes: ['id', 'universityCode', 'universityName', 'status'] }),
    db.organization.findAll({ attributes: ['id', 'organizationName', 'universityId', 'status'] }),
    db.educationLevel.findAll({ attributes: ['id', 'levelName', 'organizationId'] }),
  ]);
  const systemById = new Map(systems.map((system) => [system.id, system]));
  const universityById = new Map(universities.map((university) => [university.id, university.get({ plain: true })]));
  const organizationById = new Map(organizations.map((organization) => [organization.id, organization.get({ plain: true })]));
  const educationLevelById = new Map(educationLevels.map((level) => [level.id, level.get({ plain: true })]));
  const versionsByProgram = new Map();
  for (const version of versions) {
    const existing = versionsByProgram.get(version.trainingProgramId) || [];
    existing.push(version);
    versionsByProgram.set(version.trainingProgramId, existing);
  }
  return programs.map((program) => ({
    ...program.get({ plain: true }),
    trainingSystem: systemById.get(program.trainingSystemId) || null,
    university: universityById.get(program.universityId) || null,
    organization: organizationById.get(program.organizationId) || null,
    educationLevel: educationLevelById.get(program.educationLevelId) || null,
    versions: versionsByProgram.get(program.id) || [],
  }));
};

const resolvePlacement = async (data, system) => {
  const universityId = data.universityId || null;
  const organizationId = data.organizationId || null;
  const educationLevelId = data.educationLevelId || null;
  if (system.code !== 'HE_5') {
    if (universityId || organizationId || educationLevelId) {
      throw new BadRequestError('Chỉ Hệ 5 mới gắn chương trình với trường, ngành và trình độ');
    }
    return { universityId: null, organizationId: null, educationLevelId: null, displayName: null };
  }
  if (!universityId || !organizationId || !educationLevelId) {
    throw new BadRequestError('Chương trình Hệ 5 phải chọn trường, ngành và trình độ');
  }
  const university = await db.university.findByPk(universityId);
  if (!university || university.status !== 'ACTIVE') {
    throw new BadRequestError('Trường không tồn tại hoặc đã ngừng hoạt động');
  }
  const organization = await db.organization.findOne({ where: { id: organizationId, universityId } });
  if (!organization || organization.status !== 'ACTIVE') {
    throw new BadRequestError('Ngành không thuộc trường đã chọn hoặc đã ngừng hoạt động');
  }
  const educationLevel = await db.educationLevel.findOne({ where: { id: educationLevelId, organizationId } });
  if (!educationLevel) {
    throw new BadRequestError('Trình độ không thuộc ngành đã chọn');
  }
  return {
    universityId,
    organizationId,
    educationLevelId,
    displayName: `${university.universityName} · ${organization.organizationName} · ${educationLevel.levelName}`.slice(0, 255),
  };
};

const slugifyCode = (name) => name
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .toUpperCase()
  .replace(/[^A-Z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const buildProgramCode = async (trainingSystemId, name) => {
  const base = slugifyCode(name).slice(0, 44) || 'CT';
  let code = base;
  let attempt = 2;
  while (await db.trainingProgram.findOne({ where: { trainingSystemId, code } })) {
    const suffix = `-${attempt}`;
    code = `${base.slice(0, 50 - suffix.length)}${suffix}`;
    attempt += 1;
  }
  return code;
};

const buildVersionCode = async (trainingProgramId, name) => {
  const base = slugifyCode(name).slice(0, 44) || 'KHOA';
  let versionCode = base;
  let attempt = 2;
  while (await db.curriculumVersion.findOne({ where: { trainingProgramId, versionCode } })) {
    const suffix = `-${attempt}`;
    versionCode = `${base.slice(0, 50 - suffix.length)}${suffix}`;
    attempt += 1;
  }
  return versionCode;
};

const createProgram = async (data, requester) => {
  const system = await db.trainingSystem.findByPk(requester.trainingSystemId);
  if (!system || !system.isActive) throw new BadRequestError('Hệ đào tạo không tồn tại hoặc đã ngừng hoạt động');
  const isHe5 = system.code === 'HE_5';
  const { displayName, ...placement } = await resolvePlacement(data, system);
  let code;
  let name;
  let description = null;
  if (isHe5) {
    code = `HE5-${placement.educationLevelId}`;
    name = displayName;
    if (await db.trainingProgram.findOne({ where: { trainingSystemId: system.id, ...placement } })) {
      throw new BadRequestError('Trường, ngành và trình độ này đã có chương trình');
    }
  } else {
    name = data.name?.trim();
    if (!name) throw new BadRequestError('Tên chương trình là bắt buộc');
    code = data.code?.trim() || await buildProgramCode(system.id, name);
    description = data.description?.trim() || null;
    if (data.code?.trim() && await db.trainingProgram.findOne({ where: { trainingSystemId: system.id, code } })) {
      throw new BadRequestError('Mã chương trình đã tồn tại trong Hệ này');
    }
  }
  try {
    return await db.trainingProgram.create({
      trainingSystemId: system.id,
      ...placement,
      code,
      name,
      description,
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new BadRequestError(isHe5
        ? 'Trường, ngành và trình độ này đã có chương trình'
        : 'Mã chương trình đã tồn tại trong Hệ này');
    }
    throw error;
  }
};

const getOwnedProgram = async (programId, requester) => {
  const program = await db.trainingProgram.findOne({
    where: { id: programId, trainingSystemId: requester.trainingSystemId },
  });
  if (!program) throw new NotFoundError('Không tìm thấy chương trình đào tạo');
  return program;
};

const updateProgram = async (programId, data, requester) => {
  const program = await getOwnedProgram(programId, requester);
  const system = await db.trainingSystem.findByPk(program.trainingSystemId);
  if (!system || !system.isActive) throw new BadRequestError('Hệ đào tạo không tồn tại hoặc đã ngừng hoạt động');
  const isHe5 = system.code === 'HE_5';
  const merged = { ...program.get({ plain: true }), ...data };
  const { displayName, ...placement } = await resolvePlacement(merged, system);
  if (isHe5) {
    if (await db.trainingProgram.findOne({
      where: {
        trainingSystemId: requester.trainingSystemId,
        ...placement,
        id: { [db.Sequelize.Op.ne]: programId },
      },
    })) {
      throw new BadRequestError('Trường, ngành và trình độ này đã có chương trình');
    }
    try {
      return await program.update({
        ...placement,
        code: `HE5-${placement.educationLevelId}`,
        name: displayName,
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new BadRequestError('Trường, ngành và trình độ này đã có chương trình');
      }
      throw error;
    }
  }
  const code = data.code?.trim();
  if (code && await db.trainingProgram.findOne({
    where: {
      trainingSystemId: requester.trainingSystemId,
      code,
      id: { [db.Sequelize.Op.ne]: programId },
    },
  })) {
    throw new BadRequestError('Mã chương trình đã tồn tại trong Hệ này');
  }
  return program.update({
    ...(code ? { code } : {}),
    ...(data.name !== undefined ? { name: data.name.trim() } : {}),
    ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
    ...placement,
  });
};

const updateProgramStatus = async (programId, isActive, requester) => {
  const program = await getOwnedProgram(programId, requester);
  return program.update({ isActive });
};

const createVersion = async (programId, data, requester) => {
  const program = await getOwnedProgram(programId, requester);
  const system = await db.trainingSystem.findByPk(program.trainingSystemId);
  if (system?.code === 'HE_5') throw new BadRequestError('Chương trình Hệ 5 không sử dụng khóa');
  const name = data.name?.trim();
  if (!name) throw new BadRequestError('Tên khóa là bắt buộc');
  const versionCode = data.versionCode?.trim() || await buildVersionCode(programId, name);
  if (data.effectiveFrom && data.effectiveTo && data.effectiveTo < data.effectiveFrom) {
    throw new BadRequestError('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu');
  }
  if (data.versionCode?.trim() && await db.curriculumVersion.findOne({ where: { trainingProgramId: programId, versionCode } })) {
    throw new BadRequestError('Mã khóa đã tồn tại trong chương trình này');
  }
  try {
    return await db.curriculumVersion.create({
      trainingProgramId: programId,
      versionCode,
      name,
      effectiveFrom: data.effectiveFrom || null,
      effectiveTo: data.effectiveTo || null,
      status: 'DRAFT',
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') throw new BadRequestError('Mã khóa đã tồn tại trong chương trình này');
    throw error;
  }
};

module.exports = {
  listPrograms,
  createProgram,
  updateProgram,
  updateProgramStatus,
  createVersion,
};
