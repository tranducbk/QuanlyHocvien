module.exports = (sequelize, DataTypes) => {
  const ScientificTopic = sequelize.define('ScientificTopic', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    yearlyAchievementId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    year: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.STRING(50),
    },
  }, {
    tableName: 'scientific_topics',
    timestamps: true,
    underscored: true,
  });

  return ScientificTopic;
};
