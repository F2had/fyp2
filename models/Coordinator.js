module.exports = (sequelize, Sequelize) => {
  const Coordinator = sequelize.define('coordinator', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
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
    approved: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    isAdmin: {
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
  return Coordinator;
};
