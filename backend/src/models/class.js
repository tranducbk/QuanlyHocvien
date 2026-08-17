module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    className: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    studentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    educationLevelId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    tableName: 'classes',
    timestamps: true,
    underscored: true,
  });

  return Class;
};
