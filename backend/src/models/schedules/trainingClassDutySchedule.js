module.exports = (sequelize, DataTypes) => sequelize.define('TrainingClassDutySchedule', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  trainingClassId: { type: DataTypes.UUID, allowNull: false },
  studentUserId: { type: DataTypes.UUID, allowNull: false },
  position: { type: DataTypes.STRING(100), allowNull: false },
  workDay: { type: DataTypes.DATEONLY, allowNull: false },
}, { tableName: 'training_class_duty_schedules', timestamps: true, underscored: true });
