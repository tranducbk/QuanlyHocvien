module.exports = (sequelize, DataTypes) => sequelize.define('TrainingClassGradeRevision', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  resultId: { type: DataTypes.UUID, allowNull: false },
  changedBy: { type: DataTypes.UUID, allowNull: false },
  reason: { type: DataTypes.TEXT, allowNull: true },
  beforeScore: { type: DataTypes.JSONB, allowNull: true },
  afterScore: { type: DataTypes.JSONB, allowNull: false },
  wasClosed: { type: DataTypes.BOOLEAN, allowNull: false },
}, { tableName: 'training_class_grade_revisions', underscored: true, timestamps: true, updatedAt: false });
