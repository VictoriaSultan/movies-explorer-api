const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');
const { ERROR_WRONG_EMAIL_MESSAGE, ERROR_WRONG_EMAIL_OR_PASSWORD_MESSAGE, ERROR_USER_NOT_EXIST_MESSAGE } = require('../utils/constants');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => isEmail(v),
      message: ERROR_WRONG_EMAIL_MESSAGE,
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
}

userSchema.methods.toJSON = toJSON;

userSchema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error(ERROR_USER_NOT_EXIST_MESSAGE));
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(new Error(ERROR_WRONG_EMAIL_OR_PASSWORD_MESSAGE));
        }
        return user;
      });
    });
};

module.exports = mongoose.model('user', userSchema);
