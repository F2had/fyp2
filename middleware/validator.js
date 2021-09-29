const validator = (schema) => (req, res, next) => {
  const body = req.body;
  req.flash('body', body);
  schema
    .validate(body, { abortEarly: false })
    .then((result) => {
      next();
      //if no errors go to the desired route
    })
    .catch((err) => {
      err.errors.forEach((error) => {
        req.flash('error', error);
      });
      //In case of an error return the previous page with error message
      res.status(422).redirect('back');
    });
};

module.exports = validator;
