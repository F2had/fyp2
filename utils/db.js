const path = require('path');
const Sequelize = require('sequelize');

const dbConfig = require(path.join(__dirname, '..', 'config', 'db.config'));

//DB configurations
const sequelize = new Sequelize(
  dbConfig.DB,

  dbConfig.USER,

  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: 0,
    logging: 0,
    //  logging: console.log,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//Creating Sequelize relations
db.Student = require(path.join(__dirname, '..', 'models', 'Student.js'))(
  sequelize,
  Sequelize
);
db.Lecturer = require(path.join(__dirname, '..', 'models', 'Lecturer.js'))(
  sequelize,
  Sequelize
);
db.Slot = require(path.join(__dirname, '..', 'models', 'Slot.js'))(
  sequelize,
  Sequelize
);
db.Coordinator = require(path.join(
  __dirname,
  '..',
  'models',
  'Coordinator.js'
))(sequelize, Sequelize);
db.Feedback1 = require(path.join(__dirname, '..', 'models', 'Feedback1.js'))(
  sequelize,
  Sequelize
);
db.Feedback2 = require(path.join(__dirname, '..', 'models', 'Feedback2.js'))(
  sequelize,
  Sequelize
);
db.Lecturer.hasMany(db.Student, { foreignKey: 'supervisorId' });
db.Student.belongsTo(db.Lecturer, { as: 'supervisor' });

db.Student.belongsTo(db.Lecturer, { as: 'panel1' });
db.Student.belongsTo(db.Lecturer, { as: 'panel2' });

db.Slot.belongsTo(db.Student);
db.Slot.belongsTo(db.Lecturer, { as: 'panel1' });
db.Slot.belongsTo(db.Lecturer, { as: 'panel2' });

db.Feedback1.belongsTo(db.Slot);
db.Feedback2.belongsTo(db.Slot);
module.exports = db;
