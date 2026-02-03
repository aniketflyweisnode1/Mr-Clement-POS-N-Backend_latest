const { body, validationResult } = require('express-validator');

// Validation rules for creating item map addons
const validateCreateItemMapAddons = [
  body('item_Addons_id')
    .notEmpty()
    .withMessage('Item addons ID is required')
    .isNumeric()
    .withMessage('Item addons ID must be a number'),
  body('item_id')
    .notEmpty()
    .withMessage('Item ID is required')
    .isNumeric()
    .withMessage('Item ID must be a number'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

// Validation rules for updating item map addons
const validateUpdateItemMapAddons = [
  body('id')
    .notEmpty()
    .withMessage('Item map addons ID is required')
    .isNumeric()
    .withMessage('Item map addons ID must be a number'),
  body('item_Addons_id')
    .optional()
    .isNumeric()
    .withMessage('Item addons ID must be a number'),
  body('item_id')
    .optional()
    .isNumeric()
    .withMessage('Item ID must be a number'),
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
  validateCreateItemMapAddons,
  validateUpdateItemMapAddons,
  handleValidationErrors
};
