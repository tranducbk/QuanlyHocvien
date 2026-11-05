const db = require('../../models');
const { BadRequestError, ForbiddenError, NotFoundError } = require('../../utils/apiError');

const systemId = (user) => {
  if (user?.role !== 'COMMANDER' || !user.trainingSystemId
      || !['HE_1', 'HE_3', 'HE_4', 'HE_7'].includes(user.trainingSystemCode)) {
    throw new ForbiddenError('Chỉ Chỉ huy Hệ 1, 3, 4, 7 được quản lý danh mục môn');
  }
  return user.trainingSystemId;
};

const list = (user) => db.subjectCatalog.findAll({
  where: { trainingSystemId: systemId(user) }, order: [['subjectCode', 'ASC']],
});

const get = async (id, user) => {
  const subject = await db.subjectCatalog.findOne({ where: { id, trainingSystemId: systemId(user) } });
  if (!subject) throw new NotFoundError('Không tìm thấy môn trong danh mục của Hệ');
  return subject;
};

const save = async (id, data, user) => {
  const trainingSystemId = systemId(user);
  const subject = id ? await get(id, user) : null;
  const values = { subjectCode: data.subjectCode.trim(), subjectName: data.subjectName.trim(), credits: data.credits };
  try {
    return subject ? await subject.update(values) : await db.subjectCatalog.create({ ...values, trainingSystemId });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') throw new BadRequestError('Mã môn đã tồn tại trong danh mục của Hệ');
    throw error;
  }
};

module.exports = { list, get, save };
