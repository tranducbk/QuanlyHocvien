module.exports = (sequelize, DataTypes) => {
  const Achievement = sequelize.define('Achievement', {
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
    },
    schoolYear: {
      type: DataTypes.STRING(50),
    },
    content: {
      type: DataTypes.TEXT,
    },
    year: {
      type: DataTypes.INTEGER,
    },
    title: {
      type: DataTypes.STRING(255),
    },
    description: {
      type: DataTypes.TEXT,
    },
    award: {
      type: DataTypes.STRING(255),
    },
  }, {
    tableName: 'achievements',
    timestamps: true,
    underscored: true,
  });

  return Achievement;
};
