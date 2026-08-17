module.exports = (sequelize, DataTypes) => {
  const Profile = sequelize.define('Profile', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    fullName: {
      type: DataTypes.STRING(100),
    },
    email: {
      type: DataTypes.STRING(100),
    },
    gender: {
      type: DataTypes.STRING(20),
    },
    birthday: {
      type: DataTypes.DATE,
    },
    hometown: {
      type: DataTypes.STRING(255),
    },
    ethnicity: {
      type: DataTypes.STRING(50),
    },
    religion: {
      type: DataTypes.STRING(50),
    },
    currentAddress: {
      type: DataTypes.STRING(255),
    },
    placeOfBirth: {
      type: DataTypes.STRING(255),
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
    },
    cccd: {
      type: DataTypes.STRING(20),
    },
    partyMemberCardNumber: {
      type: DataTypes.STRING(50),
    },
    unit: {
      type: DataTypes.STRING(255),
    },
    rank: {
      type: DataTypes.STRING(50),
    },
    positionGovernment: {
      type: DataTypes.STRING(100),
    },
    positionParty: {
      type: DataTypes.STRING(100),
    },
    fullPartyMember: {
      type: DataTypes.DATE,
    },
    probationaryPartyMember: {
      type: DataTypes.DATE,
    },
    dateOfEnlistment: {
      type: DataTypes.DATE,
    },
    avatar: {
      type: DataTypes.STRING(255),
    },
    enrollment: {
      type: DataTypes.INTEGER,
    },
    graduationDate: {
      type: DataTypes.DATE,
    },
    currentCpa4: {
      type: DataTypes.DOUBLE,
    },
    currentCpa10: {
      type: DataTypes.DOUBLE,
    },
    familyMember: {
      type: DataTypes.JSONB,
    },
    foreignRelations: {
      type: DataTypes.JSONB,
    },
    startWork: {
      type: DataTypes.INTEGER,
    },
    organization: {
      type: DataTypes.STRING(255),
    },
    commanderId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    classId: {
      type: DataTypes.UUID,
    },
    organizationId: {
      type: DataTypes.UUID,
    },
    universityId: {
      type: DataTypes.UUID,
    },
    educationLevelId: {
      type: DataTypes.UUID,
    },
  }, {
    tableName: 'profiles',
    timestamps: true,
    underscored: true,
  });

  return Profile;
};
