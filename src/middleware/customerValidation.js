const { body, validationResult } = require('express-validator');

// Validation rules for creating customer
const validateCreateCustomer = [
  body('phone')
    .notEmpty()
    .withMessage('Phone is required')
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone must be between 10 and 15 characters'),
  body('Name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('DOB')
    .notEmpty()
    .withMessage('Date of Birth is required')
    .isISO8601()
    .withMessage('DOB must be a valid date'),
  body('Customer_type_id')
    .optional()
    .isNumeric()
    .withMessage('Customer type ID must be a number'),
  body('Table_id')
    .optional()
    .isNumeric()
    .withMessage('Table ID must be a number'),
  body('Address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  body('Notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

// Validation rules for updating customer
const validateUpdateCustomer = [
  body('id')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isNumeric()
    .withMessage('Customer ID must be a number'),
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone must be between 10 and 15 characters'),
  body('Name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('DOB')
    .optional()
    .isISO8601()
    .withMessage('DOB must be a valid date'),
  body('Customer_type_id')
    .optional()
    .isNumeric()
    .withMessage('Customer type ID must be a number'),
  body('Table_id')
    .optional()
    .isNumeric()
    .withMessage('Table ID must be a number'),
  body('Address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  body('Notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
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
  validateCreateCustomer,
  validateUpdateCustomer,
  handleValidationErrors
};
