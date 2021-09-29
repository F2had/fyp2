const path = require('path');
const express = require('express');

const lecturerController = require(path.join(
  __dirname,
  '..',
  'controllers',
  'lecturer'
));

const uploadFile = require(path.join(__dirname, '..', 'routes', 'uploadFile'));

const router = express.Router();

router.get('/', (req, res, next) => {
  res.render(path.join(__dirname, '..', 'views', 'upload.ejs'), {
    title: 'Upload',
    user: req.session.user,
    error: req.flash('error'),
    success: req.flash('success'),
  });
});

router.post(
  '/lecturersList',
  uploadFile.single('file'),
  lecturerController.uploadList
);

module.exports = router;
