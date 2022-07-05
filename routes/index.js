const router = require('express').Router();
const usersRouter = require('./users');
const moviesRouter = require('./movies');
const { createUser, login } = require('../controllers/users');
const auth = require('../middlewares/auth');
const { NotFoundError } = require('../utils/errors');
const { validateSignIn, validateSignUp } = require('../middlewares/validators');

// Все роуты, кроме /signin и /signup, защищены авторизацией
router.all('/', auth);
router.post('/signup', validateSignUp, createUser);
router.post('/signin', validateSignIn, login);
router.use('/users', auth, usersRouter);
router.use('/movies', auth, moviesRouter);

router.all('/*', () => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});

module.exports = router;
