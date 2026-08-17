const db = require('../models');
const { NotFoundError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');

const Notification = db.notification;
const User = db.user;

const create = async (data) => Notification.create(data);
const getAll = async (query) => paginateQuery(Notification, query, {
  filterFields: ['userId', 'type', 'isRead'],
  include: [{ model: User, attributes: { exclude: ['password', 'refreshToken'] } }],
});

const getDetail = async (id) => {
  const record = await Notification.findByPk(id, {
    include: [{ model: User, attributes: { exclude: ['password', 'refreshToken'] } }],
  });
  if (!record) throw new NotFoundError('Không tìm thấy thông báo');
  return record;
};

const update = async (id, data) => {
  const record = await getDetail(id);
  return record.update(data);
};

const deleteRecord = async (id) => {
  const record = await getDetail(id);
  await record.destroy();
  return { deleted: true };
};

module.exports = { create, getAll, getDetail, update, delete: deleteRecord };
