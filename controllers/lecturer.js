const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const { DateTime } = require('luxon');
const { Op } = require('sequelize');
const { google } = require('calendar-link');

const readXlsxFile = require('read-excel-file/node');

const path = require('path');
const { Lecturer, Student, Slot, Feedback1, Feedback2 } = require(path.join(
  __dirname,
  '..',
  'utils',
  'db'
));

let prevMonth = DateTime.fromJSDate(new Date(), {
  zone: 'Asia/Kuala_Lumpur',
})
  .minus({ month: 1 })
  .toUTC()
  .toISO();

const getPage = async (req, res, next) => {
  try {
    const lecturer = await Lecturer.findOne({
      raw: true,
      where: {
        id: req.session.user.id,
      },
      include: {
        model: Student,
      },
    });

    const paneling = await Student.findAll({
      where: {
        [Op.or]: [{ panel1Id: lecturer.id }, { panel2Id: lecturer.id }],
      },
      attributes: ['name', 'id', 'title', 'email', 'fyp'],
      include: [{ model: Lecturer, as: 'supervisor', attributes: ['name'] }],
      raw: true,
    });

    const supervising = await Student.findAll({
      where: {
        supervisorId: lecturer.id,
      },
      attributes: ['name', 'id', 'title', 'email','fyp', 'phone'],
      raw: true,
    });

    const slots = await Slot.findAll({
      where: {
        [Op.or]: [{ panel1Id: lecturer.id }, { panel2Id: lecturer.id }],
        isDeclined: false,
        dateTo: {
          [Op.gte]: prevMonth,
        },
      },
      include: [
        { model: Lecturer, as: 'panel1' },
        { model: Lecturer, as: 'panel2' },
        {
          model: Student,
          include: [
            { model: Lecturer, as: 'supervisor', attributes: ['name'] },
          ],
        },
      ],
      order: ['dateFrom'],
      raw: true,
    });

    for (const slot of slots) {
      const event = {
        title: ` ${slot.type} for ${slot['student.name']} ${slot['student.id']}`,
        description: `Title: ${slot['student.title']} \n FYP:${slot['student.fyp']}`,
        start: DateTime.fromJSDate(slot.dateFrom, {
          zone: 'Asia/Kuala_Lumpur',
        }).toFormat('ff'),
        end: DateTime.fromJSDate(slot.dateTo, {
          zone: 'Asia/Kuala_Lumpur',
        }).toFormat('ff'),
        location: `${slot.venue}`,
      };
      slot.link = google(event);

      slot.dateFrom = DateTime.fromJSDate(slot.dateFrom, {
        zone: 'Asia/Kuala_Lumpur',
      }).toFormat('ccc ff');

      slot.dateTo = DateTime.fromJSDate(slot.dateTo, {
        zone: 'Asia/Kuala_Lumpur',
      }).toFormat('hh:mm a');

      const hasFeedback1 = await Feedback1.findAll({
        where: {
          slotId: slot.id,
          panelID: req.session.user.id,
        },
        raw: true,
      });

      const hasFeedback2 = await Feedback2.findAll({
        where: {
          slotId: slot.id,
          panelID: req.session.user.id,
        },
        raw: true,
      });

      if (hasFeedback1.length) {
        for (const i of hasFeedback1) {
          slot.hasFeedback = true;
        }
      } else {
        slot.hasFeedback1 = false;
      }

      if (hasFeedback2.length) {
        for (const i of hasFeedback2) {
          slot.hasFeedback = true;
        }
      } else {
        slot.hasFeedback2 = false;
      }
    }

    return res.render(
      path.join(__dirname, '..', 'views', 'users', 'panel.ejs'),
      {
        title: 'Panel',
        user: req.session.user,
        slots: slots,
        paneling: paneling,
        supervising: supervising,
        error: req.flash('error'),
        success: req.flash('success'),
      }
    );
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const uploadList = async (req, res, next) => {
  try {
    if (req.file == undefined) {
      req.flash('error', 'Please upload an excel file!');
      return res.status(400).redirect('/upload');
    }

    if (req.fileValidationError) {
      req.flash('error', 'Please upload an excel file only!');
      return res.status(400).redirect('/upload');
    }

    const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);

    readXlsxFile(filePath)
      .then((rows) => {
        // skip header
        rows.shift();
        let lecturers = [];

        rows.forEach((row) => {
          let lecturer = {
            name: row[0],
            email: row[1],
            department: row[2],
            password: crypto.randomBytes(64).toString('hex'),
          };

          lecturers.push(lecturer);
        });

        //Delete the exce file after
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });

        // Insert lecturers data to the database
        Lecturer.bulkCreate(lecturers)
          .then(() => {
            req.flash(
              'success',
              `Uploaded the file successfully:  ${req.file.originalname}`
            );
            return res.status(200).redirect('/upload');
          })
          .catch((err) => {
            const error = new Error(err);
            next(error);
          });
      })
      .catch((err) => {
        const error = new Error(err);
        next(error);
      });
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const getProfile = (req, res, next) => {
  Lecturer.findOne({
    where: {
      id: req.session.user.id,
    },
    raw: true,
  })
    .then((user) => {
      res.render(path.join(__dirname, '..', 'views', 'users', 'profile.ejs'), {
        title: 'Porfile',
        user: user,
        userRole: req.session.userRole,
        prevPage: 'panel',
        error: req.flash('error'),
        success: req.flash('success'),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};

const updateProfile = async (req, res, next) => {
  const name = req.body.name;
  try {
    const lecturer = await Lecturer.findOne({
      where: {
        id: req.session.user.id,
      },
    });

    lecturer.name = name;
    await lecturer.save();

    req.flash('success', 'Profile Updated!');
    return res.redirect('back');
  } catch (err) {
    const error = new Error(err);
    next(err);
  }
};

const updateEmail = async (req, res, next) => {
  const email = req.body.email;
  try {
    const lecturer = await Lecturer.findOne({
      where: { id: req.session.user.id },
    });

    const isEmailExsist = await Lecturer.findAll({
      where: {
        email: email,
      },
    });

    if (isEmailExsist.length) {
      req.flash('error', 'Email already exists!');
      return res.redirect('back');
    }

    lecturer.email = email;
    await lecturer.save();
    req.flash('success', 'Email Updated!');
    return res.redirect('back');
  } catch (err) {
    const error = new Error(err);
    next(err);
  }
};

const updatePassword = async (req, res, next) => {
  const password = req.body.password;
  const passwordCurrent = req.body.passwordCurrent;
  try {
    const lecturer = await Lecturer.findOne({
      where: { id: req.session.user.id },
    });

    let isMatched = await bcrypt.compare(passwordCurrent, lecturer.password);
    if (!isMatched) {
      req.flash('error', 'Current Password is Incorrect');
      return res.redirect('back');
    }
    const hashed = await bcrypt.hash(password, 12);

    lecturer.password = hashed;
    await lecturer.save();

    req.flash('success', 'Password Updated!');
    return res.redirect('back');
  } catch (err) {
    const error = new Error(err);
    next(err);
  }
};

module.exports = {
  uploadList,
  getProfile,
  updateProfile,
  updateEmail,
  updatePassword,
  getPage,
};
