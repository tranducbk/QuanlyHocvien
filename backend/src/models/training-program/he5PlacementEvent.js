module.exports = (sequelize, DataTypes) => sequelize.define('He5PlacementEvent', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  yearId: { type: DataTypes.UUID, allowNull: false },
  profileId: { type: DataTypes.UUID, allowNull: true },
  action: { type: DataTypes.STRING(30), allowNull: false },
  before: { type: DataTypes.JSONB, allowNull: true },
  after: { type: DataTypes.JSONB, allowNull: true },
  changedBy: { type: DataTypes.UUID, allowNull: true },
}, { tableName: 'he5_placement_events', underscored: true, timestamps: true });
