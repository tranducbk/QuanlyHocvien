module.exports = (sequelize, DataTypes) => sequelize.define('TrainingClassSemester', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  trainingClassId: { type: DataTypes.UUID, allowNull: false },
  code: { type: DataTypes.INTEGER, allowNull: false },
  schoolYear: { type: DataTypes.STRING(50), allowNull: false },
  gradeClosedAt: { type: DataTypes.DATE, allowNull: true },
  gradeClosedBy: { type: DataTypes.UUID, allowNull: true },
}, {
  tableName: 'training_class_semesters',
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['training_class_id', 'school_year', 'code'] }],
});
