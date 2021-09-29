const path = require('path');
const express = require('express');
const { Op } = require('sequelize');

const { Coordinator, Lecturer } = require(path.join(
  __dirname,
  '..',
  'utils',
  'db'
));
const { isAdmin } = require(path.join(
  __dirname,
  '..',
  'middleware',
  'is-auth'
));
const coordinatorController = require(path.join(
  __dirname,
  '..',
  'controllers',
  'coordinator'
));

const router = express.Router();

router.get('/', isAdmin, async (req, res, next) => {
  try {
    const coordinators = await Coordinator.findAll({
      where: {
        id: {
          [Op.ne]: req.session.user.id,
        },
      },
    });

    const lecturers = await Lecturer.findAll();

    res.render(path.join(__dirname, '..', 'views', 'users', 'admin.ejs'), {
      title: 'Admin',
      coordinators: coordinators,
      lecturers: lecturers,
      user: req.session.user,
      error: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
});

router.post('/promote', isAdmin, coordinatorController.promote);
router.post('/demote', isAdmin, coordinatorController.demote);
router.post('/delete', isAdmin, coordinatorController.deleteCoordinator);
module.exports = router;
