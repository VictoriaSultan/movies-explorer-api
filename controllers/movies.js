const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require('../utils/errors');
const Movie = require('../models/movie');

const {
  ERROR_MOVIE_NOT_FOUND_STATUS_MESSAGE,
  ERROR_REQUEST_MESSAGE,
  ERROR_WRONG_MOVIES_DATA_CREATE_STATUS_MESSAGE,
  ERROR_ACCESS_DENIED_MOVIE_REMOVE_MESSAGE,
  ERROR_MOVIE_REMOVE_SUCCESS_MESSAGE,
} = require('../utils/constants');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const owner = req.user._id;
  return Movie.create({ ...req.body, owner })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new BadRequestError(
            ERROR_WRONG_MOVIES_DATA_CREATE_STATUS_MESSAGE,
          ),
        );
      }
      return next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  Movie.findById(movieId)
    .orFail(() => new NotFoundError(ERROR_MOVIE_NOT_FOUND_STATUS_MESSAGE))
    .then((movie) => {
      if (!movie.owner.equals(req.user._id)) {
        return next(new ForbiddenError(ERROR_ACCESS_DENIED_MOVIE_REMOVE_MESSAGE));
      }
      return movie.remove()
        .then(() => res.send({ message: ERROR_MOVIE_REMOVE_SUCCESS_MESSAGE, movie }));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError(ERROR_REQUEST_MESSAGE));
      }
      return next(err);
    });
};
