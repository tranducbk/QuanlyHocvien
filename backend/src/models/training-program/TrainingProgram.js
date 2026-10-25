module.exports = (sequelize, DataTypes) => sequelize.define('TrainingProgram', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  trainingSystemId: { type: DataTypes.UUID, allowNull: false },
  code: { type: DataTypes.STRING(50), allowNull: false },
  name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'training_programs',
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['training_system_id', 'code'] }],
});
