module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define('Organization', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    travelTime: {
      type: DataTypes.INTEGER,
    },
    totalStudents: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'ACTIVE',
    },
    universityId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    tableName: 'organizations',
    timestamps: true,
    underscored: true,
  });

  return Organization;
};
