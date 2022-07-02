const { BadRequestError } = require('./BadRequestError');
const { UnauthorizedError } = require('./UnauthorizedError');
const { ForbiddenError } = require('./ForbiddenError');
const { NotFoundError } = require('./NotFoundError');
const { ConflictError } = require('./ConflictError');

module.exports.BadRequestError = BadRequestError;
module.exports.UnauthorizedError = UnauthorizedError;
module.exports.ForbiddenError = ForbiddenError;
module.exports.NotFoundError = NotFoundError;
module.exports.ConflictError = ConflictError;
