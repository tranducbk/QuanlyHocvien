module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'MilitarySubjectResult',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      profileId: { type: DataTypes.UUID, allowNull: false },
      militarySubjectId: { type: DataTypes.UUID, allowNull: false },
      enteredBy: { type: DataTypes.UUID, allowNull: false },
      letterGrade: { type: DataTypes.STRING(5), allowNull: false },
      gradePoint4: { type: DataTypes.DOUBLE, allowNull: false },
      gradePoint10: { type: DataTypes.DOUBLE, allowNull: false },
    },
    {
      tableName: 'military_subject_results',
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ['profile_id', 'military_subject_id'] }],
    },
  );
