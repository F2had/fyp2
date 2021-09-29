const path = require('path');
const { Coordinator } = require(path.join(__dirname, '..', 'utils', 'db'));

const isLoggedIn = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    req.flash('error', 'Unauthorized access');
    return res.status(401).redirect('/login');
  }
  next();
};

const isStudent = (req, res, next) => {
  if (req.session.userRole != 'Student') {
    req.flash('error', 'Unauthorized access');
    return res.status(401).redirect('/login');
  }
  next();
};

const isCoordinator = (req, res, next) => {
  if (req.session.userRole != 'Coordinator') {
    req.flash('error', 'Unauthorized access');
    return res.status(401).redirect('/login');
  }
  next();
};

const isPanel = (req, res, next) => {
  if (req.session.userRole != 'Panel') {
    req.flash('error', 'Unauthorized access');
    return res.status(401).redirect('/login');
  }
  next();
};

const isAdmin = async (req, res, next) => {
  try {
    let user = await Coordinator.findOne({
      where: {
        id: req.session.user.id,
      },
    });

    let isAdmin = user.isAdmin;
    if (!isAdmin) {
      req.flash('error', 'Unauthorized access');
      return res.status(401).redirect('/login');
    }

    next();
  } catch (err) {
    const error = new Error(err);
    next(error);
  }
};

module.exports = {
  isLoggedIn,
  isStudent,
  isAdmin,
  isCoordinator,
  isPanel,
};
