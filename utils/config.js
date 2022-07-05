const {
  NODE_ENV,
  MONGODB,
  PORT,
  JWT_SECRET,
} = process.env;

module.exports = {
  MONGODB: NODE_ENV === 'production' ? MONGODB : 'mongodb://localhost:27017/moviesdb',
  PORT: NODE_ENV === 'production' ? PORT : 3000,
  JWT_SECRET: NODE_ENV === 'production' ? JWT_SECRET : 'wakanda-forever',
};
