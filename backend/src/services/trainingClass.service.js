const db = require('../models');
const { BadRequestError, NotFoundError } = require('../utils/apiError');

const listOptions = async () => {
  const [commanders, providers] = await Promise.all([
    db.user.findAll({
      where: { role: 'COMMANDER', isActive: true },
      attributes: ['id', 'username', 'trainingSystemId'],
      include: [{ model: db.profile, attributes: ['fullName'] }],
      order: [['username', 'ASC']],
    }),
    db.university.findAll({
      where: { status: 'ACTIVE' },
      attributes: ['id', 'universityName'],
      order: [['universityName', 'ASC']],
    }),
  ]);
  return {
    commanders: commanders.map((user) => ({
      id: user.id,
      trainingSystemId: user.trainingSystemId,
      name: user.Profile?.fullName || user.username,
    })),
    providers: providers.map((provider) => ({ id: provider.id, name: provider.universityName })),
  };
};

const list = async () => {
  const [classes, systems, programs, versions, commanders, providers] = await Promise.all([
    db.trainingClass.findAll({ order: [['createdAt', 'DESC']] }),
    db.trainingSystem.findAll({ attributes: ['id', 'code', 'name'] }),
    db.trainingProgram.findAll({ attributes: ['id', 'name'] }),
    db.curriculumVersion.findAll({ attributes: ['id', 'name', 'versionCode'] }),
    db.user.findAll({
      attributes: ['id', 'username'],
      include: [{ model: db.profile, attributes: ['fullName'] }],
    }),
    db.university.findAll({ attributes: ['id', 'universityName'] }),
  ]);
  const systemById = new Map(systems.map((item) => [item.id, item]));
  const programById = new Map(programs.map((item) => [item.id, item]));
  const versionById = new Map(versions.map((item) => [item.id, item]));
  const commanderById = new Map(commanders.map((item) => [item.id, item]));
  const providerById = new Map(providers.map((item) => [item.id, item]));
  return classes.map((item) => ({
    ...item.get({ plain: true }),
    trainingSystemName: systemById.get(item.trainingSystemId)?.name || null,
    trainingSystemCode: systemById.get(item.trainingSystemId)?.code || null,
    trainingProgramName: programById.get(item.trainingProgramId)?.name || null,
    curriculumVersionName: versionById.get(item.curriculumVersionId)?.name || null,
    commanderName: commanderById.get(item.commanderId)?.Profile?.fullName || commanderById.get(item.commanderId)?.username || null,
    educationProviderName: providerById.get(item.educationProviderId)?.universityName || null,
  }));
};

const checkCommander = async (commanderId, trainingSystemId) => {
  if (!commanderId) return;
  const user = await db.user.findByPk(commanderId);
  if (!user || user.role !== 'COMMANDER' || !user.isActive || user.trainingSystemId !== trainingSystemId) {
    throw new BadRequestError('Chỉ huy phải đang hoạt động và thuộc cùng Hệ với lớp');
  }
};

const create = async (data) => {
  const system = await db.trainingSystem.findByPk(data.trainingSystemId);
  if (!system || !system.isActive) throw new BadRequestError('Hệ đào tạo không tồn tại hoặc đã ngừng hoạt động');
  const isHe5 = system.code === 'HE_5';
  if (isHe5 && !data.educationProviderId) throw new BadRequestError('Lớp Hệ 5 cần cơ sở đào tạo');
  if (!isHe5 && data.educationProviderId) throw new BadRequestError('Cơ sở đào tạo ngoài quân đội chỉ dùng cho Hệ 5');
  if (!isHe5 && (!data.trainingProgramId || !data.curriculumVersionId)) {
    throw new BadRequestError('Lớp của Hệ này cần chương trình và phiên bản');
  }
  if (Boolean(data.trainingProgramId) !== Boolean(data.curriculumVersionId)) {
    throw new BadRequestError('Chương trình và phiên bản phải được chọn cùng nhau');
  }
  if (data.startYear != null && data.endYear != null && data.endYear < data.startYear) {
    throw new BadRequestError('Năm kết thúc phải sau hoặc bằng năm bắt đầu');
  }
  if (data.educationProviderId) {
    const provider = await db.university.findByPk(data.educationProviderId);
    if (!provider || provider.status !== 'ACTIVE') throw new BadRequestError('Cơ sở đào tạo không tồn tại hoặc đã ngừng hoạt động');
  }
  if (data.trainingProgramId) {
    const program = await db.trainingProgram.findByPk(data.trainingProgramId);
    if (!program || !program.isActive || program.trainingSystemId !== system.id) {
      throw new BadRequestError('Chương trình không thuộc Hệ đã chọn hoặc đã ngừng hoạt động');
    }
    const version = await db.curriculumVersion.findByPk(data.curriculumVersionId);
    if (!version || version.trainingProgramId !== program.id) {
      throw new BadRequestError('Phiên bản không thuộc chương trình đã chọn');
    }
  }
  await checkCommander(data.commanderId, system.id);
  const code = data.code.trim();
  if (await db.trainingClass.findOne({ where: { trainingSystemId: system.id, code } })) {
    throw new BadRequestError('Mã lớp đã tồn tại trong Hệ này');
  }
  try {
    return await db.trainingClass.create({
      trainingSystemId: system.id,
      code,
      name: data.name.trim(),
      commanderId: data.commanderId || null,
      educationProviderId: data.educationProviderId || null,
      trainingProgramId: data.trainingProgramId || null,
      curriculumVersionId: data.curriculumVersionId || null,
      startYear: data.startYear ?? null,
      endYear: data.endYear ?? null,
      status: 'ACTIVE',
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') throw new BadRequestError('Mã lớp đã tồn tại trong Hệ này');
    throw error;
  }
};

const assignCommander = async (id, commanderId) => {
  const trainingClass = await db.trainingClass.findByPk(id);
  if (!trainingClass) throw new NotFoundError('Không tìm thấy lớp đào tạo');
  await checkCommander(commanderId, trainingClass.trainingSystemId);
  await trainingClass.update({ commanderId: commanderId || null });
  return trainingClass;
};

module.exports = { listOptions, list, create, assignCommander };
