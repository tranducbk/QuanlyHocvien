module.exports = (sequelize, DataTypes) => sequelize.define('CurriculumVersion', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  trainingProgramId: { type: DataTypes.UUID, allowNull: false },
  versionCode: { type: DataTypes.STRING(50), allowNull: false },
  name: { type: DataTypes.STRING(255), allowNull: false },
  effectiveFrom: { type: DataTypes.DATEONLY, allowNull: true },
  effectiveTo: { type: DataTypes.DATEONLY, allowNull: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'DRAFT' },
}, {
  tableName: 'curriculum_versions',
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['training_program_id', 'version_code'] }],
});
