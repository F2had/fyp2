module.exports = (sequelize, Sequelize) => {
  const Student = sequelize.define('student', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
    },
    department: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    fyp: {
      type: Sequelize.STRING,
      validate: {
        isIn: [['1', '2']],
      },
    },
    meetingLink: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    driveLink: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    approved: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    resetToken: {
      type: Sequelize.STRING,
    },
    resetTokenExpiration: {
      type: Sequelize.DATE,
    },
  });
  return Student;
};
