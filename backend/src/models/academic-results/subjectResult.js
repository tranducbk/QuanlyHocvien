module.exports = (sequelize, DataTypes) => {
  const SubjectResult = sequelize.define('SubjectResult', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    semesterResultId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    subjectCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    subjectName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    credits: {
      type: DataTypes.INTEGER,
    },
    letterGrade: {
      type: DataTypes.STRING(5),
    },
    gradePoint4: {
      type: DataTypes.DOUBLE,
    },
    gradePoint10: {
      type: DataTypes.DOUBLE,
    },
  }, {
    tableName: 'subject_results',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['semester_result_id', 'subject_code']
      }
    ]
  });

  return SubjectResult;
};
