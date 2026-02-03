const { body, validationResult } = require('express-validator');

// Validation rules for creating delivery type
const validateCreateDeliveryType = [
  body('Type_name')
    .notEmpty()
    .withMessage('Type name is required')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Type name must be between 1 and 100 characters'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

// Validation rules for updating delivery type
const validateUpdateDeliveryType = [
  body('id')
    .notEmpty()
    .withMessage('Delivery type ID is required')
    .isNumeric()
    .withMessage('Delivery type ID must be a number'),
  body('Type_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Type name must be between 1 and 100 characters'),
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
  validateCreateDeliveryType,
  validateUpdateDeliveryType,
  handleValidationErrors
};
