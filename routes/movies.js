const router = require('express').Router();
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');
const {
  validateCreateMovie,
  validateMovieId,
} = require('../middlewares/validators');

router.get('/', getMovies);
router.post('/', validateCreateMovie, createMovie);
router.delete('/:movieId', validateMovieId, deleteMovie);

module.exports = router;
