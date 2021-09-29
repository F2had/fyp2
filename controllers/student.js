const path = require('path');
const bcrypt = require('bcryptjs');
const { Lecturer, Student, Slot, Feedback1, Feedback2 } = require(path.join(
  __dirname,
  '..',
  'utils',
  'db'
));
const { Op } = require('sequelize');
const nodemailer = require(path.join(__dirname, '..', 'utils', 'nodemailer'));
const { google, ics } = require('calendar-link');
const { DateTime } = require('luxon');


const getPage = async (req, res, next) => {
  const feedbacks = [];
  try {
    let slots = await Slot.findAll({
      where: {
        studentId: req.session.user.id,
      },
      include: [{ model: Student, required: true }],
      raw: true,
    });

    let student = await Student.findOne({
      where: {
        id: req.session.user.id,
      },
    });

    for (const slot of slots) {
      const event = {
        title: `Meeting for ${slot.type}`,
        description: `Meeting with panel for ${slot.type}`,
        start: DateTime.fromJSDate(slot.dateFrom, {
          zone: 'Asia/Kuala_Lumpur',
        }).toFormat('ff'),
        end: DateTime.fromJSDate(slot.dateTo, {
          zone: 'Asia/Kuala_Lumpur',
        }).toFormat('ff'),
      };
      slot.link = google(event);
      slot.dateFrom = DateTime.fromJSDate(slot.dateFrom, {
        zone: 'Asia/Kuala_Lumpur',
      }).toFormat('ccc ff');
      slot.dateTo = DateTime.fromJSDate(slot.dateTo, {
        zone: 'Asia/Kuala_Lumpur',
      }).toFormat('hh:mm a');

      let feedback1 = await Feedback1.findOne({
        where: {
          slotId: slot.id,
        },
      });

      let feedback2 = await Feedback2.findOne({
        where: {
          slotId: slot.id,
        },
      });
      if (feedback1) {
        feedback1.panel = await Lecturer.findOne({
          where: {
            id: feedback1.panelID,
          },
        });
        feedback1.FYP = 1;
        feedbacks.push(feedback1);
      }
      if (feedback2) {
        feedback2.panel = await Lecturer.findOne({
          where: {
            id: feedback2.panelID,
          },
        });
        feedback2.FYP = 2;
        feedbacks.push(feedback2);
      }
    }
    res.render(path.join(__dirname, '..', 'views', 'users', 'student.ejs'), {
      title: 'Student',
      user: req.session.user,
      slots: slots,
      student: student,
      feedbacks: feedbacks,
    });
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  const name = req.body.name;
  const phone = req.body.phone;
  try {
    const student = await Student.findOne({
      where: { id: req.session.user.id },
    });

    student.name = name;
    student.phone = phone;
    await student.save();
    req.flash('success', 'Profile Updated!');

    return res.redirect('back');
  } catch (err) {
    const error = new Error(err);
    next(err);
  }
};

const getPanel = async (req, res, next) => {
  let studentID = req.body.studentID;
  let student = await Student.findOne({
    where: {
      id: studentID,
      department: req.session.user.department,
    },
    include: [
      {
        model: Lecturer,
        as: 'panel1',
        attributes: ['name'],
      },
      {
        model: Lecturer,
        as: 'panel2',
        attributes: ['name'],
      },
    ],
    attributes: ['name'],
  });

  return res.send({ panel1: student.panel1.name, panel2: student.panel2.name });
};
const updatePassword = async (req, res, next) => {
  const password = req.body.password;
  const passwordCurrent = req.body.passwordCurrent;
  try {
    const student = await Student.findOne({
      where: { id: req.session.user.id },
    });

    let isMatched = await bcrypt.compare(passwordCurrent, student.password);
    if (!isMatched) {
      req.flash('error', 'Current Password is Incorrect');
      return res.redirect('back');
    }

    const hashed = await bcrypt.hash(password, 12);

    student.password = hashed;
    await student.save();

    req.flash('success', 'Password Updated!');

    return res.redirect('back');
  } catch (err) {
    const error = new Error(err);
    next(err);
  }
};

const updateEmail = async (req, res, next) => {
  const email = req.body.email;
  try {
    
    const student = await Student.findOne({
      where: { id: req.session.user.id },
    });

    const isEmailExsist = await Student.findAll({
      where: {
        email: email,
      },
    });

    if (isEmailExsist.length) {
      req.flash('error', 'Email already exists!');
      return res.redirect('back');
    }

    student.email = email;
    await student.save();
    req.flash('success', 'Email Updated!');
    return res.redirect('back');
  } catch (err) {
    const error = new Error(err);
    next(err);
  }
};
const addNew = (req, res, next) => {
  const supervisorId = req.body.supervisor;
  const name = req.body.name;
  const id = req.body.id;
  const title = req.body.title;
  const department = req.body.department;
  const email = req.body.email;
  const fyp = req.body.fyp;
  const phone = req.body.phone;
  const password = req.body.password;

  Student.findOne({
    where: {
      [Op.or]: [{ id: id }, { email: email }],
    },
  })
    .then((student) => {
      if (student) {
        req.flash('error', 'Student already exists');
        return res.redirect('/register');
      }

      return bcrypt
        .hash(password, 12)
        .then((hashed) => {
          Student.create({
            name: name,
            id: id,
            title: title,
            department: department,
            email: email,
            password: hashed,
            phone: phone,
            fyp: fyp,
            supervisorId: supervisorId,
          })
            .then(() => {
              req.flash('success', 'Account created successfully!');
              res.redirect('back');
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
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};

const approve = (req, res, next) => {
  const id = req.body.id;
  let email = '';

  Student.findOne({
    where: {
      id: id,
    },
  })
    .then((student) => {
      const email = student.email;
      const name = student.name;
      return student
        .update({
          approved: true,
        })
        .then((result) => {
          const URL = req.protocol + '://' + req.get('host') + `/login`;
          nodemailer.sendMail(
            email,
            'Account approved!',
            `Hello, ${name}! Your coordinator approved your account you can now login to your account!</p>
            <br>  <div class="btn btn--flat btn--large" style="Margin-bottom: 20px;text-align: center;">
            <![if !mso]><a style="border-radius: 4px;display: inline-block;font-size: 14px;font-weight: bold;line-height: 24px;padding: 12px 24px;text-align: center;text-decoration: none !important;transition: opacity 0.1s ease-in;color: #ffffff !important;background-color: #502682;font-family: sans-serif;" href="${URL}">Login</a><![endif]>
            <!--[if mso]><p style="line-height:0;margin:0;">&nbsp;</p><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${URL}" style="width:137px" arcsize="9%" fillcolor="#502682" stroke="f"><v:textbox style="mso-fit-shape-to-text:t" inset="0px,11px,0px,11px"><center style="font-size:14px;line-height:24px;color:#FFFFFF;font-family:sans-serif;font-weight:bold;mso-line-height-rule:exactly;mso-text-raise:4px">Register Now</center></v:textbox></v:roundrect><![endif]--></div></div>`
          );
          return res.send({ success: `Approved Successfully!` });
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
};

const deleteStudent = async (req, res, next) => {
  const id = req.body.id;

  await Slot.destroy({
    where: {
      studentId: id,
    },
  });
  Student.destroy({
    where: {
      id: id,
    },
  })
    .then((result) => {
      req.flash('success', 'Deleted Successfully!');
      return res.redirect('back');
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};

const getProfile = (req, res, next) => {
  Student.findOne({
    where: {
      id: req.session.user.id,
    },
    raw: true,
  })
    .then((user) => {
      res.render(
        path.join(__dirname, '..', 'views', 'users', 'studentProfile.ejs'),
        {
          title: 'Porfile',
          user: user,
          prevPage: 'student',
          error: req.flash('error'),
          success: req.flash('success'),
        }
      );
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};

const getStudentforPanel = async (req, res, next) => {
  const panel1 = req.query.panel1;
  const panel2 = req.query.panel2;
  const fyp = req.query.fyp;
  let students;

  if (fyp === 'both') {
    students = await Student.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [{ panel1Id: panel1 }, { panel2Id: panel1 }],
          },
          {
            [Op.or]: [{ panel1Id: panel2 }, { panel2Id: panel2 }],
          },
        ],
        approved: true,
      },
      attributes: ['name', 'id'],
      order: ['name'],
      raw: true,
    });
  } else {
    students = await Student.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [{ panel1Id: panel1 }, { panel2Id: panel1 }],
          },
          {
            [Op.or]: [{ panel1Id: panel2 }, { panel2Id: panel2 }],
          },
          { fyp: fyp },
        ],
        approved: true,
      },
      attributes: ['name', 'id'],
      order: ['name'],
      raw: true,
    });
  }
 
  return res.send(students);
};

const addLink = async (req, res, next) => {
  const driveLink = req.body.driveLink;
  const meetingLink = req.body.meetingLink;

  try {
    const student = await Student.findOne({
      where: {
        id: req.session.user.id,
      },
    });

    student.driveLink = driveLink;
    student.meetingLink = meetingLink;
    student.save();
    req.flash('success', 'Links updated');
    res.redirect('back');
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

module.exports = {
  getPage,
  addNew,
  updateProfile,
  updatePassword,
  updateEmail,
  addLink,
  approve,
  deleteStudent,
  getProfile,
  getStudentforPanel,
  getPanel,
};
