module.exports = (sequelize, DataTypes) => {
  const TuitionFee = sequelize.define('TuitionFee', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    semesterId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
    },
    semester: {
      type: DataTypes.STRING(50),
    },
    schoolYear: {
      type: DataTypes.STRING(50),
    },
    content: {
      type: DataTypes.STRING(255),
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'UNPAID',
    },
  }, {
    tableName: 'tuition_fees',
    timestamps: true,
    underscored: true,
  });

  return TuitionFee;
};
