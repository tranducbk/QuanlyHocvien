module.exports = (sequelize, DataTypes) => sequelize.define('TrainingClass', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  trainingSystemId: { type: DataTypes.UUID, allowNull: false },
  code: { type: DataTypes.STRING(50), allowNull: false },
  name: { type: DataTypes.STRING(255), allowNull: false },
  commanderId: { type: DataTypes.UUID, allowNull: true },
  educationProviderId: { type: DataTypes.UUID, allowNull: true },
  trainingProgramId: { type: DataTypes.UUID, allowNull: true },
  curriculumVersionId: { type: DataTypes.UUID, allowNull: true },
  startYear: { type: DataTypes.INTEGER, allowNull: true },
  endYear: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'ACTIVE' },
}, {
  tableName: 'training_classes',
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['training_system_id', 'code'] }],
});
