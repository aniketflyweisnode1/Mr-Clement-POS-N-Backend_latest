const { body, validationResult } = require('express-validator');

// Validation rules for creating kitchen type
const validateCreateKitchenType = [
  body('Emozi')
    .notEmpty()
    .withMessage('Emozi is required')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Emozi must be between 1 and 255 characters'),
  body('Name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

// Validation rules for updating kitchen type
const validateUpdateKitchenType = [
  body('id')
    .notEmpty()
    .withMessage('Kitchen type ID is required')
    .isNumeric()
    .withMessage('Kitchen type ID must be a number'),
  body('Emozi')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Emozi must be between 1 and 255 characters'),
  body('Name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
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
  validateCreateKitchenType,
  validateUpdateKitchenType,
  handleValidationErrors
};
