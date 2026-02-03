const { body, validationResult } = require('express-validator');

// Validation rules for creating permissions type map with employee
const validateCreatePermissionsTypeMapWithEmployee = [
  body('Permissions_type_id')
    .notEmpty()
    .withMessage('Permissions type ID is required')
    .isNumeric()
    .withMessage('Permissions type ID must be a number'),
  body('user_id')
    .notEmpty()
    .withMessage('User ID is required')
    .isNumeric()
    .withMessage('User ID must be a number'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

// Validation rules for updating permissions type map with employee
const validateUpdatePermissionsTypeMapWithEmployee = [
  body('id')
    .notEmpty()
    .withMessage('Permissions type map with employee ID is required')
    .isNumeric()
    .withMessage('Permissions type map with employee ID must be a number'),
  body('Permissions_type_id')
    .optional()
    .isNumeric()
    .withMessage('Permissions type ID must be a number'),
  body('user_id')
    .optional()
    .isNumeric()
    .withMessage('User ID must be a number'),
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
  validateCreatePermissionsTypeMapWithEmployee,
  validateUpdatePermissionsTypeMapWithEmployee,
  handleValidationErrors
};
