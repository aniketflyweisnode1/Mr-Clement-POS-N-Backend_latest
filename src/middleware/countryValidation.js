const { body, validationResult } = require('express-validator');

const validateCreateCountry = [
  body('Country_name')
    .trim()
    .notEmpty()
    .withMessage('Country name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Country name must be between 2 and 100 characters'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Country code is required')
    .isLength({ min: 2, max: 10 })
    .withMessage('Country code must be between 2 and 10 characters'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

const validateUpdateCountry = [
  body('id')
    .notEmpty()
    .withMessage('Country ID is required')
    .isNumeric()
    .withMessage('Invalid Country ID'),
  body('Country_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Country name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Country name must be between 2 and 100 characters'),
  body('code')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Country code cannot be empty')
    .isLength({ min: 2, max: 10 })
    .withMessage('Country code must be between 2 and 10 characters'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validateCreateCountry,
  validateUpdateCountry,
  handleValidationErrors
};
