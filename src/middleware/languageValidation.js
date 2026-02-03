const { body, validationResult } = require('express-validator');

const validateCreateLanguage = [
  body('Language_name')
    .trim()
    .notEmpty()
    .withMessage('Language name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Language name must be between 2 and 50 characters'),
  body('Status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

const validateUpdateLanguage = [
  body('id')
    .notEmpty()
    .withMessage('Language ID is required')
    .isNumeric()
    .withMessage('Invalid Language ID'),
  body('Language_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Language name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Language name must be between 2 and 50 characters'),
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
  validateCreateLanguage,
  validateUpdateLanguage,
  handleValidationErrors
};
