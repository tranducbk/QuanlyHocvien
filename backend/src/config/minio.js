const Minio = require('minio');

const endPoint = process.env.MINIO_ENDPOINT || 'localhost';
const port = Number(process.env.MINIO_PORT || 9000);
const useSSL = process.env.MINIO_USE_SSL === 'true';
const accessKey = process.env.MINIO_ACCESS_KEY || 'student_manager';
const secretKey = process.env.MINIO_SECRET_KEY || 'student_manager_secret';
const bucket = process.env.MINIO_BUCKET || 'student-manager';
const publicBaseUrl = process.env.MINIO_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 6868}/api/files`;

const client = new Minio.Client({
  endPoint,
  port,
  useSSL,
  accessKey,
  secretKey,
});

module.exports = {
  client,
  bucket,
  publicBaseUrl,
};
