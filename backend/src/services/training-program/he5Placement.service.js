const db = require('../../models');
const { BadRequestError, ForbiddenError, NotFoundError } = require('../../utils/apiError');
const { Op } = db.Sequelize;

const authorize = async (user) => {
  if (user?.role !== 'COMMANDER' || user.trainingSystemCode !== 'HE_5' || !user.trainingSystemId) {
    throw new ForbiddenError('Chỉ Chỉ huy Hệ 5 được quản lý xếp lớp');
  }
  const system = await db.trainingSystem.findOne({ where: { id: user.trainingSystemId, code: 'HE_5', isActive: true } });
  if (!system) throw new ForbiddenError('Hệ 5 không còn hoạt động');
  return system;
};

const getYear = async (id, user, transaction, editable = false) => {
  const year = await db.he5PlacementYear.findOne({
    where: { id, trainingSystemId: user.trainingSystemId }, transaction,
    ...(transaction ? { lock: transaction.LOCK.UPDATE } : {}),
  });
  if (!year) throw new NotFoundError('Không tìm thấy năm xếp lớp Hệ 5');
  if (editable && year.status !== 'DRAFT') throw new BadRequestError('Danh sách đã chốt; không được thêm, chuyển lớp hoặc đánh dấu tốt nghiệp');
  return year;
};

const stateOf = (row) => row ? { trainingClassId: row.trainingClassId, status: row.status } : null;
const event = (yearId, action, user, transaction, profileId = null, before = null, after = null) =>
  db.he5PlacementEvent.create({ yearId, action, changedBy: user.id, profileId, before, after }, { transaction });

const listYears = async (user) => {
  await authorize(user);
  return db.he5PlacementYear.findAll({ where: { trainingSystemId: user.trainingSystemId }, order: [['startYear', 'DESC']] });
};

const detail = async (id, user) => {
  await authorize(user);
  const year = await getYear(id, user);
  const [classes, placements, previous] = await Promise.all([
    db.trainingClass.findAll({ where: { trainingSystemId: user.trainingSystemId }, order: [['code', 'ASC']], attributes: ['id', 'name', 'code'] }),
    db.he5Placement.findAll({ where: { yearId: id }, order: [['fullName', 'ASC'], ['studentCode', 'ASC']] }),
    year.previousYearId ? db.he5Placement.findAll({ where: { yearId: year.previousYearId } }) : [],
  ]);
  const previousByProfile = new Map(previous.map(row => [row.profileId, row]));
  const activeProfileIds = placements.filter(row => row.status === 'ACTIVE').map(row => row.profileId);
  const profiles = activeProfileIds.length ? await db.profile.findAll({
    where: { id: { [Op.in]: activeProfileIds } }, attributes: ['id'],
    include: [
      { model: db.user, attributes: [], required: true, where: { role: 'STUDENT', trainingSystemId: user.trainingSystemId } },
      { model: db.university, attributes: ['universityCode'], required: false },
    ],
  }) : [];
  const schoolByProfile = new Map(profiles.map(profile => {
    const plain = profile.get({ plain: true });
    return [plain.id, plain.University?.universityCode];
  }));
  return {
    year,
    classes: classes.map(row => {
      const members = placements.filter(p => p.trainingClassId === row.id && p.status === 'ACTIVE');
      return {
        ...row.get({ plain: true }), studentCount: members.length,
        universityCodes: [...new Set(members.map(member => schoolByProfile.get(member.profileId)).filter(Boolean))].sort(),
      };
    }),
    placements: placements.map(row => ({ ...row.get({ plain: true }), previousClassId: previousByProfile.get(row.profileId)?.trainingClassId ?? null })),
  };
};

const available = async (id, user) => {
  await authorize(user);
  const year = await getYear(id, user);
  if (year.status !== 'DRAFT') return [];
  const years = await db.he5PlacementYear.findAll({ where: { trainingSystemId: user.trainingSystemId, startYear: { [Op.lte]: year.startYear } }, attributes: ['id'] });
  const [assigned, graduated] = await Promise.all([
    db.he5Placement.findAll({ where: { yearId: id }, attributes: ['profileId'] }),
    db.he5Placement.findAll({ where: { yearId: { [Op.in]: years.map(row => row.id) }, status: 'GRADUATED' }, attributes: ['profileId'] }),
  ]);
  const excluded = [...new Set([...assigned, ...graduated].map(row => row.profileId))];
  return db.profile.findAll({
    where: excluded.length ? { id: { [Op.notIn]: excluded } } : {},
    attributes: ['id', 'code', 'fullName'],
    include: [{ model: db.user, attributes: [], required: true, where: { role: 'STUDENT', trainingSystemId: user.trainingSystemId, isActive: true } }],
    order: [['fullName', 'ASC'], ['code', 'ASC']],
  });
};

const prepareNext = async (user) => {
  const system = await authorize(user);
  return db.sequelize.transaction(async transaction => {
    await db.trainingSystem.findByPk(system.id, { transaction, lock: transaction.LOCK.UPDATE });
    const previous = await db.he5PlacementYear.findOne({ where: { trainingSystemId: system.id }, order: [['startYear', 'DESC']], transaction, lock: transaction.LOCK.UPDATE });
    if (!previous) throw new BadRequestError('Cần chạy migration khởi tạo năm 2026-2027 trước');
    if (previous.status !== 'CLOSED') throw new BadRequestError('Cần chốt danh sách năm hiện tại trước khi chuẩn bị năm mới');
    const startYear = previous.startYear + 1;
    if (startYear > 2199) throw new BadRequestError('Năm học vượt giới hạn hỗ trợ');
    const year = await db.he5PlacementYear.create({ trainingSystemId: system.id, schoolYear: `${startYear}-${startYear + 1}`, startYear, previousYearId: previous.id }, { transaction });
    const rows = await db.he5Placement.findAll({ where: { yearId: previous.id, status: 'ACTIVE' }, transaction });
    if (rows.length) await db.he5Placement.bulkCreate(rows.map(row => ({
      yearId: year.id, profileId: row.profileId, trainingClassId: row.trainingClassId,
      studentCode: row.studentCode, fullName: row.fullName, status: 'ACTIVE',
    })), { transaction });
    await event(year.id, 'PREPARE', user, transaction, null, { previousYearId: previous.id }, { copiedStudents: rows.length, schoolYear: year.schoolYear });
    return year;
  });
};

const assign = async (id, { profileIds, trainingClassId }, user) => {
  await authorize(user);
  return db.sequelize.transaction(async transaction => {
    const year = await getYear(id, user, transaction, true);
    const target = await db.trainingClass.findOne({ where: { id: trainingClassId, trainingSystemId: user.trainingSystemId }, transaction });
    if (!target) throw new BadRequestError('Lớp đích phải thuộc 6 lớp cố định Hệ 5');
    const profiles = await db.profile.findAll({ where: { id: { [Op.in]: profileIds } }, transaction, lock: transaction.LOCK.UPDATE });
    if (profiles.length !== profileIds.length) throw new BadRequestError('Danh sách học viên không hợp lệ');
    const users = await db.user.findAll({ where: { profileId: { [Op.in]: profileIds }, role: 'STUDENT', trainingSystemId: user.trainingSystemId }, transaction, lock: transaction.LOCK.UPDATE });
    if (users.length !== profileIds.length) throw new BadRequestError('Chỉ được xếp học viên Hệ 5');
    const usersByProfile = new Map(users.map(row => [row.profileId, row]));
    const earlierYears = await db.he5PlacementYear.findAll({ where: { trainingSystemId: user.trainingSystemId, startYear: { [Op.lt]: year.startYear } }, attributes: ['id'], transaction });
    if (earlierYears.length && await db.he5Placement.count({ where: { yearId: { [Op.in]: earlierYears.map(row => row.id) }, profileId: { [Op.in]: profileIds }, status: 'GRADUATED' }, transaction })) {
      throw new BadRequestError('Không được xếp lại học viên đã tốt nghiệp ở năm trước');
    }
    for (const profile of profiles) {
      const row = await db.he5Placement.findOne({ where: { yearId: id, profileId: profile.id }, transaction });
      if (!row && !usersByProfile.get(profile.id).isActive) throw new BadRequestError('Học viên mới cần tài khoản đang hoạt động');
      const before = stateOf(row);
      if (row?.status === 'ACTIVE' && row.trainingClassId === trainingClassId) continue;
      const after = { trainingClassId, status: 'ACTIVE' };
      if (row) await row.update(after, { transaction });
      else await db.he5Placement.create({ yearId: id, profileId: profile.id, studentCode: profile.code, fullName: profile.fullName, ...after }, { transaction });
      await event(id, row ? (before.status === 'GRADUATED' ? 'UNDO_GRADUATION' : 'MOVE') : 'ASSIGN', user, transaction, profile.id, before, after);
    }
    return { updated: profiles.length };
  });
};

const graduate = async (id, profileIds, user) => {
  await authorize(user);
  return db.sequelize.transaction(async transaction => {
    await getYear(id, user, transaction, true);
    const rows = await db.he5Placement.findAll({ where: { yearId: id, profileId: { [Op.in]: profileIds } }, transaction });
    if (rows.length !== profileIds.length) throw new BadRequestError('Chỉ đánh dấu tốt nghiệp học viên có trong danh sách chuẩn bị');
    for (const row of rows) {
      if (row.status === 'GRADUATED') continue;
      const before = stateOf(row);
      await row.update({ status: 'GRADUATED' }, { transaction });
      await event(id, 'GRADUATE', user, transaction, row.profileId, before, stateOf(row));
    }
    return { updated: rows.length };
  });
};

const close = async (id, user) => {
  await authorize(user);
  return db.sequelize.transaction(async transaction => {
    const year = await getYear(id, user, transaction, true);
    const placements = await db.he5Placement.findAll({ where: { yearId: id }, transaction });
    // Keep the existing current-class pointer in sync only when the roster becomes official.
    for (const row of placements) {
      const account = await db.user.findOne({ where: { profileId: row.profileId, trainingSystemId: user.trainingSystemId, role: 'STUDENT' }, transaction, lock: transaction.LOCK.UPDATE });
      if (!account) throw new BadRequestError('Có học viên không còn thuộc Hệ 5; cần kiểm tra trước khi chốt');
      await db.profile.update({ trainingClassId: row.status === 'ACTIVE' ? row.trainingClassId : null }, { where: { id: row.profileId }, transaction });
    }
    await event(id, 'CLOSE', user, transaction, null, { status: 'DRAFT' }, { status: 'CLOSED', activeStudents: placements.filter(row => row.status === 'ACTIVE').length, graduatedStudents: placements.filter(row => row.status === 'GRADUATED').length });
    return year.update({ status: 'CLOSED', closedBy: user.id, closedAt: new Date() }, { transaction });
  });
};

const history = async (id, user) => {
  await authorize(user);
  await getYear(id, user);
  const rows = await db.he5PlacementEvent.findAll({ where: { yearId: id }, order: [['createdAt', 'DESC'], ['id', 'ASC']] });
  const ids = [...new Set(rows.map(row => row.changedBy).filter(Boolean))];
  const editors = ids.length ? await db.user.findAll({ where: { id: { [Op.in]: ids } }, attributes: ['id', 'username'], paranoid: false }) : [];
  const byId = new Map(editors.map(row => [row.id, row.username]));
  return rows.map(row => ({ ...row.get({ plain: true }), editorName: byId.get(row.changedBy) ?? 'Khởi tạo hệ thống' }));
};

module.exports = { listYears, detail, available, prepareNext, assign, graduate, close, history };
