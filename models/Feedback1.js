module.exports = (sequelize, Sequelize) => {
  const Feedback1 = sequelize.define('feedback1', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    objectives: {
      type: Sequelize.STRING,
    },
    problem_statement: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    literature_review: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    methodology_technique_approach: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    requirements: {
      type: Sequelize.STRING,
    },
    analysis_design: {
      type: Sequelize.STRING,
    },
    technical_implementation_mastery_of_tools: {
      type: Sequelize.STRING,
    },
    stakeholder: {
      type: Sequelize.STRING,
    },
    presentation_skills: {
      type: Sequelize.STRING,
    },
    overall: {
      type: Sequelize.STRING,
    },
    comments: {
      type: Sequelize.TEXT,
    },
    panelID: {
      type: Sequelize.STRING,
      references: {
        model: 'lecturers',
        key: 'id',
      },
    },
  });

  return Feedback1;
};
