module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'MilitaryDutySchedule',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      classId: { type: DataTypes.UUID, allowNull: false },
      userId: { type: DataTypes.UUID, allowNull: false },
      position: { type: DataTypes.STRING(100), allowNull: false },
      workDay: { type: DataTypes.DATEONLY, allowNull: false },
    },
    {
      tableName: 'military_duty_schedules',
      timestamps: true,
      underscored: true,
    },
  );
