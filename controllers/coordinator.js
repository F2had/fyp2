const bcrypt = require('bcryptjs');

const path = require('path');
const { Op } = require('sequelize');
const { DateTime } = require('luxon');
const nodemailer = require(path.join(__dirname, '..', 'utils', 'nodemailer'));
const { Student, Lecturer, Slot, Coordinator } = require(path.join(
  __dirname,
  '..',
  'utils',
  'db'
));

const addCoordinator = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const department = req.body.department;
  const password = req.body.password;

  Coordinator.findOne({
    where: {
      email: email,
    },
  })
    .then((coordinator) => {
      if (coordinator) {
        req.flash('error', 'Coordinator already exists');
        return res.redirect('/register');
      }

      return bcrypt
        .hash(password, 12)
        .then((hashed) => {
          Coordinator.create({
            name: name,
            department: department,
            email: email,
            password: hashed,
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

const getPage = async (req, res, next) => {
  try {
    let today = DateTime.fromJSDate(new Date(), {
      zone: 'Asia/Kuala_Lumpur',
    })
      .toUTC()
      .toISO();
    const students = await Student.findAll({
      where: {
        department: req.session.user.department,
      },
      include: [
        {
          model: Lecturer,
          as: 'supervisor',
          attributes: ['name'],
        },
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
      order: ['name'],
      raw: true,
    });

    const slots = await Slot.findAll({
      where: {
        '$student.department$': req.session.user.department,
        dateFrom: {
          [Op.gte]: today,
        },
      },
      include: [
        {
          model: Student,
          required: true,
          include: [
            {
              model: Lecturer,
              as: 'supervisor',
              attributes: ['name'],
            },
          ],
        },
        {
          model: Lecturer,
          as: 'panel1',
          required: true,
        },
        {
          model: Lecturer,
          as: 'panel2',
          required: true,
        },
      ],
      order: ['type'],
    });

    for (const slot of slots) {
      if (slot.isDeclined) {
        const declinedByName = await Lecturer.findOne({
          where: {
            id: slot.declinedBy,
          },
          attributes: ['name'],
        });

        slot.declinedByName = declinedByName.name;
      }
    }

    let lecturers = await Lecturer.findAll({
      where: {
        department: req.session.user.department,
      },
      attributes: ['name', 'email', 'id'],
    });

    for (const lecturer of lecturers) {
      const supervisingCount = await Student.count({
        where: {
          supervisorId: lecturer.id,
        },
      });

      const panelingCount = await Student.count({
        where: {
          [Op.or]: [
            {
              panel1Id: lecturer.id,
            },
            {
              panel2Id: lecturer.id,
            },
          ],
        },
      });

      lecturer.supervisingCount = supervisingCount;
      lecturer.panelingCount = panelingCount;
    }

    res
      .status(200)
      .render(path.join(__dirname, '..', 'views', 'users', 'coordinator.ejs'), {
        title: 'Coordinator',
        user: req.session.user,
        students: students,
        slots: slots,
        lecturers: lecturers,
        error: req.flash('error'),
        success: req.flash('success'),
      });
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const getProfile = (req, res, next) => {
  Coordinator.findOne({
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
        prevPage: 'coordinator',
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
    const coordinator = await Coordinator.findOne({
      where: {
        id: req.session.user.id,
      },
    });

    coordinator.name = name;
    await coordinator.save();

    req.flash('success', 'Profile Updated!');
    return res.redirect('back');
  } catch (err) {
    const error = new Error(err);
    next(err);
  }
};
const approve = (req, res, next) => {
  const id = req.body.id;
  let email = '';

  Coordinator.findOne({
    where: {
      id: id,
    },
  })
    .then((coordinator) => {
      email = coordinator.email;
      coordinator
        .update({
          approved: true,
        })

        .then((result) => {
          const URL = req.protocol + '://' + req.get('host') + `/login`;
          req.flash('success', 'Approved Successfully!');
          res.redirect('back');
          nodemailer.sendMail(
            email,
            'Account approved!',
            `Admin approved your account. You can login to the system. <br>  <div class="btn btn--flat btn--large" style="Margin-bottom: 20px;text-align: center;">
            <![if !mso]><a style="border-radius: 4px;display: inline-block;font-size: 14px;font-weight: bold;line-height: 24px;padding: 12px 24px;text-align: center;text-decoration: none !important;transition: opacity 0.1s ease-in;color: #ffffff !important;background-color: #502682;font-family: sans-serif;" href="${URL}">Login</a><![endif]>
          <!--[if mso]><p style="line-height:0;margin:0;">&nbsp;</p><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${URL}" style="width:137px" arcsize="9%" fillcolor="#502682" stroke="f"><v:textbox style="mso-fit-shape-to-text:t" inset="0px,11px,0px,11px"><center style="font-size:14px;line-height:24px;color:#FFFFFF;font-family:sans-serif;font-weight:bold;mso-line-height-rule:exactly;mso-text-raise:4px">Register Now</center></v:textbox></v:roundrect><![endif]--></div>
        </div>`
          );
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

const studentController = async (req, res, next) => {
  try {
    const students = await Student.findAll({
      where: {
        department: req.session.user.department,
      },
      include: [
        {
          model: Lecturer,
          as: 'supervisor',
          attributes: ['name', 'id'],
        },
        {
          model: Lecturer,
          as: 'panel1',
          attributes: ['name', 'id'],
        },
        {
          model: Lecturer,
          as: 'panel2',
          attributes: ['name', 'id'],
        },
      ],
      order: ['name'],
      raw: true,
    });

    res.render(path.join(__dirname, '..', 'views', 'student-controller.ejs'), {
      title: 'Student controller',
      user: req.session.user,
      students: students,
      // slots: slots,
      error: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const getUpdateSupervisor = async (req, res, next) => {
  const studentID = req.params.id;

  try {
    const student = await Student.findOne({
      where: {
        id: studentID,
      },
      include: [
        {
          model: Lecturer,
          as: 'supervisor',
        },
      ],
    });

    const lecturers = await Lecturer.findAll({
      where: {
        id: {
          [Op.ne]: student.supervisorId,
        },
        department: req.session.user.department,
      },
      order: ['name'],
    });

    return res.render(
      path.join(__dirname, '..', 'views', 'update-supervisor.ejs'),
      {
        title: 'Update supervisor',
        user: req.session.user,
        student: student,
        lecturers: lecturers,
        error: req.flash('error'),
        success: req.flash('success'),
      }
    );
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const updateSupervisor = async (req, res, next) => {
  const studentID = req.body.studentID;
  const supervisorID = req.body.supervisor;
  try {
    const student = await Student.findOne({
      where: {
        id: studentID,
      },
    });

    student.supervisorId = supervisorID;
    student.save();
    req.flash('success', 'Updated!');
    return res.redirect('back');
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const getUpdatePanel1 = async (req, res, next) => {
  const studentID = req.params.id;

  try {
    const student = await Student.findOne({
      where: {
        id: studentID,
      },
      include: [
        {
          model: Lecturer,
          as: 'panel1',
        },
      ],
    });

    const lecturers = await Lecturer.findAll({
      where: {
        id: {
          [Op.notIn]: [
            student.supervisorId,
            student.panel1Id,
            student.panel2Id,
          ],
        },
        department: req.session.user.department,
      },
      order: ['name'],
    });

    return res.render(
      path.join(__dirname, '..', 'views', 'update-panel1.ejs'),
      {
        title: 'Update Panel 1',
        user: req.session.user,
        student: student,
        lecturers: lecturers,
        error: req.flash('error'),
        success: req.flash('success'),
      }
    );
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const updatePanel1 = async (req, res, next) => {
  const studentID = req.body.studentID;
  const panel1ID = req.body.panel1;
  let today = DateTime.fromJSDate(new Date(), {
    zone: 'Asia/Kuala_Lumpur',
  })
    .toUTC()
    .toUTC();
  try {
    let slotsa = await Slot.destroy({
      where: {
        studentId: studentID,
        dateFrom: {
          [Op.gte]: today,
        },
      },
    });

    const student = await Student.findOne({
      where: {
        id: studentID,
      },
    });

    student.panel1Id = panel1ID;
    student.save();
    req.flash('success', 'Updated!');
    return res.redirect('back');
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const getUpdatePanel2 = async (req, res, next) => {
  const studentID = req.params.id;

  try {
    const student = await Student.findOne({
      where: {
        id: studentID,
      },
      include: [
        {
          model: Lecturer,
          as: 'panel2',
        },
      ],
    });

    const lecturers = await Lecturer.findAll({
      where: {
        id: {
          [Op.notIn]: [
            student.supervisorId,
            student.panel1Id,
            student.panel2Id,
          ],
        },
        department: req.session.user.department,
      },
      order: ['name'],
    });

    return res.render(
      path.join(__dirname, '..', 'views', 'update-panel2.ejs'),
      {
        title: 'Update Panel 2',
        user: req.session.user,
        student: student,
        lecturers: lecturers,
        error: req.flash('error'),
        success: req.flash('success'),
      }
    );
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const updatePanel2 = async (req, res, next) => {
  const studentID = req.body.studentID;
  const panel2ID = req.body.panel2;
  let today = DateTime.fromJSDate(new Date(), {
    zone: 'Asia/Kuala_Lumpur',
  })
    .toUTC()
    .toUTC();
  try {
    await Slot.destroy({
      where: {
        studentId: studentID,
        dateFrom: {
          [Op.gte]: today,
        },
      },
    });
    const student = await Student.findOne({
      where: {
        id: studentID,
      },
    });

    student.panel2Id = panel2ID;
    student.save();
    req.flash('success', 'Updated!');
    return res.redirect('back');
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const getUpdateFYP = async (req, res, next) => {
  const studentID = req.params.id;

  try {
    const student = await Student.findOne({
      where: {
        id: studentID,
      },
    });

    return res.render(path.join(__dirname, '..', 'views', 'update-fyp.ejs'), {
      title: 'Update FYP',
      user: req.session.user,
      student: student,
      error: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const updateFYP = async (req, res, next) => {
  const studentID = req.body.studentID;
  const fyp = req.body.fyp;
  try {
    const student = await Student.findOne({
      where: {
        id: studentID,
      },
    });

    student.fyp = fyp;
    student.save();
    req.flash('success', 'Updated!');
    return res.redirect('back');
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const updateEmail = async (req, res, next) => {
  const email = req.body.email;
  try {
    const coordinator = await Coordinator.findOne({
      where: {
        id: req.session.user.id,
      },
    });

    const isEmailExsist = await Coordinator.findAll({
      where: {
        email: email,
      },
    });

    if (isEmailExsist.length) {
      req.flash('error', 'Email already exists!');
      return res.redirect('back');
    }

    coordinator.email = email;
    await coordinator.save();
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
    const coordinator = await Coordinator.findOne({
      where: {
        id: req.session.user.id,
      },
    });
    let isMatched = await bcrypt.compare(passwordCurrent, coordinator.password);
    if (!isMatched) {
      req.flash('error', 'Current Password is Incorrect');
      return res.redirect('back');
    }
    const hashed = await bcrypt.hash(password, 12);

    coordinator.password = hashed;
    await coordinator.save();

    req.flash('success', 'Password Updated!');
    return res.redirect('back');
  } catch (err) {
    const error = new Error(err);
    next(err);
  }
};

const promote = async (req, res, next) => {
  const id = req.body.id;
  try {
    let coordiantor = await Coordinator.findOne({
      where: {
        id: id,
      },
    });

    coordiantor.isAdmin = 1;
    await coordiantor.save();
    req.flash('success', 'Promoted!');
    return res.redirect('back');
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const demote = async (req, res, next) => {
  const id = req.body.id;
  try {
    let coordiantor = await Coordinator.findOne({
      where: {
        id: id,
      },
    });

    coordiantor.isAdmin = 0;
    await coordiantor.save();
    req.flash('success', 'Demoted!');
    return res.redirect('back');
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const deleteCoordinator = async (req, res, next) => {
  const id = req.body.id;
  try {
    let toBeDeleted = await Coordinator.findOne({
      where: {
        id: id,
      },
    });

    await toBeDeleted.destroy();
    req.flash('success', 'Deleted!');
    return res.redirect('back');
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const deleteLecturer = async (req, res, next) => {
  const id = req.body.id;
  try {
    let toBeDeleted = await Lecturer.findOne({
      where: {
        id: id,
      },
    });
    await Slot.destroy({
      where: {
        [Op.or]: [{ panel1Id: toBeDeleted.id }, { panel2Id: toBeDeleted.id }],
      },
    });

    await toBeDeleted.destroy();
    req.flash('success', 'Deleted!');
    return res.redirect('back');
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

module.exports = {
  addCoordinator,
  getPage,
  studentController,
  approve,
  getUpdateSupervisor,
  updateSupervisor,
  getUpdatePanel1,
  getUpdatePanel2,
  updatePanel1,
  updatePanel2,
  getUpdateFYP,
  updateFYP,
  getProfile,
  updateProfile,
  updateEmail,
  updatePassword,
  promote,
  demote,
  deleteLecturer,
  deleteCoordinator,
};
