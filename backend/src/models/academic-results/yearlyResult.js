module.exports = (sequelize, DataTypes) => {
  const YearlyResult = sequelize.define('YearlyResult', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    schoolYear: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    averageGrade4: {
      type: DataTypes.DOUBLE,
    },
    averageGrade10: {
      type: DataTypes.DOUBLE,
    },
    cumulativeGrade4: {
      type: DataTypes.DOUBLE,
    },
    cumulativeGrade10: {
      type: DataTypes.DOUBLE,
    },
    cumulativeCredits: {
      type: DataTypes.INTEGER,
    },
    totalCredits: {
      type: DataTypes.INTEGER,
    },
    totalSubjects: {
      type: DataTypes.INTEGER,
    },
    passedSubjects: {
      type: DataTypes.INTEGER,
    },
    failedSubjects: {
      type: DataTypes.INTEGER,
    },
    debtCredits: {
      type: DataTypes.INTEGER,
    },
    academicStatus: {
      type: DataTypes.STRING(50),
    },
    studentLevel: {
      type: DataTypes.INTEGER,
    },
    semesterIds: {
      type: DataTypes.UUID,
    },
    partyRating: {
      type: DataTypes.STRING(50),
    },
    trainingRating: {
      type: DataTypes.STRING(50),
    },
    partyRatingDecisionNumber: {
      type: DataTypes.STRING(100),
    },
  }, {
    tableName: 'yearly_results',
    timestamps: true,
    underscored: true,
  });

  return YearlyResult;
};
