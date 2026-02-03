const { body, validationResult } = require('express-validator');

// Validation rules for creating item variants
const validateCreateItemVariants = [
  body('Variants')
    .notEmpty()
    .withMessage('Variants is required')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Variants must be between 1 and 255 characters'),
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

// Validation rules for updating item variants
const validateUpdateItemVariants = [
  body('id')
    .notEmpty()
    .withMessage('Item variant ID is required')
    .isNumeric()
    .withMessage('Item variant ID must be a number'),
  body('Variants')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Variants must be between 1 and 255 characters'),
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
  validateCreateItemVariants,
  validateUpdateItemVariants,
  handleValidationErrors
};
