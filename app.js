const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const ejs = require('ejs');
const favicon = require('serve-favicon');
const flash = require('connect-flash');
const csrf = require('csurf');
require('dotenv').config();

const db = require(path.join(__dirname, 'utils', 'db'));
const { isLoggedIn, isCoordinator, isPanel } = require(path.join(
  __dirname,
  'middleware',
  'is-auth'
));
const adminRoute = require(path.join(__dirname, 'routes', 'admin'));
const studentRoute = require(path.join(__dirname, 'routes', 'student'));
const coordinatorRoute = require(path.join(__dirname, 'routes', 'coordinator'));
const panelRoute = require(path.join(__dirname, 'routes', 'panel'));
const authRoute = require(path.join(__dirname, 'routes', 'auth'));
const scheduleRoute = require(path.join(__dirname, 'routes', 'schedule'));
const uploadRoute = require(path.join(__dirname, 'routes', 'upload'));
const assignPanelRoute = require(path.join(
  __dirname,
  'routes',
  'assign-panel'
));
const profileRoute = require(path.join(__dirname, 'routes', 'profile'));
const feedbackRoute = require(path.join(__dirname, 'routes', 'feedback'));
const Store = require('connect-session-sequelize')(session.Store);
const csrfProtection = csrf({ cookie: true });

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(favicon(path.join(__dirname, 'public', 'imgs', 'logo.png')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser('keyboard cat'));
app.use(
  session({
    secret: process.env.SECRET,
    path: '/login',
    store: new Store({
      db: db.sequelize,
      checkExpirationInterval: 30 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
      expiration: 24 * 60 * 60 * 1000, // The maximum age (in milliseconds) of a valid session.
    }),
    cookie: { maxAge: 600000 },
    resave: false,
    saveUninitialized: false,
  })
);
app.use(csrfProtection);
app.use(flash());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const errorController = require(path.join(__dirname, 'controllers', 'error'));

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use(authRoute);
app.use('/admin', isLoggedIn, isCoordinator, adminRoute);
app.use('/student', isLoggedIn, studentRoute);
app.use('/coordinator', isLoggedIn, coordinatorRoute);
app.use('/panel', isLoggedIn, isPanel, panelRoute);
app.use('/upload', isCoordinator, uploadRoute);
app.use('/schedule', isLoggedIn, scheduleRoute);
app.use('/assign-panel', isCoordinator, assignPanelRoute);
app.use('/profile', isLoggedIn, profileRoute);
app.use('/feedback', isLoggedIn, feedbackRoute);

app.get('/', (req, res) => {
  res.render(path.join(__dirname, 'views', 'home.ejs'), {
    title: 'Home',
    isLoggedIn: req.session.isLoggedIn,
    role: req.session.userRole,
    error: req.flash('error'),
  });
});



app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render(path.join(__dirname, 'views', 'error', 'error.ejs'), {
    title: 'Error',
    error: error,
  });
});

//Create models tables if not already exist
db.sequelize.sync();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
