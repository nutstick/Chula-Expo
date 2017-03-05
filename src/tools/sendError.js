const extend = require('extend');
const errors = require('../error.json');

module.exports = (req, res, next) => {
  res.sendError = (code, additionMessage) => {
    const error = errors[code];
    res.status(error.status).send({
      success: false,
      errors: extend(true, {
        additionMessage
      }, error),
    });
  };
  next();
};
