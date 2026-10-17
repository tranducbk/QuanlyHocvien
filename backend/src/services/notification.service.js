const db = require('../models');
const { NotFoundError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');
const { isCommander } = require('../utils/commanderScope');

const Notification = db.notification;
const User = db.user;
const { Op } = db.Sequelize;

// Include User an toàn; chỉ huy chỉ thấy thông báo của chính mình hoặc học viên cùng hệ
const notificationUserInclude = (requester) => {
  const include = { model: User, attributes: { exclude: ['password', 'refreshToken'] } };
  if (isCommander(requester)) {
    include.where = {
      [Op.or]: [
        { id: requester.id },
        { role: 'STUDENT', systemType: requester.systemType },
      ],
    };
    include.required = true;
  }
  return include;
};

// Admin sửa nội dung thông báo; chỉ huy chỉ được đổi trạng thái đã đọc. Không bao giờ đổi userId.
const ADMIN_UPDATE_FIELDS = ['title', 'content', 'type', 'link', 'isRead'];
const COMMANDER_UPDATE_FIELDS = ['isRead'];

const create = async (data) => Notification.create(data);
const getAll = async (query, requester) => paginateQuery(Notification, query, {
  filterFields: ['userId', 'type', 'isRead'],
  include: [notificationUserInclude(requester)],
});

const getDetail = async (id, requester) => {
  const record = await Notification.findByPk(id, {
    include: [notificationUserInclude(requester)],
  });
  if (!record) throw new NotFoundError('Không tìm thấy thông báo');
  return record;
};

const update = async (id, data, requester) => {
  const record = await getDetail(id, requester);
  const allowedFields = isCommander(requester) ? COMMANDER_UPDATE_FIELDS : ADMIN_UPDATE_FIELDS;
  const updateData = {};
  for (const field of allowedFields) {
    if (data?.[field] !== undefined) updateData[field] = data[field];
  }
  return record.update(updateData);
};

const deleteRecord = async (id, requester) => {
  const record = await getDetail(id, requester);
  await record.destroy();
  return { deleted: true };
};

module.exports = { create, getAll, getDetail, update, delete: deleteRecord };
