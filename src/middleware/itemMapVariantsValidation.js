const { body, validationResult } = require('express-validator');

// Validation rules for creating item map variants
const validateCreateItemMapVariants = [
  body('item_Variants_id')
    .notEmpty()
    .withMessage('Item variants ID is required')
    .isNumeric()
    .withMessage('Item variants ID must be a number'),
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

// Validation rules for updating item map variants
const validateUpdateItemMapVariants = [
  body('id')
    .notEmpty()
    .withMessage('Item map variants ID is required')
    .isNumeric()
    .withMessage('Item map variants ID must be a number'),
  body('item_Variants_id')
    .optional()
    .isNumeric()
    .withMessage('Item variants ID must be a number'),
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
  validateCreateItemMapVariants,
  validateUpdateItemMapVariants,
  handleValidationErrors
};
