const path = require('path');

//Handle page not found
exports.get404 = (req, res, next) => {
  res.status(404).render(path.join(__dirname, '..', 'views', 'error', '404'), {
    title: 'Page Not Found',
  });
};
