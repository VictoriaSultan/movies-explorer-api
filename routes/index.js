const router = require('express').Router();
const usersRouter = require('./users');
const moviesRouter = require('./movies');
const { createUser, login } = require('../controllers/users');
const auth = require('../middlewares/auth');
const { NotFoundError } = require('../utils/errors');
const { validateSignIn, validateSignUp } = require('../middlewares/validators');

const { ERROR_NOT_FOUND_STATUS_MESSAGE } = require('../utils/constants');

router.post('/signup', validateSignUp, createUser);
router.post('/signin', validateSignIn, login);
router.all(auth);
router.use('/users', usersRouter);
router.use('/movies', moviesRouter);
router.all('/*', () => {
  throw new NotFoundError(ERROR_NOT_FOUND_STATUS_MESSAGE);
});

module.exports = router;
