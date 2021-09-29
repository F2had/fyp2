module.exports = (sequelize, Sequelize) => {
  const Lecturer = sequelize.define('lecturer', {
    id: {
      type: Sequelize.STRING,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    department: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    resetToken: {
      type: Sequelize.STRING,
    },
    resetTokenExpiration: {
      type: Sequelize.DATE,
    },
  });
  return Lecturer;
};
