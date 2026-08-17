const path = require('path');
const { client, bucket, publicBaseUrl } = require('../config/minio');
const { BadRequestError, NotFoundError } = require('../utils/apiError');

let bucketReadyPromise;

const ensureBucket = async () => {
  if (!bucketReadyPromise) {
    bucketReadyPromise = (async () => {
      const exists = await client.bucketExists(bucket);
      if (!exists) await client.makeBucket(bucket);
    })();
  }
  return bucketReadyPromise;
};

const getExtension = (fileName = '') => {
  const ext = path.extname(fileName).toLowerCase();
  return ext && ext.length <= 10 ? ext : '';
};

const buildObjectName = (folder, fileName) => {
  const ext = getExtension(fileName);
  const safeFolder = String(folder || 'files').replace(/^\/+|\/+$/g, '');
  return `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
};

const uploadBuffer = async ({ file, folder = 'files' }) => {
  if (!file) throw new BadRequestError('Vui lòng chọn file');
  await ensureBucket();

  const objectName = buildObjectName(folder, file.originalname);
  await client.putObject(bucket, objectName, file.buffer, file.size, {
    'Content-Type': file.mimetype,
  });

  return {
    bucket,
    objectName,
    url: `${publicBaseUrl}/${bucket}/${objectName}`,
    contentType: file.mimetype,
    size: file.size,
  };
};

const getObjectStream = async (bucketName, objectName) => {
  try {
    const [stream, stat] = await Promise.all([
      client.getObject(bucketName, objectName),
      client.statObject(bucketName, objectName),
    ]);
    return { stream, stat };
  } catch (error) {
    throw new NotFoundError('Không tìm thấy file');
  }
};

module.exports = {
  uploadBuffer,
  getObjectStream,
};
