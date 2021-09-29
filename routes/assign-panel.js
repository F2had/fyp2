const path = require('path');
const express = require('express');
const { Op } = require('sequelize');
const validator = require(path.join(
  __dirname,
  '..',
  'middleware',
  'validator'
));
const { isCoordinator } = require(path.join(
  __dirname,
  '..',
  'middleware',
  'is-auth'
));
const { Lecturer, Student } = require(path.join(
  __dirname,
  '..',
  'utils',
  'db'
));
const { assignPanelSchema } = require(path.join(
  __dirname,
  '..',
  'utils',
  'validationSchema'
));

const router = express.Router();

router.get('/', isCoordinator, (req, res, next) => {
  Lecturer.findAll({
    where: { department: req.session.user.department },
    order: ['name'],
  })
    .then((lecturers) => {
      return res.render(
        path.join(__dirname, '..', 'views', 'assign-panel.ejs'),
        {
          title: 'Assign Panel',
          lecturers: lecturers,
          user: req.session.user,
          error: req.flash('error'),
          success: req.flash('success'),
        }
      );
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
});

router.get('/getTitlesList', isCoordinator, (req, res, next) => {
  const supervisorId = req.query.supervisor;
  const titles = [];
  Lecturer.findOne({
    where: { id: supervisorId },
    include: {
      model: Student,
      attributes: ['title'],
    },
    order: ['name'],
  }).then((result) => {
    result
      .getStudents({
        where: {
          panel1Id: { [Op.eq]: null },
          panel2Id: { [Op.eq]: null },
        },
      })
      .then((students) => {
        students.map((student) => titles.push(student.title));
        uniq = [...new Set(titles)];
        res.send(uniq);
      })
      .catch((err) => {
        const error = new Error(err);
        next(error);
      });
  });
});

router.post(
  '/assign',
  isCoordinator,
  validator(assignPanelSchema),
  async (req, res, next) => {
    let title = req.body.title;
    let panel1 = req.body.panel1;
    let panel2 = req.body.panel2;
    let supervisor = req.body.supervisor;

    if (supervisor === panel1 || supervisor === panel2) {
      req.flash('error', `Supervisor can't be assigned as panel!'`);
      return res.redirect('back');
    }

    try {
      let students = await Student.findAll({
        where: { title: title },
      });

      if (students.length) {
        students.forEach((student) => {
          student.panel1Id = panel1;
          student.panel2Id = panel2;
          student.save();
        });
        req.flash('success', 'Panel assigned Successfully!');
        return res.redirect('back');
      } else {
        req.flash(
          'error',
          `An error occured while prcossing please try again!'`
        );
        return res.redirect('back');
      }
    } catch (err) {
      const error = new Error(err);
      next(error);
    }
  }
);

module.exports = router;
