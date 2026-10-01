module.exports = (sequelize, DataTypes) => sequelize.define('MilitarySubject', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  subjectCode: { type: DataTypes.STRING(50), allowNull: false },
  subjectName: { type: DataTypes.STRING(255), allowNull: false },
  credits: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  classId: { type: DataTypes.UUID, allowNull: false },
  semesterId: { type: DataTypes.UUID, allowNull: false },
}, { tableName: 'military_subjects', timestamps: true, underscored: true, indexes: [{ unique: true, fields: ['class_id', 'semester_id', 'subject_code'] }] });
