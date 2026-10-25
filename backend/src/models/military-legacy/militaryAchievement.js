module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'MilitaryAchievement',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      classId: { type: DataTypes.UUID, allowNull: false },
      userId: { type: DataTypes.UUID, allowNull: false },
      category: {
        type: DataTypes.STRING(40),
        allowNull: false,
        defaultValue: 'AWARD',
      },
      title: { type: DataTypes.STRING(255), allowNull: false },
      award: { type: DataTypes.STRING(255) },
      year: { type: DataTypes.INTEGER },
      schoolYear: { type: DataTypes.STRING(50) },
      semester: { type: DataTypes.STRING(50) },
      decisionNumber: { type: DataTypes.STRING(100) },
      description: { type: DataTypes.TEXT },
    },
    { tableName: 'military_achievements', timestamps: true, underscored: true },
  );
