const path = require('path');
const multer = require('multer');

const excelFilter = (req, file, cb) => {
  if (
    file.mimetype.includes('excel') ||
    file.mimetype.includes('spreadsheetml')
  ) {
    cb(null, true);
  } else {
    cb(null, false, req.fileValidationError);
  }
};

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()} - ${file.originalname}`);
  },
});

const uploadFile = multer({ storage: storage, fileFilter: excelFilter });

module.exports = uploadFile;
