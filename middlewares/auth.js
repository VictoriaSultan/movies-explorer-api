const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');
const { JWT_SECRET } = require('../utils/config');
const { ERROR_UNAUTHORIZED_STATUS_MESSAGE, ERROR_JWT_UNAUTHORIZED_STATUS_MESSAGE } = require('../utils/constants');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    next(new UnauthorizedError(ERROR_UNAUTHORIZED_STATUS_MESSAGE));
  } else {
    const token = authorization.replace('Bearer ', '');
    let payload;

    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      next(new UnauthorizedError(ERROR_JWT_UNAUTHORIZED_STATUS_MESSAGE));
    }
    req.user = payload;
    next();
  }
};
