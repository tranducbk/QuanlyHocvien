const dbConfig = require('../config/dbConfig.js');
const { Sequelize, DataTypes } = require('sequelize');

const dialectOptions = dbConfig.ssl
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }
  : {};

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectOptions,
    logging: false,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    }
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('PostgreSQL connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ==========================
// Models
// ==========================

// Nhóm Quản lý Tổ chức & Cơ sở
db.university = require('./university.js')(sequelize, DataTypes);
db.organization = require('./organization.js')(sequelize, DataTypes);
db.educationLevel = require('./educationLevel.js')(sequelize, DataTypes);
db.class = require('./class.js')(sequelize, DataTypes);

// Nhóm Hồ sơ Sinh viên
db.profile = require('./profile.js')(sequelize, DataTypes);
db.user = require('./user.js')(sequelize, DataTypes);

// Nhóm Kết quả Học tập & Đào tạo
db.yearlyResult = require('./yearlyResult.js')(sequelize, DataTypes);
db.semesterResult = require('./semesterResult.js')(sequelize, DataTypes);
db.subjectResult = require('./subjectResult.js')(sequelize, DataTypes);
db.schoolYear = require('./schoolYear.js')(sequelize, DataTypes);
db.semester = require('./semester.js')(sequelize, DataTypes);
db.timeTable = require('./timeTable.js')(sequelize, DataTypes);
db.tuitionFee = require('./tuitionFee.js')(sequelize, DataTypes);
db.tuitionHistory = require('./tuitionHistory.js')(sequelize, DataTypes);

// Nhóm Thi đua & Nghiên cứu
db.achievement = require('./achievement.js')(sequelize, DataTypes);
db.achievementProfile = require('./achievementProfile.js')(sequelize, DataTypes);
db.yearlyAchievement = require('./yearlyAchievement.js')(sequelize, DataTypes);
db.scientificInitiative = require('./scientificInitiative.js')(sequelize, DataTypes);
db.scientificTopic = require('./scientificTopic.js')(sequelize, DataTypes);

// Nhóm Bổ trợ & Lịch trình
db.commanderDutySchedule = require('./commanderDutySchedule.js')(sequelize, DataTypes);
db.cutRice = require('./cutRice.js')(sequelize, DataTypes);
db.cutRiceRequest = require('./cutRiceRequest.js')(sequelize, DataTypes);
db.notification = require('./notification.js')(sequelize, DataTypes);
db.gradeRequest = require('./gradeRequest.js')(sequelize, DataTypes);

// ==========================
// Relations
// ==========================

// --- Nhóm Quản lý Tổ chức & Cơ sở ---

// University 1:N Organization
db.university.hasMany(db.organization, { foreignKey: 'university_id', onUpdate: 'CASCADE', onDelete: 'RESTRICT' });
db.organization.belongsTo(db.university, { foreignKey: 'university_id', onUpdate: 'CASCADE', onDelete: 'RESTRICT' });

// Organization 1:N EducationLevel
db.organization.hasMany(db.educationLevel, { foreignKey: 'organization_id', onUpdate: 'CASCADE', onDelete: 'RESTRICT' });
db.educationLevel.belongsTo(db.organization, { foreignKey: 'organization_id', onUpdate: 'CASCADE', onDelete: 'RESTRICT' });

// EducationLevel 1:N Class
db.educationLevel.hasMany(db.class, { foreignKey: 'education_level_id', onUpdate: 'CASCADE', onDelete: 'RESTRICT' });
db.class.belongsTo(db.educationLevel, { foreignKey: 'education_level_id', onUpdate: 'CASCADE', onDelete: 'RESTRICT' });

// --- Nhóm Hồ sơ Sinh viên ---

// Class 1:N Profile
db.class.hasMany(db.profile, { foreignKey: 'class_id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });
db.profile.belongsTo(db.class, { foreignKey: 'class_id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });

// Organization 1:N Profile
db.organization.hasMany(db.profile, { foreignKey: 'organization_id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });
db.profile.belongsTo(db.organization, { foreignKey: 'organization_id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });

// University 1:N Profile
db.university.hasMany(db.profile, { foreignKey: 'university_id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });
db.profile.belongsTo(db.university, { foreignKey: 'university_id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });

// EducationLevel 1:N Profile
db.educationLevel.hasMany(db.profile, { foreignKey: 'education_level_id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });
db.profile.belongsTo(db.educationLevel, { foreignKey: 'education_level_id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });

// Profile 1:1 User
db.profile.hasOne(db.user, { foreignKey: 'profile_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.user.belongsTo(db.profile, { foreignKey: 'profile_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.user.hasMany(db.profile, { as: 'managedStudents', foreignKey: { name: 'commanderId', field: 'commander_id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' });
db.profile.belongsTo(db.user, { as: 'commander', foreignKey: { name: 'commanderId', field: 'commander_id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' });

// --- Nhóm Kết quả Học tập & Đào tạo ---

// User 1:N YearlyResult
db.user.hasMany(db.yearlyResult, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.yearlyResult.belongsTo(db.user, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

// User 1:N SemesterResult
db.user.hasMany(db.semesterResult, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.semesterResult.belongsTo(db.user, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

// YearlyResult 1:N SemesterResult
db.yearlyResult.hasMany(db.semesterResult, { foreignKey: 'yearly_result_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.semesterResult.belongsTo(db.yearlyResult, { foreignKey: 'yearly_result_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

// SemesterResult 1:N SubjectResult
db.semesterResult.hasMany(db.subjectResult, { foreignKey: 'semester_result_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.subjectResult.belongsTo(db.semesterResult, { foreignKey: 'semester_result_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

// SchoolYear 1:N Semester
db.schoolYear.hasMany(db.semester, { as: 'semesters', foreignKey: { name: 'schoolYearId', field: 'school_year_id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' });
db.semester.belongsTo(db.schoolYear, { as: 'schoolYearInfo', foreignKey: { name: 'schoolYearId', field: 'school_year_id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' });

// User 1:N TimeTable
db.user.hasMany(db.timeTable, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.timeTable.belongsTo(db.user, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

// Semester 1:N TimeTable
db.semester.hasMany(db.timeTable, { foreignKey: 'semester_id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });
db.timeTable.belongsTo(db.semester, { foreignKey: 'semester_id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });

// User 1:N TuitionFee
db.user.hasMany(db.tuitionFee, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.tuitionFee.belongsTo(db.user, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

// Semester 1:N TuitionFee
db.semester.hasMany(db.tuitionFee, { as: 'tuitionFees', foreignKey: 'semester_id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });
db.tuitionFee.belongsTo(db.semester, { as: 'semesterInfo', foreignKey: 'semester_id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });

// TuitionFee 1:N TuitionHistory
db.tuitionFee.hasMany(db.tuitionHistory, { foreignKey: 'tuition_fee_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.tuitionHistory.belongsTo(db.tuitionFee, { foreignKey: 'tuition_fee_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

// User 1:N TuitionHistory (changedBy)
db.user.hasMany(db.tuitionHistory, { foreignKey: 'changed_by', onUpdate: 'CASCADE', onDelete: 'SET NULL' });
db.tuitionHistory.belongsTo(db.user, { as: 'changer', foreignKey: 'changed_by', onUpdate: 'CASCADE', onDelete: 'SET NULL' });

// --- Nhóm Thi đua & Nghiên cứu ---

// User 1:N Achievement
db.user.hasMany(db.achievement, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.achievement.belongsTo(db.user, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

// User 1:1 AchievementProfile
db.user.hasOne(db.achievementProfile, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.achievementProfile.belongsTo(db.user, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

// User 1:N YearlyAchievement
db.user.hasMany(db.yearlyAchievement, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.yearlyAchievement.belongsTo(db.user, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

// YearlyAchievement 1:N ScientificInitiative
db.yearlyAchievement.hasMany(db.scientificInitiative, { foreignKey: 'yearly_achievement_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.scientificInitiative.belongsTo(db.yearlyAchievement, { foreignKey: 'yearly_achievement_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

// YearlyAchievement 1:N ScientificTopic
db.yearlyAchievement.hasMany(db.scientificTopic, { foreignKey: 'yearly_achievement_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.scientificTopic.belongsTo(db.yearlyAchievement, { foreignKey: 'yearly_achievement_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

// --- Nhóm Bổ trợ & Lịch trình ---

// User 1:N CutRice
db.user.hasMany(db.cutRice, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.cutRice.belongsTo(db.user, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

// Semester 1:N CutRice
db.semester.hasMany(db.cutRice, { as: 'cutRiceSchedules', foreignKey: { name: 'semesterId', field: 'semester_id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' });
db.cutRice.belongsTo(db.semester, { as: 'semesterInfo', foreignKey: { name: 'semesterId', field: 'semester_id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' });

// User/Semester 1:N CutRiceRequest
db.user.hasMany(db.cutRiceRequest, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.cutRiceRequest.belongsTo(db.user, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.semester.hasMany(db.cutRiceRequest, { as: 'cutRiceRequests', foreignKey: { name: 'semesterId', field: 'semester_id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.cutRiceRequest.belongsTo(db.semester, { as: 'semesterInfo', foreignKey: { name: 'semesterId', field: 'semester_id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.cutRiceRequest.belongsTo(db.user, { as: 'reviewer', foreignKey: { name: 'reviewedBy', field: 'reviewed_by' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' });

// User 1:N CommanderDutySchedule
db.user.hasMany(db.commanderDutySchedule, { as: 'dutySchedules', foreignKey: { name: 'userId', field: 'user_id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' });
db.commanderDutySchedule.belongsTo(db.user, { as: 'commander', foreignKey: { name: 'userId', field: 'user_id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' });

// User 1:N Notification
db.user.hasMany(db.notification, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.notification.belongsTo(db.user, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

// --- Nhóm Đề xuất ---

// User 1:N GradeRequest
db.user.hasMany(db.gradeRequest, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.gradeRequest.belongsTo(db.user, { foreignKey: 'user_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

// SubjectResult 1:N GradeRequest
db.subjectResult.hasMany(db.gradeRequest, { foreignKey: 'subject_result_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
db.gradeRequest.belongsTo(db.subjectResult, { foreignKey: 'subject_result_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

// User 1:N GradeRequest (reviewer)
db.user.hasMany(db.gradeRequest, { foreignKey: 'reviewer_id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });
db.gradeRequest.belongsTo(db.user, { as: 'reviewer', foreignKey: 'reviewer_id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });

module.exports = db;
