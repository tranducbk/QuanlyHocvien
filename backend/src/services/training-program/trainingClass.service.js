const db = require('../../models');
const { BadRequestError, NotFoundError } = require('../../utils/apiError');

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

const list = async (where) => {
  const [classes, systems, programs, versions, commanders, providers] = await Promise.all([
    db.trainingClass.findAll({ where, order: [['createdAt', 'DESC']] }),
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

const listMine = (user) => list({ commanderId: user.id, trainingSystemId: user.trainingSystemId });

const getOwnedClass = async (id, commander) => {
  const trainingClass = await db.trainingClass.findOne({
    where: { id, trainingSystemId: commander.trainingSystemId, commanderId: commander.id },
  });
  if (!trainingClass) throw new NotFoundError('Không tìm thấy lớp được giao trong Hệ của bạn');
  return trainingClass;
};

const listStudents = async (id, commander) => {
  await getOwnedClass(id, commander);
  const profiles = await db.profile.findAll({
    where: { trainingClassId: id },
    attributes: ['id', 'code', 'fullName', 'trainingClassId'],
    include: [{ model: db.user, attributes: ['id', 'trainingSystemId', 'role'] }],
    order: [['fullName', 'ASC']],
  });
  return profiles
    .filter((profile) => profile.User?.role === 'STUDENT' && profile.User.trainingSystemId === commander.trainingSystemId)
    .map((profile) => ({ id: profile.id, userId: profile.User.id, code: profile.code, fullName: profile.fullName }));
};

const assignStudent = async (id, studentCode, commander) => db.sequelize.transaction(async (transaction) => {
  const trainingClass = await db.trainingClass.findOne({
    where: { id, trainingSystemId: commander.trainingSystemId, commanderId: commander.id },
    transaction,
  });
  if (!trainingClass) throw new NotFoundError('Không tìm thấy lớp được giao trong Hệ của bạn');
  const student = await db.user.findOne({
    where: { role: 'STUDENT', trainingSystemId: commander.trainingSystemId, isActive: true },
    include: [{ model: db.profile, where: { code: studentCode }, required: true }],
    transaction,
  });
  if (!student?.Profile || student.Profile.commanderId !== commander.id) {
    throw new BadRequestError('Học viên phải thuộc cùng Hệ và do Chỉ huy này quản lý');
  }
  const profile = await db.profile.findByPk(student.Profile.id, { transaction, lock: transaction.LOCK.UPDATE });
  if (profile.trainingClassId && profile.trainingClassId !== id) {
    throw new BadRequestError('Học viên đã thuộc lớp khác; chưa hỗ trợ chuyển lớp');
  }
  if (!profile.trainingClassId) await profile.update({ trainingClassId: id }, { transaction });
  return { id: profile.id, code: profile.code, fullName: profile.fullName, trainingClassId: id };
});

const listSemesters = async (id, commander) => {
  await getOwnedClass(id, commander);
  return db.trainingClassSemester.findAll({
    where: { trainingClassId: id },
    order: [['schoolYear', 'DESC'], ['code', 'ASC']],
  });
};

const createSemester = async (id, data, commander) => {
  await getOwnedClass(id, commander);
  const schoolYear = data.schoolYear.trim();
  if (await db.trainingClassSemester.findOne({ where: { trainingClassId: id, schoolYear, code: data.code } })) {
    throw new BadRequestError('Học kỳ đã tồn tại trong lớp');
  }
  try {
    return await db.trainingClassSemester.create({ trainingClassId: id, schoolYear, code: data.code });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') throw new BadRequestError('Học kỳ đã tồn tại trong lớp');
    throw error;
  }
};

const getOwnedSemester = async (classId, semesterId, commander) => {
  await getOwnedClass(classId, commander);
  const semester = await db.trainingClassSemester.findOne({ where: { id: semesterId, trainingClassId: classId } });
  if (!semester) throw new NotFoundError('Không tìm thấy học kỳ trong lớp được giao');
  return semester;
};

const listSubjects = async (classId, semesterId, commander) => {
  await getOwnedSemester(classId, semesterId, commander);
  return db.trainingClassSubject.findAll({
    where: { trainingClassId: classId, semesterId },
    order: [['subjectCode', 'ASC']],
  });
};

const createSubject = async (classId, semesterId, data, commander) => {
  await getOwnedSemester(classId, semesterId, commander);
  const subjectCode = data.subjectCode.trim();
  const subjectName = data.subjectName.trim();
  if (await db.trainingClassSubject.findOne({ where: { trainingClassId: classId, semesterId, subjectCode } })) {
    throw new BadRequestError('Mã môn đã tồn tại trong học kỳ của lớp');
  }
  try {
    return await db.trainingClassSubject.create({ trainingClassId: classId, semesterId, subjectCode, subjectName, credits: data.credits });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') throw new BadRequestError('Mã môn đã tồn tại trong học kỳ của lớp');
    throw error;
  }
};

const getTimeTable = async (classId, semesterId, commander) => {
  await getOwnedSemester(classId, semesterId, commander);
  const record = await db.trainingClassTimeTable.findOne({ where: { trainingClassId: classId, semesterId } });
  return record || { trainingClassId: classId, semesterId, schedules: [] };
};

const saveTimeTable = async (classId, semesterId, schedules, commander) => {
  await getOwnedSemester(classId, semesterId, commander);
  const normalized = schedules.map((item) => ({
    subjectId: item.subjectId,
    day: Number(item.day),
    startTime: item.startTime,
    endTime: item.endTime,
    room: typeof item.room === 'string' ? item.room.trim() || null : null,
    week: [...new Set((item.week || []).map(Number))].sort((a, b) => a - b),
  }));
  const subjectIds = [...new Set(normalized.map((item) => item.subjectId))];
  const subjects = await db.trainingClassSubject.findAll({
    where: { id: { [db.Sequelize.Op.in]: subjectIds }, trainingClassId: classId, semesterId },
    attributes: ['id'],
  });
  if (subjects.length !== subjectIds.length) throw new BadRequestError('Môn học không thuộc học kỳ của lớp này');
  for (let left = 0; left < normalized.length; left += 1) {
    const first = normalized[left];
    if (first.startTime >= first.endTime) throw new BadRequestError('Giờ bắt đầu phải trước giờ kết thúc');
    for (let right = left + 1; right < normalized.length; right += 1) {
      const second = normalized[right];
      const sameWeek = !first.week?.length || !second.week?.length || first.week.some((week) => second.week.includes(week));
      const overlap = first.startTime < second.endTime && second.startTime < first.endTime;
      if (first.day === second.day && sameWeek && overlap) throw new BadRequestError('Trùng lịch học trong cùng ngày và tuần');
    }
  }
  const where = { trainingClassId: classId, semesterId };
  return db.sequelize.transaction(async (transaction) => {
    const record = await db.trainingClassTimeTable.findOne({ where, transaction, lock: transaction.LOCK.UPDATE });
    return record
      ? record.update({ schedules: normalized }, { transaction })
      : db.trainingClassTimeTable.create({ ...where, schedules: normalized }, { transaction });
  });
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
  if (trainingClass.commanderId !== (commanderId || null) && await db.profile.count({ where: { trainingClassId: id } })) {
    throw new BadRequestError('Lớp đã có học viên; chưa hỗ trợ đổi Chỉ huy của lớp');
  }
  await trainingClass.update({ commanderId: commanderId || null });
  return trainingClass;
};

module.exports = { listOptions, list, listMine, listStudents, assignStudent, listSemesters, createSemester, listSubjects, createSubject, getTimeTable, saveTimeTable, create, assignCommander };
