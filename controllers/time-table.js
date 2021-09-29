const path = require('path');
const { Op } = require('sequelize');
const { DateTime } = require('luxon');

const { Student, Slot } = require(path.join(__dirname, '..', 'utils', 'db'));

const { timetableSchema } = require(path.join(
  __dirname,
  '..',
  'utils',
  'validationSchema'
));

const venues = ['Online', 'BK1', 'BK2', 'MM2', 'MM3', 'MM4', 'MM5', 'MM6'];
let timetable = [];

const generateTimeTable = async (req, res, next) => {
  try {
    let errors = await timetableSchema
      .validate(req.body, { abortEarly: false })
      .catch((err) => {
        return err.errors;
      });

    if (errors.length) {
      return res.send({ error: errors });
    }

    const dates = req.body.dates.split(',').map((date) => {
      return date.trim();
    });
    const startTime = req.body.startTimeTimeTable;
    const endTime = req.body.endTimeTimeTable;
    let duration = parseInt(req.body.duration);
    let venues = req.body.venues;
    let students = req.body.students;
    const type = req.body.type;
    const panel = req.body.panels;
    const [panel1, panel2] = panel.split('&');
    const panels = [];

    const randomize = req.body.random === 'on' ? true : false;
    let body = req.flash('body');
    if (body.length) {
      body = body[0];
    }
    let slots = [];
    let freeSlots = [];
    const timetable = [];

    //if we have a single value we will convert it to an array of one value
    if (!Array.isArray(venues)) venues = [venues];
    if (!Array.isArray(students)) students = [students];

    // Get students details
    students = await getStudentDetails(students);

    //Check if Online selected with another value
    if (venues.length > 1 && venues.includes('Online')) {
      // req.flash('error', `Can't select Online with a physical venue!`);
      return res.send({ error: `Can't select Online with a physical venue!` });
    }

    //Get all the slots time for the dates entered
    slots = await getAllSlots(dates, startTime, endTime, duration);

    //if the its online we don't need to check for venue availability
    if (venues.includes('Online')) {
      freeSlots = await getFreeSlots(slots, panel1, panel2);
    } else {
      freeSlots = await getFreeSlotsVenue(slots, panel1, panel2, venues);
    }

    /*
      After we get free slots it is possible to 
      get two or more free slots at the same time with but different places 
      exmaple: 
      {
       venue: 'MM2',
       dateFrom: '2021-04-20T03:00:00.000Z',
       dateTo: '2021-04-20T04:00:00.000Z'
      }
      {
      venue: 'MM3',
      dateFrom: '2021-04-20T03:00:00.000Z',
      dateTo: '2021-04-20T04:00:00.000Z'
     }
     So we need to filter them before preceding with assigning slots to students

      */
    freeSlots = freeSlots.filter(
      (slot, index, self) =>
        index === self.findIndex((s) => s.dateFrom === slot.dateFrom)
    );

    let result = await hasUpcomingSlot(students, type);
    freeStudents = result[0];
    hasUpcomingSlotStudents = result[1];

    if (freeStudents.length === 0) {
      return res.send({
        error: `All selected students already have scheduled ${type} session`,
      });
    }

    //Check if the number of slots is less than the number of students we won't generate the timetable
    if (freeSlots.length < freeStudents.length) {
      return res.send({
        error: `Number of avaliable slots is less than students`,
      });
    }
    //Assign slots to studenst
    for (let i = 0; i < freeStudents.length; i++) {
      if (randomize) {
        let random = [Math.floor(Math.random() * freeSlots.length)];
        let s = freeSlots[random];
        const slot = {
          dateFrom: s.dateFrom,
          dateTo: s.dateTo,
          dateFromFormatted: DateTime.fromISO(s.dateFrom, {
            zone: 'Asia/Kuala_Lumpur',
          }).toFormat('ccc ff'),
          dateToFormatted: DateTime.fromISO(s.dateTo, {
            zone: 'Asia/Kuala_Lumpur',
          }).toFormat('hh:mm a'),
          venue: s.venue,
          student: freeStudents[i],
          type: type,
        };
        timetable.push(slot);
        freeSlots.splice(random, 1);
      } else {
        const slot = {
          dateFrom: freeSlots[0].dateFrom,
          dateTo: freeSlots[0].dateTo,
          dateFromFormatted: DateTime.fromISO(freeSlots[0].dateFrom, {
            zone: 'Asia/Kuala_Lumpur',
          }).toFormat('ccc ff'),
          dateToFormatted: DateTime.fromISO(freeSlots[0].dateTo, {
            zone: 'Asia/Kuala_Lumpur',
          }).toFormat('hh:mm a'),
          venue: freeSlots[0].venue,
          student: freeStudents[i],
          type: type,
        };
        timetable.push(slot);
        freeSlots.splice(0, 1);
      }
    }

    req.session.timetable = timetable;

    return res.send({ timetable, hasUpcomingSlotStudents });
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

getAllSlots = (dates, startTime, endTime, duration) => {
  const slots = [];
  dates.forEach((date) => {
    let start = DateTime.fromISO(date + 'T' + startTime + ':00', {
      zone: 'Asia/Kuala_Lumpur',
    }).toUTC();
    let end = DateTime.fromISO(date + 'T' + endTime + ':00', {
      zone: 'Asia/Kuala_Lumpur',
    }).toUTC();

    while (start < end) {
      let slot = {
        venue: 'Online',
        dateFrom: start.toISO(),
        dateTo: start.plus({ minutes: duration }).toISO(),
      };
      slots.push(slot);
      start = start.plus({ minutes: duration });
    }
  });
  return slots;
};

const insertSlots = async (req, res, next) => {
  try {
    const timeTable = req.session.timetable;
    req.session.timetable = null;

    for (const slot of timeTable) {
      await Slot.create({
        dateFrom: slot.dateFrom,
        dateTo: slot.dateTo,
        type: slot.type,
        venue: slot.venue,
        studentId: slot.student.id,
        panel1Id: slot.student.panel1Id,
        panel2Id: slot.student.panel2Id,
      })
        .then((result) => {})
        .catch((err) => {
          const error = new Error(err);
          next(error);
        });
    }
    req.flash('success', 'Slots sent to panel successfully!');
    return res.redirect('/schedule');
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const getFreeSlotsVenue = async (slots, panel1, panel2, venues) => {
  let freeSlots = [];

  for (const slot of slots) {
    let start = DateTime.fromISO(slot.dateFrom).toUTC();
    let end = DateTime.fromISO(slot.dateTo).toUTC();

    for (const venue of venues) {
      await Slot.findAll({
        raw: true,
        where: {
          isDeclined: false,
          [Op.and]: [
            {
              [Op.or]: [
                {
                  panel1Id: {
                    [Op.or]: [panel1, panel2],
                  },
                },
                {
                  panel2Id: {
                    [Op.or]: [panel1, panel2],
                  },
                },
                {
                  venue: venue,
                },
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
      })
        .then((result) => {
          if (!result.length) {
            let slotVenue = {
              venue: venue,
              dateFrom: slot.dateFrom,
              dateTo: slot.dateTo,
            };
            freeSlots.push(slotVenue);
          }
        })
        .catch((err) => {
          console.log(err);
          res
            .status(500)
            .render(path.join(__dirname, '..', 'views', 'error', 'error.ejs'), {
              title: 'Error',
              user: req.session.user,
              error: err,
            });
        });
    }
  }

  return freeSlots;
};

const getFreeSlots = async (slots, panel1, panel2) => {
  const freeSlots = [];

  for (const slot of slots) {
    let start = DateTime.fromISO(slot.dateFrom).toUTC();
    let end = DateTime.fromISO(slot.dateTo).toUTC();

    await Slot.findAll({
      raw: true,
      where: {
        isDeclined: false,
        [Op.and]: [
          {
            [Op.or]: [
              {
                [Op.or]: [{ panel1Id: panel1 }, { panel2Id: panel1 }],
              },
              {
                [Op.or]: [{ panel1Id: panel2 }, { panel2Id: panel2 }],
              },
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
    })
      .then((result) => {
        if (!result.length) {
          freeSlots.push(slot);
        }
      })
      .catch((err) => {
        console.log(err);
        res
          .status(500)
          .render(path.join(__dirname, '..', 'views', 'error', 'error.ejs'), {
            title: 'Error',
            user: req.session.user,
            error: err,
          });
      });
  }

  return freeSlots;
};

const hasUpcomingSlot = async (students, type) => {
  const noUpcomingSlot = [];
  const upcomingSlot = [];
  let today = DateTime.fromJSDate(new Date(), {
    zone: 'Asia/Kuala_Lumpur',
  }).toUTC();
  for (const student of students) {
    await Slot.findAll({
      where: {
        [Op.and]: [
          { studentId: student.id },
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
      .then((result) => {
        if (!result.length) {
          noUpcomingSlot.push(student);
        } else {
          upcomingSlot.push(student);
        }
      })
      .catch((err) => {
        console.log(err);
        res
          .status(500)
          .render(path.join(__dirname, '..', 'views', 'error', 'error.ejs'), {
            title: 'Error',
            user: req.session.user,
            error: err,
          });
      });
  }
  return [noUpcomingSlot, upcomingSlot];
};

const getStudentDetails = async (students) => {
  let studentWithDetails = [];
  for (const student of students) {
    await Student.findOne({
      where: {
        id: student,
      },
      attributes: ['name', 'id', 'panel1Id', 'panel2Id'],
    })
      .then((student) => {
        studentWithDetails.push({
          name: student.name,
          id: student.id,
          panel1Id: student.panel1Id,
          panel2Id: student.panel2Id,
        });
      })
      .catch((err) => {
        console.log(err);
        res
          .status(500)
          .render(path.join(__dirname, '..', 'views', 'error', 'error.ejs'), {
            title: 'Error',
            user: req.session.user,
            error: err,
          });
      });
  }

  return studentWithDetails;
};

module.exports = {
  generateTimeTable,
  insertSlots,
};
