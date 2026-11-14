module.exports = (sequelize, DataTypes) => sequelize.define('He5Placement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  yearId: { type: DataTypes.UUID, allowNull: false },
  profileId: { type: DataTypes.UUID, allowNull: false },
  trainingClassId: { type: DataTypes.UUID, allowNull: false },
  studentCode: { type: DataTypes.STRING(50), allowNull: false },
  fullName: { type: DataTypes.STRING(100), allowNull: true },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'ACTIVE' },
}, { tableName: 'he5_placements', underscored: true, timestamps: true });
