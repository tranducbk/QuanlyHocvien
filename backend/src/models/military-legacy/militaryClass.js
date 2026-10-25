module.exports = (sequelize, DataTypes) => sequelize.define('MilitaryClass', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  className: { type: DataTypes.STRING(255), allowNull: false },
  classCode: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  commanderId: { type: DataTypes.UUID, allowNull: false },
}, { tableName: 'military_classes', timestamps: true, underscored: true });
