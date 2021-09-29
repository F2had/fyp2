const path = require('path');

const express = require('express');
const router = express.Router();

const { isLoggedIn, isStudent, isCoordinator } = require(path.join(
  __dirname,
  '..',
  'middleware',
  'is-auth'
));

const validator = require(path.join(
  __dirname,
  '..',
  'middleware',
  'validator'
));

const {
  linkSchema,
  updateStudentProfileSchema,
  updateEmaildSchema,
  updatePasswordSchema,
} = require(path.join(__dirname, '..', 'utils', 'validationSchema'));

const studenController = require(path.join(
  __dirname,
  '..',
  'controllers',
  'student'
));

router.get('/', isStudent, studenController.getPage);

router.get('/profile', isStudent, studenController.getProfile);

router.post('/approve', isCoordinator, studenController.approve);

router.post(
  '/updateProfile',
  isStudent,
  validator(updateStudentProfileSchema),
  studenController.updateProfile
);

router.post(
  '/updatePassword',
  isStudent,
  validator(updatePasswordSchema),
  studenController.updatePassword
);

router.post(
  '/updateEmail',
  isStudent,
  validator(updateEmaildSchema),
  studenController.updateEmail
);

router.post('/delete', isCoordinator, studenController.deleteStudent);
router.post(
  '/addLink',
  isStudent,
  validator(linkSchema),
  studenController.addLink
);
router.get(
  '/getStudentforPanel',
  isCoordinator,
  studenController.getStudentforPanel
);

router.post(
  '/getPanel',
  isCoordinator,
  studenController.getPanel
);
module.exports = router;
