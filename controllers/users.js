const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} = require('../utils/errors');
const { JWT_SECRET } = require('../utils/secretKey');

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Email и пароль не могут быть пустыми.');
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: '7d',
      });
      res.send({ token });
    })
    .catch(() => {
      throw new UnauthorizedError('Необходимо авторизоваться.');
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new Error('NotFound'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Ошибка при запросе.'));
      } else if (err.message === 'NotFound') {
        next(new NotFoundError('Пользователь по указанному _id не найден.'));
      } else {
        next(err);
      }
    });
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new Error('NotFound'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Ошибка при запросе.'));
      } else if (err.message === 'NotFound') {
        next(new NotFoundError('Пользователь по указанному _id не найден.'));
      } else {
        next(err);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  if (!email || !password) {
    next(new BadRequestError('Email или пароль не могут быть пустыми'));
  }

  User.findOne({ email })
    .then((usr) => {
      if (usr) {
        throw new ConflictError('Пользователь с таким email уже существует');
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
              next(
                new BadRequestError(
                  'Переданы некорректные данные при создании пользователя.',
                ),
              );
            } else if (error.name === 'MongoError' && error.code === 11000) {
              next(
                new ConflictError('Пользователь с таким email уже существует.'),
              );
            } else {
              next(error);
            }
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
    .then((user) => res.status(200).send(user))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(
          new BadRequestError(
            'Переданы некорректные данные при обновлении профиля.',
          ),
        );
      } else if (error.message === 'Error') {
        next(new NotFoundError('Пользователя нет в базе'));
      } else {
        next(error);
      }
    });
};
