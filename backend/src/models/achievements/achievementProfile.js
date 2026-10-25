module.exports = (sequelize, DataTypes) => {
  const AchievementProfile = sequelize.define('AchievementProfile', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    totalYears: {
      type: DataTypes.INTEGER,
    },
    totalAdvancedSoldier: {
      type: DataTypes.INTEGER,
    },
    totalCompetitiveSoldier: {
      type: DataTypes.INTEGER,
    },
    totalScientificTopics: {
      type: DataTypes.INTEGER,
    },
    totalScientificInitiatives: {
      type: DataTypes.INTEGER,
    },
    eligibleForMinistryReward: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    eligibleForNationalReward: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'achievement_profiles',
    timestamps: true,
    underscored: true,
  });

  return AchievementProfile;
};
