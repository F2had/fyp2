module.exports = (sequelize, Sequelize) => {
  const Feedback2 = sequelize.define('feedback2', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    fulfillment_of_objectives: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    fulfillment_of_requirements_specifications: {
      type: Sequelize.STRING,
    },
    design_and_technical_implementation: {
      type: Sequelize.STRING,
    },
    ui_ux: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    system_complexity: {
      type: Sequelize.STRING,
    },
    error_free_and_error_handling: {
      type: Sequelize.STRING,
    },
    testing_techniques: {
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

  return Feedback2;
};
