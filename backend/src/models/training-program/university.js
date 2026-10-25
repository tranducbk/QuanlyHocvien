module.exports = (sequelize, DataTypes) => {
  const University = sequelize.define('University', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    universityCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    universityName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    totalStudents: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'ACTIVE',
    },
  }, {
    tableName: 'universities',
    timestamps: true,
    underscored: true,
  });

  return University;
};
