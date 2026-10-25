module.exports = (sequelize, DataTypes) => {
  const SchoolYear = sequelize.define('SchoolYear', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    schoolYear: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'school_years',
    timestamps: true,
    underscored: true,
  });

  return SchoolYear;
};
