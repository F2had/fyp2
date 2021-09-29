const path = require('path');
const express = require('express');

const coordinatorController = require(path.join(
  __dirname,
  '..',
  'controllers',
  'coordinator'
));

const validator = require(path.join(
  __dirname,
  '..',
  'middleware',
  'validator'
));

const {
  updatePasswordSchema,
  updateEmaildSchema,
  updateCoordinatorProfileSchema,
} = require(path.join(__dirname, '..', 'utils', 'validationSchema'));
const { isCoordinator, isAdmin } = require(path.join(
  __dirname,
  '..',
  'middleware',
  'is-auth'
));

const router = express.Router();

router.get('/', isCoordinator, coordinatorController.getPage);

router.get('/profile', isCoordinator, coordinatorController.getProfile);
router.post(
  '/updateProfile',
  isCoordinator,
  validator(updateCoordinatorProfileSchema),
  coordinatorController.updateProfile
);
router.post(
  '/updateEmail',
  validator(updateEmaildSchema),
  isCoordinator,
  coordinatorController.updateEmail
);
router.post(
  '/updatePassword',
  validator(updatePasswordSchema),
  isCoordinator,
  coordinatorController.updatePassword
);

router.post('/approve', isCoordinator, coordinatorController.approve);

router.get(
  '/student-controller',
  isCoordinator,
  coordinatorController.studentController
);

router.get(
  '/supervisor/update/:id(*)',
  isCoordinator,
  coordinatorController.getUpdateSupervisor
);
router.post(
  '/updateSupervisor',
  isCoordinator,
  coordinatorController.updateSupervisor
);

router.post('/delete', isAdmin, coordinatorController.deleteCoordinator);

router.post('/deleteLecturer', isAdmin, coordinatorController.deleteLecturer);

router.get(
  '/panel1/update/:id(*)',
  isCoordinator,
  coordinatorController.getUpdatePanel1
);
router.post('/updatePanel1', isCoordinator, coordinatorController.updatePanel1);

router.get(
  '/panel2/update/:id(*)',
  isCoordinator,
  coordinatorController.getUpdatePanel2
);
router.post('/updatePanel2', isCoordinator, coordinatorController.updatePanel2);

router.get(
  '/fyp/update/:id(*)',
  isCoordinator,
  coordinatorController.getUpdateFYP
);
router.post('/updateFYP', isCoordinator, coordinatorController.updateFYP);

module.exports = router;
