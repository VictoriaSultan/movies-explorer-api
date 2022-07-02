const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = {
  JWT_SECRET: NODE_ENV === 'production' ? JWT_SECRET : 'wakanda-forever',
};
