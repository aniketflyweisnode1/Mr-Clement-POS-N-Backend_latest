const { body, validationResult } = require('express-validator');

const validateCreateState = [
  body('Country_id')
    .notEmpty()
    .withMessage('Country ID is required')
    .isNumeric()
    .withMessage('Invalid Country ID'),
  body('state_name')
    .trim()
    .notEmpty()
    .withMessage('State name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('State name must be between 2 and 100 characters'),
  body('Code')
    .trim()
    .notEmpty()
    .withMessage('State code is required')
    .isLength({ min: 2, max: 10 })
    .withMessage('State code must be between 2 and 10 characters'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

const validateUpdateState = [
  body('id')
    .notEmpty()
    .withMessage('State ID is required')
    .isNumeric()
    .withMessage('Invalid State ID'),
  body('Country_id')
    .optional()
    .notEmpty()
    .withMessage('Country ID cannot be empty')
    .isNumeric()
    .withMessage('Invalid Country ID'),
  body('state_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('State name must be between 2 and 100 characters'),
  body('Code')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State code cannot be empty')
    .isLength({ min: 2, max: 10 })
    .withMessage('State code must be between 2 and 10 characters'),
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
  validateCreateState,
  validateUpdateState,
  handleValidationErrors
};
