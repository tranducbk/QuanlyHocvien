const { USER_ROLES, SYSTEM_TYPES } = require('../utils/constants');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [USER_ROLES],
      },
    },
    systemType: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        isIn: [SYSTEM_TYPES],
      },
    },
    refreshToken: {
      type: DataTypes.TEXT,
    },
    profileId: {
      type: DataTypes.UUID,
    },
    deleteAt: {
      type: DataTypes.DATE,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    paranoid: true,
    deletedAt: 'delete_at',
    validate: {
      roleMatchesSystemType() {
        if (this.role === 'ADMIN' && this.systemType !== null) {
          throw new Error('Tài khoản ADMIN không được thuộc hệ đào tạo');
        }
        if (['STUDENT', 'COMMANDER'].includes(this.role) && !SYSTEM_TYPES.includes(this.systemType)) {
          throw new Error('Tài khoản STUDENT hoặc COMMANDER bắt buộc thuộc một hệ đào tạo');
        }
      },
    },
  });

  return User;
};
