const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require('../utils/errors');
const Movie = require('../models/movie');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  return Movie.create({ name, link, owner })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(
          new BadRequestError(
            'Переданы некорректные данные при создании карточки.',
          ),
        );
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const { movieId } = req.params;

  /* eslint-disable */
  Movie.findById(movieId)
    .orFail(new Error('Error'))
    .then((movie) => {
      if (req.user._id !== movie.owner.toString()) {
        return next(new ForbiddenError('Чужую карточку нельзя удалить.'));
      } else {
        return Movie.deleteOne(movie).then(() => { res.send({ message: `Карточка с id ${movie.id} успешно удалена!` }); });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Ошибка в запросе.'));
      } else if (err.message === 'Error') {
        next(new NotFoundError('Карточка с указанным _id не найдена.'));
      } else {
        next(err);
      }
    });
    /* eslint-enable */
};
