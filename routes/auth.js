const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');

const authController = require(path.join(
  __dirname,
  '..',
  'controllers',
  'auth'
));
const studentController = require(path.join(
  __dirname,
  '..',
  'controllers',
  'student'
));
const coordinatorController = require(path.join(
  __dirname,
  '..',
  'controllers',
  'coordinator'
));

const apiLimiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 20 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again after 20 minutes',
  handler: (req, res /*, next*/) => {
    req.flash(
      'error',
      'Too many requests from this IP, please try again after 20 minutes'
    );
    return res.status(401).redirect('back');
  },
});

const {
  registerStudentSchema,
  registerCoordinatorSchema,
  loginStudentSchema,
  loginLecturerSchema,
  passwordChangeSchema,
} = require(path.join(__dirname, '..', 'utils', 'validationSchema'));
const validator = require(path.join(
  __dirname,
  '..',
  'middleware',
  'validator'
));

const router = express.Router();

router.get('/login', apiLimiter, authController.getLogin);

router.get('/register', authController.getRegister);

router.post(
  '/register/student',
  apiLimiter,
  validator(registerStudentSchema),
  studentController.addNew
);

router.post(
  '/register/coordinator',
  apiLimiter,
  validator(registerCoordinatorSchema),
  coordinatorController.addCoordinator
);

router.get('/register/getSupervisorsList', authController.getSupervisorsList);

router.get('/forgot-password', apiLimiter, authController.getForgotPassowrd);

router.post('/forgot-password', apiLimiter, authController.resetPassword);

router.get('/reset-password/:role/:token', authController.getResetPassowrd);

router.post(
  '/reset-password',
  apiLimiter,
  validator(passwordChangeSchema),
  authController.postResetPassword
);

router.post(
  '/login/student',
  apiLimiter,
  validator(loginStudentSchema),
  authController.studentLoginAuth
);

router.post(
  '/login/coordinator',
  apiLimiter,
  validator(loginLecturerSchema),
  authController.coordinatorLoginAuth
);

router.post(
  '/login/panel',
  apiLimiter,
  validator(loginLecturerSchema),
  authController.panelLoginAuth
);

router.get('/logout', authController.getLogout);

module.exports = router;
