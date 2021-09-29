const path = require('path');

const { DateTime } = require('luxon');
const { Op, literal } = require('sequelize');
const nodemailer = require(path.join(__dirname, '..', 'utils', 'nodemailer'));

const { slotSchema } = require(path.join(
  __dirname,
  '..',
  'utils',
  'validationSchema'
));
const { Slot, Student, Lecturer } = require(path.join(
  __dirname,
  '..',
  'utils',
  'db'
));

const venues = ['Online', 'BK1', 'BK2', 'MM2', 'MM3', 'MM4', 'MM5', 'MM6'];
let timetable = [];

const getSchedulePage = async (req, res, next) => {
  let panels = [];
  try {
    let body = req.flash('body');
    let students = await Student.findAll({
      where: {
        department: req.session.user.department,
        panel1Id: {
          [Op.ne]: null,
        },
        panel2Id: {
          [Op.ne]: null,
        },

        approved: true,
      },
      order: ['name'],
    });

    if (body.length) {
      body = body[0];
      if (!Array.isArray(body.venues)) body.venues = [body.venues];
      if (!Array.isArray(body.students)) body.students = [body.students];
    }

    let getPanelsComb = await Student.findAll({
      where: {
        department: req.session.user.department,
      },
      attributes: [
        [literal('distinct `panel1Id`'), 'panel1'],
        [literal('`panel2Id`'), 'panel2'],
      ],
      include: [
        {
          model: Lecturer,
          as: 'panel1',
          attributes: ['name', 'id'],
          order: ['name'],
        },
        {
          model: Lecturer,
          as: 'panel2',
          attributes: ['name', 'id'],
          order: ['name'],
        },
      ],
      raw: true,
    });

    for (const i of getPanelsComb) {
      if (i.panel1 || i.panel2) {
        var panel = {
          panel1: {
            id: i.panel1,
            name: i['panel1.name'],
          },
          panel2: {
            id: i.panel2,
            name: i['panel2.name'],
          },
        };
        panels.push(panel);
      }
    }

   
    panels = panels.filter(
      (panel, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.panel1.id === panel.panel1.id && t.panel2.id === panel.panel2.id
        )
    );
    res.render(path.join(__dirname, '..', 'views', 'schedule.ejs'), {
      title: 'Schedule',
      students: students,
      panels: panels,
      timetable: timetable,
      user: req.session.user,
      venues: venues,
      body: body,
      busyStudents: '',
      error: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const addSlot = async (req, res, next) => {
  let errors = await slotSchema
    .validate(req.body, { abortEarly: false })
    .catch((err) => {
      return err.errors;
    });

  if (errors.length) {
    return res.send({ error: errors });
  }
  const slotDate = req.body.slotDate;
  const start = DateTime.fromISO(slotDate + 'T' + req.body.startTime + ':00', {
    zone: 'Asia/Kuala_Lumpur',
  }).toUTC();
  const end = DateTime.fromISO(slotDate + 'T' + req.body.endTime + ':00', {
    zone: 'Asia/Kuala_Lumpur',
  })
    .toUTC()
    .toISO();
  const type = req.body.type;
  const venue = req.body.venue;
  const stuID = req.body.student;
  const today = DateTime.fromJSDate(new Date(), { zone: 'Asia/Kuala_Lumpur' })
    .toUTC()
    .toISO();

  let isBeforeOrEqual = new Date(end) <= new Date(start);
  if (isBeforeOrEqual)
    return res.send({
      error: `End Date Can't be greater or equal than StartDate`,
    });
  if (venue === 'Online') {
    Slot.findOne({
      where: {
        [Op.and]: [
          { studentId: stuID },
          { type: type },
          {
            dateFrom: {
              [Op.gte]: today,
            },
          },
          { isDeclined: false },
        ],
      },
    })
      .then((slot) => {
        if (slot) {
          return res.send({
            error: `${type} already created for this student!`,
          });
        } else {
          Student.findOne({
            where: { id: stuID },
          })
            .then((student) => {
              return student;
            })
            .then((student) => {
              Slot.findAll({
                raw: true,
                where: {
                  [Op.and]: [
                    {
                      [Op.or]: [
                        { panel1Id: student.panel1Id },
                        { panel2Id: student.panel1Id },
                        { panel1Id: student.panel2Id },
                        { panel2Id: student.panel2Id },
                      ],
                    },
                    {
                      [Op.or]: [
                        {
                          [Op.and]: [
                            {
                              dateFrom: {
                                [Op.lte]: start.plus({ minutes: 1 }).toISO(),
                              },
                            },
                            {
                              dateTo: {
                                [Op.gte]: start.plus({ minutes: 1 }).toISO(),
                              },
                            },
                          ],
                        },
                        {
                          [Op.and]: [
                            {
                              dateFrom: {
                                [Op.lte]: end,
                              },
                            },
                            {
                              dateTo: {
                                [Op.gte]: end,
                              },
                            },
                          ],
                        },
                        {
                          [Op.and]: [
                            {
                              dateFrom: {
                                [Op.gte]: start.plus({ minutes: 1 }).toISO(),
                              },
                            },
                            {
                              dateTo: {
                                [Op.lte]: end,
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                include: [
                  {
                    model: Lecturer,
                    as: 'panel1',
                  },
                  {
                    model: Lecturer,
                    as: 'panel2',
                  },
                ],
              })
                .then((result) => {
                  if (result.length) {
                    let start = DateTime.fromJSDate(result[0].dateFrom, {
                      zone: 'Asia/Kuala_Lumpur',
                    }).toFormat('hh:mm ');

                    let end = DateTime.fromJSDate(result[0].dateTo, {
                      zone: 'Asia/Kuala_Lumpur',
                    }).toFormat('hh:mm a');

                    let panel1Name = result[0]['panel1.name'];
                    let panel2Name = result[0]['panel2.name'];
                    return res.send({
                      error: `<strong>Chosen date conflicting wiht</strong> <br> Panel: ${panel1Name} - ${panel2Name} <br> Time: ${start} - ${end}`,
                    });
                  } else {
                    Slot.create({
                      dateFrom: start,
                      dateTo: end,
                      type: type,
                      venue: venue,
                      studentId: student.id,
                      panel1Id: student.panel1Id,
                      panel2Id: student.panel2Id,
                    })
                      .then((result) => {
                        return res.send({ success: 'Slot added' });
                      })
                      .catch((err) => {
                        const error = new Error(err);
                        next(error);
                      });
                  }
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
        }
      })
      .catch((err) => {
        const error = new Error(err);
        next(error);
      });
    // if the session is not Online we need to check for venue availability
  } else {
    Slot.findOne({
      where: {
        [Op.and]: [
          { studentId: stuID },
          { type: type },
          {
            dateFrom: {
              [Op.gte]: today,
            },
          },
          { isDeclined: false },
        ],
      },
    })
      .then((slot) => {
        if (slot) {
          return res.send({
            error: `${type} already created for this student!`,
          });
        } else {
          Student.findOne({
            where: { id: stuID },
          })
            .then((student) => {
              return student;
            })
            .then((student) => {
              Slot.findAll({
                raw: true,
                where: {
                  isDeclined: false,
                  [Op.and]: [
                    { venue: venue },

                    {
                      [Op.or]: [
                        {
                          [Op.and]: [
                            {
                              dateFrom: {
                                [Op.lte]: start.plus({ minutes: 1 }).toISO(),
                              },
                            },
                            {
                              dateTo: {
                                [Op.gte]: start.plus({ minutes: 1 }).toISO(),
                              },
                            },
                          ],
                        },
                        {
                          [Op.and]: [
                            {
                              dateFrom: {
                                [Op.lte]: end,
                              },
                            },
                            {
                              dateTo: {
                                [Op.gte]: end,
                              },
                            },
                          ],
                        },
                        {
                          [Op.and]: [
                            {
                              dateFrom: {
                                [Op.gte]: start.plus({ minutes: 1 }).toISO(),
                              },
                            },
                            {
                              dateTo: {
                                [Op.lte]: end,
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                include: [
                  {
                    model: Lecturer,
                    as: 'panel1',
                  },
                  {
                    model: Lecturer,
                    as: 'panel2',
                  },
                ],
              })
                .then((result) => {
                  if (result.length) {
                    let start = DateTime.fromJSDate(result[0].dateFrom, {
                      zone: 'Asia/Kuala_Lumpur',
                    }).toFormat('hh:mm a');

                    let end = DateTime.fromJSDate(result[0].dateTo, {
                      zone: 'Asia/Kuala_Lumpur',
                    }).toFormat('hh:mm a');

                    let panel1Name = result[0]['panel1.name'];
                    let panel2Name = result[0]['panel2.name'];
                    return res.send({
                      error: `Venued already booked at chosen time! <br> Details: Panel: ${panel1Name} - ${panel2Name} <br> Time: ${start} - ${end}`,
                    });
                  } else {
                    Slot.findAll({
                      raw: true,
                      where: {
                        isDeclined: false,
                        [Op.and]: [
                          {
                            [Op.or]: [
                              { panel1Id: student.panel1Id },
                              { panel2Id: student.panel1Id },
                              { panel1Id: student.panel2Id },
                              { panel2Id: student.panel2Id },
                            ],
                          },
                          {
                            [Op.or]: [
                              {
                                [Op.and]: [
                                  {
                                    dateFrom: {
                                      [Op.lte]: start
                                        .plus({ minutes: 1 })
                                        .toISO(),
                                    },
                                  },
                                  {
                                    dateTo: {
                                      [Op.gte]: start
                                        .plus({ minutes: 1 })
                                        .toISO(),
                                    },
                                  },
                                ],
                              },
                              {
                                [Op.and]: [
                                  {
                                    dateFrom: {
                                      [Op.lte]: end,
                                    },
                                  },
                                  {
                                    dateTo: {
                                      [Op.gte]: end,
                                    },
                                  },
                                ],
                              },
                              {
                                [Op.and]: [
                                  {
                                    dateFrom: {
                                      [Op.gte]: start
                                        .plus({ minutes: 1 })
                                        .toISO(),
                                    },
                                  },
                                  {
                                    dateTo: {
                                      [Op.lte]: end,
                                    },
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      include: [
                        {
                          model: Lecturer,
                          as: 'panel1',
                        },
                        {
                          model: Lecturer,
                          as: 'panel2',
                        },
                      ],
                    })
                      .then((result) => {
                        if (result.length) {
                          let start = DateTime.fromJSDate(result[0].dateFrom, {
                            zone: 'Asia/Kuala_Lumpur',
                          }).toFormat('hh:mm a');

                          let end = DateTime.fromJSDate(result[0].dateTo, {
                            zone: 'Asia/Kuala_Lumpur',
                          }).toFormat('hh:mm a');

                          let panel1Name = result[0]['panel1.name'];
                          let panel2Name = result[0]['panel2.name'];

                          return res.send({
                            error: `<strong>Chosen date conflicting wiht</strong> <br> Panel: ${panel1Name} - ${panel2Name} <br> Time: ${start} - ${end}`,
                          });
                        } else {
                          return Slot.create({
                            dateFrom: start,
                            dateTo: end,
                            type: type,
                            venue: venue,
                            studentId: student.id,
                            panel1Id: student.panel1Id,
                            panel2Id: student.panel2Id,
                          })
                            .then((result) => {
                              return res.send({ success: 'Slot added' });
                            })
                            .catch((err) => {
                              const error = new Error(err);
                              next(error);
                            });
                        }
                      })
                      .catch((err) => {
                        const error = new Error(err);
                        next(error);
                      });
                  }
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
        }
      })
      .catch((err) => {
        const error = new Error(err);
        next(error);
      });
  }
};

const approveSlot = (req, res, next) => {
  const panel = req.body.panel;
  const slotID = req.body.slotID;

  Slot.findOne({
    where: {
      id: slotID,
    },
    include: [{ model: Student, required: true }],
  })
    .then((slot) => {
      if (panel === 'panel1') {
        slot.update({
          panel1Approve: true,
        });
      } else if (panel === 'panel2') {
        slot.update({
          panel2Approve: true,
        });
      } else {
        return res.send({ error: 'Panel is needed' });
      }
      return slot.save();
    })
    .then((slotInfo) => {
      if (slotInfo.panel2Approve && slotInfo.panel1Approve) {
        const URL = req.protocol + '://' + req.get('host') + `/login`;
        nodemailer.sendMail(
          slotInfo.student.email,
          'New Meeting',
          `You have a new meeting please log in in the system to view  <br>  <div class="btn btn--flat btn--large" style="Margin-bottom: 20px;text-align: center;">
          <![if !mso]><a style="border-radius: 4px;display: inline-block;font-size: 14px;font-weight: bold;line-height: 24px;padding: 12px 24px;text-align: center;text-decoration: none !important;transition: opacity 0.1s ease-in;color: #ffffff !important;background-color: #502682;font-family: sans-serif;" href="${URL}"><i class="fas fa-sign-in-alt"></i>Login</a><![endif]>
        <!--[if mso]><p style="line-height:0;margin:0;">&nbsp;</p><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${URL}" style="width:137px" arcsize="9%" fillcolor="#502682" stroke="f"><v:textbox style="mso-fit-shape-to-text:t" inset="0px,11px,0px,11px"><center style="font-size:14px;line-height:24px;color:#FFFFFF;font-family:sans-serif;font-weight:bold;mso-line-height-rule:exactly;mso-text-raise:4px">Register Now</center></v:textbox></v:roundrect><![endif]--></div>
      </div>`
        );
      }
      return res.send({ success: `Slot approved!` });
    })

    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};

const getUdateSlot = async (req, res, next) => {
  const slotID = req.params.slotID;

  const venues = ['Online', 'BK1', 'BK2', 'MM2', 'MM3', 'MM4', 'MM5', 'MM6'];

  try {
    const slot = await Slot.findOne({
      where: {
        id: slotID,
      },
    });

    return res.render(path.join(__dirname, '..', 'views', 'update-slot.ejs'), {
      title: 'Update Slot',
      user: req.session.user,
      venues: venues,
      slot: slot,
      error: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const updateSlot = async (req, res, next) => {
  const slotDate = req.body.slotDate;
  const start = DateTime.fromISO(slotDate + 'T' + req.body.startTime + ':00', {
    zone: 'Asia/Kuala_Lumpur',
  }).toUTC();
  const end = DateTime.fromISO(slotDate + 'T' + req.body.endTime + ':00', {
    zone: 'Asia/Kuala_Lumpur',
  })
    .toUTC()
    .toISO();
  const venue = req.body.venue;
  const slotID = req.body.slotID;

  try {
    const currentSlot = await Slot.findOne({
      where: {
        id: slotID,
      },
    });
    if (venue === 'Online') {
      const slot = await Slot.findAll({
        raw: true,
        where: {
          [Op.or]: [
            { panel1Id: currentSlot.panel1Id },
            { panel2Id: currentSlot.panel2Id },
          ],
          [Op.or]: [
            {
              [Op.and]: [
                {
                  dateFrom: {
                    [Op.lte]: start.plus({ minutes: 1 }).toISO(),
                  },
                },
                {
                  dateTo: {
                    [Op.gte]: start.plus({ minutes: 1 }).toISO(),
                  },
                },
              ],
            },
            {
              [Op.and]: [
                {
                  dateFrom: {
                    [Op.lte]: end,
                  },
                },
                {
                  dateTo: {
                    [Op.gte]: end,
                  },
                },
              ],
            },
            {
              [Op.and]: [
                {
                  dateFrom: {
                    [Op.gte]: start.plus({ minutes: 1 }).toISO(),
                  },
                },
                {
                  dateTo: {
                    [Op.lte]: end,
                  },
                },
              ],
            },
          ],
        },
      });

      if (slot.length) {
        req.flash('error', 'Panel conflict');
        return res.redirect('back');
      } else {
        currentSlot.update({
          dateFrom: start,
          dateTo: end,
          venue: venue,
        });

        currentSlot.save();
        req.flash('success', 'Slot Update!');
        return res.redirect('back');
      }
    } else {
      const slot = await Slot.findAll({
        raw: true,
        where: {
          [Op.or]: [
            { panel1Id: currentSlot.panel1Id },
            { panel2Id: currentSlot.panel2Id },
          ],
          [Op.or]: [
            {
              [Op.and]: [
                {
                  dateFrom: {
                    [Op.lte]: start.plus({ minutes: 1 }).toISO(),
                  },
                },
                {
                  dateTo: {
                    [Op.gte]: start.plus({ minutes: 1 }).toISO(),
                  },
                },
              ],
            },
            {
              [Op.and]: [
                {
                  dateFrom: {
                    [Op.lte]: end,
                  },
                },
                {
                  dateTo: {
                    [Op.gte]: end,
                  },
                },
              ],
            },
            {
              [Op.and]: [
                {
                  dateFrom: {
                    [Op.gte]: start.plus({ minutes: 1 }).toISO(),
                  },
                },
                {
                  dateTo: {
                    [Op.lte]: end,
                  },
                },
              ],
            },
          ],
        },
      });

      if (slot.length) {
        req.flash('error', 'Panel or venue conflict.');
        return res.redirect('back');
      } else {
        currentSlot.update({
          dateFrom: start,
          dateTo: end,
          venue: venue,
        });

        currentSlot.save();
        req.flash('success', 'Slot Update!');
        return res.redirect('back');
      }
    }
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const declineSlot = async (req, res, next) => {
  const slotID = req.body.slotID;
  const panelID = req.body.panelID;
  try {
    const slot = await Slot.findOne({
      where: {
        id: slotID,
      },
    });

    slot.isDeclined = true;
    slot.declinedBy = panelID;

    await slot.save();

    req.flash('success', 'Slot declined successfully!');
    return res.redirect('back');
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const deleteSlot = async (req, res, next) => {
  const slotID = req.body.id;
  try {
    const slot = await Slot.findOne({
      where: {
        id: slotID,
      },
    });

    await slot.destroy();

    req.flash('success', 'Slot Deleted!');
    return res.redirect('back');
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};
module.exports = {
  getSchedulePage,
  addSlot,
  approveSlot,
  declineSlot,
  deleteSlot,
  getUdateSlot,
  updateSlot,
};
