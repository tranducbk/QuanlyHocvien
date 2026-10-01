module.exports = (sequelize, DataTypes) => sequelize.define('MilitarySemester', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  code: { type: DataTypes.INTEGER, allowNull: false },
  schoolYear: { type: DataTypes.STRING(50), allowNull: false },
  commanderId: { type: DataTypes.UUID, allowNull: false },
}, { tableName: 'military_semesters', timestamps: true, underscored: true, indexes: [{ unique: true, fields: ['commander_id', 'school_year', 'code'] }] });
