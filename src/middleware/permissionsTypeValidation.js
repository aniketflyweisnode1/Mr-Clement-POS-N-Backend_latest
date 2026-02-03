const { body, validationResult } = require('express-validator');

// Validation rules for creating permissions type
const validateCreatePermissionsType = [
  body('Permissions_Name')
    .notEmpty()
    .withMessage('Permissions name is required')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Permissions name must be between 1 and 100 characters'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

// Validation rules for updating permissions type
const validateUpdatePermissionsType = [
  body('id')
    .notEmpty()
    .withMessage('Permissions type ID is required')
    .isNumeric()
    .withMessage('Permissions type ID must be a number'),
  body('Permissions_Name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Permissions name must be between 1 and 100 characters'),
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
  validateCreatePermissionsType,
  validateUpdatePermissionsType,
  handleValidationErrors
};
