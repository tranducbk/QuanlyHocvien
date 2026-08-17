
module.exports = {
    HOST: process.env.DB_HOST || 'localhost',
    USER: process.env.DB_USER || 'admin',
    PASSWORD: process.env.DB_PASSWORD || '123456789',
    DB: process.env.DB_NAME || 'student_manager',
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_SSL === 'true',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
};
