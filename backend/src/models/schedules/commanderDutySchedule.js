module.exports = (sequelize, DataTypes) => {
  const CommanderDutySchedule = sequelize.define('CommanderDutySchedule', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING(100),
    },
    workDay: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'commander_duty_schedules',
    timestamps: true,
    underscored: true,
  });

  return CommanderDutySchedule;
};
