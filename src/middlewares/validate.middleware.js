const AppError = require('../utils/AppError');

/**
 * Validates request data using a custom validator function.
 * @param {Function} validatorFn - Function receiving req that returns an array of error messages if invalid.
 */
const validate = (validatorFn) => {
  return (req, res, next) => {
    const errors = validatorFn(req);
    if (errors && errors.length > 0) {
      return next(new AppError(`Validation Error: ${errors.join('; ')}`, 400));
    }
    next();
  };
};

module.exports = validate;

