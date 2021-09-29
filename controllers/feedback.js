const path = require('path');
const nodemailer = require(path.join(__dirname, '..', 'utils', 'nodemailer'));
const { Lecturer, Student, Slot, Feedback1, Feedback2 } = require(path.join(
  __dirname,
  '..',
  'utils',
  'db'
));

const getFeedback1 = async (req, res, next) => {
  const slotID = req.params.slotID;
  const panelID = req.params.panelID;
  try {
    const slot = await Slot.findOne({
      where: {
        id: slotID,
      },
      include: [
        {
          model: Student,
          include: [
            {
              model: Lecturer,
              as: 'supervisor',
              attributes: ['name'],
            },
          ],
          attributes: ['name', 'title', 'fyp'],
        },
      ],
    });

    const panel = await Lecturer.findAll({
      where: {
        id: panelID,
      },
    });

    return res.render(path.join(__dirname, '..', 'views', 'feedback1'), {
      title: 'Feedback',
      slot: slot,
      panel: panel,
      user: req.session.user,
      error: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const getFeedback2 = async (req, res, next) => {
  const slotID = req.params.slotID;
  const panelID = req.params.panelID;
  try {
    const slot = await Slot.findOne({
      where: {
        id: slotID,
      },
      include: [
        {
          model: Student,
          include: [
            {
              model: Lecturer,
              as: 'supervisor',
              attributes: ['name'],
            },
          ],
          attributes: ['name', 'title', 'fyp'],
        },
      ],
    });

    const panel = await Lecturer.findAll({
      where: {
        id: panelID,
      },
    });

    return res.render(path.join(__dirname, '..', 'views', 'feedback2'), {
      title: 'Feedback',
      slot: slot,
      panel: panel,
      user: req.session.user,
      error: req.flash('error'),
      success: req.flash('success'),
    });
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};
const Feedback1Post = async (req, res, next) => {
  const objectives = req.body.objectives;
  const problem_statement = req.body.problem_statement;
  const literature_review = req.body.literature_review;
  const methodology = req.body.methodology;
  const requirements = req.body.requirements;
  const analysis_design = req.body.analysis_design;
  const technical = req.body.technical;
  const stakeholder = req.body.stakeholder;
  const p_skills = req.body.p_skills;
  const overall = req.body.overall;
  const comments = req.body.comments;
  const slotID = req.body.slotID;
  const panelID = req.body.panelID;

  try {
    const slot = await Slot.findOne({
      where: {
        id: slotID,
      },
    });

    const student = await Student.findOne({
      where: {
        id: slot.studentId,
      },
      attributes: ['name', 'email', 'fyp'],
    });

    const lecturer = await Lecturer.findOne({
      where: {
        id: panelID,
      },
      attributes: ['name'],
    });

    await Feedback1.create({
      objectives: objectives,
      problem_statement: problem_statement,
      literature_review: literature_review,
      methodology_technique_approach: methodology,
      requirements: requirements,
      analysis_design: analysis_design,
      technical_implementation_mastery_of_tools: technical,
      stakeholder: stakeholder,
      presentation_skills: p_skills,
      overall: overall,
      comments: comments,
      panelID: panelID,
      slotId: slotID,
    });

    await nodemailer.sendMail(
      student.email,
      `New feedback`,
      ` Hello ${student.name}, you have a new feedback for Monitoring session FYP: ${student.fyp} from\n Dr. ${lecturer.name}`
    );

    req.flash('success', 'Feedback submitted');
    return res.redirect('/panel');
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const Feedback2Post = async (req, res, next) => {
  const stakeholder = req.body.stakeholder;
  const p_skills = req.body.p_skills;
  const overall = req.body.overall;
  const comments = req.body.comments;
  const slotID = req.body.slotID;
  const panelID = req.body.panelID;
  const fulfillment_of_objectives = req.body.fulfillment_of_objectives;
  const fulfillment_of_requirements_specifications =
    req.body.fulfillment_of_requirements_specifications;
  const design_and_technical_implementation =
    req.body.design_and_technical_implementation;
  const ui_ux = req.body.ui_ux;
  const error_free_and_error_handling = req.body.error_free_and_error_handling;
  const system_complexity = req.body.system_complexity;
  const testing_techniques = req.body.testing_techniques;
  
  
  try {
    const slot = await Slot.findOne({
      where: {
        id: slotID,
      },
    });

    const student = await Student.findOne({
      where: {
        id: slot.studentId,
      },
      attributes: ['name', 'email', 'fyp'],
    });

    const lecturer = await Lecturer.findOne({
      where: {
        id: panelID,
      },
      attributes: ['name'],
    });

    await Feedback2.create({
      fulfillment_of_objectives:  fulfillment_of_objectives,
      fulfillment_of_objectives: fulfillment_of_objectives,
      design_and_technical_implementation: design_and_technical_implementation,
      ui_ux: ui_ux,
      error_free_and_error_handling: error_free_and_error_handling,
      system_complexity: system_complexity,
      testing_techniques: testing_techniques,
      stakeholder: stakeholder,
      presentation_skills: p_skills,
      overall: overall,
      comments: comments,
      panelID: panelID,
      slotId: slotID,
    });

    await nodemailer.sendMail(
      student.email,
      `New feedback`,
      ` Hello ${student.name}, you have a new feedback for Monitoring session FYP: ${student.fyp} from\n Dr. ${lecturer.name}`
    );

    req.flash('success', 'Feedback submitted');
    return res.redirect('/panel');
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const getFeedback2View = async (req, res, next) => {
  const id = req.params.id;

  try {
    const feedback = await Feedback2.findOne({
      where: {
        id: id,
      },
    });

    const panel = await Lecturer.findOne({
      where: {
        id: feedback.panelID,
      },
    });
    return res.render(path.join(__dirname, '..', 'views', 'feedback2View'), {
      title: 'Feedback',
      user: req.session.user,
      panel: panel,
      feedback: feedback,
    });
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

const getFeedback1View = async (req, res, next) => {
  const id = req.params.id;

  try {
    const feedback = await Feedback1.findOne({
      where: {
        id: id,
      },
    });

    const panel = await Lecturer.findOne({
      where: {
        id: feedback.panelID,
      },
    });
    return res.render(path.join(__dirname, '..', 'views', 'feedback1View'), {
      title: 'Feedback',
      user: req.session.user,
      panel: panel,
      feedback: feedback,
    });
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};
module.exports = {
  getFeedback1,
  getFeedback2,
  Feedback1Post,
  Feedback2Post,
  getFeedback1View,
  getFeedback2View,
};
