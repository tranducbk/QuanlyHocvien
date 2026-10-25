module.exports = (sequelize, DataTypes) => {
  const SemesterResult = sequelize.define('SemesterResult', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    semester: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    schoolYear: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    yearlyResultId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    totalCredits: {
      type: DataTypes.INTEGER,
    },
    averageGrade4: {
      type: DataTypes.DOUBLE,
    },
    averageGrade10: {
      type: DataTypes.DOUBLE,
    },
    cumulativeCredits: {
      type: DataTypes.INTEGER,
    },
    cumulativeGrade4: {
      type: DataTypes.DOUBLE,
    },
    cumulativeGrade10: {
      type: DataTypes.DOUBLE,
    },
    debtCredits: {
      type: DataTypes.INTEGER,
    },
    failedSubjects: {
      type: DataTypes.INTEGER,
    },
  }, {
    tableName: 'semester_results',
    timestamps: true,
    underscored: true,
  });

  return SemesterResult;
};
