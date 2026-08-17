const multer = require('multer');
const { BadRequestError } = require('../utils/apiError');

const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isExcel = /\.(xlsx|xls)$/i.test(file.originalname);
    if (!isExcel) return cb(new BadRequestError('Chỉ chấp nhận file Excel .xlsx hoặc .xls'));
    return cb(null, true);
  },
});

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isImage = /^image\/(png|jpe?g|webp)$/i.test(file.mimetype);
    if (!isImage) return cb(new BadRequestError('Chỉ chấp nhận ảnh PNG, JPG, JPEG hoặc WEBP'));
    return cb(null, true);
  },
});

const uploadExcel = (fieldName = 'file') => (req, res, next) => {
  excelUpload.single(fieldName)(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return next(new BadRequestError('Dung lượng file tối đa là 5MB'));
    }
    return next(err);
  });
};

const uploadImage = (fieldName = 'file') => (req, res, next) => {
  imageUpload.single(fieldName)(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return next(new BadRequestError('Dung lượng ảnh tối đa là 2MB'));
    }
    return next(err);
  });
};

const evidenceUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isValid = /^image\/(png|jpe?g|webp)$/i.test(file.mimetype) || file.mimetype === 'application/pdf';
    if (!isValid) return cb(new BadRequestError('Chỉ chấp nhận ảnh (PNG, JPG, WEBP) hoặc PDF'));
    return cb(null, true);
  },
});

const uploadEvidence = (fieldName = 'file') => (req, res, next) => {
  evidenceUpload.single(fieldName)(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return next(new BadRequestError('Dung lượng file tối đa là 5MB'));
    }
    return next(err);
  });
};

module.exports = { uploadExcel, uploadImage, uploadEvidence };
