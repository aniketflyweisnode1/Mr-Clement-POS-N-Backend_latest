const { body, validationResult } = require('express-validator');

const validateCreateCity = [
  body('State_id')
    .notEmpty()
    .withMessage('State ID is required')
    .isNumeric()
    .withMessage('Invalid State ID'),
  body('City_name')
    .trim()
    .notEmpty()
    .withMessage('City name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('City name must be between 2 and 100 characters'),
  body('Code')
    .trim()
    .notEmpty()
    .withMessage('City code is required')
    .isLength({ min: 2, max: 10 })
    .withMessage('City code must be between 2 and 10 characters'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

const validateUpdateCity = [
  body('id')
    .notEmpty()
    .withMessage('City ID is required')
    .isNumeric()
    .withMessage('Invalid City ID'),
  body('State_id')
    .optional()
    .notEmpty()
    .withMessage('State ID cannot be empty')
    .isNumeric()
    .withMessage('Invalid State ID'),
  body('City_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('City name must be between 2 and 100 characters'),
  body('Code')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City code cannot be empty')
    .isLength({ min: 2, max: 10 })
    .withMessage('City code must be between 2 and 10 characters'),
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
  validateCreateCity,
  validateUpdateCity,
  handleValidationErrors
};
