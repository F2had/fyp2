const path = require('path');

const express = require('express');

const router = express.Router();

const { isLoggedIn } = require(path.join(
  __dirname,
  '..',
  'middleware',
  'is-auth'
));

router.get('/', isLoggedIn, (req, res, next) => {
  res.render(path.join(__dirname, '..', 'views', 'profile.ejs'), {
    title: 'profile',
    user: '',
    prevPage: '/',
  });
});

module.exports = router;
