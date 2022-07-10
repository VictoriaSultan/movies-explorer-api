const { ERROR_INTERNAL_STATUS_MESSAGE } = require('../utils/constants');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? ERROR_INTERNAL_STATUS_MESSAGE : err.message;
  res.status(statusCode).send({ message });
  return next();
};

module.exports.errorHandler = errorHandler;
