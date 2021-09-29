const path = require('path');
const express = require('express');
const feedbackController = require(path.join(
  __dirname,
  '..',
  'controllers',
  'feedback'
));
const { isPanel, isStudent } = require(path.join(
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

const { feedback1Sechma, feedback2Sechma } = require(path.join(
  __dirname,
  '..',
  'utils',
  'validationSchema'
));

const router = express.Router();

router.get('/1/:slotID/:panelID', isPanel, feedbackController.getFeedback1);

router.get('/2/:slotID/:panelID', isPanel, feedbackController.getFeedback2);

router.post(
  '/1',
  isPanel,
  validator(feedback1Sechma),
  feedbackController.Feedback1Post
);

router.post(
  '/2',
  isPanel,
  validator(feedback2Sechma),
  feedbackController.Feedback2Post
);

router.get('/feedback1/:id', isStudent, feedbackController.getFeedback1View);
router.get('/feedback2/:id', isStudent, feedbackController.getFeedback2View);

module.exports = router;
