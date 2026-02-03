const { body, validationResult } = require('express-validator');

const validateCreateRole = [
  body('role_name')
    .trim()
    .notEmpty()
    .withMessage('Role name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
];

const validateUpdateRole = [
  body('id')
    .notEmpty()
    .withMessage('Role ID is required')
    .isNumeric()
    .withMessage('Invalid Role ID'),
  body('role_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Role name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

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
  validateCreateRole,
  validateUpdateRole,
  handleValidationErrors
};
