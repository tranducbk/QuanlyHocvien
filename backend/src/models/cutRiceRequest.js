module.exports = (sequelize, DataTypes) => {
  const CutRiceRequest = sequelize.define('CutRiceRequest', {
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
      allowNull: false,
    },
    weekStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    weekEndDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    weekly: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    notes: {
      type: DataTypes.STRING(255),
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewNote: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'cut_rice_requests',
    timestamps: true,
    underscored: true,
  });

  return CutRiceRequest;
};
