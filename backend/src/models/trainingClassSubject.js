module.exports = (sequelize, DataTypes) => sequelize.define('TrainingClassSubject', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  trainingClassId: { type: DataTypes.UUID, allowNull: false },
  semesterId: { type: DataTypes.UUID, allowNull: false },
  subjectCode: { type: DataTypes.STRING(50), allowNull: false },
  subjectName: { type: DataTypes.STRING(255), allowNull: false },
  credits: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
  tableName: 'training_class_subjects',
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['training_class_id', 'semester_id', 'subject_code'] }],
});
