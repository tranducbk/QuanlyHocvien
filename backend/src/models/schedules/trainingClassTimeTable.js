module.exports = (sequelize, DataTypes) => sequelize.define('TrainingClassTimeTable', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  trainingClassId: { type: DataTypes.UUID, allowNull: false },
  semesterId: { type: DataTypes.UUID, allowNull: false },
  schedules: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
}, {
  tableName: 'training_class_time_tables',
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['training_class_id', 'semester_id'] }],
});
