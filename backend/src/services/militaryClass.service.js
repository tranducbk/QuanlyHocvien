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

const create = async (data, commanderId) => {
  if (await MilitaryClass.findOne({ where: { classCode: data.classCode } })) throw new BadRequestError('Mã lớp đã tồn tại');
  return MilitaryClass.create({ ...data, commanderId });
};

const getAll = async (query, commanderId) => {
  const where = { commanderId };
  if (query.className) where.className = { [Op.iLike]: `%${query.className}%` };
  const result = await paginateQuery(MilitaryClass, query, { where });
  const ids = result.rows.map(row => row.id);
  const counts = await Profile.findAll({
    attributes: ['militaryClassId', [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'studentCount']],
    where: { militaryClassId: { [Op.in]: ids } }, group: ['militaryClassId'], raw: true,
  });
  const countByClassId = Object.fromEntries(counts.map(row => [row.militaryClassId, Number(row.studentCount)]));
  result.rows = result.rows.map(row => ({ ...row.get({ plain: true }), studentCount: countByClassId[row.id] || 0 }));
  return result;
};

const getDetail = async (id, commanderId) => {
  const record = await getOwned(id, commanderId);
  const studentCount = await Profile.count({ where: { militaryClassId: id } });
  return { ...record.get({ plain: true }), studentCount };
};

const update = async (id, data, commanderId) => {
  const record = await getOwned(id, commanderId);
  if (data.classCode && data.classCode !== record.classCode && await MilitaryClass.findOne({ where: { classCode: data.classCode } })) throw new BadRequestError('Mã lớp đã tồn tại');
  return record.update(data);
};

const assignStudents = async (id, userIds, commanderId) => {
  const record = await getOwned(id, commanderId);
  const users = await User.findAll({ where: { id: { [Op.in]: [...new Set(userIds)] }, role: 'STUDENT', systemType: 'MILITARY' }, include: [{ model: Profile }] });
  if (users.length !== new Set(userIds).size || users.some(user => !user.Profile)) {
    throw new BadRequestError('Danh sách chỉ được gồm học viên quân sự có hồ sơ');
  }
  if (users.some(user => user.Profile.commanderId && user.Profile.commanderId !== commanderId)) {
    throw new BadRequestError('Có học viên do Chỉ huy khác quản lý');
  }
  await db.sequelize.transaction(async transaction => {
    for (const user of users) {
      const fromClassId = user.Profile.militaryClassId || null;
      if (fromClassId !== record.id) {
        await db.militaryClassHistory.create({
          profileId: user.Profile.id,
          fromClassId,
          toClassId: record.id,
          changedBy: commanderId,
          reason: fromClassId ? 'TRANSFER' : 'INITIAL_ASSIGNMENT',
        }, { transaction });
        await user.Profile.update({ militaryClassId: record.id, commanderId }, { transaction });
      } else if (!user.Profile.commanderId) {
        await user.Profile.update({ commanderId }, { transaction });
      }
    }
  });
  return { classId: record.id, assigned: users.length, studentCount: await Profile.count({ where: { militaryClassId: id } }) };
};

const assignStudentsByCode = async (id, studentCodes, commanderId) => {
  const normalizedCodes = [...new Set(studentCodes.map(code => String(code).trim()).filter(Boolean))];
  const profiles = await Profile.findAll({
    where: { code: { [Op.in]: normalizedCodes } },
    include: [{ model: User, where: { role: 'STUDENT', systemType: 'MILITARY' }, required: true }],
  });
  if (profiles.length !== normalizedCodes.length) throw new BadRequestError('Một hoặc nhiều mã không thuộc học viên quân sự');
  return assignStudents(id, profiles.map(profile => profile.User.id), commanderId);
};

const removeStudent = async (id, userId, commanderId) => {
  await getOwned(id, commanderId);
  const user = await User.findOne({ where: { id: userId, role: 'STUDENT', systemType: 'MILITARY' }, include: [{ model: Profile }] });
  if (!user?.Profile || user.Profile.militaryClassId !== id) throw new NotFoundError('Không tìm thấy học viên trong lớp');
  await db.sequelize.transaction(async transaction => {
    await db.militaryClassHistory.create({ profileId: user.Profile.id, fromClassId: id, toClassId: null, changedBy: commanderId, reason: 'REMOVED' }, { transaction });
    await user.Profile.update({ militaryClassId: null }, { transaction });
  });
  return { userId, classId: id };
};

const getStudents = async (id, query, commanderId) => {
  await getOwned(id, commanderId);
  const result = await paginateQuery(Profile, query, { where: { militaryClassId: id }, include: [{ model: User, where: { systemType: 'MILITARY', role: 'STUDENT' }, required: true }] });
  return result;
};

const deleteRecord = async (id, commanderId) => {
  const record = await getOwned(id, commanderId);
  if (await Profile.count({ where: { militaryClassId: id } })) throw new BadRequestError('Chuyển học viên khỏi lớp trước khi xóa lớp');
  const historyCount = await db.militaryClassHistory.count({ where: { [Op.or]: [{ fromClassId: id }, { toClassId: id }] } });
  if (historyCount) throw new BadRequestError('Không thể xóa lớp đã có lịch sử xếp lớp');
  await record.destroy();
  return { deleted: true };
};

module.exports = { create, getAll, getDetail, update, assignStudents, assignStudentsByCode, removeStudent, getStudents, delete: deleteRecord };
