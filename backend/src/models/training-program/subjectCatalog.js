module.exports = (sequelize, DataTypes) => sequelize.define('SubjectCatalog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  trainingSystemId: { type: DataTypes.UUID, allowNull: false },
  subjectCode: { type: DataTypes.STRING(50), allowNull: false },
  subjectName: { type: DataTypes.STRING(255), allowNull: false },
  credits: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
  tableName: 'subject_catalogs',
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['training_system_id', 'subject_code'] }],
});
