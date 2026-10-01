module.exports = (sequelize, DataTypes) => sequelize.define('MilitaryTimeTable', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  classId: { type: DataTypes.UUID, allowNull: false },
  semesterId: { type: DataTypes.UUID, allowNull: false },
  schedules: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
}, { tableName: 'military_time_tables', timestamps: true, underscored: true, indexes: [{ unique: true, fields: ['class_id', 'semester_id'] }] });
