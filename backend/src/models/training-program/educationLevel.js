module.exports = (sequelize, DataTypes) => {
  const EducationLevel = sequelize.define('EducationLevel', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    levelName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    tableName: 'education_levels',
    timestamps: true,
    underscored: true,
  });

  return EducationLevel;
};
