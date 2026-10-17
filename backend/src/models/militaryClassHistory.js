module.exports = (sequelize, DataTypes) => sequelize.define('MilitaryClassHistory', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  profileId: { type: DataTypes.UUID, allowNull: false },
  fromClassId: { type: DataTypes.UUID, allowNull: true },
  toClassId: { type: DataTypes.UUID, allowNull: true },
  changedBy: { type: DataTypes.UUID, allowNull: false },
  reason: { type: DataTypes.STRING(255), allowNull: false },
}, { tableName: 'military_class_histories', timestamps: true, underscored: true, indexes: [{ fields: ['profile_id', 'created_at'] }] });
