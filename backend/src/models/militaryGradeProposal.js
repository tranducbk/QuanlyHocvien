module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'MilitaryGradeProposal',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      profileId: { type: DataTypes.UUID, allowNull: false },
      userId: { type: DataTypes.UUID, allowNull: false },
      militarySubjectId: { type: DataTypes.UUID, allowNull: false },
      proposedLetterGrade: { type: DataTypes.STRING(5), allowNull: false },
      proposedGradePoint4: { type: DataTypes.DOUBLE, allowNull: false },
      proposedGradePoint10: { type: DataTypes.DOUBLE, allowNull: false },
      reason: { type: DataTypes.TEXT, allowNull: false },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'PENDING',
        validate: { isIn: [['PENDING', 'APPROVED', 'REJECTED']] },
      },
      reviewerId: { type: DataTypes.UUID },
      reviewNote: { type: DataTypes.TEXT },
      reviewedAt: { type: DataTypes.DATE },
    },
    {
      tableName: 'military_grade_proposals',
      timestamps: true,
      underscored: true,
    },
  );
