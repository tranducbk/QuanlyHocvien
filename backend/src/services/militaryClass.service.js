const db = require('../models');
const { BadRequestError, NotFoundError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');

const MilitaryClass = db.militaryClass;
const Profile = db.profile;
const User = db.user;
const Op = db.Sequelize.Op;

const getOwned = async (id, commanderId) => {
  const record = await MilitaryClass.findOne({ where: { id, commanderId } });
  if (!record) throw new NotFoundError('Không tìm thấy lớp quân sự');
  return record;
};

const ensureMilitaryCommander = async (commanderId) => {
  const commander = await User.findOne({
    where: { id: commanderId, role: 'COMMANDER', systemType: 'MILITARY' },
    attributes: ['id'],
  });
  if (!commander) throw new BadRequestError('Chỉ được giao lớp cho Chỉ huy thuộc hệ quân sự');
};

const create = async (data) => {
  if (await MilitaryClass.findOne({ where: { classCode: data.classCode } }))
    throw new BadRequestError('Mã lớp đã tồn tại');
  await ensureMilitaryCommander(data.commanderId);
  return MilitaryClass.create(data);
};

const getAll = async (query, requester) => {
  const where = requester.role === 'COMMANDER' ? { commanderId: requester.id } : {};
  if (query.className) where.className = { [Op.iLike]: `%${query.className}%` };
  const result = await paginateQuery(MilitaryClass, query, {
    where,
    include: [{ model: User, as: 'commander', attributes: ['id', 'username'] }],
  });
  if (requester.role === 'ADMIN') {
    result.rows = result.rows.map((row) => ({
      id: row.id,
      className: row.className,
      classCode: row.classCode,
      commanderId: row.commanderId,
      commander: row.commander,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
    return result;
  }
  const ids = result.rows.map((row) => row.id);
  const counts = await Profile.findAll({
    attributes: [
      'militaryClassId',
      [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'studentCount'],
    ],
    where: { militaryClassId: { [Op.in]: ids } },
    group: ['militaryClassId'],
    raw: true,
  });
  const countByClassId = Object.fromEntries(
    counts.map((row) => [row.militaryClassId, Number(row.studentCount)]),
  );
  result.rows = result.rows.map((row) => ({
    ...row.get({ plain: true }),
    studentCount: countByClassId[row.id] || 0,
  }));
  return result;
};

const getDetail = async (id, requester) => {
  const record =
    requester.role === 'ADMIN'
      ? await MilitaryClass.findByPk(id, {
          include: [{ model: User, as: 'commander', attributes: ['id', 'username'] }],
        })
      : await getOwned(id, requester.id);
  if (!record) throw new NotFoundError('Không tìm thấy lớp quân sự');
  if (requester.role === 'ADMIN') return record;
  const studentCount = await Profile.count({ where: { militaryClassId: id } });
  return { ...record.get({ plain: true }), studentCount };
};

const update = async (id, data) => {
  const record = await MilitaryClass.findByPk(id);
  if (!record) throw new NotFoundError('Không tìm thấy lớp quân sự');
  if (
    data.classCode &&
    data.classCode !== record.classCode &&
    (await MilitaryClass.findOne({ where: { classCode: data.classCode } }))
  )
    throw new BadRequestError('Mã lớp đã tồn tại');
  if (data.commanderId) await ensureMilitaryCommander(data.commanderId);
  const commanderChanged = data.commanderId && data.commanderId !== record.commanderId;
  return db.sequelize.transaction(async (transaction) => {
    await record.update(data, { transaction });
    if (commanderChanged) {
      await Profile.update(
        { commanderId: data.commanderId },
        { where: { militaryClassId: id }, transaction },
      );
    }
    return record;
  });
};

const assignStudents = async (id, userIds, commanderId) => {
  const record = await getOwned(id, commanderId);
  const users = await User.findAll({
    where: {
      id: { [Op.in]: [...new Set(userIds)] },
      role: 'STUDENT',
      systemType: 'MILITARY',
    },
    include: [{ model: Profile }],
  });
  if (users.length !== new Set(userIds).size || users.some((user) => !user.Profile)) {
    throw new BadRequestError('Danh sách chỉ được gồm học viên quân sự có hồ sơ');
  }
  if (users.some((user) => user.Profile.commanderId && user.Profile.commanderId !== commanderId)) {
    throw new BadRequestError('Có học viên do Chỉ huy khác quản lý');
  }
  await db.sequelize.transaction(async (transaction) => {
    for (const user of users) {
      const fromClassId = user.Profile.militaryClassId || null;
      if (fromClassId !== record.id) {
        await db.militaryClassHistory.create(
          {
            profileId: user.Profile.id,
            fromClassId,
            toClassId: record.id,
            changedBy: commanderId,
            reason: fromClassId ? 'TRANSFER' : 'INITIAL_ASSIGNMENT',
          },
          { transaction },
        );
        await user.Profile.update({ militaryClassId: record.id, commanderId }, { transaction });
      } else if (!user.Profile.commanderId) {
        await user.Profile.update({ commanderId }, { transaction });
      }
    }
  });
  return {
    classId: record.id,
    assigned: users.length,
    studentCount: await Profile.count({ where: { militaryClassId: id } }),
  };
};

const assignStudentsByCode = async (id, studentCodes, commanderId) => {
  const normalizedCodes = [
    ...new Set(studentCodes.map((code) => String(code).trim()).filter(Boolean)),
  ];
  const profiles = await Profile.findAll({
    where: { code: { [Op.in]: normalizedCodes } },
    include: [
      {
        model: User,
        where: { role: 'STUDENT', systemType: 'MILITARY' },
        required: true,
      },
    ],
  });
  if (profiles.length !== normalizedCodes.length)
    throw new BadRequestError('Một hoặc nhiều mã không thuộc học viên quân sự');
  return assignStudents(
    id,
    profiles.map((profile) => profile.User.id),
    commanderId,
  );
};

const removeStudent = async (id, userId, commanderId) => {
  await getOwned(id, commanderId);
  const user = await User.findOne({
    where: { id: userId, role: 'STUDENT', systemType: 'MILITARY' },
    include: [{ model: Profile }],
  });
  if (!user?.Profile || user.Profile.militaryClassId !== id)
    throw new NotFoundError('Không tìm thấy học viên trong lớp');
  await db.sequelize.transaction(async (transaction) => {
    await db.militaryClassHistory.create(
      {
        profileId: user.Profile.id,
        fromClassId: id,
        toClassId: null,
        changedBy: commanderId,
        reason: 'REMOVED',
      },
      { transaction },
    );
    await user.Profile.update({ militaryClassId: null }, { transaction });
  });
  return { userId, classId: id };
};

const getStudents = async (id, query, commanderId) => {
  await getOwned(id, commanderId);
  const result = await paginateQuery(Profile, query, {
    where: { militaryClassId: id },
    include: [
      {
        model: User,
        where: { systemType: 'MILITARY', role: 'STUDENT' },
        required: true,
      },
    ],
  });
  return result;
};

const deleteRecord = async (id) => {
  const record = await MilitaryClass.findByPk(id);
  if (!record) throw new NotFoundError('Không tìm thấy lớp quân sự');
  if (await Profile.count({ where: { militaryClassId: id } }))
    throw new BadRequestError('Chuyển học viên khỏi lớp trước khi xóa lớp');
  const historyCount = await db.militaryClassHistory.count({
    where: { [Op.or]: [{ fromClassId: id }, { toClassId: id }] },
  });
  if (historyCount) throw new BadRequestError('Không thể xóa lớp đã có lịch sử xếp lớp');
  if (
    (await db.militarySubject.count({ where: { classId: id } })) ||
    (await db.militaryTimeTable.count({ where: { classId: id } })) ||
    (await db.militaryAchievement.count({ where: { classId: id } })) ||
    (await db.militaryDutySchedule.count({ where: { classId: id } }))
  )
    throw new BadRequestError(
      'Không thể xóa lớp đang có môn học, lịch học, thành tích hoặc lịch trực',
    );
  await record.destroy();
  return { deleted: true };
};

const getMilitaryCommanders = () =>
  User.findAll({
    where: { role: 'COMMANDER', systemType: 'MILITARY' },
    attributes: ['id', 'username'],
    order: [['username', 'ASC']],
  });

module.exports = {
  create,
  getAll,
  getDetail,
  update,
  assignStudents,
  assignStudentsByCode,
  removeStudent,
  getStudents,
  getMilitaryCommanders,
  delete: deleteRecord,
};
