module.exports = (sequelize, DataTypes) => {
  const YearlyAchievement = sequelize.define('YearlyAchievement', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    decisionNumber: {
      type: DataTypes.STRING(100),
    },
    decisionDate: {
      type: DataTypes.DATE,
    },
    title: {
      type: DataTypes.STRING(255),
    },
    hasMinistryReward: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    hasNationalReward: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'yearly_achievements',
    timestamps: true,
    underscored: true,
  });

  return YearlyAchievement;
};
