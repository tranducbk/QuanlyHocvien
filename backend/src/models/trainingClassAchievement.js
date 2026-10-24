module.exports = (sequelize, DataTypes) => sequelize.define('TrainingClassAchievement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  trainingClassId: { type: DataTypes.UUID, allowNull: false },
  studentUserId: { type: DataTypes.UUID, allowNull: false },
  category: { type: DataTypes.STRING(40), allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  award: { type: DataTypes.STRING(255), allowNull: true },
  year: { type: DataTypes.INTEGER, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'training_class_achievements', timestamps: true, underscored: true });
