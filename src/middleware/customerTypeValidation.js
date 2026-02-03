const { body, validationResult } = require('express-validator');

// Validation rules for creating customer type
const validateCreateCustomerType = [
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Type must be between 1 and 100 characters'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

// Validation rules for updating customer type
const validateUpdateCustomerType = [
  body('id')
    .notEmpty()
    .withMessage('Customer type ID is required')
    .isNumeric()
    .withMessage('Customer type ID must be a number'),
  body('type')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Type must be between 1 and 100 characters'),
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
  validateCreateCustomerType,
  validateUpdateCustomerType,
  handleValidationErrors
};
