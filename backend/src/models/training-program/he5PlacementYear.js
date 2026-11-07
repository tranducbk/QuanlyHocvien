module.exports = (sequelize, DataTypes) => sequelize.define('He5PlacementYear', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  trainingSystemId: { type: DataTypes.UUID, allowNull: false },
  schoolYear: { type: DataTypes.STRING(9), allowNull: false },
  startYear: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'DRAFT' },
  previousYearId: { type: DataTypes.UUID, allowNull: true },
  closedBy: { type: DataTypes.UUID, allowNull: true },
  closedAt: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'he5_placement_years', underscored: true, timestamps: true });
