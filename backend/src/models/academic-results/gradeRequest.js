module.exports = (sequelize, DataTypes) => {
  const GradeRequest = sequelize.define('GradeRequest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    subjectResultId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    requestType: {
      type: DataTypes.ENUM('ADD', 'UPDATE', 'DELETE'),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    proposedLetterGrade: { type: DataTypes.STRING(5) },
    proposedGradePoint4: { type: DataTypes.DOUBLE },
    proposedGradePoint10: { type: DataTypes.DOUBLE },
    attachmentUrl: { type: DataTypes.STRING(500) },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING',
    },
    reviewerId: { type: DataTypes.UUID },
    reviewNote: { type: DataTypes.TEXT },
    reviewedAt: { type: DataTypes.DATE },
  }, {
    tableName: 'grade_requests',
    timestamps: true,
    underscored: true,
  });

  return GradeRequest;
};
