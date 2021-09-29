const { DateTime } = require('luxon');
module.exports = (sequelize, Sequelize) => {
  const Slot = sequelize.define('slot', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV1,
      primaryKey: true,
    },
    dateFrom: {
      type: Sequelize.DATE,
      allowNull: false,
      get: function () {
        return DateTime.fromJSDate(this.getDataValue('dateFrom'), {
          zone: 'Asia/Kuala_Lumpur',
        }).toFormat('ccc ff');
      },
    },
    dateTo: {
      type: Sequelize.DATE,
      allowNull: false,
      get: function () {
        return DateTime.fromJSDate(this.getDataValue('dateTo'), {
          zone: 'Asia/Kuala_Lumpur',
        }).toFormat('hh:mm a');
      },
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    venue: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    panel1Approve: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    panel2Approve: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isDeclined: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    declinedBy: {
      type: Sequelize.STRING,
      references: {
        model: 'lecturers',
        key: 'id',
      },
    },
  });
  return Slot;
};
