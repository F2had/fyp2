const path = require('path');

const express = require('express');

const router = express.Router();

const lecturerController = require(path.join(
  __dirname,
  '..',
  'controllers',
  'lecturer'
));
const slotController = require(path.join(
  __dirname,
  '..',
  'controllers',
  'slot'
));
const {
  updatePasswordSchema,
  updateEmaildSchema,
  updateLecturerProfileSchema,
} = require(path.join(__dirname, '..', 'utils', 'validationSchema'));
const validator = require(path.join(
  __dirname,
  '..',
  'middleware',
  'validator'
));

const { isPanel } = require(path.join(
  __dirname,
  '..',
  'middleware',
  'is-auth'
));

router.get('/', isPanel, lecturerController.getPage);

router.get('/profile', isPanel, lecturerController.getProfile);

router.post('/', isPanel, slotController.addSlot);
router.post(
  '/updateProfile',
  isPanel,
  validator(updateLecturerProfileSchema),
  lecturerController.updateProfile
);
router.post(
  '/updateEmail',
  validator(updateEmaildSchema),
  isPanel,
  lecturerController.updateEmail
);
router.post(
  '/updatePassword',
  validator(updatePasswordSchema),
  isPanel,
  lecturerController.updatePassword
);
module.exports = router;
