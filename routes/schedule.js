const path = require('path');

const express = require('express');
const router = express.Router();

const { slotSchema, updateSlotSchema, timetableSchema } = require(path.join(
  __dirname,
  '..',
  'utils',
  'validationSchema'
));
const validator = require(path.join(
  __dirname,
  '..',
  'middleware',
  'validator'
));

const { isLoggedIn, isCoordinator, isPanel } = require(path.join(
  __dirname,
  '..',
  'middleware',
  'is-auth'
));

const timeTableController = require(path.join(
  __dirname,
  '..',
  'controllers',
  'time-table'
));

const slotController = require(path.join(
  __dirname,
  '..',
  'controllers',
  'slot'
));

router.get('/', isCoordinator, slotController.getSchedulePage);

router.post('/', isCoordinator, slotController.addSlot);

router.post('/approveSlot', isPanel, slotController.approveSlot);

router.post('/declineSlot', isPanel, slotController.declineSlot);

router.post('/deleteSlot', isCoordinator, slotController.deleteSlot);

router.get('/update/:slotID', isCoordinator, slotController.getUdateSlot);

router.post(
  '/update',
  isCoordinator,
  validator(updateSlotSchema),
  slotController.updateSlot
);

router.post('/generate', isCoordinator, timeTableController.generateTimeTable);

router.post('/generate/insert', isCoordinator, timeTableController.insertSlots);

module.exports = router;
