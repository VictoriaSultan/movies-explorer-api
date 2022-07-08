const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} = require('../utils/errors');
const {
  ERROR_CONFLICT_STATUS_MESSAGE,
  ERROR_WRONG_USER_DATA_CREATE_STATUS_MESSAGE,
  ERROR_WRONG_USER_DATA_UPDATE_STATUS_MESSAGE,
  ERROR_REQUEST_MESSAGE,
  ERROR_WRONG_EMAIL_OR_PASSWORD_MESSAGE,
  ERROR_USER_NOT_EXIST_MESSAGE,
} = require('../utils/constants');
const { JWT_SECRET } = require('../utils/config');

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: '7d',
      });
      res.send({ token });
    })
    .catch(() => {
      throw new UnauthorizedError(ERROR_WRONG_EMAIL_OR_PASSWORD_MESSAGE);
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new Error('NotFound'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError(ERROR_REQUEST_MESSAGE));
      }
      if (err.message === 'NotFound') {
        return next(new NotFoundError(ERROR_USER_NOT_EXIST_MESSAGE));
      }
      return next(err);
    });
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new Error('NotFound'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError(ERROR_REQUEST_MESSAGE));
      }
      if (err.message === 'NotFound') {
        return next(new NotFoundError(ERROR_USER_NOT_EXIST_MESSAGE));
      }
      return next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  User.findOne({ email })
    .then((usr) => {
      if (usr) {
        throw new ConflictError(ERROR_CONFLICT_STATUS_MESSAGE);
      } else {
        bcrypt
          .hash(password, 10)
          .then((hash) => User.create({
            name,
            email,
            password: hash,
          }))
          .then((user) => res.status(201).send(user.toJSON()))
          .catch((error) => {
            if (error.name === 'ValidationError') {
              return next(
                new BadRequestError(
                  ERROR_WRONG_USER_DATA_CREATE_STATUS_MESSAGE,
                ),
              );
            }
            if (error.name === 'MongoError' && error.code === 11000) {
              return next(
                new ConflictError(ERROR_CONFLICT_STATUS_MESSAGE),
              );
            }
            return next(error);
          });
      }
    })
    .catch(next);
};

module.exports.updateProfile = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true },
  )
    .orFail(new Error('Error'))
    .then((user) => res.send(user))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return next(
          new BadRequestError(
            ERROR_WRONG_USER_DATA_UPDATE_STATUS_MESSAGE,
          ),
        );
      }
      if (error.code === 11000) {
        throw new ConflictError(ERROR_CONFLICT_STATUS_MESSAGE);
      }
      if (error.message === 'Error') {
        return next(new NotFoundError(ERROR_USER_NOT_EXIST_MESSAGE));
      }
      return next(error);
    });
};
