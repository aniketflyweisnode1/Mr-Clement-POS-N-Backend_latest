const { body, validationResult } = require('express-validator');

// Validation rules for creating item addons
const validateCreateItemAddons = [
  body('Addons')
    .notEmpty()
    .withMessage('Addons is required')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Addons must be between 1 and 255 characters'),
  body('prices')
    .notEmpty()
    .withMessage('Prices is required')
    .isNumeric()
    .withMessage('Prices must be a number')
    .isFloat({ min: 0 })
    .withMessage('Prices must be a non-negative number'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

// Validation rules for updating item addons
const validateUpdateItemAddons = [
  body('id')
    .notEmpty()
    .withMessage('Item addon ID is required')
    .isNumeric()
    .withMessage('Item addon ID must be a number'),
  body('Addons')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Addons must be between 1 and 255 characters'),
  body('prices')
    .optional()
    .isNumeric()
    .withMessage('Prices must be a number')
    .isFloat({ min: 0 })
    .withMessage('Prices must be a non-negative number'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

// Handle validation errors
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
  validateCreateItemAddons,
  validateUpdateItemAddons,
  handleValidationErrors
};
