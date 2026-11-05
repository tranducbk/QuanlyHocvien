const db = require('../../models');
const { BadRequestError, NotFoundError } = require('../../utils/apiError');
const { ensureDefaultSemesters } = require('./defaultSemesters');

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

const listAvailableStudents = async (id, search, commander) => {
  await getOwnedClass(id, commander);
  const term = (search || '').trim();
  const where = {
    trainingClassId: null,
    [db.Sequelize.Op.or]: [
      { commanderId: commander.id },
      { commanderId: null },
    ],
  };
  if (term) {
    where[db.Sequelize.Op.and] = [
      {
        [db.Sequelize.Op.or]: [
          { fullName: { [db.Sequelize.Op.iLike]: `%${term}%` } },
          { code: { [db.Sequelize.Op.iLike]: `%${term}%` } },
        ],
      },
    ];
  }
  const profiles = await db.profile.findAll({
    where,
    attributes: ['id', 'code', 'fullName'],
    include: [{
      model: db.user,
      attributes: [],
      where: { role: 'STUDENT', isActive: true, trainingSystemId: commander.trainingSystemId },
      required: true,
    }],
    order: [['fullName', 'ASC']],
    limit: 50,
  });
  return profiles;
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
  if (!student?.Profile || (student.Profile.commanderId && student.Profile.commanderId !== commander.id)) {
    throw new BadRequestError('Học viên phải thuộc cùng Hệ và do Chỉ huy này quản lý');
  }
  const profile = await db.profile.findByPk(student.Profile.id, { transaction, lock: transaction.LOCK.UPDATE });
  if (profile.trainingClassId && profile.trainingClassId !== id) {
    throw new BadRequestError('Học viên đã thuộc lớp khác; chưa hỗ trợ chuyển lớp');
  }
  if (!profile.trainingClassId) {
    await profile.update({ trainingClassId: id, commanderId: commander.id }, { transaction });
  }
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
  const trainingClass = await getOwnedClass(id, commander);
  const system = await db.trainingSystem.findByPk(trainingClass.trainingSystemId);
  if (system?.code !== 'HE_5' || data.code !== 3) {
    throw new BadRequestError('HK1 và HK2 được tạo tự động theo niên khóa; chỉ Hệ 5 được thêm kỳ hè');
  }
  const schoolYear = data.schoolYear.trim();
  const year = Number(schoolYear.slice(0, 4));
  if (schoolYear !== `${year}-${year + 1}` || trainingClass.startYear == null || trainingClass.endYear == null
      || year < trainingClass.startYear || year >= trainingClass.endYear) {
    throw new BadRequestError('Năm học phải nằm trong niên khóa của lớp');
  }
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
  const catalog = data.catalogSubjectId
    ? await require('./subjectCatalog.service').get(data.catalogSubjectId, commander) : null;
  const subjectCode = catalog ? catalog.subjectCode : data.subjectCode.trim();
  const subjectName = catalog ? catalog.subjectName : data.subjectName.trim();
  const duplicate = catalog
    ? { [db.Sequelize.Op.or]: [{ subjectCode }, { catalogSubjectId: catalog.id }] } : { subjectCode };
  if (await db.trainingClassSubject.findOne({ where: { trainingClassId: classId, semesterId, ...duplicate } })) {
    throw new BadRequestError('Mã môn đã tồn tại trong học kỳ của lớp');
  }
  try {
    return await db.trainingClassSubject.create({
      trainingClassId: classId, semesterId, subjectCode, subjectName,
      credits: catalog ? catalog.credits : data.credits,
      ...(catalog ? { catalogSubjectId: catalog.id } : {}),
    });
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

const slugifyClassCode = (name) => name
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .toUpperCase()
  .replace(/[^A-Z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const buildClassCode = async (trainingSystemId, name) => {
  const base = slugifyClassCode(name).slice(0, 44) || 'LOP';
  let code = base;
  let attempt = 2;
  while (await db.trainingClass.findOne({ where: { trainingSystemId, code } })) {
    const suffix = `-${attempt}`;
    code = `${base.slice(0, 50 - suffix.length)}${suffix}`;
    attempt += 1;
  }
  return code;
};

const create = async (data, commander) => {
  const system = await db.trainingSystem.findByPk(commander.trainingSystemId);
  if (!system || !system.isActive) throw new BadRequestError('Hệ đào tạo không tồn tại hoặc đã ngừng hoạt động');
  const isHe5 = system.code === 'HE_5';
  if (!isHe5 && data.educationProviderId) throw new BadRequestError('Cơ sở đào tạo ngoài quân đội chỉ dùng cho Hệ 5');
  if (!isHe5 && (!data.trainingProgramId || !data.curriculumVersionId)) {
    throw new BadRequestError('Lớp của Hệ này cần chương trình và khóa');
  }
  if (isHe5 && data.curriculumVersionId && !data.trainingProgramId) {
    throw new BadRequestError('Phải chọn chương trình trước khi chọn khóa');
  }
  let startYear = data.startYear ?? null;
  let endYear = data.endYear ?? null;
  if (data.educationProviderId) {
    const provider = await db.university.findByPk(data.educationProviderId);
    if (!provider || provider.status !== 'ACTIVE') throw new BadRequestError('Cơ sở đào tạo không tồn tại hoặc đã ngừng hoạt động');
  }
  if (data.trainingProgramId) {
    const program = await db.trainingProgram.findByPk(data.trainingProgramId);
    if (!program || !program.isActive || program.trainingSystemId !== system.id) {
      throw new BadRequestError('Chương trình không thuộc Hệ đã chọn hoặc đã ngừng hoạt động');
    }
    if (data.curriculumVersionId) {
      const version = await db.curriculumVersion.findByPk(data.curriculumVersionId);
      if (!version || version.trainingProgramId !== program.id) {
        throw new BadRequestError('Khóa không thuộc chương trình đã chọn');
      }
      if (!isHe5) {
        if (version.effectiveFrom) {
          const fromYear = Number(String(version.effectiveFrom).slice(0, 4));
          if (!Number.isNaN(fromYear)) startYear = fromYear;
        }
        if (version.effectiveTo) {
          const toYear = Number(String(version.effectiveTo).slice(0, 4));
          if (!Number.isNaN(toYear)) endYear = toYear;
        }
      }
    }
  }
  if (startYear != null && endYear != null && endYear <= startYear) {
    throw new BadRequestError('Năm kết thúc phải sau năm bắt đầu');
  }
  const code = data.code?.trim() || await buildClassCode(system.id, data.name.trim());
  if (!isHe5 && (!Number.isInteger(startYear) || !Number.isInteger(endYear))) {
    throw new BadRequestError('Cần bổ sung năm bắt đầu và năm kết thúc của khóa để tạo học kỳ tự động');
  }
  if (await db.trainingClass.findOne({ where: { trainingSystemId: system.id, code } })) {
    throw new BadRequestError('Mã lớp đã tồn tại trong Hệ này');
  }
  try {
    return await db.sequelize.transaction(async (transaction) => {
      const trainingClass = await db.trainingClass.create({
        trainingSystemId: system.id,
        code,
        name: data.name.trim(),
        commanderId: commander.id,
        educationProviderId: isHe5 ? data.educationProviderId || null : null,
        trainingProgramId: data.trainingProgramId || null,
        curriculumVersionId: data.curriculumVersionId || null,
        startYear,
        endYear,
        status: 'ACTIVE',
      }, { transaction });
      await ensureDefaultSemesters(trainingClass, transaction);
      return trainingClass;
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') throw new BadRequestError('Mã lớp đã tồn tại trong Hệ này');
    throw error;
  }
};

const updateClass = async (id, data, commander) => {
  const trainingClass = await getOwnedClass(id, commander);
  const system = await db.trainingSystem.findByPk(trainingClass.trainingSystemId);
  if (!system || !system.isActive) throw new BadRequestError('Hệ đào tạo không tồn tại hoặc đã ngừng hoạt động');

  const merged = { ...trainingClass.get({ plain: true }), ...data };
  const isHe5 = system.code === 'HE_5';
  if (!isHe5 && merged.educationProviderId) throw new BadRequestError('Cơ sở đào tạo ngoài quân đội chỉ dùng cho Hệ 5');
  if (!isHe5 && (!merged.trainingProgramId || !merged.curriculumVersionId)) {
    throw new BadRequestError('Lớp của Hệ này cần chương trình và khóa');
  }
  if (isHe5 && merged.curriculumVersionId && !merged.trainingProgramId) {
    throw new BadRequestError('Phải chọn chương trình trước khi chọn khóa');
  }
  let startYear = merged.startYear ?? null;
  let endYear = merged.endYear ?? null;
  if (merged.educationProviderId) {
    const provider = await db.university.findByPk(merged.educationProviderId);
    if (!provider || provider.status !== 'ACTIVE') throw new BadRequestError('Cơ sở đào tạo không tồn tại hoặc đã ngừng hoạt động');
  }
  if (merged.trainingProgramId) {
    const program = await db.trainingProgram.findByPk(merged.trainingProgramId);
    if (!program || !program.isActive || program.trainingSystemId !== system.id) {
      throw new BadRequestError('Chương trình không thuộc Hệ đã chọn hoặc đã ngừng hoạt động');
    }
    if (merged.curriculumVersionId) {
      const version = await db.curriculumVersion.findByPk(merged.curriculumVersionId);
      if (!version || version.trainingProgramId !== program.id) {
        throw new BadRequestError('Khóa không thuộc chương trình đã chọn');
      }
      if (!isHe5) {
        if (version.effectiveFrom) {
          const fromYear = Number(String(version.effectiveFrom).slice(0, 4));
          if (!Number.isNaN(fromYear)) startYear = fromYear;
        }
        if (version.effectiveTo) {
          const toYear = Number(String(version.effectiveTo).slice(0, 4));
          if (!Number.isNaN(toYear)) endYear = toYear;
        }
      }
    }
  }
  if (startYear != null && endYear != null && endYear <= startYear) {
    throw new BadRequestError('Năm kết thúc phải sau năm bắt đầu');
  }
  const code = merged.code.trim();
  if (code !== trainingClass.code && await db.trainingClass.findOne({
    where: { trainingSystemId: system.id, code, id: { [db.Sequelize.Op.ne]: id } },
  })) {
    throw new BadRequestError('Mã lớp đã tồn tại trong Hệ này');
  }
  return db.sequelize.transaction(async (transaction) => {
    const updated = await trainingClass.update({
      code,
      name: merged.name.trim(),
      educationProviderId: isHe5 ? merged.educationProviderId || null : null,
      trainingProgramId: merged.trainingProgramId || null,
      curriculumVersionId: merged.curriculumVersionId || null,
      startYear,
      endYear,
    }, { transaction });
    await ensureDefaultSemesters(updated, transaction);
    return updated;
  });
};

const updateClassStatus = async (id, status, commander) => {
  const trainingClass = await getOwnedClass(id, commander);
  return trainingClass.update({ status });
};

module.exports = { listMine, listStudents, listAvailableStudents, assignStudent, listSemesters, createSemester, listSubjects, createSubject, getTimeTable, saveTimeTable, create, updateClass, updateClassStatus };
