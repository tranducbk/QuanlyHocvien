const { TRAINING_SYSTEM_CODES } = require('../../constants/trainingSystems');

module.exports = (sequelize, DataTypes) => sequelize.define('TrainingSystem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    validate: { isIn: [Object.values(TRAINING_SYSTEM_CODES)] },
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'training_systems',
  timestamps: true,
  underscored: true,
});
