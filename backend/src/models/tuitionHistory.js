module.exports = (sequelize, DataTypes) => {
  const TuitionHistory = sequelize.define('TuitionHistory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tuitionFeeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    changedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    oldStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    newStatus: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    tableName: 'tuition_histories',
    timestamps: true,
    underscored: true,
  });

  return TuitionHistory;
};
