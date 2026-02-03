const { body, validationResult } = require('express-validator');

// Validation rules for creating token
const validateCreateToken = [
  body('Token_no')
    .notEmpty()
    .withMessage('Token number is required')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Token number must be between 1 and 50 characters'),
  body('TokenName')
    .notEmpty()
    .withMessage('Token name is required')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Token name must be between 1 and 100 characters'),
  body('Details')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Details must not exceed 500 characters'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

// Validation rules for updating token
const validateUpdateToken = [
  body('id')
    .notEmpty()
    .withMessage('Token ID is required')
    .isNumeric()
    .withMessage('Token ID must be a number'),
  body('Token_no')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Token number must be between 1 and 50 characters'),
  body('TokenName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Token name must be between 1 and 100 characters'),
  body('Details')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Details must not exceed 500 characters'),
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
  validateCreateToken,
  validateUpdateToken,
  handleValidationErrors
};
