const path = require('path');
const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const nodemailer = require(path.join(__dirname, '..', 'utils', 'nodemailer'));
const { Lecturer, Student, Coordinator } = require(path.join(
  __dirname,
  '..',
  'utils',
  'db'
));

const departments = [
  'Information Systems',
  'Software Engineering',
  'Artificial Intelligence',
  'Computer System and Network',
  'Multimedia',
  'Data Science',
];

const hour = 3600000;

const getLogin = (req, res, next) => {
  if (req.session.isLoggedIn) return res.redirect('back');
  res.render(path.join(__dirname, '..', 'views', 'auth', 'login.ejs'), {
    title: 'Login',
    error: req.flash('error'),
    warning: req.flash('warning'),
    success: req.flash('success'),
  });
};

const getRegister = (req, res, next) => {
  let body = req.flash('body');
  if (body.length) {
    body = body[0];
  }
  res.render(path.join(__dirname, '..','views', 'auth', 'register.ejs'), {
    title: 'Register',
    departments: departments,
    error: req.flash('error'),
    success: req.flash('success'),
    body: body,
  });
};

const getSupervisorsList = (req, res, next) => {
  const dep = req.query.department;

  Lecturer.findAll({
    where: {
      department: dep,
    },
    attributes: ['name', 'id'],
    order: ['name'],
    raw: true,
  })
    .then((lecturers) => {
      const supervisors = [];
      lecturers.map((lecturer) => supervisors.push(lecturer));
      res.send(supervisors);
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};

const getForgotPassowrd = (req, res, next) => {
  res.render(
    path.join(__dirname, '..', 'views', 'auth', 'forgot-password.ejs'),
    {
      title: 'Forgot Password',
      error: req.flash('error'),
      success: req.flash('success'),
    }
  );
};

const getResetPassowrd = (req, res, next) => {
  const role = req.params.role;
  const token = req.params.token;

  if (role === 'coordinator') {
    Coordinator.findOne({
      where: {
        resetToken: token,
        resetTokenExpiration: { [Op.gt]: Date.now() },
      },
    })
      .then((user) => {
        if (!user) {
          req.flash('error', 'Invalid or expired token');
          return res.redirect('back');
        }
        res.render(
          path.join(__dirname, '..', 'views', 'auth', 'reset-password.ejs'),
          {
            title: 'Reset Password',
            userId: user.id,
            role: role,
            error: req.flash('error'),
            token: token,
          }
        );
      })
      .catch((err) => {
        const error = new Error(err);
        next(error);
      });
  } else if (role === 'student') {
    Student.findOne({
      where: {
        resetToken: token,
        resetTokenExpiration: { [Op.gt]: Date.now() },
      },
    })
      .then((user) => {
        if (!user) {
          req.flash('error', 'Invalid or expired token');
          return res.redirect('back');
        }
        res.render(
          path.join(__dirname, '..', 'views', 'auth', 'reset-password.ejs'),
          {
            title: 'Reset Password',
            userId: user.id,
            role: role,
            error: req.flash('error'),
            token: token,
          }
        );
      })
      .catch((err) => {
        const error = new Error(err);
        next(error);
      });
  } else if (role === 'panel') {
    Lecturer.findOne({
      where: {
        resetToken: token,
        resetTokenExpiration: { [Op.gt]: Date.now() },
      },
    })
      .then((user) => {
        if (!user) {
          req.flash('error', 'Invalid or expired token');
          return res.redirect('back');
        }
        res.render(
          path.join(__dirname, '..', 'views', 'auth', 'reset-password.ejs'),
          {
            title: 'Reset Password',
            userId: user.id,
            role: role,
            error: req.flash('error'),
            token: token,
          }
        );
      })
      .catch((err) => {
        const error = new Error(err);
        next(error);
      });
  } else {
    res.redirect('back');
  }
};

const postResetPassword = (req, res, next) => {
  const password = req.body.password;
  const role = req.body.role;
  const token = req.body.token;
  const id = req.body.id;
  let userReset;

  if (role === 'coordinator') {
    Coordinator.findOne({
      where: {
        id: id,
        resetToken: token,
        resetTokenExpiration: { [Op.gt]: Date.now() },
      },
    })
      .then((user) => {
        userReset = user;
        return bcrypt.hash(password, 12);
      })
      .then((hashed) => {
        return userReset
          .update({
            password: hashed,
            resetToken: null,
            resetTokenExpiration: null,
          })
          .then((result) => {
            req.flash('success', 'Password update!');
            return res.redirect('/login');
          });
      })
      .catch((err) => {
        const error = new Error(err);
        next(error);
      });
  }

  if (role === 'student') {
    Student.findOne({
      where: {
        id: id,
        resetToken: token,
        resetTokenExpiration: { [Op.gt]: Date.now() },
      },
    })
      .then((user) => {
        userReset = user;
        return bcrypt.hash(password, 12);
      })
      .then((hashed) => {
        return userReset
          .update({
            password: hashed,
            resetToken: null,
            resetTokenExpiration: null,
          })
          .then((result) => {
            req.flash('success', 'Password update!');
            return res.redirect('/login');
          });
      })

      .catch((err) => {
        const error = new Error(err);
        next(error);
      });
  }

  if (role === 'panel') {
    Lecturer.findOne({
      where: {
        id: id,
        resetToken: token,
        resetTokenExpiration: { [Op.gt]: Date.now() },
      },
    })
      .then((user) => {
        userReset = user;
        return bcrypt.hash(password, 12);
      })
      .then((hashed) => {
        return userReset
          .update({
            password: hashed,
            resetToken: null,
            resetTokenExpiration: null,
          })
          .then((result) => {
            req.flash('success', 'Password update!');
            return res.redirect('/login');
          });
      })
      .catch((err) => {
        const error = new Error(err);
        next(error);
      });
  }
};

const studentLoginAuth = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  Student.findOne({
    where: {
      [Op.or]: [{ id: email }, { email: email }],
    },
    include: [
      { model: Lecturer, as: 'supervisor', attributes: ['name', 'id'] },
      { model: Lecturer, as: 'panel1', attributes: ['name', 'id'] },
      { model: Lecturer, as: 'panel2', attributes: ['name', 'id'] },
    ],
    raw: true,
  })
    .then((user) => {
      if (!user) {
        req.flash('error', 'User does not exists!');
        return res.redirect('back');
      }

      bcrypt.compare(password, user.password, (err, isMatched) => {
        if (isMatched) {
          if (!user.approved) {
            req.flash(
              'warning',
              'Account not yet approved by your department coordinator!'
            );
            return res.redirect('back');
          }

          req.session.isLoggedIn = true;
          req.session.userRole = 'Student';
          req.session.user = user;
          req.session.cookie.expires = new Date(Date.now() + hour);
          res.redirect('/student');
        } else {
          req.flash('error', 'Incorrect password!');
          return res.redirect('back');
        }
      });
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};

const panelLoginAuth = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  Lecturer.findOne({
    where: {
      email: email,
    },
    raw: true,
  })
    .then((user) => {
      if (!user) {
        req.flash('error', 'User does not exists!');
        return res.redirect('back');
      }

      bcrypt.compare(password, user.password, (err, isMatched) => {
        if (isMatched) {
          req.session.isLoggedIn = true;
          req.session.userRole = 'Panel';
          req.session.user = user;
          req.session.cookie.expires = new Date(Date.now() + hour);
          res.redirect('/panel');
        } else {
          req.flash('error', 'Incorrect password!');
          return res.redirect('back');
        }
      });
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};

const coordinatorLoginAuth = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  Coordinator.findOne({
    where: {
      email: email,
    },
    raw: true,
  })
    .then((user) => {
      if (!user) {
        req.flash('error', 'User does not exists!');
        return res.redirect('back');
      }

      bcrypt.compare(password, user.password, (err, isMatched) => {
        if (isMatched) {
          if (!user.approved) {
            req.flash('warning', 'Account not yet approved by system admin!');
            return res.redirect('back');
          }

          req.session.isLoggedIn = true;
          req.session.userRole = 'Coordinator';
          req.session.user = user;
          req.session.cookie.expires = new Date(Date.now() + hour);
          res.redirect('/coordinator');
        } else {
          req.flash('error', 'Incorrect password!');
          return res.redirect('back');
        }
      });
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};

const getLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.render(path.join(__dirname, '..', 'views', 'auth', 'logout.ejs'), {
      title: 'Logout',
    });
  });
};

const resetPassword = (req, res, next) => {
  let email = req.body.email;
  let user = req.body.user;

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect('/forgot-password');
    }

    const token = buffer.toString('hex');

    if (user === 'Student') {
      Student.findOne({
        where: { email: email },
      })
        .then((student) => {
          if (!student) {
            req.flash('error', 'No match found!');
            return res.redirect('/forgot-password');
          }

          return student
            .update({
              resetToken: token,
              resetTokenExpiration: Date.now() + 1500000,
            })
            .then((result) => {
             
              const myURL =
                req.protocol +
                '://' +
                req.get('host') +
                `/reset-password/student/${token}`;

              return nodemailer.sendMail(
                student.email,
                'Password Reset',
                `You have requested a password reset, Please click the button to reset <br> <br>  <div class="btn btn--flat btn--large" style="Margin-bottom: 20px;text-align: center;">
                <![if !mso]><a style="border-radius: 4px;display: inline-block;font-size: 14px;font-weight: bold;line-height: 24px;padding: 12px 24px;text-align: center;text-decoration: none !important;transition: opacity 0.1s ease-in;color: #ffffff !important;background-color: #502682;font-family: sans-serif;" clicktracking="off" href="${myURL}">Reset Password</a><![endif]>
              <!--[if mso]><p style="line-height:0;margin:0;">&nbsp;</p><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="" style="width:137px" arcsize="9%" fillcolor="#502682" stroke="f"><v:textbox style="mso-fit-shape-to-text:t" inset="0px,11px,0px,11px"><center style="font-size:14px;line-height:24px;color:#FFFFFF;font-family:sans-serif;font-weight:bold;mso-line-height-rule:exactly;mso-text-raise:4px">Register Now</center></v:textbox></v:roundrect><![endif]--></div>
            </div>
            <br>
            <br>
            <strong>Please note the link will be valid for 25 mintues only!</strong>.`
              );
            })
            .then((result) => {
              req.flash(
                'success',
                `An email has been sent to ${student.email} !`
              );
              return res.redirect('back');
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
    } else if (user === 'Panel') {
      Lecturer.findOne({
        where: { email: email },
      })

        .then((lecturer) => {
          if (!lecturer) {
            req.flash('error', 'No match found!');
            return res.redirect('/forgot-password');
          }

          return lecturer
            .update({
              resetToken: token,
              resetTokenExpiration: Date.now() + 1500000,
            })
            .then((result) => {
             
              const myURL =
                req.protocol +
                '://' +
                req.get('host') +
                `/reset-password/panel/${token}`;
              return nodemailer.sendMail(
                lecturer.email,
                'Password Reset',
                `You have requested a password reset, Please click the button to reset <br> <br>  <div class="btn btn--flat btn--large" style="Margin-bottom: 20px;text-align: center;">
                <![if !mso]><a style="border-radius: 4px;display: inline-block;font-size: 14px;font-weight: bold;line-height: 24px;padding: 12px 24px;text-align: center;text-decoration: none !important;transition: opacity 0.1s ease-in;color: #ffffff !important;background-color: #502682;font-family: sans-serif;" clicktracking="off" href="${myURL}">Reset Password</a><![endif]>
              <!--[if mso]><p style="line-height:0;margin:0;">&nbsp;</p><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="" style="width:137px" arcsize="9%" fillcolor="#502682" stroke="f"><v:textbox style="mso-fit-shape-to-text:t" inset="0px,11px,0px,11px"><center style="font-size:14px;line-height:24px;color:#FFFFFF;font-family:sans-serif;font-weight:bold;mso-line-height-rule:exactly;mso-text-raise:4px">Register Now</center></v:textbox></v:roundrect><![endif]--></div>
            </div>
            <br>
            <br>
            <strong>Please note the link will be valid for 25 mintues only!</strong>.`
              );
            })
            .then((result) => {
              req.flash('success', 'An email has been sent to your email!');
              return res.redirect('back');
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
    } else if (user === 'Coordinator') {
      Coordinator.findOne({
        where: { email: email },
      })

        .then((coordinator) => {
          if (!coordinator) {
            req.flash('error', 'No match found!');
            return res.redirect('/forgot-password');
          }

          return coordinator
            .update({
              resetToken: token,
              resetTokenExpiration: Date.now() + 1500000,
            })
            .then((result) => {
            
              const myURL =
                req.protocol +
                '://' +
                req.get('host') +
                `/reset-password/coordinator/${token}`;
              return nodemailer.sendMail(
                coordinator.email,
                'Password Reset',
                `You have requested a password reset, Please click the button to reset <br> <br>  <div class="btn btn--flat btn--large" style="Margin-bottom: 20px;text-align: center;">
                <![if !mso]><a style="border-radius: 4px;display: inline-block;font-size: 14px;font-weight: bold;line-height: 24px;padding: 12px 24px;text-align: center;text-decoration: none !important;transition: opacity 0.1s ease-in;color: #ffffff !important;background-color: #502682;font-family: sans-serif;" clicktracking="off" href="${myURL}">Reset Password</a><![endif]>
              <!--[if mso]><p style="line-height:0;margin:0;">&nbsp;</p><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="" style="width:137px" arcsize="9%" fillcolor="#502682" stroke="f"><v:textbox style="mso-fit-shape-to-text:t" inset="0px,11px,0px,11px"><center style="font-size:14px;line-height:24px;color:#FFFFFF;font-family:sans-serif;font-weight:bold;mso-line-height-rule:exactly;mso-text-raise:4px">Register Now</center></v:textbox></v:roundrect><![endif]--></div>
            </div>
            <br>
            <br>
            <strong>Please note the link will be valid for 25 mintues only!</strong>.`
              );
            })
            .then((result) => {
              req.flash(
                'success',
                `An email has been sent to ${coordinator.email} !`
              );
              return res.redirect('back');
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
    } else {
      res.redirect('back');
    }
  });
};

module.exports = {
  getLogin,
  getRegister,
  getForgotPassowrd,
  studentLoginAuth,
  getSupervisorsList,
  getLogout,
  coordinatorLoginAuth,
  resetPassword,
  getResetPassowrd,
  postResetPassword,
  panelLoginAuth,
};
